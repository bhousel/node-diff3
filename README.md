[![Build Status](https://travis-ci.org/bhousel/node-diff3.svg?branch=master)](https://travis-ci.org/bhousel/node-diff3)
[![Greenkeeper badge](https://badges.greenkeeper.io/bhousel/node-diff3.svg)](https://greenkeeper.io/)

## node-diff3

This is a node.js library for text diffing and three-way-merge.

It originally came from project Synchrotron, created by Tony Garnock-Jones.
For more detail please visit:

- https://leastfixedpoint.com/tonyg/kcbbs/projects/synchrotron.html
- https://github.com/tonyg/synchrotron


### Usage

* **patch: function (file, patch)**

  Applies a patch to a file.

  Given file1 and file2, diff.patch(file1,
  diff.diffPatch(file1, file2)) should give file2.

* **diffIndices: function(file1, file2)**

  We apply the LCS to give a simple representation of the
  offsets and lengths of mismatched chunks in the input
  files. This is used by diff3MergeIndices below.

* **diff3MergeIndices: function (a, o, b)**

  Given three files, A, O, and B, where both A and B are
  independently derived from O, returns a fairly complicated
  internal representation of merge decisions it's taken. The
  interested reader may wish to consult

  Sanjeev Khanna, Keshav Kunal, and Benjamin C. Pierce. "A
  Formal Investigation of Diff3." In Arvind and Prasad,
  editors, Foundations of Software Technology and Theoretical
  Computer Science (FSTTCS), December 2007.

  (http://www.cis.upenn.edu/~bcpierce/papers/diff3-short.pdf)

* **diff3Merge: function (a, o, b, excludeFalseConflicts)**

  Applies the output of diff.diff3MergeIndices to actually
  construct the merged file; the returned result alternates
  between "ok" and "conflict" blocks.

* **merge: function (a, o, b)**

  build a merge file.

* **mergeDigIn: function (a, o, b)**

  build a digin style merge file.
