/* ************************************************************************

    License: MIT Licence

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
     * @param key {String}              The key to bind (with type)
     * @return {Function}               A function to catch key event and
     *                                  dispatch
    */
    function generateKeyBinding(key) {
        return function globalKeyboardBinding(e) {
            var bindArray = mem.get(key) || [],
                i = bindArray.length,
                evtObject = {
                    stopPropagation: function() {
                        if(e.stopPropagation) {
                            e.stopPropagation();
                        } else {
                            e.cancelBubble = true;
                        }
                    },
                    preventDefault: function() {
                        if(e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    },
                    _e: e,
                    event: e,
                    originalEvent: e
                };

            var result = true;
            while(i--) {
                var fn  = bindArray[i].fct,
                    scp = bindArray[i].scope;

                // We don't apply a timeout here to catch return value
                var tmp = fn.call(scp, evtObject);
                if(tmp === false) {
                    result = false;
                }
            }

            return result;
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
             * @param scope {Object | null}  The scope to apply when binding
             * @param type {String | null}   The type like 'keydown', 'keyup'..
             *                               default: keypress
            */
            bind: function(key, fn, scope, type) {
                if(!key || !a.isFunction(fn)) {
                    return;
                }

                // Selecting the right type
                type = (a.isString(type) && type) ? type: 'keypress';

                var finalKey = type + '.' + key,
                    bindArray = mem.get(finalKey) || [];

                bindArray.push({
                    fct: fn,
                    scope: scope || mt
                });

                mem.set(finalKey, bindArray);

                // This is the first entry, start to watch the key binding
                if(bindArray.length == 1) {
                    var globalCatcher = generateKeyBinding(finalKey);
                    mt.bind(key, globalCatcher, type);
                }
            },

            /**
             * Remove a binding for a given key
             *
             * @method unbind
             *
             * @param key {String}          The key/keylist to unbind
             * @param fn {Function}         The function to unbind
             * @param type {String | null}   The type like 'keydown', 'keyup'..
             *                               default: keypress
            */
            unbind: function(key, fn, type) {
                if(!a.isFunction(fn)) {
                    return;
                }

                // Selecting the right type
                type = (a.isString(type) && type) ? type: 'keypress';

                var finalKey = type + '.' + key,
                    bindArray = mem.get(finalKey) || [];

                if(bindArray) {
                    var i = bindArray.length;
                    while(i--) {
                        if(bindArray[i].fct === fn) {
                            bindArray.splice(i, 1);
                        }
                    }

                    // There is no binding anymore, we stop binding
                    if(bindArray.length == 0) {
                        mem.remove(finalKey);
                        mt.unbind(key, type);
                    }
                }
            },

            /**
             * Fake a keyboard key press
             *
             * @method trigger
             *
             * @param keys {String | Array} The list of keys/single key to
             *                              trigger
             * @param action {String}       The action (like keypress, keyup)
            */
            trigger: function(keys, action) {
                mt.trigger(keys, action);
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