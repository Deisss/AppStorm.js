// Unit test for a.parser.xml

QUnit.module('core/parser.js');

// Testing xml parse
QUnit.test('a.parser.xml.parse', function(assert) {
    assert.expect(2);

    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<node><something>ok</something><another>yatta</another></node>';

    var doc = a.parser.xml.parse(xml);

    assert.strictEqual(doc.getElementsByTagName('something')[0].childNodes[0]
                                    .nodeValue, 'ok', 'Test first xml value');
    assert.strictEqual(doc.getElementsByTagName('another')[0].childNodes[0]
                                .nodeValue, 'yatta', 'Test first xml value');
});

// Testing xml stringify
QUnit.test('a.parser.xml.stringify', function(assert) {
    assert.expect(1);

    var xml = '<node><something>ok</something><another>yatta</another></node>';

    var doc = a.parser.xml.parse(xml);

    var stringify = a.parser.xml.stringify(doc);
    // Removing line brakes
    stringify = stringify.replace(/(\r\n|\n|\r)/gm, '');
    // Remove xml tag (appends on Opera browser)
    stringify = stringify.replace('<?xml version="1.0"?>', '');

    // On some system (Internet explorer), the encoding is removed...
    assert.strictEqual(stringify, xml, 'Test stringified value from original one');
});