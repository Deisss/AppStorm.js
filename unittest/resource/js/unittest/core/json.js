// Unit test for a.parser.json

module("CORE");

// Test json parsing
test("a.parser.json.parse", function() {
	var json1 = '{"ok" : "hello"}',
		json2 = '{"system" : {"ok" : "hello", "second" : 4}}',
		json3 = '["a", "b", "c"]',
		fail1 = "{{{{";

	// Test working
	deepEqual(a.parser.json.parse(json1), {ok : "hello"}, "Testing parsing simple json");
	deepEqual(a.parser.json.parse(json2), {system : {ok : "hello", second : 4}}, "Testing parsing more complex json");
	deepEqual(a.parser.json.parse(json3), ["a", "b", "c"], "Testing parsing array");
	// Test fail
	strictEqual(a.parser.json.parse(fail1), null, "Testing wrong data give back a null value");
});

// Test json stringify
test("a.parser.json.stringify", function() {
	var obj1 = {
		ok : "hello"
	};
	var obj2 = {
		system : {
			ok : "hello",
			second : 4
		}
	};

	// Creating circular reference for testing failure
	var john = new Object();
	var mary = new Object();
	john.sister = mary;
	mary.brother = john;

	// Test working
	strictEqual(a.parser.json.stringify(obj1), '{"ok":"hello"}', "Testing stringify simple object");
	strictEqual(a.parser.json.stringify(obj2), '{"system":{"ok":"hello","second":4}}', "Testing stringify more complex object");
	// Test fail (sending null value to replacer make it not working at all...
	strictEqual(a.parser.json.stringify(john), "", "Testing wrong data give empty string");
});

