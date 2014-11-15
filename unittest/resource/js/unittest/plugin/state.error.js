// Unit test for a.state (plugin)
QUnit.module('plugin/state.js', {
    setup: function() {
        QAppStorm.clear();
        hashtag('');
    },
    teardown: function() {
        a.state.clear();
        a.message.clear();
        a.mock.clear();
        hashtag('');
        a.acl.clear();
        QAppStorm.clear();
    }
});



// Test raising a 404 error does raise the chainer error function
QUnit.asyncTest('a.state.error', function(assert) {
    assert.expect(2);

    var state = {
        id : 'test-error',
        hash : 'test-error',
        data : 'resource/data/notexist.json'
    };

    a.state.add(state);

    function testMessageRaise(data) {
        QAppStorm.pop();
        assert.strictEqual(data.resource.indexOf('resource/data/notexist.json'), 0,
                                            'Test data resource error');
        QAppStorm.pop();
        assert.strictEqual(data.status, 404, 'Test data response');
    };

    a.message.bind('a.state.error', testMessageRaise);

    QAppStorm.chain({
        hash: 'test-error',
        expect: 2,
        callback: function(chain) {
            a.message.unbind('a.state.error', testMessageRaise);
            chain.next();
        }
    });
});


// Test raising 404 on html
QUnit.asyncTest('a.state.error2', function(assert) {
    assert.expect(2);

    var test = {
        id : 'test-error2',
        hash : 'test-error2',

        include : {
            html : 'resource/data/notexist.html'
        }
    };

    a.state.add(test);

    function testMessageRaise(data) {
        QAppStorm.pop();
        assert.strictEqual(data.resource.indexOf('resource/data/notexist.html'), 0,
                                            'Test html resource error');
        QAppStorm.pop();
        assert.strictEqual(data.status, 404, 'Test data response');
    }

    a.message.bind('a.state.error', testMessageRaise);

    QAppStorm.chain({
        hash: 'test-error2',
        expect: 2,
        callback: function(chain) {
            a.message.unbind('a.state.error', testMessageRaise);
            chain.next();
        }
    });
});


// Test getting hashtag loaded on error appearing
QUnit.asyncTest('a.state.error-hash', function(assert) {
    assert.expect(4);

    var tree = {
        id : 'errorhashroot',

        error: {
            _404: function(state, resource, status) {
                QAppStorm.pop();
                assert.strictEqual(true, true, 'Test 404 is found');
                QAppStorm.pop();
                assert.strictEqual(state, 'test-error-hash',
                                                'Test 404 is raised by state');
                QAppStorm.pop();
                assert.strictEqual(resource.substring(0, 13), 'someunknowurl',
                                                    'Test resourced handled');
                QAppStorm.pop();
                assert.strictEqual(status, 404, 'Test 404 error code');
            },
            _40x: function() {
                QAppStorm.pop();
                assert.strictEqual(true, false, 'Test 40x should not be raised here');
            }
        },

        children : {
            id : 'test-error-hash',
            hash : 'test-error-hash',
            data : 'someunknowurl',
            error: {
                generic: function() {
                    QAppStorm.pop();
                    assert.strictEqual(true, false, 'Test generic is not used');
                }
            }
        }
    };

    a.state.add(tree);

    QAppStorm.chain({
        hash: 'test-error-hash',
        expect: 4
    });
});


// Test getting hashtag loaded on error appearing
QUnit.asyncTest('a.state.error-hash2', function(assert) {
    assert.expect(1);

    var tree = {
        id : 'errorhashroot2',

        children : {
            id : 'test-error-hash2',
            hash : 'test-error-hash2',
            data : 'someunknowurl2',

            error: {
                generic: function() {
                    QAppStorm.pop();
                    assert.strictEqual(true, true, 'Test generic is raised');
                }
            }
        }
    };

    a.state.add(tree);

    QAppStorm.chain({
        hash: 'test-error-hash2',
        expect: 1
    });
});


// Test getting hashtag loaded on error appearing
QUnit.asyncTest('a.state.error-hash3', function(assert) {
    assert.expect(1);

    var tree = {
        id : 'errorhashroot3',

        children : {
            id : 'test-error-hash3',
            hash : 'test-error-hash3',
            data : 'someunknowurl3',

            error: {
                generic: 'hash-error-404'
            }
        }
    };

    a.state.add(tree);

    function hashRaise(data) {
        // Prevent a wrong catch bug, and does not make test unreliable
        // (as it will raise 0 event if nothing is found, stopping system)
        if(data.value === 'hash-error-404') {
            QAppStorm.pop();
            assert.strictEqual(data.value, 'hash-error-404', 'Test value is linked');
        }
    };

    a.hash.bind('change', hashRaise);

    QAppStorm.chain({
        hash: 'test-error-hash3',
        expect: 1,
        callback: function(chain) {
            a.hash.unbind('change', hashRaise);
            chain.next();
        }
    });
});


// Test an error with empty error content to catch it
QUnit.asyncTest('a.state.error-empty', function(assert) {
    assert.expect(1);

    a.console.clear();

    var state = {
        id: 'error-empty-hash',
        hash: 'a.state.error-empty',
        data: 'someunknowurl4'
    };

    a.state.add(state);


    QAppStorm.chain({
        hash: 'a.state.error-empty',
        expect: 0,
        callback: function(chain) {
            setTimeout(function() {
                // We expect a message on console.error saying 'an error has not been
                // handled'
                var trace = a.console.trace('error'),
                    error = trace[0];
                console.log(trace);

                // We remove the last part of url to get it more easy to test
                error = error.replace(/\?cachedisable\=rnd\_\d+/g, '');

                assert.strictEqual(error, 'a.state.raiseError: an error occurs, but no ' +
                                        'error function/hash inside the state ' +
                                        'where existing to handle it. ' +
                                        'Please check your error handler (state-id: ' +
                                        'error-empty-hash, status: 404, ' +
                                        'resource: someunknowurl4)');
                chain.next();
            }, 1000);
        }
    });
});