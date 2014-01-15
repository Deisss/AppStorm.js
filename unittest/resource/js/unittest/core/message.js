// Unit test for a.message (and in the same time eventEmitter)

module('core/message.js');

// Testing bind function and dispatching event
test('a.message.bind-dispatch', function() {
    stop();
    // We expect 2 times callback
    expect(3);
    // Clear before use
    a.message.clear();

    var callback = function() {
        ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        ok(true, 'Checking callback response');
    }
    var callback3 = function() {
        ok(true, 'Checking callback response');
    };

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);
    a.message.bind('a.unittest2', callback3);

    start();

    // Now we have to start 2 events only
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');
});

// Testing unbind function
test('a.message.unbind', function() {
    stop();
    // We expect 2 times callback
    expect(2);
    // Clear before use
    a.message.clear();

    var callback = function() {
        ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        ok(true, 'Checking callback response');
    }
    var callback3 = function() {
        ok(true, 'Checking callback response');
    };

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);
    a.message.bind('a.unittest2', callback3);

    // Now we remove (only one will be remove, one is wrong here
    a.message.unbind('a.unittest2', callback2);
    a.message.unbind('a.unittest2', callback3);

    start();

    // Now we have to start 2 events only
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');
});

// Testing remove all listeners of the given type
test('a.message.unbindAll', function() {
    stop();
    // We expect 2 times callback
    expect(1);
    // Clear before use
    a.message.clear();

    var callback = function() {
        ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        ok(true, 'Checking callback response');
    }
    var callback3 = function() {
        ok(true, 'Checking callback response');
    };

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);
    a.message.bind('a.unittest2', callback3);

    // Now we remove (only one will be remove, one is wrong here
    a.message.unbindAll('a.unittest');

    start();

    // Now we have to start 2 events only
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');
});

// Testing message clearing
test('a.message.clear', function() {
    stop();
    expect(1);
    // Clear before use
    a.message.clear();

    // We add callback like normal
    var callback = function() {
        ok(true, 'Checking callback response');
    };
    var callback2 = function() {
        ok(true, 'Checking callback response');
    }

    a.message.bind('a.unittest', callback);
    a.message.bind('a.unittest', callback2);

    // Now we clear
    a.message.clear();

    start();

    var callback3 = function() {
        ok(true, 'Checking callback response');
    };
    a.message.bind('a.unittest2', callback3);

    // Now we have to start 2 events only, only one callback will be fired
    a.message.dispatch('a.unittest');
    a.message.dispatch('a.unittest2');
});


// Testing eventListener does work with many sub object
test('a.message.multiple-instance', function() {
    stop();
    expect(5);
    a.message.clear();

    var se = strictEqual;

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
        se(data, 'obj1', 'Test obj1');
    });
    o2.bind('obj.dispatch', function(data) {
        se(data, 'obj2', 'Test obj2');
    });

    o1.bind('obj1.clear', function() {
        se(true, true, 'test clear');
    });
    o2.bind('obj2.clear', function() {
        se(true, true, 'test clear');
    });

    a.message.bind('a.message.clear', function() {
        se(true, true, 'test clear');
    });


    //Start system
    o1.ok();
    o2.ok();
    o1.clear();
    o2.clear();
    a.message.clear();

    start();
});