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
            console.log('getName', this.getName())
        },
        age (val) {
            console.log('age', val)
        }
    },
    methods: {
        getName () {
            return this.name
        }
    }
})

window.vm = vm
