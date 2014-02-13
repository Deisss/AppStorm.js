// Unit test for a.route

module('core/route.js');

// Test entering route system
test('a.route.enter', function() {
    stop();
    expect(1);

    var se = strictEqual,
        st = start;

    // Dummy function to test entering route element
    function checkRoute(hash) {
        se(hash, 'unittest-route1', 'Test entering');
    };

    // Binding function to route
    a.route.bind('unittest-route1', checkRoute);

    chain('unittest-route1', function() {
        hashtag('unittest-noroute1');
    });

    chain('unittest-route1', function() {
        a.route.unbind('unittest-route1', checkRoute);
        window.location.href = '#';
        st();
    }, 100);

    hashtag('unittest-route1');
});

// Test leaving route system
test('a.route.leave', function() {
    stop();
    expect(1);

    var se = strictEqual,
        st = start;

    // Dummy function to test leaving route element
    function checkRoute(hash) {
        se(hash, 'unittest-route2', 'Test leaving');
    };

    // Binding function to route
    a.route.bind('unittest-route2', checkRoute, 'leave');

    chain('unittest-route2', function() {
        hashtag('unittest-noroute2');
    });

    chain('unittest-noroute2', function() {
        a.route.unbind('unittest-route2', checkRoute, 'leave');
        hashtag('');
        st();
    }, 100);

    // Starting system
    hashtag('unittest-route2');
});

// Test entering - otherwise system
test('a.route.enter-otherwise', function() {
    stop();
    expect(2);

    var se = strictEqual,
        st = start;

    // Dummy function to test entering route element
    function checkOtherwise() {
        se(1, 1, 'Test otherwise enter');
    };

    // Binding function to route
    a.route.otherwise(checkOtherwise);

    chain('unittest-route-otherwise1', function() {
        hashtag('unittest-route-nootherwise1');
    });

    chain('unittest-route-nootherwise1', function() {
       a.route.otherwise(null);
        window.location.href = '#';
        st();
    }, 100);

    hashtag('unittest-route-otherwise1');
});

// Test leaving - otherwise system
test('a.route.leaving-otherwise', function() {
    stop();
    expect(2);

    var se = strictEqual,
        st = start;

    // Dummy function to test leaving route element
    function checkOtherwise() {
        se(1, 1, 'Test otherwise leaving');
    };

    // Binding function to route
    a.route.otherwise(checkOtherwise, 'leave');

    chain('unittest-route-otherwise2', function() {
        hashtag('unittest-route-nootherwise2');
    });

    chain('unittest-route-nootherwise2', function() {
        a.route.otherwise(null, 'leave');
        window.location.href = '#';
        st();
    }, 100);

    hashtag('unittest-route-otherwise2');
});