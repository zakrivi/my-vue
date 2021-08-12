import Watcher from '../observer/watcher'

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const prevVnode = vm._vnode
        vm._vnode = vnode

        if (!prevVnode) {
            // 初次渲染
            vm.$el = vm.__patch__(vm.$el, vnode)
        } else {
            // 更新
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    callHook(vm, 'beforeMount')

    let updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent)

    if (vm.$vnode == null) {
        callHook(vm, 'mounted')
    }
    return vm
}


export function callHook(vm, hook) {
    console.log(`--${hook}--`)
    if (vm.$options[hook]) {
        vm.$options[hook]()
    }
}