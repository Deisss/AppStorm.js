// Unit test for a.keyboard (plugin)

module('plugin/keyboard.js', {
    teardown: function() {
        a.keyboard.clear();
    }
});


/*
 * Note : because keyboard plugin is just a bind to Mousetrap,
 *        we just do one basic test nothing more.
 * Note : please run unit test from Mousetrap for more deeper unit test
 *        (you can found them on /unittest/vendor/mousetrap)
*/

asyncTest('a.keyboard.bind', function() {
    expect(1);

    var callback = function() {
        strictEqual(true, true, 'Event where fired as expected');
        start();
    };

    a.keyboard.bind('a', callback);
    a.keyboard.bind('c', callback);

    // Now launching mousetrap trigger (only one of two callback should pass)
    Mousetrap.trigger('a');
});

asyncTest('a.keyboard.unbind', function() {
    expect(2);

    var callback = function() {
        strictEqual(true, true, 'Event where fired as expected');
    };

    a.keyboard.bind('a', callback);
    a.keyboard.bind('c', callback);

    // Now launching mousetrap trigger (only one of two callback should pass)
    Mousetrap.trigger('a');

    a.keyboard.unbind('a', callback);

    Mousetrap.trigger('a');
    Mousetrap.trigger('c');

    setTimeout(start, 100);
});