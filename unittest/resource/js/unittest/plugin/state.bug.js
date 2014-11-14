// Unit test for a.state (plugin)
// We handle bug and test to check they are not coming back

QUnit.module('plugin/state.js');

// In this unit test, we check 2 children, with same parent element,
// and same hashtag, are both loaded not only one
QUnit.asyncTest('a.state.dualchildren', function(assert) {
    assert.expect(4);

    var tree = {
        id : 'ok',
        children : [
            {
                hash : 'unittest-dualchildren',
                async: true,
                load : function(chain) {
                    QAppStorm.pop();
                    assert.strictEqual(1, 1, 'Test loading first child');
                    chain.next();
                },
                unload : function(chain) {
                    QAppStorm.pop();
                    assert.strictEqual(1, 1, 'Test unloading first child');
                    chain.next();
                }
            },
            {
                hash : 'unittest-dualchildren',
                async: true,
                load : function(chain) {
                    QAppStorm.pop();
                    assert.strictEqual(1, 1, 'Test loading second child');
                    chain.next();
                },
                unload : function(chain) {
                    QAppStorm.pop();
                    assert.strictEqual(1, 1, 'Test unloading second child');
                    chain.next();
                }
            }
        ]
    };

    a.state.add(tree);

    QAppStorm.chain({
        hash: 'unittest-dualchildren',
        expect: 2
    }, {
        hash: 'tmp_unittest-dualchildren',
        expect: 2
    });
});



// Bug : passing data threw preLoad, load and postLoad
QUnit.asyncTest('a.state.parameter-passthrew', function(assert) {
    assert.expect(3);

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
            assert.strictEqual(this.data['objId'], 'hello from data',
                                                            'test data pass');
            assert.strictEqual(this.data['plop'], 'hello from data',
                                                            'test data pass');
            assert.strictEqual(this.data['data2'], 'ok', 'test from postload');

            chain.next();
            QUnit.start();
        }
    };
    a.state.add(test);

    // Place a value and try result
    a.storage.memory.set('test_objid', 'hello from data');
    a.state.load('testloadpassthrew');
});


// Bug : too long request, may make the system putting
// content of #a while #b is already loading...
QUnit.asyncTest('a.state.request-abort', function(assert) {
    assert.expect(1);

    var b = {
        id : 'child-b',
        hash : 'request-abort-b',
        async: true,
        preLoad : function(chain) {
            QAppStorm.pop();
            assert.strictEqual(true, true, 'Arrive on time');
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
            QAppStorm.pop();
            assert.strictEqual(false, true, 'should be cancelled');
            chain.next();
        }
    };

    a.state.add(c);
    a.state.add(b);

    QAppStorm.chain({
        hash: 'request-abort-c',
        expect: 0,
        callback: function(chain) {
            setTimeout(function() {
                chain.next();
            }, 1000);
        }
    }, {
        hash: 'request-abort-b',
        expect: 1
    });
});


// Simple elements to load as sub elements into data
QUnit.asyncTest('a.state.request-element', function(assert) {
    assert.expect(4);

    var state = {
        id:    'root',
        hash:  'wall-list',
        async: true,
        data: {
            commentList: 'resource/data/state/wall-list-unittest.json'
        },
        converter: function(d) {
            QAppStorm.pop();
            assert.strictEqual(d.commentList.length, 3);
            QAppStorm.pop();
            assert.strictEqual(d.commentList[0].id, 1);
            QAppStorm.pop();
            assert.strictEqual(d.commentList[1].id, 23);
            QAppStorm.pop();
            assert.strictEqual(d.commentList[2].id, 20);
        },
        // Callbacks
        postLoad: function(chain) {
            chain.next();
        }
    };

    a.state.add(state);

    QAppStorm.chain({
        hash: 'wall-list',
        expect: 4
    });
});


// Bug: sometimes, doing a a.state.load while a state is loading
// can cause something close to infinite loop (but stop at a point)
// Hanging lots of loads on server side, for nothing...
QUnit.asyncTest('a.state.chain-load', function(assert) {
    assert.expect(2);

    var state = {
        id: 'a.state.chain-load',
        hash: 'a.state.chain-load',
        preLoad: function() {
            QAppStorm.pop();
            assert.strictEqual(true, true);
            // Applying load from parent state can hang out state
            a.state.load('a.state.chain-load-sub');
        },
        children: [{
            id: 'a.state.chain-load-sub',
            postLoad: function() {
                QAppStorm.pop();
                assert.strictEqual(true, true);
            }
        }]
    };

    a.state.add(state);

    QAppStorm.chain({
        hash: 'a.state.chain-load',
        expect: 2
    });
});


// Loading many child while root is not finished to load
// Can hang application
QUnit.asyncTest('a.state.chain-load-with-url', function(assert) {
    assert.expect(6);

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

            assert.strictEqual(true, true, 'Load root parent');

            chain.next();
        },
        // Children
        children: [{
            id:       'mine',
            async:    true,
            postLoad: function(chain) {
                assert.strictEqual(true, true, 'Load mine child');
                chain.next();
            }
        },
        {
            id:       'friend',
            async:    true,
            postLoad: function(chain) {
                assert.strictEqual(true, true, 'load friend child');
                chain.next();
            }
        }]
    }];

    a.state.add(wall);
    a.state.load('root');

    setTimeout(QUnit.start, 200);
});



// On new AppStorm v0.2.0, we found that loading
// too many times a state create a bug
// due to cache system which get override by tmp data...
// This test is here to check that behavior does not come back.
QUnit.asyncTest('a.state.chain-triple-load', function(assert) {
    assert.expect(8);

    var state1 = {
        id: 'ok',
        hash: '/chain-triple-load/{{id: [a-fA-F0-9]+}}',
        data: {
            custom: '{{id}}'
        },
        postLoad: function() {
            var current = this.data.custom,
                original = this._storm.data.custom;

            assert.strictEqual(current, 'abcdef', 'Test load current value');
            assert.strictEqual(original, '{{id}}', 'Test load original value');
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

            assert.strictEqual(current, 'abcdef', 'Test unload current value');
            assert.strictEqual(original, '{{id}}', 'Test unload original value');
        }
    };

    a.state.add([state1, state2]);

    // Loading/unloading many times
    chain('/chain-triple-load/abcdef', function() {
        chain('/chain-triple-unload/abcdef', function() {
            chain('/chain-triple-load/abcdef', function() {
                chain('/chain-triple-unload/abcdef', function() {
                    hashtag('');
                    QUnit.start();
                }, 200);
                hashtag('/chain-triple-unload/abcdef')
            }, 200);
            hashtag('/chain-triple-load/abcdef')
        }, 200);
        hashtag('/chain-triple-unload/abcdef');
    }, 200);

    hashtag('/chain-triple-load/abcdef');
});

// In some case, one some AppStorm version we could find a bug where the system
// 
QUnit.asyncTest('a.sate.nested-data-object', function(assert) {
    assert.expect(1);

    a.state.add({
        id: 'state-nested-data-object',
        hash: 'state-nested-data-object',
        data: {
            session: {
                url: 'resource/data/state/nested-object.json',
                options: {
                    template: ['json']
                }
            }
        },
        postLoad: function() {
            assert.strictEqual(this.data.session.id,
                                    '544fc10fdfc418383e237608');
            QAppStorm.pop();
        }
    });

    QAppStorm.chain({
        hash: 'state-nested-data-object',
        expect: 1
    });
});