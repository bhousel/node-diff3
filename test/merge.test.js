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
      '\n<<<<<<<<<\n',
      'a',
      'b',
      'c',
      '\n=========\n',
      'a',
      'd',
      'c',
      '\n>>>>>>>>>\n',
      'ZZ',
      '\n<<<<<<<<<\n',
      'new',
      '00',
      'a',
      'a',
      '\n=========\n',
      '11',
      '\n>>>>>>>>>\n',
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
      '\n<<<<<<<<<\n',
      'title: "title"',
      'description: "description changed"',
      '\n=========\n',
      'title: "title changed"',
      'description: "description"',
      '\n>>>>>>>>>\n'
    ];

    const r = Diff3.merge(a, o, b, { stringSeparator: /[\r\n]+/ });
    t.ok(r.conflict);
    t.same(r.result, expected);
    t.end();
  });

  t.end();
});
