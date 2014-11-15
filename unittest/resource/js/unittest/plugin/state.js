// Unit test for a.state (plugin)
// We separate from state because this one is too much important + heavy ...

// TODO: bootOnLoad => reactivate
// TODO: event for every state loaded has been deleted, maybe corret that ?

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





// Start to check a single check hash change
QUnit.asyncTest('a.state.hash-single-state', function(assert) {
    expect(2);

    var main1 = {
        hash : 'astatemanager1',
        async: true,
        load : function(chain) {
            assert.strictEqual(1, 1, 'Loading basic 1 succeed');
            QAppStorm.pop();
            chain.next();
        }
    };
    var main2 = {
        hash : 'astatemanager2',
        async: true,
        load : function(chain) {
            assert.strictEqual(1, 1, 'Loading basic 2 succeed');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    QAppStorm.chain(
        {
            hash: 'astatemanager1',
            expect: 1
        }, {
            hash: 'astatemanager2',
            expect: 1
        }
    );
});

// Test hashexists
QUnit.test('a.state.hashExists', function(assert) {
    expect(4);
    // We add one existing hash
    var child1 = {
        hash : 'something-good'
    };
    a.state.add(child1);

    // We submit a hash with parameter inside
    var child2 = {
        hash : 'ok-now-{{email : [a-z]+}}'
    };
    a.state.add(child2);

    // Now testing hashExists
    assert.strictEqual(a.state.hashExists('something-good'), true,
                                            'Testing basic input');
    assert.strictEqual(a.state.hashExists('notexisting'), false,
                                            'Testing wrong input');

    // Testing parameter detection
    assert.strictEqual(a.state.hashExists('ok-now-something'), true,
                                            'Testing parameter input');
    assert.strictEqual(a.state.hashExists('ok-now-2'), false,
                                            'Testing parameter input');
});









// State manager test
// Testing add to function : testing parent add, children add
QUnit.test('a.state.add', function(assert) {
    expect(10);
    var testSingleChildren = {
        id : 'root',
        children : {
            id : 'sub'
        }
    };
    a.state.add(testSingleChildren);
    var treeSingleChildren = a.state.get('root');
    assert.strictEqual(treeSingleChildren.id, 'root', 'Test root content');
    assert.strictEqual(treeSingleChildren.children[0].id, 'sub',
                                                'Test children content');
    a.state.clear();



    var testNormalChildren = {
        id : 'root',
        children : [
            {
                id : 'sub1'
            },
            {
                id : 'sub2'
            }
        ]
    };
    a.state.add(testNormalChildren);
    var treeNormalChildren = a.state.get('root');

    assert.strictEqual(treeNormalChildren.id, 'root', 'Test root content');
    assert.strictEqual(treeNormalChildren.children[0].id, 'sub1',
                                        'Test children content');
    assert.strictEqual(treeNormalChildren.children[1].id, 'sub2',
                                        'Test children content');
    a.state.clear();



    var el = {
        id : 'root'
    };
    var child1 = {
        id : 'sub1',
        parent : 'root'
    };
    var child1Sub = {
        id : 'subsub1',
        parent : 'sub1'
    };
    a.state.add(el);
    a.state.add(child1);
    a.state.add(child1Sub);
    var treeParentChildren = a.state.get('root');
    assert.strictEqual(treeParentChildren.id, 'root', 'Test root content');
    assert.strictEqual(treeParentChildren.children[0].id, 'sub1',
                                            'Test children content');
    assert.strictEqual(treeParentChildren.children[0].children[0].id, 'subsub1',
                                            'Test children content');
    a.state.clear();



    var tab = [
        {
            id : 'root'
        },
        {
            id : 'root2'
        }
    ];
    a.state.add(tab);
    var root1 = a.state.get('root'),
        root2 = a.state.get('root2');
    assert.strictEqual(root1.id, 'root', 'Test root content');
    assert.strictEqual(root2.id, 'root2', 'Test second root content');
});



// TODO: REACTIVATE
// Test a load and unload, with a state in common (a parent)
QUnit.asyncTest('a.state-path', function(assert) {
    // We expect 3 : one from parent1, and 2 from sub child, this is
    // because parent1 will be loaded only
    // at first time, because it is shared between main1, and main2 !
    expect(3);

    var tree = {
        async: true,
        load : function(chain) {
            assert.strictEqual(1, 1, 'Loading basic 1 succeed');
            QAppStorm.pop();
            chain.next();
        },
        children : [{
            hash : 'astatemanager3',
            async: true,
            load : function(chain) {
                assert.strictEqual(1, 1, 'Loading basic 3 succeed');
                QAppStorm.pop();
                chain.next();
            }
        },{
            hash : 'astatemanager4',
            async: true,
            load : function(chain) {
                assert.strictEqual(1, 1, 'Loading basic 4 succeed');
                QAppStorm.pop();
                chain.next();
            }
        }]
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'astatemanager3',
            expect: 2
        }, {
            hash: 'astatemanager4',
            expect: 1
        }
    );
});




// Test full load chain process
QUnit.asyncTest('a.state-load', function(assert) {
    // We expect the 6 : 3 from parent, 3 from children
    expect(6);

    var tree = {
        async: true,
        preLoad : function(chain) {
            assert.strictEqual(1, 1, 'Test preLoad parent');
            QAppStorm.pop();
            chain.next();
        },
        load : function(chain) {
            assert.strictEqual(1, 1, 'Test load parent');
            QAppStorm.pop();
            chain.next();
        },
        postLoad : function(chain) {
            assert.strictEqual(1, 1, 'Test postLoad parent');
            QAppStorm.pop();
            chain.next();
        },
        children : [{
            hash : 'astatemanager5',
            async: true,
            preLoad : function(chain) {
                assert.strictEqual(1, 1, 'Test preLoad child');
                QAppStorm.pop();
                chain.next();
            },
            load : function(chain) {
                assert.strictEqual(1, 1, 'Test load child');
                QAppStorm.pop();
                chain.next();
            },
            postLoad : function(chain) {
                assert.strictEqual(1, 1, 'Test postLoad child');
                QAppStorm.pop();
                chain.next();
            },
        }]
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'astatemanager5',
            expect: 6
        }
    );
});




// Test full unload chain process
QUnit.asyncTest('a.state-unload', function(assert) {
    // We expect the 6 : 1, loading, then unloading: 3 from parent, 3 from children
    expect(7);

    var tree = {
        async: true,
        preUnload : function(chain) {
            assert.strictEqual(1, 1, 'Test preUnload parent');
            QAppStorm.pop();
            chain.next();
        },
        unload : function(chain) {
            assert.strictEqual(1, 1, 'Test unload parent');
            QAppStorm.pop();
            chain.next();
        },
        postUnload : function(chain) {
            assert.strictEqual(1, 1, 'Test postUnload parent');
            QAppStorm.pop();
            chain.next();
        },
        children : [{
            hash : 'astatemanager6',
            async: true,
            postLoad: function(chain) {
                assert.strictEqual(1, 1, 'Test postLoad child');
                QAppStorm.pop();
                chain.next();
            },
            preUnload : function(chain) {
                assert.strictEqual(1, 1, 'Test preUnload child');
                QAppStorm.pop();
                chain.next();
            },
            unload : function(chain) {
                assert.strictEqual(1, 1, 'Test unload child');
                QAppStorm.pop();
                chain.next();
            },
            postUnload : function(chain) {
                assert.strictEqual(1, 1, 'Test postUnload child');
                QAppStorm.pop();
                chain.next();
            },
        }]
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'astatemanager6',
            expect: 1
        }, {
            hash: 'tmp_statemanager6',
            expect: 6
        }
    );
});



// Testing both some load, and some unload
QUnit.asyncTest('a.state-load-unload', function(assert) {
    // We expect the 7 : 2 from parent at load, 2 from children at load,
    // 3 from parent and children on unload
    expect(7);

    var tree = {
        hash : 'astatemanager7',
        async: true,
        preLoad : function(chain) {
            assert.strictEqual(1, 1, 'Test preLoad parent');
            QAppStorm.pop();
            chain.next();
        },
        load : function(chain) {
            assert.strictEqual(1, 1, 'Test load parent');
            QAppStorm.pop();
            chain.next();
        },
        preUnload : function(chain) {
            assert.strictEqual(1, 1, 'Test preUnload parent');
            QAppStorm.pop();
            chain.next();
        },
        postUnload : function(chain) {
            assert.strictEqual(1, 1, 'Test postUnload parent');
            QAppStorm.pop();
            chain.next();
        },
        children : [{
            hash : 'astatemanager8',
            async: true,
            preLoad : function(chain) {
                assert.strictEqual(1, 1, 'Test preLoad child');
                QAppStorm.pop();
                chain.next();
            },
            load : function(chain) {
                assert.strictEqual(1, 1, 'Test load child');
                QAppStorm.pop();
                chain.next();
            },
            postUnload : function(chain) {
                assert.strictEqual(1, 1, 'Test postUnload child');
                QAppStorm.pop();
                chain.next();
            }
        }]
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'astatemanager7',
            expect: 2
        }, {
            hash: 'astatemanager8',
            expect: 2
        }, {
            hash: 'tmp_statemanager8',
            expect: 3
        }
    );
});



// Test hashtag not fired if state is not linked to this hashtag
QUnit.asyncTest('a.state-notfired', function(assert) {
    expect(1);

    var main1 = {
        hash : 'astatemanager9',
        async: true,
        load : function(chain) {
            assert.strictEqual(1, 1, 'Test load, main1');
            QAppStorm.pop();
            chain.next();
        }
    };

    var main2 = {
        hash : 'astatemanager10',
        async: true,
        load : function(chain) {
            assert.strictEqual(10, 1, 'Should not fire...');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    QAppStorm.chain(
        {
            hash: 'astatemanager9',
            expect: 1
        }, {
            hash: 'tmp_astatemanager9',
            expect: 0,
            callback: function(chain) {
                setTimeout(function() {
                    chain.next();
                }, 100);
            }
        }
    );
});



// TODO : be able to test translate, css, and html loaded
// Test loading HTML, CSS, JS, and translate
QUnit.asyncTest('a.state-loader', function(assert) {
    // Many test are done to check everything was loaded as expected
    expect(7);

    var main = {
        hash: 'astatemanager12',
        async: true,

        entry: 'body',
        type:  'append',

        include : {
            css :       './resource/data/state/test.css',
            html :      './resource/data/state/test.html',
            js :        './resource/data/state/test.js',
            translate : './resource/data/state/translate.json'
        },
        postLoad: function(chain) {
            // Testing JS files has been loaded (the function included inside
            // Js file exist in page
            assert.strictEqual(typeof(unittest_state_js), 'function',
                    'Test JS file has been loaded');
            QAppStorm.pop();

            // Testing language translate
            var tr1 = a.translate.getDictionnary('unittest-state1'),
                tr2 = a.translate.getDictionnary('unittest-state2');

            
            assert.strictEqual(tr1['hello'], 'nope', 'Test translate');
            QAppStorm.pop();
            assert.strictEqual(tr1['second'], 'nope2', 'Test translate');
            QAppStorm.pop();
            assert.strictEqual(tr2['hello'], 'word', 'Test translate');
            QAppStorm.pop();
            assert.strictEqual(tr2['second'], 'hy', 'Test translate');
            QAppStorm.pop();

            // Testing CSS loading
            var div = document.createElement('div');
            div.style.display = 'none';
            div.id = 'unittest_state_css';

            if(document.body) {
                document.body.appendChild(div);
            } else {
                document.getElementsByTagName('body')[0].appendChild(div);
            }

            var height = (div.currentStyle) ? div.currentStyle['height'] :
                    document.defaultView.getComputedStyle(div,null)
                    .getPropertyValue('height');
            assert.strictEqual(height, '20px', 'Test CSS applies correctly');
            QAppStorm.pop();

            // Test HTML (test mustache got the file loaded)
            var uriHTML = './resource/data/state/test.html';
            var hash = 'a_tmpl_' + uriHTML.replace(/[^a-zA-Z0-9]/g, '_');
            assert.strictEqual(typeof(a.template._tmpl[hash]), 'string',
                'Test the template has been registred as available template');
            QAppStorm.pop();
            chain.next();
        }
    }

    a.state.add(main);

    QAppStorm.chain(
        {
            hash: 'astatemanager12',
            expect: 7
        }
    );
});


// Test loading multiple data and send that to html as expected
QUnit.asyncTest('a.state-multiData', function(assert) {
    expect(7);

    var tree = {
        hash : 'astatemanager13',
        async: true,

        entry: 'body',
        type:  'append',

        data : {
            userList : 'resource/data/state/multidata-1.json',
            projectList : 'resource/data/state/multidata-2.json',
            myself : 'resource/data/state/multidata-3.json'
        },

        include : {
            html : 'resource/data/state/multidata.html'
        },

        // On load function, we will catch html parsed from Mustache,
        // and check content
        load : function(chain) {
            // UserList test
            var user1 = document.getElementById('multidata-userlist4-result');
            var user2 = document.getElementById('multidata-userlist5-result');

            assert.strictEqual(user1.innerHTML.toLowerCase(), 'george',
                                                        'Test first user');
            QAppStorm.pop();
            assert.strictEqual(user2.innerHTML.toLowerCase(), 'christophe', 
                                                        'Test second user');
            QAppStorm.pop();

            // ProjectList test
            var project1 = document
                        .getElementById('multidata-projectlist202-result');
            var project2 = document
                        .getElementById('multidata-projectlist300-result');

            assert.strictEqual(project1.innerHTML.toLowerCase(), 'project 1',
                                                    'Test first project');
            QAppStorm.pop();
            assert.strictEqual(project2.innerHTML.toLowerCase(), 'superb project',
                                                    'Test second project');
            QAppStorm.pop();

            // Testing object loading
            var myself1 = document
                        .getElementById('multidata-myself-id-result');
            assert.strictEqual(myself1.innerHTML.toLowerCase(), '30', 'Test user id');
            QAppStorm.pop();

            var myself2 = document
                        .getElementById('multidata-myself-firstname-result');
            assert.strictEqual(myself2.innerHTML.toLowerCase(), 'js',
                                                    'Test user firstname');
            QAppStorm.pop();

            var myself3 = document
                        .getElementById('multidata-myself-lastname-result');
            assert.strictEqual(myself3.innerHTML.toLowerCase(), 'appstorm',
                                                    'Test user lastname');
            QAppStorm.pop();

            chain.next();
        }
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'astatemanager13',
            expect: 7
        }
    );
});




// Test event begin and end before and after loading a state
QUnit.asyncTest('a.state.begin-end', function(assert) {
    expect(2);

    a.message.bind('a.state.begin', function(data) {
        // We don't want preload unit tests...
        if(!data.value || data.value === 'tmp_astatemanager14') {
            return;
        }
        assert.strictEqual(data.value, 'astatemanager14', 'Test message begin');
        QAppStorm.pop();
    });
    a.message.bind('a.state.end', function(data) {
        // We don't want preload unit tests...
        if(!data.value || data.value === 'tmp_astatemanager14') {
            return;
        }
        assert.strictEqual(data.value, 'astatemanager14', 'Test message end');
        QAppStorm.pop();
    });

    QAppStorm.chain(
        {
            hash: 'astatemanager14',
            expect: 1
        }, {
            hash: 'tmp_astatemanager14',
            expect: 1
        }
    );
});




// Test to send parameter into html loading
QUnit.asyncTest('a.state.html-parameter', function(assert) {
    expect(1);

    var htmlParameter = {
        id : 'html-parameter',
        hash : 'html-parameter-{{param : [a-z]+}}',
        async: true,
        entry: 'body',
        type:  'append',

        include : {
            html : 'resource/data/state/html-parameter-{{param}}.html'
        },

        // On load function, we will catch html parsed from Mustache,
        // and check content
        load : function(chain) {
            var loaded = document.getElementById('html-parameter-loaded');
            assert.strictEqual(loaded.innerHTML.toLowerCase(), 'ok',
                                'Test loading html with parameters');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add(htmlParameter);

    QAppStorm.chain(
        {
            hash: 'html-parameter-ok',
            expect: 1
        }
    );
});



// Test adding parameter inside data url
QUnit.asyncTest('a.state.data-parameter', function(assert) {
    expect(1);

    var htmlParameter = {
        id : 'data-parameter',
        hash : 'data-parameter-{{param : [a-z]+}}',

        data : 'resource/data/state/data-parameter-{{param}}.json',

        converter : function(data) {
            assert.strictEqual(data.ok, 'ok', 'Test loading data with parameters');
            QAppStorm.pop();
        }
    };

    a.state.add(htmlParameter);

    QAppStorm.chain(
        {
            hash: 'data-parameter-ok',
            expect: 1
        }
    );
});




// Test converter function behaviour on no data loaded
QUnit.asyncTest('a.state.data-converter-nodata', function(assert) {
    expect(1);

    var test = {
        id : 'data-converter-nodata',
        hash : 'data-converter-nodata',
        async: true,
        entry: 'body',
        type:  'append',
        converter:function(data) {
            data.converter = 'converted';
        },

        include : {
            html : 'resource/data/state/data-converter-nodata.html'
        },

        // Test content has been loaded with converter modification
        load : function(chain) {
            var loaded = document
                        .getElementById('data-converter-nodata-loaded');
            assert.strictEqual(loaded.innerHTML.toLowerCase(), 'converted',
                                            'Test loading data converter');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add(test);

    QAppStorm.chain(
        {
            hash: 'data-converter-nodata',
            expect: 1
        }
    );
});



// Test converter function behaviour with loaded data
QUnit.asyncTest('a.state.data-converter-append', function(assert) {
    expect(2);

    var test = {
        id : 'data-converter-append',
        hash : 'data-converter-append',
        async: true,
        entry: 'body',
        type:  'append',

        data : 'resource/data/state/data-converter-append.json',
        include : {
            html : 'resource/data/state/data-converter-append.html'
        },

        converter:function(data) {
            data.another = 'chain';
        },
        // Test content has been loaded with converter modification
        load : function(chain) {
            var loaded = document
                            .getElementById('data-converter-append-loaded');
            assert.strictEqual(loaded.innerHTML.toLowerCase(), 'converted',
                                            'Test loading data converter');
            QAppStorm.pop();
            var second = document
                    .getElementById('data-converter-append-another-loaded');
            assert.strictEqual(second.innerHTML.toLowerCase(), 'chain',
                                        'Test append loading data converter');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add(test);

    QAppStorm.chain(
        {
            hash: 'data-converter-append',
            expect: 2
        }
    );
});



// Test binding parameters to data
QUnit.asyncTest('a.state.data-cross-parameter', function(assert) {
    expect(4);

    var test = {
        id:    'data-cross-parameter',
        hash:  'data-cross-parameter-{{id: [0-9]+}}-{{parent: [a-zA-Z0-9]+}}',
        async: true,
        entry: 'body',
        type:  'append',

        // Binding parameter from hashtag
        data: {
            id:          '{{id}}',
            something:   '{{parent}}',
            mem:         '{{memory: cross-parameter}}',
            memComplex:  '{{memory: cross-parameter-complex}}'
        },

        include: {
            html: 'resource/data/state/data-cross-parameter.html'
        },

        converter: function(data) {
            console.log(data);
        },

        // Test content has been loaded with parameter modification
        load : function(chain) {
            var id = document.getElementById('data-cross-parameter-id');
            assert.strictEqual(id.innerHTML, '9860', 'Test data cross parameter');
            QAppStorm.pop();
            
            var parent = document
                        .getElementById('data-cross-parameter-parent');
            assert.strictEqual(parent.innerHTML, 'dataParent01',
                                                'Test data cross parameter');
            QAppStorm.pop();
            var memComplexA = document
                    .getElementById('data-cross-parameter-mem-complex-a');
            assert.strictEqual(memComplexA.innerHTML, 'b',
                                                'Test data cross parameter');
            QAppStorm.pop();
            var memComplexC = document
                    .getElementById('data-cross-parameter-mem-complex-c');
            assert.strictEqual(memComplexC.innerHTML, 'd',
                                                'Test data cross parameter');
            QAppStorm.pop();
            // Continue
            chain.next();
        }
    };

    a.storage.memory.set('cross-parameter', 'plopu');
    a.storage.memory.set('cross-parameter-complex', {
        a : 'b',
        c : 'd'
    });

    a.state.add(test);

    // Now starting to proceed loader
    QAppStorm.chain(
        {
            hash: 'data-cross-parameter-9860-dataParent01',
            expect: 4
        }
    );
});



// Test title with hashtag parameters
QUnit.asyncTest('a.state.title', function(assert) {
    expect(1);

    var previous = document.title;

    var test = {
        id : 'test-title',
        hash : 'test-title-{{parent : [a-zA-Z0-9]+}}',
        title : 'test loading - {{parent}}',
        postLoad: function() {
            assert.strictEqual(document.title, 'test loading - oktitle',
                                            'test title parameter');
            QAppStorm.pop();
            document.title = previous;
        }
    };

    a.state.add(test);

    QAppStorm.chain(
        {
            hash: 'test-title-oktitle',
            expect: 1
        }
    );
});


// Two hashtag : one in the parent, one in the children
// Only the children is correctly parsed (speed gain)
QUnit.asyncTest('a.state.underhash', function(assert) {
    expect(2);

    var tree = {
        id : 'root',
        hash : 'root-{{user : [a-fA-F0-9]+}}',
        data : {
            id : '{{user}}'
        },
        converter : function(data) {
            assert.strictEqual(data.id, '{{user}}', 'Test user is not parsed tag');
            QAppStorm.pop();
        },
        children : {
            id : 'sub',
            hash : 'welcome-{{user : [a-fA-F0-9]+}}',
            data : {
                id : '{{user}}'
            },
            converter : function(data) {
                assert.strictEqual(data.id, 'aaaa', 'Test user is parsed into child');
                QAppStorm.pop();
            }
        }
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'welcome-aaaa',
            expect: 2
        }
    );
});


// Test options url
QUnit.asyncTest('a.state.options-parameter', function(assert) {
    expect(1);

    var tree = {
        id : 'root',
        hash : 'options-parameter-{{woot : [a-fA-F0-9]+}}',
        data : {
            user : {
                url : 'resource/data/state/options_parameter.php',
                options : {
                    header : {
                        unittest : '{{woot}}'
                    }
                }
            }
        },
        converter : function(data) {
            assert.strictEqual(data.user, 'abcdef0',
                                    'Test content transmitted threw system');
            QAppStorm.pop();
        }
    };

    a.state.add(tree);

    QAppStorm.chain(
        {
            hash: 'options-parameter-abcdef0',
            expect: 1
        }
    );
});


// Test the 'use' extend system
QUnit.test('a.state.use', function(assert) {
    assert.expect(8);

    var initialState = {
        id: 'init-state',
        hash: 'init-state',
        preLoad: function(chain) {
            chain.next();
        }
    };

    a.state.add(initialState);

    a.state.use('init-state', {
        id: 'sub-state',
        postLoad: function(chain) {
            chain.next();
        }
    });

    var storedInitialState = a.state.get('init-state'),
        storedSubState = a.state.get('sub-state');

    // Now we test the current init-state element
    assert.strictEqual(storedInitialState.id, 'init-state', 'Test id');
    assert.strictEqual(storedInitialState._storm.hash[0].hash, 'init-state',
                                                                'Test hash');
    assert.strictEqual(a.isFunction(storedInitialState.preLoad), true,
                                                            'Test preLoad');
    assert.strictEqual(a.isFunction(storedInitialState.postLoad), false,
                                                            'Test postLoad');

    // We test the duplicate element
    assert.strictEqual(storedSubState.id, 'sub-state', 'Test id');
    assert.strictEqual(storedSubState._storm.hash[0].hash, 'init-state', 'Test hash');
    assert.strictEqual(a.isFunction(storedSubState.preLoad), true, 'Test preLoad');
    assert.strictEqual(a.isFunction(storedSubState.postLoad), true, 'Test postLoad');
});



// Test system allow bind/unbind event
QUnit.asyncTest('a.state.load-bind', function(assert) {
    // We create a binding
    // Test binding is working
    // Unload state
    // Test binding is not working
    assert.expect(2);

    a.state.add({
        id:    'state-bind-unbind',
        hash:  'unittest-state-bind-unbind',
        entry: 'body',
        type:  'append',

        include: {
            html: 'resource/data/state/bind-unbind.html'
        },

        bind: {
            '#bind-unbind .first | click': function(e) {
                assert.strictEqual(e.target.className, 'first', 'Test first click');
                QAppStorm.pop();
            },
            '#bind-unbind .second | click': function(e) {
                assert.strictEqual(e.target.className, 'second', 'Test second click');
                QAppStorm.pop();
            }
        },

        postLoad: function() {
            // We test binding appear
            var first  = document.querySelector('#bind-unbind .first'),
                second = document.querySelector('#bind-unbind .second');

            // We start unit test
            first.click();
            second.click();
        }
    });



    QAppStorm.chain(
        {
            hash: 'unittest-state-bind-unbind',
            expect: 2,
            callback: function(chain) {
                setTimeout(function() {
                    chain.next();
                }, 200);
            }
        }, {
            hash: 'tmp_unittest-state-bind-unbind',
            expect: 0,
            callback: function(chain) {
                setTimeout(function() {
                    chain.next();
                }, 500);
            }
        }, {
            hash: 'tmp_tmp_unittest-state-bind-unbind',
            expect: 0,
            callback: function(chain) {
                // We test binding appear
                var first  = document.querySelector('#bind-unbind .first'),
                    second = document.querySelector('#bind-unbind .second');

                // We start unit test (should do nothing as unbind raised on unload)
                first.click();
                second.click();

                var toRemove = document.getElementById('bind-unbind');
                toRemove.parentElement.removeChild(toRemove);
                chain.next();
            }
        }
    );
});




// Test system allow bind/unbind event ON the entry directly
QUnit.asyncTest('a.state.load-bind-entry', function(assert) {
    // We create a binding
    // Test binding is working
    // Unload state
    // Test binding is not working
    assert.expect(1);

    a.state.add({
        id:    'state-bind-unbind-entry',
        hash:  'unittest-state-bind-unbind-entry',
        entry: '#a-state-direct-entry-bind',
        type:  'append',

        bind: {
            'click': function(e) {
                assert.strictEqual(e.target.id, 'a-state-direct-entry-bind',
                                                        'Test id click');
                QAppStorm.pop();
            }
        },

        postLoad: function() {
            // We test binding appear
            var entry = document.getElementById('a-state-direct-entry-bind');

            // We start unit test
            entry.click();
        }
    });

    QAppStorm.chain(
        {
            hash: 'unittest-state-bind-unbind-entry',
            expect: 1,
            callback: function(chain) {
                setTimeout(function() {
                    chain.next();
                }, 500);
            }
        }, {
            hash: 'tmp_unittest-state-bind-unbind-entry',
            expect: 0,
            callback: function(chain) {
                // We test binding appear
                var entry = document.getElementById('a-state-direct-entry-bind');

                // We start unit test (should do nothing)
                entry.click();

                setTimeout(function() {
                    chain.next();
                }, 200);
            }
        }
    );
});





// Test the async parameter
QUnit.asyncTest('a.state.async-boolean', function(assert) {
    assert.expect(4);

    var asyncFalse = {
        id: 'a.state.async-false',
        hash: 'test-async-false',
        async: false,
        preLoad: function() {
            assert.strictEqual(1, 1, 'Test async false');
            QAppStorm.pop();
        },
        postLoad: function() {
            assert.strictEqual(1, 1, 'Test async false');
            QAppStorm.pop();
        }
    };

    var asyncTrue = {
        id: 'a.state.async-true',
        hash: 'test-async-true',
        async: true,
        preLoad: function(chain) {
            assert.strictEqual(1, 1, 'Test async true');
            QAppStorm.pop();
            chain.next();
        },
        postLoad: function(chain) {
            assert.strictEqual(1, 1, 'Test async true');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add([asyncTrue, asyncFalse]);

    QAppStorm.chain(
        {
            hash: 'test-async-false',
            expect: 2
        }, {
            hash: 'test-async-true',
            expect: 2
        }
    );
});


// Test async on a single string
QUnit.asyncTest('a.state.async-string', function(assert) {
    assert.expect(6);

    var asyncString1 = {
        id: 'a.state.async-str1',
        hash: 'test-async-str1',
        async: 'load',
        preLoad: function() {
            assert.strictEqual(1, 1, 'Test async str');
            QAppStorm.pop();
        },
        load: function(chain) {
            assert.strictEqual(1, 1, 'Test async str');
            QAppStorm.pop();
            chain.next();
        },
        postLoad: function() {
            assert.strictEqual(1, 1, 'Test async str');
            QAppStorm.pop();
        }
    };

    var asyncString2 = {
        id: 'a.state.async-str2',
        hash: 'test-async-str2',
        async: 'postLoad',
        preLoad: function() {
            assert.strictEqual(1, 1, 'Test async str');
            QAppStorm.pop();
        },
        load: function() {
            assert.strictEqual(1, 1, 'Test async str');
            QAppStorm.pop();
        },
        postLoad: function(chain) {
            assert.strictEqual(1, 1, 'Test async str');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add([asyncString1, asyncString2]);

    QAppStorm.chain(
        {
            hash: 'test-async-str1',
            expect: 3
        }, {
            hash: 'test-async-str2',
            expect: 3
        }
    );
});


QUnit.asyncTest('a.state.async-array', function(assert) {
    assert.expect(6);

    var asyncArray1 = {
        id: 'a.state.async-arr1',
        hash: 'test-async-arr1',
        async: ['preLoad', 'load'],
        preLoad: function(chain) {
            assert.strictEqual(1, 1, 'Test async array');
            QAppStorm.pop();
            chain.next();
        },
        load: function(chain) {
            assert.strictEqual(1, 1, 'Test async array');
            QAppStorm.pop();
            chain.next();
        },
        postLoad: function() {
            assert.strictEqual(1, 1, 'Test async array');
            QAppStorm.pop();
        }
    };

    var asyncArray2 = {
        id: 'a.state.async-arr2',
        hash: 'test-async-arr2',
        async: ['preLoad', 'postLoad'],
        preLoad: function(chain) {
            assert.strictEqual(1, 1, 'Test async array');
            QAppStorm.pop();
            chain.next();
        },
        load: function() {
            assert.strictEqual(1, 1, 'Test async array');
            QAppStorm.pop();
        },
        postLoad: function(chain) {
            assert.strictEqual(1, 1, 'Test async array');
            QAppStorm.pop();
            chain.next();
        }
    };

    a.state.add([asyncArray1, asyncArray2]);

    QAppStorm.chain(
        {
            hash: 'test-async-arr1',
            expect: 3
        }, {
            hash: 'test-async-arr2',
            expect: 3
        }
    );
});


// Test how the state react regarding acl changes
QUnit.asyncTest('a.state.acl-change', function(assert) {
    assert.expect(3);

    var state = {
        id: 'state-acl-change',
        hash: 'state-acl-chang{{el: [a-z]?}}',
        acl: {
            allowed: 'acl-change2'
        },
        preLoad: function() {
            assert.strictEqual(1, 1, 'Acl has been updated as expected');
            QAppStorm.pop();
        }
    };

    a.acl.setCurrentRole('acl-change');
    a.state.add(state);

    // We test acl value
    assert.strictEqual(state._storm.acl, false, 'Value is not ready');

    QAppStorm.chain(
        {
            hash: 'state-acl-change',
            expect: 1,
            callback: function(chain) {
                a.acl.setCurrentRole('acl-change2');
                chain.next();
            }
        }, {
            hash: 'state-acl-changz',
            expect: 0,
            callback: function(chain) {
                assert.strictEqual(state._storm.acl, true, 'Value has been updated');
                chain.next();
            }
        }
    );
});


// Setup a minimum role for acl
QUnit.asyncTest('a.state.acl-minimum', function(assert) {
    assert.expect(1);

    var state = {
        id: 'acl-minimum-change',
        hash: 'a.state.acl-minimum{{el: [a-z]?}}',
        acl: {
            minimum: 'admin'
        },
        postLoad: function() {
            assert.strictEqual(a.acl.getCurrentRole(), 'admin', 'ACL unit test');
            QAppStorm.pop();
        }
    };

    // State will be refused by default
    a.acl.setRoleList(['user', 'admin']);
    a.acl.setCurrentRole('user');

    // We add the state, the minimum will be performed
    a.state.add(state);

    QAppStorm.chain(
        {
            hash: 'a.state.acl-minimuma',
            expect: 1,
            callback: function(chainer) {
                a.acl.setCurrentRole('admin');
                chain.next();
            }
        }, {
            hash: 'a.state.acl-minimumb',
            expect: 0
        }
    );
});

// Define a maximum step
QUnit.asyncTest('a.state.acl-maximum', function(assert) {
    assert.expect(1);

    var state = {
        id: 'acl-maximum-change',
        hash: 'a.state.acl-maximum{{el: [a-z]?}}',
        acl: {
            maximum: 'user'
        },
        postLoad: function() {
            assert.strictEqual(a.acl.getCurrentRole(), 'user', 'ACL unit test');
            QAppStorm.pop();
        }
    };

    // State will be refused by default
    a.acl.setRoleList(['user', 'admin']);
    a.acl.setCurrentRole('user');

    // We add the state, the maximum will be performed
    a.state.add(state);

    QAppStorm.chain(
        {
            hash: 'a.state.acl-maximuma',
            expect: 1,
            callback: function(chain) {
                a.acl.setCurrentRole('admin');
                chain.next();
            }
        }, {
            hash: 'a.state.acl-maximumb',
            expect: 0
        }
    );
});

// Any element is accepted, except the one defined in refused
QUnit.asyncTest('a.state.acl-refused', function(assert) {
    assert.expect(2);

    var state = {
        id: 'acl-refused-change',
        hash: 'a.state.acl-refused{{el: [a-z]?}}',
        acl: {
            refused: 'leader'
        },
        postLoad: function() {
            var role = a.acl.getCurrentRole();
            // Thoose two role are allowed
            if(role == 'user') {
                assert.strictEqual(role, 'user', 'User passed');
                QAppStorm.pop();
            } else if(role == 'admin') {
                assert.strictEqual(role, 'admin', 'Admin passed');
                QAppStorm.pop();
            } else {
                assert.strictEqual(role, false, 'Leader SHOULD NOT pass');
                QAppStorm.pop();
            }
        }
    };

    a.acl.setRoleList(['user', 'leader', 'admin']);
    a.acl.setCurrentRole('user');

    // We add the state, the refused will not be performed
    a.state.add(state);

    QAppStorm.chain(
        {
            hash: 'a.state.acl-refuseda',
            expect: 1,
            callback: function(chain) {
                a.acl.setCurrentRole('leader');
                chain.next();
            }
        }, {
            hash: 'a.state.acl-refusedb',
            expect: 1,
            callback: function(chain) {
                a.acl.setCurrentRole('admin');
                chain.next();
            }
        }, {
            hash: 'a.state.acl-refusedc',
            expect: 0
        }
    );
});



// Test the inject parameters system
QUnit.asyncTest('a.state.inject', function(assert) {
    assert.expect(1);

    a.state.add({
        id: 'a.state.inject-test',
        hash: 'a.state.inject-test',
        data: {
            el: '{{inject: ok}}'
        },
        converter: function(data) {
            console.log(data);
            assert.strictEqual(data.el, 'something');
        }
    });

    chain('a.state.inject-test', start, 500);

    setTimeout(function() {
        a.route.hash('a.state.inject-test', {
            ok: 'something'
        });
    }, 200);
});


// Testing to loadAfter functionnality
QUnit.asyncTest('a.state.load-after', function(assert) {
    assert.expect(2);

    var parent = {
        id: 'a.state.loadafter-parent',
        hash: 'a.state.loadafter',
        loadAfter: 'a.state.loadafter-child',
        postLoad: function() {
            assert.strictEqual(true, true);
            QAppStorm.pop();
        }
    };

    var child = {
        id: 'a.state.loadafter-child',
        postLoad: function() {
            assert.strictEqual(true, true);
            QAppStorm.pop();
        }
    };

    a.state.add([parent, child]);

    QAppStorm.chain(
        {
            hash: 'a.state.loadafter',
            expect: 2
        }
    );
});

// Unit test the raw mock support for faking server with not-parsed requests
QUnit.asyncTest('a.state.data-mock', function(assert) {
    assert.expect(2);

    a.mock.add('GET', 'something/{{important}}', {
        version: '1.0.2'
    });

    // Test correctly setted
    strictEqual(a.mock.get('GET', 'something/{{important}}').version, '1.0.2');

    var state = {
        id: 'a.state.data-mock',
        hash: 'a.state.data-mock-{{important: [a-fA-F0-9]+}}',
        data: {
            content: {
                url: 'something/{{important}}',
                method: 'GET'
            }
        },
        converter: function(data) {
            assert.strictEqual(data.content.version, '1.0.2');
            QAppStorm.pop();
        }
    };

    a.state.add(state);

    QAppStorm.chain(
        {
            hash: 'a.state.data-mock-abcdef',
            expect: 1
        }
    );
});


// Test the new capacities for entry/el/dom to use a function instead of a string
QUnit.asyncTest('a.state.entry-function', function(assert) {
    assert.expect(2);

    var state = {
        id: 'a.state.entry-function',
        hash: 'a.state.entry-function',
        entry: function() {
            return 'something-is-working';
        },
        type: function(entry, content, chain) {
            assert.strictEqual(entry, 'something-is-working');
            QAppStorm.pop();
            assert.strictEqual(content, "<a style='display:none'>I'm loaded threw state</a>");
            QAppStorm.pop();
            chain.next();
        },
        include : {
            html : './resource/data/state/test.html'
        },
    };

    a.state.add(state);

    QAppStorm.chain(
        {
            hash: 'a.state.entry-function',
            expect: 2
        }
    );
});


// Test data as a function instead of string/object
QUnit.asyncTest('a.state.data-function', function(assert) {
    assert.expect(1);

    a.state.add({
        id: 'a.state.data-function',
        hash: 'a.state.data-function',
        data: function(chain) {
            chain.next('i got something');
        },
        include : {
            html : './resource/data/state/test.html'
        },
        converter: function(data) {
            assert.strictEqual(data, 'i got something');
            QAppStorm.pop();
        }
    });

    QAppStorm.chain(
        {
            hash: 'a.state.data-function',
            expect: 1
        }
    );
});

// Little bit more complex data test
QUnit.asyncTest('a.state.data-function2', function(assert) {
    assert.expect(1);

    a.state.add({
        id: 'a.state.data-function2',
        hash: 'a.state.data-function2',
        data: function(chain) {
            var request = new a.ajax({
                url: 'resource/data/state/data-parameter-ok.json',
                type: 'json'
            }, function(result) {
                chain.next(result);
            });
            request.send();
        },
        include : {
            html : './resource/data/state/test.html'
        },
        converter: function(data) {
            assert.strictEqual(data.ok, 'ok');
            QAppStorm.pop();
        }
    });

    QAppStorm.chain(
        {
            hash: 'a.state.data-function2',
            expect: 1
        }
    );
});

// More complex data structure, mixing many things at a time
QUnit.asyncTest('a.state.data-function3', function(assert) {
    assert.expect(2);

    a.storage.memory.set('something', 'other ok');

    var state = {
        id: 'a.state.data-function3',
        hash: 'a.state.data-function3',
        data: {
            id: '{{memory: something}}',
            content: function(chain) {
                var request = new a.ajax({
                    url: 'resource/data/state/data-parameter-ok.json',
                    type: 'json'
                }, function(result) {
                    chain.next(result);
                });
                request.send();
            }
        },
        include : {
            html : './resource/data/state/test.html'
        },
        converter: function(data) {
            assert.strictEqual(data.id, 'other ok');
            QAppStorm.pop();
            assert.strictEqual(data.content.ok, 'ok');
            QAppStorm.pop();
        },
        postLoad: function() {
            a.storage.memory.remove('something');
        }
    };

    a.state.add(state);

    QAppStorm.chain(
        {
            hash: 'a.state.data-function3',
            expect: 2
        }
    );
});

// Testing usage parameters
QUnit.asyncTest('a.state.parameters', function(assert) {
    assert.expect(2);

    a.state.add({
        id: 'a.state.parameters',
        hash: '/something/{{interest: [a-zA-Z0-9]+}}/with/{{content: \\d+}}',
        preLoad: function() {
            assert.strictEqual(this.parameters.interest, 'gettinggood01');
            QAppStorm.pop();
            assert.strictEqual(this.parameters.content, '13');
            QAppStorm.pop();
        }
    });

    QAppStorm.chain(
        {
            hash: '/something/gettinggood01/with/13',
            expect: 2
        }
    );
});

// Keyboard test
QUnit.asyncTest('a.state.keyboard-bindings', function(assert) {
    assert.expect(6);

    a.state.add({
        id: 'a.state.keyboard-bindings',
        hash: 'a.state.keyboard-bindings',
        keyboard: {
            'a': function() {
                assert.strictEqual(true, true);
                QAppStorm.pop();
            },
            'b:keypress': function() {
                assert.strictEqual(true, true);
                QAppStorm.pop();
            },
            'c|d:keyup': function() {
                assert.strictEqual(true, true);
                QAppStorm.pop();
            },
            'e:keypress|f:keydown': function() {
                assert.strictEqual(true, true);
                QAppStorm.pop();
            }
        },
        postLoad: function() {
            // Test trigger is working
            a.keyboard.trigger('a', 'keypress');
            a.keyboard.trigger('b', 'keypress');
            a.keyboard.trigger('c', 'keypress');
            a.keyboard.trigger('d', 'keyup');
            a.keyboard.trigger('e', 'keypress');
            a.keyboard.trigger('f', 'keydown');
        },
        postUnload: function() {
            // Test trigger does not work (unbind is done)
            a.keyboard.trigger('a', 'keypress');
            a.keyboard.trigger('b', 'keypress');
            a.keyboard.trigger('c', 'keypress');
            a.keyboard.trigger('d', 'keyup');
            a.keyboard.trigger('e', 'keypress');
            a.keyboard.trigger('f', 'keydown');
        }
    });

    QAppStorm.chain(
        {
            hash: 'a.state.keyboard-bindings',
            expect: 6
        }, {
            hash: 'a.state.keyboard-unbind',
            expect: 0
        }
    );
});


// Testing multiple hash response
QUnit.asyncTest('a.state.multiple-hash', function(assert) {
    assert.expect(4);

    a.state.add({
        id: 'a.state.multiple-hash',
        hash: [
            'a.state.multiple-hash{{num: \\d+}}',
            'a.state.multiple-hash{{let: [a-z]+}}'
        ],
        postLoad: function() {
            assert.strictEqual(a.size(this.parameters), 1);
            QAppStorm.pop();

            if(this.parameters.num) {
                assert.strictEqual(this.parameters.num, '2');
                QAppStorm.pop();
            } else {
                assert.strictEqual(this.parameters.let, 'a');
                QAppStorm.pop();
            }
        }
    });


    QAppStorm.chain(
        {
            hash: 'a.state.multiple-hasha',
            expect: 2
        }, {
            hash: 'a.state.NO-multiple-hash',
            expect: 0
        }, {
            hash: 'a.state.multiple-hash2',
            expect: 2
        }
    );
});