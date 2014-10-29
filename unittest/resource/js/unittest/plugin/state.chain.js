// Unit test for a.state.chain (plugin)
QUnit.module('plugin/state.chain.js');

// Test adding before
QUnit.test('a.state.chain-add-before', function(assert) {
    assert.expect(5);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add before 'preLoad'
    a.state.chain.add(true, 'unittest-add-before',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        before: 'preLoad'
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[0].name, 'loadParameters', 'Test original chain name');
    assert.strictEqual(result[1].name, 'unittest-add-before', 'Test name inserted');
    assert.strictEqual(result[2].name, 'preLoad', 'Test original chain name');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-before');
});

// Second test for adding before
QUnit.test('a.state.chain.add-before2', function(assert) {
    assert.expect(4);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add before 'include'
    a.state.chain.add(true, 'unittest-add-before',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        before: 'include'
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[0].name, 'loadParameters', 'Test original chain name');
    assert.strictEqual(result[3].name, 'unittest-add-before', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-before');
});

// Test for adding after
QUnit.test('a.state.chain-add-after', function(assert) {
    assert.expect(5);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after 'preLoad'
    a.state.chain.add(true, 'unittest-add-after',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        after: 'preLoad'
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[0].name, 'loadParameters', 'Test original chain name');
    assert.strictEqual(result[1].name, 'preLoad', 'Test original chain name');
    assert.strictEqual(result[2].name, 'unittest-add-after', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-after');
});


QUnit.test('a.state.chain-add-after2', function(assert) {
    assert.expect(7);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after 'include'
    a.state.chain.add(true, 'unittest-add-after',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        after: 'include'
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[0].name, 'loadParameters', 'Test original chain name');
    assert.strictEqual(result[1].name, 'preLoad', 'Test original chain name');
    assert.strictEqual(result[2].name, 'title', 'Test original chain name');
    assert.strictEqual(result[3].name, 'include', 'Test original chain name');
    assert.strictEqual(result[4].name, 'unittest-add-after', 'Test name inserted')

    // We rollback
    a.state.chain.remove(true, 'unittest-add-after');
});

// Test for adding at specific position
QUnit.test('a.state.chain-add-position', function(assert) {
    assert.expect(3);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after position 3
    a.state.chain.add(true, 'unittest-add-position',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        position: 3
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[3].name, 'unittest-add-position', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-position');
});

// Test for adding at specific position
QUnit.test('a.state.chain-add-position-negative', function(assert) {
    assert.expect(3);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add before anything else
    a.state.chain.add(true, 'unittest-add-position',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        position: -1
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[0].name, 'unittest-add-position', 'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-position');
});

// Test for adding at specific position
QUnit.test('a.state.chain-add-position-toobig', function(assert) {
    assert.expect(3);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    // We add after everything
    a.state.chain.add(true, 'unittest-add-position',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        position: 100
    });
    var result = a.state.chain.get('load');

    assert.strictEqual(currentUnloadingChain.length,
            a.state.chain.get('unload').length, 'Test unload didn\'t change');
    assert.strictEqual(currentLoadingChain.length + 1,
            result.length, 'Test load change size');

    assert.strictEqual(result[result.length - 1].name, 'unittest-add-position',
                                    'Test name inserted');

    // We rollback
    a.state.chain.remove(true, 'unittest-add-position');
});

// Test removing elements
QUnit.test('a.state.chain-remove', function(assert) {
    assert.expect(4);

    var currentLoadingChain   = a.clone(a.state.chain.get('load')),
        currentUnloadingChain = a.clone(a.state.chain.get('unload'));

    a.state.chain.add(false, 'unittest-remove', 
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        position: 100
    });
    a.state.chain.add(false, 'unittest-remove',
    function() {
        return true;
    },
    function(chain) {
        chain.next();
    }, {
        position: 100
    });

    assert.strictEqual(a.state.chain.get('load').length, currentLoadingChain.length,
            'Test chain length result');
    assert.strictEqual(a.state.chain.get('unload').length, 
            currentUnloadingChain.length + 2, 'Test chain length result');

    a.state.chain.remove(false, 'unittest-remove');

    assert.strictEqual(a.state.chain.get('load').length, currentLoadingChain.length,
            'Test chain length result2');
    assert.strictEqual(a.state.chain.get('unload').length,
            currentUnloadingChain.length, 'Test chain length result2');
});

// Test loading elements
QUnit.test('a.state.chain.loading', function(assert) {
    assert.expect(1);

    var currentLoadingChain = a.state.chain.get('load'),
        result = a.pluck(currentLoadingChain, 'name').join(',');
    assert.strictEqual(result,
            'loadParameters,preLoad,title,include,converter,contentLoad,load,'+
                                        'bindDom,' +
                                        'bindGlobalDom,bindKeyboard,postLoad' +
                                        ',loadAfter',
                                                'Test loading chain');
});

// Test unloading elements
QUnit.test('a.state.chain.unloading', function(assert) {
    assert.expect(1);
    var currentUnloadingChain = a.state.chain.get('unload'),
        result = a.pluck(currentUnloadingChain, 'name').join(',');
    assert.strictEqual(result, 'preUnload,unbindKeyboard,unbindGlobalDom,' +
                                        'unbindDom,unload' +
                                        ',contentUnload,postUnload,'+
                                        'removeParameters',
                                                'Test unloading chain');
});