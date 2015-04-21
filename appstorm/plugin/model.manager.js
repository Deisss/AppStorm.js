/*! ***********************************************************************

    License: MIT Licence

    Description:
        Keep a trace of every created model, to be able to search them
        with ease.

************************************************************************ */


/**
 * A model manager helps to keep a trace of every model currently used by the
 * application.
 *
 * @constructor
*/
a.model.manager = {
    /**
     * Store a pointer to every instance of every model created.
     *
     * @property _store
     * @private
     * @type Object
     * @default {}
    */
    _store: a.mem.getInstance('app.model.instance'),

    /**
     * Store a new model into the manager.
     *
     * @param {Object} model                The new model to store
    */
    set: function(model) {
        this._store.set(model.uid, model);
    },

    /**
     * Get a model from it's uid (the unique id is automatically generated
     * for every model, it's available threw myModelInstance.uid).
     *
     * @param {Integer} uid                 The unique id to search related
     *                                      model from
     * @return {Object | Null}              The related model found, or null if
     *                                      nothing is found
    */
    get: function(uid) {
        return this._store.get(uid);
    },

    /**
     * Remove a model from store.
     *
     * @param {Integer} uid                 The uid to remove
    */
    remove: function(uid) {
        this._store.remove(uid);
    },

    /**
     * Get the full model list.
     *
     * @return {Array}                      The list of stored models
    */
    list: function() {
        return this._store.list();
    },

    /**
     * Remove all existing model from store.
    */
    clear: function() {
        this._store.clear();
    },

    /**
     * Get all models related to a given namespace. For example, if you create
     * a.model('user'), this function helps to find all *user* model created.
     *
     * @param {String} name                 The model name to find
     * @return {Array}                      The array with all model instance
     *                                      related to this name
    */
    getByName: function(name) {
        if(!name || !a.isString(name)) {
            return [];
        }

        var result = [];

        a.each(this._store.list(), function(element) {
            if(element.modelName === name) {
                result.push(element);
            }
        });

        return result;
    }

    /*!
     * @private
    */
};