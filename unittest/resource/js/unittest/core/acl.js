// Unit test for a.acl

module('core/acl.js');

testModuleDone('core/acl.js', function() {
    a.acl.unbindAll('change');
    a.message.unbindAll('a.acl.change');

    a.acl.setRoleList([]);
    a.acl.setCurrentRole('');
});



// Test current role get and set
test('a.acl.currentRole', function() {
    a.acl.setCurrentRole('super-something');
    strictEqual(a.acl.getCurrentRole(), 'super-something', 'Test role 1');
    a.acl.setCurrentRole('super');
    strictEqual(a.acl.getCurrentRole(), 'super', 'Test role 2');
});

// Test roleList get and set
test('a.acl.roleList', function() {
    a.acl.setRoleList(['a', 'b', 'c']);
    strictEqual(a.acl.getRoleList().join(','), 'a,b,c', 'Test list');
    a.acl.setRoleList(['a', 'z', 'k']);
    strictEqual(a.acl.getRoleList().join(','), 'a,z,k', 'Test list 2');
});

// Test allowed
test('a.acl.allowed', function() {
    a.acl.setRoleList(['a', 'b', 'c']);
    a.acl.setCurrentRole('b');

    // Test allowed
    strictEqual(a.acl.isAllowed('a', 'a'), true);
    strictEqual(a.acl.isAllowed('a', 'b'), true);
    strictEqual(a.acl.isAllowed('a', 'c'), true);
    strictEqual(a.acl.isAllowed('b', 'a'), false);
    strictEqual(a.acl.isAllowed('b', 'b'), true);
    strictEqual(a.acl.isAllowed('b', 'c'), true);
    strictEqual(a.acl.isAllowed('c', 'a'), false);
    strictEqual(a.acl.isAllowed('c', 'b'), false);
    strictEqual(a.acl.isAllowed('c', 'c'), true);

    // Finally test default role (current setted)
    strictEqual(a.acl.isAllowed('a'), true);
    strictEqual(a.acl.isAllowed('b'), true);
    strictEqual(a.acl.isAllowed('c'), false);
});

// Test refused
test('a.acl.refused', function() {
    a.acl.setRoleList(['a', 'b', 'c']);
    a.acl.setCurrentRole('b');

    // Test refused
    strictEqual(a.acl.isRefused('a', 'a'), false);
    strictEqual(a.acl.isRefused('a', 'b'), false);
    strictEqual(a.acl.isRefused('a', 'c'), false);
    strictEqual(a.acl.isRefused('b', 'a'), true);
    strictEqual(a.acl.isRefused('b', 'b'), false);
    strictEqual(a.acl.isRefused('b', 'c'), false);
    strictEqual(a.acl.isRefused('c', 'a'), true);
    strictEqual(a.acl.isRefused('c', 'b'), true);
    strictEqual(a.acl.isRefused('c', 'c'), false);

    // Finally test default role (current setted)
    strictEqual(a.acl.isRefused('a'), false);
    strictEqual(a.acl.isRefused('b'), false);
    strictEqual(a.acl.isRefused('c'), true);
});


// Test event based is well performed
asyncTest('a.acl-event', function() {
    expect(2);

    function testEvent(role) {
        strictEqual(role, 'role-event-based');
    };

    a.message.bind('a.acl.change', testEvent);
    a.acl.bind('change', testEvent);

    a.acl.setCurrentRole('role-event-based');

    setTimeout(start, 100);
});