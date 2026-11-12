import { describe, it } from 'bun:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../src/diff3.ts';


describe('diffComm', () => {

  it('returns a comm-style diff of two arrays', () => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diffComm(a, b);

    assert.deepEqual(result, [
      { common: ['AA', 'a'] },
      { buffer1: ['b'], buffer2: ['d'] },
      { common: ['c', 'ZZ'] },
      { buffer1: ['new', '00', 'a', 'a'], buffer2: ['11'] },
      { common: ['M'] },
      { buffer1: [], buffer2: ['z', 'z'] },
      { common: ['99'] }
    ]);
  });

  it('handles empty lines', () => {
    // From #50
    const a = ['AA', '', 'b', 'c', 'ZZ', '', 'z', '', '', '90', '', 'x'];
    const b = ['AA', '', 'd', 'c', 'ZZ', '', '', 'z', '', '99', '', 'x'];
    const result = Diff3.diffComm(a, b);

    assert.deepEqual(result, [
      { common: ['AA', ''] },
      { buffer1: ['b'], buffer2: ['d'] },
      { common: ['c', 'ZZ', ''] },
      { buffer1: [], buffer2: [''] },
      { common: ['z', ''] },
      { buffer1: [], buffer2: ['99'] },
      { common: [''] },
      { buffer1: ['90', ''], buffer2: [] },
      { common: ['x'] }
    ]);
  });

});
