// Unit test for a.page (plugin)

module("PLUGIN/page");

// Test the hash event
test("a.page.event.hash", function() {
	stop();
	expect(2);

	var o = ok,
		st = start;

	var check = function() {
		o(1==1);
	};

	a.message.addListener("a.page.event.hash", check);

	setTimeout(function() {
		window.location.href = "#unittest1";
	}, 200);

	// Old browser will need a little wait...
	setTimeout(function() {
		window.location.href = "#unittest2";
	}, 600);

	// Restore sync state when ready
	setTimeout(function() {
		a.message.removeListener("a.page.event.hash", check);
		window.location.href = "#";
		st();
	}, 1000);
});




// Test template system, including translate one
test("a.page.template.get-working", function() {
	stop();
	expect(1);

	var data = {};

	var se = strictEqual,
		st = start;

	a.page.template.get("./resource/data/page.template/tmpl1.html", data, function(content) {
		se(content, "<a>ok</a>", "Test basic template loading");
		st();
	});
});

// Test non-XHTML compatible is refused (for now)
test("a.page.template.get-notworking", function() {
	stop();
	expect(1);

	var data = {};

	var se = strictEqual,
		st = start;

	// On IE : an exception will be raised
	var time = setTimeout(function() {
		se(true, true);
		st();
	}, 500);

	a.page.template.get("./resource/data/page.template/tmpl-notxhtml.html", data, function(content) {
		// Depends on system, it may be null or undefined
		se(content, "<a>ok<a>", "Test basic template not compatible XHTML is refused");
		clearTimeout(time);
		st();
	});
});

// Test translation system is parsing content as expected BEFORE loading html
test("a.page.template.get-translation", function() {
	stop();
	expect(2);

	var data = {};
	var se = strictEqual,
		st = start;

	var userLanguage = a.language.getCurrent();

	// Add translate, put good language
	a.language.addSingleTranslation("unittest", "welcome", "The welcome page", false);
	a.language.setCurrent("unittest", false);

	a.page.template.get("./resource/data/page.template/tmpl-translation.html", data, function(content) {
		se(content, '<div id="unittest-tmpl-translation" style="display:none"><a data-tr="welcome"></a></div>', "Test content loaded");

		a.page.template.append(document.body, content);
		se(document.getElementById("unittest-tmpl-translation").getElementsByTagName("a")[0].childNodes[0].nodeValue, "The welcome page", "Test basic template loading");
		st();

		// Going back to default
		a.language.setCurrent(userLanguage);
	});
});

// Test using HTML data to change content (Mustache.JS test)
test("a.page.template.get-data", function() {
	stop();
	expect(1);

	var data = {
		name : "Charles",
		project : "AppStorm.JS"
	};
	var se = strictEqual,
		st = start;

	a.page.template.get("./resource/data/page.template/tmpl-data.html", data, function(content) {
		a.page.template.append(document.body, content);
		se(document.getElementById("unittest-tmpl-data").getElementsByTagName("a")[0].childNodes[0].nodeValue, "The project AppStorm.JS has been created by Charles", "Test basic template loading");
		st();
	});
});

// Test using both data and translate, on a complex system
test("a.page.template.get-complex", function() {
	stop();
	expect(4);

	var data = {
		"stooges": [
			{ "name": "Moe" },
			{ "name": "Larry" },
			{ "name": "Curly" }
		]
	};

	var userLanguage = a.language.getCurrent();

	var se = strictEqual,
		st = start;

	// Add translate, put good language
	a.language.addSingleTranslation("unittest1", "stooges", "One of the member was {{name}}", false);
	a.language.addSingleTranslation("unittest2", "stooges", "Other language said it was {{name}}", false);
	a.language.setCurrent("unittest1", false);

	a.page.template.get("./resource/data/page.template/tmpl-complex.html", data, function(content) {
		a.page.template.append(document.body, content);

		content = document.getElementById("unittest-tmp-complex");
		se(content.getElementsByTagName("a")[0].childNodes[0].nodeValue, "One of the member was Moe", "Test basic template loading");
		se(content.getElementsByTagName("a")[1].childNodes[0].nodeValue, "One of the member was Larry", "Test basic template loading");

		a.language.setCurrent("unittest2", false);
		// Manually translate because element is not existing in DOM, only in memory
		a.language.translate(content);

		se(content.getElementsByTagName("a")[0].childNodes[0].nodeValue, "Other language said it was Moe", "Test basic template loading");
		se(content.getElementsByTagName("a")[1].childNodes[0].nodeValue, "Other language said it was Larry", "Test basic template loading");

		// Going back to default
		a.language.setCurrent(userLanguage);
		st();
	});
});

// Test template system, including translate one
test("a.page.template.replace-working", function() {
	stop();
	expect(1);

	var id = "a.page.template.replace-working";
	var data = {};

	// First we create an element into DOM
	var el = document.createElement("div");
	el.id = id;
	el.style.display = "none";
	document.body.appendChild(el);

	var se = strictEqual,
		st = start;

	var result = document.getElementById(id);

	// Now we load resource
	a.page.template.get("./resource/data/page.template/tmpl1.html", data, function(content) {
		a.page.template.replace(result, content, function() {
			se(result.getElementsByTagName("a")[0].innerHTML, "ok", "Test content replaced");
			st();
		});
	});
});

// Test replace with translate before replace, and also after replace to DOM
test("a.page.template.replace-translation", function() {
	stop();
	expect(1);

	var id = "a.page.template.replace-translation";
	var data = {};

	// First we create an element into DOM
	var el = document.createElement("div");
	el.id = id;
	el.style.display = "none";
	document.body.appendChild(el);

	var se = strictEqual,
		st = start;

	var userLanguage = a.language.getCurrent();
	var result = document.getElementById(id);

	// Add translate, put good language
	a.language.addSingleTranslation("unittest", "welcome", "The welcome page", false);
	a.language.setCurrent("unittest", false);

	a.page.template.get("./resource/data/page.template/tmpl-translation.html", data, function(content) {
		a.page.template.replace(result, content, function() {
			se(result.getElementsByTagName("a")[0].childNodes[0].nodeValue, "The welcome page", "Test basic template loading");
			st();

			// Going back to default
			a.language.setCurrent(userLanguage);
		});
	});
});

// Test a complex system (with translate, list & co)
test("a.page.template.replace-complex", function() {
	stop();
	expect(4);

	var id = "a.page.template.replace-complex";
	var data = {
		"stooges": [
			{ "name": "Moe" },
			{ "name": "Larry" },
			{ "name": "Curly" }
		]
	};

	// First we create an element into DOM
	var el = document.createElement("div");
	el.id = id;
	el.style.display = "none";
	document.body.appendChild(el);

	var userLanguage = a.language.getCurrent();

	var se = strictEqual,
		st = start;

	// Add translate, put good language
	a.language.addSingleTranslation("unittest1", "stooges", "One of the member was {{name}}", false);
	a.language.addSingleTranslation("unittest2", "stooges", "Other language said it was {{name}}", false);
	a.language.setCurrent("unittest1", false);

	var result = document.getElementById(id);

	a.page.template.get("./resource/data/page.template/tmpl-complex.html", data, function(content) {
		a.page.template.replace(result, content, function() {
			se(result.getElementsByTagName("a")[0].childNodes[0].nodeValue, "One of the member was Moe", "Test basic template loading");
			se(result.getElementsByTagName("a")[1].childNodes[0].nodeValue, "One of the member was Larry", "Test basic template loading");

			a.language.setCurrent("unittest2", false);
			// Manually translate because element is not existing in DOM, only in memory
			a.language.translate();

			se(result.getElementsByTagName("a")[0].childNodes[0].nodeValue, "Other language said it was Moe", "Test basic template loading");
			se(result.getElementsByTagName("a")[1].childNodes[0].nodeValue, "Other language said it was Larry", "Test basic template loading");

			// Going back to default
			a.language.setCurrent(userLanguage);
			st();
		});
	});
});



// Test template system, append two template to same id (we reuse replace-working)
test("a.page.template.append-working", function() {
	stop();
	expect(2);

	// We reuse item created previously
	var id = "a.page.template.replace-working";
	var result = document.getElementById(id);
	var data = {};

	var se = strictEqual,
		st = start;

	a.page.template.get("./resource/data/page.template/tmpl-append.html", data, function(content) {
		a.page.template.append(result, content, function() {
			// Test from working
			se(result.getElementsByTagName("a")[0].innerHTML, "ok", "Test content append");
			// New test
			se(result.getElementsByTagName("span")[0].innerHTML, "append", "Test content append");
			st();
		});
	});
});

// Test translation system, append two template on same id (we reuse replace-translate)
test("a.page.template.append-translation", function() {
	stop();
	expect(2);

	var id = "a.page.template.replace-translation";
	var data = {};

	var se = strictEqual,
		st = start;

	var userLanguage = a.language.getCurrent();
	var result = document.getElementById(id);

	// Add translate, put good language
	a.language.addSingleTranslation("unittest", "welcome", "The welcome page", false);
	a.language.setCurrent("unittest");

	a.page.template.get("./resource/data/page.template/tmpl-append.html", data, function(content) {
		a.page.template.append(result, content, function() {
			// Test from translation
			se(result.getElementsByTagName("a")[0].childNodes[0].nodeValue, "The welcome page", "Test basic template loading");
			// New test (no need to change : the data is not translated here)
			se(result.getElementsByTagName("span")[0].innerHTML, "append", "Test content append");

			st();

			// Going back to default
			a.language.setCurrent(userLanguage);
		});
	});
});

// Test appending to a complex system, another complex system, works.
test("a.page.template.append-complex", function() {
	stop();
	expect(8);

	var id = "a.page.template.replace-complex";
	var data = {
		"section": [
			{ "label": "Physics" },
			{ "label": "Math" }
		]
	};

	var userLanguage = a.language.getCurrent();

	var se = strictEqual,
		st = start;

	// Add translate, put good language
	a.language.addSingleTranslation("unittest1", "stooges", "One of the member was {{name}}", false);
	a.language.addSingleTranslation("unittest1", "woot", "He study in {{label}}", false);
	a.language.addSingleTranslation("unittest2", "stooges", "Other language said it was {{name}}", false);
	a.language.addSingleTranslation("unittest2", "woot", "Another stydy in {{label}}", false);
	a.language.setCurrent("unittest1");

	var result = document.getElementById(id);

	a.page.template.get("./resource/data/page.template/tmpl-append-complex.html", data, function(content) {
		a.page.template.append(result, content, function() {
			se(result.getElementsByTagName("a")[0].childNodes[0].nodeValue, "One of the member was Moe", "Test basic template loading");
			se(result.getElementsByTagName("a")[1].childNodes[0].nodeValue, "One of the member was Larry", "Test basic template loading");
			se(result.getElementsByTagName("span")[0].childNodes[0].nodeValue, "He study in Physics", "Test basic template loading");
			se(result.getElementsByTagName("span")[1].childNodes[0].nodeValue, "He study in Math", "Test basic template loading");

			a.language.setCurrent("unittest2");
			// Manually translate because element is not existing in DOM, only in memory
			a.language.translate();

			se(result.getElementsByTagName("a")[0].childNodes[0].nodeValue, "Other language said it was Moe", "Test basic template loading");
			se(result.getElementsByTagName("a")[1].childNodes[0].nodeValue, "Other language said it was Larry", "Test basic template loading");
			se(result.getElementsByTagName("span")[0].childNodes[0].nodeValue, "Another stydy in Physics", "Test basic template loading");
			se(result.getElementsByTagName("span")[1].childNodes[0].nodeValue, "Another stydy in Math", "Test basic template loading");

			// Going back to default
			a.language.setCurrent(userLanguage);
			st();
		});
	});
});


// Bug : using innerHTML remove onclick on sibbling children
// We do a workaround for that, but we have to be sure it will never come back
// Here is a test for.
test("a.page.template.children-sibling", function() {
	stop();
	expect(4);

	var se = strictEqual;

	// First : we create a dom element and add it to DOM
	var d = document.createElement("div");
	d.style.display = "none";
	document.body.appendChild(d);

	// Second : register two elements, with two onclick linked to
	var el1 = '<a id="sibling1"></a>',
		el2 = '<a id="sibling2"></a>';

	a.page.template.append(d, el1);
	document.getElementById("sibling1").onclick = function() {
		se(true, true, "test el1");
	};
	document.getElementById("sibling1").click();

	a.page.template.append(d, el2);
	document.getElementById("sibling2").onclick = function() {
		se(true, true, "test el2");
	};
	document.getElementById("sibling2").click();

	document.getElementById("sibling1").click();
	document.getElementById("sibling2").click();

	start();
});