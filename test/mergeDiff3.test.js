import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as Diff3 from '../src/diff3.mjs';


describe('mergeDiff3', () => {

  it('returns conflict: false if no conflicts', () => {
    const o = ['AA'];
    const a = ['AA'];
    const b = ['AA'];
    const expected = ['AA'];

    const r = Diff3.mergeDiff3(a, o, b);
    assert.equal(r.conflict, false);
    assert.deepEqual(r.result, expected);
  });


  it('performs merge diff3 on arrays', () => {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const expected = [
      'AA',
      '<<<<<<< a',
      'a',
      'b',
      'c',
      '||||||| o',
      '=======',
      'a',
      'd',
      'c',
      '>>>>>>> b',
      'ZZ',
      '<<<<<<< a',
      'new',
      '00',
      'a',
      'a',
      '||||||| o',
      '00',
      '=======',
      '11',
      '>>>>>>> b',
      'M',
      'z',
      'z',
      '99'
    ];

    const r = Diff3.mergeDiff3(a, o, b, { label: { a: 'a', o: 'o', b: 'b' } });
    assert.equal(r.conflict, true);
    assert.deepEqual(r.result, expected);
  });


  it('yaml comparison - issue #46', () => {
    const o = `title: "title"
description: "description"`;
    const a = `title: "title"
description: "description changed"`;
    const b = `title: "title changed"
description: "description"`;
    const expected = [
      '<<<<<<< a',
      'title: "title"',
      'description: "description changed"',
      '||||||| o',
      'title: "title"',
      'description: "description"',
      '=======',
      'title: "title changed"',
      'description: "description"',
      '>>>>>>> b'
    ];

    const r = Diff3.mergeDiff3(a, o, b, { label: { a: 'a', o: 'o', b: 'b' }, stringSeparator: /[\r\n]+/ });
    assert.equal(r.conflict, true);
    assert.deepEqual(r.result, expected);
  });

});
