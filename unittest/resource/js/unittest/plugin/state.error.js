// Unit test for a.state (plugin)
module('plugin/state.js');



// Test raising a 404 error does raise the chainer error function
test('a.state.error', function() {
    stop();
    expect(2);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var test = {
        id : 'test-error',
        hash : 'test-error',
        data : 'resource/data/notexist.json'
    };

    a.state.add(test);

    // Now starting to proceed loader
    setTimeout(function() {
        a.message.bind('a.state.error', function(data) {
            se(data.resource.indexOf('resource/data/notexist.json'), 0,
                                                'Test data resource error');
            se(data.status, 404, 'Test data response');
        });
        window.location.href = '#test-error';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        a.message.clear();
        window.location.href = '#';
        st();
    }, 600);
});


// Test raising 404 on html
test('a.state.error2', function() {
    stop();
    expect(2);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var test = {
        id : 'test-error2',
        hash : 'test-error2',

        include : {
            html : 'resource/data/notexist.html'
        }
    };

    a.state.add(test);

    // Now starting to proceed loader
    setTimeout(function() {
        a.message.bind('a.state.error', function(data) {
            se(data.resource.indexOf('resource/data/notexist.html'), 0,
                                                'Test html resource error');
            se(data.status, 404, 'Test data response');
        });

        window.location.href = '#test-error2';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        a.message.clear();
        window.location.href = '#';
        st();
    }, 600);
});


// Test getting hashtag loaded on error appearing
test('a.state.error-hash', function() {
    stop();
    expect(4);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        id : 'errorhashroot',

        error: {
            _404: function(state, resource, status) {
                se(true, true, 'Test 404 is found');
                se(state, 'test-error-hash', 'Test 404 is raised by state');
                se(resource.substring(0, 13), 'someunknowurl',
                                                    'Test resourced handled');
                se(status, 404, 'Test 404 error code');
            },
            _40x: function() {
                se(true, false, 'Test 40x should not be raised here');
            }
        },

        children : {
            id : 'test-error-hash',
            hash : 'test-error-hash',
            data : 'someunknowurl',
            error: {
                generic: function() {
                    se(true, false, 'Test generic is not used');
                }
            }
        }
    };

    a.state.add(tree);

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#test-error-hash';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        a.message.clear();
        window.location.href = '#';
        st();
    }, 600);
});


// Test getting hashtag loaded on error appearing
test('a.state.error-hash2', function() {
    stop();
    expect(1);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        id : 'errorhashroot2',

        children : {
            id : 'test-error-hash2',
            hash : 'test-error-hash2',
            data : 'someunknowurl2',

            error: {
                generic: function() {
                    se(true, true, 'Test generic is raised');
                }
            }
        }
    };

    a.state.add(tree);

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#test-error-hash2';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        a.message.clear();
        window.location.href = '#';
        st();
    }, 600);
});


// Test getting hashtag loaded on error appearing
test('a.state.error-hash3', function() {
    stop();
    expect(1);
    a.state.clear();

    var se = strictEqual,
        st = start;

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

    a.message.bind('a.page.event.hash', function(data) {
        // Prevent a wrong catch bug, and does not make test unreliable
        // (as it will raise 0 event if nothing is found, stopping system)
        if(data.value === 'hash-error-404') {
            se(data.value, 'hash-error-404', 'Test value is linked');
        }
    });

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#test-error-hash3';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        a.message.clear();
        window.location.href = '#';
        st();
    }, 600);
});