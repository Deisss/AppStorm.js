/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js

        ** Mousetrap IS NEEDED AND IS EXTERNAL LIBRARY **
    ]

    Events : []

    Description: Simple wrapper for Mousetrap to have unified interface with AppStorm.JS system

************************************************************************ */

/**
 * Simple wrapper for Mousetrap to have unified interface with other AppStorm.JS system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:keyboard">here</a>
 *
 * @class keyboard
 * @static
 * @namespace a
*/
a.keyboard = (function(mt) {
    "use strict";

    var _k = "a.keyboard.";

    // No mousetrap support, create dummy empty object
    if(a.isNone(mt)) {
        a.console.error(_k + "global: error, Mousetrap is undefined, the plugin a.keyboard will not work", 1);
        return {
            addListener : function(){},
            removeListener : function(){},
            reset : function(){},
            clear : function(){}
        };

    // Create a simple binding between Mousetrap implementation, and AppStorm.JS implementation
    } else {
        return {
            /**
             * Register a function for a given keypress command
             *
             * @method addListener
             *
             * @param key {String} The key/keylist to bind
             * @param fct {Function} The function to bind
            */
            addListener : function(key, fct) {
                a.console.log(_k + "addListener: bind key: " + key, 3);
                mt.bind(key, fct);
            },
            /**
             * Remove a binding for a given key
             *
             * @method removeListener
             *
             * @param key {String} The key/keylist to unbind
            */
            removeListener : function(key) {
                a.console.log(_k + "removeLister: remove listener on key: " + key, 3);
                mt.unbind(key);
            },
            /**
             * Reset all bindings
             *
             * @method reset
            */
            reset : function() {
                a.console.log(_k + "reset: clear all keys", 3);
                mt.reset();
            },
            /**
             * Reset all bindings
             *
             * @method clear
            */
            clear : function() {
                a.console.log(_k + "clear: clear all keys", 3);
                mt.reset();
            }
        }
    }
}(window.Mousetrap));