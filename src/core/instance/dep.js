export class Dep {
    constructor (cb) {
        this.subs = []
    }

    addSub (cb) {
        this.subs.unshift(cb)
    }

    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }

    notify () {
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}

Dep.target = null
const targetStack = []

export function pushTarget (cb) {
    targetStack.push(cb)
    Dep.target = cb
}

export function popTarget () {
    targetStack.pop()
    Dep.target = targetStack[targetStack.length - 1]
}
