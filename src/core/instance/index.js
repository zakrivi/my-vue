
import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'

function Vue(options) {
    this._init(options)
}

// 原型方法增加_init
initMixin(Vue)
// 原型方法增加_update
lifecycleMixin(Vue)
// 原型方法增加_render
renderMixin(Vue)


export default Vue