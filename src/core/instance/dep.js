export class Dep {
    constructor (cb) {
        // 用于存放Watcher对象的数组
        this.subs = []
        this.ids = []
    }

    // 在subs中添加一个Wathcer对象
    addSub (target) {
        if (this.ids.includes(target.id)) {
            // 观察者去重
            return
        }
        this.subs.unshift(target)
        this.ids.push(target.id)
    }

    // 通知所有Wathcer对象更新视图
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
