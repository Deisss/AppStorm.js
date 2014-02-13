// Unit test for a.keyboard (plugin)

module('plugin/keyboard.js');

/*
 * Note : because keyboard plugin is just a bind to Mousetrap,
 *        we just do one basic test nothing more.
 * Note : please run unit test from Mousetrap for more deeper unit test
 *        (you can found them on /unittest/vendor/mousetrap)
*/

test('a.keyboard.bind', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var callback = function() {
        se(true, true, 'Event where fired as expected');
        a.keyboard.reset();
        st();
    };

    a.keyboard.bind('a', callback);
    a.keyboard.bind('c', callback);

    // Now launching mousetrap trigger (only one of two callback should pass)
    Mousetrap.trigger('a');
});

test('a.keyboard.unbind', function() {
    stop();
    expect(2);

    // Prevent scope change
    var se = strictEqual;

    var callback = function() {
        se(true, true, 'Event where fired as expected');
        a.keyboard.reset();
    };

    a.keyboard.bind('a', callback);
    a.keyboard.bind('c', callback);

    // Now launching mousetrap trigger (only one of two callback should pass)
    Mousetrap.trigger('a');

    a.keyboard.unbind('a', callback);

    Mousetrap.trigger('a');
    Mousetrap.trigger('c');

    var st = start;
    setTimeout(function() {
        a.keyboard.reset();
        st();
    }, 250);
});