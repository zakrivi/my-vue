import {
    observe
} from '../observer/index'

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) initData(vm)
    if (opts.computed) initComputed(vm, opts.computed)
}


function initData(vm) {
    let data = vm.$options.data
    data = vm._data = getData(data, vm)
    // data代理到全局
    Object.keys(data).forEach(key => proxy(vm, `_data`, key))

    observe(data)
}

function getData(data, vm) {
    return data.call(vm, vm)
}

function proxy(target, sourceKey, key) {
    Object.defineProperty(target, key, {
        get() {
            return target[sourceKey][key]
        },
        set(val) {
            target[sourceKey][key] = val
        }
    })
}


function initComputed(vm, computed) {
    Object.keys(computed)
        .forEach(key => {
            const getter = computed[key]
            defineComputed(vm, key, getter)
        })
}

function defineComputed(target, key, getter) {
    Object.defineProperty(target, key, {
        get: getter,
        set() { }
    })
}