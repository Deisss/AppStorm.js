/**
 * Returns a random number between min and max
 */
function getRandomArbitary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
};

/**
 * Add a todo to existing todo list
*/
function todoAdd() {
	var todo = document.getElementById("new-todo").value,
		todolist = a.storage.getItem("todolist") || [];

	// Creating the todo
	todolist.push({
		todo : todo,
		date : new Date(),
		check: false,
		id   : getRandomArbitary(1, 10000000)
	});

	// Storing item
	a.storage.setItem("todolist", todolist);

	// IMPORTANT: Forcing reloading template
	a.state.forceReloadById("todolist");

	// Clear
	document.getElementById("new-todo").value = "";
};


/**
 * Modify a todo from existing todo list
 *
 * @param id {Integer} The id to remove
*/
function todoModifyShow(id) {
	// Before calling the controller, we must set id concerned for helping controller to find the item
	a.storage.memory.setItem("current-todo-modify-show", id);
	a.state.loadById("todolist-modify-show");
};

/**
 * Rollback changes to previous state
 *
 * @param id {String} The id to remove
*/
function todoModifyCancel(id) {
	a.storage.memory.setItem("current-todo-modify-show", id);
	a.state.unloadById("todolist-modify-show");
};

/**
 * Validate modification
 *
 * @param id {String} The id to update
*/
function todoModifyValidate(id) {
	a.storage.memory.setItem("current-todo-modify-show", id);
	var content  = document.getElementById("todo-modify-" + id).value,
		todolist = a.storage.getItem("todolist"),
		i        = todolist.length;

	while(i--) {
		if(todolist[i].id == id) {
			todolist[i].todo = content;
			// We change cancel state
			var previous = a.storage.memory.getItem("todo-" + id);

			// We do a ulgy pregreplace but it does work !
			previous = previous.replace(new RegExp('<a id="todo-content-' + id + '" class="todo">(.*)</a>', "gi"),  '<a id="todo-content-' + id + '" class="todo">' + content + '</a>');
			a.storage.memory.setItem("todo-" + id, previous);
		}
	}

	// We save and unload
	a.storage.setItem("todolist", todolist);
	a.state.unloadById("todolist-modify-show");
};

/**
 * Remove a todo from existing todo list
 *
 * @param id {Integer} The id to remove
*/
function todoRemove(id) {
	var todolist = a.storage.getItem("todolist"),
		i = todolist.length;

	while(i--) {
		if(todolist[i].id == id) {
			todolist.splice(i, 1);
		}
	}

	// Storing item
	a.storage.setItem("todolist", todolist);

	// IMPORTANT: Forcing reloading template
	a.state.forceReloadById("todolist");
};