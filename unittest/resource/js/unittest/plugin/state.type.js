// Unit test for a.state (plugin)
// We separate from state because it is less important, and more easy one...

module("PLUGIN/state");

// Test type system
test("a.state.type", function() {
	stop();
	expect(6);

	a.state.clear();

	var st = start,
		se = strictEqual;

	var obj = {
		user_id : 10,
		login : "myloginisgreat"
	};

	// This is our custom handler
	var handlerObj = function(item) {
		if(!a.isNull(obj[item])) {
			return obj[item];
		}
		return null;
	}

	a.state.type.add("objHandler", handlerObj);

	var tree = {
		id : "customhandler",
		data : {
			user_id : "{{objHandler : user_id}}",
			login : "{{objHandler : login}}",
			notexisting : "{{objHandler : test}}"
		},
		converter : function(data) {
			se(data.user_id, 10, "Test user_id field");
			se(data.login, "myloginisgreat", "Test user login field");
			se(data.notexisting, null, "Test null value");

			// We get the list of handler, and check
			var list = a.state.type.list();
			se(typeof(list["objHandler"]), "function", "Test list size");
			se(a.state.type.get("null"), null, "Test null get");
			se(typeof(a.state.type.get("objHandler")), "function", "Test function get");
			st();
		}
	};

	a.state.add(tree);
	a.state.loadById("customhandler");
	a.state.clear();
});