// Unit test the QAppStorm unit test, as it's an addition to QUnit it does
// need some test to be sure everything is fine !

QUnit.module('QAppStorm.js', {
    setup: function() {
        QAppStorm.clear();
    },
    teardown: function() {
        QAppStorm.clear();
    }
});


QUnit.asyncTest('QAppStorm-default-test', function(assert) {
    expect(6);

    var counter = 0;

    QAppStorm.chain({
        hash: 'qappstorm-unit-test',
        expect: 1,
        callback: function(chain) {
            counter++;
            assert.strictEqual(counter, 1, 'Test counter p1');
            setTimeout(function() {
                assert.strictEqual(counter, 1, 'Test final counter p1');
                chain.next();
            }, 200);
        }
    }, {
        hash: 'qappstorm-unit-test2',
        expect: 2,
        callback: function(chain) {
            counter++;
            assert.strictEqual(counter, 2, 'Test counter p2');
            setTimeout(function() {
                assert.strictEqual(counter, 2, 'Test final counter p2');
                chain.next();
            }, 200);
        }
    }, {
        hash: 'qappstorm-unit-test3',
        expect: 1,
        callback: function(chain) {
            counter++;
            assert.strictEqual(counter, 3, 'Test counter p3');
            setTimeout(function() {
                assert.strictEqual(counter, 3, 'Test final counter p3');
                chain.next();
            }, 200);
        }
    });

    for(var i=0; i<4; ++i) {
        (function(counter) {
            setTimeout(function() {
                QAppStorm.pop();
            }, counter * 500);
        })(i);
    }
});


// A second test, to check the "empty" version
asyncTest('QAppStorm-none-test', function(assert) {
    expect(1);

    QAppStorm.chain({
        hash: 'qappstorm-unit-test4',
        expect: 0
    }, {
        hash: 'qappstorm-unit-test5',
        expect: 0,
        callback: function(chain) {
            // Will arrive after system raise next element
            setTimeout(function() {
                QAppStorm.pop();
            }, 100);
            chain.next();
        }
    }, {
        hash: 'qappstorm-unit-test6',
        expect: 1,
        callback: function(chain) {
            assert.strictEqual(1, 1);
            chain.next();
        }
    });
});