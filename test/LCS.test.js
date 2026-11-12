import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as Diff3 from '../src/diff3.mjs';


// Walks the LCS chain into [buffer1index, buffer2index] pairs, in order,
// checking that each pair matches and that both indexes increase.
function lcsPairs(a, b, result) {
  const pairs = [];
  for (let c = result; c.chain !== null; c = c.chain) {
    pairs.push([c.buffer1index, c.buffer2index]);
  }
  pairs.reverse();

  let prev = [-1, -1];
  for (const [i, j] of pairs) {
    assert.ok(i > prev[0] && j > prev[1]);
    assert.deepEqual(a[i], b[j]);
    prev = [i, j];
  }
  return pairs;
}

// Brute-force LCS length by dynamic programming, to check against.
function lcsLength(a, b) {
  let prev = new Array(b.length + 1).fill(0);
  for (const item of a) {
    const row = [0];
    for (let j = 0; j < b.length; j++) {
      row.push(item === b[j] ? prev[j] + 1 : Math.max(prev[j + 1], row[j]));
    }
    prev = row;
  }
  return prev[b.length];
}


describe('LCS', () => {

  it('returns the LCS of two arrays', () => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.LCS(a, b);
    const NULLRESULT = { buffer1index: -1, buffer2index: -1, chain: null };

    assert.deepEqual(result.buffer1index, 10);  // '99'
    assert.deepEqual(result.buffer2index, 9);

    assert.deepEqual(result.chain.buffer1index, 9);  // 'M'
    assert.deepEqual(result.chain.buffer2index, 6);

    assert.deepEqual(result.chain.chain.buffer1index, 4);  // 'ZZ'
    assert.deepEqual(result.chain.chain.buffer2index, 4);

    assert.deepEqual(result.chain.chain.chain.buffer1index, 3);  // 'c'
    assert.deepEqual(result.chain.chain.chain.buffer2index, 3);

    assert.deepEqual(result.chain.chain.chain.chain.buffer1index, 1);  // 'a'
    assert.deepEqual(result.chain.chain.chain.chain.buffer2index, 1);

    assert.deepEqual(result.chain.chain.chain.chain.chain.buffer1index, 0);  // 'AA'
    assert.deepEqual(result.chain.chain.chain.chain.chain.buffer2index, 0);
    assert.deepEqual(result.chain.chain.chain.chain.chain.chain, NULLRESULT);
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

  it('finds a longest common subsequence when inputs have many repeated lines', () => {
    // Small random inputs, mostly empty lines, checked against brute force.
    // Seeded so any failure replays.
    let seed = 1;
    const random = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
    const values = ['', '', '', 'a', 'b'];
    const randomBuffer = () => Array.from(
      { length: Math.floor(random() * 20) },
      () => values[Math.floor(random() * values.length)]
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
