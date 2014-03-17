// Root controller system, loading main app system here
(function() {
    // Simple home loading content
    var home = {
        id:    'home',
        entry: '#page-container',
        type:  'replace',
        include: {
            html: 'resource/html/home.html'
        },

        // We define a children for not having trouble with filter
        // (we separate them, so filter is not always erased)
        children: [
            {
                id:    'todolist',
                hash:  'todolist',
                entry: '#todolist',
                type:  'replace',
                include: {
                    html: 'resource/html/todolist.html'
                },

                // You can bind storage into data easily
                data: {
                    todolist: '{{storage: todolist}}'
                },

                // We use converter to load from internal storage.
                // The converter allow to perform modification on data
                // before rendering, even if no data are loaded
                // We use it to add storage data (instead of loading url),
                // and apply filter to it
                converter: function(data) {
                    // We catch the filter to check if we have to remove some item
                    var filter = a.dom.id('filter-todo').get(0);

                    if(data && filter && filter.value.length > 0) {
                        var val = filter.value,
                            i   = data.todolist.length;

                        while(i--) {
                            if(data.todolist[i].todo.search(val) === -1) {
                                data.todolist.splice(i, 1);
                            }
                        }
                        data.filter = val;
                    }

                    // We simply reverse order to make it
                    // "last inserted first view"
                    if(a.isArray(data.todolist)) {
                        data.todolist.reverse();
                    }
                }
            },
            {
                // This controller is always loaded manually to modify a note
                id:    'todolist-modify-show',
                include: {
                    html: 'resource/html/todo-modify.html'
                },

                // In this case we load from memory store
                data: {
                    id: '{{memory: current-todo-modify-show}}'
                },

                // We append current showed element to data
                converter: function(data) {
                    data.content = a.dom.id('todo-content-' + data.id).get(0)
                                                            .innerHTML;
                },

                // Even if it's ugly, we can still manually create
                // the element to replace with
                load: function() {
                    var id = a.storage.memory.get('current-todo-modify-show'),
                        el = a.dom.id('todo-' + id).get(0);

                    // We can clear the id
                    a.storage.memory.remove('current-todo-modify-show');

                    // We store previous content, in case of cancel
                    a.storage.memory.set('todo-' + id, el.innerHTML);
                    //a.page.template.replace(el, content);
                    console.log(this);
                },

                // Rollback changes
                preUnload: function() {
                    var id = a.storage.memory.get('current-todo-modify-show'),
                        el = a.dom.id('todo-' + id);
                    a.page.template.replace(el,
                                        a.storage.memory.get('todo-' + id));
                }
            }
        ]
    };

    // Finally we add elements to system
    a.state.add(home);
})();