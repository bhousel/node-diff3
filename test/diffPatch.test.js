const test = require('tap').test;
const Diff3 = require('../.');

test('diffPatch', function(t) {

  t.test('returns a patch-style diff of two arrays', function(t) {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
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

  t.end();
});