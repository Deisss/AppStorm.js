// Unit test for a.language (plugin)

module("PLUGIN/language");

/*
---------------------------------
  CURRENT LANGUAGE RELATED
---------------------------------
*/
(function() {
	// First : we keep data setted by user, the system may be already in use...
	var userCurrent = a.language.getCurrent();

	// Test in general case, the setCurrent works, try to create some translate test from that
	test("a.language.current-working", function() {
		a.language.clear();

		a.language.addSingleTranslation("en", "somehash", "This is working", false);
		a.language.addSingleTranslation("de", "somehash", "dies funktioniert", false);

		a.language.setCurrent("en", false);

		strictEqual(a.language.getSingleTranslation("somehash"), "This is working", "Test english translate");

		a.language.setCurrent("de", false);

		strictEqual(a.language.getSingleTranslation("somehash"), "dies funktioniert", "Test deutch translate");
	});

	// Test sending not string, or empty string, is refused
	test("a.language.current-non-string", function() {
		a.console.clear();

		// Setting an array as default language raise an error
		a.language.setCurrent([], false);

		var trace = a.console.trace();
		var error = trace["error"].pop();

		strictEqual(error, "a.language.setCurrent: setting a non-string lang, or empty string, as default language: ", "Test non-string value is refused");

		a.console.clear();

		a.language.setCurrent("", false);

		trace = a.console.trace();
		error = trace["error"].pop();

		strictEqual(error, "a.language.setCurrent: setting a non-string lang, or empty string, as default language: ", "Test non-string value is refused");
	});

	// Test sending a valid, but not existing language inside 'allowed', will raise a warning, but works
	test("a.language.current-non-existing", function() {
		a.console.clear();

		a.language.setCurrent("some-undefined", false);

		var trace = a.console.trace();
		var warn = trace["warn"].pop();

		strictEqual(warn, "a.language.setCurrent: unable to find language in available language list (value: some-undefined, available: " + a.language.getAllowed().join(";") + ")", "Test language warning");

		strictEqual(a.language.getCurrent(), "some-undefined", "Test language set");
		deepEqual(a.language.getTranslation("some-undefined"), {}, "Test language created on dictionnary");
	});

	// This test is not always valid (depends if user storage is OK or not)
	if(!a.storage.support) {
		testSkip("a.language.current.storage (STORAGE NOT SUPPORTED)");
	} else {
		test("a.language.current.storage", function() {
			a.language.setCurrent("unittest-storage", false);
			var storageCurrent = a.storage.getItem("a_language_store_language");

			// Test system does not already contains unit test
			strictEqual(storageCurrent, "unittest-storage", "Test unit test setted");

			a.language.setCurrent("unittest-storage2", false);

			// Now we compare again
			var afterStorage = a.storage.getItem("a_language_store_language");

			strictEqual(afterStorage, "unittest-storage2", "Test the latest language has been taken in consideration");
		});
	}

	// We go back to previous situation
	a.language.setCurrent(userCurrent, false);
})();





/*
---------------------------------
  ALLOWED LANGUAGE RELATED
---------------------------------
*/
(function() {
	// First : we keep data setted by user, the system may be already in use...
	var userAllowed = a.language.getAllowed();


	// Basic test (default one)
	test("a.language.allowed-working", function() {
		// Duplicate array
		var secondTry = userAllowed.slice();
		strictEqual(a.contains(secondTry, "unittest"), false, "Test unit test does not already define allowed");

		// Define new language
		secondTry.push("unittest");
		a.language.setAllowed(secondTry);

		var result = a.language.getAllowed();
		strictEqual(a.contains(result, "unittest"), true, "Test unit test define a new language allowed");
	});


	// Test single string as allowed
	test("a.language.allowed-string", function() {
		// Now we try to set a single string as allowed
		a.language.setAllowed("en");
		strictEqual(a.language.getAllowed().length, 1, "Test single string is ok as allowed type");
	});


	// Test non array (object) not working
	test("a.language.allowed-invalid", function() {
		var obj = {};
		obj.ok = "ok";
		obj.two = "two";

		a.language.setAllowed(obj);
		strictEqual(a.contains(a.language.getAllowed(), "two"), false, "Test object is not allowed type for allowed");

		// Test console output
		var cs = a.console.trace();
		var error = cs["error"].pop();

		ok(error.indexOf("a.language.setAllowed: the allowed language must be an Array") > -1, "Testing console output");
	});


	// This test is not always valid (depends if user storage is OK or not)
	if(!a.storage.support) {
		testSkip("a.language.allowed.storage (STORAGE NOT SUPPORTED)");
	} else {
		test("a.language.allowed.storage", function() {
			var storageAllowed = a.storage.getItem("a_language_store_allowed");

			// Test system does not already contains unit test
			strictEqual(a.contains(userAllowed, "newlang"), false, "Test unit test does not already define allowed");

			ok(storageAllowed instanceof Array, "Test allowed is instance of an array");

			// we add a dummy language and store it again
			storageAllowed.push("newlang");
			a.language.setAllowed(storageAllowed);

			// Now we compare again
			var afterStorage = a.storage.getItem("a_language_store_allowed");

			strictEqual(afterStorage.pop(), "newlang", "Test the latest language has been taken in consideration");
		});
	}

	// We delete newlang if there is inside
	for(var i=userAllowed.length - 1; i >= 0; --i) {
		if(userAllowed[i] === "newlang") {
			userAllowed.splice(i, 1);
		}
	}
	// We go back to previous situation
	a.language.setAllowed(userAllowed);
})();




/*
---------------------------------
  SINGLE TRANSLATE RELATED
---------------------------------
*/
// We do some basic test with addSingle, getSingle...
test("a.language.single-working", function() {
	a.language.clear();

	// We set two times the same translate, to be sure system override correctly
	a.language.addSingleTranslation("unittest-lang1", "hash1", "The wrong translate", false);
	a.language.addSingleTranslation("unittest-lang1", "hash1", "The first translate", false);

	// We check console to check language is not defined
	var cs = a.console.trace();
	var warn = cs["warn"].pop();

	strictEqual(warn, "a.language.addSingleTranslation: be carefull, the language you submit does not seems to exist in dict (value: unittest-lang1, dict: " + a.language.getAllowed().join(";") + ")", "Test warning raised on new language added");

	a.language.addSingleTranslation("unittest-lang2", "hash1", "The second translate", false);
	a.language.addSingleTranslation("unittest-lang3", "hash1", "The thrid translate", false);

	a.language.addSingleTranslation("unittest-lang1", "hash2", "Another first translate", false);
	a.language.addSingleTranslation("unittest-lang2", "hash2", "Another second translate", false);
	a.language.addSingleTranslation("unittest-lang3", "hash2", "Another thrid translate", false);

	a.language.setCurrent("unittest-lang1");

	strictEqual(a.language.getSingleTranslation("hash1"), "The first translate", "Test language translation");
	strictEqual(a.language.getSingleTranslation("hash2"), "Another first translate", "Test language translation");

	a.language.setCurrent("unittest-lang3");

	strictEqual(a.language.getSingleTranslation("hash1"), "The thrid translate", "Test language translation");
	strictEqual(a.language.getSingleTranslation("hash2"), "Another thrid translate", "Test language translation");

	// Test null hash value return the hash
	strictEqual(a.language.getSingleTranslation("unusedhash"), "unusedhash", "Test not hash translation");
});

// Test setting a complex key and see the result
test("a.language.single-complex", function() {
	var complexKey = "I'm a teapot; and I should not be refused";
	var value = "ok";

	a.language.addSingleTranslation("unittest-complex1", complexKey, value, false);
	a.language.setCurrent("unittest-complex1");

	strictEqual(a.language.getSingleTranslation(complexKey), value, "Test complex key passes");
});

// Test data binding inside translate system
test("a.language.single-variable", function() {
	a.language.clear();

	a.language.addSingleTranslation("unittest-lang1", "hash1", "The first {{name}} translate for {{user}} directory", false);
	a.language.addSingleTranslation("unittest-lang1", "hash2", "The first {{1}} translate for {{2}} directory", false);
	a.language.addSingleTranslation("unittest-lang2", "hash1", "The second {{name}} translate for {{user}} directory", false);
	a.language.addSingleTranslation("unittest-lang2", "hash2", "The second {{1}} translate for {{2}} directory", false);

	var fullVar = {
		name : "system",
		user : "Roger"
	};
	var emptyVar = {};

	var fullArrVar = ["system", "Roger"],
		emptyArrVar = [];

	a.language.setCurrent("unittest-lang1");

	// Performing some test on variable system (working as expected)
	strictEqual(a.language.getSingleTranslation("hash1", emptyVar), "The first  translate for  directory", "Test empty var remove var code from string");
	strictEqual(a.language.getSingleTranslation("hash2", emptyArrVar), "The first  translate for  directory", "Test empty var remove var code from string");
	strictEqual(a.language.getSingleTranslation("hash1", fullVar), "The first system translate for Roger directory", "Test full var replace as expected inside string");
	strictEqual(a.language.getSingleTranslation("hash2", fullArrVar), "The first system translate for Roger directory", "Test full var replace as expected inside string");

	a.language.setCurrent("unittest-lang2");

	// Performing some test on variable system (working as expected)
	strictEqual(a.language.getSingleTranslation("hash1", emptyVar), "The second  translate for  directory", "Test empty var remove var code from string");
	strictEqual(a.language.getSingleTranslation("hash2", emptyArrVar), "The second  translate for  directory", "Test empty var remove var code from string");
	strictEqual(a.language.getSingleTranslation("hash1", fullVar), "The second system translate for Roger directory", "Test full var replace as expected inside string");
	strictEqual(a.language.getSingleTranslation("hash2", fullArrVar), "The second system translate for Roger directory", "Test full var replace as expected inside string");
});


/*
---------------------------------
  TRANSLATE RELATED
---------------------------------
*/
// We try to set language directly in a single function call
test("a.language.translation", function() {
	var dictEnglish = {
		hash1 : "the hash1 english version",
		hash2 : "the hash2 english version",
		hash3 : "the hash3 english version"
	};
	var dictFrench = {
		hash1 : "la version francaise de hash1",
		hash5 : "la version francaise de hash5",
		hash3 : "la version francaise de hash3"
	};

	a.language.addTranslation("en", dictEnglish, false);
	a.language.addTranslation("fr", dictFrench, false);

	// We test language get
	var resultEnglish = a.language.getTranslation("en");
	var resultFrench = a.language.getTranslation("fr");

	deepEqual(dictEnglish, resultEnglish, "Test english translate setted");
	deepEqual(dictFrench, resultFrench, "Test french translate setted");

	// We test global get
	var result = a.language.getTranslation();

	deepEqual(result["en"], dictEnglish, "Test global translate");
	deepEqual(result["fr"], dictFrench, "Test global translate");

	// Test translate
	a.language.setCurrent("en", false);
	strictEqual(a.language.getSingleTranslation("hash1"), "the hash1 english version", "Test translate apply");
	strictEqual(a.language.getSingleTranslation("hash2"), "the hash2 english version", "Test translate apply");
	strictEqual(a.language.getSingleTranslation("hash3"), "the hash3 english version", "Test translate apply");
	strictEqual(a.language.getSingleTranslation("hash5"), "hash5", "Test translate apply");

	a.language.setCurrent("fr", false);
	strictEqual(a.language.getSingleTranslation("hash1"), "la version francaise de hash1", "Test translate apply");
	strictEqual(a.language.getSingleTranslation("hash2"), "hash2", "Test translate apply");
	strictEqual(a.language.getSingleTranslation("hash3"), "la version francaise de hash3", "Test translate apply");
	strictEqual(a.language.getSingleTranslation("hash5"), "la version francaise de hash5", "Test translate apply");
});


// In the translate test we apply translate to two types of elements : a createElement one, and an existing page elements
test("a.language.translate-working", function() {
	a.language.clear();

	var id = "unittest-translate-working";

	// First we setup environment
	a.language.addSingleTranslation("en", "home", "Home", false);
	a.language.addSingleTranslation("de", "home", "Zuhause", false);

	// We create element
	var el = document.createElement("a");
	el.id = id;
	el.style.display = "none";
	el.setAttribute("data-tr", "home");
	document.body.appendChild(el);

	// We create an element, but we DONT add it to html page, we ask for translate manually
	var notIncluded = document.createElement("a");
	notIncluded.setAttribute("data-tr", "home");

	// We apply language, and ask for system refresh (by not setting noUpdate to false)
	a.language.setCurrent("en");
	a.language.translate(notIncluded);
	strictEqual(document.getElementById(id).innerHTML, "Home", "Test auto apply value");
	strictEqual(notIncluded.innerHTML, "Home", "Test auto apply value");

	a.language.setCurrent("de");
	a.language.translate(notIncluded);
	strictEqual(document.getElementById(id).innerHTML, "Zuhause", "Test auto apply value");
	strictEqual(notIncluded.innerHTML, "Zuhause", "Test auto apply value");
});


// In the translate process, a sub element with a parent translated, will not be altered...
test("a.language.translate-subelement", function() {
	a.language.clear();

	var id = "unittest-translate-subelement";

	// First we setup environment
	a.language.addSingleTranslation("en", "subelement", "subelementcontent", false);
	a.language.addSingleTranslation("fr", "subelement", "translatedsub", false);

	var el = document.createElement("p");
	el.id = id;
	el.style.display = "none";
	el.setAttribute("data-tr", "subelement");

	var text = document.createTextNode("previous-translated");
	el.appendChild(text);

	var subelement = document.createElement("a");
	subelement.id = id + "aa";
	subelement.appendChild(document.createTextNode("not translated"));
	el.appendChild(subelement);

	document.body.appendChild(el);

	function __extractDirectText(el) {
		var child = el.childNodes,
			res = "";
		for(var i=0, l=child.length; i<l; ++i) {
			if(child[i].nodeType === 3) {
				res += child[i].nodeValue;
			}
		}
		return res;
	};

	a.language.setCurrent("fr");
	strictEqual(document.getElementById(id + "aa").innerHTML, "not translated", "test sub elements does still exist and are not affected");
	strictEqual(__extractDirectText(document.getElementById(id)), "translatedsub", "test root element is translated");

	a.language.setCurrent("en");
	strictEqual(document.getElementById(id + "aa").innerHTML, "not translated", "test sub elements does still exist and are not affected");
	strictEqual(__extractDirectText(document.getElementById(id)), "subelementcontent", "test root element is translated");
});


// In this test we try to translate with variable included inside dom
test("a.language.translate-variable", function() {
	a.language.clear();

	var id = "unittest-translate-variable";

	// First we setup environment
	a.language.addSingleTranslation("en", "welc", "Welcome {{name}}", false);
	a.language.addSingleTranslation("de", "welc", "Willkommen {{name}}", false);

	var el = document.createElement("a");
	el.id = id;
	el.style.display = "none";
	el.setAttribute("data-tr", "welc");
	// We add a variable to this one
	el.setAttribute("data-tr-name", "Remi");
	document.body.appendChild(el);

	a.language.setCurrent("en");
	strictEqual(document.getElementById(id).innerHTML, "Welcome Remi", "Test auto apply value");

	a.language.setCurrent("de");
	strictEqual(document.getElementById(id).innerHTML, "Willkommen Remi", "Test auto apply value");
});


// Test global variable support
test("a.language.global-variable", function() {
	a.language.clear();

	a.language.addSingleTranslation("en", "welcome", "Welcome {{name}}", false);
	a.language.addSingleTranslation("en", "welcome2", "Welcome {{name-store}}", false);

	// We try to translate from store or not
	a.language.setCurrent("en");

	// Test with nothing
	strictEqual(a.language.getSingleTranslation("welcome"), "Welcome ", "Test without variable");
	strictEqual(a.language.getSingleTranslation("welcome2"), "Welcome ", "Test without variable");

	// Test with store setted
	a.language.addVariable("name-store", "from store");
	strictEqual(a.language.getSingleTranslation("welcome"), "Welcome ", "Test with global variable");
	strictEqual(a.language.getSingleTranslation("welcome2"), "Welcome from store", "Test with global variable");

	// Test override with local variable
	strictEqual(a.language.getSingleTranslation("welcome", {"name" : "no store"}), "Welcome no store", "Test with global variable");
	strictEqual(a.language.getSingleTranslation("welcome2", {"name-store" : "no store"}), "Welcome no store", "Test with global variable");
});


// Check if we change the translate for a cutom element tag, the system apply it as expected
test("a.language.translate-attr", function() {
	a.language.clear();

	var id = "unittest-translate-attr";

	a.language.addSingleTranslation("en", "welcome", "This is title populated", false);
	a.language.setCurrent("en");

	var el = document.createElement("a");
	el.id = id;
	el.style.display = "none";
	el.setAttribute("data-tr", "welcome");
	el.setAttribute("data-tr-attr", "title");
	document.body.appendChild(el);

	a.language.setCurrent("en");
	strictEqual(document.getElementById(id).title, "This is title populated", "Test title value");

	a.language.clear();
});