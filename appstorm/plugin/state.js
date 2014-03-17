

// dependencies: a.parameter, a.acl, a.hash

a.state = new function() {
    var tree   = {},
        loaded = [];

    /*
        Algorithm :
            1) We get id list to add, id list to delete, by selecting branch
            corresponding to hashtag searched.
            We include the loadAfter system to sub-select needed elements
            
            2) From thoose 2 arrays, we remove duplicate
            (because it means we will unload to reload just after)

            => This tab contains all id (from delete or add), which should
               be manage by system.
            => The 2 object contains add list, or delete list, used with
               array you can found what you should add, what you should delete

            3) We start by deleting, in this case we must take the "highest"
               level, it means latest added children.
            So we start by searching maximum children level, and we delete
            from that level, to root

            4) We build exactly the opposite : we need root setup
               before adding a children to it.
            So we start from base level, and go up until latest children

            => Now system unbuild delete, and rebuild add, and takes care
               to not unbuild something which don't need to.
            Also, The system is hanble to run synchronously for going
            faster (unloading/loading item list of same level is done
            synchronously)
    */


    /**
     * Get the error associated to a given status error and state
     *
     * @method getError
     * @private
     *
     * @param state {Object}                The state related
     * @param status {Integer}              The status error code to retrieve
     * @return {Mixed}                      Any revelant data...
    */
    function getError(state, status) {
        var id = state.id;
        // Convert to str
        status = '_' + status;

        // Handle all request check (we can specify _404, _40x,
        // _4xx, generic...)
        var possibleErrorsMarker = [
            status,
            status.substring(0, status.length - 1) + 'x',
            status.substring(0, status.length - 2) + 'xx',
            'generic',
            '_generic'
        ];


        // We search the good marker to use
        for(var i=0, l=possibleErrorsMarker.length; i<l; ++i) {
            // Search allow to get the parent and so one
            var search = state,
            // Marker is the current searched marker
                marker = possibleErrorsMarker[i];

            // While we found parent, we try
            while(!a.isNull(search)) {
                // We found the error we were searching for...
                if(!a.isNone(search.error)
                    && !a.isNone(search.error[marker])){
                    return search.error[marker];

                // We don't find, we get the parent
                } else {
                    search = search.parent || null;
                }
            }
        }

        // Nothing found
        return null;
    };

    /**
     * Handle errors reporting during state load/unload.
     *
     * @method raiseError
     * @private
     *
     * @param resource {String}             The uri which fail to load
     * @param status {String}               The error status (like 404)
    */
    function raiseError(resource, status) {
        var report = {},
            state  = a.state._errorState;

        if(!a.isNone(resource)) {
            report.resource = resource;
        }
        if(!a.isNone(status)) {
            report.status = status;
        }

        // Get the error
        var raiseError = getError(state, status);

        // Raising global message
        // TODO: make state able to send requests, and make THIS as state
        // this.dispatch('error', report);
        a.message.dispatch('a.state.error', report);

        if(raiseError) {
            // TODO: make documentation how to create a proper error state
            if(a.isString(raiseError)) {
                window.location.href = '#' + raiseError;

            } else if(a.isFunction(raiseError)) {
                raiseError(state.id, resource, status);

            // No handler to catch error, we raise an error on console
            } else {
                a.console.error('a.state.raiseError: an error occurs, but ' +
                            'no error where existing to handle it. Please ' +
                            'check your error handler (status: ' + status +
                            ', state id: ' + __errorState.id + ')', 1);
            }
        }
    };



    /**
     * Load/unload a single state.
     *
     * @param performSingleState
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param state {Object}                The state to load
     * @param success {Function}            The function to continue after
     * @param error {Function}              The function to stop after
     * @param scope {Object}                The scope to use for success or
     *                                      error function ONLY
    */
    function performSingleState(loadOrUnload, state, success, error, scope) {
        var callbacks = a.pluck(a.state.chain.get(loadOrUnload), 'fct'),
            chain     = a.callback.chainer(callbacks, success, error);

        chain.scope = state;
        chain.resultScope = scope;
        chain.start();
    };

    /**
     * Load/unload a full state level.
     *
     * @method performLevelState
     * @private
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param states {Array}                The state list to load/unload
     * @param success {Function}            The function to continue after
     * @param error {Function}              The function to stop after
     * @param scope {Object}                The scope to use for success or
     *                                      error function ONLY
    */
    function performLevelState(loadOrUnload, states, success, error, scope) {
        var sync = a.callback.synchronizer(null, success, error);

        a.each(states, function(state) {
            sync.addCallback(function() {
                // We bind to this the scope of next and error to not have
                // Scope change as the sync allow that...
                performSingleState(loadOrUnload, state,
                    a.scope(this.next, this), a.scope(this.error, this), sync);
            });
        });

        sync.resultScope = scope;
        sync.start();
    };













    /**
     * Test if the full state list can be accepted or refused
     *
     * @method testAcl
     * @private
     *
     * @param states {Array}                The list of states to try
     * @return {Boolean}                    True if everything went fine,
     *                                      False in other cases
    */
    function testAcl(states) {
        // (as test is inverted from normal usage)
        var i = states.length;

        while(i--) {
            if(states[i]._storm.acl === false) {
                return false;
            }
        }

        return true;
    };

    /**
     * We get all parents from given state, including state (so it retrieve
     * the state and all parents for this state).
     *
     * @method foundParentState
     *
     * @param state {Object}                The state to get parents from
     * @return {Array}                      The array composed of state
     *                                      (first), and all sub-parents,
     *                                      in this order
    */
    function foundParentState(state) {
        var ancestor = [state];

        while(state.parent) {
            ancestor.push(state.parent);
            state = state.parent;
        }

        return ancestor;
    };

    /**
     * Found state linked to hash (including parents).
     *
     * @method foundHashState
     *
     * @param hash {String}                 The hash to search for
     * @return {Array}                      The states found (including
     *                                      parents)
    */
    function foundHashState(hash) {
        var result = [];

        for(var i in tree) {
            var state = tree[i];

            if(state._storm.hash && a.isString(state._storm.hash)) {
                var parents = [];

                // We are in non-regex mode
                if(!state._storm.isRegexHash && state._storm.hash == hash) {
                    parents = foundParentState(state);

                // We are in regex mode
                } else if(state._storm.isRegexHash) {
                    var reg = new RegExp(state._storm.hash, 'g');
                    if(reg.test(hash)) {
                        parents = foundParentState(state);
                    }
                }

                // Test ACL at the end
                if(testAcl(parents)) {
                   result.push(parents); 
                }
            }
        }

        return result;
    };


    /**
     * Unload previous state which should not stay alive.
     *
     * @method performUnloadChanges
     * @private
     *
     * @param states {Array}                The state list to unload
     * @param callback {Function}           The callback to apply after
     *                                      unloading
    */
    function performUnloadChanges(states, callback) {
        // We need the reversed order... So we apply negative sort
        var statesLevel = a.groupBy(states, function(state) {
                return -state._storm.level;
            }),
            chain = a.callback.chainer(null, callback, raiseError);

        a.each(statesLevel, function(level) {
            chain.addCallback(function() {
                performLevelState('unload', level, this.next, this.error,
                                                                    chain);
            });
        });

        chain.start();
    };

    /**
     * Load new state entering in the 'loaded' area.
     *
     * @method performLoadChanges
     * @private
     *
     * @param states {Array}                The state list to load
     * @param callback {Function}           The callback to apply after loading
    */
    function performLoadChanges(states, callback) {
        // We are in normal sort level
        var statesLevel = a.groupBy(states, function(state) {
                return state._storm.level;
            }),
            chain = a.callback.chainer(null, callback, raiseError);

        a.each(statesLevel, function(level) {
            chain.addCallback(function() {
                performLevelState('load', level, this.next, this.error, chain);
            });
        });

        chain.start();
    };


    /**
     * Main function to respond to hash change.
     *
     * @method performHashChange
     * @private
     *
     * @param data {Object}                 The event data object, with value
     *                                      as current hash, and old as
     *                                      previous hash
    */
    function performHashChange(data) {
        // TODO: bind eventEmitter from this instead
        a.message.dispatch('a.state.begin', data);

        // Remove error state
        a.state._errorState = null;

        // Using a.uniq will remove all double states found
        var currentHash  = data.value,
            previousHash = data.old,
            foundState   = foundHashState(currentHash),
            loading      = a.uniq(a.flatten(foundState)),
            unloading    = loaded,
        // Only keep difference between (= state allowed to load/unload)
            loadingIntersection   = a.difference(loading, unloading),
            unloadingIntersection = a.difference(unloading, loading);



        // Now we need to extract from foundState the top state:
        // The states who need to be refresh no matter what changes has
        // been done
        var topState = [];

        a.each(foundState, function(arrayState) {
            // For every top state, if they are appearing into loaded/unloading
            // But not into unloadingIntersection, we apply them
            if(arrayState.length > 0) {
                var top = a.first(arrayState);

                if(a.contains(unloading, top) &&
                    !a.contains(unloadingIntersection, top)) {
                    topState.push(arrayState[0]);
                }
            }
        });

        // Now we got the topState populated, we can add it:
        unloadingIntersection = a.union(unloadingIntersection, topState);
        loadingIntersection   = a.union(loadingIntersection,   topState);

        // We remove unloaded elements and add new elements
        // We do it right now to prevent some unwanted loading
        loaded = a.difference(loaded, unloadingIntersection)
                                    .concat(loadingIntersection);

        // Perform the unload/load process
        setTimeout(function() {
            performUnloadChanges(unloadingIntersection, function() {
                performLoadChanges(loadingIntersection, function() {
                    // We clear inject, and raise event
                    a.state._inject = {};
                    a.message.dispatch('a.state.end', data);
                });
            });
        }, 0);
    };









    /**
     * Perform a single ACL test on a state, with a given role.
     *
     * @method performSingleAclTest
     * @private
     *
     * @param state {Object}                The state to check
     * @param role {String}                 The acl role to test
     * @return {Boolean}                    True if role is null/not defined
     *                                      or state is ok regarding role,
     *                                      False if the state is not ok for
     *                                      the given role.
    */
    function performSingleAclTest(state, role) {
        // On an empty/erase role, we allow everything
        if(!role || a.isNone(role)) {
            return true;
        }

        var acl = state.acl || {};

        // Test minimum & maximum
        if(
            (a.isString(acl.minimum) && a.acl.isRefused(acl.minimum, role)) ||
            (a.isString(acl.maximum) && a.acl.isRefused(role, acl.maximum))
        ) {
            return false;
        }

        // Test allowed
        if(
            (a.isString(acl.allowed) && acl.allowed !== role) ||
            (a.isArray(acl.allowed) && !a.contains(acl.allowed, role))
        ) {
            return false;
        }

        // Test refused
        if(
            (a.isString(acl.refused) && acl.refused === role) ||
            (a.isArray(acl.refused) && a.contains(acl.refused, role))
        ) {
            return false;
        }

        return true;
    };

    /**
     * As ACL is put in cache, when the role change, state need to fully
     * update it's internal data.
     *
     * @method performAclChange
     * @private
     *
     * @param role {String}                 The new role to apply
    */
    function performAclChange(role) {
        a.each(tree, function(state) {
            state._storm.acl = performSingleAclTest(state, role);
        });
    };


    // Bind events from other elements
    a.hash.bind('change', performHashChange, null, false, false);
    a.acl.bind('change', performAclChange, null, false, false);
    // TODO: if user call unbindAll for any of both above
    // We have to be able to prevent such problem by re-bind it...









    /**
     * Add a state to the existing state tree
     *
     * @method add
     *
     * @param state {Object}                A state to add to system
    */
    this.add = function(state) {
        // Only for existing state
        if(a.isArray(state)) {
            a.each(state, function(element) {
                this.add(element);
            }, this);
            return;
        }

        // If the id is already defined, we create unique id
        if(!state.id || this.get(state.id) !== null) {
            state.id = a.uniqueId('state_');
        }

        // Applying children
        var children = state.children || null;
        state.children = null;

        // We are storing every needed stuff for appstorm here
        state._storm = {
            parent: state.parent || null
        };

        // If there is parent linked to it
        if(state.parent &&
                (a.isString(state.parent) || a.isNumber(state.parent)) ) {

            var parent = this.get(state.parent);
            if(parent) {
                state.parent = parent;
                // We store level
                state._storm.level = parent._storm.level + 1;
                // We store child into parent
                if(!parent.children || !a.isArray(parent.children)) {
                    parent.children = [];
                }
                parent.children.push(state);
            } else {
                a.console.error('a.state.add: unable to found parent ' + 
                    state.parent + ' for state ' + state.id);
            }
        } else {
            state.parent = null;
            state._storm.level = 0;
        }

        // Internal object to store cached value
        state._storm.data    = state.data || {};
        state._storm.options = state.options || null;

        // Parsing hash element
        if(state.hash && a.isString(state.hash)) {
            // First of all: we get the protocol loader
            var protocol = a.state.protocol.tester(state.hash);

            // The protocol exist, we can parse it
            if(protocol) {
                // We get the related function extracter
                var type = a.state.protocol.get(protocol);
                // The system exist, we can apply transformation
                if(a.isTrueObject(type)) {
                    // We apply converter to get the final good hash
                    state.hash = type.fn(state);
                }
            }

            state._storm.isRegexHash = false;
            if(state.hash.indexOf('{{') >= 0
                    && state.hash.indexOf('}}') >= 0) {
                state._storm.isRegexHash = true;
            }

            state._storm.hash = a.parameter.convert(state.hash);

            // Making it strict catch for regex one
            if(state._storm.isRegexHash) {
                state._storm.hash = '^' + state._storm.hash + '$';
            }
        }

        // Applying acl
        state._storm.acl = performSingleAclTest(state, a.acl.getCurrentRole());

        // We delete place as we will use it
        state.data    = {};
        state.options = null;

        tree[state.id] = state;

        // For every children, we add
        if(a.isArray(children)) {
            a.each(children, function(child) {
                child.parent = state.id;
                this.add(child);
            }, this);
        } else if(a.isTrueObject(children)) {
            children.parent = state.id;
            this.add(children);
        }
    };

    /**
     * From an existing state (found by id), create a free-clone copy of it,
     * and replace all elements inside found in extendedState.
     * This allow to quickly duplicate a state-base element.
     *
     * @method use
     *
     * @param id {String}                   The id to get the base to duplicate
     * @param extendState {Object}          The state to replace data from
     *                                      original and create new state from.
    */
    this.use = function(id, extendState) {
        var state = this.get(id);

        // We create a clone of initial state (to not alter the original copy)
        // and replace all elements found in extendState into the state copy,
        // exactly what we want !
        if(state) {
            this.add(a.extend(a.deepClone(state), extendState));
        }
    };

    // Alias
    this.extend = this.use;

    /**
     * Remove a state from existing state.
     *
     * @method remove
     *
     * @param id {String}                   The state id to delete
    */
    this.remove = function(id) {
        var hash = this.get(id);

        if(hash && a.isArray(hash.children)) {
            a.each(hash.children, function(child) {
                this.remove(child);
            }, this);
        }

        // We remove
        delete tree[id];
    };

    /**
     * Clear all elements currently stored
     *
     * @method clear
    */
    this.clear = function() {
        tree = {};
        loaded = [];
    };

    /**
     * Get a state from it's id.
     *
     * @method get
     *
     * @param id {String}                   The state id to found
     * @return {Object | null}              The state found, or null
    */
    this.get = function(id) {
        return tree[id] || null;
    };

    /**
     * Get the full state list.
     *
     * @method tree
     *
     * @return {Array}                      The inner tree stored
    */
    this.tree = function() {
        return tree;
    };

    /**
     * Load a state and needed parents from state id.
     *
     * @method load
     *
     * @param id {String}                   The state id to load
    */
    this.load = function(id) {
        var state = this.get(id);

        if(state) {
            // We search all parents related
            var states     = foundParentState(state),
                // From currently setted state, we remove elements
                // who don't need to load
                difference = a.difference(states, loaded);

            // As the load allow to multi-load existing state
            // If difference is empty, we still load the uppest state
            if(difference.length <= 0) {
                difference = [state];
            }

            loaded = loaded.concat(difference);

            // Difference
            setTimeout(function() {
                performLoadChanges(difference);
            }, 0);
        }
    };

    /**
     * Unload a state and needed parents from state id.
     *
     * @method unload
     *
     * @param id {String}                   The state id to unload
    */
    this.unload = function(id) {
        var state = this.get(id);

        if(state) {
            // We search all parents related
            var states = foundParentState(state);

            // TODO: we need to stop unloading where another child is
            // still loaded to it

            performUnloadChanges(states);
            // TODO: update loaded elements with removed
        }
    };

    /**
     * Test a hash is existing into states.
     *
     * @param hashExists
     *
     * @param hash {String}                 The hash to try
    */
    this.hashExists = function(hash) {
        // The foundHashState return array of array, so we flat it
        var states = a.flatten(foundHashState(hash));
        return (states.length > 0);
    };

    /**
     * Inject an object to given to next state.
     *
     * @method inject
     *
     * @param obj {Object}                  The object key/value to add to
     *                                      existing base
    */
    this.inject = function(obj) {
        if(a.isNull(this._inject)) {
            this._inject = {};
        }

        // Now we extend inject with new elements
        if(a.isTrueObject(obj)) {
            this._inject = a.assign(this._inject, obj);
        }
    };

    /**
     * Store the latest failing state
     * @property _errorState
     * @type Object
     * @default null
    */
    this._errorState = null;

    /**
     * Injected elements for next state
     * @property _inject
     * @type Object
     * @default null
    */
    this._inject     = {};
};








/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Get injected elements
    Handlebars.registerHelper('inject', function(key) {
        return new Handlebars.SafeString(a.state._inject[key] || null);
    });

    a.parameter.addParameterType('inject',  function(key) {
        return a.state._inject[key] || null;
    });
})();