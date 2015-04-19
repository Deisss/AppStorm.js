// Unit test for a.console

QUnit.module('core/console.js', {
    setup: function() {
        a.console.clear();
    },
    teardown: function() {
        a.console.clear();
    }
});




// Testing console 'log' mode
QUnit.test('a.console.log', function(assert) {
    assert.expect(4);

    a.console.log('one log');
    a.console.log('second log');
    a.console.log('third log');

    var trace = a.console.trace();

    console.log(trace);

    assert.strictEqual(trace.length, 3, 'Testing log size');
    assert.strictEqual(trace[0].args[0], 'one log', 'Testing log trace');
    assert.strictEqual(trace[1].args[0], 'second log', 'Testing log trace');
    assert.strictEqual(trace[2].args[0], 'third log', 'Testing log trace');
});

// Testing console 'info' mode
QUnit.test('a.console.info', function(assert) {
    assert.expect(4);

    a.console.info('one information');
    a.console.info('second information');
    a.console.info('third information');

    var trace = a.console.trace();

    assert.strictEqual(trace.length, 3, 'Testing information size');
    assert.strictEqual(trace[0].args[0], 'one information',
                                    'Testing information trace');
    assert.strictEqual(trace[1].args[0], 'second information',
                                    'Testing information trace');
    assert.strictEqual(trace[2].args[0], 'third information',
                                    'Testing information trace');
});

// Testing console 'warning' mode
QUnit.test('a.console.warn', function(assert) {
    assert.expect(4);

    a.console.warn('one warning');
    a.console.warn('second warning');
    a.console.warn('third warning');

    var trace = a.console.trace();

    assert.strictEqual(trace.length, 3, 'Testing warning size');
    assert.strictEqual(trace[0].args[0], 'one warning',
            'Testing warning trace');
    assert.strictEqual(trace[1].args[0], 'second warning',
            'Testing warning trace');
    assert.strictEqual(trace[2].args[0], 'third warning',
            'Testing warning trace');
});

// Testing console 'error' mode
QUnit.test('a.console.error', function(assert) {
    assert.expect(4);

    a.console.error('one error');
    a.console.error('second error');
    a.console.error('third error');

    var trace = a.console.trace();

    assert.strictEqual(trace.length, 3, 'Testing error size');
    assert.strictEqual(trace[0].args[0], 'one error', 'Testing error trace');
    assert.strictEqual(trace[1].args[0], 'second error',
            'Testing error trace');
    assert.strictEqual(trace[2].args[0], 'third error', 'Testing error trace');
});

// Testing trace (console keep data...)
QUnit.test('a.console.trace', function(assert) {
    assert.expect(5);

    a.console.log('ok');
    a.console.log('ok2');
    a.console.log('ok3');
    a.console.warn('ok');

    var log = a.console.trace('log'),
        warn = a.console.trace('warn');

    assert.strictEqual(log[0].args[0], 'ok', 'Testing trace content');
    assert.strictEqual(log[1].args[0], 'ok2', 'Testing trace content');
    assert.strictEqual(log[2].args[0], 'ok3', 'Testing trace content');
    assert.strictEqual(warn[0].args[0], 'ok', 'Testing trace content');

    // Now we send more than 2000 request on log,
    // we check the trace remove too old data
    for(var i=0; i<2100; ++i) {
        a.console.log('ok');
    }

    var fullTrace = a.console.trace();
    assert.strictEqual(fullTrace.length, 2000, 'Testing full stack');
});

// Testing trace (console keep data...)
QUnit.test('a.console.trace-type', function(assert) {
    assert.expect(4);

    a.console.log('ok');
    a.console.log('ok2');
    a.console.log('ok3');
    a.console.warn('ok');

    var log = a.console.trace('log');

    assert.strictEqual(log[0].args[0], 'ok', 'Testing trace content');
    assert.strictEqual(log[1].args[0], 'ok2', 'Testing trace content');
    assert.strictEqual(log[2].args[0], 'ok3', 'Testing trace content');

    // Now we send more than 2000 request on log,
    // we check the trace remove too old data
    for(var i=0; i<2100; ++i) {
        a.console.log('ok', null, false);
    }

    var fullLog = a.console.trace('log');
    assert.strictEqual(fullLog.length, 2000, 'Testing full stack');
});


// Testing console clearing trace system
QUnit.test('a.console.clear', function(assert) {
    assert.expect(3);

    a.console.log('ok');
    a.console.warn('ok');

    var log = a.console.trace('log'),
        warn = a.console.trace('warn');

    assert.strictEqual(log.length, 1, 'Testing log before clear');
    assert.strictEqual(warn.length, 1, 'Testing warning before clear');

    a.console.clear();
    var newTrace = a.console.trace();

    assert.strictEqual(newTrace.length, 0, 'Testing after clear');
});