/**
 * Ask to reload list system
 *
 * @param el {DOMElement} The element calling refresh
*/
function handleFilter(el) {
	// We can handle different way for this, but we choose memory store (easy to use)
	a.storage.memory.setItem("filter", el.value);
	// We force system to reload list
	a.state.forceReloadById("list");
};

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
		data : "resource/data/list.json",
		// We use converter to store data
		converter : function(data) {
			a.storage.memory.setItem("content", data.userlist);
		},
		include : {
			css : "resource/css/main.css",
			html : "resource/html/page.html"
		},
		children : [
			{
				id   : "list",
				hash : "list",
				load : __replaceById("sub-container"),
				// We recieve a blank data, we add to it filtered list using storage
				converter : function(data) {
					var filter = a.storage.memory.getItem("filter"),
						content = a.storage.memory.getItem("content");

					// We make a copy of it : memory store is a javascript object, so it is working by reference...
					content = a.clone(content);

					if(content && filter) {
						var i = content.length;
						while(i--) {
							if(content[i].login.search(filter) === -1 && content[i].id.toString().search(filter) === -1) {
								content.splice(i, 1);
							}
						}
					}

					// We append to data
					data.userlist = content;
				},
				include : {
					html  : "resource/html/list.html"
				}
			}
		]
	};

	// Register our document
	a.state.add(tree);
})();