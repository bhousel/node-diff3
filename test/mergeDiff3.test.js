import { test } from 'tap';
import * as Diff3 from '../index.mjs';

test('mergeDiff3', t => {

  t.test('performs merge diff3 on arrays', t => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.mergeDiff3(a, o, b, { label: { a: 'a', o: 'o', b: 'b' } });

    /*
    AA
    <<<<<<< a
    a
    b
    c
    ||||||| o
    =======
    a
    d
    c
    >>>>>>> b
    ZZ
    <<<<<<< a
    new
    00
    a
    a
    ||||||| o
    00
    =======
    11
    >>>>>>> b
    M
    z
    z
    99
    */

    t.same(result.conflict, true);
    t.same(result.result[0], 'AA');
    t.same(result.result[1], '<<<<<<< a');
    t.same(result.result[2], 'a');
    t.same(result.result[3], 'b');
    t.same(result.result[4], 'c');
    t.same(result.result[5], '||||||| o');
    t.same(result.result[6], '=======');
    t.same(result.result[7], 'a');
    t.same(result.result[8], 'd');
    t.same(result.result[9], 'c');
    t.same(result.result[10], '>>>>>>> b');
    t.same(result.result[11], 'ZZ');
    t.same(result.result[12], '<<<<<<< a');
    t.same(result.result[13], 'new');
    t.same(result.result[14], '00');
    t.same(result.result[15], 'a');
    t.same(result.result[16], 'a');
    t.same(result.result[17], '||||||| o');
    t.same(result.result[18], '00');
    t.same(result.result[19], '=======');
    t.same(result.result[20], '11');
    t.same(result.result[21], '>>>>>>> b');
    t.same(result.result[22], 'M');
    t.same(result.result[23], 'z');
    t.same(result.result[24], 'z');
    t.same(result.result[25], '99');

    t.end();
  });

  t.end();
});
