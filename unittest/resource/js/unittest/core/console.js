// Unit test for a.console

module('core/console.js');

testModuleDone('core/console.js', function() {
    a.console.clear();
});

testModuleStart('core/console.js', function() {
    a.console.clear();
});




// Testing console 'log' mode
test('a.console.log', function() {
    a.console.log('one log', null, false);
    a.console.log('second log', null, false);
    a.console.log('third log', null, false);

    var trace = a.console.trace();

    strictEqual(trace['log'].length, 3, 'Testing log size');
    strictEqual(trace['log'][0], 'one log', 'Testing log trace');
    strictEqual(trace['log'][1], 'second log', 'Testing log trace');
    strictEqual(trace['log'][2], 'third log', 'Testing log trace');
});

// Testing console 'info' mode
test('a.console.info', function() {
    a.console.info('one information', null, false);
    a.console.info('second information', null, false);
    a.console.info('third information', null, false);

    var trace = a.console.trace();

    strictEqual(trace['info'].length, 3, 'Testing information size');
    strictEqual(trace['info'][0], 'one information',
                                    'Testing information trace');
    strictEqual(trace['info'][1], 'second information',
                                    'Testing information trace');
    strictEqual(trace['info'][2], 'third information',
                                    'Testing information trace');
});

// Testing console 'warning' mode
test('a.console.warn', function() {
    a.console.warn('one warning', null, false);
    a.console.warn('second warning', null, false);
    a.console.warn('third warning', null, false);

    var trace = a.console.trace();

    strictEqual(trace['warn'].length, 3, 'Testing warning size');
    strictEqual(trace['warn'][0], 'one warning', 'Testing warning trace');
    strictEqual(trace['warn'][1], 'second warning', 'Testing warning trace');
    strictEqual(trace['warn'][2], 'third warning', 'Testing warning trace');
});

// Testing console 'error' mode
test('a.console.error', function() {
    a.console.error('one error', null, false);
    a.console.error('second error', null, false);
    a.console.error('third error', null, false);

    var trace = a.console.trace();

    strictEqual(trace['error'].length, 3, 'Testing error size');
    strictEqual(trace['error'][0], 'one error', 'Testing error trace');
    strictEqual(trace['error'][1], 'second error', 'Testing error trace');
    strictEqual(trace['error'][2], 'third error', 'Testing error trace');
});

// Testing trace (console keep data...)
test('a.console.trace', function() {
    a.console.log('ok', null, false);
    a.console.log('ok2', null, false);
    a.console.log('ok3', null, false);
    a.console.warn('ok', null, false);

    var trace = a.console.trace();
    var log = trace['log'],
        warn = trace['warn'];

    strictEqual(log[0], 'ok', 'Testing trace content');
    strictEqual(log[1], 'ok2', 'Testing trace content');
    strictEqual(log[2], 'ok3', 'Testing trace content');
    strictEqual(warn[0], 'ok', 'Testing trace content');

    // Now we send more than 2000 request on log,
    // we check the trace remove too old data
    for(var i=0; i<2100; ++i) {
        a.console.log('ok', null, false);
    }

    var fullTrace = a.console.trace();
    strictEqual(fullTrace['log'].length, 2000, 'Testing full stack');
});

// Testing trace (console keep data...)
test('a.console.trace-type', function() {
    a.console.log('ok', null, false);
    a.console.log('ok2', null, false);
    a.console.log('ok3', null, false);
    a.console.warn('ok', null, false);

    var log = a.console.trace('log');

    strictEqual(log[0], 'ok', 'Testing trace content');
    strictEqual(log[1], 'ok2', 'Testing trace content');
    strictEqual(log[2], 'ok3', 'Testing trace content');

    // Now we send more than 2000 request on log,
    // we check the trace remove too old data
    for(var i=0; i<2100; ++i) {
        a.console.log('ok', null, false);
    }

    var fullLog = a.console.trace('log');
    strictEqual(fullLog.length, 2000, 'Testing full stack');
});


// Testing console clearing trace system
test('a.console.clear', function() {
    a.console.log('ok', null, false);
    a.console.warn('ok', null, false);

    var trace = a.console.trace();

    strictEqual(trace['log'].length, 1, 'Testing log before clear');
    strictEqual(trace['warn'].length, 1, 'Testing warning before clear');

    a.console.clear();
    var newTrace = a.console.trace();

    strictEqual(newTrace['log'].length, 0, 'Testing log after clear');
    strictEqual(newTrace['warn'].length, 0, 'Testing warning after clear');
});