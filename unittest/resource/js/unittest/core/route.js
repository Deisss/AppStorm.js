// Unit test for a.route

module('core/route.js');

// Test entering route system
test('a.route.enter', function() {
    stop();
    expect(1);

    var se = strictEqual,
        st = start;

    // Dummy function to test entering route element
    function checkRoute() {
        se(a.hash.getHash(), 'unittest-route1', 'Test entering');
    };

    // Binding function to route
    a.route.bind('unittest-route1', checkRoute);

    setTimeout(function() {
        window.location.href = '#unittest-route1';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#unittest-noroute1';
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        a.route.unbind('unittest-route1', checkRoute);
        window.location.href = '#';
        st();
    }, 1000);
});

// Test leaving route system
test('a.route.leave', function() {
    stop();
    expect(1);

    var se = strictEqual,
        st = start;

    // Dummy function to test leaving route element
    function checkRoute() {
        se(a.hash.getHash(), 'unittest-noroute2', 'Test leaving');
    };

    // Binding function to route
    a.route.bind('unittest-route2', checkRoute, 'leave');

    setTimeout(function() {
        window.location.href = '#unittest-route2';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#unittest-noroute2';
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        a.route.unbind('unittest-route2', checkRoute);
        window.location.href = '#';
        st();
    }, 1000);
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

    setTimeout(function() {
        window.location.href = '#unittest-route-otherwise1';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#unittest-route-nootherwise1';
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        a.route.otherwise(null);
        window.location.href = '#';
        st();
    }, 1000);
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

    setTimeout(function() {
        window.location.href = '#unittest-route-otherwise2';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#unittest-route-nootherwise2';
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        a.route.otherwise(null, 'leave');
        window.location.href = '#';
        st();
    }, 1000);
});