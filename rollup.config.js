import pkg from './package.json' assert { type: 'json' }

const main = './src/index.js'
const errors = './src/errors/index.js'

const external = [
  'fs/promises',
  '@hbauer/local-file/errors.js',
  ...Object.keys(pkg.dependencies),
]

// eslint-disable-next-line import/no-default-export
export default [
  {
    input: main,
    external,
    output: [
      { file: pkg.exports['.'].require, format: 'cjs' },
      { file: pkg.exports['.'].import, format: 'esm' },
    ],
  },
  {
    input: errors,
    external,
    output: [
      { file: pkg.exports['./errors.js'].require, format: 'cjs' },
      { file: pkg.exports['./errors.js'].import, format: 'esm' },
    ],
  },
]
