// Unit test for a.state (plugin)
// We separate from state because it is less important, and more easy one...

QUnit.module('plugin/state.js');

// Testing getById function
QUnit.test('a.state.get', function(assert) {
    assert.expect(3);

    var element = {
        id : 'nowitisworking',
        hash : 'you'
    };
    a.state.add(element);

    // We test access
    assert.strictEqual(a.state.get('notworking'), null, 'Test not existing id');
    assert.deepEqual(a.state.get('nowitisworking'), element,
                                    'Test element can be accessed');

    // Now we test we can handle changes easily (item is not duplicate)
    a.state.get('nowitisworking').hash = 'newone';

    assert.strictEqual(a.state.get('nowitisworking').hash, 'newone',
                                    'Test element can change');
});

// Testing removeById function
QUnit.test('a.state.remove', function(assert) {
    assert.expect(2);

    var element = {
        id : 'nowitisworking',
        hash : 'you'
    };
    a.state.add(element);

    assert.deepEqual(a.state.get('nowitisworking'), element,
                                        'Test element can be accessed');

    // Now we remove
    a.state.remove(element.id);

    assert.deepEqual(a.state.get('nowitisworking'), null,
                        'Test element cannot be accessed after deleting');

    // Now we remove dummy one...
    a.state.remove('something');
    a.state.remove(null);
});
