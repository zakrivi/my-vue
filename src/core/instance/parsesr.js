
const stack = []
let render = null

export function parse (html) {
    const ast = parseHTML(html)

    window.render = render = createRender(htmlToFunction(ast))
}

function createRender (funcStr) {
    return new Function(funcStr)
}

// 暂不考虑注释和自闭合
// 自循环解析数据，入栈出栈保证父子节点
function parseHTML (html) {
    let index = 0
    while (html) {
        // 匹配开始标签
        const matchStart = html.match(/^<([A-z]+)/)
        if (matchStart) {
            parseStart(matchStart[1])
        }

        if (['input'].includes(stack[stack.length - 1].type)) {
            // 自闭合结束标签
            const matchSelfCloseEnd = html.match(/^>/)
            if (matchSelfCloseEnd) {
                stack[stack.length - 2].children.push(stack.pop())
                advence(1)
            }
        } else {
            // 匹配开始标签尾巴
            const matchStartTail = html.match(/^>/)
            if (matchStartTail) {
                advence(1)
            }
        }

        // 匹配结束标签
        const matchEnd = html.match(/(^<\/([A-z]+)>)|(^\/>)/)
        if (matchEnd) {
            if (stack.length > 1) {
                stack[stack.length - 2].children.push(stack.pop())
            }
            parseEnd(matchEnd[0])
        }

        // 匹配文本节点
        const matchText = html.match(/^([^<>]+)</)
        if (matchText) {
            stack[stack.length - 1].children.push(parseText(matchText[1]))
        }
    }

    return stack.pop()

    function parseStart (tag) {
        const result = {
            type: '',
            attrs: [],
            children: [],
            start: index,
            end: undefined
        }
        // 获取tag
        result.type = tag
        advence(1 + result.type.length)

        // 获取属性attr
        const matchAttr = html.match(/^([^<>]+)>/)
        if (matchAttr) {
            result.type = tag
            const attrReg = /([A-z\d]+)="([A-z\d]+)"/g
            while (attrReg.exec(matchAttr[1])) {
                result.attrs[RegExp.$1] = RegExp.$2
            }
            advence(matchAttr[1].length)
        }
        result.end = index
        stack.push(result)
    }

    // 获取标签子节点，包括文本节点
    // 匹配结束标签

    function parseText (text) {
        const obj = {
            type: 'text',
            content: text,
            start: index,
            end: 0
        }
        advence(text.length)
        obj.end = index

        return obj
    }
    function parseEnd (match) {
        advence(match.length)
    }

    function advence (n) {
        html = html.substring(n)
        index += n
    }
}

function htmlToFunction (ast) {
    return `document.querySelector('#app').outerHTML = \`${objToHtml(ast)}\``
}

function objToHtml (ast) {
    let start = ''
    let end = ''
    let content = ''
    const attrStr = ast.attrs ? Object.keys(ast.attrs)
        .map(key => ` ${key}=${ast.attrs[key]}"`)
        .join('') : ''

    switch (ast.type) {
        case 'text': {
            content = ast.content
            break
        }
        case 'input': {
            start = '<' + ast.type + attrStr + '>'
            end = ''
            break
        }
        default: {
            start = '<' + ast.type + attrStr + '>'
            end = `</${ast.type}>`
        }
    }

    if (ast.children && ast.children.length) {
        content += ast.children.reduce((total, item) => {
            return total + objToHtml(item)
        }, '')
    }
    return start + content + end
}
