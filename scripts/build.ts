
await Promise.all([
   Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'browser',
    format: 'iife',
    sourcemap: 'linked',
    naming: 'diff3.iife.[ext]'  // .iife.js
  }),

  Bun.build({
    entrypoints: ['./src/diff3.mjs'],
    outdir: './dist',
    target: 'node',
    format: 'cjs',
    sourcemap: 'linked',
    naming: 'diff3.c[ext]'  // .cjs
  }),

  Bun.build({
    entrypoints: ['./src/diff3.mjs'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    sourcemap: 'linked',
    naming: 'diff3.m[ext]'  // .mjs
  })
]);
