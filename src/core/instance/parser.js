import { Watcher } from '../observer/watcher.js'
import { VNode } from './vnode.js'

const stack = []
const oldVNode = null

// export function parse (html, vm) {
//     const ast = parseHTML(html, vm)

//     const code = generate(ast)
//     // eslint-disable-next-line no-new-func
//     const _render = new Function(code).bind({
//         _c: createElement
//     })

//     new Watcher(() => {
//         const newVNode = _render()
//         if (oldVNode) {
//             console.log({ oldVNode, newVNode })
//         } else {
//             render(newVNode)
//             oldVNode = newVNode
//         }
//     })

//     function createElement (tag, data, children) {
//         const vnode = new VNode(tag, data, children, vm)
//         return vnode
//     }
// }

export function render (vnode) {
    const frag = document.createDocumentFragment()
    frag.appendChild(vnodeToDOM(vnode))
    document.querySelector('body').replaceChild(frag, document.querySelector('#app'))
}

// 暂不考虑注释标签
// 自循环解析数据，入栈出栈保证父子节点
export function parseHTML (html) {
    let index = 0
    while (html) {
        // 匹配开始标签
        const matchStart = html.match(/^<([A-z]+)/)
        if (matchStart) {
            parseStart(matchStart[1])
        }

        if (['input'].includes(stack[stack.length - 1].tag)) {
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
            tag: '',
            attrs: {},
            children: [],
            on: {},
            start: index,
            end: undefined
        }
        // 获取tag
        if (tag === 'input') {

        }
        result.tag = tag
        advence(1 + result.tag.length)

        // 获取属性attr
        const matchAttr = html.match(/^([^<>]+)>/)
        if (matchAttr) {
            const attrReg = /([A-z-\d]+)="([A-z\d]+)"/g
            while (attrReg.exec(matchAttr[1])) {
                const key = RegExp.$1
                const value = RegExp.$2
                result.attrs[key] = value
                if (key === 'v-model') {
                    result.on.input = `function(e){
                        this.${value} = e.target.value
                    }`
                }
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
            tag: 'text',
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

export function generate (ast) {
    const code = genCode(ast)
    return `with(this){return ${code}}`
}

function vnodeToDOM (vnode) {
    vnode.children.forEach(item => {
        vnode.elm.appendChild(vnodeToDOM(item))
    })
    return vnode.elm
}

function genCode (ast) {
    const { tag, attrs, children, content, on } = ast
    let data = { attrs }
    data.attrs === '{}' && delete data.attrs
    content && (data.content = content)
    if (on && Object.keys(on).length > 0) {
        data.on = on
    }
    data = JSON.stringify(data)

    let childs = []
    if (Array.isArray(children) && children.length) {
        childs = children.map(item => {
            return genCode(item)
        })
    }
    return `_c('${tag}', ${data}, [${childs}])`
}
