// Unit test for a.jsep

QUnit.module('core/jsep.js', {
    setup: function() {
        a.console.clear();
    },
    teardown: function() {
        a.console.clear();
    }
});


// Most basic addition
QUnit.test('a.jsep.basic', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('1 + 1');

    var parser = a.jsep.interpreter('qunit.jsep.basic', true, true, true);

    var result = parser.evaluate(tree);

    assert.strictEqual(result.result, 2, 'Test computing');
    assert.strictEqual(result.variables.length, 0);
});

// Using a scope variable
QUnit.test('a.jsep.scope', function (assert) {
    assert.expect(3);

    var tree = a.jsep.parse('a + 1');

    var parser = a.jsep.interpreter('qunit.jsep.scope', true, true, true);

    var result = parser.evaluate(tree, {
        a: 5
    });

    assert.strictEqual(result.result, 6, 'Test computing');
    assert.strictEqual(result.variables.length, 1);
    assert.strictEqual(result.variables[0], 'a');
});

// Custom operators
QUnit.test('a.jsep.custom-operator', function (assert) {
    assert.expect(6);

    var tree = a.jsep.parse('a + 1');
    var parser = a.jsep.interpreter('qunit.jsep.custom-operator', true, true,
            true);
    var result1 = parser.evaluate(tree, {
        a: 5
    });

    assert.strictEqual(result1.result, 6, 'Test computing 1');
    assert.strictEqual(result1.variables.length, 1);
    assert.strictEqual(result1.variables[0], 'a');

    // Now we change the "+" operator
    parser.binaryOperators.set('+', function (left, right) {
        return left - right;
    });

    var result2 = parser.evaluate(tree, {
        a: 5
    });

    assert.strictEqual(result2.result, 4, 'Test computing 2');
    assert.strictEqual(result2.variables.length, 1);
    assert.strictEqual(result2.variables[0], 'a');
});


// Custom operators do not affect others
QUnit.test('a.jsep.custom-operator-parallel', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('1 + 1');
    var parser1 = a.jsep.interpreter('qunit.jsep.co-parallel1', true, true,
            true),
        parser2 = a.jsep.interpreter('qunit.jsep.co-parallel2', true, true,
            true);

    parser2.binaryOperators.set('+', function (left, right) {
        return left - right;
    });

    var result1 = parser1.evaluate(tree),
        result2 = parser2.evaluate(tree);

    assert.strictEqual(result1.result, 2, 'Test computing 1');
    assert.strictEqual(result2.result, 0, 'Test computing 2');
});


// Test nest functions call
QUnit.test('a.jsep.function', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('a(b(12))');
    var parser = a.jsep.interpreter('qunit.jsep.function', true, true, true);

    var result = parser.evaluate(tree, {
        a: function(value) {
            return value - 4;
        },
        b: function(value) {
            return value * 2;
        }
    });

    assert.strictEqual(result.result, 20, 'Test computing');
    assert.strictEqual(result.variables.length, 0);
});


// Using object
QUnit.test('a.jsep.object', function (assert) {
    assert.expect(4);

    var tree = a.jsep.parse('"ok " + a.b[c] + " " + 4 + ok + func(2, 3)');
    var parser = a.jsep.interpreter('qunit.jsep.object', true, true, true);

    var result = parser.evaluate(tree, {
        func: function(a, b) {
            return a + ' yatta ' + b;
        },
        a: {
            b: {
                c: 'member'
            }
        },
        ok: 'hello'
    });

    assert.strictEqual(result.result, 'ok member 4hello2 yatta 3', 'concat');
    assert.strictEqual(result.variables.length, 2, 'Test variables length');
    assert.strictEqual(result.variables[0], 'a', 'variable 1');
    assert.strictEqual(result.variables[1], 'ok', 'variable 2');
});


// Test array support
QUnit.test('a.jsep.array', function (assert) {
    assert.expect(5);

    var tree = a.jsep.parse('["a", "b"]');
    var parser = a.jsep.interpreter('qunit.jsep.array', true, true, true);

    var result = parser.evaluate(tree);

    assert.strictEqual(a.isArray(result.result), true, 'Test array');
    assert.strictEqual(result.result.length, 2, 'Test size');
    assert.strictEqual(result.variables.length, 0, 'Test variables');
    assert.strictEqual(result.result[0], 'a', 'Test first');
    assert.strictEqual(result.result[1], 'b', 'Test first');
});


// Test this keyword
QUnit.test('a.jsep.this', function (assert) {
    assert.expect(1);

    var tree = a.jsep.parse('this.b');
    var parser = a.jsep.interpreter('qunit.jsep.this', true, true, true);

    var result = parser.evaluate(tree, {
        b: 'ok'
    });

    assert.strictEqual(result.result, 'ok', 'Test value');
});


// Test compound
QUnit.test('a.jsep.compound', function (assert) {
    assert.expect(7);

    var tree = a.jsep.parse('a, b');
    var parser = a.jsep.interpreter('qunit.jsep.compound', true, true, true);

    var result = parser.evaluate(tree, {
        a: 'first',
        b: 'second'
    });

    assert.strictEqual(a.isArray(result.result), true, 'Test array');
    assert.strictEqual(result.result.length, 2, 'Test size');
    assert.strictEqual(result.result[0], 'first', 'Test first');
    assert.strictEqual(result.result[1], 'second', 'Test second');

    assert.strictEqual(result.variables.length, 2, 'Test variables length');
    assert.strictEqual(result.variables[0], 'a', 'Test variable 1');
    assert.strictEqual(result.variables[1], 'b', 'Test variable 2');
});


// Test if structure
QUnit.test('a.jsep.ternary-operator', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('4 == b ? 4: 5'),
        parser = a.jsep.interpreter('qunit.jsep.ternary-operator', true, true,
                true);

    var result1 = parser.evaluate(tree, {
        b: 4
    });
    var result2 = parser.evaluate(tree, {
        b: 2
    });

    assert.strictEqual(result1.result, 4, 'Test 1');
    assert.strictEqual(result2.result, 5, 'Test 1');
});


// Logical operator not defined raise error on console
QUnit.test('a.jsep.not-defined-logical', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('1 && 1');
    var parser = a.jsep.interpreter('qunit.jsep.not-defined-logical', true,
            false, true);

    var result = parser.evaluate(tree),
        trace = a.console.trace('error');

    assert.strictEqual(trace[0].source,
            'a.jsep.interpreter.qunit.jsep.not-defined-logical','test source');
    assert.ok(trace[0].args[0].indexOf('Unknow logical operator ```&&```') >0);
});


// Binary operator not defined raise error on console
QUnit.test('a.jsep.not-defined-binary', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('1 + 1');
    var parser = a.jsep.interpreter('qunit.jsep.not-defined-binary', false,
            true, true);

    var result = parser.evaluate(tree),
        trace = a.console.trace('error');

    assert.strictEqual(trace[0].source,
            'a.jsep.interpreter.qunit.jsep.not-defined-binary','test source');
    assert.ok(trace[0].args[0].indexOf('Unknow binary operator ```+```') >0);
});


// Unary operator not defined raise error on console
QUnit.test('a.jsep.not-defined-unary', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('-a');
    var parser = a.jsep.interpreter('qunit.jsep.not-defined-unary', true, true,
            false);

    var result = parser.evaluate(tree),
        trace = a.console.trace('error');

    assert.strictEqual(trace[0].source,
            'a.jsep.interpreter.qunit.jsep.not-defined-unary','test source');
    assert.ok(trace[0].args[0].indexOf('Unknow unary operator ```-```') >0);
});


// Test an indentifier does not exist in scope
// NOTE: identifier cannot put something on console, as it can easily
// raise wrong error like this (for example with object members identifier
// will be called...)
// So we just check the system does not crash...
QUnit.test('a.jsep.not-defined-identifier', function (assert) {
    assert.expect(2);

    var tree = a.jsep.parse('a');
    var parser = a.jsep.interpreter('qunit.jsep.not-defined-identifier', true,
            true, true);

    var result = parser.evaluate(tree);

    assert.strictEqual(result.result, 'a', 'Test string return');
    assert.strictEqual(result.variables.length, 0);
});


// Not defined function call
QUnit.test('a.jsep.not-defined-call', function (assert) {
    assert.expect(5);

    var tree = a.jsep.parse('func(12)');
    var parser = a.jsep.interpreter('qunit.jsep.not-defined-call', true, true,
            true);

    var result = parser.evaluate(tree),
        trace = a.console.trace('error');

    assert.strictEqual(result.result, null, 'Test null value');
    assert.strictEqual(result.variables.length, 0, 'Test no variable involve');
    assert.strictEqual(trace[0].source,
        'a.jsep.interpreter.qunit.jsep.not-defined-call', 'Test source');
    assert.ok(trace[0].args[0].indexOf('The function')>0, 'Test log 1');
    assert.ok(trace[0].args[0].indexOf('could not be resolved')>0, 'Test log');
});


// Not defined object member
QUnit.test('a.jsep.not-defined-member', function (assert) {
    assert.expect(4);

    var tree = a.jsep.parse('a.b[c]');
    var parser = a.jsep.interpreter('qunit.jsep.not-defined-member', true,true,
            true);

    var result = parser.evaluate(tree, {
        a: {
            b: {
                z: 'ok'
            }
        }
    });
    var trace = a.console.trace('error');

    assert.strictEqual(result.result, null, 'Test result');
    assert.strictEqual(trace[0].source,
        'a.jsep.interpreter.qunit.jsep.not-defined-member', 'Test source');
    assert.ok(trace[0].args[0].indexOf('The property') > 0, 'Test log');
    assert.ok(trace[0].args[0].indexOf('could not be found') > 0, 'Test log');
});