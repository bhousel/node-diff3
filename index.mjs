export {
  LCS,
  diffComm,
  diffIndices,
  diffPatch,
  stripPatch,
  invertPatch,
  patch,
  diff3MergeRegions,
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


// We apply the LCS to give a simple representation of the
// offsets and lengths of mismatched chunks in the input
// buffers. This is used by diff3MergeRegions.
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
//   `patch(buffer1, diffPatch(buffer1, buffer2))
// should give buffer2.
function patch(buffer, patch) {
  var result = [];
  var currOffset = 0;

  function copyUpTo(targetOffset) {
    while (currOffset < targetOffset) {
      result.push(buffer[currOffset]);
      currOffset++;
    }
  }

  for (var chunkIndex = 0; chunkIndex < patch.length; chunkIndex++) {
    var chunk = patch[chunkIndex];
    copyUpTo(chunk.buffer1.offset);
    for (var itemIndex = 0; itemIndex < chunk.buffer2.chunk.length; itemIndex++) {
      result.push(chunk.buffer2.chunk[itemIndex]);
    }
    currOffset += chunk.buffer1.length;
  }

  copyUpTo(buffer.length);
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
// Returns an Array of region results.
//   "ok" result looks like:
//    [ buffer, start, length ]  where buffer 0=a, 1=o, 2=b
//   "conflict" result looks like:
//    [ -1, aStart, aLength, regionStart, regionLength, bStart, bLength]
//
//
function diff3MergeRegions(a, o, b) {

console.log(' ');
console.log('diff3MergeRegions:');
console.log('o: ' + o);
console.log('a: ' + a);
console.log('b: ' + b);

  const diffa = diffIndices(o, a);
  const diffb = diffIndices(o, b);

  var hunks = [];
  function addHunk(h, ab) {
    hunks.push({
      oOffset: h.buffer1[0],
      oLength: h.buffer1[1],   // length of o to remove
      ab: ab,
      abOffset: h.buffer2[0],
      abLength: h.buffer2[1]   // length of a/b to insert
    });
  }

  diffa.forEach(item => addHunk(item, 'a'));
  diffb.forEach(item => addHunk(item, 'b'));
  hunks.sort((x,y) => x.oOffset - y.oOffset);

console.log(' ');
console.log('diff3MergeRegions hunks (length ' + hunks.length + '):');
console.log(hunks);


  let results = [];
  let currOffset = 0;

  function copyUpTo(endOffset) {
    if (endOffset > currOffset) {
      let result = [1, currOffset, endOffset - currOffset];
console.log('  copyUpTo pushing [' + result + ']');
      results.push(result);
      currOffset = endOffset;
    }
  }

  for (let hunkIndex = 0; hunkIndex < hunks.length; hunkIndex++) {
console.log('hunk ' + hunkIndex);
    let startHunkIndex = hunkIndex;
    let hunk = hunks[hunkIndex];
    let regionStart = hunk.oOffset;
    let regionEnd = regionStart + hunk.oLength;
    while (hunkIndex < hunks.length - 1) {      // check if next hunk overlaps
      let nextHunk = hunks[hunkIndex + 1];
      let nextStart = nextHunk.oOffset;
      if (nextStart > regionEnd) {
        break;
      }
      regionEnd = Math.max(regionEnd, nextStart + nextHunk.oLength);
      hunkIndex++;
    }

    copyUpTo(regionStart);
    if (startHunkIndex === hunkIndex) {
      // The 'overlap' was only one hunk long, meaning that
      // there's no conflict here. Either a and o were the
      // same, or b and o were the same.
console.log('  overlap?');
      if (hunk.abLength > 0) {

        let result = [(hunk.ab === 'a' ? 0 : 2), hunk.abOffset, hunk.abLength];
console.log('  overlap pushing [' + result + ']');
        results.push(result);
      }
    } else {
      // A proper conflict. Determine the extents of the
      // regions involved from a, o and b. Effectively merge
      // all the hunks on the left into one giant hunk, and
      // do the same for the right; then, correct for skew
      // in the regions of o that each side changed, and
      // report appropriate spans for the three sides.
      var regions = {
        a: [a.length, -1, o.length, -1],
        b: [b.length, -1, o.length, -1]
      };
      for (let i = startHunkIndex; i <= hunkIndex; i++) {
        hunk = hunks[i];
        let r = regions[hunk.ab];
        let oStart = hunk.oOffset;
        let oEnd = oStart + hunk.oLength;
        let abStart = hunk.abOffset;
        let abEnd = abStart + hunk.abLength;
        r[0] = Math.min(abStart, r[0]);
        r[1] = Math.max(abEnd, r[1]);
        r[2] = Math.min(oStart, r[2]);
        r[3] = Math.max(oEnd, r[3]);
      }

console.log('  conflict regions:');
console.log('    ' + regions);

      let aStart = regions.a[0] + (regionStart - regions.a[2]);
      let aEnd = regions.a[1] + (regionEnd - regions.a[3]);
      let bStart = regions.b[0] + (regionStart - regions.b[2]);
      let bEnd = regions.b[1] + (regionEnd - regions.b[3]);

      let result = [-1,
        aStart,      aEnd - aStart,
        regionStart, regionEnd - regionStart,
        bStart,      bEnd - bStart
      ];
console.log('  conflict pushing [' + result + ']');
      results.push(result);
    }
    currOffset = regionEnd;
  }

  copyUpTo(o.length);

console.log(' ');
console.log('diff3MergeRegions results:');
console.log(results);

  return results;
}


// Applies the output of diff3MergeRegions to actually
// construct the merged buffer; the returned result alternates
// between 'ok' and 'conflict' blocks.
function diff3Merge(a, o, b, excludeFalseConflicts) {
  var result = [];
  var buffers = [a, o, b];
  var indices = diff3MergeRegions(a, o, b);

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

  function isTrueConflict(region) {
    if (region[2] !== region[6]) return true;
    var aoff = region[1];
    var boff = region[5];
    for (var j = 0; j < region[2]; j++) {
      if (a[j + aoff] !== b[j + boff]) {
        return true;
      }
    }
    return false;
  }

  for (var i = 0; i < indices.length; i++) {
    var region = indices[i];
    var side = region[0];
    if (side === -1) {
      if (excludeFalseConflicts && !isTrueConflict(region)) {
        pushOk(buffers[0].slice(region[1], region[1] + region[2]));
      } else {
        flushOk();
        result.push({
          conflict: {
            a: a.slice(region[1], region[1] + region[2]),
            aIndex: region[1],
            o: o.slice(region[3], region[3] + region[4]),
            oIndex: region[3],
            b: b.slice(region[5], region[5] + region[6]),
            bIndex: region[5]
          }
        });
      }
    } else {
      pushOk(buffers[side].slice(region[1], region[1] + region[2]));
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

