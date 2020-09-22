const ncname = '[A-z_][\\w\\-\\.]*'
const singleAttrIdentifier = /([^\s"'<>/=]+)/
const singleAttrAssign = /(?:=)/
const singleAttrValues = [
    /"([^"]*)"+/.source,
    /'([^']*)'+/.source,
    /([^\s"'=<>'])/.source
]

const attribute = new RegExp(
    '^\\s*' + singleAttrIdentifier.source +
    '(?:\\s*(' + singleAttrAssign.source + ')' +
    '\\s*(?:' + singleAttrValues.join('|') + '))?'
)

const qunameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
const startTagOpen = new RegExp('^<' + qunameCapture)
const startTagClose = /^\s*(\/?)>/

const endTag = new RegExp('^<\\/' + qunameCapture + '[^>]*>')

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/

// stack栈保存解析好的标签头，根据在解析尾部标签的时候得到所属的层级关系和父标签
// currentParent用于存放当前标签的父标签节点的引用，root变量指向根标签节点
const stack = []
let currentParent, root

let index

function advance (n) {
    index += n
    html = html.substring(n)
}

function parseHTML () {
    while (html) {
        const textEnd = html.indexOf('<')

        // 起始标签
        if (textEnd === 0) {
            // 结束标签
            const endTagMath = html.match(endTag)
            if (html.match(endTag)) {
                advance(endTagMath[0].length)
                parseEndTag(endTagMath[1])
                continue
            }
            // 开始标签
            if (html.match(startTagOpen)) {
                const startTagMatch = parseStartTag()
                const element = {
                    type: 1,
                    tag: startTagMatch.tagName,
                    lowerCasedTag: startTagMatch.tagName.toLowerCase(),
                    attrsList: startTagMatch.attrs,
                    attrsMap: makeAttrsMap(startTagMatch.attrs),
                    parent: currentParent,
                    children: []
                }

                processIf(element)
                processFor(element)

                if (!root) {
                    root = element
                }

                if (currentParent) {
                    currentParent.children.push(element)
                }
                stack.push(element)
                currentParent = element
                continue
            }
        } else {
            // 文本
            const text = html.substring(0, textEnd)
            advance(textEnd)
            let expression
            // eslint-disable-next-line no-cond-assign
            if (expression = parseText(text)) {
                // 表达式节点
                currentParent.children.push({
                    type: 2,
                    text,
                    expression
                })
            } else {
                // 普通文本节点
                currentParent.children.push({
                    type: 3,
                    text: text.replace(/\n/g, '\\n')
                })
            }
            continue
        }
    }
    console.log(root)
    return root
}

// 解析起始标签
function parseStartTag () {
    // 标签头部
    const start = html.match(startTagOpen)
    if (start) {
        const match = {
            tagName: start[1],
            attrs: [],
            start: index
        }
        advance(start[0].length)

        let end, attr
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // 解析标签结束以及标签内的属性
            advance(attr[0].length)
            match.attrs.push({
                name: attr[1],
                value: attr[3]
            })
        }

        if (end) {
            match.unarySlash = end[1]
            advance(end[0].length)
            match.end = index
            return match
        }
    }
}

// 解析尾部标签
// 找到stack栈中最近的与自己标签名一致的那个元素，将currentParent指向那个元素，并将该元素之前的元素都从stack中出栈
function parseEndTag (tagName) {
    let pos
    for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === tagName.toLowerCase()) {
            break
        }
    }

    if (pos >= 0) {
        if (pos > 0) {
            currentParent = stack[pos - 1]
        } else {
            currentParent = root
        }
        stack.length = pos
    }
}

// 解析文本标签
function parseText (text) {
    if (!defaultTagRE.test(text)) {
        return
    }

    const tokens = [] // 存放解析结果
    let lastIndex = defaultTagRE.lastIndex = 0
    let match, index
    while ((match = defaultTagRE.exec(text))) {
        index = match.index
        if (index > lastIndex) {
            // 普通文本
            tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }

        // 表达式{{}}
        const exp = match[1].trim()
        tokens.push(`_s(${exp})`)
        lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
    }

    return tokens.join('+')
}

// 用于从el的attrsMap或attrsList属性中取出name对应的值
function getAndRemoveAttr (el, name) {
    let val
    if ((val = el.attrsMap[name]) != null) {
        const list = el.attrsList
        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i].name === name) {
                list.splice(i, 1)
                break
            }
        }
    }

    return val
}

// 将v-for指令解析成for属性和alias属性
function processFor (el) {
    let exp
    // eslint-disable-next-line no-cond-assign
    if (exp = getAndRemoveAttr(el, 'v-for')) {
        const inMatch = exp.match(forAliasRE)
        el.for = inMatch[2].trim()
        el.alias = inMatch[1].trim()
    }
}

// 将条件存入ifConditions数组中
function processIf (el) {
    const exp = getAndRemoveAttr(el, 'v-if')
    if (exp) {
        el.if = exp
        if (!el.ifConditions) {
            el.ifConditions = []
        }
        el.ifConditions.push({
            exp: exp,
            block: el
        })
    }
}

// 将attrs转换成map格式
function makeAttrsMap (attrs) {
    const map = {}
    attrs.forEach(item => {
        map[item.name] = item.value
    })
    return map
}

// 判断该node是否是静态节点
// type===2 表达式节点
// type===3 文本节点
function isStatic (node) {
    if (node.type === 2) {
        return false
    }
    if (node.type === 3) {
        return true
    }

    return (!node.if && node.for)
}

// 标记static属性
function markStatic (node) {
    node.static = isStatic(node)
    if (node.type === 1) {
        // 遍历子节点
        // 若子节点是非静态节点，那么当前节点也是非静态节点
        for (let i = 0, l = node.children.length; i < l; i++) {
            const child = node.children[i]
            markStatic(child)
            if (!child.static) {
                node.static = false
            }
        }
    }
}

// 标记静态根staticRoot
// 若当前节点是静态节点，同时该节点并不是只有一个文本节点左右的子节点(作者认为优化消耗大于收益)，标记为true，否则为false
function markStaticRoots (node) {
    if (node.type === 1) {
        if (
            node.static &&
            node.children.length &&
            !(node.children.length === 1 && node.children[0].type === 3)
        ) {
            node.staticRoot = true
        } else {
            node.staticRoot = false
        }
    }
}

// 优化
export function optimize (rootAst) {
    markStatic(rootAst)
    markStaticRoots(rootAst)
}

// 将ast转换成render function字符串
// 得到render的字符串和staticRenderFns字符串

// 处理if条件
function genIf (el) {
    el.ifProcessed = true
    if (!el.ifConditions.length) {
        return '_e()'
    }

    return `(${el.ifConditions[0].exp})?${genElement(el.ifConditions[0].block)}:_e()`
}

// 处理for循环
function genFor (el) {
    el.forProcessed = true

    const exp = el.for
    const alias = el.alias
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

    return `_l((${exp}),` +
            `function(${alias}${iterator1}${iterator2}){` +
            `return ${genElement(el)}` +
            '})'
}

// 处理文本
function genText (el) {
    return `_v(${el.expression || `'${el.text}'`})`
}

function genNode (el) {
    if (el.type === 1) {
        return genElement(el)
    } else {
        return genText(el)
    }
}

function genChildren (el) {
    const children = el.children
    if (children && children.length > 0) {
        return `[${children.map(genNode).join(',')}]`
    }
}

function genElement (el) {
    if (el.if && !el.ifProcessed) {
        return genIf(el)
    } else if (el.for && !el.forProcessed) {
        return genFor(el)
    } else {
        const children = genChildren(el)
        const code = `_c('${el.tag}',{
                staticClass: ${el.attrsMap && el.attrsMap[':class']},
                class: '${el.attrsMap && el.attrsMap.class}',
                }${children ? `,${children}` : ''})`

        return code
    }
}

export function generate (rootAst) {
    const code = rootAst ? genElement(rootAst) : '_c("div")'
    return {
        render: `with(this){return ${code}}`
    }
}

export function parse (htmlStr) {
    html = htmlStr
    return parseHTML()
}

var html = ''
