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