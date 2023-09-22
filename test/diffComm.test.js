import { test } from 'tap';
import * as Diff3 from '../index.mjs';
import { testTimeout } from './timeout.js';

test('diffComm', t => {

  t.test('returns a comm-style diff of two arrays', t => {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diffComm(a, b);

    t.same(result[0].common, ['AA', 'a']);
    t.same(result[0].buffer1, undefined);
    t.same(result[0].buffer2, undefined);

    t.same(result[1].common, undefined);
    t.same(result[1].buffer1, ['b']);
    t.same(result[1].buffer2, ['d']);

    t.same(result[2].common, ['c', 'ZZ']);
    t.same(result[2].buffer1, undefined);
    t.same(result[2].buffer2, undefined);

    t.same(result[3].common, undefined);
    t.same(result[3].buffer1, ['new', '00', 'a', 'a']);
    t.same(result[3].buffer2, ['11']);

    t.same(result[4].common, ['M']);
    t.same(result[4].buffer1, undefined);
    t.same(result[4].buffer2, undefined);

    t.same(result[5].common, undefined);
    t.same(result[5].buffer1, []);
    t.same(result[5].buffer2, ['z', 'z']);

    t.same(result[6].common, ['99']);
    t.same(result[6].buffer1, undefined);
    t.same(result[6].buffer2, undefined);

    t.end();
  });

  testTimeout(t, timeout => Diff3.diffComm(['a'], ['b'], timeout));

  t.end();
});