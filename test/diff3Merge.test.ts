import { describe, it } from 'bun:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../src/diff3.ts';


describe('diff3Merge', () => {

  it('performs diff3 merge on arrays', () => {
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

    assert.deepEqual(result, [
      { ok: ['AA'] },
      { conflict: { a: ['a', 'b', 'c'], aIndex: 1, o: [], oIndex: 1, b: ['a', 'd', 'c'], bIndex: 1 } },
      { ok: ['ZZ'] },
      { conflict: { a: ['new', '00', 'a', 'a'], aIndex: 5, o: ['00'], oIndex: 2, b: ['11'], bIndex: 5 } },
      { ok: ['M', 'z', 'z', '99'] }
    ]);
  });


  it('strings split on whitespace by default to avoid surprises - issue #9', () => {
    const o = 'was touring';
    const a = 'was here   touring';
    const b = 'was into touring';
    const result = Diff3.diff3Merge(a, o, b);

    assert.deepEqual(result, [
      { ok: ['was'] },
      { conflict: { a: ['here'], aIndex: 1, o: [], oIndex: 1, b: ['into'], bIndex: 1 } },
      { ok: ['touring'] }
    ]);
  });

  it('strings can optionally split on given separator', () => {
    const o = 'new hampshire, new mexico, north carolina';
    const a = 'new hampshire, new jersey,    north carolina';
    const b = 'new hampshire, new york, north carolina';
    const result = Diff3.diff3Merge(a, o, b, { stringSeparator: /,\s+/ });

    assert.deepEqual(result, [
      { ok: ['new hampshire'] },
      { conflict: { a: ['new jersey'], aIndex: 1, o: ['new mexico'], oIndex: 1, b: ['new york'], bIndex: 1 } },
      { ok: ['north carolina'] }
    ]);
  });


  it('excludes false conflicts by default', () => {
    const o = 'AA ZZ';
    const a = 'AA a b c ZZ';
    const b = 'AA a b c ZZ';
    const result = Diff3.diff3Merge(a, o, b);

    assert.deepEqual(result, [
      { ok: ['AA', 'a', 'b', 'c', 'ZZ'] }
    ]);
  });


  it('can include false conflicts with option', () => {
    const o = 'AA ZZ';
    const a = 'AA a b c ZZ';
    const b = 'AA a b c ZZ';
    const result = Diff3.diff3Merge(a, o, b, { excludeFalseConflicts: false });

    assert.deepEqual(result, [
      { ok: ['AA'] },
      { conflict: { a: ['a', 'b', 'c'], aIndex: 1, o: [], oIndex: 1, b: ['a', 'b', 'c'], bIndex: 1 } },
      { ok: ['ZZ'] }
    ]);
  });


  it('avoids improper hunk sorting - see openstreetmap/iD#3058', () => {
    const o = ['n4100522632', 'n4100697091', 'n4100697136', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4102677890', 'n4094374176'];
    const a = ['n4100522632', 'n4100697091', 'n4100697136', 'n-10000', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4102677890', 'n4094374176'];
    const b = ['n4100522632', 'n4100697091', 'n4100697136', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4105613618', 'n4102677890', 'n4105613617', 'n4094374176'];
    const expected = ['n4100522632', 'n4100697091', 'n4100697136', 'n-10000', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4105613618', 'n4102677890', 'n4105613617', 'n4094374176'];
    const result = Diff3.diff3Merge(a, o, b);

    assert.deepEqual(result, [
      { ok: expected }
    ]);
  });


  it('yaml comparison - issue #46', () => {
    const o = `title: "title"
description: "description"`;
    const a = `title: "title"
description: "description changed"`;
    const b = `title: "title changed"
description: "description"`;
    const result = Diff3.diff3Merge(a, o, b, { stringSeparator: /[\r\n]+/ });

    assert.deepEqual(result, [
      {
        conflict: {
          a: ['title: "title"', 'description: "description changed"'], aIndex: 0,
          o: ['title: "title"', 'description: "description"'], oIndex: 0,
          b: ['title: "title changed"', 'description: "description"'], bIndex: 0
        }
      }
    ]);
  });


  it('compares objects by identity', () => {
    // Regression: objects used to all match each other, so `b`'s change was lost
    const x = { x: 1 };
    const y = { y: 2 };
    const z = { z: 3 };
    const result = Diff3.diff3Merge<object>([x, y], [x], [z]);

    assert.deepEqual(result.length, 1);
    const conflict = result[0]?.conflict;
    assert.equal(conflict?.a[0], x);
    assert.equal(conflict?.a[1], y);
    assert.equal(conflict?.o[0], x);
    assert.equal(conflict?.b[0], z);
  });


  it('handles very large inputs', () => {
    // Copying a large region with `push(...items)` used to overflow the call stack
    const o = Array.from({ length: 1000000 }, (_, i) => `line ${i}`);
    const a = o.slice();
    const b = o.slice();
    b[999000] = 'changed';
    const result = Diff3.diff3Merge(a, o, b);

    assert.deepEqual(result, [
      { ok: b }
    ]);
  });
});
