export function patch(oldVnode, vnode) {
    if (!oldVnode) {
        createElm(vnode)
    } else {
        if (oldVnode.nodeType === 1) {
            vnode.elm = oldVnode
            createElm(vnode, oldVnode)
        } else {
            patchVnode(oldVnode, vnode)
        }
    }

    return vnode.elm
}

function patchVnode(oldVnode, vnode) {
    const elm = oldVnode.elm
    const oldCh = oldVnode.children
    const ch = vnode.children
    updateChildren(elm, oldCh, ch)
}

function updateChildren(parentElm, oldCh, ch) {
    // diff 算法
    if (['string', 'number'].includes(typeof oldCh)) {
        if (['string', 'number'].includes(typeof ch)) {
            if (oldCh !== ch) {
                parentElm.innerText = ch
            }
        } else if (Array.isArray(ch)) {
            debugger
        }
    } else if (Array.isArray(oldCh)) {
        if (['string', 'number'].includes(typeof ch)) {
            parentElm.innerText = ch
        } else if (Array.isArray(ch)) {
            const minLen = Math.min(oldCh.length, ch.length)
            for (let i = 0; i < minLen; i++) {
                const oldVnode = oldCh[i]
                const newVnode = ch[i]
                const elm = newVnode.elm = oldVnode.elm
                if (oldVnode.tag !== newVnode.tag) {
                    elm.replaceWith(document.createElement(newVnode.tag))
                } else {
                    patchVnode(oldVnode, newVnode)
                }
            }
        }
    }
}

function createElm(vnode, parentElm) {
    if (vnode.tag) {
        vnode.elm = document.createElement(vnode.tag)
    }
    if (vnode.data && typeof vnode.data === 'object') {
        Object.keys(vnode.data).forEach(key => {
            vnode.elm.setAttribute(key, vnode.data[key])
        })
    }

    if (parentElm) {
        parentElm.append(vnode.elm)
    }

    const children = vnode.children
    createChildren(vnode, children)
}

function createChildren(vnode, children) {
    if (['string', 'number'].includes(typeof children)) {
        vnode.elm.append(document.createTextNode(children))
    } else if (Array.isArray(children)) {
        children.forEach((child) => {
            createElm(child, vnode.elm)
        })
    }
}