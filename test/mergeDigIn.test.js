import { test } from 'tap';
import * as Diff3 from '../index.mjs';

test('mergeDigIn', t => {

  t.test('returns conflict: false if no conflicts', t => {
    const o = ['AA'];
    const a = ['AA'];
    const b = ['AA'];
    const expected = ['AA'];

    const r = Diff3.mergeDigIn(a, o, b);
    t.notOk(r.conflict);
    t.same(r.result, expected);
    t.end();
  });


  t.test('returns a digin-style merge result', t => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const expected = [
      'AA',
      'a',
      '<<<<<<<',
      'b',
      '=======',
      'd',
      '>>>>>>>',
      'c',
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

    const r = Diff3.mergeDigIn(a, o, b);
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
      t.throws(() => Diff3.mergeDigIn(a, o, b, { timeout: 1000 }), new Diff3.TimeoutError());
      t.end();
    });

    t.test('should not throw', t => {
      Date.now = () =>  0;
      t.doesNotThrow(() => Diff3.mergeDigIn(a, o, b, { timeout: 1000 }));
      t.end();
    });

    t.end();
  });

  t.end();
});
