const test = require('tap').test;
const Diff3 = require('../.');

test('LCS', function(t) {

  t.test('returns the LCS of two arrays', function(t) {
    const a = ['AA', 'a', 'b', 'c', 'ZZ', 'new', '00', 'a', 'a', 'M', '99'];
    const b = ['AA', 'a', 'd', 'c', 'ZZ', '11', 'M', 'z', 'z', '99'];
    const result = Diff3.LCS(a, b);
    const NULLRESULT = { buffer1index: -1, buffer2index: -1, chain: null };

    t.same(result.buffer1index, 10);  // '99'
    t.same(result.buffer2index, 9);

    t.same(result.chain.buffer1index, 9);  // 'M'
    t.same(result.chain.buffer2index, 6);

    t.same(result.chain.chain.buffer1index, 4);  // 'ZZ'
    t.same(result.chain.chain.buffer2index, 4);

    t.same(result.chain.chain.chain.buffer1index, 3);  // 'c'
    t.same(result.chain.chain.chain.buffer2index, 3);

    t.same(result.chain.chain.chain.chain.buffer1index, 1);  // 'a'
    t.same(result.chain.chain.chain.chain.buffer2index, 1);

    t.same(result.chain.chain.chain.chain.chain.buffer1index, 0);  // 'AA'
    t.same(result.chain.chain.chain.chain.chain.buffer2index, 0);
    t.same(result.chain.chain.chain.chain.chain.chain, NULLRESULT);

    t.end();
  });

  t.end();
});
