export class VNode {
    constructor (tag, data, children, text, elm) {
        // 当前节点的标签名
        this.tag = tag || ''
        // 当前节点的一些数据信息，比如props、attrs等数据
        this.data = data || {}
        // 当前节点的子节点，是一个数组
        this.children = children
        // 当前节点的文本
        this.text = text || ''
        // 当前虚拟节点对应的真实dom节点
        this.elm = elm
    }

    // getDom () {
    //     let dom = null
    //     switch (this.tag) {
    //         case 'text': {
    //             const txt = this.data.content.replace(/{{\s*([A-z]*)\s*}}/g, (match, key) => {
    //                 return this.vm[key]
    //             })
    //             dom = document.createTextNode(txt)
    //             break
    //         }
    //         case 'input': {
    //             dom = document.createElement(this.tag)
    //             const { attrs, on = {} } = this.data
    //             if (attrs) {
    //                 Object.keys(attrs).forEach(key => {
    //                     dom.setAttribute(key, attrs[key])
    //                 })
    //             }
    //             dom.value = this.vm[attrs['v-model']]

    //             Object.keys(on)
    //                 .forEach(key => {
    //                     // eslint-disable-next-line no-new-func
    //                     const func = new Function(`
    //                     with(this){
    //                        return (${on[key]})
    //                     }
    //                 `).call({
    //                         on,
    //                         key
    //                     }).bind(this.vm)
    //                     dom.addEventListener(key, func)
    //                 })

    //             break
    //         }
    //         default: {
    //             dom = document.createElement(this.tag)
    //             const { attrs } = this.data
    //             if (attrs) {
    //                 Object.keys(attrs).forEach(key => {
    //                     dom.setAttribute(key, attrs[key])
    //                 })
    //             }
    //             break
    //         }
    //     }

    //     return dom
    // }
}

// 创建一个空节点
export function createEmptyVNode () {
    const node = new VNode()
    node.text = ''
    return node
}

// 创建一个本文节点
export function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
}

// 克隆一个VNode节点
function cloneVNode (node) {
    const cloneVnode = new VNode(
        node.tag,
        node.data,
        node.children,
        node.text,
        node.elm
    )

    return cloneVnode
}
