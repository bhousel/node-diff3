# Decisions

## Ship ESM only, no CommonJS build

The package ships an ESM build (`dist/js/diff3.mjs`), an IIFE bundle for browsers (`dist/js/diff3.iife.js`, exposes a `Diff3` global), and generated declarations (`dist/ts/`). The CJS build was dropped: Node 20.19+ and 22.12+ can `require()` an ESM module, so CommonJS consumers still work. The `require` export condition points at the `.mjs` file for that reason.

`bun run package` checks the packed tarball with `attw --profile esm-only`, so a missing CJS entry isn't reported as an error.

## Compare buffer items with strict equality

`LCS` matches items with a `Map`, so items compare like `===`. It used to use object keys, which matched by string form: all objects matched each other, `1` matched `'1'`, and `constructor` / `__proto__` could shadow lookups. In a merge that could drop a change without reporting a conflict. Output for string inputs is unchanged.

## Generated declarations with `isolatedDeclarations`

Types live inline in `src/diff3.ts`; the hand-written `.d.ts` is gone. `tsc -p tsconfig.build.json` emits declarations only, and `isolatedDeclarations` makes every export carry an explicit type, so the public API can't change by accident. Bun builds the JavaScript bundles.
