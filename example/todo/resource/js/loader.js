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



	// Simple home loading content
	var home = {
		id : "home",
		load : __replaceById("page-container"),

		include : {
			html : "resource/html/home.html"
		},

		// We define a children for not having trouble with filter (we separate them, so filter is not always erased)
		children : [
			{
				id : "todolist",
				hash : "todolist",
				load : __replaceById("todolist"),

				include : {
					html : "resource/html/todolist.html"
				},

				// You can bind storage into data easily
				data : {
					todolist : "{{storage : todolist}}"
				},

				// We use converter to load from internal storage.
				// The converter allow to perform modification on data before rendering, even if no data are loaded
				// We use it to add storage data (instead of loading url), and apply filter to it
				converter : function(data) {
					// We catch the filter to check if we have to remove some item
					var filter = document.getElementById("filter-todo");

					if(data && filter && filter.value.length > 0) {
						var val = filter.value,
							i   = data.todolist.length;

						while(i--) {
							if(data.todolist[i].todo.search(val) === -1) {
								data.todolist.splice(i, 1);
							}
						}
						data.filter = filter.value;
					}

					// We simply reverse order to make it "last inserted first view"
					if(data.todolist instanceof Array) {
						data.todolist.reverse();
					}
				}
			},
			{
				// This controller is always loaded manually to modify a note
				id : "todolist-modify-show",

				// We ask to get all stuff loaded on application startup
				bootOnLoad : true,

				include : {
					html : "resource/html/todo-modify.html"
				},

				// In this case we load from memory store
				data : {
					id : "{{memory : current-todo-modify-show}}"
				},

				// We append current showed element to data
				converter : function(data) {
					data.content = document.getElementById("todo-content-" + data.id).innerHTML;
				},

				// Even if it's ugly, we can still manually create the element to replace with
				load : function(content) {
					var id      = a.storage.memory.getItem("current-todo-modify-show"),
						element = document.getElementById("todo-" + id);

					// We can clear the id
					a.storage.memory.removeItem("current-todo-modify-show");

					// We store previous content, in case of cancel
					a.storage.memory.setItem("todo-" + id, element.innerHTML);
					a.page.template.replace(element, content);
				},

				// Rollback changes
				preUnload : function(result) {
					var id      = a.storage.memory.getItem("current-todo-modify-show"),
						element = document.getElementById("todo-" + id);
					a.page.template.replace(element, a.storage.memory.getItem("todo-" + id));
					result.done();
				}
			}
		]
	};

	// Finally we add elements to system
	a.state.add(home);
})();