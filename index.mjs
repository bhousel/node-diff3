export {
  LCS,
  diffComm,
  diffPatch,
  stripPatch,
  invertPatch,
  patch,
  diffIndices,
  diff3MergeIndices,
  diff3Merge,
  merge,
  mergeDigIn
};


// Text diff algorithm following Hunt and McIlroy 1976.
// J. W. Hunt and M. D. McIlroy, An algorithm for differential buffer
// comparison, Bell Telephone Laboratories CSTR #41 (1976)
// http://www.cs.dartmouth.edu/~doug/
// https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
//
// Expects two arrays, finds longest common sequence
function LCS(buffer1, buffer2) {
  var equivalenceClasses;
  var buffer2indices;
  var newCandidate;
  var candidates;
  var item;
  var c, i, j, jX, r, s;

  equivalenceClasses = {};
  for (j = 0; j < buffer2.length; j++) {
    item = buffer2[j];
    if (equivalenceClasses[item]) {
      equivalenceClasses[item].push(j);
    } else {
      equivalenceClasses[item] = [j];
    }
  }

  candidates = [
    { buffer1index: -1, buffer2index: -1, chain: null }
  ];

  for (i = 0; i < buffer1.length; i++) {
    item = buffer1[i];
    buffer2indices = equivalenceClasses[item] || [];

    r = 0;
    c = candidates[0];

    for (jX = 0; jX < buffer2indices.length; jX++) {
      j = buffer2indices[jX];

      for (s = r; s < candidates.length; s++) {
        if ((candidates[s].buffer2index < j) && ((s === candidates.length - 1) || (candidates[s + 1].buffer2index > j))) {
          break;
        }
      }

      if (s < candidates.length) {
        newCandidate = { buffer1index: i, buffer2index: j, chain: candidates[s] };
        if (r === candidates.length) {
          candidates.push(c);
        } else {
          candidates[r] = c;
        }
        r = s + 1;
        c = newCandidate;
        if (r === candidates.length) {
          break; // no point in examining further (j)s
        }
      }
    }

    candidates[r] = c;
  }

  // At this point, we know the LCS: it's in the reverse of the
  // linked-list through .chain of candidates[candidates.length - 1].

  return candidates[candidates.length - 1];
}


// We apply the LCS to build a 'comm'-style picture of the
// differences between buffer1 and buffer2.
function diffComm(buffer1, buffer2) {
  var result = [];
  var tail1 = buffer1.length;
  var tail2 = buffer2.length;
  var common = {common: []};

  function processCommon() {
    if (common.common.length) {
      common.common.reverse();
      result.push(common);
      common = {common: []};
    }
  }

  for (var candidate = LCS(buffer1, buffer2); candidate !== null; candidate = candidate.chain) {
    var different = {buffer1: [], buffer2: []};

    while (--tail1 > candidate.buffer1index) {
      different.buffer1.push(buffer1[tail1]);
    }

    while (--tail2 > candidate.buffer2index) {
      different.buffer2.push(buffer2[tail2]);
    }

    if (different.buffer1.length || different.buffer2.length) {
      processCommon();
      different.buffer1.reverse();
      different.buffer2.reverse();
      result.push(different);
    }

    if (tail1 >= 0) {
      common.common.push(buffer1[tail1]);
    }
  }

  processCommon();

  result.reverse();
  return result;
}


// We apply the LCS to build a JSON representation of a
// diff(1)-style patch.
function diffPatch(buffer1, buffer2) {
  var result = [];
  var tail1 = buffer1.length;
  var tail2 = buffer2.length;

  function chunkDescription(buffer, offset, length) {
    var chunk = [];
    for (var i = 0; i < length; i++) {
      chunk.push(buffer[offset + i]);
    }
    return {
      offset: offset,
      length: length,
      chunk: chunk
    };
  }

  for (var candidate = LCS(buffer1, buffer2); candidate !== null; candidate = candidate.chain) {
    var mismatchLength1 = tail1 - candidate.buffer1index - 1;
    var mismatchLength2 = tail2 - candidate.buffer2index - 1;
    tail1 = candidate.buffer1index;
    tail2 = candidate.buffer2index;

    if (mismatchLength1 || mismatchLength2) {
      result.push({
        buffer1: chunkDescription(buffer1, candidate.buffer1index + 1, mismatchLength1),
        buffer2: chunkDescription(buffer2, candidate.buffer2index + 1, mismatchLength2)
      });
    }
  }

  result.reverse();
  return result;
}


// Takes the output of diffPatch(), and removes
// information from it. It can still be used by patch(),
// below, but can no longer be inverted.
function stripPatch(patch) {
  var newpatch = [];
  for (var i = 0; i < patch.length; i++) {
    var chunk = patch[i];
    newpatch.push({
      buffer1: { offset: chunk.buffer1.offset, length: chunk.buffer1.length },
      buffer2: { chunk: chunk.buffer2.chunk }
    });
  }
  return newpatch;
}


// Takes the output of diffPatch(), and inverts the
// sense of it, so that it can be applied to buffer2 to give
// buffer1 rather than the other way around.
function invertPatch(patch) {
  for (var i = 0; i < patch.length; i++) {
    var chunk = patch[i];
    var tmp = chunk.buffer1;
    chunk.buffer1 = chunk.buffer2;
    chunk.buffer2 = tmp;
  }
}


// Applies a patch to a buffer.
//
// Given buffer1 and buffer2,
//   patch(buffer1, diffPatch(buffer1, buffer2))
// should give buffer2.
function patch(buffer, patch) {
  var result = [];
  var commonOffset = 0;

  function copyCommon(targetOffset) {
    while (commonOffset < targetOffset) {
      result.push(buffer[commonOffset]);
      commonOffset++;
    }
  }

  for (var chunkIndex = 0; chunkIndex < patch.length; chunkIndex++) {
    var chunk = patch[chunkIndex];
    copyCommon(chunk.buffer1.offset);
    for (var itemIndex = 0; itemIndex < chunk.buffer2.chunk.length; itemIndex++) {
      result.push(chunk.buffer2.chunk[itemIndex]);
    }
    commonOffset += chunk.buffer1.length;
  }

  copyCommon(buffer.length);
  return result;
}


// We apply the LCS to give a simple representation of the
// offsets and lengths of mismatched chunks in the input
// buffers. This is used by diff3MergeIndices below.
function diffIndices(buffer1, buffer2) {
  var result = [];
  var tail1 = buffer1.length;
  var tail2 = buffer2.length;

  for (var candidate = LCS(buffer1, buffer2); candidate !== null; candidate = candidate.chain) {
    var mismatchLength1 = tail1 - candidate.buffer1index - 1;
    var mismatchLength2 = tail2 - candidate.buffer2index - 1;
    tail1 = candidate.buffer1index;
    tail2 = candidate.buffer2index;

    if (mismatchLength1 || mismatchLength2) {
      result.push({
        buffer1: [tail1 + 1, mismatchLength1],
        buffer2: [tail2 + 1, mismatchLength2]
      });
    }
  }

  result.reverse();
  return result;
}


// Given three buffers, A, O, and B, where both A and B are
// independently derived from O, returns a fairly complicated
// internal representation of merge decisions it's taken. The
// interested reader may wish to consult
//
// Sanjeev Khanna, Keshav Kunal, and Benjamin C. Pierce.
// 'A Formal Investigation of ' In Arvind and Prasad,
// editors, Foundations of Software Technology and Theoretical
// Computer Science (FSTTCS), December 2007.
//
// (http://www.cis.upenn.edu/~bcpierce/papers/diff3-short.pdf)
//
//
// Returns an Array of hunk results.
//   "ok" result looks like:
//    [ buffer, start, length ]  where buffer 0=a, 1=o, 2=b
//   "conflict" result looks like:
//    [ -1, aStart, aLength, regionStart, regionLength, bStart, bLength]
//
//
function diff3MergeIndices(a, o, b) {
  var i;
  var m1 = diffIndices(o, a);
  var m2 = diffIndices(o, b);

  // First the hunks are prepared in a hunk array.
  // [oPosition, side, oLength, sidePosition, sideLength]  where side 0=a, 2=b

  var hunks = [];
  function addHunk(h, side) {
    hunks.push([h.buffer1[0], side, h.buffer1[1], h.buffer2[0], h.buffer2[1]]);
  }
  for (i = 0; i < m1.length; i++) { addHunk(m1[i], 0); }
  for (i = 0; i < m2.length; i++) { addHunk(m2[i], 2); }
  hunks.sort(function (x, y) { return x[0] - y[0]; });

  var result = [];
  var commonOffset = 0;
  function copyCommon(targetOffset) {
    if (targetOffset > commonOffset) {
      result.push([1, commonOffset, targetOffset - commonOffset]);
      commonOffset = targetOffset;
    }
  }

  for (var hunkIndex = 0; hunkIndex < hunks.length; hunkIndex++) {
    var firstHunkIndex = hunkIndex;
    var hunk = hunks[hunkIndex];
    var regionLhs = hunk[0];
    var regionRhs = regionLhs + hunk[2];
    while (hunkIndex < hunks.length - 1) {
      var maybeOverlapping = hunks[hunkIndex + 1];
      var maybeLhs = maybeOverlapping[0];
      if (maybeLhs > regionRhs) {
        break;
      }
      regionRhs = Math.max(regionRhs, maybeLhs + maybeOverlapping[2]);
      hunkIndex++;
    }

    copyCommon(regionLhs);
    if (firstHunkIndex === hunkIndex) {
      // The 'overlap' was only one hunk long, meaning that
      // there's no conflict here. Either a and o were the
      // same, or b and o were the same.
      if (hunk[4] > 0) {
        result.push([hunk[1], hunk[3], hunk[4]]);
      }
    } else {
      // A proper conflict. Determine the extents of the
      // regions involved from a, o and b. Effectively merge
      // all the hunks on the left into one giant hunk, and
      // do the same for the right; then, correct for skew
      // in the regions of o that each side changed, and
      // report appropriate spans for the three sides.
      var regions = {
        0: [a.length, -1, o.length, -1],
        2: [b.length, -1, o.length, -1]
      };
      for (i = firstHunkIndex; i <= hunkIndex; i++) {
        hunk = hunks[i];
        var side = hunk[1];
        var r = regions[side];
        var oLhs = hunk[0];
        var oRhs = oLhs + hunk[2];
        var abLhs = hunk[3];
        var abRhs = abLhs + hunk[4];
        r[0] = Math.min(abLhs, r[0]);
        r[1] = Math.max(abRhs, r[1]);
        r[2] = Math.min(oLhs, r[2]);
        r[3] = Math.max(oRhs, r[3]);
      }
      var aLhs = regions[0][0] + (regionLhs - regions[0][2]);
      var aRhs = regions[0][1] + (regionRhs - regions[0][3]);
      var bLhs = regions[2][0] + (regionLhs - regions[2][2]);
      var bRhs = regions[2][1] + (regionRhs - regions[2][3]);
      result.push([-1,
                   aLhs,      aRhs      - aLhs,
                   regionLhs, regionRhs - regionLhs,
                   bLhs,      bRhs      - bLhs]);
    }
    commonOffset = regionRhs;
  }

  copyCommon(o.length);
  return result;
}


// Applies the output of diff3MergeIndices to actually
// construct the merged buffer; the returned result alternates
// between 'ok' and 'conflict' blocks.
function diff3Merge(a, o, b, excludeFalseConflicts) {
  var result = [];
  var buffers = [a, o, b];
  var indices = diff3MergeIndices(a, o, b);

  var okLines = [];
  function flushOk() {
    if (okLines.length) {
      result.push({ok: okLines});
    }
    okLines = [];
  }
  function pushOk(xs) {
    for (var j = 0; j < xs.length; j++) {
      okLines.push(xs[j]);
    }
  }

  function isTrueConflict(rec) {
    if (rec[2] !== rec[6]) return true;
    var aoff = rec[1];
    var boff = rec[5];
    for (var j = 0; j < rec[2]; j++) {
      if (a[j + aoff] !== b[j + boff]) {
        return true;
      }
    }
    return false;
  }

  for (var i = 0; i < indices.length; i++) {
    var x = indices[i];
    var side = x[0];
    if (side === -1) {
      if (excludeFalseConflicts && !isTrueConflict(x)) {
        pushOk(buffers[0].slice(x[1], x[1] + x[2]));
      } else {
        flushOk();
        result.push({
          conflict: {
            a: a.slice(x[1], x[1] + x[2]),
            aIndex: x[1],
            o: o.slice(x[3], x[3] + x[4]),
            oIndex: x[3],
            b: b.slice(x[5], x[5] + x[6]),
            bIndex: x[5]
          }
        });
      }
    } else {
      pushOk(buffers[side].slice(x[1], x[1] + x[2]));
    }
  }

  flushOk();
  return result;
}


function merge(a, o, b) {
  var merger = diff3Merge(a, o, b, true);
  var conflict = false;
  var lines = [];
  for (var i = 0; i < merger.length; i++) {
    var item = merger[i];
    if (item.ok) {
      lines = lines.concat(item.ok);
    } else {
      conflict = true;
      lines = lines.concat(
        ['\n<<<<<<<<<\n'], item.conflict.a,
        ['\n=========\n'], item.conflict.b,
        ['\n>>>>>>>>>\n']
      );
    }
  }
  return {
    conflict: conflict,
    result: lines
  };
}


function mergeDigIn(a, o, b) {
  var merger = diff3Merge(a, o, b, false);
  var conflict = false;
  var lines = [];
  for (var i = 0; i < merger.length; i++) {
    var item = merger[i];
    if (item.ok) {
      lines = lines.concat(item.ok);
    } else {
      var c = diffComm(item.conflict.a, item.conflict.b);
      for (var j = 0; j < c.length; j++) {
        var inner = c[j];
        if (inner.common) {
          lines = lines.concat(inner.common);
        } else {
          conflict = true;
          lines = lines.concat(
            ['\n<<<<<<<<<\n'], inner.buffer1,
            ['\n=========\n'], inner.buffer2,
            ['\n>>>>>>>>>\n']
          );
        }
      }
    }
  }
  return {
    conflict: conflict,
    result: lines
  };
}

