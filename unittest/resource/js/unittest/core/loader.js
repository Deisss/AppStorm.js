// Unit test for a.loader

module("CORE");

// Testing loading js file threw "script" tag
test("a.loader.js", function() {
	stop();
	expect(1);


	// Prevent scope change
	var se = strictEqual,
		st = start;

	/*
	 * We load a JS file, on this file there is a function not registrated right now
	 * Inside this function, it will call strictEqual needed to validate this test
	*/

	var success = function() {
		se(true, true, "JS file loading success");
		st();
	};

	// Loading file
	a.loader.js("./resource/data/loader/test.js", function() {
		unittest_load_js(success);
	});
});

// Testing loading jsonp file threw "script" tag
test("a.loader.jsonp", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	/*
	 * JSONP is almost the same as JS, 
	 * except success method has to be moved to 
	 * window scope (because it will be called from script directly)
	*/
	window.unittest_load_jsonp = function(content) {
		se(content.result, "ok", "JSONP file loading success");
		st();
	};

	// Loading file
	a.loader.jsonp("./resource/data/loader/test.jsonp");
});

// Testing loading json file threw ajax mode
test("a.loader.json", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	// Loading file
	a.loader.json("./resource/data/loader/test.json", function(content, status) {
		se(content.data, "nice", "JSON file loading success");
		st();
	});
});

// Testing loading json file threw ajax mode
test("a.loader.xml", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	// Loading file
	a.loader.xml("./resource/data/loader/test.xml", function(content, status) {
		se(content.getElementsByTagName("bodyt")[0].childNodes[0].nodeValue, "Content", "Testing XML loading");
		st();
	});
});

// Testing loading CSS files threw "link" tag
test("a.loader.css", function() {
	stop();
	expect(1);

	// We create a dummy HTML tag, we load a specific CSS files
	// Then we check style apply correctly (the style comes from CSS files)

	// Prevent scope change
	var se = strictEqual, st = start;

	var div = document.createElement("div");
	div.style.display = "none";
	div.id = "unittest_load_css";

	if(document.body) {
		document.body.appendChild(div);
	} else {
		document.getElementsByTagName('body')[0].appendChild(div);
	}

	// Loading file
	a.loader.css("./resource/data/loader/test.css", function() {
		var el = document.getElementById("unittest_load_css");

		var height = "";
		if (el.currentStyle) {
			height = el.currentStyle["height"];
		} else if (window.getComputedStyle) {
			height = document.defaultView.getComputedStyle(el,null).getPropertyValue("height");
		}
		se(height, "20px", "Test CSS applies correctly");
		st();
	});
});

// Testing loading html files
test("a.loader.html", function() {
	stop();
	expect(1);

	/*
	 * We just check content given
	*/

	// Prevent scope change
	var se = strictEqual,
		st = start;

	// Loading file
	a.loader.html("./resource/data/loader/test.html", function(content) {
		se(content, "<a>ok</a>", "Test HTML applies correctly");
		st();
	});
});

// Testing loading JavaFX files
/*test("a.loader.javafx", function() {
	stop();
	expect(1);


	// Prevent scope change
	var se = strictEqual,
		st = start;

	// Loading file
	a.loader.javafx(a.url + "vendor/storage/javafx/JavaFXStorage.jar", function() {
		var t = document.getElementById("javafxstorage");
		se(t.Packages.javafxstorage.localStorage.testData(), true, "Test system is loaded");
		st();
	}, {
		code : "javafxstorage.Main",
		id : "javafxstorage"
	});
});*/


// Testing loading Flash files
test("a.loader.flash", function() {
	stop();
	expect(1);


	// Prevent scope change
	var se = strictEqual,
		st = start;

	// Append to root a div for recieving flash
	var root = document.createElement("div");
	root.id = "swtstoragecontent";
	document.body.appendChild(root);

	var data = {
		id : "swfstorage",
		rootId : "swtstoragecontent",

		flashvars : {},
		params : {
			wmode: "transparent",
			menu: "false",
			scale: "noScale",
			allowFullscreen: "true",
			allowScriptAccess: "always"
		}
	};

	// Loading file
	a.loader.flash(a.url + "vendor/storage/flash/localStorage.swf", function(e) {
		var el = document.getElementById(data.id);
		se(el.testData(), true, "Test system is loaded");
		st();
	}, data);
});


// Testing loading Silverlight files
test("a.loader.silverlight", function() {
	stop();
	expect(1);


	// Prevent scope change
	var se = strictEqual,
		st = start;

	// Append to root a div for recieving silverlight
	var root = document.createElement("div");
	root.id = "xapstoragecontent";
	document.body.appendChild(root);

	var data = {
		id : "xapstorage",
		rootId : "xapstoragecontent",

		params : [{
			name : "minRuntimeVersion",
			value : "2.0.31005.0"
		},{
			name : "autoUpgrade",
			value : "true"
		}]
	};

	// Loading file
	a.loader.silverlight(a.url + "vendor/storage/silverlight/silverlightStorage.xap", function(e) {
		var el = document.getElementById(data.id);
		se(el.Content.store.testData(), true, "Test system is loaded");
		st();
	}, data);
});