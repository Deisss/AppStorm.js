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