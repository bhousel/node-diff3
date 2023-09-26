import { test } from 'tap';
import * as Diff3 from '../index.mjs';
import { testTimeout } from './timeout.js';

test('diff3Merge', t => {

  t.test('performs diff3 merge on arrays', t => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.diff3Merge(a, o, b);

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

    t.same(result[0].ok, ['AA']);
    t.same(result[0].conflict, undefined);

    t.same(result[1].ok, undefined);
    t.same(result[1].conflict.o, []);
    t.same(result[1].conflict.a, ['a', 'b', 'c']);
    t.same(result[1].conflict.b, ['a', 'd', 'c']);

    t.same(result[2].ok, ['ZZ']);
    t.same(result[2].conflict, undefined);

    t.same(result[3].ok, undefined);
    t.same(result[3].conflict.o, ['00']);
    t.same(result[3].conflict.a, ['new', '00', 'a', 'a']);
    t.same(result[3].conflict.b, ['11']);

    t.same(result[4].ok, ['M', 'z', 'z', '99']);
    t.same(result[4].conflict, undefined);

    t.end();
  });


  t.test('strings split on whitespace by default to avoid surprises - issue #9', t => {
    const o = 'was touring';
    const a = 'was here   touring';
    const b = 'was into touring';
    const result = Diff3.diff3Merge(a, o, b);

    t.same(result[0].ok, ['was']);
    t.same(result[0].conflict, undefined);

    t.same(result[1].ok, undefined);
    t.same(result[1].conflict.o, []);
    t.same(result[1].conflict.a, ['here']);
    t.same(result[1].conflict.b, ['into']);

    t.same(result[2].ok, ['touring']);
    t.same(result[2].conflict, undefined);

    t.end();
  });

  t.test('strings can optionally split on given separator', t => {
    const o = 'new hampshire, new mexico, north carolina';
    const a = 'new hampshire, new jersey,    north carolina';
    const b = 'new hampshire, new york, north carolina';
    const result = Diff3.diff3Merge(a, o, b, { stringSeparator: /,\s+/ });

    t.same(result[0].ok, ['new hampshire']);
    t.same(result[0].conflict, undefined);

    t.same(result[1].ok, undefined);
    t.same(result[1].conflict.o, ['new mexico']);
    t.same(result[1].conflict.a, ['new jersey']);
    t.same(result[1].conflict.b, ['new york']);

    t.same(result[2].ok, ['north carolina']);
    t.same(result[2].conflict, undefined);

    t.end();
  });


  t.test('excludes false conflicts by default', t => {
    const o = 'AA ZZ';
    const a = 'AA a b c ZZ';
    const b = 'AA a b c ZZ';
    const result = Diff3.diff3Merge(a, o, b);

    t.same(result[0].ok, ['AA', 'a', 'b', 'c', 'ZZ']);
    t.same(result[0].conflict, undefined);
    t.end();
  });


  t.test('can include false conflicts with option', t => {
    const o = 'AA ZZ';
    const a = 'AA a b c ZZ';
    const b = 'AA a b c ZZ';
    const result = Diff3.diff3Merge(a, o, b, { excludeFalseConflicts: false });

    t.same(result[0].ok, ['AA']);
    t.same(result[0].conflict, undefined);

    t.same(result[1].ok, undefined);
    t.same(result[1].conflict.o, []);
    t.same(result[1].conflict.a, ['a', 'b', 'c']);
    t.same(result[1].conflict.b, ['a', 'b', 'c']);

    t.same(result[2].ok, ['ZZ']);
    t.same(result[2].conflict, undefined);
    t.end();
  });


  t.test('avoids improper hunk sorting - see openstreetmap/iD#3058', t => {
    const o = ['n4100522632', 'n4100697091', 'n4100697136', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4102677890', 'n4094374176'];
    const a = ['n4100522632', 'n4100697091', 'n4100697136', 'n-10000', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4102677890', 'n4094374176'];
    const b = ['n4100522632', 'n4100697091', 'n4100697136', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4105613618', 'n4102677890', 'n4105613617', 'n4094374176'];
    const expected = ['n4100522632', 'n4100697091', 'n4100697136', 'n-10000', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4105613618', 'n4102677890', 'n4105613617', 'n4094374176'];
    const result = Diff3.diff3Merge(a, o, b);

    t.same(result[0].ok, expected);
    t.end();
  });


  t.test('yaml comparison - issue #46', t => {
    const o = `title: "title"
description: "description"`;
    const a = `title: "title"
description: "description changed"`;
    const b = `title: "title changed"
description: "description"`;
    const result = Diff3.diff3Merge(a, o, b, { stringSeparator: /[\r\n]+/ });

    t.same(result[0].ok, undefined);
    t.same(result[0].conflict.o, ['title: "title"', 'description: "description"']);
    t.same(result[0].conflict.a, ['title: "title"', 'description: "description changed"']);
    t.same(result[0].conflict.b, ['title: "title changed"', 'description: "description"']);
    t.end();
  });

  testTimeout(t, timeout => Diff3.diff3Merge(['a'], ['o'], ['b'], undefined, timeout));

  t.end();
});
