// Unit test for a.state.protocol (plugin)
QUnit.module('plugin/state.protocol.js');


// The protocol tester does work as expected
QUnit.test('a.state.protocol-tester', function(assert) {
    assert.expect(4);

    var simple    = 'superhash',
        prefix    = 'url://anotherone',
        uri       = 'uri://someuri',
        something = 'something://some';

    // They must all response that url is the good choice
    assert.strictEqual(a.state.protocol.tester(simple), 'url');
    assert.strictEqual(a.state.protocol.tester(prefix), 'url');
    assert.strictEqual(a.state.protocol.tester(uri), 'uri');
    assert.strictEqual(a.state.protocol.tester(something), null);
});


// Simple test url does work
QUnit.test('a.state.protocol-url', function(assert) {
    assert.expect(3);

    var simple = {
        hash: [
            'superhash'
        ]
    };

    var prefix = {
        hash: [
            'url://anotherone'
        ]
    };

    var none = {

    };

    // They must all response that url is the good choice
    var url = a.state.protocol.get('url');

    assert.strictEqual(url.fn(simple, 0), 'superhash');
    assert.strictEqual(url.fn(prefix, 0), 'anotherone');
    assert.strictEqual(url.fn(none, 0), null);
});


// Simple test url does work
QUnit.test('a.state.protocol-url-multi', function(assert) {
    assert.expect(5);

    var simple = {
        hash: [
            'superhash',
            'second'
        ]
    };

    var prefix = {
        hash: [
            'url://anotherone',
            'url://anotherone2'
        ]
    };

    var none = {

    };

    // They must all response that url is the good choice
    var url = a.state.protocol.get('url');

    assert.strictEqual(url.fn(simple, 0), 'superhash');
    assert.strictEqual(url.fn(simple, 1), 'second');
    assert.strictEqual(url.fn(prefix, 0), 'anotherone');
    assert.strictEqual(url.fn(prefix, 1), 'anotherone2');
    assert.strictEqual(url.fn(none, 0), null);
});


// Test the specific uri protocol
QUnit.test('a.state.protocol-uri', function(assert) {
    assert.expect(3);

    // First test
    var simple = {
        hash: [
            'uri://superuri'
        ],

        parent: {
            hash: [
                'uri://ok'
            ]
        }
    };

    var uri = a.state.protocol.get('uri');

    assert.strictEqual(uri.fn(simple, 0), 'ok/superuri');


    // Second test
    var lessSimple = {
        hash: [
            'uri://superuri'
        ],

        parent: {
            hash: [
                'uri://ok'
            ],

            parent: {
                hash: [
                    'uri://another'
                ]
            }
        }
    };

    assert.strictEqual(uri.fn(lessSimple, 0), 'another/ok/superuri');


    // Third test
    var complex = {
        hash: [
            'uri://superuri'
        ],

        parent: {
            // This one is in url, it should stop here
            hash: [
                'superb'
            ],

            parent: {
                hash: [
                    'uri://if-you-see-it-its-problem'
                ]
            }
        }
    };

    assert.strictEqual(uri.fn(complex, 0), 'superb/superuri');
});


// Test the specific uri protocol
QUnit.test('a.state.protocol-uri-multiple', function(assert) {
    assert.expect(6);

    // First test
    var simple = {
        hash: [
            'uri://superuri',
            'uri://superuri2'
        ],

        parent: {
            hash: [
                'uri://ok',
                'uri://ok2'
            ]
        }
    };

    var uri = a.state.protocol.get('uri');

    assert.strictEqual(uri.fn(simple, 0), 'ok/superuri');
    assert.strictEqual(uri.fn(simple, 1), 'ok/superuri2');


    // Second test
    var lessSimple = {
        hash: [
            'uri://superuri',
            'uri://superuri2'
        ],

        parent: {
            hash: [
                'uri://ok',
                'uri://ok2'
            ],

            parent: {
                hash: [
                    'uri://another',
                    'uri://another2'
                ]
            }
        }
    };

    assert.strictEqual(uri.fn(lessSimple, 0), 'another/ok/superuri');
    assert.strictEqual(uri.fn(lessSimple, 1), 'another/ok/superuri2');


    // Third test
    var complex = {
        hash: [
            'uri://superuri',
            'uri://superuri2'
        ],

        parent: {
            // This one is in url, it should stop here
            hash: [
                'superb',
                'superb2'
            ],

            parent: {
                hash: [
                    'uri://if-you-see-it-its-problem',
                    'uri://if-you-see-it-its-problem2'
                ]
            }
        }
    };

    assert.strictEqual(uri.fn(complex, 0), 'superb/superuri');
    assert.strictEqual(uri.fn(complex, 1), 'superb/superuri2');
});