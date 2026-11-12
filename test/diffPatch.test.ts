import { describe, it } from 'bun:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../src/diff3.ts';

const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
const a0 = a;
const b0 = b;


describe('diffPatch', () => {
  it('returns a patch-style diff of two arrays', () => {
    const result = Diff3.diffPatch(a, b);

    assert.deepEqual(result, [
      {
        buffer1: { offset: 2, length: 1, chunk: ['b'] },
        buffer2: { offset: 2, length: 1, chunk: ['d'] }
      },
      {
        buffer1: { offset: 5, length: 4, chunk: ['new', '00', 'a', 'a'] },
        buffer2: { offset: 5, length: 1, chunk: ['11'] }
      },
      {
        buffer1: { offset: 10, length: 0, chunk: [] },
        buffer2: { offset: 7, length: 2, chunk: ['z', 'z'] }
      }
    ]);
  });

  it('did not modify buffer1 or buffer2', () => {
    assert.equal(a0, a);
    assert.equal(b0, b);
  });
});


describe('patch', () => {
  it('applies a patch against buffer1 to get buffer2', () => {
    const patch = Diff3.diffPatch(a, b);
    const result = Diff3.patch(a, patch);
    assert.deepEqual(result, b);
  });

  it('did not modify buffer1 or buffer2', () => {
    assert.equal(a0, a);
    assert.equal(b0, b);
  });
});


describe('stripPatch', () => {
  const patch = Diff3.diffPatch(a, b);
  const strip = Diff3.stripPatch(patch);

  it('removes extra information from the diffPatch result', () => {
    assert.deepEqual(strip, [
      { buffer1: { offset: 2, length: 1 }, buffer2: { chunk: ['d'] } },
      { buffer1: { offset: 5, length: 4 }, buffer2: { chunk: ['11'] } },
      { buffer1: { offset: 10, length: 0 }, buffer2: { chunk: ['z', 'z'] } }
    ]);
  });

  it('applies a stripped patch against buffer1 to get buffer2', () => {
    const result = Diff3.patch(a, strip);
    assert.deepEqual(result, b);
  });

  it('did not modify the original patch', () => {
    assert.notEqual(patch, strip);
    assert.notEqual(patch[0], strip[0]);
    assert.notEqual(patch[1], strip[1]);
    assert.notEqual(patch[2], strip[2]);
  });

});


describe('invertPatch', () => {
  const patch = Diff3.diffPatch(a, b);
  const invert = Diff3.invertPatch(patch);

  it('inverts the diffPatch result', () => {
    assert.deepEqual(invert, [
      {
        buffer1: { offset: 2, length: 1, chunk: ['d'] },
        buffer2: { offset: 2, length: 1, chunk: ['b'] }
      },
      {
        buffer1: { offset: 5, length: 1, chunk: ['11'] },
        buffer2: { offset: 5, length: 4, chunk: ['new', '00', 'a', 'a'] }
      },
      {
        buffer1: { offset: 7, length: 2, chunk: ['z', 'z'] },
        buffer2: { offset: 10, length: 0, chunk: [] }
      }
    ]);
  });

  it('applies an inverted patch against buffer2 to get buffer1', () => {
    const result = Diff3.patch(b, invert);
    assert.deepEqual(result, a);
  });

  it('did not modify the original patch', () => {
    assert.notEqual(patch, invert);
    assert.notEqual(patch[0], invert[0]);
    assert.notEqual(patch[1], invert[1]);
    assert.notEqual(patch[2], invert[2]);
  });

});
