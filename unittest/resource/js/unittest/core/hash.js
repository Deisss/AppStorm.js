// Unit test for a.hash

module('core/hash.js');

// Start testing hash system
test('a.hash', function() {
    stop();
    expect(2);

    var o = ok,
        st = start;

    var check = function() {
        o(1==1);
    };

    a.hash.bind('change', check);

    setTimeout(function() {
        window.location.href = '#unittest1';
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = '#unittest2';
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        a.hash.unbind('change', check);
        window.location.href = '#';
        st();
    }, 1000);
});