import { test } from 'tap';
import * as Diff3 from '../index.mjs';
import { testTimeout } from './timeout.js';

test('diff3MergeRegions', t => {

  t.test('returns results of 3-way diff from o,a,b arrays', t => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diff3MergeRegions(a, o, b);

    t.same(result[0].stable, true);
    t.same(result[0].buffer, 'o');
    t.same(result[0].bufferStart, 0);
    t.same(result[0].bufferLength, 1);
    t.same(result[0].bufferContent, ['AA']);

    t.same(result[1].stable, false);
    t.same(result[1].aStart, 1);
    t.same(result[1].aLength, 3);
    t.same(result[1].aContent, ['a', 'b', 'c']);
    t.same(result[1].oStart, 1);
    t.same(result[1].oLength, 0);
    t.same(result[1].oContent, []);
    t.same(result[1].bStart, 1);
    t.same(result[1].bLength, 3);
    t.same(result[1].bContent, ['a', 'd', 'c']);

    t.same(result[2].stable, true);
    t.same(result[2].buffer, 'o');
    t.same(result[2].bufferStart, 1);
    t.same(result[2].bufferLength, 1);
    t.same(result[2].bufferContent, ['ZZ']);

    t.same(result[3].stable, false);
    t.same(result[3].aStart, 5);
    t.same(result[3].aLength, 4);
    t.same(result[3].aContent, ['new', '00', 'a', 'a']);
    t.same(result[3].oStart, 2);
    t.same(result[3].oLength, 1);
    t.same(result[3].oContent, ['00']);
    t.same(result[3].bStart, 5);
    t.same(result[3].bLength, 1);
    t.same(result[3].bContent, ['11']);

    t.same(result[4].stable, true);
    t.same(result[4].buffer, 'o');
    t.same(result[4].bufferStart, 3);
    t.same(result[4].bufferLength, 1);
    t.same(result[4].bufferContent, ['M']);

    t.same(result[5].stable, true);
    t.same(result[5].buffer, 'b');
    t.same(result[5].bufferStart, 7);
    t.same(result[5].bufferLength, 2);
    t.same(result[5].bufferContent, ['z', 'z']);

    t.same(result[6].stable, true);
    t.same(result[6].buffer, 'o');
    t.same(result[6].bufferStart, 4);
    t.same(result[6].bufferLength, 1);
    t.same(result[6].bufferContent, ['99']);

    t.end();
  });

  testTimeout(t, timeout => Diff3.diff3MergeRegions(['a'], ['o'], ['b'], timeout));

  t.end();
});
