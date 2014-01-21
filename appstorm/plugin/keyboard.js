/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/mem.js
        core/console.js

        ** Mousetrap IS NEEDED AND IS EXTERNAL LIBRARY **
    ]

    Events : []

    Description:
        Simple wrapper for Mousetrap to have unified interface with
        AppStorm.JS system: it does provide multi binding for one key
        (compare to MouseTrap which only allow one key = one function)

************************************************************************ */

/**
 * Simple wrapper for Mousetrap to have unified
 * interface with other AppStorm.JS system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:keyboard">here</a>
 *
 * @class keyboard
 * @static
 * @namespace a
*/
a.keyboard = (function(mt) {
    'use strict';

    var mem = a.mem.getInstance('app.accelerator');

    /**
     * Remove all existing event binded to keyboard
     *
     * @method clearAllKeyboardEvents
     * @private
    */
    function clearAllKeyboardEvents() {
        mem.clear();
        mt.reset();
    };

    /**
     * Start to watch a key
     *
     * @method generateKeyBinding
     * @private
     *
     * @private key {String}            The key to bind
     * @return {Function}               A function to catch key event and
     *                                  dispatch
    */
    function generateKeyBinding(key) {
        return function globalKeyboardBinding(e) {
            // TODO: pass e in args
            var bindArray = mem.get(key) || [],
                i = bindArray.length;

            while(i--) {
                var fn  = bindArray[i].fct,
                    scp = bindArray[i].scope;

                // We cut the toolchain to make it 'event ready'
                // This allow to skip waiting long time functions
                setTimeout(
                    function() {
                        fn.call(scp, e);
                    }
                , 0);
            }
        };
    };

    // No mousetrap support, create dummy empty object
    if(a.isNone(mt)) {
        a.console.error('a.keyboard: error, Mousetrap is undefined!', 1);
        var nullFunction = function() {};
        return {
            bind: nullFunction,
            unbind: nullFunction,
            reset: nullFunction,
            clear: nullFunction
        };

    // Create a simple binding between Mousetrap implementation
    // and AppStorm.JS implementation
    } else {
        return {
            /**
             * Register a function for a given keypress command
             *
             * @method bind
             *
             * @param key {String}           The key/keylist to bind
             * @param fn {Function}          The function to bind
             * @param scope {Object || null} The scope to apply when binding
            */
            bind: function(key, fn, scope) {
                if(!key || !a.isFunction(fn)) {
                    return;
                }

                var bindArray = mem.get(key) || [];

                bindArray.push({
                    fct: fn,
                    scope: scope || mt
                });

                mem.set(key, bindArray);

                // This is the first entry, start to watch the key binding
                if(bindArray.length == 1) {
                    var globalCatcher = generateKeyBinding(key);
                    mt.bind(key, globalCatcher);
                }
            },

            /**
             * Remove a binding for a given key
             *
             * @method unbind
             *
             * @param key {String}          The key/keylist to unbind
             * @param fn {Function}         The function to unbind
            */
            unbind: function(key, fn) {
                if(!a.isFunction(fn)) {
                    return;
                }

                var bindArray = mem.get(key);

                if(bindArray) {
                    var i = bindArray.length;
                    while(i--) {
                        if(bindArray[i].fct === fn) {
                            bindArray.splice(i, 1);
                        }
                    }

                    // There is no binding anymore, we stop binding
                    if(bindArray.length == 0) {
                        mem.remove(key);
                        mt.unbind(key);
                    }
                }
            },

            /**
             * Reset all bindings
             *
             * @method reset
            */
            reset: clearAllKeyboardEvents,

            /**
             * Reset all bindings
             *
             * @method clear
            */
            clear: clearAllKeyboardEvents
        };
    }
}(window.Mousetrap));