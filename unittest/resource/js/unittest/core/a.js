// Unit test for a (the tiny part at beginning only)

module('a.js');

// Testing a found url...
test('a.url', function() {
    ok(a.url !== '', 'Test url not empty');
});

// Testing isNone
test('a.isNone', function() {
    strictEqual(a.isNone(null), true, 'Test null');
    strictEqual(a.isNone(undefined), true, 'Test undefined');
    strictEqual(a.isNone(''), false, 'Test empty string');
    strictEqual(a.isNone({}), false, 'Test empty object');
    strictEqual(a.isNone(0), false, 'Test 0 value');
});

// Testing a.isTrueObject
test('a.isTrueObject', function() {
    strictEqual(a.isTrueObject(null), false, 'Test null value');
    strictEqual(a.isTrueObject(undefined), false, 'Test undefined value');
    strictEqual(a.isTrueObject(function() {}), false, 'Test function value');
    strictEqual(a.isTrueObject({}), true, 'Test object value');
});

test('a.scope', function() {
    var scope = {
        test: 'ok'
    },
        se = strictEqual;

    var fct = a.scope(function() {
        se(this.test, 'ok', 'Test scope');
    }, scope);

    fct();
});