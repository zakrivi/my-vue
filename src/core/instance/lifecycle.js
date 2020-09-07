export function callHook (vm, hook) {
    console.log('hook: ', hook)
    typeof vm.$options[hook] === 'function' && vm.$options[hook].call(vm)
}
