import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../index.mjs';

test('mergeDigIn', async t => {

  await t.test('returns conflict: false if no conflicts', t => {
    const o = ['AA'];
    const a = ['AA'];
    const b = ['AA'];
    const expected = ['AA'];

    const r = Diff3.mergeDigIn(a, o, b);
    assert.equal(r.conflict, false);
    assert.deepEqual(r.result, expected);
  });


  await t.test('returns a digin-style merge result', t => {
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
    assert.equal(r.conflict, true);
    assert.deepEqual(r.result, expected);
  });

});
