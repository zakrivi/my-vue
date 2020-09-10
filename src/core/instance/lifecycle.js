import { render } from './parser.js'

export function lifecycleMixin (Vue) {
    Vue.prototype._update = function (vnode) {
        render(vnode)
        const vm = this
        const prevVnode = vm._node
        vm._node = vnode

        if (!prevVnode) {
            console.log('第一次更新')
            // vm.__patch__()
        } else {
        // 新旧vnode比较更新
            console.log('新旧节点比较')
            // vm.__patch__()
        }
    }

    Vue.prototype.__patch__ = patch
}

export function callHook (vm, hook) {
    console.log('hook: ', hook)
    typeof vm.$options[hook] === 'function' && vm.$options[hook].call(vm)
}

function patch () {

}
