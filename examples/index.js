// eslint-disable-next-line no-undef
const vm = new Vue({
    el: '#app',
    data () {
        return {
            name: '张三',
            age: 18,
            number: 0,
            classStatus: false
        }
    },
    watch: {
        // age (val) {
        //     console.log('watch-age: ', val)
        // },
        // number (val) {
        //     console.log('watch-number: ', val)
        // }
    },
    methods: {
        handleClick () {
            this.classStatus = !this.classStatus
            for (let i = 0; i < 3000; i++) {
                setTimeout(() => {
                    this.number++
                })
            }
        }
    }
})

window.vm = vm
