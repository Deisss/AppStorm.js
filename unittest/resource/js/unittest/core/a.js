// Unit test for a (the tiny part at beginning only)

QUnit.module('a.js', {
    teardown: function() {
        hashtag('');
        a.setDefaultAjaxOptions({});
    }
});




// Testing a found url...
QUnit.test('a.url', function(assert) {
    expect(1);
    assert.ok(a.url !== '', 'Test url not empty');
});

// Testing isNone
QUnit.test('a.isNone', function(assert) {
    expect(5);
    assert.strictEqual(a.isNone(null), true, 'Test null');
    assert.strictEqual(a.isNone(undefined), true, 'Test undefined');
    assert.strictEqual(a.isNone(''), false, 'Test empty string');
    assert.strictEqual(a.isNone({}), false, 'Test empty object');
    assert.strictEqual(a.isNone(0), false, 'Test 0 value');
});

// Testing a.isTrueObject
QUnit.test('a.isTrueObject', function(assert) {
    expect(4);
    assert.strictEqual(a.isTrueObject(null), false, 'Test null value');
    assert.strictEqual(a.isTrueObject(undefined), false, 'Test undefined value');
    assert.strictEqual(a.isTrueObject(function() {}), false, 'Test function value');
    assert.strictEqual(a.isTrueObject({}), true, 'Test object value');
});

QUnit.test('a.scope', function(assert) {
    expect(1);
    var scope = {
        test: 'ok'
    };

    var fct = a.scope(function() {
        assert.strictEqual(this.test, 'ok', 'Test scope');
    }, scope);

    fct();
});

QUnit.test('a.trim', function(assert) {
    expect(2);
    assert.strictEqual(a.trim('     something is good       '), 'something is good');
    assert.strictEqual(a.trim('	with tab'), 'with tab');
});

QUnit.test('a.firstLetterUppercase', function(assert) {
    expect(3);
    assert.strictEqual(a.firstLetterUppercase('something', 'is'), 'isSomething');
    assert.strictEqual(a.firstLetterUppercase('something'), 'Something');
    assert.strictEqual(a.firstLetterUppercase('this is long'), 'This is long');
});