// Unit test for a.state.protocol (plugin)
module('plugin/state.protocol.js');


// The protocol tester does work as expected
test('a.state.protocol-tester', function() {
    var simple    = 'superhash',
        prefix    = 'url://anotherone',
        uri       = 'uri://someuri',
        something = 'something://some';

    // They must all response that url is the good choice
    strictEqual(a.state.protocol.tester(simple), 'url');
    strictEqual(a.state.protocol.tester(prefix), 'url');
    strictEqual(a.state.protocol.tester(uri), 'uri');
    strictEqual(a.state.protocol.tester(something), null);
});


// Simple test url does work
test('a.state.protocol-url', function() {
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

    strictEqual(url.fn(simple, 0), 'superhash');
    strictEqual(url.fn(prefix, 0), 'anotherone');
    strictEqual(url.fn(none, 0), null);
});


// Simple test url does work
test('a.state.protocol-url-multi', function() {
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

    strictEqual(url.fn(simple, 0), 'superhash');
    strictEqual(url.fn(simple, 1), 'second');
    strictEqual(url.fn(prefix, 0), 'anotherone');
    strictEqual(url.fn(prefix, 1), 'anotherone2');
    strictEqual(url.fn(none, 0), null);
});


// Test the specific uri protocol
test('a.state.protocol-uri', function() {

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

    strictEqual(uri.fn(simple, 0), 'ok/superuri');


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

    strictEqual(uri.fn(lessSimple, 0), 'another/ok/superuri');


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

    strictEqual(uri.fn(complex, 0), 'superb/superuri');
});


// Test the specific uri protocol
test('a.state.protocol-uri-multiple', function() {

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

    strictEqual(uri.fn(simple, 0), 'ok/superuri');
    strictEqual(uri.fn(simple, 1), 'ok/superuri2');


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

    strictEqual(uri.fn(lessSimple, 0), 'another/ok/superuri');
    strictEqual(uri.fn(lessSimple, 1), 'another/ok/superuri2');


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

    strictEqual(uri.fn(complex, 0), 'superb/superuri');
    strictEqual(uri.fn(complex, 1), 'superb/superuri2');
});