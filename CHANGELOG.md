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
