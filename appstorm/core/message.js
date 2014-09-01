/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js
    ]

    Events : [
        a.message.add {
            type : the type listeners (like "a.storage.add"),
            function : the associated function
        }
        a.message.remove {
            type : the type listeners (like "a.storage.add"),
            function : the associated function
        }
        a.message.removeAll {
            type : the type listeners (like "a.storage.add")
        }
        a.message.clear {}
    ]

    Description:
        Define one reusable object (eventEmitter)
        and create a root event system (message)
        ( @see : http://simplapi.wordpress.com/2012/09/01/custom-event-listener-in-javascript/ )

************************************************************************ */



/**
 * Simple hash change checker to allow creating multi-page system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:message">here</a>
 *
 * @class eventEmitter
 * @constructor
 * @namespace a
*/
a.eventEmitter = function(base) {
    this.eventList = {};
    this.eventBaseName = base;
};


a.eventEmitter.prototype = {
    /**
     * Clear the event listeners which don't have any function added
     *
     * @method clearEventType
     * @private
    */
    clearEventType: function() {
        // At the end, we clear unused
        // listeners array type
        // (we must go backward for multi splice problem)
        for(var i in this.eventList) {
            if(!this.eventList[i] || this.eventList[i].length < 1) {
                delete this.eventList[i];
            }
        }
    },

    /**
     * Bind a function to an event type
     *
     * @method bind
     *
     * @param type {String}                 The event type
     * @param fn {Function}                 The function to bind to event
     * @param scope {Object | null}         The scope to bind to function
     * @param once {Boolean | null}         If we should start it only once or
     *                                      not
     * @param clear {Boolean | null}        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bind: function(type, fn, scope, once, clear) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var msg = '.bind: the type cannot be bind (type: ' + type + ')';
            a.console.warn(this.eventBaseName + msg, 1);
            return;
        }

        // The function is invalid (not a function)
        if(!a.isFunction(fn)) {
            var msg = '.bind: unable to bind function, this is not a function';
            a.console.warn(this.eventBaseName + msg, 1);
            return;
        }

        if(once !== true) {
            once = false;
        }
        if(clear !== false) {
            clear = true;
        }

        // Create a new array for the given type
        if(a.isUndefined(this.eventList[type])) {
            this.eventList[type] = [];
        }

        this.eventList[type].push({
            fct:   fn,
            scope: scope || null,
            once:  once,
            clear: clear
        });

        // Dispatch event
        this.dispatch(this.eventBaseName + '.add', {
            type:  type,
            fct:   fn
        });
    },

    /**
     * Adding a listener only once
     *
     * @method bindOnce
     *
     * @param type {String}                 The event type
     * @param fn {Function}                 The function to bind to event
     * @param scope {Object | null}         The scope to bind to function
     * @param clear {Boolean | null}        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bindOnce: function(type, fn, scope, clear) {
        this.bind(type, fn, scope, true, clear);
    },

    /**
     * Removing a listener to a specific message type
     *
     * @method unbind
     *
     * @param type {String} The event name
     * @param fn {Function} The function to detach
    */
    unbind: function(type, fn) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var msg = '.unbind: the type cannot be bind (type: ' + type + ')';
            a.console.warn(this.eventBaseName + msg, 1);
            return;
        }

        // If the event type is not listed as existing,
        // we don't need to remove anything
        var elementList = this.eventList[type];
        if(a.isNone(elementList)) {
            return;
        }

        // Multiple splice : we must go backward to prevent index error
        var i = elementList.length;
        if(a.isFunction(fn)) {
            while(i--) {
                if(elementList[i].fct === fn) {
                    elementList.splice(i, 1);
                }
            }
        }

        // Dispatch event
        this.dispatch(this.eventBaseName + '.unbind', {
            type: type,
            fct:  fn
        });

        // We clear unused list type
        this.clearEventType();
    },

    /**
     * Remove all listeners for a given type
     *
     * @method unbindAll
     *
     * @param type {String} The event type to remove
    */
    unbindAll: function(type) {
        if(!a.isNone(this.eventList[type])) {
            var events = this.eventList[type],
                i = events.length;

            while(i--) {
                if(events[i].clear === true) {
                    events.splice(i, 1);
                }
            }
        }

        // We clear unused list type
        this.clearEventType();
    },

    /**
     * Clear all listeners from all event type
     *
     * @method clear
    */
    clear: function() {
        var c = this.eventBaseName + '.clear';

        for(var i in this.eventList) {
            if(i !== c) {
                this.unbindAll(i);
            }
        }

        // Dispatch event
        this.dispatch(c, {});
    },

    /**
     * Call an event, according to it's type
     *
     * @method dispatch
     *
     * @param type {String} The event name to dispatch
     * @param data {Object} Anything you want to pass threw this event
    */
    dispatch: function(type, data) {
        var dispatcher = this.eventList[type];
        if(!a.isNone(dispatcher)) {
            for(var i=0, l=dispatcher.length; i<l; ++i) {
                // Scoping to not have trouble
                (function(fct, scope) {
                    // Binding into timeout for not waiting function to finish
                    setTimeout(function() {
                        fct.call(scope, data);
                    }, 0);
                })(dispatcher[i].fct, dispatcher[i].scope);
            }
        }
    }
};


/**
 * The bus system to exchange message globally between all application object
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:message">here</a>
 *
 * @class message
 * @static
 * @requires eventEmitter
 * @uses eventEmitter
 * @namespace a
*/
a.message = new a.eventEmitter('a.message');


/*
------------------------------
  SPECIFIC READY
------------------------------
*/
(function() {
    var ready = false,
        tmp = [];

    /**
     * Internal function to call function regarding it's scope
     *
     * @method internalCall
     * @private
     *
     * @param func {Function}               The function to call
     * @param scope {Object | null}         The potential scope (optional)
    */
    function internalCall(func, scope) {
        setTimeout(function() {
            if(scope) {
                func.call(scope);
            } else {
                func();
            }
        }, 0);
    };

    a.message.bind('ready', function() {
        ready = true;
        var i = tmp.length;
        while(i--) {
            internalCall(tmp[i].func, tmp[i].scope);
        }

        // Clearing tmp (not needed anymore)
        tmp = null;
    });

    /**
     * Alias mostly used for appstorm ready event
     *
     * @method on
     *
     * @param name {String}                     The event name
     * @param func {Function}                   The function to start
     * @param scope {Object | null}             The scope to apply (optional)
    */
    a.on = function(name, func, scope) {
        var evt = name.toLowerCase();
        if(evt === 'ready' && a.isFunction(func)) {
            // Direct call, ready event already gone
            if(ready === true) {
                internalCall(func, scope);
            // Need to queue
            } else {
                tmp.push({
                    func: func,
                    scope: scope
                });
            }
        } else {
            a.message.bind(name, func, scope);
        }
    };
})();