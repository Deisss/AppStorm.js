/* ************************************************************************

    License: MIT Licence

    Authors: VILLETTE Charles

    Date: 2013-05-10

    Date of last modification: 2013-10-11

    Dependencies : [
        a.js
        core/environment.js
    ]

    Events : []

    Description:
        Console functionnality, the system will automatically choose what kind of console is acceptable or not

************************************************************************ */


/**
 * wrapper for system console, allowing to use console even if there is not console support on given browser.
 * Also, it does provide a trace utility in case of bug/check
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:console">here</a>
 *
 * @class console
 * @static
 * @namespace a
*/
a.console = (function() {
    "use strict";

    // Store some data if console.log is not available
    var __data = {log : [], warn : [], info : [], error : []};

    /**
     * Output to console any given value. If console is not ready, the content will be stored into object, the list function allow to access stored content in this case
     *
     * @method __out
     * @private
     *
     * @param type {String} The type, like "log", "warn", "info", "error", ...
     * @param value {Mixed} The value to output
     * @param level {Integer | null} Indicate the message priority level, can be null
     * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
    */
    function __out(type, value, level, appear) {
        // Rollback to log in case of problem
        if(!a.isArray(__data[type])) {
            type = "log";
        }
        __data[type].push(value);

        // Bug: IE does not support testing variable existence if they are not scopped with the root (here window)
        if(!a.isNone(window.console) && a.isFunction(window.console.log) && appear !== false) {
            // We disable log depending of console level.
            // If no console, or log level, we allow all
            switch(a.environment.get("console")) {
                case "error":
                    if(type !== "error") {
                        break;
                    }
                case "warning":
                case "warn":
                    if(type !== "warn" && type !== "error") {
                        break;
                    }
                case "info":
                    if(type === "log") {
                        break;
                    }
                default:
                    var print = true,
                        found = false;

                    // We search for fine verbose element
                    if(a.isString(value) && value.indexOf(":") >= 0) {
                        var name     = value.substr(0, value.indexOf(":")),
                            splitted = name.split("."),
                            i        = splitted.length;

                        // We go from full array recomposed, to only first item
                        while(i--) {
                            var key = "verbose-" + splitted.join("."),
                                en  = a.environment.get(key);

                            if(!a.isNone(en)) {
                                found = true;
                                print = (en < level) ? false : true;
                                break;
                            }

                            // We don't find any, we go one level up
                            splitted.pop();
                        }
                    }

                    // Check the verbose state to know if we should print or not
                    if(!found && !a.isNone(a.environment.get("verbose")) && !a.isNone(level)) {
                        var iverb = parseInt(a.environment.get("verbose"), 10);
                        if(iverb < level) {
                            print = false;
                        }
                    }
                    if(print) {
                        window.console[type](value);
                    }
                    break;
            };
        }

        // If data exceed limit, we remove some
        while(__data[type].length > 2000) {
            __data[type].shift();
        }
    };

    return {
        /**
         * Log data
         *
         * @method log
         *
         * @param value {Mixed} The value to log on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        log : function(value, level, appear) {      __out("log", value, level, appear); },

        /**
         * Warning data
         *
         * @method warn
         *
         * @param value {Mixed} The value to warning on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        warn : function(value, level, appear) { __out("warn", value, level, appear);    },

        /**
         * Information data
         *
         * @method info
         *
         * @param value {Mixed} The value to inform on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        info : function(value, level, appear) { __out("info", value, level, appear);    },

        /**
         * Error data
         *
         * @method error
         *
         * @param value {Mixed} The value to error on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        error : function(value, level, appear) {    __out("error", value, level, appear);   },

        /**
         * List all currently stored content
         *
         * @method trace
         *
         * @param type {String | null} The string type (can be null)
         * @return The stored data, the object got 4 properties : log, info, warn, error
        */
        trace : function(type) {
            return (a.isString(type) && type in __data) ? __data[type] : __data;
        },

        /**
         * Clear the stored content
         *
         * @method clear
        */
        clear : function() {
            __data = {log : [], warn : [], info : [], error : []};
        }
    };
}());
