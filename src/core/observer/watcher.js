import { popTarget, pushTarget } from "./dep"

let uid = 0

export default class Watcher {
    constructor(vm, expOrFn) {
        this.id = uid++
        this.vm = vm
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        }
        this.depIds = []
        this.deps = []
        this.value = this.get()
    }

    get() {
        pushTarget(this)
        let value
        const vm = this.vm

        try {
            value = this.getter.call(vm, vm)
        } catch (e) {
            console.error(e)
        } finally {
            popTarget()
        }
        return value
    }

    addDep(dep) {
        if (this.depIds.includes(dep.id)) {
            return
        }
        this.depIds.push(dep.id)
        this.deps.push(dep)
        dep.addSub(this)
    }

    update() {
        this.run()
    }

    run() {
        const value = this.get()
    }
}