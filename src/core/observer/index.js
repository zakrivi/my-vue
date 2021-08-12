
import Dep from './dep'

export class Observer {
    constructor(value) {
        this.value = value
        this.walk(value)
    }

    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key)
        })
    }
}

export function defineReactive(obj, key) {
    const dep = new Dep()
    let val = obj[key]
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() {
            if (Dep.target) {
                dep.depend()
            }
            return val
        },
        set(newVal) {
            if (val === newVal) {
                return
            }
            val = newVal
            dep.notify()
        }
    })
}

export function observe(value) {
    const ob = new Observer(value)
    return ob
}