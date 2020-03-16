const test = require('tap').test;
const Diff3 = require('../.');

test('Diff3', function(t) {

    function split(s) {
        return s ? s.split(/ /) : [];
    }

    t.test('performs diff3 merge', function(t) {
        var o = split('AA ZZ 00 M 99');
        var a = split('AA a b c ZZ new 00 a a M 99');
        var b = split('AA a d c ZZ 11 M z z 99');
        var res = Diff3.diff3Merge(a, o, b);

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
        var o = split('AA ZZ');
        var a = split('AA a b c ZZ');
        var b = split('AA a b c ZZ');
        var res = Diff3.diff3Merge(a, o, b, false);

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
        var o = split('AA ZZ');
        var a = split('AA a b c ZZ');
        var b = split('AA a b c ZZ');
        var res = Diff3.diff3Merge(a, o, b, true);

        t.same(res[0].ok, ['AA', 'a', 'b', 'c', 'ZZ']);
        t.same(res[0].conflict, undefined);
        t.end();
    });


    t.test('avoids improper hunk sorting - see openstreetmap/iD#3058', function(t) {
        var a = ['n4100522632', 'n4100697091', 'n4100697136', 'n-10000', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4102677890', 'n4094374176'];
        var o = ['n4100522632', 'n4100697091', 'n4100697136', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4102677890', 'n4094374176'];
        var b = ['n4100522632', 'n4100697091', 'n4100697136', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4105613618', 'n4102677890', 'n4105613617', 'n4094374176'];
        var expected = ['n4100522632', 'n4100697091', 'n4100697136', 'n-10000', 'n4102671583', 'n4102671584', 'n4102671585', 'n4102671586', 'n4102671587', 'n4102671588', 'n4102677889', 'n4105613618', 'n4102677890', 'n4105613617', 'n4094374176'];
        var res = Diff3.diff3Merge(a, o, b);

        t.same(res[0].ok, expected);
        t.end();
    });

    t.end();
});
