// Unit test for a.message (and in the same time eventEmitter)

QUnit.module('core/message.js', {
    setup: function() {
        a.message.clear();
    },
    teardown: function() {
        a.message.clear();
    }
});


// Testing bind function and dispatching event
QUnit.asyncTest('a.message.bind-dispatch', function(assert) {
    assert.expect(3);

    var callback = function() {
        assert.ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        assert.ok(true, 'Checking callback response');
    }
    var callback3 = function() {
        assert.ok(true, 'Checking callback response');
    };

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);
    a.message.bind('a.unittest2', callback3);

    // Now we have to start 2 events only
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');

    setTimeout(start, 100);
});

// Testing unbind function
QUnit.asyncTest('a.message.unbind', function(assert) {
    assert.expect(2);

    var callback = function() {
        assert.ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        assert.ok(true, 'Checking callback response');
    }
    var callback3 = function() {
        assert.ok(true, 'Checking callback response');
    };

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);
    a.message.bind('a.unittest2', callback3);

    // Now we remove (only one will be remove, one is wrong here
    a.message.unbind('a.unittest2', callback2);
    a.message.unbind('a.unittest2', callback3);

    // Now we have to start 2 events only
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');

    setTimeout(start, 100);
});

// Testing remove all listeners of the given type
QUnit.asyncTest('a.message.unbindAll', function(assert) {
    assert.expect(1);

    var callback = function() {
        assert.ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        assert.ok(true, 'Checking callback response');
    }
    var callback3 = function() {
        assert.ok(true, 'Checking callback response');
    };

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);
    a.message.bind('a.unittest2', callback3);

    // Now we remove (only one will be remove, one is wrong here
    a.message.unbindAll('a.unittest');

    // Now we have to start 2 events only
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');

    setTimeout(start, 100);
});

// Testing message clearing
QUnit.asyncTest('a.message.clear', function(assert) {
    assert.expect(1);

    // We add callback like normal
    var callback = function() {
        assert.ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        assert.ok(true, 'Checking callback response');
    }

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);

    // Now we clear
    a.message.clear();

    var callback3 = function() {
        assert.ok(true, 'Checking callback response');
    };
    a.message.bind('a.unittest2', callback3);

    // Now we have to start 2 events only, only one callback will be fired
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');

    setTimeout(start, 100);
});


// Testing eventListener does work with many sub object
QUnit.asyncTest('a.message.multiple-instance', function(assert) {
    assert.expect(5);

    var obj1 = function() {
        // Starting an object
        var obj = function(){};
        obj.prototype = new a.eventEmitter('obj1');
        obj.prototype.constructor = this;

        obj.prototype.ok = function() {
            obj.prototype.dispatch('obj.dispatch', 'obj1');
        };

        var instance = new obj('obj1');
        return instance;
    };

    var obj2 = function() {
        // Starting an object
        var obj = function(){};
        obj.prototype = new a.eventEmitter('obj2');
        obj.prototype.constructor = this;

        obj.prototype.ok = function() {
            obj.prototype.dispatch('obj.dispatch', 'obj2');
        };

        var instance = new obj('obj2');
        return instance;
    };

    var o1 = new obj1();
    var o2 = new obj2();

    o1.bind('obj.dispatch', function(data) {
        assert.strictEqual(data, 'obj1', 'Test obj1');
    });
    o2.bind('obj.dispatch', function(data) {
        assert.strictEqual(data, 'obj2', 'Test obj2');
    });

    o1.bind('obj1.clear', function() {
        assert.strictEqual(true, true, 'test clear');
    });
    o2.bind('obj2.clear', function() {
        assert.strictEqual(true, true, 'test clear');
    });

    function doClear() {
        assert.strictEqual(true, true, 'test clear');
    };

    a.message.bind('a.message.clear', doClear);


    //Start system
    o1.ok();
    o2.ok();
    o1.clear();
    o2.clear();
    a.message.clear();

    setTimeout(function() {
        a.message.unbind('a.message.clear', doClear);
        start();
    }, 100);
});

// It's possible to bind, an unbindable function
// Except unbind function
QUnit.asyncTest('a.message.stop-clear', function(assert) {
    assert.expect(1);

    function doesSupportUnbindAll() {
        assert.strictEqual(1, 1, 'Test');
        start();
    };

    function doesNotSupportUnbindAll() {
        assert.strictEqual(0, 1, 'Wrong test');
    };

    a.message.bind('try-unbindAll', doesSupportUnbindAll, null, false, false);
    a.message.bind('try-unbindAll', doesNotSupportUnbindAll);

    // We try to remove everything
    a.message.unbindAll('try-unbindAll');
    a.message.clear();

    a.message.dispatch('try-unbindAll');
});