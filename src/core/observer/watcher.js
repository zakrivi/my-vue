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
        this.run()
    }

    update () {
        // console.log('视图更新啦~')
        // this.run()

        // 排队
        queueWatcher(this)
    }

    run () {
        // console.log('run')
        pushTarget(this)
        this.getter.call(this.vm)
        popTarget(this)
    }
}

const callbacks = [] // 存储nextTick回调事件
let pending = false

function nextTick (cb) {
    callbacks.push(cb)

    if (!pending) {
        pending = true
        // 通过异步延迟执行回调
        setTimeout(flushCallbacks, 0)
    }
}

function flushCallbacks () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    copies.forEach(cb => cb())
}

const has = {}
const queue = [] // 存储观察者
let waiting = false

function queueWatcher (wathcer) {
    const id = wathcer.id
    if (!has[id]) {
        has[id] = true
        queue.push(wathcer)

        if (!waiting) {
            waiting = true
            // 批量执行队列方法推入下一事件循环执行
            nextTick(flushSchedulerQueue)
        }
    }
}

function flushSchedulerQueue () {
    queue.forEach(item => {
        has[item.id] = null
        item.run()
    })

    waiting = false
}
