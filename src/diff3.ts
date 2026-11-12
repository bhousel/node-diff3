export {
  LCS,
  diffComm,
  diffIndices,
  diffPatch,
  diff3MergeRegions,
  diff3Merge,
  mergeDiff3,
  merge,
  mergeDigIn,
  patch,
  stripPatch,
  invertPatch
};


/** One link in the chain of matched items that `LCS` returns, last match first. */
export interface ILCSResult {
  buffer1index: number;
  buffer2index: number;
  chain: null | ILCSResult;
}

/** A run of items that is either common to both buffers, or different between them. */
export type ICommResult<T> = {
  common: T[];
  buffer1?: never;
  buffer2?: never;
} | {
  common?: never;
  buffer1: T[];
  buffer2: T[];
};

/** A mismatched chunk, as `[offset, length]` in each buffer, with its content. */
export interface IDiffIndicesResult<T> {
  buffer1: [number, number];
  buffer1Content: T[];
  buffer2: [number, number];
  buffer2Content: T[];
}

export interface IChunk<T> {
  offset: number;
  length: number;
  chunk: T[];
}

/** One chunk of a patch, as returned by `diffPatch`. */
export interface IPatchRes<T> {
  buffer1: IChunk<T>;
  buffer2: IChunk<T>;
}

/** One chunk of a patch, as returned by `stripPatch`. It can still be applied by `patch`, but not inverted. */
export interface IStrippedPatchRes<T> {
  buffer1: Pick<IChunk<T>, 'offset' | 'length'>;
  buffer2: Pick<IChunk<T>, 'chunk'>;
}

export interface IStableRegion<T> {
  stable: true;
  buffer: 'a' | 'o' | 'b';
  bufferStart: number;
  bufferLength: number;
  bufferContent: T[];
}

export interface IUnstableRegion<T> {
  stable: false;
  aStart: number;
  aLength: number;
  aContent: T[];
  bStart: number;
  bLength: number;
  bContent: T[];
  oStart: number;
  oLength: number;
  oContent: T[];
}

export type IRegion<T> = IStableRegion<T> | IUnstableRegion<T>;

/** A block of a `diff3Merge` result: either merged cleanly (`ok`), or a conflict. */
export type MergeRegion<T> = {
  ok: T[];
  conflict?: never;
} | {
  ok?: never;
  conflict: {
    a: T[];
    aIndex: number;
    b: T[];
    bIndex: number;
    o: T[];
    oIndex: number;
  };
};

export interface MergeResult<T = string> {
  conflict: boolean;
  result: Array<T | string>;
}

export interface IMergeOptions {
  excludeFalseConflicts?: boolean;
  stringSeparator?: string | RegExp;
}

export interface IMergeLabelOptions extends IMergeOptions {
  label?: {
    a?: string;
    o?: string;
    b?: string;
  };
}


/**
 * Text diff algorithm following Hunt and McIlroy 1976.
 * J. W. Hunt and M. D. McIlroy, An algorithm for differential buffer
 * comparison, Bell Telephone Laboratories CSTR #41 (1976)
 * http://www.cs.dartmouth.edu/~doug/
 * https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
 *
 * Expects two arrays, finds longest common sequence
 */
function LCS<T>(buffer1: readonly T[], buffer2: readonly T[]): ILCSResult {
  // A common prefix always ends up in the LCS, matched item for item,
  // so chain it up front and only run the algorithm on what follows.
  // `candidates[0]` (below) is then the end of the prefix instead of NULLRESULT.
  let prefixEnd: ILCSResult = { buffer1index: -1, buffer2index: -1, chain: null };  // NULLRESULT
  const maxPrefix = Math.min(buffer1.length, buffer2.length);
  for (let p = 0; p < maxPrefix && buffer1[p] === buffer2[p]; p++) {
    prefixEnd = { buffer1index: p, buffer2index: p, chain: prefixEnd };
  }
  const prefixLength = prefixEnd.buffer1index + 1;

  // Most (j)s in a row can't extend any candidate: either `j` is at or before
  // `candidates[r].buffer2index`, or some candidate already ends at `j`.
  // With many repeated items (blank lines, braces, common words) that's nearly
  // all of them, so rather than visit every `j`, we jump to the next one that can.
  //
  // `taken[j]` is set when a candidate ends at `j`. Small equivalence classes
  // just scan it. Each large class also gets a contiguous range of "slots", one
  // per `j`, in ascending order; `free` is a segment tree over the slots that
  // counts the (j)s no candidate ends at, so the next one is found in O(log n).
  // (Most items in real input are unique or nearly so, and keeping the tree
  // updated for them would cost more than it saves.)
  const SMALL_CLASS = 16;

  // Use a Map so items are matched like `===` (objects by identity, `1` and `'1'`
  // apart), rather than by their string form as object keys would be.
  const equivalenceClasses = new Map<T, number[]>();
  const largeClasses: number[][] = [];
  for (let j = prefixLength; j < buffer2.length; j++) {
    const item = buffer2[j]!;
    const indices = equivalenceClasses.get(item);
    if (indices) {
      indices.push(j);
      if (indices.length === SMALL_CLASS + 1) {
        largeClasses.push(indices);
      }
    } else {
      equivalenceClasses.set(item, [j]);
    }
  }

  const taken = new Uint8Array(buffer2.length);
  const slotOf = new Int32Array(buffer2.length).fill(-1);
  const slotStart = new Map<number[], number>();   // large class -> its first slot
  let slotCount = 0;
  for (const indices of largeClasses) {
    slotStart.set(indices, slotCount);
    for (let k = 0; k < indices.length; k++) {
      slotOf[indices[k]!] = slotCount + k;
    }
    slotCount += indices.length;
  }

  let size = 1;
  while (size < slotCount) size <<= 1;
  const free = new Int32Array(2 * size);
  free.fill(1, size, size + slotCount);
  for (let k = size - 1; k > 0; k--) {
    free[k] = free[2 * k]! + free[2 * k + 1]!;
  }

  // Returns the first free slot at or after `slot`, or -1 if there isn't one
  function nextFreeSlot(slot: number): number {
    if (slot >= slotCount) return -1;
    let k = slot + size;
    while (free[k] === 0) {
      while (k & 1) k >>= 1;    // climb out of right children
      if (k === 0) return -1;   // climbed past the root
      k++;                      // move to the subtree just to the right
    }
    while (k < size) {
      k = free[2 * k] ? 2 * k : 2 * k + 1;
    }
    return k - size;
  }

  // Marks `buffer2[j]` as taken or free
  function setTaken(j: number, isTaken: boolean): void {
    taken[j] = isTaken ? 1 : 0;
    const slot = slotOf[j]!;
    if (slot < 0) return;
    const delta = isTaken ? -1 : 1;
    for (let k = slot + size; k > 0; k >>= 1) {
      free[k]! += delta;
    }
  }

  // Sets `candidates[r] = c`, keeping `taken` and `free` in step
  function setCandidate(r: number, c: ILCSResult): void {
    const old = candidates[r];
    if (old === c) return;
    if (old) setTaken(old.buffer2index, false);
    setTaken(c.buffer2index, true);
    candidates[r] = c;
  }

  const candidates: ILCSResult[] = [prefixEnd];

  for (let i = prefixLength; i < buffer1.length; i++) {
    const item = buffer1[i]!;
    const indices = equivalenceClasses.get(item);
    if (!indices) continue;

    const start = indices.length > SMALL_CLASS ? slotStart.get(indices)! : -1;
    let r = 0;
    let c = candidates[0]!;
    let k = 0;  // the next of `indices` to consider

    while (true) {
      // Skip the (j)s at or before `candidates[r].buffer2index`..
      const after = candidates[r]!.buffer2index;
      let lo = k;
      let hi = indices.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (indices[mid]! <= after) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      // ..and the (j)s that a candidate already ends at.
      if (start < 0) {
        while (lo < indices.length && taken[indices[lo]!]) lo++;
        if (lo === indices.length) break;
        k = lo;
      } else {
        const slot = nextFreeSlot(start + lo);
        if (slot === -1 || slot >= start + indices.length) break;
        k = slot - start;
      }
      const j = indices[k]!;

      // `j` extends the last candidate `s` that ends before it. The
      // `buffer2index` values from `r` on are strictly increasing, so the
      // boundary is found by binary search.
      lo = r + 1;
      hi = candidates.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (candidates[mid]!.buffer2index < j) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      const s = lo - 1;

      const newCandidate: ILCSResult = { buffer1index: i, buffer2index: j, chain: candidates[s]! };
      setCandidate(r, c);
      r = s + 1;
      c = newCandidate;
      if (r === candidates.length) {
        break; // no point in examining further (j)s
      }
      k++;
    }

    setCandidate(r, c);
  }

  // At this point, we know the LCS: it's in the reverse of the
  // linked-list through .chain of candidates[candidates.length - 1].

  return candidates[candidates.length - 1]!;
}


/**
 * We apply the LCS to build a 'comm'-style picture of the
 * differences between buffer1 and buffer2.
 */
function diffComm<T>(buffer1: readonly T[], buffer2: readonly T[]): ICommResult<T>[] {
  const lcs = LCS(buffer1, buffer2);
  const result: ICommResult<T>[] = [];
  let tail1 = buffer1.length;
  let tail2 = buffer2.length;
  let common: { common: T[] } = { common: [] };

  function processCommon(): void {
    if (common.common.length) {
      common.common.reverse();
      result.push(common);
      common = { common: [] };
    }
  }

  for (let candidate: ILCSResult | null = lcs; candidate !== null; candidate = candidate.chain) {
    const different: { buffer1: T[]; buffer2: T[] } = { buffer1: [], buffer2: [] };

    while (--tail1 > candidate.buffer1index) {
      different.buffer1.push(buffer1[tail1]!);
    }

    while (--tail2 > candidate.buffer2index) {
      different.buffer2.push(buffer2[tail2]!);
    }

    if (different.buffer1.length || different.buffer2.length) {
      processCommon();
      different.buffer1.reverse();
      different.buffer2.reverse();
      result.push(different);
    }

    if (tail1 >= 0) {
      common.common.push(buffer1[tail1]!);
    }
  }

  processCommon();

  result.reverse();
  return result;
}


/**
 * We apply the LCS to give a simple representation of the
 * offsets and lengths of mismatched chunks in the input
 * buffers. This is used by diff3MergeRegions.
 */
function diffIndices<T>(buffer1: readonly T[], buffer2: readonly T[]): IDiffIndicesResult<T>[] {
  const lcs = LCS(buffer1, buffer2);
  const result: IDiffIndicesResult<T>[] = [];
  let tail1 = buffer1.length;
  let tail2 = buffer2.length;

  for (let candidate: ILCSResult | null = lcs; candidate !== null; candidate = candidate.chain) {
    const mismatchLength1 = tail1 - candidate.buffer1index - 1;
    const mismatchLength2 = tail2 - candidate.buffer2index - 1;
    tail1 = candidate.buffer1index;
    tail2 = candidate.buffer2index;

    if (mismatchLength1 || mismatchLength2) {
      result.push({
        buffer1: [tail1 + 1, mismatchLength1],
        buffer1Content: buffer1.slice(tail1 + 1, tail1 + 1 + mismatchLength1),
        buffer2: [tail2 + 1, mismatchLength2],
        buffer2Content: buffer2.slice(tail2 + 1, tail2 + 1 + mismatchLength2)
      });
    }
  }

  result.reverse();
  return result;
}


/**
 * We apply the LCS to build a JSON representation of a
 * diff(1)-style patch.
 */
function diffPatch<T>(buffer1: readonly T[], buffer2: readonly T[]): IPatchRes<T>[] {
  const lcs = LCS(buffer1, buffer2);
  const result: IPatchRes<T>[] = [];
  let tail1 = buffer1.length;
  let tail2 = buffer2.length;

  function chunkDescription(buffer: readonly T[], offset: number, length: number): IChunk<T> {
    const chunk: T[] = [];
    for (let i = 0; i < length; i++) {
      chunk.push(buffer[offset + i]!);
    }
    return {
      offset: offset,
      length: length,
      chunk: chunk
    };
  }

  for (let candidate: ILCSResult | null = lcs; candidate !== null; candidate = candidate.chain) {
    const mismatchLength1 = tail1 - candidate.buffer1index - 1;
    const mismatchLength2 = tail2 - candidate.buffer2index - 1;
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


/**
 * Given three buffers, A, O, and B, where both A and B are
 * independently derived from O, returns a fairly complicated
 * internal representation of merge decisions it's taken. The
 * interested reader may wish to consult
 *
 * Sanjeev Khanna, Keshav Kunal, and Benjamin C. Pierce.
 * 'A Formal Investigation of Diff3' In Arvind and Prasad,
 * editors, Foundations of Software Technology and Theoretical
 * Computer Science (FSTTCS), December 2007.
 *
 * (http://www.cis.upenn.edu/~bcpierce/papers/diff3-short.pdf)
 */
function diff3MergeRegions<T>(a: readonly T[], o: readonly T[], b: readonly T[]): IRegion<T>[] {

  // "hunks" are array subsets where `a` or `b` are different from `o`
  // https://www.gnu.org/software/diffutils/manual/html_node/diff3-Hunks.html
  interface Hunk {
    ab: 'a' | 'b';
    oStart: number;
    oLength: number;
    abStart: number;
    abLength: number;
  }
  const hunks: Hunk[] = [];
  function addHunk(h: IDiffIndicesResult<T>, ab: 'a' | 'b'): void {
    hunks.push({
      ab: ab,
      oStart: h.buffer1[0],
      oLength: h.buffer1[1],   // length of o to remove
      abStart: h.buffer2[0],
      abLength: h.buffer2[1]   // length of a/b to insert
      // abContent: (ab === 'a' ? a : b).slice(h.buffer2[0], h.buffer2[0] + h.buffer2[1])
    });
  }

  diffIndices(o, a).forEach(item => addHunk(item, 'a'));
  diffIndices(o, b).forEach(item => addHunk(item, 'b'));
  hunks.sort((x,y) => x.oStart - y.oStart);

  const results: IRegion<T>[] = [];
  let currOffset = 0;

  function advanceTo(endOffset: number): void {
    if (endOffset > currOffset) {
      results.push({
        stable: true,
        buffer: 'o',
        bufferStart: currOffset,
        bufferLength: endOffset - currOffset,
        bufferContent: o.slice(currOffset, endOffset)
      });
      currOffset = endOffset;
    }
  }

  let hunkIndex = 0;
  while (hunkIndex < hunks.length) {
    const hunk = hunks[hunkIndex++]!;
    const regionStart = hunk.oStart;
    let regionEnd = hunk.oStart + hunk.oLength;
    const regionHunks = [hunk];
    advanceTo(regionStart);

    // Try to pull next overlapping hunk into this region
    while (hunkIndex < hunks.length) {
      const nextHunk = hunks[hunkIndex]!;
      const nextHunkStart = nextHunk.oStart;
      if (nextHunkStart > regionEnd) break;   // no overlap

      regionEnd = Math.max(regionEnd, nextHunkStart + nextHunk.oLength);
      regionHunks.push(nextHunk);
      hunkIndex++;
    }

    if (regionHunks.length === 1) {
      // Only one hunk touches this region, meaning that there is no conflict here.
      // Either `a` or `b` is inserting into a region of `o` unchanged by the other.
      if (hunk.abLength > 0) {
        const buffer = (hunk.ab === 'a' ? a : b);
        results.push({
          stable: true,
          buffer: hunk.ab,
          bufferStart: hunk.abStart,
          bufferLength: hunk.abLength,
          bufferContent: buffer.slice(hunk.abStart, hunk.abStart + hunk.abLength)
        });
      }
    } else {
      // A true a/b conflict. Determine the bounds involved from `a`, `o`, and `b`.
      // Effectively merge all the `a` hunks into one giant hunk, then do the
      // same for the `b` hunks; then, correct for skew in the regions of `o`
      // that each side changed, and report appropriate spans for the three sides.
      const bounds: Record<'a' | 'b', [number, number, number, number]> = {
        a: [a.length, -1, o.length, -1],
        b: [b.length, -1, o.length, -1]
      };
      for (const regionHunk of regionHunks) {
        const oStart = regionHunk.oStart;
        const oEnd = oStart + regionHunk.oLength;
        const abStart = regionHunk.abStart;
        const abEnd = abStart + regionHunk.abLength;
        const bound = bounds[regionHunk.ab];
        bound[0] = Math.min(abStart, bound[0]);
        bound[1] = Math.max(abEnd, bound[1]);
        bound[2] = Math.min(oStart, bound[2]);
        bound[3] = Math.max(oEnd, bound[3]);
      }

      const aStart = bounds.a[0] + (regionStart - bounds.a[2]);
      const aEnd = bounds.a[1] + (regionEnd - bounds.a[3]);
      const bStart = bounds.b[0] + (regionStart - bounds.b[2]);
      const bEnd = bounds.b[1] + (regionEnd - bounds.b[3]);

      results.push({
        stable: false,
        aStart: aStart,
        aLength: aEnd - aStart,
        aContent: a.slice(aStart, aEnd),
        oStart: regionStart,
        oLength: regionEnd - regionStart,
        oContent: o.slice(regionStart, regionEnd),
        bStart: bStart,
        bLength: bEnd - bStart,
        bContent: b.slice(bStart, bEnd)
      });
    }
    currOffset = regionEnd;
  }

  advanceTo(o.length);

  return results;
}


// Appends `items` to `target`. (`target.push(...items)` overflows the call
// stack for large arrays, and `result = result.concat(items)` in a loop copies
// the whole result every time.)
function pushAll<T>(target: T[], items: readonly T[]): void {
  for (const item of items) {
    target.push(item);
  }
}


// Splits `buffer` with `separator` if it's a string.
// (A string buffer means `T` is `string`.)
function toArray<T>(buffer: string | readonly T[], separator: string | RegExp): readonly T[] {
  return typeof buffer === 'string' ? buffer.split(separator) as T[] : buffer;
}


/**
 * Applies the output of diff3MergeRegions to actually
 * construct the merged buffer; the returned result alternates
 * between 'ok' and 'conflict' blocks.
 * A "false conflict" is where `a` and `b` both change the same from `o`
 */
function diff3Merge<T = string>(
  a: string | readonly T[],
  o: string | readonly T[],
  b: string | readonly T[],
  options?: IMergeOptions
): MergeRegion<T>[] {
  const defaults: Required<IMergeOptions> = {
    excludeFalseConflicts: true,
    stringSeparator: /\s+/
  };
  const opts: Required<IMergeOptions> = { ...defaults, ...options };

  const regions = diff3MergeRegions(
    toArray(a, opts.stringSeparator),
    toArray(o, opts.stringSeparator),
    toArray(b, opts.stringSeparator)
  );
  const results: MergeRegion<T>[] = [];

  let okBuffer: T[] = [];
  function flushOk(): void {
    if (okBuffer.length) {
      results.push({ ok: okBuffer });
    }
    okBuffer = [];
  }

  function isFalseConflict(a: readonly T[], b: readonly T[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  regions.forEach(region =>  {
    if (region.stable) {
      pushAll(okBuffer, region.bufferContent);
    } else {
      if (opts.excludeFalseConflicts && isFalseConflict(region.aContent, region.bContent)) {
        pushAll(okBuffer, region.aContent);
      } else {
        flushOk();
        results.push({
          conflict: {
            a: region.aContent,
            aIndex: region.aStart,
            o: region.oContent,
            oIndex: region.oStart,
            b: region.bContent,
            bIndex: region.bStart
          }
        });
      }
    }
  });

  flushOk();
  return results;
}


function mergeDiff3<T = string>(
  a: string | readonly T[],
  o: string | readonly T[],
  b: string | readonly T[],
  options?: IMergeLabelOptions
): MergeResult<T> {
  const defaults: Required<IMergeLabelOptions> = {
    excludeFalseConflicts: true,
    stringSeparator: /\s+/,
    label: {}
  };
  const opts: Required<IMergeLabelOptions> = { ...defaults, ...options };

  const aSection = '<<<<<<<' + (opts.label.a ? ` ${opts.label.a}` : '');
  const oSection = '|||||||' + (opts.label.o ? ` ${opts.label.o}` : '');
  const xSection = '=======';
  const bSection = '>>>>>>>' + (opts.label.b ? ` ${opts.label.b}` : '');

  const regions = diff3Merge(a, o, b, opts);
  let conflict = false;
  const result: Array<T | string> = [];

  regions.forEach(region => {
    if (region.ok) {
      pushAll(result, region.ok);
    } else if (region.conflict) {
      conflict = true;
      result.push(aSection);
      pushAll(result, region.conflict.a);
      result.push(oSection);
      pushAll(result, region.conflict.o);
      result.push(xSection);
      pushAll(result, region.conflict.b);
      result.push(bSection);
    }
  });

  return {
    conflict: conflict,
    result: result
  };
}


function merge<T = string>(
  a: string | readonly T[],
  o: string | readonly T[],
  b: string | readonly T[],
  options?: IMergeLabelOptions
): MergeResult<T> {
  const defaults: Required<IMergeLabelOptions> = {
    excludeFalseConflicts: true,
    stringSeparator: /\s+/,
    label: {}
  };
  const opts: Required<IMergeLabelOptions> = { ...defaults, ...options };

  const aSection = '<<<<<<<' + (opts.label.a ? ` ${opts.label.a}` : '');
  const xSection = '=======';
  const bSection = '>>>>>>>' + (opts.label.b ? ` ${opts.label.b}` : '');

  const regions = diff3Merge(a, o, b, opts);
  let conflict = false;
  const result: Array<T | string> = [];

  regions.forEach(region => {
    if (region.ok) {
      pushAll(result, region.ok);
    } else if (region.conflict) {
      conflict = true;
      result.push(aSection);
      pushAll(result, region.conflict.a);
      result.push(xSection);
      pushAll(result, region.conflict.b);
      result.push(bSection);
    }
  });

  return {
    conflict: conflict,
    result: result
  };
}


function mergeDigIn<T = string>(
  a: string | readonly T[],
  o: string | readonly T[],
  b: string | readonly T[],
  options?: IMergeLabelOptions
): MergeResult<T> {
  const defaults: Required<IMergeLabelOptions> = {
    excludeFalseConflicts: true,
    stringSeparator: /\s+/,
    label: {}
  };
  const opts: Required<IMergeLabelOptions> = { ...defaults, ...options };

  const aSection = '<<<<<<<' + (opts.label.a ? ` ${opts.label.a}` : '');
  const xSection = '=======';
  const bSection = '>>>>>>>' + (opts.label.b ? ` ${opts.label.b}` : '');

  const regions = diff3Merge(a, o, b, opts);
  let conflict = false;
  const result: Array<T | string> = [];

  regions.forEach(region => {
    if (region.ok) {
      pushAll(result, region.ok);
    } else {
      const c = diffComm(region.conflict.a, region.conflict.b);
      for (const inner of c) {
        if (inner.common) {
          pushAll(result, inner.common);
        } else {
          conflict = true;
          result.push(aSection);
          pushAll(result, inner.buffer1);
          result.push(xSection);
          pushAll(result, inner.buffer2);
          result.push(bSection);
        }
      }
    }
  });

  return {
    conflict: conflict,
    result: result
  };
}


/**
 * Applies a patch to a buffer.
 * Given buffer1 and buffer2, `patch(buffer1, diffPatch(buffer1, buffer2))` should give buffer2.
 */
function patch<T>(buffer: readonly T[], patch: readonly IStrippedPatchRes<T>[]): T[] {
  const result: T[] = [];
  let currOffset = 0;

  function advanceTo(targetOffset: number): void {
    while (currOffset < targetOffset) {
      result.push(buffer[currOffset]!);
      currOffset++;
    }
  }

  for (const chunk of patch) {
    advanceTo(chunk.buffer1.offset);
    for (const item of chunk.buffer2.chunk) {
      result.push(item);
    }
    currOffset += chunk.buffer1.length;
  }

  advanceTo(buffer.length);
  return result;
}


/**
 * Takes the output of diffPatch(), and removes extra information from it.
 * It can still be used by patch(), below, but can no longer be inverted.
 */
function stripPatch<T>(patch: readonly IPatchRes<T>[]): IStrippedPatchRes<T>[] {
  return patch.map(chunk => ({
    buffer1: { offset: chunk.buffer1.offset, length: chunk.buffer1.length },
    buffer2: { chunk: chunk.buffer2.chunk }
  }));
}


/**
 * Takes the output of diffPatch(), and inverts the sense of it, so that it
 * can be applied to buffer2 to give buffer1 rather than the other way around.
 */
function invertPatch<T>(patch: readonly IPatchRes<T>[]): IPatchRes<T>[] {
  return patch.map(chunk => ({
    buffer1: chunk.buffer2,
    buffer2: chunk.buffer1
  }));
}
