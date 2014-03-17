/**
 * Returns a random number between min and max.
 *
 * @method getRandomArbitary
 *
 * @param min {Integer}                     The minimum allowed
 * @param max {Integer}                     The maximum allowed
 * @return {Integer}                        A random number between min and max
 */
function getRandomArbitary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
};

/**
 * Add a todo to existing todo list.
 *
 * @method todoAdd
*/
function todoAdd() {
    var todo     = a.dom.id('new-todo').get(0).value,
        todolist = a.storage.get('todolist') || [];

    // Creating the todo
    todolist.push({
        todo : todo,
        date : new Date(),
        check: false,
        id   : getRandomArbitary(1, 10000000)
    });

    // Storing item
    a.storage.set('todolist', todolist);

    // IMPORTANT: Forcing reloading template
    a.state.load('todolist');

    // Clear
    a.dom.id('new-todo').get(0).value = '';
};


/**
 * Modify a todo from existing todo list.
 *
 * @method todoModifyShow
 *
 * @param id {Integer}                      The id to remove
*/
function todoModifyShow(id) {
    // Before calling the controller, we must set id concerned for helping
    // controller to find the item
    a.storage.memory.set('current-todo-modify-show', id);
    a.state.load('todolist-modify-show');
};

/**
 * Rollback changes to previous state.
 *
 * @method todoModifyCancel
 *
 * @param id {String}                       The id to remove
*/
function todoModifyCancel(id) {
    a.storage.memory.set('current-todo-modify-show', id);
    a.state.unload('todolist-modify-show');
};

/**
 * Validate modification.
 *
 * @method todoModifyValidate
 *
 * @param id {String}                       The id to update
*/
function todoModifyValidate(id) {
    a.storage.memory.set('current-todo-modify-show', id);
    var content  = a.dom.id('todo-modify-' + id).get(0).value,
        todolist = a.storage.get('todolist'),
        i        = todolist.length;

    while(i--) {
        if(todolist[i].id == id) {
            todolist[i].todo = content;
            // We change cancel state
            var previous = a.storage.memory.get('todo-' + id);

            // We do a ulgy pregreplace but it does work !
            previous = previous.replace(new RegExp("<a id='todo-content-" +
                        id + "' class='todo'>(.*)</a>", 'gi'), 
                        "<a id='todo-content-" + id + "' class='todo'>" + 
                        content + '</a>');
            a.storage.memory.set('todo-' + id, previous);
        }
    }

    // We save and unload
    a.storage.set('todolist', todolist);
    a.state.unload('todolist-modify-show');
};

/**
 * Remove a todo from existing todo list
 *
 * @method todoRemove
 *
 * @param id {Integer}                      The id to remove
*/
function todoRemove(id) {
    var todolist = a.storage.get('todolist'),
        i = todolist.length;

    while(i--) {
        if(todolist[i].id == id) {
            todolist.splice(i, 1);
        }
    }

    // Storing item
    a.storage.set('todolist', todolist);

    // IMPORTANT: Forcing reloading template
    a.state.load('todolist');
};