// eslint-disable-next-line no-undef
const vm = new Vue({
    el: '#app',
    data () {
        return {
            name: '张三',
            age: 18
        }
    },
    computed: {
        allData () {
            return `姓名：${this.name}\n
                    年龄：${this.age}`
        }
    },
    watch: {
        name (val) {
            console.log('name', val)
        },
        age (val) {
            console.log('age', val)
        }
    }
})

window.vm = vm
