// Unit test for a.jsep

/*
TODO:

Test operator change does not affect other instance
Test an HTML parser system, almost completely override
Test every possibility to be sure all "expressions" works flawless...
Update documentation for JSEP
*/

QUnit.module('core/jsep.js', {
    setup: function() {
        a.console.clear();
    },
    teardown: function() {
        a.console.clear();
    }
});


// Most basic addition
QUnit.test('a.jsep.basic', function(assert) {
    assert.expect(2);

    var tree = a.jsep.parse('1 + 1');

    var parser = a.jsep.interpreter('qunit.jsep.basic', true, true, true);

    var result = parser.evaluate(tree);

    assert.strictEqual(result.result, 2, 'Test computing');
    assert.strictEqual(result.variables.length, 0);
});

// Using a scope variable
QUnit.test('a.jsep.scope', function(assert) {
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
QUnit.test('a.jsep.custom-operator', function(assert) {
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
