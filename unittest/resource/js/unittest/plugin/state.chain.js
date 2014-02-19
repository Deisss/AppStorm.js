// Unit test for a.state.chain (plugin)
module('plugin/state.chain.js');

// Test adding before
test('a.state.chain-add-before', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add before 'preLoad'
    a.state.chain.add(true, 'unittest-add-before', function(chain) {
        chain.next();
    }, {
        before: 'preLoad'
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[0].name, 'unittest-add-before', 'Test name inserted');
    strictEqual(result[1].name, 'preLoad', 'Test original chain name');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-before');
});

// Second test for adding before
test('a.state.chain.add-before2', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add before 'include'
    a.state.chain.add(true, 'unittest-add-before', function(chain) {
        chain.next();
    }, {
        before: 'include'
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[0].name, 'preLoad', 'Test original chain name');
    strictEqual(result[2].name, 'unittest-add-before', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-before');
});

// Test for adding after
test('a.state.chain-add-after', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after 'preLoad'
    a.state.chain.add(true, 'unittest-add-after', function(chain) {
        chain.next();
    }, {
        after: 'preLoad'
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[0].name, 'preLoad', 'Test original chain name');
    strictEqual(result[1].name, 'unittest-add-after', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-after');
});


test('a.state.chain-add-after2', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after 'include'
    a.state.chain.add(true, 'unittest-add-after', function(chain) {
        chain.next();
    }, {
        after: 'include'
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[0].name, 'preLoad', 'Test original chain name');
    strictEqual(result[1].name, 'title', 'Test original chain name');
    strictEqual(result[2].name, 'include', 'Test original chain name');
    strictEqual(result[3].name, 'unittest-add-after', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-after');
});

// Test for adding at specific position
test('a.state.chain-add-position', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after position 3
    a.state.chain.add(true, 'unittest-add-position', function(chain) {
        chain.next();
    }, {
        position: 3
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[3].name, 'unittest-add-position', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-position');
});

// Test for adding at specific position
test('a.state.chain-add-position-negative', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add before anything else
    a.state.chain.add(true, 'unittest-add-position', function(chain) {
        chain.next();
    }, {
        position: -1
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[0].name, 'unittest-add-position', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-position');
});

// Test for adding at specific position
test('a.state.chain-add-position-toobig', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after everything
    a.state.chain.add(true, 'unittest-add-position', function(chain) {
        chain.next();
    }, {
        position: 100
    });
    var result = a.state.chain.get('load');

    strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    strictEqual(result[result.length - 1].name, 'unittest-add-position',
                                    'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-position');
});

// Test removing elements
test('a.state.chain-remove', function() {
    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    a.state.chain.add(false, 'unittest-remove', function(chain) {
        chain.next();
    }, {
        position: 100
    });
    a.state.chain.add(false, 'unittest-remove', function(chain) {
        chain.next();
    }, {
        position: 100
    });

    strictEqual(a.state.chain.get('load').length, currentLoadingChain.length,
            'Test chain length result');
    strictEqual(a.state.chain.get('unload').length, 
            currentUnloadingChain.length + 2, 'Test chain length result');

    a.state.chain.remove(false, 'unittest-remove');

    strictEqual(a.state.chain.get('load').length, currentLoadingChain.length,
            'Test chain length result2');
    strictEqual(a.state.chain.get('unload').length,
            currentUnloadingChain.length, 'Test chain length result2');
});

// Test loading elements
test('a.state.chain.loading', function() {
    var currentLoadingChain = a.state.chain.get('load'),
        result = a.pluck(currentLoadingChain, 'name').join(',');
    strictEqual(result,
            'preLoad,title,include,converter,contentLoad,load,bindDom,' +
                                        'bindKeyboard,postLoad,loadAfter',
                                                'Test loading chain');
});

// Test unloading elements
test('a.state.chain.unloading', function() {
    var currentUnloadingChain = a.state.chain.get('unload'),
        result = a.pluck(currentUnloadingChain, 'name').join(',');
    strictEqual(result, 'preUnload,unbindKeyboard,unbindDom,contentUnload' +
                                        ',unload,postUnload',
                                                'Test unloading chain');
});