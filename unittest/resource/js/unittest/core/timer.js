// Unit test for a.timer

QUnit.module('core/timer.js', {
    setup: function() {
        a.timer.clear();
    },
    teardown: function() {
        a.timer.clear();
    }
});




// Test timer tick system
QUnit.asyncTest('a.timer.tick', function(assert) {
    assert.expect(5);

    // We don't use expect as it can vary between 4 and 5 tick...
    var tickCount = 0;

    var fct = function() {
        assert.strictEqual(true, true, 'tick');
        tickCount++;
    };
    a.message.bind('a.timer.tick', fct);

    setTimeout(function() {
        a.message.unbind('a.timer.tick', fct);

        // The test can run between 4 and 5 tick (as setTimeout is not precise)
        if(tickCount !== 4 && tickCount !== 5) {
            // In this case, a problem occurs
            assert.ok(1==2, 'Test fail, it has to be between 4 and 5 asserts. ' +
                'But instead it raise ' + tickCount + ' tests');
        }

        QUnit.start();
    }, 200);
});

// Test add function
QUnit.asyncTest('a.timer.add-get', function(assert) {
    assert.expect(6);

    // We don't use expect as it can vary between 5 and 6 tick...
    var tickCount = 3;

    // We test many timer
    var idNull = a.timer.add(null, null, 50);

    var elementNull = a.timer.get(idNull);
    assert.strictEqual(elementNull.fct, null);
    assert.strictEqual(elementNull.scope, null);

    var idElement = a.timer.add(function() {
        assert.strictEqual(true, true, 'function tick');
        tickCount++;
    }, null, 100);

    var elementElement = a.timer.get(idElement);
    assert.strictEqual(elementElement.timeout, 100);

    setTimeout(function() {
        // The test can run between 5 and 6 tick (as setTimeout is not precise)
        if(tickCount !== 5 && tickCount !== 6) {
            // In this case, a problem occurs
            assert.ok(1==2, 'Test fail, it has to be between 5 and 6 asserts. ' +
                'But instead it raise ' + tickCount + ' tests');
        }

        QUnit.start();
    }, 270);
});

// Test once function
QUnit.asyncTest('a.timer.once', function(assert) {
    assert.expect(1);

    a.timer.once(function() {
        assert.strictEqual(true, true, 'Test raise once');
    }, null, 50);

    setTimeout(QUnit.start, 250);
});

// Test remove function
QUnit.asyncTest('a.timer.remove', function(assert) {
    assert.expect(0);

    a.timer.clear();

    var id = a.timer.add(function() {
        assert.strictEqual(true, true, 'Test raise once');
    }, null, 50);

    a.timer.remove(id);

    setTimeout(QUnit.start, 250);
});
