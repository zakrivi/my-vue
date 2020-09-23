// eslint-disable-next-line no-undef
const vm = new Vue({
    el: '#app',
    data () {
        return {
            name: '张三',
            age: 18,
            number: 0
        }
    },
    watch: {
        age (val) {
            console.log('watch-age: ', val)
        },
        number (val) {
            console.log('watch-number: ', val)
        }
    },
    methods: {
        handleClick () {
            for (let i = 0; i < 1000; i++) {
                this.number++
            }
        }
    }
})

window.vm = vm
