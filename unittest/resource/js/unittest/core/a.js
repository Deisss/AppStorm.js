// Unit test for a (the tiny part at beginning only)

module('a.js');

// Testing a found url...
test('a.url', function() {
    ok(a.url !== '', 'Test url not empty');
});

// Testing contains function (for array search)
test('a.contains', function() {
    // Contains is a helpfull function to check if element exist in array or object
    var objTest = {
        ok : 'yatta'
    };
    var arrTest = ['ok'];

    strictEqual(a.contains(objTest, 'ok'), true, 'Test object working');
    strictEqual(a.contains(objTest, 'ok2'), false, 'Test object working');
    strictEqual(a.contains(arrTest, 'ok'), true, 'Test array working');
    strictEqual(a.contains(arrTest, 'ok2'), false, 'Test array working');

    // Test a wrong input
    strictEqual(a.contains('ok', 'ok'), false, 'Test wrong input not working');
});