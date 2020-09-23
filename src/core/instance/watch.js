import { Watcher } from '../observer/watcher.js'

export function initWatch (vm, obj) {
    Object.keys(obj)
        .forEach(key => {
            new Watcher(vm, function () {
                obj[key].call(vm, vm[key])
            })
        })
}
