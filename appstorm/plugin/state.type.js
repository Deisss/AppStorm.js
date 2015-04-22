/*! ***********************************************************************

    License: MIT Licence

    Description:
        State type to manage custom system type.

************************************************************************ */

/**
 * State type to manage custom system type.
 * A type can be for example 'replace', 'append', it's used between transition
 * during html loading or unloading of a given state.
 *
 * @constructor
*/
a.state.type = {
    /**
     * The store.
     *
     * @property _store
     * @private
    */
    _store: a.mem.getInstance('app.state.type'),

    /**
     * Add a new type to state system.
     * Type allow you to control how the html will be loaded to system.
     *
     * @param {String} name                 The name to use inside state
     * @param {Function} input              The function to call when name is
     *                                      found on a loading state.
     *                                      The first param given to this
     *                                      function will be entry point
     *                                      (a.dom), then the html, and finally
     *                                      if async the chain object.
     *                                      This is the function to call on
     *                                      input
     * @param {Function} output             The function to call on output
     * @param {Boolean} async               Indicate if the type should be run
     *                                      as an async or not. If the async
     *                                      is set to true, the last parameter
     *                                      will be the chain objet to continue
     *                                      like in default state.
    */
    add: function(name, input, output, async) {
        this._store.set(name, {
            input:  input,
            output: output,
            async:  async
        });
    },

    /**
     * Remove a type from existing type elements.
     *
     * @param {String} name                 The type name to remove
    */
    remove: function(name) {
        this._store.remove(name);
    },

    /**
     * Get a type from existing type list.
     *
     * @param {String} name                 The name to get
     * @return {Object | Function | Null}   The founded elements
    */
    get: function(name) {
        return this._store.get(name);
    },

    /**
     * Print the full list of type currently available.
     *
     * @return {Object}                     The list of types found
    */
    list: function() {
        return this._store.list();
    }

    /*!
     * @private
    */
};
