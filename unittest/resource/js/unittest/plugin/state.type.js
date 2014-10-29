// Unit test for a.state.type (plugin)
QUnit.module('plugin/state.type.js');


// Test register a new type
QUnit.test('a.state.type-add', function(assert) {
    assert.expect(3);

    a.state.type.add('test1', 'input', 'output', false);

    var get = a.state.type.get('test1');

    assert.strictEqual(get.input, 'input');
    assert.strictEqual(get.output, 'output');
    assert.strictEqual(get.async, false);
});

// Test removing a type
QUnit.test('a.state.type-remove', function(assert) {
    assert.expect(2);

    a.state.type.add('test1', null, null, false);
    a.state.type.add('test2', null, null, false);

    a.state.type.remove('test1');

    var list = a.state.type.list();

    assert.strictEqual('test1' in list, false);
    assert.strictEqual('test2' in list, true);

    a.state.type.remove('test2');
});

// Test getting a type
QUnit.test('a.state.type-get', function(assert) {
    assert.expect(3);

    a.state.type.add('super-get', function() {}, null, false);

    var get = a.state.type.get('super-get');
    assert.strictEqual(get.async, false);
    assert.strictEqual(a.isFunction(get.input), true);
    assert.strictEqual(a.isNull(get.output), true);

    // Clearing
    a.state.type.remove('super-get');
});

// Test getting full list
QUnit.test('a.state.type-list', function(assert) {
    assert.expect(2);

    a.state.type.add('test1', function() {}, function() {}, false);
    a.state.type.add('test2', function() {}, function() {}, true);

    var list = a.state.type.list();
    assert.strictEqual(list['test1'].async, false);
    assert.strictEqual(list['test2'].async, true);

    // Clearing
    a.state.type.remove('test1');
    a.state.type.remove('test2');
});

// Test appending data
QUnit.test('a.state.type-append', function(assert) {
    assert.expect(2);

    var el = a.dom.query('body'),
        append = a.state.type.get('append');

    append.input(el, 
                '<div id="unit-test-type-append"style="display:none"></div>');

    var root = a.dom.id('unit-test-type-append');

    append.input(root, '<a id="unit-test-child1">ok1</a>');
    append.input(root, '<a id="unit-test-child2">ok2</a>');

    // Let's count everything !
    assert.strictEqual(a.dom.id('unit-test-child1').get(0).innerHTML, 'ok1');
    assert.strictEqual(a.dom.id('unit-test-child2').get(0).innerHTML, 'ok2');

    // We delete dom
    root.empty();
});

// Test replacing data
QUnit.test('a.state.type-replace', function(assert) {
    assert.expect(2);

    var el = a.dom.query('body'),
        append  = a.state.type.get('append');
        replace = a.state.type.get('replace');

    append.input(el, 
                '<div id="unit-test-type-replace"style="display:none"></div>');

    var root = a.dom.id('unit-test-type-replace');

    replace.input(root, '<a id="unit-test-child1">ok1</a>');
    replace.input(root, '<a id="unit-test-child2">ok2</a>');

    // Let's count everything !
    assert.strictEqual(a.dom.id('unit-test-child1').get(0), null);
    assert.strictEqual(a.dom.id('unit-test-child2').get(0).innerHTML, 'ok2');

    // We delete dom
    root.empty();
});