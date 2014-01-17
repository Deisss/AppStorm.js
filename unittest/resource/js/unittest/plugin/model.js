// Unit test for a.model (plugin)

// TODO: model.clear ne semble pas être appelé (dans init)

module('plugin/model.js');

// Test nullable properties
test('a.model.property-nullable', function() {
    var unittest = a.model('unittest', {
        testnullable: {
            nullable: true,
            value: 'ok'
        },
        testnotnullable: {
            nullable: false,
            value: 'ok'
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

    unit.clear();

    strictEqual(unit.get('testinit'), 'ok', 'Test clear init');
});

// Test property needed
test('a.model.property-needed', function() {
    ok(1==1);
    // TODO: needed est un peu extérieur
});

// Test property check
test('a.model.property-check', function() {
    var unittest = a.model('unittest', {
        testcheck: {
            value: 'ok',
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
            value: 'ok',
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
            value: 'ok',
            transform: function(value, old) {
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
            value: 'another',
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
            value: 'another',
            apply: function(value, old) {
                se(value, 'ok');
                st();
            }
        }
    });

    var unit = new unittest();

    unit.set('app', 'ok');
});


/*
TODO:
  Test get/set/list/has/clear/toJson/fromJson/takeSnapshot/getSnapshot/
  differenceSnapshot

  => avec snapshot => tester needed again

*/