const platform = 'web'

// 跨平台适配层，将不同平台的API封装，以同样的接口对外提供
const nodeOps = {
    setTextContent (node, text) {
        if (platform === 'weex') {
            node.parentNode.setAttr('value', text)
        } else if (platform === 'web') {
            node.textContent = text
        }
    },
    createElement (tag, vnode) {
        const elm = document.createElement(tag)
        const data = vnode.data || {}
        if (data.class) {
            elm.setAttribute('class', data.class)
        }
        return elm
    },
    createTextNode (text) {
        return document.createTextNode(text)
    },
    insertBefore (parent, elm, ref) {

    },
    nextSibling () {},
    appendChild (parent, elm) {
        parent.appendChild(elm)
    }
}

// 用来在parent这个父节点下插入一个子节点，如果制定了ref则插入到ref这个子节点前面
function insert (parent, elm, ref) {
    if (parent) {
        if (ref) {
            if (ref.parentNode === parent) {
                nodeOps.insertBefore(parent, elm, ref)
            }
        } else {
            nodeOps.appendChild(parent, elm)
        }
    }
}

// 新建节点， tag存在创建一个标签节点，否则创建一个文本节点
function createElm (vnode, parentElm, refElm) {
    if (vnode.tag) {
        vnode.elm = nodeOps.createElement(vnode.tag, vnode)
        vnode.children && vnode.children.length && createChildren(vnode, vnode.children, vnode.elm)
        // 绑定事件
        Object.keys(vnode.data.on).forEach(key => {
            vnode.elm.addEventListener(key, vnode.data.on[key])
        })
        insert(parentElm, vnode.elm, refElm)
    } else {
        vnode.elm = nodeOps.createTextNode(vnode.text)
        insert(parentElm, vnode.elm, refElm)
    }
}

function createChildren (vnode, children, parentElm) {
    children.forEach(item => {
        createElm(item, parentElm)
    })
}

// 批量调用createElm新建节点
function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx) {
    for (;startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], parentElm, refElm)
    }
}

// 移除一个节点
function removeNode (el) {
    const parent = nodeOps.parentNode(el)
    if (parent) {
        nodeOps.removeChild(parent, el)
    }
}

// 批量调用removeNode移除节点
function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (;startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx]
        if (ch) {
            removeNode(ch.elm)
        }
    }
}

// patch，通过diff算法比对两棵树的[差异]
// diff算法：通过同层的树节点进行比较，而非对树进行逐层搜索遍历的方式，所以时间复杂度只有O(n)
export function patch (oldVnode, vnode, parentElm) {
    if (!oldVnode) {
        // 老节点oldVnode不存在，直接用新节点vnode添加到parentElm
        addVnodes(parentElm, null, [vnode], 0, [vnode].length - 1)
    } else if (!vnode) {
        // 新节点vnode不存在，相当于删除老节点，直接用removeVnodes批量删除节点
        removeVnodes(parentElm, oldVnode, 0, oldVnode.length - 1)
    } else {
        // 当新老节点都存在的时候，需要判断它们是否属于相同的节点(sameVnode)
        // 如果是，就进行patchVnode(比对VNode)操作，否则删除老节点，增加新节点
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode)
        } else {
            removeVnodes(parentElm, oldVnode, 0, oldVnode.length - 1)
            addVnodes(parentElm, null, vnode, 0, vnode.length - 1)
        }
    }
}

// 是否属于相同的节点
// 只有当key、tag、isComment(是否是注释节点)、data同时定义/不定义，
// 同时满足标签类型为input的时候type相同(某些浏览器不支持动态修改<input>类型，所以它们被视为不同类型)即可
function sameVnode (a, b) {
    return (
        a.key === b.key &&
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        (!!a.data) === (!!b.data) &&
        sameInputType(a, b)
    )
}

function sameInputType (a, b) {
    if (a.tag !== 'input') return true
    let i
    const typeA = (i = a.data) && (i = i.attrs) && i.type
    const typeB = (i = b.data) && (i = i.attrs) && i.type
    return typeA === typeB
}

function patchVnode (oldVnode, vnode) {
    if (oldVnode === vnode) {
        return
    }

    if (vnode.isStatic && oldVnode.isStatic && vnode.key === oldVnode.key) {
        vnode.elm = oldVnode.elm
        vnode.componentInstance = oldVnode.componentInstance
        return
    }

    const elm = vnode.elm = oldVnode.elm
    const oldCh = oldVnode.children
    const ch = vnode.children

    if (vnode.text || oldVnode.text) {
        oldVnode.text !== vnode.text && nodeOps.setTextContent(elm, vnode.text)
    } else {
        if (oldCh && ch && oldCh !== ch) {
            updateChildren(elm, oldCh, ch)
        } else if (ch) {
            if (oldVnode.text) {
                nodeOps.setTextContent(elm, '')
            }
            addVnodes(elm, null, ch, 0, ch.length - 1)
        } else if (oldCh) {
            removeVnodes(elm, oldCh, 0, ch.length - 1)
        } else if (oldVnode.text) {
            nodeOps.setTextContent(elm, '')
        }
    }
}

function updateChildren (parentElm, oldCh, newCh) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, elmToMove, refElm

    // 从两侧向中间靠拢
    // 尽可能的复用现有的dom节点，提高性能
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!oldStartVnode) {
            /** 节点不存在，移动指向 */
            oldStartVnode = oldCh[++oldStartIdx]
        } else if (!oldEndVnode) {
            /** 节点不存在，移动指向 */
            oldEndVnode = oldCh[--oldEndIdx]
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            // 新旧开始节点相同时
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldCh[++oldStartIdx]
            newStartVnode = newCh[++newStartIdx]
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            // 新旧尾部节点相同时
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldCh[--oldEndIdx]
            newEndVnode = newCh[--newEndIdx]
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            // 旧开始节点和新尾部节点相同时
            // 将oldStartVnode真实节点插入到oldEndVnode真实节点的后面，复用旧的节点
            patchVnode(oldStartVnode, newEndVnode)
            nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
            oldStartVnode = oldCh[++oldStartIdx]
            newEndVnode = newCh[--newEndIdx]
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            // 旧尾部节点和新开始节点相同时
            // 将oldEndVnode真实节点插入到oldStartVnode真实节点的前面，复用旧的节点
            patchVnode(oldEndVnode, newStartVnode)
            nodeOps.insertBefore(parentElm, oldEndVnode, oldStartVnode.elm)
            oldEndVnode = oldCh[--oldEndIdx]
            newStartVnode = oldCh[++newStartIdx]
        } else {
            let elmToMove = oldCh[idxInOld]
            if (!oldKeyToIdx) {
                // 若key-index映射表不存在，新建map表
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
            }

            idxInOld = newStartVnode.key ? oldKeyToIdx[newStartVnode.key] : null
            if (!idxInOld) {
                // 不存在节点，新建新节点，newStartIdx向后移动一位
                createElm(newStartVnode, parentElm)
                newStartVnode = newCh[++newStartIdx]
            } else {
                // 存在节点
                elmToMove = oldCh[idxInOld]
                if (sameVnode(elmToMove, newStartVnode)) {
                    patchVnode(elmToMove, newStartVnode)
                    oldCh[idxInOld] = undefined
                    nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm)
                    newStartVnode = newCh[++newStartIdx]
                } else {
                    createElm(newStartVnode, parentElm)
                    newStartVnode = newCh[++newStartIdx]
                }
            }
        }
    }

    if (oldStartIdx > oldEndIdx) {
        // 老节点对比完成，插入新增的新节点
        refElm = (newCh[newEndIdx + 1]) ? newCh[newEndIdx + 1].elm : null
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx)
    } else if (newStartIdx > newEndIdx) {
        // 新节点对比完成， 移除多余的老节点
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
}

// 产生key与index索引对应的一个map表
function createKeyToOldIdx (children, beginIdx, endIdx) {
    let i, key
    const map = {}
    for (i = beginIdx; i <= endIdx; ++i) {
        key = children[i].key
        if (isDef(key)) {
            map[key] = i
        }
    }
    return map
}

function isDef () {

}
