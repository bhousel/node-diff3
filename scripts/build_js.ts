
await Promise.all([
   Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist/js',
    target: 'browser',
    format: 'iife',
    sourcemap: 'linked',
    naming: 'diff3.iife.[ext]'  // .iife.js
  }),

  Bun.build({
    entrypoints: ['./src/diff3.ts'],
    outdir: './dist/js',
    target: 'node',
    format: 'esm',
    sourcemap: 'linked',
    naming: 'diff3.m[ext]'  // .mjs
  })
]);
