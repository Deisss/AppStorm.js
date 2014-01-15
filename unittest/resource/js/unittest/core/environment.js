// Unit test for a.environment

module('core/environment.js');

// Testing environment get/set and remove key from it
test('a.environment.get-set-remove', function() {
    var env = a.environment;
    strictEqual(env.get('unittest'), null, 'Testing value before set');

    env.set('unittest', true);
    strictEqual(env.get('unittest'), true, 'Testing value after set');
    strictEqual(a.mem.get('app.environment.unittest'), true,
                                                'Test mem value after set');

    env.set('unittest', false);
    strictEqual(env.get('unittest'), false, 'Testing updating value');

    env.remove('unittest');
    strictEqual(env.get('unittest'), null, 'Testing value after remove');
});

// Testing environment clear all key
test('a.environment.clear', function() {
    var env = a.environment;

    env.set('unittest1', 'ok');
    env.set('unittest4', 'ok');

    strictEqual(env.get('unittest1'), 'ok', 'Testing value before clear');
    strictEqual(env.get('unittest4'), 'ok', 'Testing value before clear');
    strictEqual(a.mem.get('app.environment.unittest1'), 'ok',
                                                'Testing value before clear');

    env.clear();

    strictEqual(env.get('unittest1'), null, 'Testing value after clear');
    strictEqual(env.get('unittest4'), null, 'Testing value after clear');
    strictEqual(a.mem.get('app.environment.unittest1'), null,
                                                'Testing value before clear');
});