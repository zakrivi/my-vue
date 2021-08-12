import { initRender } from './render'
import { callHook } from './lifecycle'
import { initState } from './state'

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options

        initRender(vm)
        callHook(vm, 'beforeCreate')
        initState(vm)
        callHook(vm, 'created')

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
}