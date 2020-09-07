import { Watcher } from '../observer/watcher.js'

export function initWatch (vm, obj) {
    Object.keys(obj)
        .forEach(key => {
            new Watcher(() => {
                obj[key].call(vm, vm[key])
            })
        })
}
