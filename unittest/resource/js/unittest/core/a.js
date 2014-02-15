// Unit test for a (the tiny part at beginning only)

module('a.js');

testModuleDone('a.js', function() {
    hashtag('');
    a.setDefaultAjaxOptions({});
});




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
    };

    var fct = a.scope(function() {
        strictEqual(this.test, 'ok', 'Test scope');
    }, scope);

    fct();
});

test('a.trim', function() {
    strictEqual(a.trim('     something is good       '), 'something is good');
    strictEqual(a.trim('	with tab'), 'with tab');
});

test('a.firstLetterUppercase', function() {
    strictEqual(a.firstLetterUppercase('something', 'is'), 'isSomething');
    strictEqual(a.firstLetterUppercase('something'), 'Something');
    strictEqual(a.firstLetterUppercase('this is long'), 'This is long');
});