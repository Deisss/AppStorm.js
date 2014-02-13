/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/hash.js
        core/mem.js
    ]

    Events : []

    Description:
        Manage action related to hash change.

************************************************************************ */


/**
 * Manage action related to hash change.
 *
 * @class route
 * @static
 * @namespace a
*/
a.route = new function() {
    var mem = a.mem.getInstance('app.route');

    /**
     * Parse the action parameter.
     *
     * @method getAction
     * @private
     *
     * @param action {String}               The action to filter
     * @return {String}                     'leave' or 'enter' depending on
     *                                      what is found in action parameter
    */
    function getAction(action) {
        return (action == 'leave' || action == 'leaving') ? 'leave' : 'enter';
    };

    /**
     * bind a function to a hash.
     *
     * @method bind
     * @chainable
     *
     * @param hash {String}                 The hash to register
     * @param fct {Function}                The function to bind
     * @param action {String | null}        The action element, if we use this
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
     * @param unbind
     * @chainable
     *
     * @param hash {String}                 The hash to remove function from
     * @param fct {Function}                The function to unbind
     * @param action {String | null}        The action element, if we use this
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
     * @method otherwise
     * @chainable
     *
     * @param fct {Function}                The function to use when otherwise
     *                                      is meet
     * @param action {String | null}        The action element, if we use this
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
     * @method go
     *
     * @param hash {String}                 The hashtag to navigate to
    */
    this.go = function(hash) {
        if(hash) {
            window.location.href = '#' + hash;
        }
    };

    /**
     * Apply change to hash on enter or leave position.
     *
     * @method callApplyHashChange
     * @private
     *
     * @param hash {String}                 The hash to load/unload
     * @param leaveOrEnterString {String}   The enter/leave state
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
    });
};