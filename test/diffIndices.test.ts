import { describe, it } from 'bun:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../src/diff3.ts';


describe('diffIndices', () => {

  it('returns array indices for differing regions of two arrays', () => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diffIndices(a, b);

    assert.deepEqual(result, [
      { buffer1: [2, 1], buffer1Content: ['b'], buffer2: [2, 1], buffer2Content: ['d'] },
      { buffer1: [5, 4], buffer1Content: ['new', '00', 'a', 'a'], buffer2: [5, 1], buffer2Content: ['11'] },
      { buffer1: [10, 0], buffer1Content: [], buffer2: [7, 2], buffer2Content: ['z', 'z'] }
    ]);
  });

});
