[![npm version](https://badge.fury.io/js/node-diff3.svg)](https://badge.fury.io/js/node-diff3)
[![Build Status](https://travis-ci.org/bhousel/node-diff3.svg?branch=master)](https://travis-ci.org/bhousel/node-diff3)


# node-diff3

This is a Javascript library for text diffing and three-way-merge.

The code originally came from project Synchrotron, created by Tony Garnock-Jones.
For more detail please visit:

- https://leastfixedpoint.com/tonyg/kcbbs/projects/synchrotron.html
- https://github.com/tonyg/synchrotron


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


## API

### 3-way diff and merging:

#### function diff3Merge (a, o, b, options)
Performs a 3-way diff on buffers `o` (original), `a`, and `b`.
The buffers may be arrays or strings - if strings, they will be split on ' ' by default.
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
  stringSeparator: ' '
}
```

* `excludeFalseConflicts` - If both `a` and `b` contain the same change from `o`, this is considered a "false" conflict.
* `stringSeparator` - If inputs are passed as strings, this controls how to split the strings into arrays.


#### function merge (a, o, b, options)
Passes arguments to `diff3Merge` to generate a diff3-style merge result.

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

#### function mergeDigIn (a, o, b, options)
Passes arguments to `diff3Merge` to generate a digin-style merge result.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/mergeDigIn.test.js

#### function diff3MergeRegions (a, o, b)
Low-level function used by `diff3Merge` to determine the stable and unstable regions between `a`, `o`, `b`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diff3MergeRegions.test.js


### 2-way diff and patching:

#### function diffPatch (buffer1, buffer2)
Performs a diff between arrays `buffer1` and `buffer2`.
The returned `patch` result contains the information about the differing regions and can be applied to `buffer1` to yield `buffer2`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const buffer1 = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
const buffer2 = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
const patch = Diff3.diffPatch(buffer1, buffer2);
// `patch` contains the information needed to turn `buffer1` into `buffer2`
```

#### function patch (buffer, patch)
Applies a patch to a buffer, returning a new buffer without modifying the original.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const result = Diff3.patch(buffer1, patch);
// `result` contains a new arrray which is a copy of `buffer2`
```

#### function stripPatch (patch)
Strips some extra information from the patch, returning a new patch without modifying the original. 
The "stripped" patch can still patch `buffer1` -> `buffer2`, but can no londer be inverted.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const stripped = Diff3.stripPatch(patch);
// `stripped` contains a copy of a patch but with the extra information removed
```

#### function invertPatch (patch)
Inverts the patch (for example to turn `buffer2` back into `buffer1`), returning a new patch without modifying the original.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffPatch.test.js

```js
const inverted = Diff3.invertPatch(patch);
// `inverted` contains a copy of a patch to turn `buffer2` back into `buffer1`
```

#### function diffComm (buffer1, buffer2)
Returns a comm-style result of the differences between `buffer1` and `buffer2`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffComm.test.js

#### function diffIndices (buffer1, buffer2)
Low-level function used by `diff3MergeRegions` to determine differing regions between `buffer1` and `buffer2`.

See examples: https://github.com/bhousel/node-diff3/blob/master/test/diffIndices.test.js


### Longest Common Sequence (LCS):

#### function LCS (buffer1, buffer2)
Low-level function used by other functions to find the LCS between `buffer1` and `buffer2`.
Returns a result linked list chain containing the common sequence path.

See also: 
* http://www.cs.dartmouth.edu/~doug/
* https://en.wikipedia.org/wiki/Longest_common_subsequence_problem

See examples: https://github.com/bhousel/node-diff3/blob/master/test/LCS.test.js


## License

This project is available under the [MIT License](https://opensource.org/licenses/MIT).
See the [LICENSE.md](LICENSE.md) file for more details.
