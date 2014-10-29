// Unit test for a.route

QUnit.module('core/route.js', {
    setup: function() {
        hashtag('');
        QAppStorm.clear();
    },
    teardown: function() {
        hashtag('');
        QAppStorm.clear();
    }
});




// Test entering route system
QUnit.asyncTest('a.route.enter', function(assert) {
    assert.expect(1);

    // Dummy function to test entering route element
    function checkRoute(hash) {
        QAppStorm.pop();
        assert.strictEqual(hash, 'unittest-route1', 'Test entering');
    };

    // Binding function to route
    a.route.bind('unittest-route1', checkRoute);

    QAppStorm.chain({
        hash: 'unittest-route1',
        expect: 0
    }, {
        hash: 'unittest-noroute1',
        expect: 1,
        callback: function(chain) {
            a.route.unbind('unittest-route1', checkRoute);
            chain.next();
        }
    });
});

// Test leaving route system
QUnit.asyncTest('a.route.leave', function(assert) {
    assert.expect(1);

    // Dummy function to test leaving route element
    function checkRoute(hash) {
        QAppStorm.pop();
        assert.strictEqual(hash, 'unittest-route2', 'Test leaving');
    };

    // Binding function to route
    a.route.bind('unittest-route2', checkRoute, 'leave');

    QAppStorm.chain({
        hash: 'unittest-route2',
        expect: 0
    }, {
        hash: 'unittest-noroute2',
        expect: 1,
        callback: function(chain) {
            a.route.unbind('unittest-route2', checkRoute);
            chain.next();
        }
    });
});

// Test entering - otherwise system
QUnit.asyncTest('a.route.enter-otherwise', function(assert) {
    assert.expect(1);

    // Dummy function to test entering route element
    function checkOtherwise() {
        QAppStorm.pop();
        assert.strictEqual(1, 1, 'Test otherwise enter');
    };

    // Binding function to route
    a.route.otherwise(checkOtherwise);

    QAppStorm.chain({
        hash: 'unittest-route-otherwise1',
        expect: 0
    }, {
        hash: 'unittest-route-nootherwise1',
        expect: 1,
        callback: function(chain) {
            a.route.otherwise(null);
            chain.next();
        }
    });
});

// Test leaving - otherwise system
QUnit.asyncTest('a.route.leaving-otherwise', function(assert) {
    assert.expect(1);

    // Dummy function to test leaving route element
    function checkOtherwise() {
        QAppStorm.pop();
        assert.strictEqual(1, 1, 'Test otherwise leaving');
    };

    // Binding function to route
    a.route.otherwise(checkOtherwise, 'leave');


    QAppStorm.chain({
        hash: 'unittest-route-otherwise2',
        expect: 0
    }, {
        hash: 'unittest-route-nootherwise2',
        expect: 1,
        callback: function(chain) {
            a.route.otherwise(null, 'leave');
            chain.next();
        }
    });
});


QUnit.asyncTest('a.route.fake', function(assert) {
    assert.expect(1);


    // Dummy function to test entering route element
    function checkRoute(hash) {
        assert.strictEqual(hash, 'unittest-route3', 'Test entering');
        a.route.unbind('unittest-route3', checkRoute);
        QUnit.start();
    };

    // Binding function to route
    a.route.bind('unittest-route3', checkRoute);
    a.route.fake('unittest-route3');
});