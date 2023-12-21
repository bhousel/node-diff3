import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as Diff3 from '../index.mjs';

const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
const a0 = a;
const b0 = b;

test('diffPatch', async t => {
  await t.test('returns a patch-style diff of two arrays', t => {
    const result = Diff3.diffPatch(a, b);

    assert.deepEqual(result[0].buffer1.offset, 2);
    assert.deepEqual(result[0].buffer1.length, 1);
    assert.deepEqual(result[0].buffer1.chunk, ['b']);
    assert.deepEqual(result[0].buffer2.offset, 2);
    assert.deepEqual(result[0].buffer2.length, 1);
    assert.deepEqual(result[0].buffer2.chunk, ['d']);

    assert.deepEqual(result[1].buffer1.offset, 5);
    assert.deepEqual(result[1].buffer1.length, 4);
    assert.deepEqual(result[1].buffer1.chunk, ['new', '00', 'a', 'a']);
    assert.deepEqual(result[1].buffer2.offset, 5);
    assert.deepEqual(result[1].buffer2.length, 1);
    assert.deepEqual(result[1].buffer2.chunk, ['11']);

    assert.deepEqual(result[2].buffer1.offset, 10);
    assert.deepEqual(result[2].buffer1.length, 0);
    assert.deepEqual(result[2].buffer1.chunk, []);
    assert.deepEqual(result[2].buffer2.offset, 7);
    assert.deepEqual(result[2].buffer2.length, 2);
    assert.deepEqual(result[2].buffer2.chunk, ['z', 'z']);
  });

  await t.test('did not modify buffer1 or buffer2', t => {
    assert.equal(a0, a);
    assert.equal(b0, b);
  });
});


test('patch', async t => {
  await t.test('applies a patch against buffer1 to get buffer2', t => {
    const patch = Diff3.diffPatch(a, b);
    const result = Diff3.patch(a, patch);
    assert.deepEqual(result, b);
  });

  await t.test('did not modify buffer1 or buffer2', t => {
    assert.equal(a0, a);
    assert.equal(b0, b);
  });
});


test('stripPatch', async t => {
  const patch = Diff3.diffPatch(a, b);
  const strip = Diff3.stripPatch(patch);

  await t.test('removes extra information from the diffPatch result', t => {
    assert.deepEqual(strip[0].buffer1.offset, 2);
    assert.deepEqual(strip[0].buffer1.length, 1);
    assert.deepEqual(strip[0].buffer1.chunk, undefined);
    assert.deepEqual(strip[0].buffer2.offset, undefined);
    assert.deepEqual(strip[0].buffer2.length, undefined);
    assert.deepEqual(strip[0].buffer2.chunk, ['d']);

    assert.deepEqual(strip[1].buffer1.offset, 5);
    assert.deepEqual(strip[1].buffer1.length, 4);
    assert.deepEqual(strip[1].buffer1.chunk, undefined);
    assert.deepEqual(strip[1].buffer2.offset, undefined);
    assert.deepEqual(strip[1].buffer2.length, undefined);
    assert.deepEqual(strip[1].buffer2.chunk, ['11']);

    assert.deepEqual(strip[2].buffer1.offset, 10);
    assert.deepEqual(strip[2].buffer1.length, 0);
    assert.deepEqual(strip[2].buffer1.chunk, undefined);
    assert.deepEqual(strip[2].buffer2.offset, undefined);
    assert.deepEqual(strip[2].buffer2.length, undefined);
    assert.deepEqual(strip[2].buffer2.chunk, ['z', 'z']);
  });

  await t.test('applies a stripped patch against buffer1 to get buffer2', t => {
    const result = Diff3.patch(a, strip);
    assert.deepEqual(result, b);
  });

  await t.test('did not modify the original patch', t => {
    assert.notEqual(patch, strip);
    assert.notEqual(patch[0], strip[0]);
    assert.notEqual(patch[1], strip[1]);
    assert.notEqual(patch[2], strip[2]);
  });

});


test('invertPatch', async t => {
  const patch = Diff3.diffPatch(a, b);
  const invert = Diff3.invertPatch(patch);

  await t.test('inverts the diffPatch result', t => {
    assert.deepEqual(invert[0].buffer2.offset, 2);
    assert.deepEqual(invert[0].buffer2.length, 1);
    assert.deepEqual(invert[0].buffer2.chunk, ['b']);
    assert.deepEqual(invert[0].buffer1.offset, 2);
    assert.deepEqual(invert[0].buffer1.length, 1);
    assert.deepEqual(invert[0].buffer1.chunk, ['d']);

    assert.deepEqual(invert[1].buffer2.offset, 5);
    assert.deepEqual(invert[1].buffer2.length, 4);
    assert.deepEqual(invert[1].buffer2.chunk, ['new', '00', 'a', 'a']);
    assert.deepEqual(invert[1].buffer1.offset, 5);
    assert.deepEqual(invert[1].buffer1.length, 1);
    assert.deepEqual(invert[1].buffer1.chunk, ['11']);

    assert.deepEqual(invert[2].buffer2.offset, 10);
    assert.deepEqual(invert[2].buffer2.length, 0);
    assert.deepEqual(invert[2].buffer2.chunk, []);
    assert.deepEqual(invert[2].buffer1.offset, 7);
    assert.deepEqual(invert[2].buffer1.length, 2);
    assert.deepEqual(invert[2].buffer1.chunk, ['z', 'z']);
  });

  await t.test('applies an inverted patch against buffer2 to get buffer1', t => {
    const result = Diff3.patch(b, invert);
    assert.deepEqual(result, a);
  });

  await t.test('did not modify the original patch', t => {
    assert.notEqual(patch, invert);
    assert.notEqual(patch[0], invert[0]);
    assert.notEqual(patch[1], invert[1]);
    assert.notEqual(patch[2], invert[2]);
  });

});