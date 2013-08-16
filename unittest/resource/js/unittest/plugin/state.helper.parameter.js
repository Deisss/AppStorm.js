// Unit test for a.state (plugin)

module("PLUGIN/state");

// Test extracting elements from system
test("a.state.helper.parameter.extract", function() {
	expect(26);

	var param1 = "this is a string with {{type :    [a-zA-Z0-9]?}} and also {{id : .*  }}",
		param2 = "another {{ example : \\d+}} and also {{this : a|b}}",
		param3 = "The last {{one : \\w+}} but not least {{invalidate : [^a-fA-F]+  }}",
		param4 = "But this one don't work {{worknot}} and also this one too {{oups : @ok}}";

	// Now we test extract system does work as expected
	var extracted1 = a.state.helper.parameter.extract(param1),
		extracted2 = a.state.helper.parameter.extract(param2),
		extracted3 = a.state.helper.parameter.extract(param3),
		extracted4 = a.state.helper.parameter.extract(param4);

	// Test tab length
	strictEqual(extracted1.length, 2, "Test length");
	strictEqual(extracted2.length, 2, "Test length");
	strictEqual(extracted3.length, 2, "Test length");
	strictEqual(extracted4.length, 0, "Test length");

	// Test content (name)
	strictEqual(extracted1[0]["name"], "type", "Test name");
	strictEqual(extracted1[1]["name"], "id", "Test name");
	strictEqual(extracted2[0]["name"], "example", "Test name");
	strictEqual(extracted2[1]["name"], "this", "Test name");
	strictEqual(extracted3[0]["name"], "one", "Test name");
	strictEqual(extracted3[1]["name"], "invalidate", "Test name");

	// Test content (original)
	strictEqual(extracted1[0]["original"], "{{type :    [a-zA-Z0-9]?}}", "Test original");
	strictEqual(extracted1[1]["original"], "{{id : .*  }}", "Test original");
	strictEqual(extracted2[0]["original"], "{{ example : \\d+}}", "Test original");
	strictEqual(extracted2[1]["original"], "{{this : a|b}}", "Test original");
	strictEqual(extracted3[0]["original"], "{{one : \\w+}}", "Test original");
	strictEqual(extracted3[1]["original"], "{{invalidate : [^a-fA-F]+  }}", "Test original");

	// Test content (regex)
	strictEqual(extracted1[0]["regex"], "[a-zA-Z0-9]?", "Test regex");
	strictEqual(extracted1[1]["regex"], ".*", "Test regex");
	strictEqual(extracted2[0]["regex"], "\\d+", "Test regex");
	strictEqual(extracted2[1]["regex"], "a|b", "Test regex");
	strictEqual(extracted3[0]["regex"], "\\w+", "Test regex");
	strictEqual(extracted3[1]["regex"], "[^a-fA-F]+", "Test regex");

	// Now we try custom regex behaviour to handle param4
	var rgx = /\{\{(\s*\w+\s*)\}\}/gmi;
	extracted4 = a.state.helper.parameter.extract(param4, rgx);

	// Now this time the worknot does work...
	strictEqual(extracted4.length, 1, "Test length");
	strictEqual(extracted4[0]["name"], "hash", "Test name");
	strictEqual(extracted4[0]["original"], "{{worknot}}", "Test original");
	strictEqual(extracted4[0]["regex"], "worknot", "Test regex");
});

// Testing the replace content system
test("a.state.helper.parameter.replace", function() {
	expect(8);

	var param1 = "this is a string with {{type :    [a-zA-Z0-9]?}} and also {{id : .*  }}",
		param2 = "another {{ example : \\d+}} and also {{this : a|b}}",
		param3 = "The last {{one : \\w+}} but not least {{invalidate : [^a-fA-F]+  }}",
		param4 = "But this one don't work {{worknot}} and also this one too {{oups : @ok}}";

	// For second unit test series
	var e1 = param1, e2 = param2, e3 = param3, e4 = param4;

	// Now we test extract system does work as expected
	var extracted1 = a.state.helper.parameter.extract(param1),
		extracted2 = a.state.helper.parameter.extract(param2),
		extracted3 = a.state.helper.parameter.extract(param3),
		extracted4 = a.state.helper.parameter.extract(param4);

	// Now we use default extract system, and check result
	var l = extracted1.length;
	while(l--) {param1 = a.state.helper.parameter.replace(param1, extracted1[l]);}
	strictEqual(param1, "this is a string with ([a-zA-Z0-9]?) and also (.*)", "Test replace");

	l = extracted2.length;
	while(l--) {param2 = a.state.helper.parameter.replace(param2, extracted2[l]);}
	strictEqual(param2, "another (\\d+) and also (a|b)", "Test replace");

	l = extracted3.length;
	while(l--) {param3 = a.state.helper.parameter.replace(param3, extracted3[l]);}
	strictEqual(param3, "The last (\\w+) but not least ([^a-fA-F]+)", "Test replace");

	l = extracted4.length;
	while(l--) {param4 = a.state.helper.parameter.replace(param4, extracted4[l]);}
	strictEqual(param4, "But this one don't work {{worknot}} and also this one too {{oups : @ok}}", "Test replace");

	// Now we test with replacer
	l = extracted1.length;
	while(l--) {e1 = a.state.helper.parameter.replace(e1, extracted1[l], "a");}
	strictEqual(e1, "this is a string with a and also a", "Test replace");

	l = extracted2.length;
	while(l--) {e2 = a.state.helper.parameter.replace(e2, extracted2[l], "a");}
	strictEqual(e2, "another a and also a", "Test replace");

	l = extracted3.length;
	while(l--) {e3 = a.state.helper.parameter.replace(e3, extracted3[l], "a");}
	strictEqual(e3, "The last a but not least a", "Test replace");

	l = extracted4.length;
	while(l--) {e4 = a.state.helper.parameter.replace(e4, extracted4[l], "a");}
	strictEqual(e4, "But this one don't work {{worknot}} and also this one too {{oups : @ok}}", "Test replace");
});

// Testing extrapolate data from content
test("a.state.helper.parameter.extrapolate", function() {
	expect(6);

	var t1 = [
			"This test need to be {{hash : type}} to be replaced but not {{everywhere}}",
			"current-hash-ab-yes",
			"current-hash-{{type : [ab]+}}-yes"
		],
		t2 = [
			"Also this one should {{hash : not}} be parsed because {{hash : it}} does not exist",
			"yatta",
			"{{it : [a-z]+}}"
		],
		t3 = [
			"This one does use {{store : unittest_memory}} internal mem",
			"yatta",
			"{{memory : [a-z]+}}"
		],
		t4 = [
			"This one is limited to {{temporary : unittest_mem}} storage",
			"yatta",
			"{{memory : [a-z]+}}"
		],
		t5 = [
			"And that one is {{cookie : unittest_ok}} land",
			"yatta",
			"{{memory : [a-z]+}}"
		],
		t6 = [
			"And that one is {{root_test}} using direct binding",
			"yatta",
			"{{root_test : [a-z]+}}"
		];

	// Setting storage item to use right after
	a.storage.persistent.setItem("unittest_memory", "ppp1");
	a.storage.temporary.setItem("unittest_mem", "ppp2");
	a.storage.cookie.setItem("unittest_ok", "ppp3");

	// Now we do unit test
	var r1 = a.state.helper.parameter.extrapolate(t1[0], t1[1], t1[2]);
	var r2 = a.state.helper.parameter.extrapolate(t2[0], t2[1], t2[2]);
	var r3 = a.state.helper.parameter.extrapolate(t3[0], t3[1], t3[2]);
	var r4 = a.state.helper.parameter.extrapolate(t4[0], t4[1], t4[2]);
	var r5 = a.state.helper.parameter.extrapolate(t5[0], t5[1], t5[2]);
	var r6 = a.state.helper.parameter.extrapolate(t6[0], t6[1], t6[2]);

	strictEqual(r1, "This test need to be ab to be replaced but not {{everywhere}}", "Test result");
	strictEqual(r2, "Also this one should {{hash : not}} be parsed because yatta does not exist", "Test result");
	strictEqual(r3, "This one does use ppp1 internal mem", "Test result");
	strictEqual(r4, "This one is limited to ppp2 storage", "Test result");
	strictEqual(r5, "And that one is ppp3 land", "Test result");
	strictEqual(r6, "And that one is yatta using direct binding", "Test result");
});

// Test a pretty complex one
test("a.state.helper.parameter.extrapolate-complex", function() {
	var test = [
		"http://localhost/Bugs/project/{{projectId}}/bug/{{bugId}}",
		"bugs-51cc10cd9b2b60ec50897d99-51cc10cd9b2b60ec50897d96",
		"{{type : [a-zA-Z0-9]*}}-{{projectId : [a-fA-F0-9]+}}{{separator : -?}}{{bugId : .*}}"
	];

	var result = a.state.helper.parameter.extrapolate(test[0], test[1], test[2])

	strictEqual(result, "http://localhost/Bugs/project/51cc10cd9b2b60ec50897d99/bug/51cc10cd9b2b60ec50897d96");
});