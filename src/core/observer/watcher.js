import { pushTarget, popTarget, Dep } from '../instance/dep.js'

let uid = 0

export class Watcher {
    constructor (vm, expOrFn) {
        this.id = ++uid
        this.vm = vm
        // this.cb = cb
        // this.run()
        // popTarget()

        // 在new一个Watcher对象时将该对象赋值给Dep.target，在get中会用到
        // Dep.target = this
        this.getter = expOrFn || (() => {})
        this.get()
    }

    update () {
        console.log('视图更新啦~')
        this.get()
    }

    get () {
        pushTarget(this)
        this.getter.call(this.vm)
        popTarget(this)
    }
}
