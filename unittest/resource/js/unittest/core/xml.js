// Unit test for a.parser.xml

module("CORE");

// Testing xml parse
test("a.parser.xml.parse", function() {
	var xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += "<node><something>ok</something><another>yatta</another></node>";

	var doc = a.parser.xml.parse(xml);

	strictEqual(doc.getElementsByTagName("something")[0].childNodes[0].nodeValue, "ok", "Test first xml value");
	strictEqual(doc.getElementsByTagName("another")[0].childNodes[0].nodeValue, "yatta", "Test first xml value");
});

// Testing xml stringify
test("a.parser.xml.stringify", function() {
	var xml = "<node><something>ok</something><another>yatta</another></node>";

	var doc = a.parser.xml.parse(xml);

	var stringify = a.parser.xml.stringify(doc);
	// Removing line brakes
	stringify = stringify.replace(/(\r\n|\n|\r)/gm, "");
	// Remove xml tag (appends on Opera browser)
	stringify = stringify.replace("<?xml version=\"1.0\"?>", "");

	// On some system (Internet explorer), the encoding is removed...
	strictEqual(stringify, xml, "Test stringified value from original one");
});