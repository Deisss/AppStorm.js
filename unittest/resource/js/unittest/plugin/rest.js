// Unit test for a.rest (plugin)

// TODO: test console log error when the model does not have any primary keys

QUnit.module('plugin/rest.js', {
    setup: function() {
        a.model.manager.clear();
        a.model.pooler.clear();
    },
    teardown: function() {
        a.model.manager.clear();
        a.model.pooler.clear();
    }
});

// Basic test for a.rest
QUnit.asyncTest('a.rest.basic', function (assert) {
    assert.expect(4);

    var model = a.model('basic', {
        id: {
            init: 1,
            primary: true
        },
        name: {
            init: 'hi'
        }
    });

    var rest = a.rest('rest-basic', '/basic', 'basic', {
        mock: true
    });

    // We try to POST then GET
    a.ajax({
            url: 'basic',
            data: {
                id: 20,
                name: 'something'
            },
            template: ['POST', 'json']
    }, function(data, status) {
        assert.strictEqual(data.id, 20, 'Test id reply');
        assert.strictEqual(data.name, 'something', 'Test name reply');

        a.ajax({
                url: 'basic/20',
                template: ['GET', 'json']
        }, function(data, status) {
            assert.strictEqual(data.id, 20, 'Test id reply');
            assert.strictEqual(data.name, 'something', 'Test name reply');
            QUnit.start();
            
        }, function(url, status) {
            assert.strictEqual(0, 1, 'Error reading');
            QUnit.start();
        }).send();

    }, function(url, status) {
        assert.strictEqual(0, 1, 'Error posting');
        QUnit.start();
    }).send();
});