
const path = require('path')
const alias = require('@rollup/plugin-alias')

const inputOptions = {
    input: 'src/core/index.js',
    plugins: [
        alias({
            entries: [
                { find: 'core', replacement: path.resolve(__dirname, '../../src/core') }
            ]
        })
    ]
}

const outputOptions = {
    file: 'dist/vue.js',
    format: 'umd',
    name: 'Vue',
    sourcemap: true
}

module.exports = {
    inputOptions,
    outputOptions
}
