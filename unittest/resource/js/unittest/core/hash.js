// Unit test for a.hash

QUnit.module('core/hash.js', {
    setup: function() {
        hashtag('');
    },
    teardown: function() {
        hashtag('');
        a.hash.unbindAll('change');
    }
});




// Start testing hash system
QUnit.asyncTest('a.hash', function(assert) {
    assert.expect(2);

    var check = function() {
        QAppStorm.pop();
        assert.ok(1==1);
    };

    a.hash.bind('change', check);

    QAppStorm.chain({
        hash: 'hash-unittest1',
        expect: 1,
    }, {
        hash: 'hash-unittest2',
        expect: 1,
        callback: function(chain) {
            // We remove binding
            a.hash.unbind('change', check);
            chain.next();
        }
    });
});