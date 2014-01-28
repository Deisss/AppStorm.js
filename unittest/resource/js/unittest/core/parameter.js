// Unit test for a.parameter

module('core/parameter.js')

// Test extract on begin
test('a.parameter.extract-beginning', function() {
    var begin = '{{super: [a-f0-9]+}}/something';
    var extrapolate = a.parameter.extract(begin);

    strictEqual(extrapolate.length, 1);
    strictEqual(extrapolate[0].name, 'super');
    strictEqual(extrapolate[0].original, '{{super: [a-f0-9]+}}');
    strictEqual(extrapolate[0].regex, '[a-f0-9]+');
    strictEqual(extrapolate[0].start, 0);
});

// Test extract on end
test('a.parameter.extract-end', function() {
    var end = '/dashboard/{{another: \\d+}}';
    var extrapolate = a.parameter.extract(end);

    strictEqual(extrapolate.length, 1);
    strictEqual(extrapolate[0].name, 'another');
    strictEqual(extrapolate[0].original, '{{another: \\d+}}');
    strictEqual(extrapolate[0].regex, '\\d+');
    strictEqual(extrapolate[0].start, 11);
});

// Test extract on full string
test('a.parameter.extract-all', function() {
    var test = '/dashboard/{{groupId: [a-fA-F0-9]+}}/note/{{noteId: \\w+}}';
    var extrapolate = a.parameter.extract(test);

    strictEqual(extrapolate.length, 2);

    strictEqual(extrapolate[0].name, 'groupId');
    strictEqual(extrapolate[1].name, 'noteId');

    strictEqual(extrapolate[0].original, '{{groupId: [a-fA-F0-9]+}}');
    strictEqual(extrapolate[1].original, '{{noteId: \\w+}}');

    strictEqual(extrapolate[0].regex, '[a-fA-F0-9]+');
    strictEqual(extrapolate[1].regex, '\\w+');

    strictEqual(extrapolate[0].start, 11);
    strictEqual(extrapolate[1].start, 42);
});

// Test custom regex extract
test('a.parameter.extract-custom', function() {
    var test = '/dash/||ok||/||another||';
    var customRegex = /\|\|([a-z]*)\|\|/gi;
    var extrapolate = a.parameter.extract(test, customRegex);

    strictEqual(extrapolate.length, 2);

    strictEqual(extrapolate[0].name, 'hash');
    strictEqual(extrapolate[1].name, 'hash');

    strictEqual(extrapolate[0].original, '||ok||');
    strictEqual(extrapolate[1].original, '||another||');

    strictEqual(extrapolate[0].regex, 'ok');
    strictEqual(extrapolate[1].regex, 'another');

    strictEqual(extrapolate[0].start, 6);
    strictEqual(extrapolate[1].start, 13);
});

// Test parameter replace
test('a.parameter.replace', function() {
    var test = '/dashboard/{{groupId: \\d+}}/ok';
    var extrapolate = a.parameter.extract(test);

    var result = a.parameter.replace(test, extrapolate[0], 'customString');
    strictEqual(result, '/dashboard/customString/ok');
});

// Test parameter convert
test('a.parameter.convert', function() {
    var test = '/dashboard/{{groupId: [a-fA-F0-9]+}}/note/{{noteId: \\w+}}';
    var converted = a.parameter.convert(test);

    strictEqual(converted, '/dashboard/([a-fA-F0-9]+)/note/(\\w+)');
});

// Test parameter convert (custom regex)
test('a.parameter.convert-regex', function() {
    var test = '/dashboard/||something|other||/note/||another|ok||';
    var customRegex = /\|\|([a-z-\|]*)\|\|/gi;
    var converted = a.parameter.convert(test, customRegex);

    strictEqual(converted, '/dashboard/(something|other)/note/(another|ok)');
});

// Test parameter extrapolate
test('a.parameter.extrapolate', function() {
    var url      = '/ok/{{id}}',
        hash     = '/dashboard/32',
        internal = '/dashboard/{{id: [0-9]+}}';

    var result = a.parameter.extrapolate(url, hash, internal);

    strictEqual(result, '/ok/32');
});

// Test parameter addParameterType
test('a.parameter.addParameterType', function() {
    var add = 'unit1';
    a.parameter.addParameterType(add, function() {return 'ok';});

    strictEqual(a.parameter._fct[add](), 'ok');

    a.parameter.removeParameterType(add);
});

// Test parameter type (working as expected)
test('a.parameter.parameterType', function() {
    // We add a function
    var name = 'unittestparamType';
    a.parameter.addParameterType(name, function(content) {
        return content + 'ok';
    });

    // Now we send request and check extrapolate result
    var hash = '/dashboard',
        url  = 'http://mylink.com/{{unittestparamType: supername}}';
        result = a.parameter.extrapolate(url, hash, '');

    strictEqual(result, 'http://mylink.com/supernameok');

    a.parameter.removeParameterType(name);
});

// Test parameter removeParameterType
test('a.parameter.removeParameterType', function() {
    var add1 = 'unitest1',
        add2 = 'unitest2',
        l1   = a.size(a.parameter._fct);

    // Add first test
    a.parameter.addParameterType(add1, function() {});
    a.parameter.addParameterType(add2, function() {});
    strictEqual(a.size(a.parameter._fct), l1 + 2);

    // Remove first
    a.parameter.removeParameterType(add1);
    strictEqual(a.size(a.parameter._fct), l1 + 1);

    // Remove second
    a.parameter.removeParameterType(add2);
    strictEqual(a.size(a.parameter._fct), l1);
});