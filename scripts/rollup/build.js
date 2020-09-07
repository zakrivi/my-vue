const rollup = require('rollup')
const chalk = require('chalk')
const argv = require('minimist')(process.argv.slice(2))
const { inputOptions, outputOptions } = require('./config')
const log = console.log
const isWatchMode = argv.watch
if (isWatchMode) {
    rollup.watch({
        ...inputOptions,
        output: outputOptions
    })
        .on('event', async event => {
            switch (event.code) {
            case 'BUNDLE_START': {
                log(chalk.green(event.code))
                log('input: ', event.input)
                log('output: ', event.output, '\n')
                break
            }
            case 'BUNDLE_END': {
                log(chalk.green(event.code), event.duration + 'ms')
                break
            }
            case 'ERROR':
            case 'FATAL': {
                log(chalk.bgRed(event.code), event.error)
            }
            }
        })
} else {
    build()
}

async function build () {
    log(chalk.green('开始打包'))
    const bundle = await rollup.rollup(inputOptions)
    await bundle.write(outputOptions)
    log(chalk.green('打包完成'))
}
