// Unit test for a.acl

QUnit.module('core/acl.js', {
    teardown: function() {
        a.acl.unbindAll('change');
        a.message.unbindAll('a.acl.change');

        a.acl.setRoleList([]);
        a.acl.setCurrentRole('');
    }
});


// Test current role get and set
QUnit.test('a.acl.currentRole', function(assert) {
    assert.expect(2);
    a.acl.setCurrentRole('super-something');
    assert.strictEqual(a.acl.getCurrentRole(), 'super-something', 'Test role 1');
    a.acl.setCurrentRole('super');
    assert.strictEqual(a.acl.getCurrentRole(), 'super', 'Test role 2');
});

// Test roleList get and set
QUnit.test('a.acl.roleList', function(assert) {
    assert.expect(2);
    a.acl.setRoleList(['a', 'b', 'c']);
    assert.strictEqual(a.acl.getRoleList().join(','), 'a,b,c', 'Test list');
    a.acl.setRoleList(['a', 'z', 'k']);
    assert.strictEqual(a.acl.getRoleList().join(','), 'a,z,k', 'Test list 2');
});

// Test allowed
QUnit.test('a.acl.allowed', function(assert) {
    assert.expect(12);
    a.acl.setRoleList(['a', 'b', 'c']);
    a.acl.setCurrentRole('b');

    // Test allowed
    assert.strictEqual(a.acl.isAllowed('a', 'a'), true);
    assert.strictEqual(a.acl.isAllowed('a', 'b'), true);
    assert.strictEqual(a.acl.isAllowed('a', 'c'), true);
    assert.strictEqual(a.acl.isAllowed('b', 'a'), false);
    assert.strictEqual(a.acl.isAllowed('b', 'b'), true);
    assert.strictEqual(a.acl.isAllowed('b', 'c'), true);
    assert.strictEqual(a.acl.isAllowed('c', 'a'), false);
    assert.strictEqual(a.acl.isAllowed('c', 'b'), false);
    assert.strictEqual(a.acl.isAllowed('c', 'c'), true);

    // Finally test default role (current setted)
    assert.strictEqual(a.acl.isAllowed('a'), true);
    assert.strictEqual(a.acl.isAllowed('b'), true);
    assert.strictEqual(a.acl.isAllowed('c'), false);
});

// Test refused
QUnit.test('a.acl.refused', function(assert) {
    assert.expect(12);
    a.acl.setRoleList(['a', 'b', 'c']);
    a.acl.setCurrentRole('b');

    // Test refused
    assert.strictEqual(a.acl.isRefused('a', 'a'), false);
    assert.strictEqual(a.acl.isRefused('a', 'b'), false);
    assert.strictEqual(a.acl.isRefused('a', 'c'), false);
    assert.strictEqual(a.acl.isRefused('b', 'a'), true);
    assert.strictEqual(a.acl.isRefused('b', 'b'), false);
    assert.strictEqual(a.acl.isRefused('b', 'c'), false);
    assert.strictEqual(a.acl.isRefused('c', 'a'), true);
    assert.strictEqual(a.acl.isRefused('c', 'b'), true);
    assert.strictEqual(a.acl.isRefused('c', 'c'), false);

    // Finally test default role (current setted)
    assert.strictEqual(a.acl.isRefused('a'), false);
    assert.strictEqual(a.acl.isRefused('b'), false);
    assert.strictEqual(a.acl.isRefused('c'), true);
});


// Test event based is well performed
QUnit.asyncTest('a.acl-event', function(assert) {
    assert.expect(2);

    function testEvent(role) {
        assert.strictEqual(role, 'role-event-based');
    };

    a.message.bind('a.acl.change', testEvent);
    a.acl.bind('change', testEvent);

    a.acl.setCurrentRole('role-event-based');

    setTimeout(start, 150);
});