// Unit test for a.parameter

QUnit.module('core/parameter.js');

// Test extract on begin
QUnit.test('a.parameter.extract-beginning', function(assert) {
    assert.expect(5);

    var begin = '{{super: [a-f0-9]+}}/something';
    var extrapolate = a.parameter.extract(begin);

    assert.strictEqual(extrapolate.length, 1);
    assert.strictEqual(extrapolate[0].name, 'super');
    assert.strictEqual(extrapolate[0].original, '{{super: [a-f0-9]+}}');
    assert.strictEqual(extrapolate[0].regex, '[a-f0-9]+');
    assert.strictEqual(extrapolate[0].start, 0);
});

// Test extract on end
QUnit.test('a.parameter.extract-end', function(assert) {
    assert.expect(5);

    var end = '/dashboard/{{another: \\d+}}';
    var extrapolate = a.parameter.extract(end);

    assert.strictEqual(extrapolate.length, 1);
    assert.strictEqual(extrapolate[0].name, 'another');
    assert.strictEqual(extrapolate[0].original, '{{another: \\d+}}');
    assert.strictEqual(extrapolate[0].regex, '\\d+');
    assert.strictEqual(extrapolate[0].start, 11);
});

// Test extract on full string
QUnit.test('a.parameter.extract-all', function(assert) {
    assert.expect(9);

    var test = '/dashboard/{{groupId: [a-fA-F0-9]+}}/note/{{noteId: \\w+}}';
    var extrapolate = a.parameter.extract(test);

    assert.strictEqual(extrapolate.length, 2);

    assert.strictEqual(extrapolate[0].name, 'groupId');
    assert.strictEqual(extrapolate[1].name, 'noteId');

    assert.strictEqual(extrapolate[0].original, '{{groupId: [a-fA-F0-9]+}}');
    assert.strictEqual(extrapolate[1].original, '{{noteId: \\w+}}');

    assert.strictEqual(extrapolate[0].regex, '[a-fA-F0-9]+');
    assert.strictEqual(extrapolate[1].regex, '\\w+');

    assert.strictEqual(extrapolate[0].start, 11);
    assert.strictEqual(extrapolate[1].start, 42);
});

// Test custom regex extract
QUnit.test('a.parameter.extract-custom', function(assert) {
    assert.expect(9);

    var test = '/dash/||ok||/||another||';
    var customRegex = /\|\|([a-z]*)\|\|/gi;
    var extrapolate = a.parameter.extract(test, customRegex);

    assert.strictEqual(extrapolate.length, 2);

    assert.strictEqual(extrapolate[0].name, 'hash');
    assert.strictEqual(extrapolate[1].name, 'hash');

    assert.strictEqual(extrapolate[0].original, '||ok||');
    assert.strictEqual(extrapolate[1].original, '||another||');

    assert.strictEqual(extrapolate[0].regex, 'ok');
    assert.strictEqual(extrapolate[1].regex, 'another');

    assert.strictEqual(extrapolate[0].start, 6);
    assert.strictEqual(extrapolate[1].start, 13);
});

// Test parameter replace
QUnit.test('a.parameter.replace', function(assert) {
    assert.expect(1);

    var test = '/dashboard/{{groupId: \\d+}}/ok';
    var extrapolate = a.parameter.extract(test);

    var result = a.parameter.replace(test, extrapolate[0], 'customString');
    assert.strictEqual(result, '/dashboard/customString/ok');
});

// Test parameter convert
QUnit.test('a.parameter.convert', function(assert) {
    assert.expect(1);

    var test = '/dashboard/{{groupId: [a-fA-F0-9]+}}/note/{{noteId: \\w+}}';
    var converted = a.parameter.convert(test);

    assert.strictEqual(converted, '/dashboard/([a-fA-F0-9]+)/note/(\\w+)');
});

// Test parameter convert (custom regex)
QUnit.test('a.parameter.convert-regex', function(assert) {
    assert.expect(1);

    var test = '/dashboard/||something|other||/note/||another|ok||';
    var customRegex = /\|\|([a-z-\|]*)\|\|/gi;
    var converted = a.parameter.convert(test, customRegex);

    assert.strictEqual(converted, '/dashboard/(something|other)/note/(another|ok)');
});

// Test parameter extrapolate
QUnit.test('a.parameter.extrapolate', function(assert) {
    assert.expect(1);

    var url      = '/ok/{{id}}',
        hash     = '/dashboard/32',
        internal = '/dashboard/{{id: [0-9]+}}';

    var result = a.parameter.extrapolate(url, hash, internal);

    assert.strictEqual(result, '/ok/32');
});

// Test parameter addParameterType
QUnit.test('a.parameter.addParameterType', function(assert) {
    assert.expect(1);

    var add = 'unit1';
    a.parameter.addParameterType(add, function() {return 'ok';});

    assert.strictEqual(a.parameter._fct[add](), 'ok');

    a.parameter.removeParameterType(add);
});

// Test parameter type (working as expected)
QUnit.test('a.parameter.parameterType', function(assert) {
    assert.expect(1);

    // We add a function
    var name = 'unittestparamType';
    a.parameter.addParameterType(name, function(content) {
        return content + 'ok';
    });

    // Now we send request and check extrapolate result
    var hash = '/dashboard',
        url  = 'http://mylink.com/{{unittestparamType: supername}}';
        result = a.parameter.extrapolate(url, hash, '');

    assert.strictEqual(result, 'http://mylink.com/supernameok');

    a.parameter.removeParameterType(name);
});

// Test parameter type (working as expected)
QUnit.test('a.parameter.parameterType2', function(assert) {
    assert.expect(1);

    // We add a function
    var name = 'unittest-paramType';
    a.parameter.addParameterType(name, function(content) {
        return content + 'ok';
    });

    // Now we send request and check extrapolate result
    var hash = '/dashboard',
        url  = 'http://mylink.com/{{unittest-paramType: supername}}';
        result = a.parameter.extrapolate(url, hash, '');

    assert.strictEqual(result, 'http://mylink.com/supernameok');

    a.parameter.removeParameterType(name);
});

// Test parameter removeParameterType
QUnit.test('a.parameter.removeParameterType', function(assert) {
    assert.expect(3);

    var add1 = 'unitest1',
        add2 = 'unitest2',
        l1   = a.size(a.parameter._fct);

    // Add first test
    a.parameter.addParameterType(add1, function() {});
    a.parameter.addParameterType(add2, function() {});
    assert.strictEqual(a.size(a.parameter._fct), l1 + 2);

    // Remove first
    a.parameter.removeParameterType(add1);
    assert.strictEqual(a.size(a.parameter._fct), l1 + 1);

    // Remove second
    a.parameter.removeParameterType(add2);
    assert.strictEqual(a.size(a.parameter._fct), l1);
});









// Test extracting elements from system
QUnit.test('a.parameter.extract-old-unittest', function(assert) {
    assert.expect(26);

    var param1 = 
    'this is a string with {{type :    [a-zA-Z0-9]?}} and also {{id : .*  }}',
        param2 = 'another {{ example : \\d+}} and also {{this : a|b}}',
        param3 = 
        'The last {{one : \\w+}} but not least {{invalidate : [^a-fA-F]+  }}',
        param4 = 
'But this one don\'t work {{worknot}} and also this one too {{oups : @ok}}';

    // Now we test extract system does work as expected
    var extracted1 = a.parameter.extract(param1),
        extracted2 = a.parameter.extract(param2),
        extracted3 = a.parameter.extract(param3),
        extracted4 = a.parameter.extract(param4);

    // Test tab length
    assert.strictEqual(extracted1.length, 2, 'Test length');
    assert.strictEqual(extracted2.length, 2, 'Test length');
    assert.strictEqual(extracted3.length, 2, 'Test length');
    assert.strictEqual(extracted4.length, 0, 'Test length');

    // Test content (name)
    assert.strictEqual(extracted1[0]['name'], 'type', 'Test name');
    assert.strictEqual(extracted1[1]['name'], 'id', 'Test name');
    assert.strictEqual(extracted2[0]['name'], 'example', 'Test name');
    assert.strictEqual(extracted2[1]['name'], 'this', 'Test name');
    assert.strictEqual(extracted3[0]['name'], 'one', 'Test name');
    assert.strictEqual(extracted3[1]['name'], 'invalidate', 'Test name');

    // Test content (original)
    assert.strictEqual(extracted1[0]['original'], 
                        '{{type :    [a-zA-Z0-9]?}}', 'Test original');
    assert.strictEqual(extracted1[1]['original'], '{{id : .*  }}', 'Test original');
    assert.strictEqual(extracted2[0]['original'], 
                        '{{ example : \\d+}}', 'Test original');
    assert.strictEqual(extracted2[1]['original'], '{{this : a|b}}', 'Test original');
    assert.strictEqual(extracted3[0]['original'], '{{one : \\w+}}', 'Test original');
    assert.strictEqual(extracted3[1]['original'], 
                        '{{invalidate : [^a-fA-F]+  }}', 'Test original');

    // Test content (regex)
    assert.strictEqual(extracted1[0]['regex'], '[a-zA-Z0-9]?', 'Test regex');
    assert.strictEqual(extracted1[1]['regex'], '.*', 'Test regex');
    assert.strictEqual(extracted2[0]['regex'], '\\d+', 'Test regex');
    assert.strictEqual(extracted2[1]['regex'], 'a|b', 'Test regex');
    assert.strictEqual(extracted3[0]['regex'], '\\w+', 'Test regex');
    assert.strictEqual(extracted3[1]['regex'], '[^a-fA-F]+', 'Test regex');

    // Now we try custom regex behaviour to handle param4
    var rgx = /\{\{(\s*\w+\s*)\}\}/gmi;
    extracted4 = a.parameter.extract(param4, rgx);

    // Now this time the worknot does work...
    assert.strictEqual(extracted4.length, 1, 'Test length');
    assert.strictEqual(extracted4[0]['name'], 'hash', 'Test name');
    assert.strictEqual(extracted4[0]['original'], '{{worknot}}', 'Test original');
    assert.strictEqual(extracted4[0]['regex'], 'worknot', 'Test regex');
});

// Testing the replace content system
QUnit.test('a.parameter.replace-old-unittest', function(assert) {
    assert.expect(8);

    var param1 =
    'this is a string with {{type :    [a-zA-Z0-9]?}} and also {{id : .*  }}',
        param2 = 'another {{ example : \\d+}} and also {{this : a|b}}',
        param3 =
    'The last {{one : \\w+}} but not least {{invalidate : [^a-fA-F]+  }}',
        param4 = 
'But this one don\'t work {{worknot}} and also this one too {{oups : @ok}}';

    // For second unit test series
    var e1 = param1, e2 = param2, e3 = param3, e4 = param4;

    // Now we test extract system does work as expected
    var extracted1 = a.parameter.extract(param1),
        extracted2 = a.parameter.extract(param2),
        extracted3 = a.parameter.extract(param3),
        extracted4 = a.parameter.extract(param4);

    // Now we use default extract system, and check result
    var l = extracted1.length;
    while(l--) {param1 = a.parameter.replace(param1, extracted1[l]);}
    assert.strictEqual(param1, 
        'this is a string with ([a-zA-Z0-9]?) and also (.*)', 'Test replace');

    l = extracted2.length;
    while(l--) {param2 = a.parameter.replace(param2, extracted2[l]);}
    assert.strictEqual(param2, 'another (\\d+) and also (a|b)', 'Test replace');

    l = extracted3.length;
    while(l--) {param3 = a.parameter.replace(param3, extracted3[l]);}
    assert.strictEqual(param3, 
        'The last (\\w+) but not least ([^a-fA-F]+)', 'Test replace');

    l = extracted4.length;
    while(l--) {param4 = a.parameter.replace(param4, extracted4[l]);}
    assert.strictEqual(param4, 
    'But this one don\'t work {{worknot}} and also this one too {{oups : @ok}}'
    , 'Test replace');

    // Now we test with replacer
    l = extracted1.length;
    while(l--) {e1 = a.parameter.replace(e1, extracted1[l], 'a');}
    assert.strictEqual(e1, 'this is a string with a and also a', 'Test replace');

    l = extracted2.length;
    while(l--) {e2 = a.parameter.replace(e2, extracted2[l], 'a');}
    assert.strictEqual(e2, 'another a and also a', 'Test replace');

    l = extracted3.length;
    while(l--) {e3 = a.parameter.replace(e3, extracted3[l], 'a');}
    assert.strictEqual(e3, 'The last a but not least a', 'Test replace');

    l = extracted4.length;
    while(l--) {e4 = a.parameter.replace(e4, extracted4[l], 'a');}
    assert.strictEqual(e4, 
    'But this one don\'t work {{worknot}} and also this one too {{oups : @ok}}'
    , 'Test replace');
});

// Testing extrapolate data from content
QUnit.test('a.parameter.extrapolate-old-unittest', function(assert) {
    assert.expect(6);

    var t1 = [
            'This test need to be {{hash : type}} to be ' +
            'replaced but not {{everywhere}}',
            'current-hash-ab-yes',
            'current-hash-{{type : [ab]+}}-yes'
        ],
        t2 = [
            'Also this one should {{hash : not}} be parsed ' +
            'because {{hash : it}} does not exist',
            'yatta',
            '{{it : [a-z]+}}'
        ],
        t3 = [
            'This one does use {{store : unittest_memory}} internal mem',
            'yatta',
            '{{memory : [a-z]+}}'
        ],
        t4 = [
            'This one is limited to {{temporary : unittest_mem}} storage',
            'yatta',
            '{{memory : [a-z]+}}'
        ],
        t5 = [
            'And that one is {{cookie : unittest_ok}} land',
            'yatta',
            '{{memory : [a-z]+}}'
        ],
        t6 = [
            'And that one is {{root_test}} using direct binding',
            'yatta',
            '{{root_test : [a-z]+}}'
        ];

    // Setting storage item to use right after
    a.storage.persistent.set('unittest_memory', 'ppp1');
    a.storage.temporary.set('unittest_mem', 'ppp2');
    a.storage.cookie.set('unittest_ok', 'ppp3');

    // Now we do unit test
    var r1 = a.parameter.extrapolate(t1[0], t1[1], t1[2]);
    var r2 = a.parameter.extrapolate(t2[0], t2[1], t2[2]);
    var r3 = a.parameter.extrapolate(t3[0], t3[1], t3[2]);
    var r4 = a.parameter.extrapolate(t4[0], t4[1], t4[2]);
    var r5 = a.parameter.extrapolate(t5[0], t5[1], t5[2]);
    var r6 = a.parameter.extrapolate(t6[0], t6[1], t6[2]);

    assert.strictEqual(r1, 
        'This test need to be ab to be replaced but not {{everywhere}}', 
        'Test result');
    assert.strictEqual(r2, 
'Also this one should {{hash : not}} be parsed because yatta does not exist',
        'Test result');
    assert.strictEqual(r3, 'This one does use ppp1 internal mem', 'Test result');
    assert.strictEqual(r4, 'This one is limited to ppp2 storage', 'Test result');
    assert.strictEqual(r5, 'And that one is ppp3 land', 'Test result');
    assert.strictEqual(r6, 'And that one is yatta using direct binding', 
                        'Test result');
});

// Test a pretty complex one
QUnit.test('a.parameter.extrapolate-complex-old-unittest', function(assert) {
    assert.expect(1);

    var test = [
        'http://localhost/Bugs/project/{{projectId}}/bug/{{bugId}}',
        'bugs-51cc10cd9b2b60ec50897d99-51cc10cd9b2b60ec50897d96',
        '{{type : [a-zA-Z0-9]*}}-{{projectId : [a-fA-F0-9]+}}' +
        '{{separator : -?}}{{bugId : .*}}'
    ];

    var result = a.parameter.extrapolate(test[0], test[1], test[2])

    assert.strictEqual(result, 'http://localhost/Bugs/project/' +
            '51cc10cd9b2b60ec50897d99/bug/51cc10cd9b2b60ec50897d96');
});

// Same hash test as appstorm does into state plugin
QUnit.test('a.parameter.hash', function(assert) {
    assert.expect(3);

    var reg = new RegExp('^/dashboard/group/([a-fA-F0-9]+)$', 'g');

    assert.strictEqual(reg.test('/dashboard/group/aaaa'), true);
    assert.strictEqual(reg.test('/dashboard/group/create'), false);
    assert.strictEqual(reg.test('/dashboard/group/aaaa/bbb'), false);
});






// Test parameter getValues
QUnit.test('a.parameter.getValues-begin', function(assert) {
    assert.expect(2);

    var begin = '{{super: [a-f0-9]+}}/something';
    var extrapolate = a.parameter.extract(begin);
    var test = a.parameter.getValues('abcdef19/something', begin, extrapolate);

    assert.strictEqual(test[0].name, 'super');
    assert.strictEqual(test[0].value, 'abcdef19');
});

// Test parameter getValues
QUnit.test('a.parameter.getValues-simple', function(assert) {
    assert.expect(2);

    var end = '/dashboard/{{another: \\d+}}';
    var extrapolate = a.parameter.extract(end);

    var test = a.parameter.getValues('/dashboard/134', end, extrapolate);

    assert.strictEqual(test[0].name, 'another');
    assert.strictEqual(test[0].value, '134');
});

// Test parameter getValues
QUnit.test('a.parameter.getValues-complex', function(assert) {
    assert.expect(4);

    var test = '/dashboard/{{groupId: [a-fA-F0-9]+}}/note/{{noteId: \\w+}}';
    var extrapolate = a.parameter.extract(test);
    var test = a.parameter.getValues('/dashboard/ab12/note/hello', test, extrapolate);

    assert.strictEqual(test[0].name, 'groupId');
    assert.strictEqual(test[0].value, 'ab12');
    assert.strictEqual(test[1].name, 'noteId');
    assert.strictEqual(test[1].value, 'hello');
});

QUnit.test('a.parameter.extrapolate-from-memory', function(assert) {
    assert.expect(1);

    a.storage.memory.set('current.depose.mandatoryId', 'hithere');

    var url = 'ws/depose/box/{{memory: current.depose.mandatoryId}}/file',
        hash = '/kld/sessions/544fc14178d61f1c5c719768/electre/result',
        internal = 'ws/depose/box/{{memory: current.depose.mandatoryId}}/file';

    var extrapolate = a.parameter.extrapolate(url, hash, internal);

    assert.strictEqual(extrapolate, 'ws/depose/box/hithere/file');

    a.storage.memory.remove('current.depose.mandatoryId');
});