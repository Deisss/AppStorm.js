// Unit test for a.mock

QUnit.module('core/mock.js', {
    setup: function() {
        a.mock.clear();
    },
    teardown: function() {
        a.mock.clear();
    }
});

QUnit.test('a.mock.add', function (assert) {
    assert.expect(4);

    a.mock.add('GET', 'api/version', {
        version: '1.0.2'
    }, 'api');

    var content = a.mock.api();

    assert.strictEqual(a.size(content), 1);
    assert.strictEqual(a.size(content.api), 1);
    assert.strictEqual(content.api.get.length, 1);
    assert.strictEqual(content.api.get[0], 'api/version');
});

QUnit.test('a.mock.add-parameter', function (assert) {
    assert.expect(4);

    a.mock.add('GET', 'user/{{id: [0-9]+}}', {
        test: 'ok'
    });

    assert.strictEqual(a.mock.get('GET', 'user/2').test, 'ok');
    assert.strictEqual(a.mock.get('GET', 'user/a'), null);

    a.mock.add('POST', 'project/{{id: [a-fA-F0-9]+}}/{{sub: [0-9]+}}',
            function (id, sub) {
        return {
            id: id,
            sub: sub
        };
    });

    var result = a.mock.get('POST', 'project/12bF/2');
    assert.strictEqual(result.id, '12bF');
    assert.strictEqual(result.sub, '2');
});

QUnit.test('a.mock.get', function (assert) {
    assert.expect(11);

    a.mock.add('GET', 'api/version', {
        version: '1.0.1'
    }, 'api');

    a.mock.add('POST', 'api/version', {
        version: '1.0.2'
    }, 'api');

    a.mock.add('PUT', 'api/version', function() {
        return '1.0.3';
    }, 'api');

    var content = a.mock.api();

    assert.strictEqual(a.size(content), 1);
    assert.strictEqual(a.size(content.api), 3);
    assert.strictEqual(content.api.get.length, 1);
    assert.strictEqual(content.api.post.length, 1);
    assert.strictEqual(content.api.put.length, 1);
    assert.strictEqual(content.api.get[0], 'api/version');
    assert.strictEqual(content.api.post[0], 'api/version');
    assert.strictEqual(content.api.put[0], 'api/version');

    assert.strictEqual(a.mock.get('GET', 'api/version').version, '1.0.1');
    assert.strictEqual(a.mock.get('POST', 'api/version').version, '1.0.2');
    assert.strictEqual(a.mock.get('PUT', 'api/version'), '1.0.3');
});

QUnit.test('a.mock.model', function (assert) {
    assert.expect(10);

    a.mock.add('GET', 'user', {
        id: 4,
        forgotten: true
    }, 'user');

    a.mock.add('POST', 'user', [{
        id: 5,
        login: 'login',
        password: 'yatta',
        something: 'ok',
        links: ['ok', 'ok2']
    },{
        id: 6,
        login: 'interesting',
        firstname: 'ok',
        lastname: 'ok',
        something: 4,
        avatar: 'someurl'
    }], {
        model: 'user',
        many: true
    });

    // Try to find the final model content
    var model = a.mock.model('user');
    assert.strictEqual(model.id, 'number');
    assert.strictEqual(model.forgotten, 'boolean');
    assert.strictEqual(model.login, 'string');
    assert.strictEqual(model.password, 'string');
    assert.strictEqual(model.firstname, 'string');
    assert.strictEqual(model.lastname, 'string');
    assert.strictEqual(model.avatar, 'string');
    assert.strictEqual(model.links, 'array');
    assert.strictEqual(model.something[0], 'string');
    assert.strictEqual(model.something[1], 'number');
});

QUnit.test('a.mock.api', function (assert) {
    assert.expect(5);

    a.mock.add('GET', 'user', {
        id: 4,
        forgotten: true
    }, 'user');

    a.mock.add('POST', 'user', [{
        id: 5,
        login: 'login',
        password: 'yatta',
        links: ['ok', 'ok2']
    },{
        id: 6,
        login: 'interesting',
        firstname: 'ok',
        lastname: 'ok',
        avatar: 'someurl'
    }], {
        model: 'user',
        many: true
    });

    a.mock.add('POST', 'api/version2', {});
    a.mock.add('POST', 'api/version', {});

    a.mock.add('POST', 'url/complex/somehow', {}, 'session');

    var result = a.mock.api();
    assert.strictEqual(result.unknow.post[0], 'api/version2');
    assert.strictEqual(result.unknow.post[1], 'api/version');
    assert.strictEqual(result.session.post[0], 'url/complex/somehow');
    assert.strictEqual(result.user.post[0], 'user');
    assert.strictEqual(result.user.get[0], 'user');
});

// Testing data send
QUnit.test('a.mock.data', function (assert) {
    assert.expect(2);

    a.mock.add('POST', 'sometest', function (data) {
        assert.strictEqual(data.ok, 'ok', 'Test 1');
        assert.strictEqual(data.something, 'hi', 'Test 2');
    });

    a.mock.get('POST', 'sometest', {
        ok: 'ok',
        something: 'hi'
    });
});

// Testing relationship with ajax object
QUnit.asyncTest('a.mock.ajax', function (assert) {
    assert.expect(3);

    a.mock.add('GET', 'user', {
        id: 4,
        login: 'hello'
    });

    var request = a.ajax({
        method: 'GET',
        url: 'user',
        type: 'json'

    // Success function to test
    }, function(content, status) {
        assert.strictEqual(status, 200);
        assert.strictEqual(content.id, 4);
        assert.strictEqual(content.login, 'hello');
        QUnit.start();
    });

    // Starting system
    request.send();
});

// TODO: in this test we create two things: an url with parameters, and some data inside the request
// in POST for example
QUnit.asyncTest('a.mock.ajax-data', function (assert) {
    assert.expect(2);

    a.mock.add('POST', 'sometest/{{id: [0-9]+}}', function (id, data) {
        assert.strictEqual(id, "12", 'Test id');
        assert.strictEqual(data.ok, 'ok', 'Test data');
        QUnit.start();
    });

    var request = a.ajax({
            url: 'sometest/12',
            data: {
                ok: 'ok'
            },
            template: ['POST', 'json']
    });
    
    request.send();
});