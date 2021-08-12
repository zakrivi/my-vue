const path = require('path')
const alias = require('rollup-plugin-alias')
const aliases = require('./alias')
const resolve = p => {
    const base = p.split('/')[0]
    if (aliases[base]) {
        console.log(path.resolve(aliases[base], p.slice(base.length + 1)))
        return path.resolve(aliases[base], p.slice(base.length + 1))
    } else {
        return path.resolve(__dirname, '../', p)
    }
}

export default {
    input: resolve('web/entry-runtime.js'),
    output: {
        file: resolve('dist/vue.runtime.js'),
        format: 'umd',
        sourcemap: true,
        name: 'Vue'
    },
    plugins: [
        alias({
            resolve: ['.jsx', '.js'],
            entries: aliases
        })
    ]
};