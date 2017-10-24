const test = require('tap').test;
const Diff3 = require('../.');

test('Diff3', function(t) {

    function split(s) {
        return s ? s.split(/ /) : [];
    }

    t.test('performs diff3 merge', function(t) {
        var o = split('AA ZZ 00 M 99'),
            a = split('AA a b c ZZ new 00 a a M 99'),
            b = split('AA a d c ZZ 11 M z z 99'),
            res = Diff3.diff3Merge(a, o, b);

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

        t.same(res[0].ok, ['AA']);
        t.same(res[0].conflict, undefined);

        t.same(res[1].ok, undefined);
        t.same(res[1].conflict.o, []);
        t.same(res[1].conflict.a, ['a', 'b', 'c']);
        t.same(res[1].conflict.b, ['a', 'd', 'c']);

        t.same(res[2].ok, ['ZZ']);
        t.same(res[2].conflict, undefined);

        t.same(res[3].ok, undefined);
        t.same(res[3].conflict.o, ['00']);
        t.same(res[3].conflict.a, ['new', '00', 'a', 'a']);
        t.same(res[3].conflict.b, ['11']);

        t.same(res[4].ok, ['M', 'z', 'z', '99']);
        t.same(res[4].conflict, undefined);
        t.end();
    });


    t.test('can include false conflicts', function(t) {
        var o = split('AA ZZ'),
            a = split('AA a b c ZZ'),
            b = split('AA a b c ZZ'),
            res = Diff3.diff3Merge(a, o, b, false);

        t.same(res[0].ok, ['AA']);
        t.same(res[0].conflict, undefined);

        t.same(res[1].ok, undefined);
        t.same(res[1].conflict.o, []);
        t.same(res[1].conflict.a, ['a', 'b', 'c']);
        t.same(res[1].conflict.b, ['a', 'b', 'c']);

        t.same(res[2].ok, ['ZZ']);
        t.same(res[2].conflict, undefined);
        t.end();
    });


    t.test('can exclude false conflicts', function(t) {
        var o = split('AA ZZ'),
            a = split('AA a b c ZZ'),
            b = split('AA a b c ZZ'),
            res = Diff3.diff3Merge(a, o, b, true);

        t.same(res[0].ok, ['AA', 'a', 'b', 'c', 'ZZ']);
        t.same(res[0].conflict, undefined);
        t.end();
    });

    t.end();
});
