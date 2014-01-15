// Unit test for a.mem

module('core/mem.js');

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