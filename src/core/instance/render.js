
import { parse, generate, optimize } from './parser.js'
import { VNode, createEmptyVNode, createTextVNode } from './vnode.js'
import { patch } from './patch.js'
import { Watcher } from '../observer/watcher.js'

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
        const ast = parse(document.querySelector('#template').innerHTML.trim(), vm)
        optimize(ast)
        const code = generate(ast)
        // eslint-disable-next-line no-new-func
        const vnode = new Function(code.render).call(this)
        // console.log(document.querySelector(vm.$options.el).innerHTML.trim())
        // console.log({ ast, vnode, render: code.render })
        const prevVnode = vm._vnode
        vm._vnode = vnode
        patch(prevVnode, vnode, document.querySelector(vm.$options.el))
    }

    Vue.prototype._e = createEmptyVNode
    Vue.prototype._c = createElement
    Vue.prototype._v = createTextVNode
    Vue.prototype._s = String
}

export function mountComponent (vm, elm) {
    new Watcher(vm, vm._render)
    // vm._update(vm._render())
}

export function createElement (tag, data, children) {
    const vnode = new VNode(tag, data, children, '')
    return vnode
}
