/* ************************************************************************

    License: MIT Licence

    Dependencies: [
        a.js
    ]

    Events: [
        a.environment.add: {
            key:   the environment key added/modified,
            value: the value for this key
        }
        a.environment.remove: {
            key:   the environment key removed
        }
    ]

    Description:
        Environment functionnality, to get access to some basic
        "main options" for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some global
 * rules for managing global environment variable
 *
 * Examples:
 *     <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:environment">here</a>
 *
 * @class environment
 * @static
 * @namespace a
*/
a.environment = {
    /*
     * DON'T USE DIRECTLY
     *
     * Internal store
    */
    _store: {
        'verbose': 2,
        'console': 'log'
    },

    /**
     * Get the stored value for given key, null if nothing is stored
     *
     * @method get
     *
     * @param key {String}     The key to retreive
     * @return {Mixed | null} The result data, or null if key is not found
    */
    get: function(key) {
        return (key in this._store) ? this._store[key] : null;
    },

    /**
     * Store or modify the key data with incoming value
     *
     * @method set
     *
     * @param key {String}     The key to store
     * @param value {Mixed}    Some data to associate to the key
    */
    set: function(key, value) {
        if(a.isNull(key)) {
            return;
        }

        this._store[key] = value;

        // Dispatch event
        a.message.dispatch('a.environment.add', {
            key:   key,
            value: value
        });
    },

    /**
     * Remove a key stored
     *
     * @method remove
     *
     * @param key {String} The stored key to remove
    */
    remove: function(key) {
        if(a.isNull(this._store[key])) {
            return;
        }

        delete this._store[key];

        // Dispatch event
        a.message.dispatch('a.environment.remove', {
            key: key
        });
    },

    /**
     * Erase everything and rollback to inital change (verbose:2, console: log)
     *
     * @method clear
    */
    clear: function() {
        this._store = {
            'verbose': 2,
            'console': 'log'
        };
    }
};