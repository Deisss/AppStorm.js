// Unit test for a.state (plugin)
// We separate from state because this one is too much important + heavy ...

// TODO: bootOnLoad => reactivate
// TODO: event for every state loaded has been deleted, maybe corret that ?

module('plugin/state.js');

// Start to check a single check hash change
test('a.state.hash-single-state', function() {
    stop();
    expect(2);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var main1 = {
        hash : "astatemanager1",
        load : function(chain) {
            se(1, 1, "Loading basic 1 succeed");
            chain.next();
        }
    };
    var main2 = {
        hash : "astatemanager2",
        load : function(chain) {
            se(1, 1, "Loading basic 2 succeed");
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    chain('astatemanager1', function() {
        hashtag('astatemanager2');
    });

    chain('astatemanager2', function() {
        window.location.href = "#";
        a.state.clear();
        st();
    }, 100);

    hashtag('astatemanager1');
});

// Test hashexists
test('a.state.hashExists', function() {
    a.state.clear();

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

    a.state.clear();
});

test('a.state.clear', function() {
    //TODO: do it
    ok(1==1);
});

test('a.state.get', function() {
    //TODO: do it
    ok(1==1);
});

test('a.state.remove', function() {
    //TODO: do it
    ok(1==1);
});










// State manager test
// Testing add to function : testing parent add, children add
test('a.state.add', function() {
    expect(10);
    a.state.clear();



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
    a.state.clear();
});

// Testing adding with bootOnLoad does quickly load content
/*test('a.state.add-bootOnLoad', function() {
    stop();
    // 3 : 3 files to load, if we have 4,
    // it means load was called (should not happend)
    expect(3);

    a.state.clear();

    var se = strictEqual,
        st = start;

    var child = {
        id : 'bootOnLoad',
        bootOnLoad : true,

        load : function(chain) {
            // Should not be raised at that time
            se(1, 1, 'The load function must not be called on bootOnLoad');
            chain.next();
        },

        include : {
            css :       'resource/data/state/bootOnLoad.css',
            js :        'resource/data/state/bootOnLoad.js',
            translate : 'resource/data/state/bootOnLoad.json',
            html :      'resource/data/state/bootOnLoad.html'
        }
    };

    // We add it, then check the loading process
    a.state.add(child, function() {
        // Here we use the cache trace, to check they were loaded as expected
        var trace = a.loader.trace();
        // We don't test html (not needed), got different behaviour
        var searched = ['bootOnLoad.css', 'bootOnLoad.js', 'bootOnLoad.json'];

        for(var i=0, l=searched.length; i<l; ++i) {
            se(a.contains(trace, 'resource/data/state/' + searched[i]), true,
                                        'Test file loaded : ' + searched[i]);
        }

        // Everything is done, we raise final start
        st();
    });

    a.state.clear();
});*/




// Test a load and unload, with a state in common (a parent)
test('a.state-path', function() {
    stop();
    // We expect 3 : one from parent1, and 2 from sub child, this is
    // because parent1 will be loaded only
    // at first time, because it is shared between main1, and main2 !
    expect(3);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        load : function(chain) {
            se(1, 1, 'Loading basic 1 succeed');
            chain.next();
        },
        children : [{
            hash : 'astatemanager3',
            load : function(chain) {
                se(1, 1, 'Loading basic 3 succeed');
                chain.next();
            }
        },{
            hash : 'astatemanager4',
            load : function(chain) {
                se(1, 1, 'Loading basic 4 succeed');
                chain.next();
            }
        }]
    };

    a.state.add(tree);


    chain('astatemanager3', function() {
        hashtag('astatemanager4');
    });

    chain('astatemanager4', function() {
        window.location.href = '#';
        a.state.clear();
        st();
    }, 100);

    hashtag('astatemanager3');
});




// Test full load chain process
test('a.state-load', function() {
    stop();
    // We expect the 6 : 3 from parent, 3 from children
    expect(6);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        preLoad : function(chain) {
            se(1, 1, 'Test preLoad parent');
            chain.next();
        },
        load : function(chain) {
            se(1, 1, 'Test load parent');
            chain.next();
        },
        postLoad : function(chain) {
            se(1, 1, 'Test postLoad parent');
            chain.next();
        },
        children : [{
            hash : 'astatemanager5',
            preLoad : function(chain) {
                se(1, 1, 'Test preLoad child');
                chain.next();
            },
            load : function(chain) {
                se(1, 1, 'Test load child');
                chain.next();
            },
            postLoad : function(chain) {
                se(1, 1, 'Test postLoad child');
                chain.next();
            },
        }]
    };

    a.state.add(tree);

    chain('astatemanager5', function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 100);

    hashtag('astatemanager5');
});




// Test full unload chain process
test('a.state-unload', function() {
    stop();
    // We expect the 6 : 3 from parent, 3 from children
    expect(6);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        preUnload : function(chain) {
            se(1, 1, 'Test preUnload parent');
            chain.next();
        },
        unload : function(chain) {
            se(1, 1, 'Test unload parent');
            chain.next();
        },
        postUnload : function(chain) {
            se(1, 1, 'Test postUnload parent');
            chain.next();
        },
        children : [{
            hash : 'astatemanager6',
            preUnload : function(chain) {
                se(1, 1, 'Test preUnload child');
                chain.next();
            },
            unload : function(chain) {
                se(1, 1, 'Test unload child');
                chain.next();
            },
            postUnload : function(chain) {
                se(1, 1, 'Test postUnload child');
                chain.next();
            },
        }]
    };

    a.state.add(tree);

    chain('astatemanager6', function() {
        hashtag('tmp_statemanager6');
    });

    chain('tmp_statemanager6', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('astatemanager6');
});



// Testing both some load, and some unload
test('a.state-load-unload', function() {
    stop();
    // We expect the 7 : 2 from parent at load, 2 from children at load,
    // 3 from parent and children on unload
    expect(7);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        hash : 'astatemanager7',
        preLoad : function(chain) {
            se(1, 1, 'Test preLoad parent');
            chain.next();
        },
        load : function(chain) {
            se(1, 1, 'Test load parent');
            chain.next();
        },
        preUnload : function(chain) {
            se(1, 1, 'Test preUnload parent');
            chain.next();
        },
        postUnload : function(chain) {
            se(1, 1, 'Test postUnload parent');
            chain.next();
        },
        children : [{
            hash : 'astatemanager8',
            preLoad : function(chain) {
                se(1, 1, 'Test preLoad child');
                chain.next();
            },
            load : function(chain) {
                se(1, 1, 'Test load child');
                chain.next();
            },
            postUnload : function(chain) {
                se(1, 1, 'Test postUnload child');
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

    chain('tmp_statemanager8', function() {
        hashtag('');
        a.state.clear();
        st();
    }, 100);

    hashtag('astatemanager7');
});



// Test hashtag not fired if state is not linked to this hashtag
test('a.state-notfired', function() {
    stop();
    expect(1);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var main1 = {
        hash : 'astatemanager9',
        load : function(chain) {
            se(1, 1, 'Test load, main1');
            chain.next();
        }
    };

    var main2 = {
        hash : 'astatemanager10',
        load : function(chain) {
            se(1, 1, 'Test load, main2');
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    chain('astatemanager9', function() {
        hashtag('tmp_astatemanager9');
    }, 100);

    chain('tmp_astatemanager9', function() {
        hashtag('');
        a.state.clear();
        st();
    }, 100);

    hashtag('astatemanager9');
});



// TODO : be able to test translate, css, and html loaded
// Test loading HTML, CSS, JS, and translate
test('a.state-loader', function() {
    stop();
    // Many test are done to check everything was loaded as expected
    expect(7);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var main = {
        hash : 'astatemanager12',

        include : {
            css :       './resource/data/state/test.css',
            html :      './resource/data/state/test.html',
            js :        './resource/data/state/test.js',
            translate : './resource/data/state/translate.json'
        },
        postLoad : function(chain) {
            // Testing JS files has been loaded (the function included inside
            // Js file exist in page
            se(typeof(unittest_state_js), 'function',
                    'Test JS file has been loaded');

            // Testing language translate
            var tr1 = a.language.getTranslation('unittest-state1'),
                tr2 = a.language.getTranslation('unittest-state2');

            se(tr1['hello'], 'nope', 'Test translate');
            se(tr1['second'], 'nope2', 'Test translate');
            se(tr2['hello'], 'word', 'Test translate');
            se(tr2['second'], 'hy', 'Test translate');

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
            se(height, '20px', 'Test CSS applies correctly');

            // Test HTML (test mustache got the file loaded)
            var uriHTML = './resource/data/state/test.html';
            var hash = 'a_tmpl_' + uriHTML.replace(/[^a-zA-Z0-9]/g, '_');
            se(typeof(a.template._tmpl[hash]), 'string',
                'Test the template has been registred as available template');
            chain.next();
        }
    }

    a.state.add(main);

    chain('astatemanager12', function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 100);

    hashtag('astatemanager12');
});


// Test loading multiple data and send that to html as expected
test('a.state-multiData', function() {
    stop();
    expect(7);

    a.state.clear();

    var se = strictEqual,
        st = start;

    var tree = {
        hash : 'astatemanager13',

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

            se(user1.innerHTML.toLowerCase(), 'george', 'Test first user');
            se(user2.innerHTML.toLowerCase(), 'christophe', 
                                                        'Test second user');

            // ProjectList test
            var project1 = document
                        .getElementById('multidata-projectlist202-result');
            var project2 = document
                        .getElementById('multidata-projectlist300-result');

            se(project1.innerHTML.toLowerCase(), 'project 1',
                                                    'Test first project');
            se(project2.innerHTML.toLowerCase(), 'superb project',
                                                    'Test second project');

            // Testing object loading
            var myself1 = document
                        .getElementById('multidata-myself-id-result');
            se(myself1.innerHTML.toLowerCase(), '30', 'Test user id');

            var myself2 = document
                        .getElementById('multidata-myself-firstname-result');
            se(myself2.innerHTML.toLowerCase(), 'js', 'Test user firstname');

            var myself3 = document
                        .getElementById('multidata-myself-lastname-result');
            se(myself3.innerHTML.toLowerCase(), 'appstorm',
                                                    'Test user lastname');

            chain.next();
        }
    };

    a.state.add(tree);

    chain('astatemanager13', function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 100);

    hashtag('astatemanager13');
});




// Test event begin and end before and after loading a state
test('a.state.begin-end', function() {
    stop();
    expect(2);
    a.state.clear();

    var se = strictEqual,
        st = start;

    a.message.bind('a.state.begin', function(data) {
        se(data.value, 'astatemanager14', 'Test message begin');
    });
    a.message.bind('a.state.end', function(data) {
        se(data.value, 'astatemanager14', 'Test message end');
    });

    chain('astatemanager14', function() {
        a.message.clear();
        a.state.clear();
        window.location.href = '#';
        st();
    }, 100);

    hashtag('astatemanager14');
});




// Test to send parameter into html loading
test('a.state.html-parameter', function() {
    stop();
    expect(1);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var htmlParameter = {
        id : 'html-parameter',
        hash : 'html-parameter-{{param : [a-z]+}}',
        entry: 'body',
        type:  'append',

        include : {
            html : 'resource/data/state/html-parameter-{{param}}.html'
        },

        // On load function, we will catch html parsed from Mustache,
        // and check content
        load : function(chain) {
            var loaded = document.getElementById('html-parameter-loaded');
            se(loaded.innerHTML.toLowerCase(), 'ok',
                                'Test loading html with parameters');
            chain.next();
        }
    };

    a.state.add(htmlParameter);

    chain('html-parameter-ok', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('html-parameter-ok');
});



// Test adding parameter inside data url
test('a.state.data-parameter', function() {
    stop();
    expect(1);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var htmlParameter = {
        id : 'data-parameter',
        hash : 'data-parameter-{{param : [a-z]+}}',

        data : 'resource/data/state/data-parameter-{{param}}.json',

        converter : function(data) {
            se(data.ok, 'ok', 'Test loading data with parameters');
        }
    };

    a.state.add(htmlParameter);

    chain('data-parameter-ok', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('data-parameter-ok');
});




// Test converter function behaviour on no data loaded
test('a.state.data-converter-nodata', function() {
    stop();
    expect(1);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var test = {
        id : 'data-converter-nodata',
        hash : 'data-converter-nodata',
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
            se(loaded.innerHTML.toLowerCase(), 'converted',
                                            'Test loading data converter');
            chain.next();
        }
    };

    a.state.add(test);

    chain('data-converter-nodata', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('data-converter-nodata');
});



// Test converter function behaviour with loaded data
test('a.state.data-converter-append', function() {
    stop();
    expect(2);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var test = {
        id : 'data-converter-append',
        hash : 'data-converter-append',
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
            se(loaded.innerHTML.toLowerCase(), 'converted',
                                            'Test loading data converter');
            var second = document
                    .getElementById('data-converter-append-another-loaded');
            se(second.innerHTML.toLowerCase(), 'chain',
                                        'Test append loading data converter');
            chain.next();
        }
    };

    a.state.add(test);

    chain('data-converter-append', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('data-converter-append');
});



// Test binding parameters to data
test('a.state.data-cross-parameter', function() {
    stop();
    expect(4);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var test = {
        id:    'data-cross-parameter',
        hash:  'data-cross-parameter-{{id: [0-9]+}}-{{parent: [a-zA-Z0-9]+}}',
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
            se(id.innerHTML, '9860', 'Test data cross parameter');

            var parent = document
                        .getElementById('data-cross-parameter-parent');
            se(parent.innerHTML, 'dataParent01',
                                                'Test data cross parameter');

            var memComplexA = document
                    .getElementById('data-cross-parameter-mem-complex-a');
            se(memComplexA.innerHTML, 'b', 'Test data cross parameter');

            var memComplexC = document
                    .getElementById('data-cross-parameter-mem-complex-c');
            se(memComplexC.innerHTML, 'd', 'Test data cross parameter');

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

    chain('data-cross-parameter-9860-dataParent01', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('data-cross-parameter-9860-dataParent01');
});



// Test title with hashtag parameters
test('a.state.title', function() {
    stop();
    expect(1);
    a.state.clear();

    var previous = document.title;

    var se = strictEqual,
        st = start;

    var test = {
        id : 'test-title',
        hash : 'test-title-{{parent : [a-zA-Z0-9]+}}',
        title : 'test loading - {{parent}}'
    };

    a.state.add(test);

    chain('test-title-oktitle', function() {
        se(document.title, 'test loading - oktitle', 'test title parameter');
        a.state.clear();
        hashtag('');
        document.title = previous;
        st();
    }, 100);

    hashtag('test-title-oktitle');
});


// Two hashtag : one in the parent, one in the children
// Only the children is correctly parsed (speed gain)
test('a.state.underhash', function() {
    stop();
    expect(2);
    a.state.clear();

    var st = start,
        se = strictEqual;

    var tree = {
        id : 'root',
        hash : 'root-{{user : [a-fA-F0-9]+}}',
        data : {
            id : '{{user}}'
        },
        converter : function(data) {
            se(data.id, '{{user}}', 'Test user is not parsed tag');
        },
        children : {
            id : 'sub',
            hash : 'welcome-{{user : [a-fA-F0-9]+}}',
            data : {
                id : '{{user}}'
            },
            converter : function(data) {
                se(data.id, 'aaaa', 'Test user is parsed into child');
            }
        }
    };

    a.state.add(tree);

    chain('welcome-aaaa', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

    hashtag('welcome-aaaa');
});


// Test options url
test('a.state.options-parameter', function() {
    stop();
    expect(1);
    a.state.clear();

    var st = start,
        se = strictEqual;

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
            se(data.user, 'abcdef0', 'Test content transmitted threw system');
        }
    };

    a.state.add(tree);

    chain('options-parameter-abcdef0', function() {
        a.state.clear();
        hashtag('');
        st();
    }, 100);

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
test('a.state.load-bind', function() {
    // We create a binding
    // Test binding is working
    // Unload state
    // Test binding is not working
    stop();
    expect(2);
    a.state.clear();

    var st = start,
        se = strictEqual;

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
                se(this.className, 'first', 'Test first click');
            },
            '#bind-unbind .second | click': function() {
                se(this.className, 'second', 'Test second click');
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

    chain('tmp_tmp_unittest-state-bind-unbind', function() {
        st();
        a.state.clear();
        hashtag('');
    }, 100);

    hashtag('unittest-state-bind-unbind');
});




// Test system allow bind/unbind event ON the entry directly
test('a.state.load-bind-entry', function() {
    // We create a binding
    // Test binding is working
    // Unload state
    // Test binding is not working
    stop();
    expect(1);
    a.state.clear();

    var st = start,
        se = strictEqual;

    var state = {
        id:    'state-bind-unbind-entry',
        hash:  'unittest-state-bind-unbind-entry',
        entry: '#a-state-direct-entry-bind',
        type:  'append',

        bind: {
            'click': function() {
                se(this.id, 'a-state-direct-entry-bind', 'Test id click');
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

        hashtag('');
        a.state.clear();
        st();
    }, 100);

    hashtag('unittest-state-bind-unbind-entry');
});