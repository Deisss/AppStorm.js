/* ************************************************************************

    License: MIT Licence

    Dependencies: [
        a.js
        core/message.js
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
a.environment = new function() {
    /*
     * DON'T USE DIRECTLY
     *
     * Internal store
    */
    var store = {
        'verbose': 2,
        'console': 'log'
    };

    /**
     * Get the stored value for given key, null if nothing is stored
     *
     * @method get
     *
     * @param key {String}     The key to retreive
     * @return {Mixed | null} The result data, or null if key is not found
    */
    this.get = function(key) {
        return (key in store) ? store[key] : null;
    };

    /**
     * Store or modify the key data with incoming value
     *
     * @method set
     *
     * @param key {String}     The key to store
     * @param value {Mixed}    Some data to associate to the key
    */
    this.set = function(key, value) {
        if(a.isNone(key)) {
            return;
        }

        store[key] = value;

        // Dispatch event
        a.message.dispatch('a.environment.add', {
            key:   key,
            value: value
        });
    };

    /**
     * Remove a key stored
     *
     * @method remove
     *
     * @param key {String} The stored key to remove
    */
    this.remove = function(key) {
        if(a.isNone(store[key])) {
            return;
        }

        delete store[key];

        // Dispatch event
        a.message.dispatch('a.environment.remove', {
            key: key
        });
    };

    /**
     * Erase everything and rollback to inital change (verbose:2, console: log)
     *
     * @method clear
    */
    this.clear = function() {
        store = {
            'verbose': 2,
            'console': 'log'
        };
    };
};