import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../index.mjs';

test('diff3MergeRegions', async t => {

  await t.test('returns results of 3-way diff from o,a,b arrays', t => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diff3MergeRegions(a, o, b);

    assert.deepEqual(result[0].stable, true);
    assert.deepEqual(result[0].buffer, 'o');
    assert.deepEqual(result[0].bufferStart, 0);
    assert.deepEqual(result[0].bufferLength, 1);
    assert.deepEqual(result[0].bufferContent, ['AA']);

    assert.deepEqual(result[1].stable, false);
    assert.deepEqual(result[1].aStart, 1);
    assert.deepEqual(result[1].aLength, 3);
    assert.deepEqual(result[1].aContent, ['a', 'b', 'c']);
    assert.deepEqual(result[1].oStart, 1);
    assert.deepEqual(result[1].oLength, 0);
    assert.deepEqual(result[1].oContent, []);
    assert.deepEqual(result[1].bStart, 1);
    assert.deepEqual(result[1].bLength, 3);
    assert.deepEqual(result[1].bContent, ['a', 'd', 'c']);

    assert.deepEqual(result[2].stable, true);
    assert.deepEqual(result[2].buffer, 'o');
    assert.deepEqual(result[2].bufferStart, 1);
    assert.deepEqual(result[2].bufferLength, 1);
    assert.deepEqual(result[2].bufferContent, ['ZZ']);

    assert.deepEqual(result[3].stable, false);
    assert.deepEqual(result[3].aStart, 5);
    assert.deepEqual(result[3].aLength, 4);
    assert.deepEqual(result[3].aContent, ['new', '00', 'a', 'a']);
    assert.deepEqual(result[3].oStart, 2);
    assert.deepEqual(result[3].oLength, 1);
    assert.deepEqual(result[3].oContent, ['00']);
    assert.deepEqual(result[3].bStart, 5);
    assert.deepEqual(result[3].bLength, 1);
    assert.deepEqual(result[3].bContent, ['11']);

    assert.deepEqual(result[4].stable, true);
    assert.deepEqual(result[4].buffer, 'o');
    assert.deepEqual(result[4].bufferStart, 3);
    assert.deepEqual(result[4].bufferLength, 1);
    assert.deepEqual(result[4].bufferContent, ['M']);

    assert.deepEqual(result[5].stable, true);
    assert.deepEqual(result[5].buffer, 'b');
    assert.deepEqual(result[5].bufferStart, 7);
    assert.deepEqual(result[5].bufferLength, 2);
    assert.deepEqual(result[5].bufferContent, ['z', 'z']);

    assert.deepEqual(result[6].stable, true);
    assert.deepEqual(result[6].buffer, 'o');
    assert.deepEqual(result[6].bufferStart, 4);
    assert.deepEqual(result[6].bufferLength, 1);
    assert.deepEqual(result[6].bufferContent, ['99']);
  });

});
