// Unit test for a.state.type (plugin)
module('plugin/state.type.js');


// Test register a new type
test('a.state.type-add', function() {
    a.state.type.add('test1', 'input', 'output', false);

    var get = a.state.type.get('test1');

    strictEqual(get.input, 'input');
    strictEqual(get.output, 'output');
    strictEqual(get.async, false);
});

// Test removing a type
test('a.state.type-remove', function() {
    a.state.type.add('test1', null, null, false);
    a.state.type.add('test2', null, null, false);

    a.state.type.remove('test1');

    var list = a.state.type.list();

    strictEqual('test1' in list, false);
    strictEqual('test2' in list, true);

    a.state.type.remove('test2');
});

// Test getting a type
test('a.state.type-get', function() {
    a.state.type.add('super-get', function() {}, null, false);

    var get = a.state.type.get('super-get');
    strictEqual(get.async, false);
    strictEqual(a.isFunction(get.input), true);
    strictEqual(a.isNull(get.output), true);

    // Clearing
    a.state.type.remove('super-get');
});

// Test getting full list
test('a.state.type-list', function() {
    a.state.type.add('test1', function() {}, function() {}, false);
    a.state.type.add('test2', function() {}, function() {}, true);

    var list = a.state.type.list();
    strictEqual(list['test1'].async, false);
    strictEqual(list['test2'].async, true);

    // Clearing
    a.state.type.remove('test1');
    a.state.type.remove('test2');
});

// Test appending data
test('a.state.type-append', function() {
    var el = a.dom.query('body'),
        append = a.state.type.get('append');

    append.input(el, 
                '<div id="unit-test-type-append"style="display:none"></div>');

    var root = a.dom.id('unit-test-type-append');

    append.input(root, '<a id="unit-test-child1">ok1</a>');
    append.input(root, '<a id="unit-test-child2">ok2</a>');

    // Let's count everything !
    strictEqual(a.dom.id('unit-test-child1').get(0).innerHTML, 'ok1');
    strictEqual(a.dom.id('unit-test-child2').get(0).innerHTML, 'ok2');

    // We delete dom
    root.empty();
});

// Test replacing data
test('a.state.type-replace', function() {
    var el = a.dom.query('body'),
        append  = a.state.type.get('append');
        replace = a.state.type.get('replace');

    append.input(el, 
                '<div id="unit-test-type-replace"style="display:none"></div>');

    var root = a.dom.id('unit-test-type-replace');

    replace.input(root, '<a id="unit-test-child1">ok1</a>');
    replace.input(root, '<a id="unit-test-child2">ok2</a>');

    // Let's count everything !
    strictEqual(a.dom.id('unit-test-child1').get(0), null);
    strictEqual(a.dom.id('unit-test-child2').get(0).innerHTML, 'ok2');

    // We delete dom
    root.empty();
});