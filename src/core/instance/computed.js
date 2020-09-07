import { Watcher } from '../observer/watcher.js'
import { Dep } from './dep.js'

export function initComputed (vm) {
    vm._computed = vm.$options.computed || {}

    Object.keys(vm._computed)
        .forEach(key => {
            proxy(vm, '_computed', key)
        })
}

function proxy (vm, sourceKey, key) {
    let value
    const dep = new Dep()
    Object.defineProperty(vm, key, {
        enumerable: true,
        configurable: true,
        get () {
            if (Dep.target) {
                dep.addSub(Dep.target)
                // 依赖收集
                value = vm[sourceKey][key].call(vm)
                // 依赖收集
                new Watcher(() => {
                    value = vm[sourceKey][key].call(vm)
                }).update()
            }
            return value
        },
        set () {
        }
    })
}
