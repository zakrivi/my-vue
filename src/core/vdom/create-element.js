import Vnode from './vnode'
export function createElement(context, tag, data, children) {
    let vnode;

    if (typeof tag === 'string') {
        vnode = new Vnode(tag, data, children)
        return vnode
    }
}