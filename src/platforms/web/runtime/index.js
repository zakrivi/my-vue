import Vue from 'core/index.js'
import { mountComponent } from 'core/instance/lifecycle'
import { patch } from './patch'

Vue.prototype.__patch__ = patch

// 公共$mount
Vue.prototype.$mount = function (el) {
    el = el && document.querySelector(el)
    return mountComponent(this, el)
}

export default Vue