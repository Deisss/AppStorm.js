// Unit test for a.mock

QUnit.module('core/mock.js', {
    setup: function() {
        a.mock.clear();
    },
    teardown: function() {
        a.mock.clear();
    }
});

QUnit.test('a.mock.add', function(assert) {
    assert.expect(2);

    a.mock.add('GET', 'api/version', {
        version: '1.0.2'
    });

    assert.strictEqual(a.mock._mock.length, 1);
    assert.strictEqual(a.mock._mock[0].url, 'api/version');
});

QUnit.test('a.mock.get', function(assert) {
    assert.expect(3);

    a.mock.add('GET', 'api/version', {
        version: '1.0.1'
    });

    a.mock.add('POST', 'api/version', {
        version: '1.0.2'
    });

    a.mock.add('PUT', 'api/version', function() {
        return '1.0.3';
    });

    assert.strictEqual(a.mock._mock.length, 3);

    var test = a.mock.get('GET', 'api/version');
    assert.strictEqual(test.version, '1.0.1');

    // Second test with function result
    var second = a.mock.get('PUT', 'api/version');
    assert.strictEqual(second, '1.0.3');
});

QUnit.test('a.mock.merge', function(assert) {
    assert.expect(8);

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
    }], 'users');

    // Try to find the final model content
    var merged = a.mock.merge('user');
    assert.strictEqual(merged.id, 'number');
    assert.strictEqual(merged.forgotten, 'boolean');
    assert.strictEqual(merged.login, 'string');
    assert.strictEqual(merged.password, 'string');
    assert.strictEqual(merged.firstname, 'string');
    assert.strictEqual(merged.lastname, 'string');
    assert.strictEqual(merged.avatar, 'string');
    assert.strictEqual(merged.links, 'array');
});

QUnit.test('a.mock.map', function(assert) {
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
    }], 'users');

    a.mock.add('GET', 'api/version2', {});
    a.mock.add('GET', 'api/version', {});

    a.mock.add('POST', 'url/complex/somehow', {}, 'session');

    var result = a.mock.map();
    assert.strictEqual(result.unknow.post[0], 'api/version');
    assert.strictEqual(result.unknow.post[1], 'api/version2');
    assert.strictEqual(result.session.post[0], 'url/complex/somehow');
    assert.strictEqual(result.users.post[0], 'user');
    assert.strictEqual(result.user.get[0], 'user');
});

QUnit.asyncTest('a.mock.ajax', function(assert) {
    assert.expect(3);

    a.mock.add('GET', 'user', {
        id: 4,
        login: 'hello'
    });

    var request = new a.ajax({
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