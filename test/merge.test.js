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
    let originalDateNow;
    t.before(() => { originalDateNow = Date.now; });
    t.afterEach(() => { Date.now = originalDateNow; });

    const o = ''.padEnd(1024, 'o  ');
    const a = ''.padEnd(1024, 'a  ');
    const b = ''.padEnd(1024, 'b  ');

    t.test('should throw', t => {
      let time = 0;
      Date.now = () =>  {
        const res = time;
        time += 1001;
        return res;
      };
      t.throws(() => Diff3.merge(a, o, b, { timeout: 1000 }), new Diff3.TimeoutError());
      t.end();
    });

    t.test('should not throw', t => {
      Date.now = () =>  0;
      t.doesNotThrow(() => Diff3.merge(a, o, b, { timeout: 1000 }));
      t.end();
    });

    t.end();
  });

  t.end();
});
