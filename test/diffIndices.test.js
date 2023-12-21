import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../index.mjs';

test('diffIndices', async t => {

  await t.test('returns array indices for differing regions of two arrays', t => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diffIndices(a, b);

    assert.deepEqual(result[0].buffer1, [2, 1]);
    assert.deepEqual(result[0].buffer1Content, ['b']);
    assert.deepEqual(result[0].buffer2, [2, 1]);
    assert.deepEqual(result[0].buffer2Content, ['d']);

    assert.deepEqual(result[1].buffer1, [5, 4]);
    assert.deepEqual(result[1].buffer1Content, ['new', '00', 'a', 'a']);
    assert.deepEqual(result[1].buffer2, [5, 1]);
    assert.deepEqual(result[1].buffer2Content, ['11']);

    assert.deepEqual(result[2].buffer1, [10, 0]);
    assert.deepEqual(result[2].buffer1Content, []);
    assert.deepEqual(result[2].buffer2, [7, 2]);
    assert.deepEqual(result[2].buffer2Content, ['z', 'z']);
  });

});