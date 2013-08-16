// Unit test for a.state (plugin)
// We separate from state because it is less important, and more easy one...

module("PLUGIN/state");

// Testing getById function
test("a.state.getById", function() {
	expect(3);

	a.state.clear();

	var element = {
		id : "nowitisworking",
		hash : "you"
	};
	a.state.add(element);

	// We test access
	strictEqual(a.state.getById("notworking"), null, "Test not existing id");
	deepEqual(a.state.getById("nowitisworking"), element, "Test element can be accessed");

	// Now we test we can handle changes easily (item is not duplicate)
	a.state.getById("nowitisworking").hash = "newone";

	strictEqual(a.state.getById("nowitisworking").hash, "newone", "Test element can change");

	// Clearing state
	a.state.clear();
});

// Testing removeById function
test("a.state.removeById", function() {
	expect(2);

	a.state.clear();

	var element = {
		id : "nowitisworking",
		hash : "you"
	};
	a.state.add(element);

	deepEqual(a.state.getById("nowitisworking"), element, "Test element can be accessed");

	// Now we remove
	a.state.removeById(element.id);

	deepEqual(a.state.getById("nowitisworking"), null, "Test element cannot be accessed after deleting");

	// Now we remove dummy one...
	a.state.removeById("something");
	a.state.removeById(null);

	// No error should appear on console...

	a.state.clear();
});

// Testing loading manually a state
test("a.state.loadById", function() {
	stop();
	expect(2);

	a.state.clear();

	var se = strictEqual,
		st = start;

	var element = {
		id : "load-by-id-test",

		include : {
			html : "resource/data/state/loadById.html"
		},

		load : function(html) {
			document.body.innerHTML += html;
			se(document.getElementById("loadByIdTest").innerHTML, "ok", "Test state loaded");
		},

		unload : function(result) {
			se(true, true, "Unloading called on wrong hash change");
			result.done();
		}
	};

	a.state.add(element);
	a.state.loadById("load-by-id-test", ["load-by-id-test2", "load-by-id-test3"]);

	setTimeout(function() {
		window.location.href = "#load-by-id-test3";
	}, 200);

	setTimeout(function() {
		window.location.href = "#load-by-id-test20";
	}, 600);

	setTimeout(function() {
		a.state.clear();
		window.location.href = "#";
		st();
	}, 1000);
});

// Testing unloading a state previously loaded manually
test("a.state.unloadById", function() {
	stop();
	expect(2);
	a.state.clear();

	// We load, and directly unload it
	var element = {
		id : "load-by-id-unload",

		load : function() {
			se(true, true, "loading complete");
		},

		unload : function(result) {
			se(true, true, "Unloading complete");
			result.done();
		}
	};

	var se = strictEqual,
	st = start;

	a.state.add(element);
	a.state.loadById("load-by-id-unload", null, function() {
		setTimeout(function() {
			a.state.unloadById("load-by-id-unload", function() {
				a.state.clear();
				st();
			});
		}, 400);
	});
});


// Testing forceReload state
test("a.state.forceReloadById", function() {
	stop();
	expect(3);
	a.state.clear();

	var se = strictEqual,
		st = start;

	var element = {
		id : "force-reload-by-id-test",
		hash : "force-reload-by-id-test",

		load : function() {
			se(true, true, "loading complete");
		},

		unload : function(result) {
			se(true, true, "Unloading complete");
			result.done();
		}
	};

	a.state.add(element);

	setTimeout(function() {
		window.location.href = "#force-reload-by-id-test";
	}, 200);

	setTimeout(function() {
		a.state.forceReloadById("force-reload-by-id-test");
	}, 600);

	setTimeout(function() {
		a.state.clear();
		window.location.href = "#";
		st();
	}, 1000);
});