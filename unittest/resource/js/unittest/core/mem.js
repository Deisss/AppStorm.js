// Unit test for a.mem

module('core/mem.js', {
    teardown: function() {
        var list = a.mem.list();

        for(var i in list) {
            a.mem.remove(i);
        }
    }
});


// Test mem system
test('a.mem.default', function() {
    a.mem.set('some-test', 'hello');
    strictEqual(a.mem.get('some-test'), 'hello');

    a.mem.set('some-test', 'second');
    strictEqual(a.mem.get('some-test'), 'second');

    a.mem.remove('some-test');
    strictEqual(a.mem.get('some-test'), null);
});

// Test mem duplicate system
test('a.mem.instance', function() {
    var instance = a.mem.getInstance('some.test');

    instance.set('inside', 'ok');
    strictEqual(a.mem.get('some.test.inside'), 'ok');
    strictEqual(instance.get('inside'), 'ok');

    instance.set('inside', 'second');
    strictEqual(a.mem.get('some.test.inside'), 'second');
    strictEqual(instance.get('inside'), 'second');

    instance.remove('inside');
    strictEqual(a.mem.get('some.test.inside'), null);
    strictEqual(instance.get('inside'), null);
});


// Testing list function
test('a.mem.list', function() {
    a.mem.set('tempList', 'ok');

    var instance = a.mem.getInstance('list.test');
    instance.set('t', 'ok');

    var list1 = a.mem.list(),
        list2 = instance.list();

    strictEqual(list2.t, 'ok');
    strictEqual(list1.tempList, 'ok', 'Test global list');
    strictEqual(list1['list.test.t'], 'ok', 'Test instance list');
    strictEqual(list2.tempList, undefined,
                                'Test instance does not have full list');

    // Cleaning elements
    instance.remove('t');
    a.mem.remove('tempList');
});