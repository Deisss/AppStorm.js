// Unit test for a.state (plugin)
// We handle bug and test to check they are not coming back

module('plugin/state.js');

// In this unit test, we check 2 children, with same parent element,
// and same hashtag, are both loaded not only one
asyncTest('a.state.dualchildren', function() {
    expect(4);

    var tree = {
        id : 'ok',
        children : [
            {
                hash : 'unittest-dualchildren',
                async: true,
                load : function(chain) {
                    strictEqual(1, 1, 'Test loading first child');
                    chain.next();
                },
                unload : function(chain) {
                    strictEqual(1, 1, 'Test unloading first child');
                    chain.next();
                }
            },
            {
                hash : 'unittest-dualchildren',
                async: true,
                load : function(chain) {
                    strictEqual(1, 1, 'Test loading second child');
                    chain.next();
                },
                unload : function(chain) {
                    strictEqual(1, 1, 'Test unloading second child');
                    chain.next();
                }
            }
        ]
    };

    a.state.add(tree);

    // Now starting to proceed loader
    chain('unittest-dualchildren', function() {
        hashtag('tmp_unittest-dualchildren');
    });

    chain('tmp_unittest-dualchildren', start, 200);

    hashtag('unittest-dualchildren');
});



// Bug : passing data threw preLoad, load and postLoad
asyncTest('a.state.parameter-passthrew', function() {
    expect(3);

    var test = {
        id : 'testloadpassthrew',
        async: true,
        data : {
            objId : '{{memory : test_objid}}'
        },
        converter : function(data) {
            data.plop = data.objId;
        },
        preLoad : function(chain) {
            this.data['data2'] = 'ok';
            chain.next();
        },
        postLoad : function(chain) {
            strictEqual(this.data['objId'], 'hello from data',
                                                            'test data pass');
            strictEqual(this.data['plop'], 'hello from data',
                                                            'test data pass');
            strictEqual(this.data['data2'], 'ok', 'test from postload');

            chain.next();
            start();
        }
    };
    a.state.add(test);

    // Place a value and try result
    a.storage.memory.set('test_objid', 'hello from data');
    a.state.load('testloadpassthrew');
});


// Bug : too long request, may make the system putting
// content of #a while #b is already loading...
asyncTest('a.state.request-abort', function() {
    expect(1);

    var b = {
        id : 'child-b',
        hash : 'request-abort-b',
        async: true,
        preLoad : function(chain) {
            strictEqual(true, true, 'Arrive on time');
            chain.next();
        }
    };

    var c = {
        id : 'child-c',
        hash : 'request-abort-c',
        async: true,
        preLoad : function(chain) {
            a.timer.once(chain.error, null, 500);
        },
        load : function(chain) {
            strictEqual(false, true, 'should be cancelled');
            chain.next();
        }
    };

    a.state.add(c);
    a.state.add(b);

    chain('request-abort-c', function() {
        hashtag('request-abort-b');
    });

    chain('request-abort-b', start, 100);

    hashtag('request-abort-c');
});


// Simple elements to load as sub elements into data
asyncTest('a.state.request-element', function() {
    expect(4);

    var state = {
        id:    'root',
        hash:  'wall-list',
        async: true,
        data: {
            commentList: 'resource/data/state/wall-list-unittest.json'
        },
        converter: function(d) {
            strictEqual(d.commentList.length, 3);
            strictEqual(d.commentList[0].id, 1);
            strictEqual(d.commentList[1].id, 23);
            strictEqual(d.commentList[2].id, 20);
        },
        // Callbacks
        postLoad: function(chain) {
            chain.next();
        }
    };

    a.state.add(state);

    chain('wall-list', start, 100);

    hashtag('wall-list');
});


// Bug: sometimes, doing a a.state.load while a state is loading
// can cause something close to infinite loop (but stop at a point)
// Hanging lots of loads on server side, for nothing...
asyncTest('a.state.chain-load', function() {
    expect(2);

    var state = {
        id: 'a.state.chain-load',
        hash: 'a.state.chain-load',
        preLoad: function() {
            strictEqual(true, true);
            // Applying load from parent state can hang out state
            a.state.load('a.state.chain-load-sub');
        },
        children: [{
            id: 'a.state.chain-load-sub',
            postLoad: function() {
                strictEqual(true, true);
            }
        }]
    };

    a.state.add(state);

    // We exit
    chain('a.state.chain-load', function() {
        hashtag('');
        start();
    }, 200);

    hashtag('a.state.chain-load');
});


// Loading many child while root is not finished to load
// Can hang application
asyncTest('a.state.chain-load-with-url', function() {
    expect(6);

    var wall = [{
        id: 'root',
        // Data
        data: {
            commentList: 'resource/data/state/commentlist.json'
        },
        async: true,
        converter: function(data) {
            data.user = {id: 1};
        },
        // Callbacks
        postLoad: function(chain) {
            // Check post type
            var loadByWallType = function(comment, user) {
                return (comment.user_id == user.id) ? 'mine' : 'friend';
            };
            // Load good state
            var d = this.data;
            for(var i=0, l=d.commentList.length; i<l; ++i) {
                var child = loadByWallType(d.commentList[i], d.user);
                a.state.load(child);
            }

            strictEqual(true, true, 'Load root parent');

            chain.next();
        },
        // Children
        children: [{
            id:       'mine',
            async:    true,
            postLoad: function(chain) {
                strictEqual(true, true, 'Load mine child');
                chain.next();
            }
        },
        {
            id:       'friend',
            async:    true,
            postLoad: function(chain) {
                strictEqual(true, true, 'load friend child');
                chain.next();
            }
        }]
    }];

    a.state.add(wall);
    a.state.load('root');

    setTimeout(start, 200);
});



// On new AppStorm v0.2.0, we found that loading
// too many times a state create a bug
// due to cache system which get override by tmp data...
// This test is here to check that behavior does not come back.
asyncTest('a.state.chain-triple-load', function() {
    expect(8);

    var state1 = {
        id: 'ok',
        hash: '/chain-triple-load/{{id: [a-fA-F0-9]+}}',
        data: {
            custom: '{{id}}'
        },
        postLoad: function() {
            var current = this.data.custom,
                original = this._storm.data.custom;

            strictEqual(current, 'abcdef', 'Test load current value');
            strictEqual(original, '{{id}}', 'Test load original value');
        }
    };

    var state2 = {
        id: 'ok2',
        hash: '/chain-triple-unload/{{id: [a-fA-F0-9]+}}',
        data: {
            sub: '{{id}}'
        },
        postLoad: function() {
            var current = this.data.sub,
                original = this._storm.data.sub;

            strictEqual(current, 'abcdef', 'Test unload current value');
            strictEqual(original, '{{id}}', 'Test unload original value');
        }
    };

    a.state.add([state1, state2]);

    // Loading/unloading many times
    chain('/chain-triple-load/abcdef', function() {
        chain('/chain-triple-unload/abcdef', function() {
            chain('/chain-triple-load/abcdef', function() {
                chain('/chain-triple-unload/abcdef', function() {
                    hashtag('');
                    start();
                }, 200);
                hashtag('/chain-triple-unload/abcdef')
            }, 200);
            hashtag('/chain-triple-load/abcdef')
        }, 200);
        hashtag('/chain-triple-unload/abcdef');
    }, 200);

    hashtag('/chain-triple-load/abcdef');
});