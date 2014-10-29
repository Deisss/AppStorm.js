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
    expect(4);

    a.console.log('one log', null, false);
    a.console.log('second log', null, false);
    a.console.log('third log', null, false);

    var trace = a.console.trace();

    assert.strictEqual(trace['log'].length, 3, 'Testing log size');
    assert.strictEqual(trace['log'][0], 'one log', 'Testing log trace');
    assert.strictEqual(trace['log'][1], 'second log', 'Testing log trace');
    assert.strictEqual(trace['log'][2], 'third log', 'Testing log trace');
});

// Testing console 'info' mode
QUnit.test('a.console.info', function(assert) {
    expect(4);

    a.console.info('one information', null, false);
    a.console.info('second information', null, false);
    a.console.info('third information', null, false);

    var trace = a.console.trace();

    assert.strictEqual(trace['info'].length, 3, 'Testing information size');
    assert.strictEqual(trace['info'][0], 'one information',
                                    'Testing information trace');
    assert.strictEqual(trace['info'][1], 'second information',
                                    'Testing information trace');
    assert.strictEqual(trace['info'][2], 'third information',
                                    'Testing information trace');
});

// Testing console 'warning' mode
QUnit.test('a.console.warn', function(assert) {
    expect(4);

    a.console.warn('one warning', null, false);
    a.console.warn('second warning', null, false);
    a.console.warn('third warning', null, false);

    var trace = a.console.trace();

    assert.strictEqual(trace['warn'].length, 3, 'Testing warning size');
    assert.strictEqual(trace['warn'][0], 'one warning', 'Testing warning trace');
    assert.strictEqual(trace['warn'][1], 'second warning', 'Testing warning trace');
    assert.strictEqual(trace['warn'][2], 'third warning', 'Testing warning trace');
});

// Testing console 'error' mode
QUnit.test('a.console.error', function(assert) {
    expect(4);

    a.console.error('one error', null, false);
    a.console.error('second error', null, false);
    a.console.error('third error', null, false);

    var trace = a.console.trace();

    assert.strictEqual(trace['error'].length, 3, 'Testing error size');
    assert.strictEqual(trace['error'][0], 'one error', 'Testing error trace');
    assert.strictEqual(trace['error'][1], 'second error', 'Testing error trace');
    assert.strictEqual(trace['error'][2], 'third error', 'Testing error trace');
});

// Testing trace (console keep data...)
QUnit.test('a.console.trace', function(assert) {
    expect(5);

    a.console.log('ok', null, false);
    a.console.log('ok2', null, false);
    a.console.log('ok3', null, false);
    a.console.warn('ok', null, false);

    var trace = a.console.trace();
    var log = trace['log'],
        warn = trace['warn'];

    assert.strictEqual(log[0], 'ok', 'Testing trace content');
    assert.strictEqual(log[1], 'ok2', 'Testing trace content');
    assert.strictEqual(log[2], 'ok3', 'Testing trace content');
    assert.strictEqual(warn[0], 'ok', 'Testing trace content');

    // Now we send more than 2000 request on log,
    // we check the trace remove too old data
    for(var i=0; i<2100; ++i) {
        a.console.log('ok', null, false);
    }

    var fullTrace = a.console.trace();
    assert.strictEqual(fullTrace['log'].length, 2000, 'Testing full stack');
});

// Testing trace (console keep data...)
QUnit.test('a.console.trace-type', function(assert) {
    expect(4);

    a.console.log('ok', null, false);
    a.console.log('ok2', null, false);
    a.console.log('ok3', null, false);
    a.console.warn('ok', null, false);

    var log = a.console.trace('log');

    assert.strictEqual(log[0], 'ok', 'Testing trace content');
    assert.strictEqual(log[1], 'ok2', 'Testing trace content');
    assert.strictEqual(log[2], 'ok3', 'Testing trace content');

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
    expect(4);

    a.console.log('ok', null, false);
    a.console.warn('ok', null, false);

    var trace = a.console.trace();

    assert.strictEqual(trace['log'].length, 1, 'Testing log before clear');
    assert.strictEqual(trace['warn'].length, 1, 'Testing warning before clear');

    a.console.clear();
    var newTrace = a.console.trace();

    assert.strictEqual(newTrace['log'].length, 0, 'Testing log after clear');
    assert.strictEqual(newTrace['warn'].length, 0, 'Testing warning after clear');
});