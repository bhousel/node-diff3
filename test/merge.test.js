const test = require('tap').test;
const Diff3 = require('../.');

test('merge', function(t) {

  t.test('returns conflict: false if no conflicts', function(t) {
    const o = ['AA'];
    const a = ['AA'];
    const b = ['AA'];
    const r = Diff3.merge(a, o, b);
    t.notOk(r.conflict);
    const result = r.result;
    t.same(result[0], 'AA');
    t.end();
  });

  t.test('returns a diff3-style merge result', function(t) {
    const o = ['AA', 'ZZ', '00', 'M', '99'];
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const r = Diff3.merge(a, o, b);
    t.ok(r.conflict);

    const result = r.result;
    t.same(result[0], 'AA');
    t.same(result[1], '\n<<<<<<<<<\n');
    t.same(result[2], 'a');
    t.same(result[3], 'b');
    t.same(result[4], 'c');
    t.same(result[5], '\n=========\n');
    t.same(result[6], 'a');
    t.same(result[7], 'd');
    t.same(result[8], 'c');
    t.same(result[9], '\n>>>>>>>>>\n');
    t.same(result[10], 'ZZ');
    t.same(result[11], '\n<<<<<<<<<\n');
    t.same(result[12], 'new');
    t.same(result[13], '00');
    t.same(result[14], 'a');
    t.same(result[15], 'a');
    t.same(result[16], '\n=========\n');
    t.same(result[17], '11');
    t.same(result[18], '\n>>>>>>>>>\n');
    t.same(result[19], 'M');
    t.same(result[20], 'z');
    t.same(result[21], 'z');
    t.same(result[22], '99');

    t.end();
  });

  t.end();
});
