// Root controller system, loading main app system here
(function() {
	/**
	 * Replace the content regarding the id given
	 *
	 * @param id {String} The id to replace inner html
	*/
	function __replaceById(id) {
		return function(content) {
			a.page.template.replace(document.getElementById(id), content);
		}
	};

	// Describe our behaviour
	var tree = {
		id : "login",
		hash : "login",
		load : __replaceById("page-container"),
		include : {
			css : "resource/css/main.css",
			html : "resource/html/login.html"
		},
		// Start live form validation
		postLoad : function(result) {
			a.form.live.start(document.getElementById("login-form"));

			// On submit click, you can use a.form.live.once to perform a scan
			// Should be use before sending any data, it's because if user
			// didn't enter any data, the live plugin does not really start already

			result.done();
		},
		// Stop live form validation
		preUnload : function(result) {
			a.form.live.stop(document.getElementById("login-form"));
			
			result.done();
		}
	};

	// Register our document
	a.state.add(tree);
})();