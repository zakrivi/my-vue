import { Dep } from '../instance/dep.js'

class Observer {
    constructor (obj) {
        Object.keys(obj)
            .forEach(key => {
                defineReactive(obj, key, obj[key])
            })
    }
}
export function observe (obj) {
    new Observer(obj)
}

function defineReactive (obj, key, value) {
    // 一个Dep类对象
    const dep = new Dep()

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
            if (newVal === value) {
                return
            }
            value = newVal
            // 在set的时候出发dep的notify来通知所有的Watcher对象更新视图
            dep.notify()
        }
    })
}
