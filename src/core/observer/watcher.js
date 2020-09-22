import { pushTarget, popTarget, Dep } from '../instance/dep.js'

let uid = 0

export class Watcher {
    constructor (cb) {
        this.id = ++uid
        this.cb = cb
        pushTarget(this)
        this.run()
        popTarget()

        // 在new一个Watcher对象时将该对象赋值给Dep.target，在get中会用到
        Dep.target = this
    }

    update () {
        console.log('视图更新啦~')
        this.run()
    }

    run () {
        this.get()
    }

    get () {
        const value = this.cb()
        return value
    }
}
