// Unit test for a.callback (plugin)

module("PLUGIN/callback");

/*
---------------------------------
  SYNCHRONIZER RELATED
---------------------------------
*/
test("a.callback.synchronizer-working", function() {
	stop();
	expect(1);

	/*
	 * The idea : we start a timeout which will fail everything if the clearTimeout is not called before final time
	 * So we set 4 function 100ms each (so 400ms in chainer), and timeout at 200ms.
	 * The synchronizer has to start all function on same time, so 100ms < 200ms, the final callback have time to stop
	*/


	// Prevent scope change
	var se = strictEqual,
		st = start;

	// This timeout has to be removed by final callback, or the test will fail (too much test)
	var time = setTimeout(function() {
		se(true, true, "The test fail : this event should be cancelled on time");
	}, 200);

	var sync = new a.callback.synchronizer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.success, 100);
	};
	var finalCallback = function() {
		clearTimeout(time);
		se(true, true, "The test succeed : the system could stop event before final time");
		st();
	};

	// Now running system
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.setSuccess(finalCallback);
	sync.start();
});



test("a.callback.synchronizer-error", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	// This timeout has to be removed by final callback, or the test will fail (too much test)
	var time = setTimeout(function() {
		se(true, true, "The test fail : this event should be cancelled on time");
	}, 200);

	var sync = new a.callback.synchronizer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.fail, 100);
	};
	var finalCallback = function() {
		clearTimeout(time);
		se(true, true, "The test succeed : the system could stop event before final time");
		st();
	};

	// Now running system
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.setFail(finalCallback);
	sync.start();
});



test("a.callback.synchronizer-timeout-isrunning", function() {
	stop();
	expect(3);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	var sync = new a.callback.synchronizer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.success, 100);
	};
	var finalCallback = function(obj) {
		se(obj.timeout, 40, "The test succeed : the system stop on timeout");
		st();
	};

	// Now running system
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.setFail(finalCallback);

	// We test isRunning parameter
	strictEqual(sync.isRunning(), false, "Test isRunning state before starting");
	sync.start(40);
	strictEqual(sync.isRunning(), true, "Test isRunning state after starting");
});



test("a.callback.synchronizer-removecallback", function() {
	stop();
	expect(1);

	/*
	 * We set a pretty short timeout on synchronizer.start, because the removeCallback should remove all callback...
	 * So all callback 100ms function will be disabled, which makes the system starting success function right before 50ms...
	*/

	// Prevent scope change
	var se = strictEqual,
		st = start;

	var sync = new a.callback.synchronizer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.success, 100);
	};
	var defaultCallback2 = function(result) {
		result.success();
	};
	var finalCallback = function() {
		se(true, true, "The test succeed : the system could stop event before final time");
		st();
	};

	// Now running system
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback);
	sync.addCallback(defaultCallback2);
	sync.removeCallback(defaultCallback);
	sync.setSuccess(finalCallback);

	sync.start(50);
});


// We check that synchronizer, without any callback, raise success function
test("a.callback.synchronizer-nocallback", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	var sync = new a.callback.synchronizer();

	var finalCallback = function() {
		se(true, true, "The test succeed : the system could stop event before final time");
		st();
	};

	sync.setSuccess(finalCallback);

	sync.start();
});


// Sending data threw callback works
test("a.callback.synchronizer-data", function() {
	stop();
	expect(2);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	var sync = new a.callback.synchronizer();

	sync.addCallback(function(result) {
		result.setData("ok", "hello");
		return result.done();
	});

	sync.addCallback(function(result) {
		result.setData("ok2", "hello2");
		return result.done();
	});

	var finalCallback = function(obj) {
		se(obj["ok"], "hello", "The first stored data");
		se(obj["ok2"], "hello2", "The second stored data");
		st();
	};

	sync.setSuccess(finalCallback);
	sync.start();
});



/*
---------------------------------
  BOTH RELATED
---------------------------------
*/


// Because synchronizer and chainer got same initial prototype, we make sure any changes will broke the fact they are separated...
// Se we run multiple instance of both, and check they are running alone each of them
test("a.callback.synchronizer-chainer", function() {
	stop();
	expect(10);

	var sync1  = new a.callback.synchronizer(),
		sync2  = new a.callback.synchronizer(),
		chain1 = new a.callback.chainer(),
		chain2 = new a.callback.chainer();

	// Prevent scope change
	var se = strictEqual,
		st = start;

	var currentIndex = 0;

	// We will add 7 times this callback, two for each system and one alone
	var defaultCallback = function(result) {
		result.success();
		se(true, true, "Not final result");
	};
	// We add it 3 times : one of them will not have any success function
	var finalCallback = function() {
		se(true, true, "The test succeed : the system could stop event before final time");
	};

	sync1.addCallback(defaultCallback);
	sync1.addCallback(defaultCallback);
	sync2.addCallback(defaultCallback);
	sync2.addCallback(defaultCallback);
	chain1.addCallback(defaultCallback);
	chain1.addCallback(defaultCallback);
	chain2.addCallback(defaultCallback);

	sync2.setSuccess(finalCallback);
	chain1.setSuccess(finalCallback);
	chain2.setSuccess(finalCallback);

	start();

	sync1.start();
	sync2.start();
	chain1.start();
	chain2.start();
});



/*
---------------------------------
  CHAINER RELATED
---------------------------------
*/


test("a.callback.chainer-working", function() {
	stop();
	expect(1);

	/*
	 * The idea : we compare date between start and end time, allowing to check elapsed time is correct (all run until end)
	*/


	// Prevent scope change
	var se = ok,
		st = start;

	var time = (new Date()).getTime();

	var chain = new a.callback.chainer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.success, 100);
	};
	var finalCallback = function() {
		var newTime = (new Date()).getTime();
		// Using timer is not extremely precise, but will be around 400ms as expected
		se(newTime - time > 300, "The system wait as expected chain to finish");
		st();
	};

	// Now running system
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.setSuccess(finalCallback);
	chain.start();
});



test("a.callback.chainer-error", function() {
	stop();
	expect(1);

	/*
	 * The idea : we compare date between start and end time, allowing to check elapsed time is correct (only one run, other stop)
	*/

	// Prevent scope change
	var se = ok,
		st = start;

	var time = (new Date()).getTime();

	var chain = new a.callback.chainer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.error, 100);
	};
	var finalCallback = function() {
		var newTime = (new Date()).getTime();
		se(newTime - time < 150, "The system wait as expected chain to finish");
		st();
	};

	// Now running system
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.setFail(finalCallback);
	chain.start();
});



test("a.callback.chainer-removeCallback", function() {
	stop();
	expect(1);

	/*
	 * The idea : we remove all callback, then success should be called directly, under 100ms
	*/

	// Prevent scope change
	var se = ok,
		st = start;

	var time = (new Date()).getTime(),
		chain = new a.callback.chainer();

	// We will add 4 times this callback, then raise final callback
	var defaultCallback = function(result) {
		setTimeout(result.error, 100);
	};
	var finalCallback = function() {
		var newTime = (new Date()).getTime();
		se(newTime - time < 50, "The system wait as expected chain to finish");
		st();
	};

	// Now running system
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.addCallback(defaultCallback);
	chain.removeCallback(defaultCallback);
	chain.setSuccess(finalCallback);
	chain.start();
});


// We test that without callback, chainer start success directly
test("a.callback.chainer-nocallback", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = ok,
		st = start;

	var chain = new a.callback.chainer();

	var finalCallback = function() {
		se(1==1, "The system directly output result");
		st();
	};

	// Now running system
	chain.setSuccess(finalCallback);
	chain.start();
});


// Sending data threw callback works
test("a.callback.chainer-data", function() {
	stop();
	expect(3);

	// Prevent scope change
	var se = ok,
		st = start;

	var chain = new a.callback.chainer();

	var finalCallback = function(obj) {
		se(obj["ok"], "hello", "Test data stored");
		se(obj["ok2"], "hello2", "Test data stored");
		st();
	};

	chain.addCallback(function(result) {
		result.setData("ok", "hello", "Test data");
		result.done();
	});

	chain.addCallback(function(result) {
		result.setData("ok2", "hello2", "Test data");
		se(result.getData("ok"), "hello", "The system send data");
		result.done();
	});

	// Now running system
	chain.setSuccess(finalCallback);
	chain.start();
});