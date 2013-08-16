// Unit test for a.storage (plugin)

module("PLUGIN/storage");

/*
---------------------------------
  COOKIE RELATED
---------------------------------
*/
(function() {
	var co = a.storage.cookie;
	var support = co.support;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	if(!support) {
		testSkip("a.storage.type.cookie (STORAGE NOT SUPPORTED)");
	} else {
		test("a.storage.type.cookie", function() {
			// Test similar result
			strictEqual(co.support, a.storage.type.cookie.support, "Test object binding");

			// We test : object, array, string and integer
			co.setItem("unittest_storage_object", obj);
			co.setItem("unittest_storage_array", arr);
			co.setItem("unittest_storage_string", str);
			co.setItem("unittest_storage_integer", integ);

			// Set items
			deepEqual(co.getItem("unittest_storage_object"), obj, "Test cookie object storage");
			deepEqual(co.getItem("unittest_storage_array"), arr, "Test cookie array storage");
			strictEqual(co.getItem("unittest_storage_string"), str, "Test cookie string storage");
			strictEqual(co.getItem("unittest_storage_integer"), integ, "Test cookie integer storage");

			// Remove item
			co.removeItem("unittest_storage_object");
			co.removeItem("unittest_storage_array");
			co.removeItem("unittest_storage_string");
			co.removeItem("unittest_storage_integer");

			// Test removed
			strictEqual(co.getItem("unittest_storage_object"), null, "Test cookie removed object storage");
			strictEqual(co.getItem("unittest_storage_array"), null, "Test cookie removed array storage");
			strictEqual(co.getItem("unittest_storage_string"), null, "Test cookie removed string storage");
			strictEqual(co.getItem("unittest_storage_integer"), null, "Test cookie removed integer storage");
		});
	}
})();



/*
---------------------------------
  LOCALSTORAGE RELATED
---------------------------------
*/
(function() {
	var lo = a.storage.type.localStorage;
	var support = lo.support;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	if(!support) {
		testSkip("a.storage.type.localStorage (STORAGE NOT SUPPORTED)");
	} else {
		test("a.storage.type.localStorage", function() {
			// We test : object, array, string and integer
			lo.setItem("unittest_storage_object", obj);
			lo.setItem("unittest_storage_array", arr);
			lo.setItem("unittest_storage_string", str);
			lo.setItem("unittest_storage_integer", integ);

			// Set items
			deepEqual(lo.getItem("unittest_storage_object"), obj, "Test localStorage object storage");
			deepEqual(lo.getItem("unittest_storage_array"), arr, "Test localStorage array storage");
			strictEqual(lo.getItem("unittest_storage_string"), str, "Test localStorage string storage");
			strictEqual(lo.getItem("unittest_storage_integer"), integ, "Test localStorage integer storage");

			// Remove item
			lo.removeItem("unittest_storage_object");
			lo.removeItem("unittest_storage_array");
			lo.removeItem("unittest_storage_string");
			lo.removeItem("unittest_storage_integer");

			// Test removed
			strictEqual(lo.getItem("unittest_storage_object"), null, "Test localStorage removed object storage");
			strictEqual(lo.getItem("unittest_storage_array"), null, "Test localStorage removed array storage");
			strictEqual(lo.getItem("unittest_storage_string"), null, "Test localStorage removed string storage");
			strictEqual(lo.getItem("unittest_storage_integer"), null, "Test localStorage removed integer storage");
		});
	}
})();



/*
---------------------------------
  GLOBALSTORAGE RELATED
---------------------------------
*/
(function() {
	var gl = a.storage.type.globalStorage;
	var support = gl.support;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	if(!support) {
		testSkip("a.storage.type.globalStorage (STORAGE NOT SUPPORTED)");
	} else {
		test("a.storage.type.globalStorage", function() {
			// We test : object, array, string and integer
			gl.setItem("unittest_storage_object", obj);
			gl.setItem("unittest_storage_array", arr);
			gl.setItem("unittest_storage_string", str);
			gl.setItem("unittest_storage_integer", integ);

			// Set items
			deepEqual(gl.getItem("unittest_storage_object"), obj, "Test globalStorage object storage");
			deepEqual(gl.getItem("unittest_storage_array"), arr, "Test globalStorage array storage");
			strictEqual(gl.getItem("unittest_storage_string"), str, "Test globalStorage string storage");
			strictEqual(gl.getItem("unittest_storage_integer"), integ, "Test globalStorage integer storage");

			// Remove item
			gl.removeItem("unittest_storage_object");
			gl.removeItem("unittest_storage_array");
			gl.removeItem("unittest_storage_string");
			gl.removeItem("unittest_storage_integer");

			// Test removed
			strictEqual(gl.getItem("unittest_storage_object"), null, "Test globalStorage removed object storage");
			strictEqual(gl.getItem("unittest_storage_array"), null, "Test globalStorage removed array storage");
			strictEqual(gl.getItem("unittest_storage_string"), null, "Test globalStorage removed string storage");
			strictEqual(gl.getItem("unittest_storage_integer"), null, "Test globalStorage removed integer storage");
		});
	}
})();



/*
---------------------------------
  MEMORY STORE RELATED
---------------------------------
*/
(function() {
	var mem = a.storage.type.memory;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	test("a.storage.type.memory", function() {
		strictEqual(mem.support, true, "Test support is always ok on memory store");

		// We test : object, array, string and integer
		mem.setItem("unittest_storage_object", obj);
		mem.setItem("unittest_storage_array", arr);
		mem.setItem("unittest_storage_string", str);
		mem.setItem("unittest_storage_integer", integ);

		// Set items
		deepEqual(mem.getItem("unittest_storage_object"), obj, "Test memory object storage");
		deepEqual(mem.getItem("unittest_storage_array"), arr, "Test memory array storage");
		strictEqual(mem.getItem("unittest_storage_string"), str, "Test memory string storage");
		strictEqual(mem.getItem("unittest_storage_integer"), integ, "Test memory integer storage");

		// Remove item
		mem.removeItem("unittest_storage_object");
		mem.removeItem("unittest_storage_array");
		mem.removeItem("unittest_storage_string");
		mem.removeItem("unittest_storage_integer");

		// Test removed
		strictEqual(mem.getItem("unittest_storage_object"), null, "Test memory removed object storage");
		strictEqual(mem.getItem("unittest_storage_array"), null, "Test memory removed array storage");
		strictEqual(mem.getItem("unittest_storage_string"), null, "Test memory removed string storage");
		strictEqual(mem.getItem("unittest_storage_integer"), null, "Test memory removed integer storage");
	});
})();



/*
---------------------------------
  SESSIONSTORAGE RELATED
---------------------------------
*/
(function() {
	var se = a.storage.type.sessionStorage;
	var support = se.support;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	if(!support) {
		testSkip("a.storage.type.sessionStorage (STORAGE NOT SUPPORTED)");
	} else {
		test("a.storage.type.sessionStorage", function() {
			// We test : object, array, string and integer
			se.setItem("unittest_storage_object", obj);
			se.setItem("unittest_storage_array", arr);
			se.setItem("unittest_storage_string", str);
			se.setItem("unittest_storage_integer", integ);

			// Set items
			deepEqual(se.getItem("unittest_storage_object"), obj, "Test sessionStorage object storage");
			deepEqual(se.getItem("unittest_storage_array"), arr, "Test sessionStorage array storage");
			strictEqual(se.getItem("unittest_storage_string"), str, "Test sessionStorage string storage");
			strictEqual(se.getItem("unittest_storage_integer"), integ, "Test sessionStorage integer storage");

			// Remove item
			se.removeItem("unittest_storage_object");
			se.removeItem("unittest_storage_array");
			se.removeItem("unittest_storage_string");
			se.removeItem("unittest_storage_integer");

			// Test removed
			strictEqual(se.getItem("unittest_storage_object"), null, "Test sessionStorage removed object storage");
			strictEqual(se.getItem("unittest_storage_array"), null, "Test sessionStorage removed array storage");
			strictEqual(se.getItem("unittest_storage_string"), null, "Test sessionStorage removed string storage");
			strictEqual(se.getItem("unittest_storage_integer"), null, "Test sessionStorage removed integer storage");
		});
	}
})();



/*
---------------------------------
  USERDATA (IE ONLY) RELATED
---------------------------------
*/
(function() {
	var ud = a.storage.type.userData;
	var support = ud.support;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	if(!support) {
		testSkip("a.storage.type.userData (STORAGE NOT SUPPORTED)");
	} else {
		test("a.storage.type.userData", function() {
			// We test : object, array, string and integer
			ud.setItem("unittest_storage_object", obj);
			ud.setItem("unittest_storage_array", arr);
			ud.setItem("unittest_storage_string", str);
			ud.setItem("unittest_storage_integer", integ);

			// Set items
			deepEqual(ud.getItem("unittest_storage_object"), obj, "Test userData object storage");
			deepEqual(ud.getItem("unittest_storage_array"), arr, "Test userData array storage");
			strictEqual(ud.getItem("unittest_storage_string"), str, "Test userData string storage");
			strictEqual(ud.getItem("unittest_storage_integer"), integ, "Test userData integer storage");

			// Remove item
			ud.removeItem("unittest_storage_object");
			ud.removeItem("unittest_storage_array");
			ud.removeItem("unittest_storage_string");
			ud.removeItem("unittest_storage_integer");

			// Test removed
			strictEqual(ud.getItem("unittest_storage_object"), null, "Test userData removed object storage");
			strictEqual(ud.getItem("unittest_storage_array"), null, "Test userData removed array storage");
			strictEqual(ud.getItem("unittest_storage_string"), null, "Test userData removed string storage");
			strictEqual(ud.getItem("unittest_storage_integer"), null, "Test userData removed integer storage");
		});
	}
})();



/*
---------------------------------
  FLASH RELATED
---------------------------------
*/
(function() {
	var fl = a.storage.type.flash;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	test("a.storage.type.flash", function() {
		stop();
		expect(8);

		var qse = QUnit.strictEqual,
			qde = QUnit.deepEqual,
			qst = QUnit.start;

		fl.start(function() {
			// We test : object, array, string and integer
			fl.setItem("unittest_storage_object", obj);
			fl.setItem("unittest_storage_array", arr);
			fl.setItem("unittest_storage_string", str);
			fl.setItem("unittest_storage_integer", integ);

			// Set items
			qde(fl.getItem("unittest_storage_object"), obj, "Test flash object storage");
			qde(fl.getItem("unittest_storage_array"), arr, "Test flash array storage");
			qse(fl.getItem("unittest_storage_string"), str, "Test flash string storage");
			qse(fl.getItem("unittest_storage_integer"), integ, "Test flash integer storage");

			// Remove item
			fl.removeItem("unittest_storage_object");
			fl.removeItem("unittest_storage_array");
			fl.removeItem("unittest_storage_string");
			fl.removeItem("unittest_storage_integer");

			// Test removed
			qse(fl.getItem("unittest_storage_object"), null, "Test flash removed object storage");
			qse(fl.getItem("unittest_storage_array"), null, "Test flash removed array storage");
			qse(fl.getItem("unittest_storage_string"), null, "Test flash removed string storage");
			qse(fl.getItem("unittest_storage_integer"), null, "Test flash removed integer storage");

			qst();
		});
	});
})();



/*
---------------------------------
  SILVERLIGHT RELATED
---------------------------------
*/
(function() {
	var sl = a.storage.type.silverlight;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	test("a.storage.type.silverlight", function() {
		stop();
		expect(8);

		var qse = QUnit.strictEqual,
			qde = QUnit.deepEqual,
			qst = QUnit.start;

		sl.start(function() {
			// We test : object, array, string and integer
			sl.setItem("unittest_storage_object", obj);
			sl.setItem("unittest_storage_array", arr);
			sl.setItem("unittest_storage_string", str);
			sl.setItem("unittest_storage_integer", integ);

			// Set items
			qde(sl.getItem("unittest_storage_object"), obj, "Test silverlight object storage");
			qde(sl.getItem("unittest_storage_array"), arr, "Test silverlight array storage");
			qse(sl.getItem("unittest_storage_string"), str, "Test silverlight string storage");
			qse(sl.getItem("unittest_storage_integer"), integ, "Test silverlight integer storage");

			// Remove item
			sl.removeItem("unittest_storage_object");
			sl.removeItem("unittest_storage_array");
			sl.removeItem("unittest_storage_string");
			sl.removeItem("unittest_storage_integer");

			// Test removed
			qse(sl.getItem("unittest_storage_object"), null, "Test silverlight removed object storage");
			qse(sl.getItem("unittest_storage_array"), null, "Test silverlight removed array storage");
			qse(sl.getItem("unittest_storage_string"), null, "Test silverlight removed string storage");
			qse(sl.getItem("unittest_storage_integer"), null, "Test silverlight removed integer storage");

			qst();
		});
	});
})();



/*
---------------------------------
  JAVAFX RELATED (Note : cancelled due to javaFX "install now" deleting the unit-test content...)
---------------------------------
*/
/*(function() {

})();*/




/*
---------------------------------
  TEMPORARY STORAGE RELATED
---------------------------------
*/
(function() {
	var temp = a.storage.temporary;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	// Support is always true on temp because memory storage always exist
	test("a.storage.temporary", function() {
		strictEqual(temp.support, true, "Temporary storage is supported");

		// We test : object, array, string and integer
		temp.setItem("unittest_storage_object", obj);
		temp.setItem("unittest_storage_array", arr);
		temp.setItem("unittest_storage_string", str);
		temp.setItem("unittest_storage_integer", integ);

		// Set items
		deepEqual(temp.getItem("unittest_storage_object"), obj, "Test temporary object storage");
		deepEqual(temp.getItem("unittest_storage_array"), arr, "Test temporary array storage");
		strictEqual(temp.getItem("unittest_storage_string"), str, "Test temporary string storage");
		strictEqual(temp.getItem("unittest_storage_integer"), integ, "Test temporary integer storage");

		// Remove item
		temp.removeItem("unittest_storage_object");
		temp.removeItem("unittest_storage_array");
		temp.removeItem("unittest_storage_string");
		temp.removeItem("unittest_storage_integer");

		// Test removed
		strictEqual(temp.getItem("unittest_storage_object"), null, "Test temporary removed object storage");
		strictEqual(temp.getItem("unittest_storage_array"), null, "Test temporary removed array storage");
		strictEqual(temp.getItem("unittest_storage_string"), null, "Test temporary removed string storage");
		strictEqual(temp.getItem("unittest_storage_integer"), null, "Test temporary removed integer storage");
	});
})();




/*
---------------------------------
  PERSISTENT STORAGE RELATED
---------------------------------
*/
(function() {
	var pe = a.storage.persistent;
	var support = pe.support;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	if(!support) {
		testSkip("a.storage.persistent (NO PERSISTENT STORAGE FOUND)");
	} else {
		test("a.storage.persistent", function() {
			// We test : object, array, string and integer
			pe.setItem("unittest_storage_object", obj);
			pe.setItem("unittest_storage_array", arr);
			pe.setItem("unittest_storage_string", str);
			pe.setItem("unittest_storage_integer", integ);

			// Set items
			deepEqual(pe.getItem("unittest_storage_object"), obj, "Test persistent object storage");
			deepEqual(pe.getItem("unittest_storage_array"), arr, "Test persistent array storage");
			strictEqual(pe.getItem("unittest_storage_string"), str, "Test persistent string storage");
			strictEqual(pe.getItem("unittest_storage_integer"), integ, "Test persistent integer storage");

			// Remove item
			pe.removeItem("unittest_storage_object");
			pe.removeItem("unittest_storage_array");
			pe.removeItem("unittest_storage_string");
			pe.removeItem("unittest_storage_integer");

			// Test removed
			strictEqual(pe.getItem("unittest_storage_object"), null, "Test persistent removed object storage");
			strictEqual(pe.getItem("unittest_storage_array"), null, "Test persistent removed array storage");
			strictEqual(pe.getItem("unittest_storage_string"), null, "Test persistent removed string storage");
			strictEqual(pe.getItem("unittest_storage_integer"), null, "Test persistent removed integer storage");
		});
	}
})();




/*
---------------------------------
  EXTERNAL STORAGE RELATED
---------------------------------
*/
(function() {
	var ex = a.storage.external;

	var obj = {ok : "ok", test : "something", sec : {o : "ok"}},
		arr = ["yeah", "nope"],
		str = "some string",
		integ = 20;

	test("a.storage.external", function() {
		stop();
		expect(8);

		var qse = QUnit.strictEqual,
			qde = QUnit.deepEqual,
			qst = QUnit.start;

		ex.start(function() {
			// We test : object, array, string and integer
			ex.setItem("unittest_storage_object", obj);
			ex.setItem("unittest_storage_array", arr);
			ex.setItem("unittest_storage_string", str);
			ex.setItem("unittest_storage_integer", integ);

			// Set items
			qde(ex.getItem("unittest_storage_object"), obj, "Test silverlight object storage");
			qde(ex.getItem("unittest_storage_array"), arr, "Test silverlight array storage");
			qse(ex.getItem("unittest_storage_string"), str, "Test silverlight string storage");
			qse(ex.getItem("unittest_storage_integer"), integ, "Test silverlight integer storage");

			// Remove item
			ex.removeItem("unittest_storage_object");
			ex.removeItem("unittest_storage_array");
			ex.removeItem("unittest_storage_string");
			ex.removeItem("unittest_storage_integer");

			// Test removed
			qse(ex.getItem("unittest_storage_object"), null, "Test silverlight removed object storage");
			qse(ex.getItem("unittest_storage_array"), null, "Test silverlight removed array storage");
			qse(ex.getItem("unittest_storage_string"), null, "Test silverlight removed string storage");
			qse(ex.getItem("unittest_storage_integer"), null, "Test silverlight removed integer storage");

			qst();
		});
	});
})();