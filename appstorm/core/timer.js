/* ************************************************************************

    License: MIT Licence

    Authors: VILLETTE Charles

    Date: 2013-05-10

    Date of last modification: 2013-10-20

    Dependencies : [
        a.js
    ]

    Events : []

    Description:
        Simple timer system, provide a single timer for many bindings

************************************************************************ */

/**
 * Simple timer system, provide a single timer for many bindings
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:timer">here</a>
 *
 * @class timer
 * @static
 * @namespace a
*/
a.timer = (function() {
    'use strict';

    // Internal data
    var _delay = 50,
        _data  = {};

    /**
     * Proceed timer tick
     *
     * @method _tick
     * @private
    */
    function _tick() {
        // We dispatch a new tick
        a.message.dispatch('a.timer.tick', {});

        // For every stored function, we scan and apply
        for(var i in _data) {
            var obj = _data[i];
            obj.current += _delay;

            // If it's time to tick
            if(obj.current >= obj.timeout) {
                obj.current = 0;
                if(a.isFunction(obj.fct)) {
                    // Call function on tick OK
                    obj.fct.call(obj.scope || this);
                }
            }
        }
    };

    /**
     * Generate a new random
     *
     * @method _generate
     * @private
     *
     * @return {Integer}      A new integer generated
    */
    function _generate() {
        var rnd = Math.floor(Math.random() * 1000000);

        while(!a.isNull(_data[rnd])) {
            rnd = Math.floor(Math.random() * 1000000)
        }

        return rnd;
    };

    // Auto-start timer
    setInterval(_tick, _delay);

    return {
        /**
         * Register a function for regular timer tick
         *
         * @method add
         * @async
         *
         * @param fct {Function}        The function to bind
         * @param scope {Object | null} The scope to use when calling function
         * @param timeout {Integer}     The timeout between two call
         * @return {Integer}            A generated id used to access
         *                              this entry
        */
        add: function(fct, scope, timeout) {
            var id = _generate();

            if(!a.isNumber(timeout) || timeout <= 0) {
                timeout = 1000;
                a.console.error('The timeout has not been setted properly ' +
                                    'into timer, timeout has been ' +
                                    'setted to 1000ms', 1);
            }

            _data[id] = {
                fct:     fct,
                scope:   scope,
                timeout: timeout,
                current: 0
            };
            return id;
        },

        /**
         * Register a function for a single timer tick
         *
         * @method once
         * @async
         *
         * @param fct {Function}        The function to bind
         * @param scope {Object | null} The scope to use when calling function
         * @param timeout {Integer}     The timeout when calling function
         * @return {Integer}            A generated id used to
         *                              manipulate ticker access
        */
        once: function(fct, scope, timeout) {
            var id = this.add(
                function() {
                    if(a.isFunction(fct)) {
                        fct.call(this);
                    }
                    a.timer.remove(id);
                },
            scope, timeout);
            return id;
        },

        /**
         * Get a function registred into the timer
         *
         * @method get
         *
         * @return {Object | null}      The object linked to id,
         *                              or null if nothing is related to id
        */
        get: function(id) {
            var item = _data[id];
            return a.isNull(item) ? null : item;
        },

        /**
         * Remove a function currently stored into the timer
         *
         * @method remove
         *
         * @param id {Integer}         The id to delete
         * @return {Boolean}           The item has been delete or not
        */
        remove : function(id) {
            return delete _data[id];
        },

        /**
         * Clear the current timer
         *
         * @method clear
        */
        clear : function() {
            _data = {};
        }
    };
})();