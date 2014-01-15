// Unit test for a.timer

module('core/timer.js');

// Test timer tick system
test('a.timer.tick', function() {
    stop();
    expect(4);

    a.timer.clear();
    var se = strictEqual,
        st = start;

    var fct = function() {
        se(true, true, 'tick');
    };
    a.message.bind('a.timer.tick', fct);

    setTimeout(function() {
        a.message.unbind('a.timer.tick', fct);
        st();
    }, 200);
});

// Test add function
test('a.timer.add-get', function() {
    stop();
    expect(5);

    a.timer.clear();
    var se = strictEqual,
        st = start;

    // We test many timer
    var idNull = a.timer.add(null, null, 50);

    var elementNull = a.timer.get(idNull);
    strictEqual(elementNull.fct, null);
    strictEqual(elementNull.scope, null);

    var idElement = a.timer.add(function() {
        se(true, true, 'function tick');
    }, null, 100);

    var elementElement = a.timer.get(idElement);
    strictEqual(elementElement.timeout, 100);

    setTimeout(function() {
        a.timer.clear();
        st();
    }, 270);
});

// Test once function
test('a.timer.once', function() {
    stop();
    expect(1);

    a.timer.clear();
    var se = strictEqual,
        st = start;

    a.timer.once(function() {
        se(true, true, 'Test raise once');
    }, null, 50);

    setTimeout(function() {
        a.timer.clear();
        st();
    }, 250);
});

// Test remove function
test('a.timer.remove', function() {
    stop();
    expect(0);

    a.timer.clear();
    var se = strictEqual;

    var id = a.timer.add(function() {
        se(true, true, 'Test raise once');
    }, null, 50);

    a.timer.remove(id);

    setTimeout(start, 250);
});
