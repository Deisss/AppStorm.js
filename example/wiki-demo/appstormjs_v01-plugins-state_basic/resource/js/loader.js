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
		id : "root",
		load : __replaceById("page-container"),
		include : {
			css : "resource/css/main.css",
			html : "resource/html/page.html"
		},
		children : [
			{
				id   : "list",
				hash : "list",
				load : __replaceById("sub-container"),
				data : "resource/data/list.json",
				include : {
					html  : "resource/html/list.html"
				}
			},
			{
				id   : "user",
				hash : "user-{{userId : [a-fA-F0-9]+}}",
				load : __replaceById("sub-container"),
				data : "resource/data/user-{{userId}}.json",
				include : {
					html  : "resource/html/user.html"
				}
			}
		]
	};

	// Register our document
	a.state.add(tree);
})();