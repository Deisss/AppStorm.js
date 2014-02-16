// Unit test for a.timer

module('core/timer.js', {
    setup: function() {
        a.timer.clear();
    },
    teardown: function() {
        a.timer.clear();
    }
});




// Test timer tick system
asyncTest('a.timer.tick', function() {
    // We don't use expect as it can vary between 4 and 5 tick...
    var tickCount = 0;

    var fct = function() {
        strictEqual(true, true, 'tick');
        tickCount++;
    };
    a.message.bind('a.timer.tick', fct);

    setTimeout(function() {
        a.message.unbind('a.timer.tick', fct);

        // The test can run between 4 and 5 tick (as setTimeout is not precise)
        if(tickCount !== 4 && tickCount !== 5) {
            // In this case, a problem occurs
            ok(1==2, 'Test fail, it has to be between 4 and 5 asserts. ' +
                'But instead it raise ' + tickCount + ' tests');
        }

        start();
    }, 200);
});

// Test add function
asyncTest('a.timer.add-get', function() {
    // We don't use expect as it can vary between 5 and 6 tick...
    var tickCount = 3;

    // We test many timer
    var idNull = a.timer.add(null, null, 50);

    var elementNull = a.timer.get(idNull);
    strictEqual(elementNull.fct, null);
    strictEqual(elementNull.scope, null);

    var idElement = a.timer.add(function() {
        strictEqual(true, true, 'function tick');
        tickCount++;
    }, null, 100);

    var elementElement = a.timer.get(idElement);
    strictEqual(elementElement.timeout, 100);

    setTimeout(function() {
        // The test can run between 5 and 6 tick (as setTimeout is not precise)
        if(tickCount !== 5 && tickCount !== 6) {
            // In this case, a problem occurs
            ok(1==2, 'Test fail, it has to be between 5 and 6 asserts. ' +
                'But instead it raise ' + tickCount + ' tests');
        }

        start();
    }, 270);
});

// Test once function
asyncTest('a.timer.once', function() {
    expect(1);

    a.timer.once(function() {
        strictEqual(true, true, 'Test raise once');
    }, null, 50);

    setTimeout(start, 250);
});

// Test remove function
asyncTest('a.timer.remove', function() {
    expect(0);

    a.timer.clear();

    var id = a.timer.add(function() {
        strictEqual(true, true, 'Test raise once');
    }, null, 50);

    a.timer.remove(id);

    setTimeout(start, 250);
});
