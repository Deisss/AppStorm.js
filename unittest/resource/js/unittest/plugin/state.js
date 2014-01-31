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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = "#astatemanager1";
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = "#astatemanager2";
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        window.location.href = "#";
        a.state.clear();
        st();
    }, 1000);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager3';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#astatemanager4';
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        window.location.href = '#';
        a.state.clear();
        st();
    }, 1000);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager5';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager6';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#';
    }, 600);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        st();
    }, 1000);
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
            se(1, 1, 'Test load, parent');
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager7';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#astatemanager8';
    }, 600);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#';
    }, 1000);

    setTimeout(function() {
        a.state.clear();
        st();
    }, 1400);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager9';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#';
    }, 600);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        st();
    }, 1000);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager12';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

        data : {
            userList : 'resource/data/state/multidata-1.json',
            projectList : 'resource/data/state/multidata-2.json',
            myself : 'resource/data/state/multidata-3.json'
        },

        include : {
            html : 'resource/data/state/multidata.html'
        },

        // On load function, we will catch html parsed from Mustache, and check content
        load : function(html) {
            document.body.innerHTML += html;

            // UserList test
            var user1 = document.getElementById('multidata-userlist4-chain');
            var user2 = document.getElementById('multidata-userlist5-chain');

            se(user1.innerHTML.toLowerCase(), 'george', 'Test first user');
            se(user2.innerHTML.toLowerCase(), 'christophe', 'Test second user');

            // ProjectList test
            var project1 = document.getElementById('multidata-projectlist202-chain');
            var project2 = document.getElementById('multidata-projectlist300-chain');

            se(project1.innerHTML.toLowerCase(), 'project 1', 'Test first project');
            se(project2.innerHTML.toLowerCase(), 'superb project', 'Test second project');

            // Testing object loading
            var myself1 = document.getElementById('multidata-myself-id-chain');
            se(myself1.innerHTML.toLowerCase(), '30', 'Test user id');

            var myself2 = document.getElementById('multidata-myself-firstname-chain');
            se(myself2.innerHTML.toLowerCase(), 'js', 'Test user firstname');

            var myself3 = document.getElementById('multidata-myself-lastname-chain');
            se(myself3.innerHTML.toLowerCase(), 'appstorm', 'Test user lastname');
        }
    };

    a.state.add(tree);

    // Now we load the part, and check chain html
    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager13';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now we load the part, and check chain html
    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#astatemanager14';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.message.clear();
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#html-parameter-ok';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#data-parameter-ok';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#data-converter-nodata';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#data-converter-append';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
});



// Test binding parameters to data
test('a.state.data-cross-parameter', function() {
    stop();
    expect(8);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var test = {
        id : 'data-cross-parameter',
        hash : 'data-cross-parameter-{{id : [0-9]+}}-{{parent : [a-zA-Z0-9]+}}',

        // Binding parameter from hashtag
        data : {
            id : '{{id}}',
            something : '{{parent}}',
            mem : '{{memory : cross-parameter}}',
            memComplex : '{{memory : cross-parameter-complex}}'
        },

        include : {
            html : 'resource/data/state/data-cross-parameter.html'
        },

        // Test content has been loaded with parameter modification
        load : function(html) {
            document.body.innerHTML += html;
            var id = document.getElementById('data-cross-parameter-id');
            se(id.innerHTML, '9860', 'Test data cross parameter');

            var appstormID = document.getElementById('data-cross-parameter-id-appstorm');
            se(appstormID.innerHTML, '9860', 'Test data cross parameter threw appstorm');

            var parent = document.getElementById('data-cross-parameter-parent');
            se(parent.innerHTML, 'dataParent01', 'Test data cross parameter');

            var parentID = document.getElementById('data-cross-parameter-parent-appstorm');
            se(parentID.innerHTML, 'dataParent01', 'Test data cross parameter threw appstorm');

            var mem = document.getElementById('data-cross-parameter-mem-appstorm');
            se(mem.innerHTML, 'plopu', 'Test data cross parameter');

            var memID = document.getElementById('data-cross-parameter-mem-appstorm');
            se(memID.innerHTML, 'plopu', 'Test data cross parameter threw appstorm');

            var memComplexA = document.getElementById('data-cross-parameter-mem-complex-a');
            se(memComplexA.innerHTML, 'b', 'Test data cross parameter');

            var memComplexC = document.getElementById('data-cross-parameter-mem-complex-c');
            se(memComplexC.innerHTML, 'd', 'Test data cross parameter');
        }
    };

    a.storage.memory.setItem('cross-parameter', 'plopu');
    a.storage.memory.setItem('cross-parameter-complex', {
        a : 'b',
        c : 'd'
    });

    a.state.add(test);

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#data-cross-parameter-9860-dataParent01';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
});



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
            se(data.resource.indexOf('resource/data/notexist.json'), 0, 'Test data resource error');
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
            se(data.resource.indexOf('resource/data/notexist.html'), 0, 'Test html resource error');
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
                se(resource.substring(0, 13), 'someunknowurl', 'Test resourced handled');
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
        // Prevent a wrong catch bug, and does not make test unreliable (as it will raise 0 event if nothing is found, stopping system)
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#test-title-oktitle';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        se(document.title, 'test loading - oktitle', 'test title parameter');
        a.state.clear();
        window.location.href = '#';
        document.title = previous;
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#welcome-aaaa';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
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

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = '#options-parameter-abcdef0';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        a.state.clear();
        window.location.href = '#';
        st();
    }, 600);
});