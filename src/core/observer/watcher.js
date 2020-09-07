import { pushTarget, popTarget } from '../instance/dep.js'

let uid = 0

export class Watcher {
    constructor (cb) {
        this.id = ++uid
        this.cb = cb
        pushTarget(this)
        this.run()
        popTarget()
    }

    update () {
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
