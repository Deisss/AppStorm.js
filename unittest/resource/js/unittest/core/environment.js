// Unit test for a.environment

QUnit.module('core/environment.js', {
    teardown: function() {
        a.environment.clear();
    }
});


// Testing environment get/set and remove key from it
QUnit.test('a.environment.get-set-remove', function(assert) {
    expect(5);

    var env = a.environment;
    assert.strictEqual(env.get('unittest'), null, 'Testing value before set');

    env.set('unittest', true);
    assert.strictEqual(env.get('unittest'), true, 'Testing value after set');
    assert.strictEqual(a.mem.get('app.environment.unittest'), true,
                                                'Test mem value after set');

    env.set('unittest', false);
    assert.strictEqual(env.get('unittest'), false, 'Testing updating value');

    env.remove('unittest');
    assert.strictEqual(env.get('unittest'), null, 'Testing value after remove');
});

// Testing environment clear all key
QUnit.test('a.environment.clear', function(assert) {
    expect(6);

    var env = a.environment;

    env.set('unittest1', 'ok');
    env.set('unittest4', 'ok');

    assert.strictEqual(env.get('unittest1'), 'ok', 'Testing value before clear');
    assert.strictEqual(env.get('unittest4'), 'ok', 'Testing value before clear');
    assert.strictEqual(a.mem.get('app.environment.unittest1'), 'ok',
                                                'Testing value before clear');

    env.clear();

    assert.strictEqual(env.get('unittest1'), null, 'Testing value after clear');
    assert.strictEqual(env.get('unittest4'), null, 'Testing value after clear');
    assert.strictEqual(a.mem.get('app.environment.unittest1'), null,
                                                'Testing value before clear');
});