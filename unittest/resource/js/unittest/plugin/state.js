// Unit test for a.state (plugin)
// We separate from state because this one is too much important + heavy ...

// TODO: bootOnLoad => reactivate
// TODO: event for every state loaded has been deleted, maybe corret that ?

module('plugin/state.js', {
    setup: function() {
        a.state.clear();
        hashtag('');
    },
    teardown: function() {
        a.state.clear();
        a.message.clear();
        hashtag('');
        a.acl.clear();
    }
});





// Start to check a single check hash change
asyncTest('a.state.hash-single-state', function() {
    expect(2);

    var main1 = {
        hash : 'astatemanager1',
        async: true,
        load : function(chain) {
            strictEqual(1, 1, 'Loading basic 1 succeed');
            chain.next();
        }
    };
    var main2 = {
        hash : 'astatemanager2',
        async: true,
        load : function(chain) {
            strictEqual(1, 1, 'Loading basic 2 succeed');
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    chain('astatemanager1', function() {
        hashtag('astatemanager2');
    });

    chain('astatemanager2', start, 100);

    hashtag('astatemanager1');
});

// Test hashexists
test('a.state.hashExists', function() {
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
    strictEqual(a.state.hashExists('something-good'), true,
                                            'Testing basic input');
    strictEqual(a.state.hashExists('notexisting'), false,
                                            'Testing wrong input');

    // Testing parameter detection
    strictEqual(a.state.hashExists('ok-now-something'), true,
                                            'Testing parameter input');
    strictEqual(a.state.hashExists('ok-now-2'), false,
                                            'Testing parameter input');
});









// State manager test
// Testing add to function : testing parent add, children add
test('a.state.add', function() {
    var testSingleChildren = {
        id : 'root',
        children : {
            id : 'sub'
        }
    };
    a.state.add(testSingleChildren);
    var treeSingleChildren = a.state.get('root');
    strictEqual(treeSingleChildren.id, 'root', 'Test root content');
    strictEqual(treeSingleChildren.children[0].id, 'sub',
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

    strictEqual(treeNormalChildren.id, 'root', 'Test root content');
    strictEqual(treeNormalChildren.children[0].id, 'sub1',
                                        'Test children content');
    strictEqual(treeNormalChildren.children[1].id, 'sub2',
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
    strictEqual(treeParentChildren.id, 'root', 'Test root content');
    strictEqual(treeParentChildren.children[0].id, 'sub1',
                                            'Test children content');
    strictEqual(treeParentChildren.children[0].children[0].id, 'subsub1',
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
    strictEqual(root1.id, 'root', 'Test root content');
    strictEqual(root2.id, 'root2', 'Test second root content');
});




// Test a load and unload, with a state in common (a parent)
asyncTest('a.state-path', function() {
    // We expect 3 : one from parent1, and 2 from sub child, this is
    // because parent1 will be loaded only
    // at first time, because it is shared between main1, and main2 !
    expect(3);

    var tree = {
        async: true,
        load : function(chain) {
            strictEqual(1, 1, 'Loading basic 1 succeed');
            chain.next();
        },
        children : [{
            hash : 'astatemanager3',
            async: true,
            load : function(chain) {
                strictEqual(1, 1, 'Loading basic 3 succeed');
                chain.next();
            }
        },{
            hash : 'astatemanager4',
            async: true,
            load : function(chain) {
                strictEqual(1, 1, 'Loading basic 4 succeed');
                chain.next();
            }
        }]
    };

    a.state.add(tree);


    chain('astatemanager3', function() {
        hashtag('astatemanager4');
    });

    chain('astatemanager4', start, 100);

    hashtag('astatemanager3');
});




// Test full load chain process
asyncTest('a.state-load', function() {
    // We expect the 6 : 3 from parent, 3 from children
    expect(6);

    var tree = {
        async: true,
        preLoad : function(chain) {
            strictEqual(1, 1, 'Test preLoad parent');
            chain.next();
        },
        load : function(chain) {
            strictEqual(1, 1, 'Test load parent');
            chain.next();
        },
        postLoad : function(chain) {
            strictEqual(1, 1, 'Test postLoad parent');
            chain.next();
        },
        children : [{
            hash : 'astatemanager5',
            async: true,
            preLoad : function(chain) {
                strictEqual(1, 1, 'Test preLoad child');
                chain.next();
            },
            load : function(chain) {
                strictEqual(1, 1, 'Test load child');
                chain.next();
            },
            postLoad : function(chain) {
                strictEqual(1, 1, 'Test postLoad child');
                chain.next();
            },
        }]
    };

    a.state.add(tree);

    chain('astatemanager5', start, 100);

    hashtag('astatemanager5');
});




// Test full unload chain process
asyncTest('a.state-unload', function() {
    // We expect the 6 : 3 from parent, 3 from children
    expect(6);

    var tree = {
        async: true,
        preUnload : function(chain) {
            strictEqual(1, 1, 'Test preUnload parent');
            chain.next();
        },
        unload : function(chain) {
            strictEqual(1, 1, 'Test unload parent');
            chain.next();
        },
        postUnload : function(chain) {
            strictEqual(1, 1, 'Test postUnload parent');
            chain.next();
        },
        children : [{
            hash : 'astatemanager6',
            async: true,
            preUnload : function(chain) {
                strictEqual(1, 1, 'Test preUnload child');
                chain.next();
            },
            unload : function(chain) {
                strictEqual(1, 1, 'Test unload child');
                chain.next();
            },
            postUnload : function(chain) {
                strictEqual(1, 1, 'Test postUnload child');
                chain.next();
            },
        }]
    };

    a.state.add(tree);

    chain('astatemanager6', function() {
        hashtag('tmp_statemanager6');
    });

    chain('tmp_statemanager6', start, 100);

    hashtag('astatemanager6');
});



// Testing both some load, and some unload
asyncTest('a.state-load-unload', function() {
    // We expect the 7 : 2 from parent at load, 2 from children at load,
    // 3 from parent and children on unload
    expect(7);

    var tree = {
        hash : 'astatemanager7',
        async: true,
        preLoad : function(chain) {
            strictEqual(1, 1, 'Test preLoad parent');
            chain.next();
        },
        load : function(chain) {
            strictEqual(1, 1, 'Test load parent');
            chain.next();
        },
        preUnload : function(chain) {
            strictEqual(1, 1, 'Test preUnload parent');
            chain.next();
        },
        postUnload : function(chain) {
            strictEqual(1, 1, 'Test postUnload parent');
            chain.next();
        },
        children : [{
            hash : 'astatemanager8',
            async: true,
            preLoad : function(chain) {
                strictEqual(1, 1, 'Test preLoad child');
                chain.next();
            },
            load : function(chain) {
                strictEqual(1, 1, 'Test load child');
                chain.next();
            },
            postUnload : function(chain) {
                strictEqual(1, 1, 'Test postUnload child');
                chain.next();
            }
        }]
    };

    a.state.add(tree);

    chain('astatemanager7', function() {
        hashtag('astatemanager8');
    }, 100);

    chain('astatemanager8', function() {
        hashtag('tmp_statemanager8');
    }, 100);

    chain('tmp_statemanager8', start, 100);

    hashtag('astatemanager7');
});



// Test hashtag not fired if state is not linked to this hashtag
asyncTest('a.state-notfired', function() {
    expect(1);

    var main1 = {
        hash : 'astatemanager9',
        async: true,
        load : function(chain) {
            strictEqual(1, 1, 'Test load, main1');
            chain.next();
        }
    };

    var main2 = {
        hash : 'astatemanager10',
        async: true,
        load : function(chain) {
            strictEqual(1, 1, 'Test load, main2');
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    chain('astatemanager9', function() {
        hashtag('tmp_astatemanager9');
    }, 100);

    chain('tmp_astatemanager9', start, 100);

    hashtag('astatemanager9');
});



// TODO : be able to test translate, css, and html loaded
// Test loading HTML, CSS, JS, and translate
asyncTest('a.state-loader', function() {
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
            strictEqual(typeof(unittest_state_js), 'function',
                    'Test JS file has been loaded');

            // Testing language translate
            var tr1 = a.translate.getDictionnary('unittest-state1'),
                tr2 = a.translate.getDictionnary('unittest-state2');

            strictEqual(tr1['hello'], 'nope', 'Test translate');
            strictEqual(tr1['second'], 'nope2', 'Test translate');
            strictEqual(tr2['hello'], 'word', 'Test translate');
            strictEqual(tr2['second'], 'hy', 'Test translate');

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
            strictEqual(height, '20px', 'Test CSS applies correctly');

            // Test HTML (test mustache got the file loaded)
            var uriHTML = './resource/data/state/test.html';
            var hash = 'a_tmpl_' + uriHTML.replace(/[^a-zA-Z0-9]/g, '_');
            strictEqual(typeof(a.template._tmpl[hash]), 'string',
                'Test the template has been registred as available template');
            chain.next();
        }
    }

    a.state.add(main);

    chain('astatemanager12', start, 500);

    hashtag('astatemanager12');
});


// Test loading multiple data and send that to html as expected
asyncTest('a.state-multiData', function() {
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

            strictEqual(user1.innerHTML.toLowerCase(), 'george',
                                                        'Test first user');
            strictEqual(user2.innerHTML.toLowerCase(), 'christophe', 
                                                        'Test second user');

            // ProjectList test
            var project1 = document
                        .getElementById('multidata-projectlist202-result');
            var project2 = document
                        .getElementById('multidata-projectlist300-result');

            strictEqual(project1.innerHTML.toLowerCase(), 'project 1',
                                                    'Test first project');
            strictEqual(project2.innerHTML.toLowerCase(), 'superb project',
                                                    'Test second project');

            // Testing object loading
            var myself1 = document
                        .getElementById('multidata-myself-id-result');
            strictEqual(myself1.innerHTML.toLowerCase(), '30', 'Test user id');

            var myself2 = document
                        .getElementById('multidata-myself-firstname-result');
            strictEqual(myself2.innerHTML.toLowerCase(), 'js',
                                                    'Test user firstname');

            var myself3 = document
                        .getElementById('multidata-myself-lastname-result');
            strictEqual(myself3.innerHTML.toLowerCase(), 'appstorm',
                                                    'Test user lastname');

            chain.next();
        }
    };

    a.state.add(tree);

    chain('astatemanager13', start, 100);

    hashtag('astatemanager13');
});




// Test event begin and end before and after loading a state
asyncTest('a.state.begin-end', function() {
    expect(2);

    a.message.bind('a.state.begin', function(data) {
        strictEqual(data.value, 'astatemanager14', 'Test message begin');
    });
    a.message.bind('a.state.end', function(data) {
        strictEqual(data.value, 'astatemanager14', 'Test message end');
    });

    chain('astatemanager14', start, 100);

    hashtag('astatemanager14');
});




// Test to send parameter into html loading
asyncTest('a.state.html-parameter', function() {
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
            strictEqual(loaded.innerHTML.toLowerCase(), 'ok',
                                'Test loading html with parameters');
            chain.next();
        }
    };

    a.state.add(htmlParameter);

    chain('html-parameter-ok', start, 100);

    hashtag('html-parameter-ok');
});



// Test adding parameter inside data url
asyncTest('a.state.data-parameter', function() {
    expect(1);

    var htmlParameter = {
        id : 'data-parameter',
        hash : 'data-parameter-{{param : [a-z]+}}',

        data : 'resource/data/state/data-parameter-{{param}}.json',

        converter : function(data) {
            strictEqual(data.ok, 'ok', 'Test loading data with parameters');
        }
    };

    a.state.add(htmlParameter);

    chain('data-parameter-ok', start, 100);

    hashtag('data-parameter-ok');
});




// Test converter function behaviour on no data loaded
asyncTest('a.state.data-converter-nodata', function() {
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
            strictEqual(loaded.innerHTML.toLowerCase(), 'converted',
                                            'Test loading data converter');
            chain.next();
        }
    };

    a.state.add(test);

    chain('data-converter-nodata', start, 100);

    hashtag('data-converter-nodata');
});



// Test converter function behaviour with loaded data
asyncTest('a.state.data-converter-append', function() {
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
            strictEqual(loaded.innerHTML.toLowerCase(), 'converted',
                                            'Test loading data converter');
            var second = document
                    .getElementById('data-converter-append-another-loaded');
            strictEqual(second.innerHTML.toLowerCase(), 'chain',
                                        'Test append loading data converter');
            chain.next();
        }
    };

    a.state.add(test);

    chain('data-converter-append', start, 100);

    hashtag('data-converter-append');
});



// Test binding parameters to data
asyncTest('a.state.data-cross-parameter', function() {
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

        // Test content has been loaded with parameter modification
        load : function(chain) {
            var id = document.getElementById('data-cross-parameter-id');
            strictEqual(id.innerHTML, '9860', 'Test data cross parameter');

            var parent = document
                        .getElementById('data-cross-parameter-parent');
            strictEqual(parent.innerHTML, 'dataParent01',
                                                'Test data cross parameter');

            var memComplexA = document
                    .getElementById('data-cross-parameter-mem-complex-a');
            strictEqual(memComplexA.innerHTML, 'b',
                                                'Test data cross parameter');

            var memComplexC = document
                    .getElementById('data-cross-parameter-mem-complex-c');
            strictEqual(memComplexC.innerHTML, 'd',
                                                'Test data cross parameter');

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

    chain('data-cross-parameter-9860-dataParent01', start, 100);

    hashtag('data-cross-parameter-9860-dataParent01');
});



// Test title with hashtag parameters
asyncTest('a.state.title', function() {
    expect(1);

    var previous = document.title;

    var test = {
        id : 'test-title',
        hash : 'test-title-{{parent : [a-zA-Z0-9]+}}',
        title : 'test loading - {{parent}}'
    };

    a.state.add(test);

    chain('test-title-oktitle', function() {
        strictEqual(document.title, 'test loading - oktitle',
                                        'test title parameter');
        document.title = previous;
        start();
    }, 100);

    hashtag('test-title-oktitle');
});


// Two hashtag : one in the parent, one in the children
// Only the children is correctly parsed (speed gain)
asyncTest('a.state.underhash', function() {
    expect(2);

    var tree = {
        id : 'root',
        hash : 'root-{{user : [a-fA-F0-9]+}}',
        data : {
            id : '{{user}}'
        },
        converter : function(data) {
            strictEqual(data.id, '{{user}}', 'Test user is not parsed tag');
        },
        children : {
            id : 'sub',
            hash : 'welcome-{{user : [a-fA-F0-9]+}}',
            data : {
                id : '{{user}}'
            },
            converter : function(data) {
                strictEqual(data.id, 'aaaa', 'Test user is parsed into child');
            }
        }
    };

    a.state.add(tree);

    chain('welcome-aaaa', start, 100);

    hashtag('welcome-aaaa');
});


// Test options url
asyncTest('a.state.options-parameter', function() {
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
            strictEqual(data.user, 'abcdef0',
                                    'Test content transmitted threw system');
        }
    };

    a.state.add(tree);

    chain('options-parameter-abcdef0', start, 100);

    hashtag('options-parameter-abcdef0');
});


// Test the 'use' extend system
test('a.state.use', function() {
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
    strictEqual(storedInitialState.id, 'init-state', 'Test id');
    strictEqual(storedInitialState._storm.hash, 'init-state', 'Test hash');
    strictEqual(a.isFunction(storedInitialState.preLoad), true,
                                                            'Test preLoad');
    strictEqual(a.isFunction(storedInitialState.postLoad), false,
                                                            'Test postLoad');

    // We test the duplicate element
    strictEqual(storedSubState.id, 'sub-state', 'Test id');
    strictEqual(storedSubState._storm.hash, 'init-state', 'Test hash');
    strictEqual(a.isFunction(storedSubState.preLoad), true, 'Test preLoad');
    strictEqual(a.isFunction(storedSubState.postLoad), true, 'Test postLoad');
});



// Test system allow bind/unbind event
asyncTest('a.state.load-bind', function() {
    // We create a binding
    // Test binding is working
    // Unload state
    // Test binding is not working
    expect(2);

    var state = {
        id:    'state-bind-unbind',
        hash:  'unittest-state-bind-unbind',
        entry: 'body',
        type:  'append',

        include: {
            html: 'resource/data/state/bind-unbind.html'
        },

        bind: {
            '#bind-unbind .first | click': function() {
                strictEqual(this.className, 'first', 'Test first click');
            },
            '#bind-unbind .second | click': function() {
                strictEqual(this.className, 'second', 'Test second click');
            }
        }
    };

    a.state.add(state);

    chain('unittest-state-bind-unbind', function() {
        // We test binding appear
        var first  = document.querySelector('#bind-unbind .first'),
            second = document.querySelector('#bind-unbind .second');

        // We start unit test
        first.click();
        second.click();

        hashtag('tmp_unittest-state-bind-unbind');
    }, 100);

    chain('tmp_unittest-state-bind-unbind', function() {
        // We test binding appear
        var first  = document.querySelector('#bind-unbind .first'),
            second = document.querySelector('#bind-unbind .second');

        // We start unit test (should do nothing as unbind raised on unload)
        first.click();
        second.click();

        hashtag('tmp_tmp_unittest-state-bind-unbind');
    }, 100);

    chain('tmp_tmp_unittest-state-bind-unbind', start, 100);

    hashtag('unittest-state-bind-unbind');
});




// Test system allow bind/unbind event ON the entry directly
asyncTest('a.state.load-bind-entry', function() {
    // We create a binding
    // Test binding is working
    // Unload state
    // Test binding is not working
    expect(1);

    var state = {
        id:    'state-bind-unbind-entry',
        hash:  'unittest-state-bind-unbind-entry',
        entry: '#a-state-direct-entry-bind',
        type:  'append',

        bind: {
            'click': function() {
                strictEqual(this.id, 'a-state-direct-entry-bind',
                                                        'Test id click');
            }
        }
    };

    a.state.add(state);

    chain('unittest-state-bind-unbind-entry', function() {
        // We test binding appear
        var entry = document.getElementById('a-state-direct-entry-bind');

        // We start unit test
        entry.click();

        hashtag('tmp_unittest-state-bind-unbind-entry');
    });

    chain('tmp_unittest-state-bind-unbind-entry', function() {
        // We test binding appear
        var entry = document.getElementById('a-state-direct-entry-bind');

        // We start unit test (should do nothing)
        entry.click();

        start();
    }, 100);

    hashtag('unittest-state-bind-unbind-entry');
});





// Test the async parameter
asyncTest('a.state.async-boolean', function() {
    expect(4);

    var asyncFalse = {
        id: 'a.state.async-false',
        hash: 'test-async-false',
        async: false,
        preLoad: function() {
            strictEqual(1, 1, 'Test async false');
        },
        postLoad: function() {
            strictEqual(1, 1, 'Test async false');
        }
    };

    var asyncTrue = {
        id: 'a.state.async-true',
        hash: 'test-async-true',
        async: true,
        preLoad: function(chain) {
            strictEqual(1, 1, 'Test async true');
            chain.next();
        },
        postLoad: function(chain) {
            strictEqual(1, 1, 'Test async true');
            chain.next();
        }
    };

    a.state.add([asyncTrue, asyncFalse]);

    chain('test-async-true', start, 100);

    chain('test-async-false', function() {
        hashtag('test-async-true');
    });

    hashtag('test-async-false');
});


// Test async on a single string
asyncTest('a.state.async-string', function() {
    expect(6);

    var asyncString1 = {
        id: 'a.state.async-str1',
        hash: 'test-async-str1',
        async: 'load',
        preLoad: function() {
            strictEqual(1, 1, 'Test async str');
        },
        load: function(chain) {
            strictEqual(1, 1, 'Test async str');
            chain.next();
        },
        postLoad: function() {
            strictEqual(1, 1, 'Test async str');
        }
    };

    var asyncString2 = {
        id: 'a.state.async-str2',
        hash: 'test-async-str2',
        async: 'postLoad',
        preLoad: function() {
            strictEqual(1, 1, 'Test async str');
        },
        load: function() {
            strictEqual(1, 1, 'Test async str');
        },
        postLoad: function(chain) {
            strictEqual(1, 1, 'Test async str');
            setTimeout(chain.next, 100);
        }
    };

    a.state.add([asyncString1, asyncString2]);

    chain('test-async-str2', start, 200);

    chain('test-async-str1', function() {
        hashtag('test-async-str2');
    });

    hashtag('test-async-str1');
});


asyncTest('a.state.async-array', function() {
    expect(6);

    var asyncArray1 = {
        id: 'a.state.async-arr1',
        hash: 'test-async-arr1',
        async: ['preLoad', 'load'],
        preLoad: function(chain) {
            strictEqual(1, 1, 'Test async array');
            chain.next();
        },
        load: function(chain) {
            strictEqual(1, 1, 'Test async array');
            chain.next();
        },
        postLoad: function() {
            strictEqual(1, 1, 'Test async array');
        }
    };

    var asyncArray2 = {
        id: 'a.state.async-arr2',
        hash: 'test-async-arr2',
        async: ['preLoad', 'postLoad'],
        preLoad: function(chain) {
            strictEqual(1, 1, 'Test async array');
            chain.next();
        },
        load: function() {
            strictEqual(1, 1, 'Test async array');
        },
        postLoad: function(chain) {
            strictEqual(1, 1, 'Test async array');
            setTimeout(chain.next, 100);
        }
    };

    a.state.add([asyncArray1, asyncArray2]);

    chain('test-async-arr2', start, 200);

    chain('test-async-arr1', function() {
        hashtag('test-async-arr2');
    });

    hashtag('test-async-arr1');
});


// Test how the state react regarding acl changes
asyncTest('a.state.acl-change', function() {
    expect(3);

    var state = {
        id: 'state-acl-change',
        hash: 'state-acl-chang{{el: [a-z]?}}',
        acl: {
            allowed: 'acl-change2'
        },
        preLoad: function() {
            strictEqual(1, 1, 'Acl has been updated as expected');
        }
    };

    a.acl.setCurrentRole('acl-change');
    a.state.add(state);

    // We test acl value
    strictEqual(state._storm.acl, false, 'Value is not ready');

    // Even if state can respond to bot state, only
    // the second will raise as the acl has been modified
    chain('state-acl-change', function() {
        a.acl.setCurrentRole('acl-change2');
        setTimeout(function() {
            strictEqual(state._storm.acl, true, 'Value has been updated');
        }, 100);
        setTimeout(function() {
            hashtag('state-acl-changz');
        }, 200);
       
    });

    chain('state-acl-changz', function() {
            a.acl.setCurrentRole('');
            start();
    }, 200);

    hashtag('state-acl-change');
});


// Setup a minimum role for acl
asyncTest('a.state.acl-minimum', function() {
    expect(1);

    var minimum = {
        id: 'acl-minimum-change',
        hash: 'a.state.acl-minimum{{el: [a-z]?}}',
        acl: {
            minimum: 'admin'
        },

        postLoad: function() {
            strictEqual(a.acl.getCurrentRole(), 'admin', 'ACL unit test');
        }
    };

    // State will be refused by default
    a.acl.setRoleList(['user', 'admin']);
    a.acl.setCurrentRole('user');

    // We add the state, the minimum will be performed
    a.state.add(minimum);

    chain('a.state.acl-minimuma', function() {
        a.acl.setCurrentRole('admin');
        setTimeout(function() {
            hashtag('a.state.acl-minimumb');
        }, 100);
    });

    chain('a.state.acl-minimumb', start, 100);

    hashtag('a.state.acl-minimuma');
});

// Define a maximum step
asyncTest('a.state.acl-maximum', function() {
    expect(1);

    var maximum = {
        id: 'acl-maximum-change',
        hash: 'a.state.acl-maximum{{el: [a-z]?}}',
        acl: {
            maximum: 'user'
        },

        postLoad: function() {
            strictEqual(a.acl.getCurrentRole(), 'user', 'ACL unit test');
        }
    };

    // State will be refused by default
    a.acl.setRoleList(['user', 'admin']);
    a.acl.setCurrentRole('user');

    // We add the state, the maximum will be performed
    a.state.add(maximum);

    chain('a.state.acl-maximuma', function() {
        a.acl.setCurrentRole('admin');
        setTimeout(function() {
            hashtag('a.state.acl-maximumb');
        }, 100);
    });

    chain('a.state.acl-maximumb', start, 100);

    hashtag('a.state.acl-maximuma');
});

// Any element is accepted, except the one defined in refused
asyncTest('a.state.acl-refused', function() {
    expect(2);

    var refused = {
        id: 'acl-refused-change',
        hash: 'a.state.acl-refused{{el: [a-z]?}}',
        acl: {
            refused: 'leader'
        },
        postLoad: function() {
            var role = a.acl.getCurrentRole();
            // Thoose two role are allowed
            if(role == 'user') {
                strictEqual(role, 'user', 'User passed');
            } else if(role == 'admin') {
                strictEqual(role, 'admin', 'Admin passed');
            } else {
                strictEqual(role, false, 'Leader SHOULD NOT pass');
            }
        }
    };

    a.acl.setRoleList(['user', 'leader', 'admin']);
    a.acl.setCurrentRole('user');

    // We add the state, the refused will not be performed
    a.state.add(refused);

    chain('a.state.acl-refuseda', function() {
        a.acl.setCurrentRole('leader');
        setTimeout(function() {
            hashtag('a.state.acl-refusedb');
        }, 100);
    });

    chain('a.state.acl-refusedb', function() {
        a.acl.setCurrentRole('admin');
        setTimeout(function() {
            hashtag('a.state.acl-refusedc');
        }, 100);
    });

    chain('a.state.acl-refusedc', start, 100);

    hashtag('a.state.acl-refuseda');
});