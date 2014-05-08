// Unit test for a.mock

module('core/mock.js', {
    teardown: function() {
        a.mock._mock = [];
    }
});

test('a.mock.add', function() {
    a.mock.add('GET', 'api/version', {
        version: '1.0.2'
    });

    strictEqual(a.mock._mock.length, 1);
    strictEqual(a.mock._mock[0].url, 'api/version');
});

test('a.mock.get', function() {
    a.mock.add('GET', 'api/version', {
        version: '1.0.1'
    });

    a.mock.add('POST', 'api/version', {
        version: '1.0.2'
    });

    a.mock.add('PUT', 'api/version', function() {
        return '1.0.3';
    });

    strictEqual(a.mock._mock.length, 3);

    var test = a.mock.get('GET', 'api/version');
    strictEqual(test.version, '1.0.1');

    // Second test with function result
    var second = a.mock.get('PUT', 'api/version');
    strictEqual(second, '1.0.3');
});

test('a.mock.get-variable', function() {
    // TEST passing variables into URL for example is acceptable
    // currently not the case.
    // Like api/version/{version} and api/version/0.2 are acceptable compare
});

test('a.mock.merge', function() {
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
    strictEqual(merged.id, 'number');
    strictEqual(merged.forgotten, 'boolean');
    strictEqual(merged.login, 'string');
    strictEqual(merged.password, 'string');
    strictEqual(merged.firstname, 'string');
    strictEqual(merged.lastname, 'string');
    strictEqual(merged.avatar, 'string');
    strictEqual(merged.links, 'array');
});

test('a.mock.map', function() {
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
    strictEqual(result.unknow.post[0], 'api/version');
    strictEqual(result.unknow.post[1], 'api/version2');
    strictEqual(result.session.post[0], 'url/complex/somehow');
    strictEqual(result.users.post[0], 'user');
    strictEqual(result.user.get[0], 'user');
});