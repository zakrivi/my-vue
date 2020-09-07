import { initState } from './state.js'
import { compile } from './compile.js'
import { callHook } from './lifecycle.js'

export function initMixin (Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options

        callHook(vm, 'beforeCreate')
        initState(vm)
        callHook(vm, 'created')

        if (vm.$options.el) {
            compile(document.querySelector(vm.$options.el), vm)
        }
    }
}
