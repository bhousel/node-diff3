import buble from '@rollup/plugin-buble';

export default {
  input: 'index.mjs',
  output: {
    file: 'dist/index.es5.js',
    format: 'umd',
    indent: false,
    name: 'Diff3'
  },
  plugins: [
    buble()
  ]
};
