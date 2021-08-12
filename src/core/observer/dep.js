let uid = 0

export default class Dep {
    constructor() {
        this.id = uid++
        this.subs = []
    }

    depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}


Dep.target = null
const targetStack = []

export function pushTarget(target) {
    targetStack.push(target)
    Dep.target = target
}

export function popTarget() {
    targetStack.pop()
    Dep.target = targetStack[targetStack.length - 1]
}