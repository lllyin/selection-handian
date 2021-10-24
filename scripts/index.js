const rollup = require('rollup')
let configFactory = require('./rollup.dev.config')
const fs = require('fs')
const util = require('util')
const path = require('path')

const { promisify } = util

const promisifyReadDir = promisify(fs.readdir)

const formatName = (n) => n.replace(/\.js/, '').replace('-', '_')

if (process.env.NODE_ENV === 'production') {
  configFactory = require('./rollup.prod.config')
}

console.log(process.env.NODE_ENV)

async function build(option) {
  const bundle = await rollup.rollup(option.input)
  await bundle.write(option.output)
}

;(async () => {
  try {
    build(
      configFactory({
        input: './index.js',
        fileName: './index.min.js',
      }),
    )
  } catch (e) {
    console.error(e) // eslint-disable-line no-console
  }
})()
