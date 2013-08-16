// Unit test for a.keyboard (plugin)

module("PLUGIN/keyboard");

/*
 * Note : because keyboard plugin is just a bind to Mousetrap, we just do one basic test nothing more.
 * Note : please run unit test from Mousetrap for more deeper unit test (you can found them on /unittest/vendor/mousetrap)
*/

test("a.keyboard.addListener", function() {
	stop();
	expect(1);

	// Prevent scope change
	var se = strictEqual,
		st = start;

	var callback = function() {
		se(true, true, "Event where fired as expected");
		st();
	};

	a.keyboard.addListener("a", callback);
	a.keyboard.addListener("c", callback);

	// Now launching mousetrap trigger (only one of two callback should pass)
	Mousetrap.trigger("a");
});

test("a.keyboard.removeListener", function() {
	stop();
	expect(2);

	// Prevent scope change
	var se = strictEqual;

	var callback = function() {
		se(true, true, "Event where fired as expected");
	};

	a.keyboard.addListener("a", callback);
	a.keyboard.addListener("c", callback);

	// Now launching mousetrap trigger (only one of two callback should pass)
	Mousetrap.trigger("a");

	a.keyboard.removeListener("a");

	Mousetrap.trigger("a");
	Mousetrap.trigger("c");

	setTimeout(start, 1000);
});