// Unit test for a.state (plugin)
module('plugin/state.js');



// Test raising a 404 error does raise the chainer error function
asyncTest('a.state.error', function() {
    expect(2);

    var test = {
        id : 'test-error',
        hash : 'test-error',
        data : 'resource/data/notexist.json'
    };

    a.state.add(test);

    a.message.bind('a.state.error', function(data) {
        strictEqual(data.resource.indexOf('resource/data/notexist.json'), 0,
                                            'Test data resource error');
        strictEqual(data.status, 404, 'Test data response');
    });

    chain('test-error', start, 100);

    hashtag('test-error');
});


// Test raising 404 on html
asyncTest('a.state.error2', function() {
    expect(2);

    var test = {
        id : 'test-error2',
        hash : 'test-error2',

        include : {
            html : 'resource/data/notexist.html'
        }
    };

    a.state.add(test);

    a.message.bind('a.state.error', function(data) {
        strictEqual(data.resource.indexOf('resource/data/notexist.html'), 0,
                                            'Test html resource error');
        strictEqual(data.status, 404, 'Test data response');
    });

    chain('test-error2', start, 100);

    hashtag('test-error2');
});


// Test getting hashtag loaded on error appearing
asyncTest('a.state.error-hash', function() {
    expect(4);

    var tree = {
        id : 'errorhashroot',

        error: {
            _404: function(state, resource, status) {
                strictEqual(true, true, 'Test 404 is found');
                strictEqual(state, 'test-error-hash',
                                                'Test 404 is raised by state');
                strictEqual(resource.substring(0, 13), 'someunknowurl',
                                                    'Test resourced handled');
                strictEqual(status, 404, 'Test 404 error code');
            },
            _40x: function() {
                strictEqual(true, false, 'Test 40x should not be raised here');
            }
        },

        children : {
            id : 'test-error-hash',
            hash : 'test-error-hash',
            data : 'someunknowurl',
            error: {
                generic: function() {
                    strictEqual(true, false, 'Test generic is not used');
                }
            }
        }
    };

    a.state.add(tree);

    chain('test-error-hash', start, 100);

    hashtag('test-error-hash');
});


// Test getting hashtag loaded on error appearing
asyncTest('a.state.error-hash2', function() {
    expect(1);

    var tree = {
        id : 'errorhashroot2',

        children : {
            id : 'test-error-hash2',
            hash : 'test-error-hash2',
            data : 'someunknowurl2',

            error: {
                generic: function() {
                    strictEqual(true, true, 'Test generic is raised');
                }
            }
        }
    };

    a.state.add(tree);


    chain('test-error-hash2', start, 100);

    hashtag('test-error-hash2');
});


// Test getting hashtag loaded on error appearing
asyncTest('a.state.error-hash3', function() {
    expect(1);

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

    a.hash.bind('change', function(data) {
        // Prevent a wrong catch bug, and does not make test unreliable
        // (as it will raise 0 event if nothing is found, stopping system)
        if(data.value === 'hash-error-404') {
            strictEqual(data.value, 'hash-error-404', 'Test value is linked');
        }
    });

    chain('test-error-hash3', start, 100);

    hashtag('test-error-hash3');
});