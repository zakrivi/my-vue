export function initMethods (vm, methods) {
    Object.keys(methods)
        .forEach(key => {
            vm[key] = typeof methods[key] === 'function' ? methods[key].bind(vm) : () => {}
        })
}
