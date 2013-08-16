/**
 * Ask to reload result system when filtering change
 *
 * @param el {DOMElement} The element calling refresh
*/
function handleFilter(el) {
	// We can handle different way for this, but we choose memory store (easy to use)
	a.storage.memory.setItem("filter", el.value);
	// We force system to reload result
	a.state.forceReloadById("result");
};

/**
 * Ask to reload result system when number of items per page change
 *
 * @param el {DOMElement} The element calling refresh
*/
function handleItemPerPage(el) {
	// We can handle different way for this, but we choose memory store (easy to use)
	a.storage.memory.setItem("nbPerPage", parseInt(el.value, 10));
	// We force system to reload result
	a.state.forceReloadById("result");
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
			html : "resource/html/page.html"
		},
		children : [
			{
				id   : "result",
				hash : "result-{{page : \\d+}}",
				load : __replaceById("sub-container"),
				// Retrieve current page viewed
				data : {
					currentPage : "{{page}}"
				},
				// We recieve a blank data, we add to it filtered list using storage
				converter : function(data) {
					var filter  = a.storage.memory.getItem("filter"),
						// We make a copy of it : memory store is a javascript object, so it is working by reference...
						content = a.clone(a.storage.memory.getItem("content")),
						current = parseInt(data.currentPage, 10);

					var i = content.length;
					if(content && filter) {
						// Selecting children
						while(i--) {
							if(content[i].login.search(filter) === -1 && content[i].id.toString().search(filter) === -1) {
								content.splice(i, 1);
							}
						}
					}

					// Now we apply page selection
					var nbPerPage = a.storage.memory.getItem("nbPerPage") || 10,
						// Computing max page
						nbPage = Math.ceil(content.length / nbPerPage);

					// If current page is under max page
					data.nextPage     = current + 1;
					data.previousPage = current - 1;

					if(current >= nbPage) {
						data.nextPage = current = data.currentPage = nbPage;
					}
					if(current <= 1) {
						data.previousPage = current = data.currentPage = 1;
					}

					// Now we filter by page
					var minRange = (current - 1) * nbPerPage,
						maxRange = minRange + nbPerPage - 1;

					i = content.length;
					while(i--) {
						if(i < minRange || i > maxRange) {
							content.splice(i, 1);
						}
					}

					// We append to data
					data.userlist = content;
				},
				include : {
					html  : "resource/html/result.html"
				}
			}
		]
	};

	// Register our document
	a.state.add(tree);
})();