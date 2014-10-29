// Unit test for a.keyboard (plugin)

QUnit.module('plugin/keyboard.js', {
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

QUnit.asyncTest('a.keyboard.bind', function(assert) {
    assert.expect(3);

    var callback = function(e) {
        assert.strictEqual(true, true, 'Event where fired as expected');
    };

    a.keyboard.bind('a', callback);
    a.keyboard.bind('a', callback, 'keydown');
    a.keyboard.bind('a', callback, 'keyup');
    a.keyboard.bind('c', callback);
    a.keyboard.bind('c', callback, 'keydown');
    a.keyboard.bind('c', callback, 'keyup');

    // Now launching mousetrap trigger (only one of two callback should pass)
    Mousetrap.trigger('a', 'keypress');

    setTimeout(QUnit.start, 100);
});

QUnit.asyncTest('a.keyboard.unbind', function(assert) {
    assert.expect(2);

    var callback = function() {
        assert.strictEqual(true, true, 'Event where fired as expected');
    };

    a.keyboard.bind('a', callback);
    a.keyboard.bind('c', callback);

    // Now launching mousetrap trigger (only one of two callback should pass)
    Mousetrap.trigger('a', 'keypress');

    a.keyboard.unbind('a', callback);

    Mousetrap.trigger('a', 'keypress');
    Mousetrap.trigger('c', 'keypress');

    setTimeout(QUnit.start, 100);
});