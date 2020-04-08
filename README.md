[![npm version](https://badge.fury.io/js/node-diff3.svg)](https://badge.fury.io/js/node-diff3)
[![Build Status](https://travis-ci.org/bhousel/node-diff3.svg?branch=master)](https://travis-ci.org/bhousel/node-diff3)

# node-diff3

This is a Javascript library for text diffing and three-way-merge.

The code originally came from project Synchrotron, created by Tony Garnock-Jones.
For more detail please visit:

* https://leastfixedpoint.com/tonyg/kcbbs/projects/synchrotron.html
* https://github.com/tonyg/synchrotron

&nbsp;

## Usage

To install this library as a dependency in another project:
`npm install --save node-diff3`

This library is distributed in both UMD and ES6 module formats. ([read more](https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm))
* `index.mjs`  - ES6 module
* `dist/index.js` - UMD module, ES6 syntax
* `dist/index.es5.js` - UMD module, ES5 syntax

Whether you require or import it, it should just work.

```js
const Diff3 = require('node-diff3');                   // UMD import all
const diff3Merge = require('node-diff3').diff3Merge;   // UMD import named
// or
import * as Diff3 from 'node-diff3';                   // ES6 import all
import { diff3Merge } from 'node-diff3';               // ES6 import named
```

You can also use UMD builds of node-diff3 directly in a web browser. A good way to do this is to fetch the file from the [jsDelivr CDN](https://www.jsdelivr.com/):

For modern ES6-capable browsers:
```html
<script src="https://cdn.jsdelivr.net/npm/node-diff3@2/dist/index.min.js"></script> 
```

Or if you need to support older browsers like Internet Explorer, fetch the ES5 version:
```html
<script src="https://cdn.jsdelivr.net/npm/node-diff3@2/dist/index.es5.min.js"></script> 
```

&nbsp;

## API Reference

* [3-way diff and merging](#3-way-diff-and-merging)
  * [diff3Merge](#diff3Merge)
  * [merge](#merge)
  * [mergeDigIn](#mergeDigIn)
  * [diff3MergeRegions](#diff3MergeRegions)
* [2-way diff and patching](#2-way-diff-and-patching)
  * [diffPatch](#diffPatch)
  * [patch](#patch)
  * [stripPatch](#stripPatch)
  * [invertPatch](#invertPatch)
  * [diffComm](#diffComm)
  * [diffIndices](#diffIndices)
* [Longest Common Sequence (LCS)](#longest-common-sequence-lcs)
  * [LCS](#LCS)

&nbsp;

### 3-way diff and merging

&nbsp;

<a name="diff3Merge" href="#diff3Merge">#</a> <i>Diff3</i>.<b>diff3Merge</b>(<i>a</i>, <i>o</i>, <i>b</i>, <i>options</i>)

Performs a 3-way diff on buffers `o` (original), `a`, and `b`.
The buffers may be arrays or strings. If strings, they will be split into arrays on whitespace `/\s+/` by default.
The returned result alternates between "ok" and "conflict" blocks.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diff3Merge.test.js

```js
const o = ['AA', 'ZZ', '00', 'M', '99'];
const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
const result = Diff3.diff3Merge(a, o, b);
```

Options may passed as an object:
```js
{
  excludeFalseConflicts: true,
  stringSeparator: /\s+/
}
```

* `excludeFalseConflicts` - If both `a` and `b` contain the same change from `o`, this is considered a "false" conflict.
* `stringSeparator` - If inputs buffers are strings, this controls how to split the strings into arrays. The separator value may be a string or a regular expression, as it is just passed to [String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split).

&nbsp;

<a name="merge" href="#merge">#</a> <i>Diff3</i>.<b>merge</b>(<i>a</i>, <i>o</i>, <i>b</i>, <i>options</i>)

Passes arguments to [diff3Merge](#diff3Merge) to generate a diff3-style merge result.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/merge.test.js

```js
const r = Diff3.merge(a, o, b);
const result = r.result;
// [
//   'AA',
//   '\n<<<<<<<<<\n',
//   'a',
//   'b',
//   'c',
//   '\n=========\n',
//   'a',
//   'd',
//   'c',
//   '\n>>>>>>>>>\n',
//   'ZZ',
//   '\n<<<<<<<<<\n',
//   'new',
//   '00',
//   'a',
//   'a',
//   '\n=========\n',
//   '11',
//   '\n>>>>>>>>>\n',
//   'M',
//   'z',
//   'z',
//   '99'
//  ]
```

&nbsp;

<a name="mergeDigIn" href="#mergeDigIn">#</a> <i>Diff3</i>.<b>mergeDigIn</b>(<i>a</i>, <i>o</i>, <i>b</i>, <i>options</i>)

Passes arguments to [diff3Merge](#diff3Merge) to generate a digin-style merge result.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/mergeDigIn.test.js

&nbsp;

<a name="diff3MergeRegions" href="#diff3MergeRegions">#</a> <i>Diff3</i>.<b>diff3MergeRegions</b>(<i>a</i>, <i>o</i>, <i>b</i>)

Low-level function used by [diff3Merge](#diff3Merge) to determine the stable and unstable regions between `a`, `o`, `b`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diff3MergeRegions.test.js


&nbsp;

### 2-way diff and patching

&nbsp;

<a name="diffPatch" href="#diffPatch">#</a> <i>Diff3</i>.<b>diffPatch</b>(<i>buffer1</i>, <i>buffer2</i>)

Performs a diff between arrays `buffer1` and `buffer2`.
The returned `patch` result contains the information about the differing regions and can be applied to `buffer1` to yield `buffer2`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const buffer1 = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
const buffer2 = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
const patch = Diff3.diffPatch(buffer1, buffer2);
// `patch` contains the information needed to turn `buffer1` into `buffer2`
```

&nbsp;

<a name="patch" href="#patch">#</a> <i>Diff3</i>.<b>patch</b>(<i>buffer1</i>, <i>patch</i>)

Applies a patch to a buffer, returning a new buffer without modifying the original.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const result = Diff3.patch(buffer1, patch);
// `result` contains a new arrray which is a copy of `buffer2`
```

&nbsp;

<a name="stripPatch" href="#stripPatch">#</a> <i>Diff3</i>.<b>stripPatch</b>(<i>patch</i>)

Strips some extra information from the patch, returning a new patch without modifying the original. 
The "stripped" patch can still patch `buffer1` -> `buffer2`, but can no londer be inverted.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const stripped = Diff3.stripPatch(patch);
// `stripped` contains a copy of a patch but with the extra information removed
```

&nbsp;

<a name="invertPatch" href="#invertPatch">#</a> <i>Diff3</i>.<b>invertPatch</b>(<i>patch</i>)

Inverts the patch (for example to turn `buffer2` back into `buffer1`), returning a new patch without modifying the original.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const inverted = Diff3.invertPatch(patch);
// `inverted` contains a copy of a patch to turn `buffer2` back into `buffer1`
```

&nbsp;

<a name="diffComm" href="#diffComm">#</a> <i>Diff3</i>.<b>diffComm</b>(<i>buffer1</i>, <i>buffer2</i>)

Returns a comm-style result of the differences between `buffer1` and `buffer2`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffComm.test.js

&nbsp;

<a name="diffIndices" href="#diffIndices">#</a> <i>Diff3</i>.<b>diffIndices</b>(<i>buffer1</i>, <i>buffer2</i>)

Low-level function used by [diff3MergeRegions](#diff3MergeRegions) to determine differing regions between `buffer1` and `buffer2`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffIndices.test.js


&nbsp;

### Longest Common Sequence (LCS)

&nbsp;

<a name="LCS" href="#LCS">#</a> <i>Diff3</i>.<b>LCS</b>(<i>buffer1</i>, <i>buffer2</i>)

Low-level function used by other functions to find the LCS between `buffer1` and `buffer2`.
Returns a result linked list chain containing the common sequence path.

See also: 
* http://www.cs.dartmouth.edu/~doug/
* https://en.wikipedia.org/wiki/Longest_common_subsequence_problem

See examples: https://github.com/bhousel/node-diff3/blob/master/test/LCS.test.js


&nbsp;

## License

This project is available under the [MIT License](https://opensource.org/licenses/MIT).
See the [LICENSE.md](LICENSE.md) file for more details.
