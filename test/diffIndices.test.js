import { test } from 'tap';
import * as Diff3 from '../index.mjs';
import { testTimeout } from './timeout.js';

test('diffIndices', t => {

  t.test('returns array indices for differing regions of two arrays', t => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diffIndices(a, b);

    t.same(result[0].buffer1, [2, 1]);
    t.same(result[0].buffer1Content, ['b']);
    t.same(result[0].buffer2, [2, 1]);
    t.same(result[0].buffer2Content, ['d']);

    t.same(result[1].buffer1, [5, 4]);
    t.same(result[1].buffer1Content, ['new', '00', 'a', 'a']);
    t.same(result[1].buffer2, [5, 1]);
    t.same(result[1].buffer2Content, ['11']);

    t.same(result[2].buffer1, [10, 0]);
    t.same(result[2].buffer1Content, []);
    t.same(result[2].buffer2, [7, 2]);
    t.same(result[2].buffer2Content, ['z', 'z']);

    t.end();
  });
  
  testTimeout(t, timeout => Diff3.diffIndices(['a'], ['b'], timeout));

  t.end();
});