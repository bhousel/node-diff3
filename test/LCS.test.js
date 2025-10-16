import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as Diff3 from '../src/diff3.mjs';


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

});
