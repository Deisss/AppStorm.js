

// dependencies: a.parameter, a.acl, a.hash

// TODO: put ACL test in cache... So if needed create an event on acl (unit test this - especially changing current
    // acl does update everything)
// TODO: create loadAsync: true/false and unloadAsync: true/false:
        // manage the way the load/unload is done (if chain.next is needed or done on state.chain directly)
        // Can be also a single string, or array of strings
// TODO: create uri:// and model:// to create kind of special system for hash, do that
// only on add, like uri will trace all parents to find final url...
// TODO: create the bootOnLoad
a.state = new function() {
    var tree   = {},
        loaded = [];

    /*
        Algorithm :
            1) We get id list to add, id list to delete, by selecting branch corresponding to hashtag searched.
            We include the loadAfter system to sub-select needed elements
            2) From thoose 2 arrays, we remove duplicate (because it means we will unload to reload just after)

            => This tab contains all id (from delete or add), which should be manage by system.
            => The 2 object contains add list, or delete list, used with array you can found what you should add, what you should delete

            3) We start by deleting, in this case we must take the "highest" level, it means latest added children.
            So we start by searching maximum children level, and we delete from that level, to root

            4) We build exactly the opposite : we need root setup before adding a children to it.
            So we start from base level, and go up until latest children

            => Now system unbuild delete, and rebuild add, and takes care to not unbuild something which don't need to.
            Also, The system is hanble to run synchronously for going faster (unloading/loading item list of same level is done synchronously)
    */



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

        // TODO: error on success: the scope is changed here and cause error
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
                performSingleState(loadOrUnload, state, this.next, this.error,
                                                                        sync);
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
                } else {
                    var reg = new RegExp(state._storm.hash, '');
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
            // TODO: create error
            chain = a.callback.chainer(null, callback, null);

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
            // TODO: create error
            chain = a.callback.chainer(null, callback, null);

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

        // Using a.uniq will remove all double states found
        var currentHash  = data.value,
            previousHash = data.old;
            loading      = a.uniq(a.flatten(foundHashState(currentHash))),
            unloading    = loaded,
        // Only keep difference between (= state allowed to load/unload)
            loadingIntersection   = a.difference(loading, unloading),
            unloadingIntersection = a.difference(unloading, loading);

        // Perform the unload/load process
        performUnloadChanges(unloadingIntersection, function() {
            // We remove unloaded elements and add new elements
            loaded = a.difference(loaded, unloadingIntersection)
                                        .concat(loadingIntersection);

            performLoadChanges(loadingIntersection, function() {
                a.message.dispatch('a.state.end', data);
            });
        });
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

        // TODO: unit test this, especially the acl maximum test
        var acl = state.acl || {};

        // Test minimum
        if(a.isNumber(acl.minimum) && a.acl.isRefused(acl.minimum, role)) {
            return false;
        }

        // Test maximum
        if(a.isNumber(acl.maximum) && a.acl.isRefused(role, acl.maximum)) {
            return false;
        }

        // Test allowed
        if(a.isArray(acl.allowed) && !a.contains(acl.allowed, role)) {
            return false;
        }

        // Test refused
        if(a.isArray(acl.refused) && a.contains(acl.refused, role)) {
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
    a.hash.bind('a.hash', performHashChange);
    a.acl.bind('change', performAclChange);









    /**
     * Add a state to the existing state tree
     *
     * @method add
     *
     * @param state {Object}                A state to add to system
    */
    this.add = function(state) {
        // TODO: manage children

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
        state._storm.data  = state.data || {};
        state._storm.option= state.option || null;

        // Parsing hash element
        if(state.hash && a.isString(state.hash)) {
            state._storm.isRegexHash = false;
            if(state.hash.indexOf('{{') >= 0
                    && state.hash.indexOf('}}') >= 0) {
                state._storm.isRegexHash = true;
            }
            state._storm.hash = a.parameter.convert(state.hash);
        }

        // Applying acl
        state._storm.acl = performSingleAclTest(state, a.acl.getCurrentRole());

        // We delete place as we will use it
        state.data = {};
        delete state.option;

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
            var states = foundParentState(state);

            // From currently setted state, we remove elements
            // who don't need to load
            var difference = a.difference(states, loaded);

            // Difference
            performLoadChanges(difference, function() {
                // We update loaded from this elements
                loaded = loaded.concat(difference);
            });
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

    // test hash exist
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
};