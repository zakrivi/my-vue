import { initComputed } from './computed.js'
import { observe } from '../observer/index'
import { initWatch } from './watch.js'
import { initMethods } from './method.js'

export function initState (vm) {
    const opts = vm.$options

    if (opts.methods) {
        initMethods(vm, opts.methods)
    }

    if (opts.data) {
        initData(vm)
    }

    if (opts.computed) {
        initComputed(vm, opts.computed)
    }

    if (opts.watch) {
        initWatch(vm, opts.watch)
    }
}

function initData (vm) {
    const data = vm._data = typeof vm.$options.data === 'function' ? vm.$options.data.call(vm) : {}

    Object.keys(data)
        .forEach(key => {
            // 数据劫持
            proxy(vm, '_data', key)
        })

    observe(data)
}

function proxy (target, sourceKey, key) {
    Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        get () {
            return this[sourceKey][key]
        },
        set (val) {
            this[sourceKey][key] = val
        }
    })
}
