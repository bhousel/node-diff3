import { describe, it } from 'bun:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../src/diff3.ts';


describe('diff3MergeRegions', () => {

  it('returns results of 3-way diff from o,a,b arrays', () => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diff3MergeRegions(a, o, b);

    assert.deepEqual(result, [
      { stable: true, buffer: 'o', bufferStart: 0, bufferLength: 1, bufferContent: ['AA'] },
      {
        stable: false,
        aStart: 1, aLength: 3, aContent: ['a', 'b', 'c'],
        oStart: 1, oLength: 0, oContent: [],
        bStart: 1, bLength: 3, bContent: ['a', 'd', 'c']
      },
      { stable: true, buffer: 'o', bufferStart: 1, bufferLength: 1, bufferContent: ['ZZ'] },
      {
        stable: false,
        aStart: 5, aLength: 4, aContent: ['new', '00', 'a', 'a'],
        oStart: 2, oLength: 1, oContent: ['00'],
        bStart: 5, bLength: 1, bContent: ['11']
      },
      { stable: true, buffer: 'o', bufferStart: 3, bufferLength: 1, bufferContent: ['M'] },
      { stable: true, buffer: 'b', bufferStart: 7, bufferLength: 2, bufferContent: ['z', 'z'] },
      { stable: true, buffer: 'o', bufferStart: 4, bufferLength: 1, bufferContent: ['99'] }
    ]);
  });

});
