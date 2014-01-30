// Unit test for a.state (plugin)
// We separate from state because it is less important, and more easy one...

module('plugin/state.js');

// Testing getById function
test('a.state.get', function() {
    expect(3);

    a.state.clear();

    var element = {
        id : 'nowitisworking',
        hash : 'you'
    };
    a.state.add(element);

    // We test access
    strictEqual(a.state.get('notworking'), null, 'Test not existing id');
    deepEqual(a.state.get('nowitisworking'), element,
                                    'Test element can be accessed');

    // Now we test we can handle changes easily (item is not duplicate)
    a.state.get('nowitisworking').hash = 'newone';

    strictEqual(a.state.get('nowitisworking').hash, 'newone',
                                    'Test element can change');

    // Clearing state
    a.state.clear();
});

// Testing removeById function
test('a.state.remove', function() {
    expect(2);

    a.state.clear();

    var element = {
        id : 'nowitisworking',
        hash : 'you'
    };
    a.state.add(element);

    deepEqual(a.state.get('nowitisworking'), element,
                                        'Test element can be accessed');

    // Now we remove
    a.state.remove(element.id);

    deepEqual(a.state.get('nowitisworking'), null,
                        'Test element cannot be accessed after deleting');

    // Now we remove dummy one...
    a.state.remove('something');
    a.state.remove(null);

    // No error should appear on console...
    a.state.clear();
});
