import { parseHTML, generate } from './parser.js'
import { VNode } from './vnode.js'

export function renderMixin (Vue) {
    Vue.prototype.$mount = function (el) {
        const vm = this
        const elm = document.querySelector(el)
        return mountComponent(vm, elm)
    }

    // 生成vnode
    Vue.prototype._render = function () {
        // return vnode
        const vm = this
        const ast = parseHTML(document.querySelector(vm.$options.el).outerHTML, vm)

        const code = generate(ast)
        // eslint-disable-next-line no-new-func
        return new Function(code).bind({
            _c: createElement.bind(this)
        })()
    }
}

export function mountComponent (vm, elm) {
    vm._update(vm._render())
}

function createElement (tag, data, children) {
    const vnode = new VNode(tag, data, children, this)
    return vnode
}
