import { initState } from './state.js'
import { compile } from './compile.js'

export function initMixin (Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options

        initState(vm)

        if (vm.$options.el) {
            compile(document.querySelector(vm.$options.el), vm)
        }
    }
}
