//TODO: remove jquery usage


// Manipulate a.state loading and unloading chain
a.state.chain = new function() {
    var loadingChain   = [],
        unloadingChain = [];

    /**
     * Get the store related to current chain (loading or unloading)
     *
     * @method getStore
     * @private
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @return {Array}                      The current chain list
    */
    function getStore(loadOrUnload) {
        return (loadOrUnload == true || loadOrUnload == 1
                || loadOrUnload == 'loading' || loadOrUnload == 'load') ?
                    loadingChain : unloadingChain;
    };

    /**
     * Add a function to the chain
     *
     * @method add
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param name {String}                 The function name (to identify it)
     * @param fct {Function}                The function to call
     * @param option {Object}               An option tool to place this in the
     *                                      chain. It can be 'after:string'
     *                                      where string is the function name
     *                                      to plug after, or 'before', the
     *                                      same as after for inserting before.
     *                                      Or position to specify integer to
     *                                      to place at the defined position
    */
    this.add = function(loadOrUnload, name, fct, option) {
        option = option || {};

        var store = getStore(loadOrUnload),
            storedObject = {
                name:  name,
                fct:   fct,
                scope: option.scope || null
            };

        var flat = a.pluck(store, 'name'),
            pos  = flat.length;


        if(option.after && a.contains(flat, option.after)) {
            pos = a.indexOf(flat, option.after) + 1;
        } else if(option.before && a.contains(flat, option.before)) {
            pos = a.indexOf(flat, option.before);
        } else if(option.position <= flat.length) {
            pos = option.position;
        }

        if(pos < 0) {
            pos = 0;
        }

        // We place function in the chain
        if(pos >= flat.length) {
            store.push(storedObject);
        } else {
            store = store.splice(pos, 0, storedObject);
        }
    };

    /**
     * Remove a function from the chain
     *
     * @method remove
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param name {String}                 The name given to 'add' to remove
    */
    this.remove = function(loadOrUnload, name) {
        var store = getStore(loadOrUnload),
            i = store.length;

        while(i--) {
            if(store[i].name == name) {
                store.splice(i, 1);
            }
        }
    };

    /**
     * Get the loading or unloading chain
     *
     * @method get
     *
     * @param loadOrUnload {Boolean}        True to get the load chain, false
     *                                      to get the unloading chain
    */
    this.get = function(loadOrUnload) {
        return getStore(loadOrUnload);
    };
};





(function() {
    /*
    ----------------------------------
      DEFAULT LOADING CHAIN
    ----------------------------------
    */


    /**
     * Go to next step
     *
     * @method goToNextStep
     * @private
     *
     * @param {Array}                       The arguments to pass threw
    */
    function goToNextStep() {
        var args  = a.toArray(arguments),
            chain = a.last(args),
            other = a.initial(args);

        chain.next.apply(this, other);
    };

    /**
     * Convert string to array element.
     *
     * @method stringToArray
     * @private
     *
     * @param element {Mixed}               Element to convert or keep
     * @return {Array}                      The converted array
    */
    function stringToArray(element) {
        if(a.isString(element)) {
            return [element];
        } else if(a.isArray(element)) {
            return element;
        }
        return [];
    };

    /**
     * Create a callback function for loader system.
     *
     * @method generateDefaultLoader
     * @private
     *
     * @param fct {Function}                The loader function used
     * @param uri {String}                  The uri to load
     * @param extra {Function | null}       The extra parsing function
     *                                      (may be needed)
    */
    function generateDefaultLoader(fct, uri, extra) {
        return function(chain) {
            a.loader[fct](uri, function(data) {
                if(a.isFunction(extra)) {
                    extra(data);
                }
                chain.next();
            });
        };
    };

    /**
     * Get the parsed with parameters version of every request from include.
     *
     * @method getInclude
     * @private
     *
     * @param state {Object}                The state to load include from
     * @param name {String}                 The include name to get
     * @param role {String}                 The user role to check linked
     *                                      include
     * @return {Array}                      The founded include or empty string
    */
    function getInclude(state, name, role) {
        var include  = state.include,
            tmp_role = name + '_' + role,
            tmpRole  = name + role.charAt(0).toUpperCase() + role.slice(1),
            tmp_def  = name + '_default',
            tmpDef   = name + 'Default';

        var selected = include[tmp_role] || include[tmpRole] ||
                        include[tmp_def] || include[tmpDef]  ||
                        include[name]    || [];

        var converted = stringToArray(selected),
            i = converted.length;

        while(i--) {
            // TODO: apply extrapolate parameter here
            converted[i] = converted[i];
        }

        return converted;
    };


    // LOAD: preLoad
    a.state.chain.add(true, 'preLoad', function preLoad() {
        if(this.preLoad) {
            this.preLoad.apply(this, arguments);
        } else {
            goToNextStep.apply(this, arguments);
        }
    });

    // LOAD: title
    a.state.chain.add(true, 'title', function title() {
        // TODO: extrapolate parameters from state
        if(this.title) {
            document.title = a.parameter.extrapolate(
                        this.title, a.hash.getHash(), this.hash);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: include (insert included elements into DOM)
    a.state.chain.add(true, 'include', function include() {
        var hash     = a.hash.getHash(),
            internal = this.hash,
            args     = arguments;

        if(a.isObject(this._storm.data)) {
            // TODO: does not apply on many elements
            a.each(this._storm.data, function(value, key) {
                this.data[key] = a.parameter.extrapolate(value, hash,
                                                                    internal);
            }, this);
        }

        // The last part is for include only, so we stop if there is no...
        // TODO: when data will be able to catch url, remove this (cannot be
        // used like this)
        if(!this.include) {
            goToNextStep.apply(this, arguments);
            return;
        }

        // Load files, and bring html using entry/type
        // TODO: take arguments to get arguments to pass threw next function
        // and success/fail
        // TODO: do error function
        var sync     = a.callback.synchronizer(null, a.scope(function() {
            goToNextStep.apply(this, args);
        }, this), null),
            role     = a.acl.getCurrentRole(),
            partials = this.include.partials;

        var css  = getInclude(this, 'css',       role),
            js   = getInclude(this, 'js',        role),
            html = getInclude(this, 'html',      role),
            tr   = getInclude(this, 'translate', role);

        // Loading CSS
        a.each(css, function(url) {
            sync.addCallback(generateDefaultLoader('css', url));
        });

        // Loading JS
        a.each(js, function(url) {
            sync.addCallback(generateDefaultLoader('js', url));
        });

        // Loading translate
        a.each(tr, function(url) {
            sync.addCallback(
                generateDefaultLoader('json', url, function(content) {
                    a.each(content, function(translate, index) {
                        a.language.addTranslation(index, translate, true);
                    });
                })
            );
        });

        // Loading HTML
        sync.addCallback(a.scope(function(chain) {
            var url   = html[0],
                state = this;
            url = a.parameter.extrapolate(url, hash, internal);
            this._storm.html = url;
            a.template.get(url, {}, chain.next, chain.error);
        }, this));

        // Loading partials
        a.each(partials, function(uri, name) {
            sync.addCallback(function(chain) {
                a.template.partial(name, uri, chain.next, chain.error);
            });
        });


        sync.start();
    });

    // Load: converter before rendering data
    a.state.chain.add(true, 'converter', function converter() {
        // We merge all data
        var chain = a.last(arguments);

        if(this.converter) {
            this.converter.call(this, this.data);
        }

        goToNextStep.apply(this, arguments);
    });

    // LOAD: content (insert HTML content)
    a.state.chain.add(true, 'content', function contentLoad() {
        var args = arguments;

        // There is no html to load, we skip
        if(!this._storm.html) {
            goToNextStep.apply(this, args);
            return;
        }

        a.template.get(this._storm.html, this.data, a.scope(
        function(content) {
            // TODO: do translate here before converting !
            // TODO: publish content here into DOM using entry/type


            // TODO: be able to use here the fact an entry can be function

            // It's allowed to want to load content, but not use it...
            if(this.entry) {
                var entry = a.dom.query(this.entry),
                    type  = this.type || 'replace';

                if(type == 'replace') {
                    a.template.replace(entry, content);
                } else if(type == 'append') {
                    a.template.append(entry, content);
                }
            }

            goToNextStep.apply(this, args);
        }, this));
    });

    // LOAD: load
    a.state.chain.add(true, 'load', function load() {
        if(this.load) {
            this.load.apply(this, arguments);
        } else {
            goToNextStep.apply(this, arguments);
        }
    });

    // LOAD: bind (HTML events)
    a.state.chain.add(true, 'bind', function bind() {
        // Use bind/binding to elements
        var bindings = this.bind || this.bindings || this.events || null;

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                a.dom.query(split[0]).event.bind(split[1], fct);
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // LOAD: postLoad
    a.state.chain.add(true, 'postLoad', function postLoad() {
        if(this.postLoad) {
            this.postLoad.apply(this, arguments);
        } else {
            goToNextStep.apply(this, arguments);
        }
    });



    /*
    ----------------------------------
      DEFAULT UNLOADING CHAIN
    ----------------------------------
    */

    // UNLOAD: preUnload
    a.state.chain.add(false, 'preUnload', function preUnload() {
        if(this.preUnload) {
            this.preUnload.apply(this, arguments);
        } else {
            goToNextStep.apply(this, arguments);
        }
    });

    // UNLOAD: unbind (HTML events)
    a.state.chain.add(false, 'unbind', function unbind() {
        // Use bind/binding to elements
        var bindings = this.bind || this.bindings || this.events || null;

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                a.dom.query(split[0]).event.unbind(split[1], fct);
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: content (unload HTML content)
    a.state.chain.add(false, 'content', function contentUnload() {
        var startingPoint = null;

        if(a.isFunction(this.entry)) {
            startingPoint = a.dom.el(this.entry());
        } else if(a.isString(this.entry)) {
            startingPoint = a.dom.query(this.entry);
        }

        if(startingPoint) {
            // Replace: empty everything
            if(this.type == 'replace') {
                startingPoint.empty();

            // Hide: do CSS hide
            } else if(this.type == 'hide') {
                startingPoint.css('display', 'none');
            }
        }

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unload
    a.state.chain.add(false, 'unload', function unload() {
        if(this.unload) {
            this.unload.apply(this, arguments);
        } else {
            goToNextStep.apply(this, arguments);
        }
    });

    // UNLOAD: postUnload
    a.state.chain.add(false, 'postUnload', function postUnload() {
        if(this.postUnload) {
            this.postUnload.apply(this, arguments);
        } else {
            goToNextStep.apply(this, arguments);
        }
    });
})();
