// Unit test for a.hash

module('core/hash.js');

testModuleStart('core/hash.js', function() {
    hashtag('');
});

testModuleDone('core/hash.js', function() {
    hashtag('');
    a.hash.unbindAll('change');
});




// Start testing hash system
asyncTest('a.hash', function() {
    expect(2);

    var check = function() {
        ok(1==1);
    };

    a.hash.bind('change', check);

    chain('unittest1', function() {
        hashtag('unittest2');
    }, 100);

    chain('unittest2', start, 100);

    hashtag('unittest1');
});