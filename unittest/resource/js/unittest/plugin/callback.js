// Unit test for a.callback (plugin)

module('plugin/callback.js');

/*
---------------------------------
  SYNCHRONIZER RELATED
---------------------------------
*/
asyncTest('a.callback.synchronizer-working', function() {
    expect(1);

    /*
     * The idea : we start a timeout which will fail everything
     * if the clearTimeout is not called before final time
     * So we set 4 function 100ms each (so 400ms in chainer),
     * and timeout at 200ms.
     * The synchronizer has to start all function on same time,
     * so 100ms < 200ms, the final callback have time to stop
    */

    // This timeout has to be removed by final callback,
    // or the test will fail (too much test)
    var time = setTimeout(function() {
        strictEqual(true, true,
            'The test fail : this event should be cancelled on time');
    }, 200);

    // We will add 4 times this callback, then raise final callback
    var defaultCallback = function(result) {
        setTimeout(result.success, 100);
    };
    var finalCallback = function() {
        clearTimeout(time);
        strictEqual(true, true,
          'The test succeed : the system could stop event before final time');
        start();
    };

    var sync = a.callback.synchronizer([
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback
    ],
        finalCallback
    );

    // Now running system
    sync.start();
});



asyncTest('a.callback.synchronizer-error', function() {
    expect(1);

    // This timeout has to be removed by final callback,
    // or the test will fail (too much test)
    var time = setTimeout(function() {
        strictEqual(true, true,
            'The test fail : this event should be cancelled on time');
    }, 200);

    // We will add 4 times this callback, then raise final callback
    var defaultCallback = function(result) {
        setTimeout(result.fail, 100);
    };
    var finalCallback = function() {
        clearTimeout(time);
        strictEqual(true, true,
          'The test succeed : the system could stop event before final time');
        start();
    };

    // Now running system
    var sync = a.callback.synchronizer([
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback
    ],
        null,
        finalCallback
    );
    sync.start();
});



asyncTest('a.callback.synchronizer-removecallback', function() {
    expect(1);

    /*
     * We set a pretty short timeout on synchronizer.start,
     * because the removeCallback should remove all callback...
     * So all callback 100ms function will be disabled,
     * which makes the system starting success function right before 50ms...
    */

    // We will add 4 times this callback, then raise final callback
    var defaultCallback = function(result) {
        setTimeout(result.success, 100);
    };
    var defaultCallback2 = function(result) {
        result.success();
    };
    var finalCallback = function() {
        strictEqual(true, true,
          'The test succeed : the system could stop event before final time');
        start();
    };

    // Now running system
    var sync = a.callback.synchronizer([
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback2
    ],
        finalCallback
    );
    sync.removeCallback(defaultCallback);

    sync.start();
});


// We check that synchronizer, without any callback, raise success function
asyncTest('a.callback.synchronizer-nocallback', function() {
    expect(1);

    var finalCallback = function() {
        strictEqual(true, true,
          'The test succeed : the system could stop event before final time');
        start();
    };

    var sync = a.callback.synchronizer(null, finalCallback);

    sync.start();
});


// Sending data threw callback works
asyncTest('a.callback.synchronizer-data', function() {
    expect(2);

    var finalCallback = function(result) {
        strictEqual(result.getData('ok'), 'hello', 'The first stored data');
        strictEqual(result.getData('ok2'), 'hello2', 'The second stored data');
        start();
    };

    var sync = a.callback.synchronizer(null, finalCallback);

    sync.addCallback(function(result) {
        result.setData('ok', 'hello');
        return result.done();
    });

    sync.addCallback(function(result) {
        result.setData('ok2', 'hello2');
        return result.done();
    });

    sync.start();
});


// Test sending data threw start function
asyncTest('a.callback.synchronizer-initial-data', function() {
    expect(4);

    function defaultCallback(arg1, arg2, result) {
        strictEqual(arg1, 'ok');
        strictEqual(arg2, 2);
        result.done();
    };

    var sync = a.callback.synchronizer([
        defaultCallback,
        defaultCallback
    ], start);
    sync.start('ok', 2);
});

// Test addCallback manually
asyncTest('a.callback.synchronizer-addCallback', function() {
    expect(5);

    function defaultCallback() {
        strictEqual(true, true, 'Test default callback');
        this.next();
    };

    function finalCallback() {
        strictEqual(true, true, 'Test final callback');
    };

    var sync1 = a.callback.synchronizer(),
        sync2 = a.callback.synchronizer();

    sync1.addCallback(defaultCallback);
    sync1.addCallback(defaultCallback);

    sync2.addCallback(defaultCallback);

    sync1.successFunction = finalCallback;
    sync2.successFunction = finalCallback;

    sync1.start();
    sync2.start();

    // Release unit test
    setTimeout(start, 100);
});


// Test event success, error, start event
asyncTest('a.callback.synchronizer-event', function() {
    expect(2);

    var sync = a.callback.synchronizer();

    sync.bind('start', function() {
        strictEqual(true, true);
    });
    sync.bind('success', function() {
        strictEqual(true, true);
        start();
    });

    sync.start();
});



// Test the result scope element
asyncTest('a.callback.synchronizer-resultScope', function() {
    expect(1);

    var sync = a.callback.synchronizer(null, function() {
        strictEqual(this.ok, 'ok');
        start();
    });

    sync.scope = {
        ok: 'not-ok'
    };
    sync.resultScope = {
        ok: 'ok'
    };

    sync.start();
});




/*
---------------------------------
  BOTH RELATED
---------------------------------
*/


// Because synchronizer and chainer got same initial prototype,
// we make sure any changes will broke the fact they are separated...
// Se we run multiple instance of both,
// and check they are running alone each of them
asyncTest('a.callback.synchronizer-chainer', function() {
    expect(10);

    // We will add 7 times this callback, two for each system and one alone
    var defaultCallback = function(result) {
        result = result || this;
        strictEqual(true, true, 'Not final result ');
        result.success();
    };
    // We add it 3 times : one of them will not have any success function
    var finalCallback = function() {
        strictEqual(true, true,
           'The test succeed : the system could stop event before final time');
    };

    var sync1  = a.callback.synchronizer(),
        sync2  = a.callback.synchronizer(),
        chain1 = a.callback.chainer([
            defaultCallback,
            defaultCallback
        ],
            finalCallback
        ),
        chain2 = a.callback.chainer([
            defaultCallback
        ],
            finalCallback
        );

    sync1.addCallback(defaultCallback);
    sync1.addCallback(defaultCallback);

    sync2.addCallback(defaultCallback);
    sync2.addCallback(defaultCallback);

    sync2.successFunction = finalCallback;

    chain1.successFunction = finalCallback;
    chain2.successFunction = finalCallback;

    sync1.start();
    sync2.start();
    chain1.start();
    chain2.start();

    setTimeout(start, 150);
});


// This time, we do the same, but we include a scope change
asyncTest('a.callback.synchronizer-chainer-with-scope', function() {
    expect(10);

    // We will add 7 times this callback, two for each system and one alone
    var defaultCallback = function(result) {
        result = result || this;
        strictEqual(true, true, 'Not final result ');
        result.success();
    };
    // We add it 3 times : one of them will not have any success function
    var finalCallback = function() {
        strictEqual(true, true,
           'The test succeed : the system could stop event before final time');
    };

    var sync1  = a.callback.synchronizer(),
        sync2  = a.callback.synchronizer(),
        chain1 = a.callback.chainer([
            defaultCallback,
            defaultCallback
        ],
            finalCallback
        ),
        chain2 = a.callback.chainer([
            defaultCallback
        ],
            finalCallback
        ),
        o = {};

    sync1.addCallback(defaultCallback);
    sync1.addCallback(defaultCallback);

    sync2.addCallback(defaultCallback);
    sync2.addCallback(defaultCallback);

    sync2.successFunction = finalCallback;

    chain1.successFunction = finalCallback;
    chain2.successFunction = finalCallback;

    sync1.scope = o;
    sync1.start();
    sync2.scope = o;
    sync2.start();
    chain1.scope = o;
    chain1.start();
    chain2.scope = o;
    chain2.start();

    setTimeout(start, 150);
});



/*
---------------------------------
  CHAINER RELATED
---------------------------------
*/


asyncTest('a.callback.chainer-working', function() {
    expect(1);

    /*
     * The idea : we compare date between start and end time,
     * allowing to check elapsed time is correct (all run until end)
    */

    var time = (new Date()).getTime();

    // We will add 4 times this callback, then raise final callback
    var defaultCallback = function() {
        var that = this;
        setTimeout(function() {
            that.next.apply(that);
        }, 100);
    };
    var finalCallback = function() {
        var newTime = (new Date()).getTime();
        // Using timer is not extremely precise,
        // but will be around 400ms as expected
        ok(newTime - time > 300,
                        'The system wait as expected chain to finish');
        start();
    };

    var chain = a.callback.chainer([
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback
    ],
        finalCallback
    );

    // Running system
    chain.start();
});



asyncTest('a.callback.chainer-error', function() {
    expect(1);

    /*
     * The idea : we compare date between start and end time,
     * allowing to check elapsed time is correct (only one run, other stop)
    */

    // Prevent scope change
    var time = (new Date()).getTime();

    // We will add 4 times this callback, then raise final callback
    var defaultCallback = function() {
        var that = this;
        setTimeout(function() {
            that.stop.apply(that);
        }, 100);
    };
    var finalCallback = function() {
        var newTime = (new Date()).getTime();
        ok(newTime - time < 150,
                        'The system wait as expected chain to finish');
        start();
    };

    var chain = a.callback.chainer([
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback
    ],
        null,
        finalCallback
    );
    // Now running system
    chain.start();
});


// Test passing arguments
asyncTest('a.callback.chainer-arguments', function() {
    expect(5);

    function firstCallback(chain) {
        strictEqual(true, true, 'First callback');
        chain.setData('ok', 'yatta');
        // Passing a string to next element
        chain.next('something');
    };

    function secondCallback(str, chain) {
        strictEqual(str, 'something', 'Test argument');
        strictEqual(chain.getData('ok'), 'yatta', 'Arguments passed threw data');
        chain.next('ok', 2);
    };

    function finalCallback(str1, int1, chain) {
        strictEqual(str1, 'ok', 'Test arg1');
        strictEqual(int1, 2, 'Test arg2');
        start();
    };

    var chain = a.callback.chainer(
                    [firstCallback, secondCallback], finalCallback);
    chain.start();
});


// Test addCallback manually
asyncTest('a.callback.chainer-addCallback', function() {
    expect(5);

    function defaultCallback() {
        strictEqual(true, true, 'Test default callback');
        this.next();
    };

    function finalCallback() {
        strictEqual(true, true, 'Test final callback');
    };

    var chain1 = a.callback.chainer(),
        chain2 = a.callback.chainer();

    chain1.addCallback(defaultCallback);
    chain1.addCallback(defaultCallback);

    chain2.addCallback(defaultCallback);

    chain1.successFunction = finalCallback;
    chain2.successFunction = finalCallback;

    chain1.start();
    chain2.start();

    // Release unit test
    setTimeout(start, 100);
});



asyncTest('a.callback.chainer-removeCallback', function() {
    expect(1);

    /*
     * The idea : we remove all callback,
     * then success should be called directly, under 100ms
    */

    // Prevent scope change
    var time = (new Date()).getTime();

    // We will add 4 times this callback, then raise final callback
    var defaultCallback = function() {
        var that = this;
        setTimeout(function() {
            that.error.apply(that);
        }, 100);
    };
    var finalCallback = function() {
        var newTime = (new Date()).getTime();
        ok(newTime - time < 50, 'The system wait as expected chain to finish');
        start();
    };

    // Now running system
    var chain = a.callback.chainer([
        defaultCallback,
        defaultCallback,
        defaultCallback,
        defaultCallback
    ],
        finalCallback
    );

    // We remove all first callbacks to keep only success
    chain.removeCallback(defaultCallback);
    chain.start();
});


// We test that without callback, chainer start success directly
asyncTest('a.callback.chainer-nocallback', function() {
    expect(1);

    var finalCallback = function() {
        ok(1==1, 'The system directly output result');
        start();
    };

    // Now running system
    var chain = a.callback.chainer(null, finalCallback);
    chain.start();
});


// Sending data threw callback works
asyncTest('a.callback.chainer-data', function() {
    expect(3);

    var finalCallback = function(obj) {
        strictEqual(this.getData('ok'), 'hello', 'Test data stored');
        strictEqual(this.data['ok2'], 'hello2', 'Test data stored');
        start();
    };

    var chain = a.callback.chainer(null, finalCallback);

    chain.addCallback(function() {
        this.setData('ok', 'hello', 'Test data');
        this.done();
    });

    chain.addCallback(function() {
        this.setData('ok2', 'hello2', 'Test data');
        strictEqual(this.getData('ok'), 'hello', 'The system send data');
        this.done();
    });

    // Now running system
    chain.start();
});

asyncTest('a.callback.chainer-event', function() {
    expect(2);

    var chain = a.callback.chainer();

    chain.bind('start', function() {
        strictEqual(true, true);
    });
    chain.bind('success', function() {
        strictEqual(true, true);
        start();
    });

    chain.start();
});

// Test result scope on chainer
asyncTest('a.callback.chainer-resultScope', function() {
    expect(1);

    var chain = a.callback.chainer(null, function() {
        strictEqual(this.ok, 'ok');
        start();
    });

    chain.scope = {
        ok: 'not-ok'
    };
    chain.resultScope = {
        ok: 'ok'
    };

    chain.start();
});