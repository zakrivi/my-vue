export class VNode {
    constructor (tag, data, children, vm) {
        this.tag = tag
        this.data = data
        this.children = children
        this.vm = vm
        this.elm = this.getDom()
    }

    getDom () {
        let dom = null
        switch (this.tag) {
            case 'text': {
                const txt = this.data.content.replace(/{{\s*([A-z]*)\s*}}/g, (match, key) => {
                    return this.vm[key]
                })
                dom = document.createTextNode(txt)
                break
            }
            case 'input': {
                dom = document.createElement(this.tag)
                const { attrs, on = {} } = this.data
                if (attrs) {
                    Object.keys(attrs).forEach(key => {
                        dom.setAttribute(key, attrs[key])
                    })
                }
                dom.value = this.vm[attrs['v-model']]

                Object.keys(on)
                    .forEach(key => {
                        // eslint-disable-next-line no-new-func
                        const func = new Function(`
                        with(this){
                           return (${on[key]})
                        }
                    `).call({
                            on,
                            key
                        }).bind(this.vm)
                        dom.addEventListener(key, func)
                    })

                break
            }
            default: {
                dom = document.createElement(this.tag)
                const { attrs } = this.data
                if (attrs) {
                    Object.keys(attrs).forEach(key => {
                        dom.setAttribute(key, attrs[key])
                    })
                }
                break
            }
        }

        return dom
    }
}
