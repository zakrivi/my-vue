import { Watcher } from '../observer/watcher.js'

const stack = []

export function parse (html, vm) {
    const ast = parseHTML(html, vm)

    const str = htmlToFunction()
    // eslint-disable-next-line no-new-func
    window.render = new Function(str).bind({
        ast,
        objToDom,
        vm
    })
    new Watcher(() => {
        window.render()
    })
}

// 暂不考虑注释标签
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
            attrs: {},
            children: [],
            on: {},
            start: index,
            end: undefined
        }
        // 获取tag
        if (tag === 'input') {

        }
        result.type = tag
        advence(1 + result.type.length)

        // 获取属性attr
        const matchAttr = html.match(/^([^<>]+)>/)
        if (matchAttr) {
            const attrReg = /([A-z-\d]+)="([A-z\d]+)"/g
            while (attrReg.exec(matchAttr[1])) {
                const key = RegExp.$1
                const value = RegExp.$2
                result.attrs[key] = value
                if (key === 'v-model') {
                    result.on.input = e => {
                        vm[value] = e.target.value
                    }
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

function htmlToFunction () {
    return `with(this){
             document.querySelector("body").replaceChild(objToDom(ast, vm), document.querySelector("#app"))
            }
        `
}

function objToDom (ast, vm) {
    let el = null
    switch (ast.type) {
        case 'input': {
            el = document.createElement('input')
            const value = ast.attrs['v-model']
            el.value = vm[value]
            Object.keys(ast.on)
                .forEach(key => {
                    el.addEventListener(key, ast.on[key])
                })
            break
        }
        case 'text': {
            el = document.createTextNode(ast.content.replace(/{{\s*([A-z]*)\s*}}/g, (match, key) => {
                return vm[key]
            }))
            return el
        }
        default: {
            el = document.createElement(ast.type)
            Object.keys(ast.attrs)
                .forEach(key => {
                    el.setAttribute(key, ast.attrs[key])
                })
        }
    }

    if (ast.children && ast.children.length) {
        ast.children.forEach((item) => {
            el.appendChild(objToDom(item, vm))
        }, null)
    }

    return el
}

function objToHtml (ast, vm) {
    let start = ''
    let end = ''
    let content = ''
    const attrStr = ast.attrs ? Object.keys(ast.attrs)
        .map(key => ` ${key}=${ast.attrs[key]}`)
        .join('') : ''

    switch (ast.type) {
        case 'text': {
            content = ast.content.replace(/{{\s*([A-z]*)\s*}}/g, (match, key) => {
                return vm[key]
            })
            console.log(content)
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
            return total + objToHtml(item, vm)
        }, '')
    }
    return start + content + end
}
