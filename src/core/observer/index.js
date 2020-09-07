import { Dep } from '../instance/dep.js'

class Observer {
    constructor (obj) {
        Object.keys(obj)
            .forEach(key => {
                defineReactive(obj, key)
            })
    }
}
export function observe (obj) {
    new Observer(obj)
}

function defineReactive (obj, key) {
    const dep = new Dep()
    let value = obj[key]

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get () {
            if (Dep.target) {
                dep.addSub(Dep.target)
            }
            return value
        },
        set (newVal) {
            value = newVal
            dep.notify()
        }
    })
}
