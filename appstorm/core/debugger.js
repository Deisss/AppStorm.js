/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/environment.js
    ]

    Events : []

    Description:
        Debugger functionnality including nested group system like console
        usually provide

************************************************************************ */

(function(win, a) {
    'use strict';

    var concurrentConsoleAccess = false;

    /*
     * Debugger is a wrapper around window.console to provide a more
     * structured way to access and use group system provided by console.
     *
     * @class console
     * @static
     * @namespace a
    */
    a.debugger = function(name, collapsed, parent) {
        this._name = name;
        this._collapsed = collapsed || false;
        this._parent = parent || null;
        this._logs = [];
    };

    a.debugger.prototype = {
        /**
         * Create a group inside this debugger
         *
         * @method group
         *
         * @param name {String}                 The new sub group name
         * @param collapsed {Boolean | null}    If we should collapse or not when
         *                                      printing to console
         * @return {a.debugger}                 The debugger associated
        */
        group: function(name, collapsed) {
            var debug = new a.debugger(name, collapsed, this);
            this._logs.push({
                type: 'group',
                args: debug
            });
            return debug;
        },

        /**
         * Render the group and all sub groups into console
         *
         * @method print
         *
         * @param level {String | null}     The minimum level to print element
         *                                  on console
        */
        print: function(level) {
            // Somebody is already using it... We have to wait a while
            if(this._parent === null && concurrentConsoleAccess === true) {
                setTimeout(this.print, 50);
                return;
            }

            // Take care of level if needed
            // Quit if needed to render this debugger
            if(level) {
                switch(a.environment.get('console')) {
                    case 'error':
                        if(level !== 'error') {
                            return;
                        }
                    case 'warning':
                    case 'warn':
                        if(level !== 'warn' && level !== 'error') {
                            return;
                        }
                    case 'info':
                        if(level === 'log') {
                            return;
                        }
                }
            }

            // The root (the original one), lock the console
            // to not pollute with other eventual print
            if(this._parent === null) {
                concurrentConsoleAccess = true;
            }

            // Starting groups
            if(this._collapsed === true) {
                console.groupCollapsed(this._name);
            } else {
                console.group(this._name);
            }

            // Loggings
            var logs = this._logs;
            for(var i=0, l=logs.length; i<l; ++i) {
                var log = logs[i],
                    type = log['type'];

                if(type === 'group') {
                    var group = log['args'];
                    group.print();
                }else if(typeof(win.console[type]) !== 'undefined') {
                    var fct = win.console[type];
                    fct.apply(null, log['args']);
                }
            }

            // Ending group
            console.groupEnd();

            if(this._parent == null) {
                concurrentConsoleAccess = false;
            }
        },

        /**
         * Log something into console
         *
         * @method log
         *
         * @param any {Object}              Anything to send to console
        */
        log: function() {

            this._logs.push({
                type: 'log',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Log something into console
         *
         * @method warn
         *
         * @param any {Object}              Anything to send to console
        */
        warn: function() {
            this._logs.push({
                type: 'warn',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Log something into info
         *
         * @method info
         *
         * @param any {Object}              Anything to send to console
        */
        info: function() {
            this._logs.push({
                type: 'info',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Log something into error
         *
         * @method error
         *
         * @param any {Object}              Anything to send to console
        */
        error: function() {
            this._logs.push({
                type: 'error',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Get the current trace stored into debugger
         *
         * @return {Array}                  The tracelog currently stored
        */
        trace: function() {
            return this._logs;
        },

        /**
         * Clear the debugger
         *
         * @method clear
        */
        clear: function() {
            this._logs = [];
        }
    };
})(window, window.appstorm);