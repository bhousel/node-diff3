import { test } from 'tap';
import * as Diff3 from '../index.mjs';

test('merge', t => {

  t.test('returns conflict: false if no conflicts', t => {
    const o = ['AA'];
    const a = ['AA'];
    const b = ['AA'];
    const expected = ['AA'];

    const r = Diff3.merge(a, o, b);
    t.notOk(r.conflict);
    t.same(r.result, expected);
    t.end();
  });


  t.test('returns a diff3-style merge result', t => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const expected = [
      'AA',
      '<<<<<<<',
      'a',
      'b',
      'c',
      '=======',
      'a',
      'd',
      'c',
      '>>>>>>>',
      'ZZ',
      '<<<<<<<',
      'new',
      '00',
      'a',
      'a',
      '=======',
      '11',
      '>>>>>>>',
      'M',
      'z',
      'z',
      '99'
    ];

    const r = Diff3.merge(a, o, b);
    t.ok(r.conflict);
    t.same(r.result, expected);
    t.end();
  });


  t.test('yaml comparison - issue #46', t => {
    const o = `title: "title"
description: "description"`;
    const a = `title: "title"
description: "description changed"`;
    const b = `title: "title changed"
description: "description"`;
    const expected = [
      '<<<<<<<',
      'title: "title"',
      'description: "description changed"',
      '=======',
      'title: "title changed"',
      'description: "description"',
      '>>>>>>>'
    ];

    const r = Diff3.merge(a, o, b, { stringSeparator: /[\r\n]+/ });
    t.ok(r.conflict);
    t.same(r.result, expected);
    t.end();
  });

  t.test('with timeout', t => {
    const o = ''.padEnd(1024 * 1024 * 10, 'o  ');
    const a = ''.padEnd(1024 * 1024 * 10, 'a  ');
    const b = ''.padEnd(1024 * 1024 * 10, 'b  ');
    t.throws(() => Diff3.merge(a, o, b, { msTimeout: 1000 }), new Diff3.TimeoutError());
    t.doesNotThrow(() => Diff3.merge(
      a.slice(0, 1024),
      o.slice(0, 1024),
      b.slice(0, 1024),
      { msTimeout: 1000 }
    ));
    t.end();
  });

  t.end();
});
