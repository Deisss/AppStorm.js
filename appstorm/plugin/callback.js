/* ************************************************************************

    License: MIT Licence

    Description:
        Simple synchronizer/chainer for callback list of functions
        synchronizer : Load many functions at same time, when they all finish
                       raise the final callback
        chainer : Load many functions one by one, when last one finish raise
                  the final callback

************************************************************************ */

//Simple synchronizer/chainer for Array of functions
a.callback = {};


/**
 * Load many functions at same time,
 * when they all finish raise the final callback
 *
 * @class synchronizer
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.synchronizer = function(callbacks, success, error) {
    return a.extend(
            new a.callback.synchronizerInstance(
                callbacks,
                success,
                error
            ),
            new a.eventEmitter('a.callback.synchronizer')
        );
};


/**
 * synchronizerInstance, NEVER use like this,
 * use a.callback.synchronizer instead.
 *
 * @class synchronizerInstance
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.synchronizerInstance = function(callbacks, success, error) {
    this.callbacks       = callbacks || [];
    this.successFunction = success;
    this.errorFunction   = error;
    this.data            = {};
    this.resultScope     = null;
    this.scope           = null;
    this.parrallelCount  = 0;
    this.running         = false;
};

a.callback.synchronizerInstance.prototype = {
    /**
     * Add callback to existing callback list.
     * If the system is started, also append this callback to waiting queue.
     *
     * @method addCallback
     *
     * @param {Array}                       Any number of functions to chain
     *                                      The first function will be executed
     *                                      at first, and the last at last, in
     *                                      the order you give to that fct.
    */
    addCallback: function() {
        var args = a.toArray(arguments);

        this.callbacks = this.callbacks.concat(args);

        if(this.isRunning()) {
            var scope = this.scope || this,
                result = this.getResultObject();

            a.each(args, function(callback) {
                callback.call(scope, result);
            });
        }
    },

    /**
     * Remove callback from existing callback list.
     *
     * @method removeCallback
     *
     * @param fct {Function}                The function to remove from list
    */
    removeCallback: function(fct) {
        this.callbacks = a.without(this.callbacks, fct);
    },

    /**
     * Apply this scope to all callback function
     *
     * @method setScope
     *
     * @param scope {Object}                The scope to apply to callbacks
    */
    setScope: function(scope) {
        if(a.isTrueObject(scope)) {
            this.scope = scope;
        }
    },

    /**
     * Get a currently stored data.
     *
     * @method getData
     *
     * @param key {String}                  The key linked to value to get data
     * @return {Object | null}              The value previously stored and
     *                                      content
    */
    getData: function(key) {
        return this.data[key] || null;
    },

    /**
     * Set a new data stored into container
     *
     * @method setData
     *
     * @param key {String}                  The key to retrieve value later
     * @param value {Object}                Any value to store, a null or
     *                                      undefined element will erase key
     *                                      from store
    */
    setData: function(key, value) {
        if(a.isNone(value)) {
            delete this.data[key];
        } else {
            this.data[key] = value;
        }
    },

    /**
     * Get the main callback object to manipulate chain from it.
     *
     * @method getResultObject
     *
     * @return {Object}                     An object ready to use for
     *                                      controlling chain process
    */
    getResultObject: function() {
        var n = a.scope(this.next, this),
            s = a.scope(this.stop, this);
        return {
            next: n, done: n, success: n,
            fail: s, error: s, stop: s,
            setData: a.scope(this.setData, this),
            getData: a.scope(this.getData, this)
        };
    },

    /**
     * This function keeps chain to release success/error function when all
     * functions will finish their job.
     *
     * @method next
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to next callback
     *                                      as parameters
    */
    next: function() {
        this.parrallelCount--;

        // We have to raise final callback (success or error)
        // The error function is managed by stop function
        if(this.parrallelCount === 0 && this.running) {
            this.running = false;
            this.dispatch('success');

            // We raise final success function
            if(a.isFunction(this.successFunction)) {
                var scope = this.resultScope || this.scope || this;
                this.successFunction.call(scope, this.getResultObject());
            }
        }
    },

    /**
     * Stop the callback chain.
     *
     * @method stop
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to error callback
     *                                      as parameters
    */
    stop: function() {
        this.parrallelCount = 0;
        var wasRunning      = this.running;
        this.running        = false;

        var scope  = this.resultScope || this.scope || this,
            args   = a.toArray(arguments);

        this.dispatch('error');
        if(wasRunning && a.isFunction(this.errorFunction)) {
            args.push(this.getResultObject());
            this.errorFunction.apply(scope, args);
        }
    },

    /**
     * Start chainer queue.
     *
     * @method start
     *
     * @method 
    */
    start: function() {
        this.parrallelCount = this.callbacks.length;
        this.running = true;

        this.dispatch('start');

        // There is no callback, we directly jump on success
        if(this.parrallelCount <= 0) {
            // We fake parallel count to let next think it's a function
            // ending (normal process ending)
            this.parrallelCount = 1;
            this.next();
            return;
        }

        // For every callbacks existing, we start it
        var scope = this.scope || this,
            args  = a.toArray(arguments);

        args.push(this.getResultObject());

        for(var i=0, l=this.callbacks.length; i<l; ++i) {
            var callback = this.callbacks[i];
            callback.apply(scope, args);
        }
    },

    /**
     * Get if the chain system is currently running or not
     *
     * @method isRunning
     *
     * @return {Boolean}                    True: currently running
     *                                      False: currently stopped
    */
    isRunning: function() {
        return this.running;
    }
};

// Alias
a.callback.synchronizerInstance.prototype.success =
        a.callback.synchronizerInstance.prototype.next;
a.callback.synchronizerInstance.prototype.done    =
        a.callback.synchronizerInstance.prototype.next;
a.callback.synchronizerInstance.prototype.fail    =
        a.callback.synchronizerInstance.prototype.stop;
a.callback.synchronizerInstance.prototype.error   =
        a.callback.synchronizerInstance.prototype.stop;


/**
 * Load many functions one by one, when last one finish raise the final
 * callback
 *
 * @class chainer
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.chainer = function(callbacks, success, error) {
    return a.extend(
        new a.callback.chainerInstance(
            callbacks,
            success,
            error
        ),
        new a.eventEmitter('a.callback.chainer')
    );
};


/**
 * chainerInstance, NEVER use like this, use a.callback.chainer instead.
 *
 * @class chainerInstance
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.chainerInstance = function(callbacks, success, error) {
    this.callbacks       = callbacks || [];
    this.queue           = [];
    this.successFunction = success;
    this.errorFunction   = error;
    this.data            = {};
    this.resultScope     = null;
    this.scope           = null;
};


a.callback.chainerInstance.prototype = {
    /**
     * Add callback to existing callback list.
     * If the system is started, also append this callback to waiting queue.
     *
     * @method addCallback
     *
     * @param {Array}                       Any number of functions to chain
     *                                      The first function will be executed
     *                                      at first, and the last at last, in
     *                                      the order you give to that fct.
    */
    addCallback: function() {
        var args = a.toArray(arguments);

        this.callbacks = this.callbacks.concat(args);

        if(this.isRunning()) {
            this.queue = this.queue.concat(args);
        }
    },

    /**
     * Remove callback from existing callback list.
     *
     * @method removeCallback
     *
     * @param fct {Function}                The function to remove from list
    */
    removeCallback: function(fct) {
        this.callbacks = a.without(this.callbacks, fct);
        this.queue     = a.without(this.without, fct);
    },

    /**
     * Apply this scope to all callback function
     *
     * @method setScope
     *
     * @param scope {Object}                The scope to apply to callbacks
    */
    setScope: function(scope) {
        if(a.isTrueObject(scope)) {
            this.scope = scope;
        }
    },

    /**
     * Get a currently stored data.
     *
     * @method getData
     *
     * @param key {String}                  The key linked to value to get data
     * @return {Object | null}              The value previously stored and
     *                                      content
    */
    getData: function(key) {
        return this.data[key] || null;
    },

    /**
     * Set a new data stored into container
     *
     * @method setData
     *
     * @param key {String}                  The key to retrieve value later
     * @param value {Object}                Any value to store, a null or
     *                                      undefined element will erase key
     *                                      from store
    */
    setData: function(key, value) {
        if(a.isNone(value)) {
            delete this.data[key];
        } else {
            this.data[key] = value;
        }
    },

    /**
     * Get the main callback object to manipulate chain from it.
     *
     * @method getResultObject
     *
     * @return {Object}                     An object ready to use for
     *                                      controlling chain process
    */
    getResultObject: function() {
        return {
            next:    a.scope(this.next, this),
            done:    a.scope(this.next, this),
            success: a.scope(this.next, this),
            fail:    a.scope(this.stop, this),
            error:   a.scope(this.stop, this),
            stop:    a.scope(this.stop, this),
            setData: a.scope(this.setData, this),
            getData: a.scope(this.getData, this)
        };
    },

    /**
     * Go to the next function in callback chain.
     *
     * @method next
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to next callback
     *                                      as parameters
    */
    next: function() {
        var args = a.toArray(arguments),
            scope = this.scope || this;


        // We add at the end the chain/result object
        var that = this;
        args.push(this.getResultObject());

        // We stop if queue is ended
        if(!this.queue.length) {
            this.dispatch('success');

            // Success is now launched
            if(a.isFunction(this.successFunction)) {
                scope = this.resultScope || scope;
                this.successFunction.apply(scope, args);
            }
            return;
        }

        // Getting the callback
        var callback = this.queue.shift();
        if(a.isFunction(callback)) {
            // We transfert arguments from next to next callback
            callback.apply(scope, args);
        }
    },

    /**
     * Stop the callback chain.
     *
     * @method stop
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to error callback
     *                                      as parameters
    */
    stop: function() {
        this.queue = [];
        var scope  = this.scope || this,
            args   = a.toArray(arguments);

        this.dispatch('stop');
        if(a.isFunction(this.errorFunction)) {
            args.push(this.getResultObject());
            this.errorFunction.apply(scope, args);
        }
    },

    /**
     * Start chainer queue.
     *
     * @method start
    */
    start: function() {
        if(this.queue.length) {
            return;
        }

        // Preparing queue
        this.queue = a.deepClone(this.callbacks);
        this.dispatch('start');

        // Starting queue
        this.next();
    },

    /**
     * Get if the chain system is currently running or not
     *
     * @method isRunning
     *
     * @return {Boolean}                    True: currently running
     *                                      False: currently stopped
    */
    isRunning: function() {
        return this.queue.length ? true : false;
    }
};

// Alias
a.callback.chainerInstance.prototype.success =
        a.callback.chainerInstance.prototype.next;
a.callback.chainerInstance.prototype.done    =
        a.callback.chainerInstance.prototype.next;
a.callback.chainerInstance.prototype.fail    =
        a.callback.chainerInstance.prototype.stop;
a.callback.chainerInstance.prototype.error   =
        a.callback.chainerInstance.prototype.stop;
