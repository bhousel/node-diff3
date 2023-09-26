import { test } from 'tap';
import * as Diff3 from '../index.mjs';
import { testTimeout } from './timeout.js';

const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
const a0 = a;
const b0 = b;

test('diffPatch', t => {
  t.test('returns a patch-style diff of two arrays', t => {
    const result = Diff3.diffPatch(a, b);

    t.same(result[0].buffer1.offset, 2);
    t.same(result[0].buffer1.length, 1);
    t.same(result[0].buffer1.chunk, ['b']);
    t.same(result[0].buffer2.offset, 2);
    t.same(result[0].buffer2.length, 1);
    t.same(result[0].buffer2.chunk, ['d']);

    t.same(result[1].buffer1.offset, 5);
    t.same(result[1].buffer1.length, 4);
    t.same(result[1].buffer1.chunk, ['new', '00', 'a', 'a']);
    t.same(result[1].buffer2.offset, 5);
    t.same(result[1].buffer2.length, 1);
    t.same(result[1].buffer2.chunk, ['11']);

    t.same(result[2].buffer1.offset, 10);
    t.same(result[2].buffer1.length, 0);
    t.same(result[2].buffer1.chunk, []);
    t.same(result[2].buffer2.offset, 7);
    t.same(result[2].buffer2.length, 2);
    t.same(result[2].buffer2.chunk, ['z', 'z']);

    t.end();
  });

  t.test('did not modify buffer1 or buffer2', t => {
    t.strictSame(a0, a);
    t.strictSame(b0, b);
    t.end();
  });
  
  testTimeout(t, timeout => Diff3.diffPatch(a, b, timeout));
  
  t.end();
});


test('patch', t => {
  t.test('applies a patch against buffer1 to get buffer2', t => {
    const patch = Diff3.diffPatch(a, b);
    const result = Diff3.patch(a, patch);
    t.same(result, b);
    t.end();
  });

  t.test('did not modify buffer1 or buffer2', t => {
    t.strictSame(a0, a);
    t.strictSame(b0, b);
    t.end();
  });

  t.end();
});


test('stripPatch', t => {
  const patch = Diff3.diffPatch(a, b);
  const strip = Diff3.stripPatch(patch);

  t.test('removes extra information from the diffPatch result', t => {
    t.same(strip[0].buffer1.offset, 2);
    t.same(strip[0].buffer1.length, 1);
    t.same(strip[0].buffer1.chunk, undefined);
    t.same(strip[0].buffer2.offset, undefined);
    t.same(strip[0].buffer2.length, undefined);
    t.same(strip[0].buffer2.chunk, ['d']);

    t.same(strip[1].buffer1.offset, 5);
    t.same(strip[1].buffer1.length, 4);
    t.same(strip[1].buffer1.chunk, undefined);
    t.same(strip[1].buffer2.offset, undefined);
    t.same(strip[1].buffer2.length, undefined);
    t.same(strip[1].buffer2.chunk, ['11']);

    t.same(strip[2].buffer1.offset, 10);
    t.same(strip[2].buffer1.length, 0);
    t.same(strip[2].buffer1.chunk, undefined);
    t.same(strip[2].buffer2.offset, undefined);
    t.same(strip[2].buffer2.length, undefined);
    t.same(strip[2].buffer2.chunk, ['z', 'z']);

    t.end();
  });

  t.test('applies a stripped patch against buffer1 to get buffer2', t => {
    const result = Diff3.patch(a, strip);
    t.same(result, b);
    t.end();
  });

  t.test('did not modify the original patch', t => {
    t.not(patch, strip);
    t.not(patch[0], strip[0]);
    t.not(patch[1], strip[1]);
    t.not(patch[2], strip[2]);
    t.end();
  });

  t.end();
});


test('invertPatch', t => {
  const patch = Diff3.diffPatch(a, b);
  const invert = Diff3.invertPatch(patch);

  t.test('inverts the diffPatch result', t => {
    t.same(invert[0].buffer2.offset, 2);
    t.same(invert[0].buffer2.length, 1);
    t.same(invert[0].buffer2.chunk, ['b']);
    t.same(invert[0].buffer1.offset, 2);
    t.same(invert[0].buffer1.length, 1);
    t.same(invert[0].buffer1.chunk, ['d']);

    t.same(invert[1].buffer2.offset, 5);
    t.same(invert[1].buffer2.length, 4);
    t.same(invert[1].buffer2.chunk, ['new', '00', 'a', 'a']);
    t.same(invert[1].buffer1.offset, 5);
    t.same(invert[1].buffer1.length, 1);
    t.same(invert[1].buffer1.chunk, ['11']);

    t.same(invert[2].buffer2.offset, 10);
    t.same(invert[2].buffer2.length, 0);
    t.same(invert[2].buffer2.chunk, []);
    t.same(invert[2].buffer1.offset, 7);
    t.same(invert[2].buffer1.length, 2);
    t.same(invert[2].buffer1.chunk, ['z', 'z']);

    t.end();
  });

  t.test('applies an inverted patch against buffer2 to get buffer1', t => {
    const result = Diff3.patch(b, invert);
    t.same(result, a);
    t.end();
  });

  t.test('did not modify the original patch', t => {
    t.not(patch, invert);
    t.not(patch[0], invert[0]);
    t.not(patch[1], invert[1]);
    t.not(patch[2], invert[2]);
    t.end();
  });

  t.end();
});