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

    chain('unittest1', function() {
        hashtag('unittest2');
    });

    chain('unittest2', function() {
        a.hash.unbind('change', check);
        window.location.href = '#';
        st();
    }, 100);

    hashtag('unittest1');
});