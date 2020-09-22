import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle.js'
import { renderMixin } from './render.js'
export default class Vue {
    constructor (options) {
        this._init(options)
    }
}

initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
