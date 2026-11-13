# What's New

**node-diff3** is an open source project. You can submit bug reports, help out,
or learn more by visiting our project page on GitHub:  :octocat: https://github.com/bhousel/node-diff3

Please star our project on GitHub to show your support! ⭐️

_Breaking changes, which may affect downstream projects, are marked with a_ ⚠️

<!--
# A.B.C
##### YYYY-MMM-DD
*

[#xxx]: https://github.com/bhousel/node-diff3/issues/xxx
-->

## 4.0.0
##### 2026-Nov-13

* ⚠️  node-diff3 is written in TypeScript now, and ships ESM only ([#98])
  * The CommonJS build is gone. `require('node-diff3')` still works on Node 20.19+ or 22.12+, which can `require()` ESM modules
  * The IIFE browser bundle moved to `dist/js/diff3.iife.js`
  * Type declarations are generated from the source, at `dist/ts/diff3.d.ts`
  * Bun loads the TypeScript source directly, through a `bun` export condition
* ⚠️  Compare buffer items with strict equality (`===`) ([#97])
  * Items used to match by their string form, so all objects matched each other and `1` matched `'1'`. In a merge this could drop a change without reporting a conflict. Output for string inputs is unchanged.
* ⚠️  Stricter TypeScript types ([#98])
  * Generics replace `any`, and inputs accept readonly arrays
  * `MergeRegion` is a union of ok and conflict regions, instead of an interface
  * `stripPatch()` output type-checks as input to `patch()` (new `IStrippedPatchRes` type)
  * Merge functions accept a string buffer only when `T` is `string`
* Speed up `LCS` and merges on large or repetitive inputs, such as text with many blank lines ([#50], [#84], [#89], [#95])
  * Merges no longer overflow the call stack on very large inputs
* Internal maintenance: switch from ESLint to oxlint ([#96]), update to TypeScript 7, check the published package with publint and arethetypeswrong

[#50]: https://github.com/bhousel/node-diff3/issues/50
[#84]: https://github.com/bhousel/node-diff3/issues/84
[#89]: https://github.com/bhousel/node-diff3/issues/89
[#95]: https://github.com/bhousel/node-diff3/issues/95
[#96]: https://github.com/bhousel/node-diff3/issues/96
[#97]: https://github.com/bhousel/node-diff3/issues/97
[#98]: https://github.com/bhousel/node-diff3/issues/98


## 3.2.1
##### 2026-Jun-03

* Fix `LCS` lookup handling so keys like `constructor` or `__proto__` do not shadow dictionary lookups ([#87])
* Improve TypeScript declarations for `diffComm` and merge APIs to better match runtime output ([#88])
* Internal maintenance updates and dependency refreshes

[#87]: https://github.com/bhousel/node-diff3/issues/87
[#88]: https://github.com/bhousel/node-diff3/issues/88


## 3.2.0
##### 2025-Oct-21
* This project uses [`bun`](https://bun.com/) now, for simpler developer tooling ([#85])

[#85]: https://github.com/bhousel/node-diff3/issues/85


## 3.1.2
##### 2022-Jun-06

* Rearrange "default" export to end of list for Webpack ([#58])

[#58]: https://github.com/bhousel/node-diff3/issues/58


## 3.1.1
##### 2022-Jun-03

* Fix exports property for Typescript declaration file ([#57])

[#57]: https://github.com/bhousel/node-diff3/issues/57


## 3.1.0
##### 2021-Sep-24

* Add `sideEffects: false` to `package.json` so bundlers like webpack can treeshake
* Remove the hardcoded `\n` from conflict boundaries ([#46], [#48])
  * Users who want to view the results of a merge will probably do something like `console.log(result.join('\n'));`, so having extra `\n` in there is unhelpful.

[#46]: https://github.com/bhousel/node-diff3/issues/46
[#48]: https://github.com/bhousel/node-diff3/issues/48


## 3.0.0
##### 2021-Jun-26

* ⚠️  Replace rollup with [esbuild](https://esbuild.github.io/) for super fast build speed. Package outputs are now:
  * `"module": "./index.mjs"` - ESM, modern JavaScript, works with `import`
  * `"main": "./dist/index.cjs"` - CJS bundle, modern JavaScript, works with `require()`
  * `"browser": "./dist/index.iife.js"` - IIFE bundle, modern JavaScript, works in browser `<script>` tag
  * No longer distributing ES5 builds
* ⚠️  node-diff3 is marked as `"type": "module"` now


## 2.1.2
##### 2021-May-04

* ([#44]) Fix "Type 'Buffer' is not generic." TypeScript error

[#44]: https://github.com/bhousel/node-diff3/issues/44


## 2.1.1
##### 2021-Apr-26

* ([#42]) Fix typo and add TypeScript definition for `patch`

[#42]: https://github.com/bhousel/node-diff3/issues/42


## 2.1.0
##### 2020-Jul-17

* ([#39]) Added a `mergeDiff3` function to help print out Diff3 merge result
* ([#37]) Fixed error in TypeScript definition for `MergeRegion`

[#39]: https://github.com/bhousel/node-diff3/issues/39
[#37]: https://github.com/bhousel/node-diff3/issues/37


## 2.0.1
##### 2020-May-18

* ([#35]) Added TypeScript declaration file

[#35]: https://github.com/bhousel/node-diff3/issues/35


## 2.0.0
##### 2020-Apr-08

* ⚠️  Several breaking changes:
  * `invertPatch` now returns a copy instead of modifying patch in place ([#33])
  * `diff3Merge`, `merge`, `mergeDigIn` now accept `options` object instead of `excludeFalseConflicts` argument
  * Strings are split on whitespace by default. Use `stringSeparator` option to override this behavior. ([#9])
  * `diff3MergeIndices` renamed to `diff3MergeRegions`
* Add test coverage for everything ([#3])

[#33]: https://github.com/bhousel/node-diff3/issues/33
[#9]: https://github.com/bhousel/node-diff3/issues/9
[#3]: https://github.com/bhousel/node-diff3/issues/3


## 1.0.0
##### 2017-Nov-21

* Pushing major version bump due to change in npm ownership


## 0.1.0
##### 2017-Oct-24

* ⚠️  Distribute both ESM `index.mjs` and CJS `index.js`
* Fix improper hunk sorting ([iD#3058])
* Add tests, TravisCI

[iD#3058]: https://github.com/openstreetmap/iD/issues/3058


## 0.0.1
##### 2014-aug-21

* Initial release
