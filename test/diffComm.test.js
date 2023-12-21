import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../index.mjs';

test('diffComm', async t => {

  await t.test('returns a comm-style diff of two arrays', t => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diffComm(a, b);

    assert.deepEqual(result[0].common, ['AA', 'a']);
    assert.deepEqual(result[0].buffer1, undefined);
    assert.deepEqual(result[0].buffer2, undefined);

    assert.deepEqual(result[1].common, undefined);
    assert.deepEqual(result[1].buffer1, ['b']);
    assert.deepEqual(result[1].buffer2, ['d']);

    assert.deepEqual(result[2].common, ['c', 'ZZ']);
    assert.deepEqual(result[2].buffer1, undefined);
    assert.deepEqual(result[2].buffer2, undefined);

    assert.deepEqual(result[3].common, undefined);
    assert.deepEqual(result[3].buffer1, ['new', '00', 'a', 'a']);
    assert.deepEqual(result[3].buffer2, ['11']);

    assert.deepEqual(result[4].common, ['M']);
    assert.deepEqual(result[4].buffer1, undefined);
    assert.deepEqual(result[4].buffer2, undefined);

    assert.deepEqual(result[5].common, undefined);
    assert.deepEqual(result[5].buffer1, []);
    assert.deepEqual(result[5].buffer2, ['z', 'z']);

    assert.deepEqual(result[6].common, ['99']);
    assert.deepEqual(result[6].buffer1, undefined);
    assert.deepEqual(result[6].buffer2, undefined);
  });

});