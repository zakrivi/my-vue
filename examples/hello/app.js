var vm = new Vue({
    el: '#app',
    data() {
        return {
            count: 1,
            msg: 'hello world!'
        }
    },
    computed: {
        computedNum() {
            console.log('computedNum')
            return Math.pow(10, this.count)
        }
    },
    render(h) {
        console.log(this)
        return h(
            'div',
            null,
            [
                h(
                    'p',
                    {
                        id: 'msg'
                    },
                    this.msg
                ),
                h(
                    'p',
                    null,
                    [
                        h(
                            'span',
                            {
                                class: 'num'
                            },
                            this.computedNum
                        ),
                    ]
                )
            ]
        )
    }
})

window.vm = vm