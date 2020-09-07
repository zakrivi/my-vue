
import { Watcher } from '../observer/watcher.js'

export function compile (el, vm) {
    const childs = el.childNodes
    childs.forEach(child => {
        switch (child.nodeType) {
        case 3: {
            parseText(child, vm)
            break
        }
        case 1: {
            if (child.childNodes.length > 0) {
                compile(child, vm)
            }
            break
        }
        }
    })
}

function parseText (node, vm) {
    const text = node.textContent
    new Watcher(() => {
        node.textContent = text.replace(/{{\s*([A-z]*)\s*}}/g, (matched, key) => {
            return vm[key]
        })
    })
}
