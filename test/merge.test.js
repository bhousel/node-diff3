import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../index.mjs';

test('merge', async t => {

  await t.test('returns conflict: false if no conflicts', t => {
    const o = ['AA'];
    const a = ['AA'];
    const b = ['AA'];
    const expected = ['AA'];

    const r = Diff3.merge(a, o, b);
    assert.equal(r.conflict, false);
    assert.deepEqual(r.result, expected);
  });


  await t.test('returns a diff3-style merge result', t => {
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
    assert.equal(r.conflict, true);
    assert.deepEqual(r.result, expected);
  });


  await t.test('yaml comparison - issue #46', t => {
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
    assert.equal(r.conflict, true);
    assert.deepEqual(r.result, expected);
  });

});
