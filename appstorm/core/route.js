/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manage action related to hash change.

************************************************************************ */


/**
 * Manage action related to hash change.
 *
 * @constructor
*/
a.route = new function() {
    var mem = a.mem.getInstance('app.route');

    /**
     * Parse the action parameter.
     *
     * @private
     *
     * @param {String} action               The action to filter
     * @return {String}                     'leave' or 'enter' depending on
     *                                      what is found in action parameter
    */
    function getAction(action) {
        return (action == 'leave' || action == 'leaving') ? 'leave' : 'enter';
    };

    /**
     * bind a function to a hash.
     *
     * @chainable
     *
     * @param {String} hash                 The hash to register
     * @param {Function} fct                The function to bind
     * @param {String | Null} action        The action element, if we use this
     *                                      for entering hash, or leaving hash
     *                                      (default: entering), possible val:
     *                                      'leave' or 'enter'
    */
    this.bind = function(hash, fct, action) {
        action = getAction(action) + '.hash';
        var storage = mem.get(action) || {};

        if(!storage[hash]) {
            storage[hash] = [];
        }

        storage[hash].push(fct);
        mem.set(action, storage);
        return this;
    };

    /**
     * Remove a binding with a previous hash associated.
     *
     * @chainable
     *
     * @param {String} hash                 The hash to remove function from
     * @param {Function} fct                The function to unbind
     * @param {String | Null} action        The action element, if we use this
     *                                      for entering hash, or leaving hash
     *                                      (default: entering), possible val:
     *                                      'leave' or 'enter'
    */
    this.unbind = function(hash, fct, action) {
        action = getAction(action) + '.hash';
        var storage = mem.get(action) || {};
        if(storage[hash]) {
            storage[hash] = a.without(storage[hash], fct);
            if(storage[hash].length < 1) {
                delete storage[hash];
            }
            mem.set(action, storage);
        }
        return this;
    };

    /**
     * The otherwise function is used when no function are linked to a given
     * hash.
     *
     * @chainable
     *
     * @param {Function} fct                The function to use when otherwise
     *                                      is meet
     * @param {String | Null} action        The action element, if we use this
     *                                      for entering hash, or leaving hash
     *                                      (default: entering), possible val:
     *                                      'leave' or 'enter'
    */
    this.otherwise = function(fct, action) {
        action = getAction(action) + '.otherwise';
        if(a.isNone(fct)) {
            mem.remove(action);
        } else {
            mem.set(action, fct);
        }
        return this;
    };

    /**
     * Navigate to a given hashtag.
     *
     * @param {String} hash                 The hashtag to navigate to
     * @param {Object} parameters           Any parameters to give to state
     *                                      system as temp data. This is an
     *                                      equivalent to a.state.inject func.
    */
    this.go = function(hash, parameters) {
        if(parameters) {
            a.state.inject(parameters);
        }
        if(hash) {
            //if( ('history' in window) && history.pushState ) {
            //    window.history.pushState(parameters || {}, null, '#' + hash);
            //} else {
                window.location.href = '#' + hash;
            //}
        }
    };

    // Aliases
    this.href     = this.go;
    this.ref      = this.go;
    this.hash     = this.go;
    this.hashtag  = this.go;
    this.navigate = this.go;

    /**
     * This function act like the go/href/ref/hash/hashtag/navigate function,
     * but fake it (hash in browser does not really change).
     *
     * @method fake
     *
     * @param {String} hash                 The hashtag to navigate to
     * @param {Object} parameters           Any parameters to give to state
     *                                      system as temp data. This is an
     *                                      equivalent to a.state.inject func.
    */
    this.fake = function(hash, parameters) {
        if(parameters) {
            a.state.inject(parameters);
        }
        if(hash) {
            a.hash.fake(hash);
        }
    };

    /**
     * Go back one time into history.
    */
    this.back = function() {
        window.history.back();
    };

    /**
     * Apply change to hash on enter or leave position.
     *
     * @private
     *
     * @param {String} hash                 The hash to load/unload
     * @param {String} leaveOrEnterString   The enter/leave state
    */
    function callApplyHashChange(hash, leaveOrEnterString) {
        var action  = mem.get(leaveOrEnterString + '.hash') || {},
            storage = action[hash] || [],
            i       = storage.length;
            found   = false;

        while(i--) {
            found = true;
            // We use setTimeout to switch into event type
            // To not have function locking system
            (function(index) {
                setTimeout(function() {
                    var fct = storage[index];
                    fct.call(null, hash);
                }, 0);
            })(i);
        }

        if(!found) {
            var otherwise = mem.get(leaveOrEnterString + '.otherwise');
            if(otherwise) {
                otherwise.call(null, hash);
            }
        }
    };

    // We bind the hash event system
    a.hash.bind('change', function(data) {
        callApplyHashChange(data.value, 'enter');
        callApplyHashChange(data.old,   'leave');
    }, null, false, false);
};
