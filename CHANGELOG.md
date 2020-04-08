# What's New

**node-diff3** is an open source project. You can submit bug reports, help out,
or learn more by visiting our project page on GitHub:  :octocat: https://github.com/bhousel/node-diff3

Please star our project on GitHub to show your support! :star:

_Breaking changes, which may affect downstream projects, are marked with a_ :warning:


<!--
# A.B.C
##### YYYY-MMM-DD

*

[#xxx]: https://github.com/bhousel/node-diff3/issues/xxx
-->


## 2.0.0
##### 2017-nov-21

* :warning: `invertPatch` now returns a copy instead of modifying patch in place ([#33])
* :warning: `diff3Merge`, `merge`, `mergeDigIn` now accept options object
* :warning: Split strings on whitespace by default, use `stringSeparator` option to change ([#9])
* :warning: `diff3MergeIndices` renamed to `diff3MergeRegions`
* Add test coverage for everything ([#3])

[#33]: https://github.com/bhousel/node-diff3/issues/33
[#9]: https://github.com/bhousel/node-diff3/issues/9
[#3]: https://github.com/bhousel/node-diff3/issues/3


## 1.0.0
##### 2017-nov-21

* Pushing major version bump due to change in npm ownership


## 0.1.0
##### 2017-oct-24

* :warning: Distribute both ES6 `index.mjs` and CJS `index.js`
* Fix improper hunk sorting ([iD#3058])
* Add tests, TravisCI

[iD#3058]: https://github.com/openstreetmap/iD/issues/3058


## 0.0.1
##### 2014-aug-21

* Initial release
