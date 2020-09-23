// eslint-disable-next-line no-undef
const vm = new Vue({
    el: '#app',
    data () {
        return {
            name: '张三',
            age: 18
        }
    },
    watch: {
        age (val) {
            console.log('watch-age: ', val)
        }
    }
})

window.vm = vm
