// Unit test for a.mem

QUnit.module('core/mem.js', {
    _beforeStore: [],

    setup: function() {
        this._beforeStore = a.keys(a.mem.list());
    },
    teardown: function() {
        var current = a.keys(a.mem.list());
        var difference = a.difference(current, this._beforeStore);
        a.each(difference, function(element) {
            a.mem.remove(element);
        });
        this._beforeStore = null;
    }
});


// Test mem system
QUnit.test('a.mem.default', function (assert) {
    assert.expect(3);

    a.mem.set('some-test', 'hello');
    assert.strictEqual(a.mem.get('some-test'), 'hello');

    a.mem.set('some-test', 'second');
    assert.strictEqual(a.mem.get('some-test'), 'second');

    a.mem.remove('some-test');
    assert.strictEqual(a.mem.get('some-test'), null);
});

// Test mem duplicate system
QUnit.test('a.mem.instance', function (assert) {
    assert.expect(6);

    var instance = a.mem.getInstance('some.test');

    instance.set('inside', 'ok');
    assert.strictEqual(a.mem.get('some.test.inside'), 'ok');
    assert.strictEqual(instance.get('inside'), 'ok');

    instance.set('inside', 'second');
    assert.strictEqual(a.mem.get('some.test.inside'), 'second');
    assert.strictEqual(instance.get('inside'), 'second');

    instance.remove('inside');
    assert.strictEqual(a.mem.get('some.test.inside'), null);
    assert.strictEqual(instance.get('inside'), null);
});


// Testing list function
QUnit.test('a.mem.list', function (assert) {
    assert.expect(4);

    a.mem.set('tempList', 'ok');

    var instance = a.mem.getInstance('list.test');
    instance.set('t', 'ok');

    var list1 = a.mem.list(),
        list2 = instance.list();

    assert.strictEqual(list2.t, 'ok');
    assert.strictEqual(list1.tempList, 'ok', 'Test global list');
    assert.strictEqual(list1['list.test.t'], 'ok', 'Test instance list');
    assert.strictEqual(list2.tempList, undefined,
                                'Test instance does not have full list');

    // Cleaning elements
    instance.remove('t');
    a.mem.remove('tempList');
});


// Dual instance does not create any bug
QUnit.test('a.mem.dual-instance', function (assert) {
    assert.expect(2);

    var instance1 = a.mem.getInstance('qunit.t1'),
        instance2 = a.mem.getInstance('qunit.t2');

    instance1.set('val1', 'val1');
    instance2.set('val2', 'val2');

    var list1 = instance1.list(),
        list2 = instance2.list();

    assert.strictEqual(list1.val1, 'val1', 'Test value 1');
    assert.strictEqual(list2.val2, 'val2', 'Test value 2');
});