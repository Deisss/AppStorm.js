// Unit test for a.model (plugin)

module('plugin/model.js');

// Test nullable properties
test('a.model.property-nullable', function() {
    var unittest = a.model('unittest', {
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

    strictEqual(unit.get('testnullable'), null, 'Test nullable');
    strictEqual(unit.get('testnotnullable'), 'ok', 'Test not nullable');
});

// Test init properties
test('a.model.property-init', function() {
    var unittest = a.model('unittest', {
        testinit: {
            init: 'ok'
        }
    });

    var unit = new unittest();

    // Test changing data
    strictEqual(unit.get('testinit'), 'ok', 'Test init');

    unit.set('testinit', 'something');
    strictEqual(unit.get('testinit'), 'something', 'Test erase init');

    unit.init();

    strictEqual(unit.get('testinit'), 'ok', 'Test clear init');
});

// Test property needed
test('a.model.property-needed', function() {
    var unittest = a.model('unittest', {
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
    strictEqual(snapshot.needed, undefined);
    strictEqual(snapshot.need, 'ok');
});

// Test property check
test('a.model.property-check', function() {
    var unittest = a.model('unittest', {
        testcheck: {
            init: 'ok',
            check: 'String'
        }
    });

    var unit = new unittest();

    strictEqual(unit.get('testcheck'), 'ok', 'Test init value');

    unit.set('testcheck', 'get');
    strictEqual(unit.get('testcheck'), 'get', 'Test second value');

    unit.get('testcheck', 12);
    strictEqual(unit.get('testcheck'), 'get', 'Test thrid value not setted');
});

// Test property validate
test('a.model.property-validate', function() {
    var unittest = a.model('unittest', {
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

    strictEqual(unit.get('testvalidate'), 'ok', 'Test init value');

    unit.set('testvalidate', 'another');
    strictEqual(unit.get('testvalidate'), 'ok', 'Test still init value');

    unit.set('testvalidate', 'something');
    strictEqual(unit.get('testvalidate'), 'something', 'Test accepted');
});

// Test property transform
test('a.model.property-transform', function() {
    var unittest = a.model('unittest', {
        testtransform: {
            init: 'ok',
            transform: function piou(value, old) {
                return '' + old + value;
            }
        }
    });

    var unit = new unittest();

    strictEqual(unit.get('testtransform'), 'ok', 'Test init value');

    unit.set('testtransform', 'something');
    strictEqual(unit.get('testtransform'), 'oksomething', 'Test concat');

    unit.set('testtransform', 'another');
    strictEqual(unit.get('testtransform'), 'oksomethinganother', 'Second');
});

// Test property event
test('a.model.property-event', function() {
    stop();
    expect(2);

    var se = strictEqual,
        st = start;

    var unittest = a.model('unittest', {
        evt: {
            init: 'another',
            event: 'super'
        }
    });

    var unit = new unittest();

    function eventMatcher(data) {
        if(data.value == 'something') {
            se(data.value, 'something', 'Test something value');
        } else {
            se(data.value, 'ok', 'Test ok value');
            st();
        }
    };

    unit.bind('super', eventMatcher);

    unit.set('evt', 'something');

    setTimeout(function() {
        unit.set('evt', 'ok');
    }, 150);
});

// Test property apply
test('a.model.property-apply', function() {
    stop();
    expect(1);

    var se = strictEqual,
        st = start;

    var unittest = a.model('unittest', {
        app: {
            init: 'another',
            apply: function(value, old) {
                se(value, 'ok');
                st();
            }
        }
    });

    var unit = new unittest();

    unit.set('app', 'ok');
});




// Test list function
test('a.model.list', function() {
    var unittest = a.model('unittest', {
        A: {
            init: 'ok'
        },
        B: {
            init: 'something'
        }
    });

    var unit = new unittest();
    var list = unit.list();

    strictEqual(list.join(','), 'A,B');
});

// Test has function
test('a.model.has', function() {
    var unittest = a.model('unittest', {
        A: {
            init: 'ok'
        },
        B: {
            init: 'something'
        }
    });

    var unit = new unittest();

    strictEqual(unit.has('A'), true);
    strictEqual(unit.has('B'), true);
    strictEqual(unit.has('C'), false);
});

// Test init function
test('a.model.init', function() {
    var unittest = a.model('unittest', {
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
    strictEqual(unit.get('testA'), 'ok', 'Test init1');
    strictEqual(unit.get('testB'), 'something', 'Test init2');
    strictEqual(unit.get('testC'), null, 'Test init3');

    // Change init
    unit.set('testA', 'another');
    unit.set('testB', 'stuff');
    unit.set('testC', 'great');

    strictEqual(unit.get('testA'), 'another', 'Test change init1');
    strictEqual(unit.get('testB'), 'stuff', 'Test change init2');
    strictEqual(unit.get('testC'), 'great', 'Test change init3');

    // Rollback init
    unit.init();

    // Second init
    strictEqual(unit.get('testA'), 'ok', 'Test rollback init1');
    strictEqual(unit.get('testB'), 'something', 'Test rollback init2');
    strictEqual(unit.get('testC'), null, 'Test rollback init3');
});

// Test jsons function
test('a.model.json', function() {
    var unittest = a.model('unittest', {
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

    strictEqual(json, '{"testA":"another","testB":"great"}', 'Test JSON');

    var second = new unittest();
    second.fromJSON(json);

    var alternative = second.toJSON();

    strictEqual(json, '{"testA":"another","testB":"great"}', 'Test second');
});

// Test snapshot function
test('a.model.snapshot', function() {
    var unittest = a.model('unittest', {
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

    strictEqual(firstSimpleSnapshot, '{"snap":"ok"}');
    strictEqual(firstComplexSnapshot, '{"snap":{"value":"ok","old":"ok"}}')
});



test('a.model.validates', function() {
    ok(1==1);
});

test('a.model.requests', function() {
    ok(1==1);
});