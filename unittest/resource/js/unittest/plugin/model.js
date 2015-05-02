// Unit test for a.model (plugin)

QUnit.module('plugin/model.js', {
    setup: function() {
        a.model.manager.clear();
        a.model.pooler.clear();
    },
    teardown: function() {
        a.model.manager.clear();
        a.model.pooler.clear();
    }
});

// Test nullable properties
QUnit.test('a.model.property-nullable', function (assert) {
    assert.expect(2);

    var unittest = a.model('unittest-nullable', {
        testnullable: {
            nullable: true,
            init: 'ok'
        },
        testnotnullable: {
            nullable: false,
            init: 'ok'
        }
    });
    var unit = new unittest();

    // Test changing data for null
    unit.set('testnullable', null);
    unit.set('testnotnullable', null);

    assert.strictEqual(unit.get('testnullable'), null, 'Test nullable');
    assert.strictEqual(unit.get('testnotnullable'), 'ok', 'Test not nullable');
});

// Test init properties
QUnit.test('a.model.property-init', function (assert) {
    assert.expect(3);

    var unittest = a.model('unittest-prop-init', {
        testinit: {
            init: 'ok'
        }
    });

    var unit = new unittest();

    // Test changing data
    assert.strictEqual(unit.get('testinit'), 'ok', 'Test init');

    unit.set('testinit', 'something');
    assert.strictEqual(unit.get('testinit'), 'something', 'Test erase init');

    unit.init();

    assert.strictEqual(unit.get('testinit'), 'ok', 'Test clear init');
});


// Test property needed
QUnit.test('a.model.property-needed', function (assert) {
    assert.expect(2);

    var unittest = a.model('unittest-needed', {
        need: {
            needed: true,
            init: 'ok'
        },
        notneeded: {
            needed: false,
            init: 'ok'
        }
    });

    var unit = new unittest();

    unit.takeSnapshot();
    var snapshot = unit.differenceSnapshot(true);

    // Test outputted value
    assert.strictEqual(snapshot.needed, undefined);
    assert.strictEqual(snapshot.need, 'ok');
});

// Test property check
QUnit.test('a.model.property-check', function (assert) {
    assert.expect(3);

    var unittest = a.model('unittest-check', {
        testcheck: {
            init: 'ok',
            check: 'String'
        }
    });

    var unit = new unittest();

    assert.strictEqual(unit.get('testcheck'), 'ok', 'Test init value');

    unit.set('testcheck', 'get');
    assert.strictEqual(unit.get('testcheck'), 'get', 'Test second value');

    unit.get('testcheck', 12);
    assert.strictEqual(unit.get('testcheck'), 'get', 'Test thrid value not setted');
});

// Test property check, for a model (a model include a model)
QUnit.test('a.model.property-check-model', function (assert) {
    assert.expect(1);

    var child = a.model('unittest-check-child', {
        test: {
            init: 'ok',
            check: 'String',
            validate: function(value) {
                assert.strictEqual(value, 'piou');
            }
        }
    });

    var parent = a.model('unittest-check-parent', {
        sub: {
            check: 'unittest-check-child'
        }
    });

    // We create a new parent, and check validation is raised on child
    // element
    var c = new parent(),
        d = new child();

    c.set('sub', d);

    // Set element raise the validate method
    c.get('sub').set('test', 'piou');
});

// Test property check, for a list of values
QUnit.test('a.model.property-check-array', function (assert) {
    assert.expect(6);

    var unittest = a.model('unittest-check-array', {
        testcheck: {
            init: 'ok',
            check: ['a', 'yeah', 'okay']
        }
    });

    var unit = new unittest();

    assert.strictEqual(unit.get('testcheck'), 'ok', 'Test init value');

    unit.set('testcheck', 'get');
    assert.strictEqual(unit.get('testcheck'), 'ok', 'Test still init value');

    unit.set('testcheck', 'yeah');
    assert.strictEqual(unit.get('testcheck'), 'yeah', 'Test second value');

    unit.set('testcheck', 'a');
    assert.strictEqual(unit.get('testcheck'), 'a', 'Test thrid value');

    unit.set('testcheck', 'yup');
    assert.strictEqual(unit.get('testcheck'), 'a', 'Test still thrid value');

    unit.set('testcheck', 'okay');
    assert.strictEqual(unit.get('testcheck'), 'okay', 'Test fourth value');
});

// Test property check, for a list of values
QUnit.test('a.model.property-check-object', function (assert) {
    assert.expect(6);

    var unittest = a.model('unittest-check-object', {
        testcheck: {
            init: 'ok',
            check: {
                'a': 'something great',
                'yeah': 'another',
                'okay': 'still good'
            }
        }
    });

    var unit = new unittest();

    assert.strictEqual(unit.get('testcheck'), 'ok', 'Test init value');

    unit.set('testcheck', 'get');
    assert.strictEqual(unit.get('testcheck'), 'ok', 'Test still init value');

    unit.set('testcheck', 'yeah');
    assert.strictEqual(unit.get('testcheck'), 'yeah', 'Test second value');

    unit.set('testcheck', 'a');
    assert.strictEqual(unit.get('testcheck'), 'a', 'Test thrid value');

    unit.set('testcheck', 'yup');
    assert.strictEqual(unit.get('testcheck'), 'a', 'Test still thrid value');

    unit.set('testcheck', 'okay');
    assert.strictEqual(unit.get('testcheck'), 'okay', 'Test fourth value');
});

// Test property validate
QUnit.test('a.model.property-validate', function (assert) {
    assert.expect(3);

    var unittest = a.model('unittest-validate', {
        testvalidate: {
            init: 'ok',
            validate: function(value, old) {
                if(value == 'something') {
                    return true;
                }
            }
        }
    });

    var unit = new unittest();

    assert.strictEqual(unit.get('testvalidate'), 'ok', 'Test init value');

    unit.set('testvalidate', 'another');
    assert.strictEqual(unit.get('testvalidate'), 'ok', 'Test still init value');

    unit.set('testvalidate', 'something');
    assert.strictEqual(unit.get('testvalidate'), 'something', 'Test accepted');
});

// Test property pattern
QUnit.test('a.model.property-pattern', function (assert) {
    assert.expect(4);

    var test = a.model('unittest-pattern', {
        name: {
            init: 'hello',
            check: 'string',
            pattern: '^[a-zA-Z0-9]+$'
        }
    });
    
    var instance = new test();

    assert.strictEqual(instance.get('name'), 'hello');

    instance.set('name', '__');
    // Refused by pattern
    assert.strictEqual(instance.get('name'), 'hello');

    instance.set('name', 'abcd09');
    // Allowed by pattern
    assert.strictEqual(instance.get('name'), 'abcd09');

    instance.set('name', 'abcd09-');
    // Refused by pattern
    assert.strictEqual(instance.get('name'), 'abcd09');
});

// Test property transform
QUnit.test('a.model.property-transform', function (assert) {
    assert.expect(3);

    var unittest = a.model('unittest-transform', {
        testtransform: {
            init: 'ok',
            transform: function piou(value, old) {
                return '' + old + value;
            }
        }
    });

    var unit = new unittest();

    assert.strictEqual(unit.get('testtransform'), 'ok', 'Test init value');

    unit.set('testtransform', 'something');
    assert.strictEqual(unit.get('testtransform'), 'oksomething', 'Test concat');

    unit.set('testtransform', 'another');
    assert.strictEqual(unit.get('testtransform'), 'oksomethinganother', 'Second');
});

// Test property event
QUnit.asyncTest('a.model.property-event', function (assert) {
    assert.expect(2);

    var unittest = a.model('unittest-event', {
        evt: {
            init: 'another',
            event: 'super'
        }
    });

    var unit = new unittest();

    function eventMatcher(data) {
        if(data.value == 'something') {
            assert.strictEqual(data.value, 'something', 'Test something value');
        } else {
            assert.strictEqual(data.value, 'ok', 'Test ok value');
            QUnit.start();
        }
    };

    unit.bind('super', eventMatcher);

    unit.set('evt', 'something');

    setTimeout(function() {
        unit.set('evt', 'ok');
    }, 150);
});

// Test property apply
QUnit.asyncTest('a.model.property-apply', function (assert) {
    assert.expect(1);

    var unittest = a.model('unittest-apply', {
        app: {
            init: 'another',
            apply: function(value, old) {
                assert.strictEqual(value, 'ok');
                QUnit.start();
            }
        }
    });

    var unit = new unittest();

    unit.set('app', 'ok');
});




// Test list function
QUnit.test('a.model.list', function (assert) {
    assert.expect(1);

    var unittest = a.model('unittest-list', {
        A: {
            init: 'ok'
        },
        B: {
            init: 'something'
        }
    });

    var unit = new unittest();
    var list = unit.list();

    assert.strictEqual(list.join(','), 'A,B');
});

// Test has function
QUnit.test('a.model.has', function (assert) {
    assert.expect(3);

    var unittest = a.model('unittest-has', {
        A: {
            init: 'ok'
        },
        B: {
            init: 'something'
        }
    });

    var unit = new unittest();

    assert.strictEqual(unit.has('A'), true);
    assert.strictEqual(unit.has('B'), true);
    assert.strictEqual(unit.has('C'), false);
});

// Test primary function
QUnit.test('a.model.primary', function (assert) {
    assert.expect(3);

    a.model('unittest-primary', {
        id: {
            primary: true,
            nullable: true
        },
        name: {
            primary: true,
            nullable: true
        },
        text: {
            nullable: true
        }
    });

    var primaries = a.model.pooler.getPrimary('unittest-primary');

    assert.strictEqual(primaries.length, 2, 'Test total length');
    assert.strictEqual(primaries[0], 'id', 'Test id field');
    assert.strictEqual(primaries[1], 'name', 'Test name field');
});

// Test init function
QUnit.test('a.model.init', function (assert) {
    assert.expect(9);

    var unittest = a.model('unittest-init', {
        testA: {
            init: 'ok'
        },
        testB: {
            init: 'something'
        },
        testC: {
            // Value will be erased on first loading
            value: 'notok'
        }
    });

    var unit = new unittest();

    // First init
    assert.strictEqual(unit.get('testA'), 'ok', 'Test init1');
    assert.strictEqual(unit.get('testB'), 'something', 'Test init2');
    assert.strictEqual(unit.get('testC'), null, 'Test init3');

    // Change init
    unit.set('testA', 'another');
    unit.set('testB', 'stuff');
    unit.set('testC', 'great');

    assert.strictEqual(unit.get('testA'), 'another', 'Test change init1');
    assert.strictEqual(unit.get('testB'), 'stuff', 'Test change init2');
    assert.strictEqual(unit.get('testC'), 'great', 'Test change init3');

    // Rollback init
    unit.init();

    // Second init
    assert.strictEqual(unit.get('testA'), 'ok', 'Test rollback init1');
    assert.strictEqual(unit.get('testB'), 'something', 'Test rollback init2');
    assert.strictEqual(unit.get('testC'), null, 'Test rollback init3');
});

// Test jsons function
QUnit.test('a.model.json', function (assert) {
    assert.expect(2);

    var unittest = a.model('unittest-json', {
        testA: {
            init: 'something'
        },
        testB: {
            init: 'great'
        }
    });

    var unit = new unittest();
    unit.set('testA', 'another');
    var json = unit.toJSON();

    assert.strictEqual(json, '{"testA":"another","testB":"great"}', 'Test JSON');

    var second = new unittest();
    second.fromJSON(json);

    var alternative = second.toJSON();

    assert.strictEqual(alternative, '{"testA":"another","testB":"great"}', 'Test second');
});

// Test Object output
QUnit.test('a.model.object', function (assert) {
    assert.expect(4);

    var unittest = a.model('unittest-object', {
        testA: {
            init: 'something'
        },
        testB: {
            init: 'great'
        }
    });

    var unit = new unittest();
    unit.set('testA', 'another');
    var obj1 = unit.toObject();


    assert.strictEqual(obj1.testA, 'another', 'Test first Object');
    assert.strictEqual(obj1.testB, 'great', 'Test first Object');

    var second = new unittest();
    second.fromObject(obj1);

    var obj2 = second.toObject();

    assert.strictEqual(obj2.testA, 'another', 'Test second Object');
    assert.strictEqual(obj2.testB, 'great', 'Test second Object');
});

// Test model clone
QUnit.test('a.model.clone', function (assert) {
    assert.expect(6);

    var unittest = a.model('unittest-clone', {
        za: {
            init: 'ok'
        },
        bigObject: {
            init: {
                'hello': 'yeah'
            }
        }
    });

    var test1 = new unittest(),
        test2 = test1.clone();

    test2.get('bigObject').hello = 'something';

    assert.strictEqual(test1.get('za'), test2.get('za'));
    assert.strictEqual(test1.get('za'), 'ok');
    test2.set('za', 'you');
    assert.strictEqual(test1.get('za'), 'ok');
    assert.strictEqual(test2.get('za'), 'you');
    assert.strictEqual(test1.get('bigObject').hello, 'yeah');
    assert.strictEqual(test2.get('bigObject').hello, 'something');
});

// Test snapshot function
QUnit.test('a.model.snapshot', function (assert) {
    assert.expect(2);

    var unittest = a.model('unittest-snapshot', {
        snap: {
            needed: true,
            init: 'ok'
        },
        nosnap: {
            init: 'notok'
        },
        so: {
            init: 'something'
        }
    });

    var unit = new unittest();
    // Taking snapshot
    unit.takeSnapshot();

    var firstSimpleSnapshot  = a.parser.json.stringify(
                    unit.differenceSnapshot(true)
        ),
        firstComplexSnapshot = a.parser.json.stringify(
                    unit.differenceSnapshot(false)
        );

    assert.strictEqual(firstSimpleSnapshot, '{"snap":"ok"}');
    assert.strictEqual(firstComplexSnapshot, '{"snap":{"value":"ok","old":"ok"}}')
});

// Test model manager
QUnit.test('a.model.manager', function (assert) {
    assert.expect(7);

    var model = a.model('model.managertest', {}, null);

    var instance1 = new model(),
        instance2 = new model();

    var storedInstance1 = a.model.manager.get(instance1.uid),
        storedInstance2 = a.model.manager.get(instance2.uid);

    assert.strictEqual(storedInstance1.uid, instance1.uid);
    assert.strictEqual(storedInstance2.uid, instance2.uid);

    var list = a.model.manager.getByName('model.managertest');

    // We test the list element before removing everything inside
    strictEqual(list.length, 2);
    if(list[0].uid == instance1.uid) {
        assert.strictEqual(list[0].uid, instance1.uid);
        assert.strictEqual(list[1].uid, instance2.uid);
    } else {
        assert.strictEqual(list[1].uid, instance1.uid);
        assert.strictEqual(list[0].uid, instance2.uid);
    }

    a.model.manager.remove(storedInstance1.uid);
    assert.strictEqual(a.model.manager.get(instance1.uid), null);
    assert.strictEqual(a.model.manager.get(instance2.uid).uid, instance2.uid);

    a.model.manager.remove(storedInstance2.uid);
});


// Unit test multiple model management
QUnit.asyncTest('a.model.model-multiple', function (assert) {
    assert.expect(4);

    var unittest = a.model('unittest-multiple', {
        id: {
            init: 0,
            event: 'yatta'
        }
    });

    var unittest1 = new unittest(),
        unittest2 = new unittest();

    unittest1.bind('yatta', function(data) {
        assert.strictEqual(data.value, 5, 'Testing data update 1');
        assert.strictEqual(unittest1.get('id'), 5, 'Testing model update 1');
    });
    unittest2.bind('yatta', function(data) {
        assert.strictEqual(data.value, 6, 'Testing data update 2');
        assert.strictEqual(unittest2.get('id'), 6, 'Testing model update 2');
        QUnit.start();
    });

    unittest1.set('id', 5);
    unittest2.set('id', 6);
});


// Test model.manager searchInstance function
QUnit.test('a.model.searchInstance', function (assert) {
    assert.expect(2);

    var unittest = a.model('unittest-searchInstance', {
        id: {
            check: 'number'
        },
        name: {
            init: 'piou'
        },
        val: {
            init: 5
        }
    });

    var test1 = new unittest(),
        test2 = new unittest();

    test1.set('id', 3);
    test1.set('name', 'ok');

    test2.set('id', 20);
    test2.set('val', 12);
    test2.set('name', 'something');

    var getTest1 = a.model({
            model: 'unittest-searchInstance',
            name: 'ok'
        }),
        getTest2 = a.model({
            model: 'unittest-searchInstance',
            name: 'something',
            val: 12
        });

    assert.strictEqual(getTest1[0].get('id'), 3);
    assert.strictEqual(getTest2[0].get('id'), 20);
});


// Test search instance in a more complex element
QUnit.test('a.model.searchInstance-no-name', function (assert) {
    assert.expect(7);

    var unittest = a.model('unittest-searchInstance-no-name', {
        id: {
            check: 'number'
        }
    });
    var unittest2 = a.model('unittest-searchInstance-no-name2', {
        id: {
            check: 'number'
        }
    });

    var test1 = new unittest(),
        test2 = new unittest(),
        test3 = new unittest2(),
        test4 = new unittest2();

    test1.set('id', 2);
    test3.set('id', 2);
    test2.set('id', 3);
    test4.set('id', 4);

    var getTest1 = a.model({id: 2}),
        getTest2 = a.model({id: 3});

    assert.strictEqual(getTest2[0].modelName,
                                    'unittest-searchInstance-no-name');
    assert.strictEqual(getTest2[0].uid, test2.uid);
    assert.strictEqual(getTest1.length, 2);
    assert.strictEqual(getTest1[0].uid, test1.uid);
    assert.strictEqual(getTest1[0].modelName,
                                    'unittest-searchInstance-no-name');
    assert.strictEqual(getTest1[1].uid, test3.uid);
    assert.strictEqual(getTest1[1].modelName,
                                    'unittest-searchInstance-no-name2');
});


QUnit.test('a.model.validate', function (assert) {
    assert.expect(3);

    var unittest = a.model('unittest-validate', {
        id: {
            validate: function(value, old) {
                return value % 2 === 0;
            }
        }
    });

    var t1 = new unittest();

    t1.set('id', 0);

    assert.strictEqual(t1.get('id'), 0);

    // Not valid
    t1.set('id', 1);

    // Still original
    assert.strictEqual(t1.get('id'), 0);

    // Valid
    t1.set('id', 2);

    // Updated
    assert.strictEqual(t1.get('id'), 2);
});


// Allow string regex as a test
QUnit.test('a.model.validate-string', function (assert) {
    assert.expect(5);

    var unittest = a.model('a.model.validate-string', {
        name: {
            init: 'hello',
            validate: '^[a-fA-F0-9]+$'
        }
    });

    var t = unittest();

    assert.strictEqual(t.get('name'), 'hello', 'Test init value');

    t.set('name', 'zzz');

    assert.strictEqual(t.get('name'), 'hello', 'Test second value');

    t.set('name', 'aaa');

    assert.strictEqual(t.get('name'), 'aaa', 'Test third value');

    t.set('name', 'abcdefABCDEF0123456789');

    assert.strictEqual(t.get('name'), 'abcdefABCDEF0123456789', 'Test 4th value');

    t.set('name', 'abcdefABCDEF0123456789 ');

    assert.strictEqual(t.get('name'), 'abcdefABCDEF0123456789', 'Test 5th value');
});


// Test model direct value
QUnit.test('a.model.direct-property', function (assert) {
    assert.expect(4);

    var test = a.model('a.model.direct-property', {
        name: {
            nullable: true,
            init: 'hello'
        },
        supertest: {
            nullable: true,
            init: 25
        }
    });

    var z = a.model('a.model.direct-property');

    assert.strictEqual(z.name, 'hello', 'Test direct name');
    assert.strictEqual(z.supertest, 25, 'Test direct supertest');
    assert.strictEqual(z.get('name'), 'hello', 'Indirect test name');
    assert.strictEqual(z.get('supertest'), 25, 'Indirect test supertest');
});


// Test setting some false values as init (bug)
QUnit.test('a.model.init-false', function (assert) {
    assert.expect(1);

    var test = a.model('a.model.init-false', {
        completed: {
            init: false
        }
    });

    var z = test();
    assert.strictEqual(z.toJSON(), '{"completed":false}', 'Test false values');
});


// Test with some function inside the model
QUnit.test('a.model.functions', function (assert) {
    assert.expect(3);

    var test = a.model('a.model.functions', {
        id: {
            init: 'ok'
        },


        calc: function(a, b) {
            return a + b;
        },
        superId: function(a) {
            return this.get('id') + a;
        }
    });

    var z = test();

    assert.strictEqual(z.get('id'), 'ok');
    assert.strictEqual(z.calc(1, 2), 3);
    assert.strictEqual(z.superId('g'), 'okg');
});