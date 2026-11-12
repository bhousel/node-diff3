import { describe, it } from 'bun:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../src/diff3.ts';


// Walks the LCS chain into [buffer1index, buffer2index] pairs, in order,
// checking that each pair matches, that both indexes increase, and that
// the chain ends at NULLRESULT.
function lcsPairs<T>(a: readonly T[], b: readonly T[], result: Diff3.ILCSResult): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  let c = result;
  for (; c.chain !== null; c = c.chain) {
    pairs.push([c.buffer1index, c.buffer2index]);
  }
  assert.deepEqual(c, { buffer1index: -1, buffer2index: -1, chain: null });
  pairs.reverse();

  let prev = [-1, -1] as [number, number];
  for (const [i, j] of pairs) {
    assert.ok(i > prev[0] && j > prev[1]);
    assert.deepEqual(a[i], b[j]);
    prev = [i, j];
  }
  return pairs;
}

// Brute-force LCS length by dynamic programming, to check against.
function lcsLength<T>(a: readonly T[], b: readonly T[]): number {
  let prev: number[] = new Array(b.length + 1).fill(0);
  for (const item of a) {
    const row = [0];
    for (let j = 0; j < b.length; j++) {
      row.push(item === b[j] ? prev[j]! + 1 : Math.max(prev[j + 1]!, row[j]!));
    }
    prev = row;
  }
  return prev[b.length]!;
}


describe('LCS', () => {

  it('returns the LCS of two arrays', () => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.LCS(a, b);

    assert.deepEqual(lcsPairs(a, b, result), [
      [0, 0],   // 'AA'
      [1, 1],   // 'a'
      [3, 3],   // 'c'
      [4, 4],   // 'ZZ'
      [9, 6],   // 'M'
      [10, 9]   // '99'
    ]);
  });

  it('handles elements that match Object.prototype member names', () => {
    // Regression: a plain `{}` lookup table treats elements like 'constructor'
    // or '__proto__' as already-present (inherited from Object.prototype),
    // which used to crash with "equivalenceClasses[item].push is not a function".
    const prototypeNames = [
      'constructor',
      '__proto__',
      'toString',
      'hasOwnProperty',
      'valueOf',
      'isPrototypeOf',
      'propertyIsEnumerable',
      '__defineGetter__',
    ];

    for (const name of prototypeNames) {
      const result = Diff3.LCS([name], [name]);
      assert.deepEqual(result.buffer1index, 0);
      assert.deepEqual(result.buffer2index, 0);
    }
  });

  it('matches elements with strict equality', () => {
    // Regression: elements used to be matched by their string form, so all
    // objects matched each other, and `1` matched `'1'`.
    const x = { x: 1 };
    assert.deepEqual(Diff3.LCS<object>([{ a: 1 }], [{ b: 2 }]).chain, null);
    assert.deepEqual(Diff3.LCS([{ a: 1 }], [{ a: 1 }]).chain, null);
    assert.deepEqual(Diff3.LCS<unknown>([1], ['1']).chain, null);
    assert.deepEqual(Diff3.LCS<unknown>([null], ['null']).chain, null);

    const result = Diff3.LCS<unknown>([x, 1, 'a'], [x, '1', 'a']);
    assert.deepEqual(lcsPairs<unknown>([x, 1, 'a'], [x, '1', 'a'], result), [[0, 0], [2, 2]]);
  });

  it('finds a longest common subsequence when inputs have many repeated lines', () => {
    // Small random inputs, mostly empty lines, checked against brute force.
    // Seeded so any failure replays.
    let seed = 1;
    const random = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 2 ** 32;
    const values = ['', '', '', 'a', 'b'];
    const randomBuffer = () => Array.from(
      { length: Math.floor(random() * 20) },
      () => values[Math.floor(random() * values.length)]!
    );

    for (let t = 0; t < 1000; t++) {
      const a = randomBuffer();
      const b = randomBuffer();
      const pairs = lcsPairs(a, b, Diff3.LCS(a, b));
      assert.deepEqual(pairs.length, lcsLength(a, b));
    }
  });

  it('handles large inputs with many empty lines quickly', () => {
    // Regression for #84: half the lines are empty, and 5 lines are changed.
    const a = Array.from({ length: 4000 }, (_, i) => (i % 2 ? `line ${i}` : ''));
    const b = a.slice();
    for (const i of [100, 1001, 2000, 2999, 3900]) {
      b[i] = `changed ${i}`;
    }
    const pairs = lcsPairs(a, b, Diff3.LCS(a, b));
    assert.deepEqual(pairs.length, a.length - 5);
  }, 1000);  // took about 6 s before #89, about 50 ms after

});
