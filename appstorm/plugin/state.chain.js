/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        plugin/state.js
    ]

    Events : []

    Description:
        State loading/unloading sequence manager.

************************************************************************ */

/**
 * State loading/unloading sequence manager.
 *
 * @class chain
 * @static
 * @namespace a.state
*/
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
     * @param test {Function}               A function to call and try if
     *                                      the given state should use this
     *                                      chain or not (things to go faster,
     *                                      if you dont know, just create
     *                                      blank function which always return
     *                                      true)
     * @param fct {Function}                The function to call
     * @param option {Object}               An option tool to place this in the
     *                                      chain. It can be 'after:string'
     *                                      where string is the function name
     *                                      to plug after, or 'before', the
     *                                      same as after for inserting before.
     *                                      Or position to specify integer to
     *                                      to place at the defined position
    */
    this.add = function(loadOrUnload, name, test, fct, option) {
        option = option || {};

        var store = getStore(loadOrUnload),
            storedObject = {
                name:  name,
                test:  test,
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

    /**
     * Get the loading or unloading chain. Same as get function, but remove
     * un-needed toolchain function, better to use this one.
     *
     * @method getWithTest
     *
     * @param loadOrUnload {Boolean}        True to get the load chain, false
     *                                      to get the unloading chain
     * @param state {Object}                The state to test
    */
    this.getWithTest = function(loadOrUnload, state) {
        var get = getStore(loadOrUnload),
            toolchain = [];

        for(var i=0, l=get.length; i<l; ++i) {
            var tmp = get[i],
                test = tmp.test;

            if(test) {
                if(test.call(state, state) === true) {
                    toolchain.push(tmp.fct);
                }
            }
        }

        return toolchain;
    }
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
     * Get the related state entry
     * Note: angular plugin also use this function, so apply change to it also
     *
     * @method getEntry
     * @private
     *
     * @return {String}                     The dom found
    */
    function getEntry() {
        var el = this.entry || this.target || this.el || this.dom || null;

        if(a.isFunction(el)) {
            return el.call(this);
        }

        // Regular string
        return el;
    };

    /**
     * Test if the given function should be run in async mode or not.
     *
     * @method testAsync
     * @private
     *
     * @param async {Mixed}                 The value to test
     * @param name {String}                 The chain name to test
     * @return {Boolean}                    True if it should be run in async
     *                                      mode, false in other cases
    */
    function testAsync(async, name) {
        return (async === true || async === name || (
            a.isArray(async) && a.contains(async, name)
        ));
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
            }, a.scope(chain.error, this));
        };
    };

    /**
     * Extract from data parameters to bind
     *
     * @method parseDataOption
     * @private
     *
     * @param options {Object}              The object data to use
     * @param hash {String}                 The hash to extract content from
     * @param internal {Object}             Internal content to use for binding
    */
    function parseDataOption(options, hash, internal) {
        a.each(options, function(option, key) {
            if(a.isTrueObject(option)) {
                parseDataOption(option, hash, internal);
            } else {
                options[key] = a.parameter.extrapolate(option, hash, internal);
            }
        })
    };

    /**
     * Get the data from url or store
     *
     * @method generateDataLoader
     * @private
     *
     * @param state {Object}                The state who need thoose data
     * @param name {String | null}          The current object name to get
     * @param options {Object}              The request options to send to ajax
    */
    function generateDataLoader(state, name, url, options) {
        var initContent = a.isNone(name) ?
                            state._storm.data : state._storm.data[name],
            hash      = a.hash.getHash(),
            internal  = state.hash || [''],
            // In this case we don't want the string escape, so we ask for
            // original content (false at the end)
            parsedUrl = null;

        // Sometimes options can arrive null
        options = a.isTrueObject(options) ? options: {};

        if(a.isString(url)) {
            for(var i=0, l=internal.length; i<l; ++i) {
                // When using a full element, we probably want to not escape
                // it - to recieve an object from memory
                // But if it's a string to escape, we probably don't want it
                // and get the string + variable replaced inside.
                var escaped = (url.indexOf('{{') === 0) ? false: true;
                parsedUrl = a.parameter.extrapolate(url, hash,
                                            internal[i], escaped);

                parseDataOption(options, hash, internal[i]);
            }
        }

        return function(chain) {
            var method = (options.method) ? options.method : 'GET',
                mockResult = a.mock.get(method, url);

            // We test mock support before sending to ajax.
            // As we have to support 'raw' requests
            // If we got something, we skip the request.
            if(mockResult !== null) {
                if(a.isNone(name)) {
                    state.data = mockResult;
                } else {
                    state.data[name] = mockResult;
                }
                chain.next();
                return;
            }

            // We are not in URL mode as suggest url mode
            if(a.isString(initContent) && initContent.indexOf('{{') === 0
            && initContent.indexOf('}}') === (initContent.length - 2)) {
                if(a.isNone(name)) {
                    state.data = parsedUrl;
                } else {
                    state.data[name] = parsedUrl;
                }
                chain.next();
                return;

            // We are in function mode: we let user define what to do
            // with data. The chain.next is embeded into another object
            // to deliver the response to AppStorm.JS
            } else if(a.isFunction(initContent)) {
                // Custom object to change the 'next' function
                var customDone  = function(result) {
                        if(a.isNone(name)) {
                            state.data = result;
                        } else {
                            state.data[name] = result;
                        }

                        // We rollback to previous before continue
                        // In other case we will create problem...
                        chain.next();
                    };

                // We need to create a custom object
                // to handle a specific done/next function
                var customChain = {
                    next:    customDone,
                    done:    customDone,
                    success: customDone,
                    fail:    chain.fail,
                    error:   chain.error,
                    stop:    chain.stop,
                    setData: chain.setData,
                    getData: chain.getData
                };

                // We call the function and pass the new 'chain' element
                initContent.call(state, customChain);

            // We need to get url
            // BUT, if the parsed element is not done property, we should quit
            } else if(parsedUrl !== null) {
                options.url = parsedUrl;

                var request = new a.ajax(options, function(content) {
                    if(a.isNone(name)) {
                        state.data = content;
                    } else {
                        state.data[name] = content;
                    }
                    chain.next();

                }, a.scope(chain.error, state));

                // Starting and waiting reply
                request.send();

            // Parsed is probably null, it means the content is not ready to show
            } else {
                a.console.error('request cannot be proceed, state: '
                    + state.id + ', data request: ' + name +
                    ', url parsing may have fail... It can be ' +
                    'some missing parameters', 3);
            }
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
        var include  = state.include || [],
            tmp_role = name + '_' + role,
            tmpRole  = a.firstLetterUppercase(role, name),
            tmp_def  = name + '_default',
            tmpDef   = name + 'Default';

        var selected = include[tmp_role] || include[tmpRole] ||
                        include[tmp_def] || include[tmpDef]  ||
                        include[name]    || [];

        var converted = stringToArray(selected),
            hashs = getValidHash(state),
            i = converted.length;

        while(i--) {
            for(var j=0, l=hashs.length; j<l; ++j) {
                converted[i] = a.parameter.extrapolate(
                        converted[i], a.hash.getHash(), hashs[j]);
            }
        }

        return converted;
    };

    /**
     * From a list of possible hash values, get only the currently in use hash
     *
     * @method getValidHash
     * @private
     *
     * @param state {Object}                The state object to use
     * @return {Array}                      The list of hash currently OK
    */
    function getValidHash(state) {
        var hash = a.hash.getHash(),
            hashs = state.hash || [],
            result = [];

        for(var i=0, l=hashs.length; i<l; ++i) {
            var stateHash = state.hash[i],
                stateStore = state._storm.hash[i];

            if(stateStore.isRegexHash) {
                stateStore.regex.lastIndex=0;
                if(stateStore.regex.test(hash)) {
                    result.push(stateHash);
                }
            } else {
                if(stateHash === hash) {
                    result.push(stateHash);
                }
            }
        }

        return result;
    };

    // LOAD: add parameters
    a.state.chain.add(true, 'loadParameters', 
    // Test
    function() {
        return (('hash' in this) && !a.isNone(this.hash));
    },
    // Content
    function() {
        //a.console.log('loading');
        //a.console.log(this);
        try {
            var result = {},
                hashs  = getValidHash(this),
                hash   = a.hash.getHash();

            // Doing the load parameter for every possible hash
            for(var i=0, l=hashs.length; i<l; ++i) {
                var extracted = a.parameter.extract(hashs[i]),
                    values = a.parameter.getValues(hash, hashs[i], extracted),
                    j = values.length;

                while(j--) {
                    result[values[j].name] = values[j].value;
                }
            }

            // Applying parameters
            this.parameters = result;
        } catch(e){}
        goToNextStep.apply(this, arguments);
    });

    // LOAD: preLoad
    a.state.chain.add(true, 'preLoad',
    // Test
    function() {
        // If preload is defined only
        return a.isFunction(this.preLoad);
    },
    // Content
    function() {
        if(testAsync(this.async, 'preLoad')) {
            this.preLoad.apply(this, arguments);
            return;
        } else {
            this.preLoad.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: title
    a.state.chain.add(true, 'title',
    // Test
    function() {
        return (('title' in this) && a.isString(this.title));
    },
    // Content
    function() {
        if(this.title.indexOf('{{') >= 0 && this.title.indexOf('}}') >= 0) {
            var hashs = getValidHash(this);
            for(var i=0, l=hashs.length; i<l; ++i) {
                document.title = a.parameter.extrapolate(
                            this.title, a.hash.getHash(), hashs[i]);
            }
        } else {
            document.title = this.title;
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: include (insert included elements into DOM)
    a.state.chain.add(true, 'include',
    // Test
    function() {
        // State does not handle any data or include to load
        if(!('include' in this) && !('data' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        var hash     = a.hash.getHash(),
            internal = getValidHash(this),
            args     = arguments,
            chain    = a.last(args),
            state    = this;

        // Load files, and bring html using entry/type
        var sync     = a.callback.synchronizer(null, a.scope(function() {
            goToNextStep.apply(this, args);
        }, this), function() {
            a.state._errorState = state;
            chain.error.apply(this, arguments);
        }),
            role     = a.acl.getCurrentRole(),
            partials = (this.include && this.include.partials) ? 
                            this.include.partials : {};

        var css  = getInclude(this, 'css',       role),
            js   = getInclude(this, 'js',        role),
            html = getInclude(this, 'html',      role),
            tr   = getInclude(this, 'translate', role);

        // Loading CSS
        a.each(css, function(url) {
            sync.addCallback(generateDefaultLoader.call(this, 'css', url));
        }, this);

        // Loading JS
        a.each(js, function(url) {
            sync.addCallback(generateDefaultLoader.call(this, 'js', url));
        }, this);

        // Loading translate
        a.each(tr, function(url) {
            sync.addCallback(
                generateDefaultLoader.call(this, 'json', url,
                function(content) {
                    a.each(content, function(translate, index) {
                        a.translate.add(index, translate, true);
                    });
                })
            );
        }, this);

        // Loading data
        var differenceData = null;
        if(a.isArray(this._storm.data) || a.isTrueObject(this._storm.data)) {
            differenceData = a.differenceObject(this.data, this._storm.data);
        }
        this.data = a.deepClone(this._storm.data);
        this.options = a.deepClone(this._storm.options) || {type: 'json'};

        // This case is converted into {url/options} one
        if(a.isString(this.data)) {
            this.data = {
                url:     this.data,
                options: a.clone(this.options)
            };
        }

        // The data is not a single string but rather a multi load system
        if(a.isTrueObject(this.data)) {
            // We are in single-data mode
            if('url' in this.data && 'options' in this.data) {
                sync.addCallback(generateDataLoader(this, null, this.data.url,
                                                        this.data.options));

            // We are in multi-data mode
            } else {
                a.each(this.data, function(data, name) {
                    if(a.isString(data)) {
                        data = {
                            url:     data,
                            options: this.options
                        };
                    }

                    sync.addCallback(generateDataLoader(this, name, data.url,
                                                    data.options));
                }, this);

                // We put back data into element
                if(differenceData) {
                    a.each(differenceData, function(data, name) {
                        this.data[name] = data;
                    }, this);
                }
            }
        } else if(a.isFunction(this.data)) {
            sync.addCallback(generateDataLoader(this, null, this.data, null));
        } else {
            a.console.error('a.state.chain:include: The state ' + this.id +
                            ' is not valid (data is not a valid system)', 1);
        }



        // Loading HTML
        sync.addCallback(a.scope(function(chain) {
            var url   = html[0];

            // Nohting to load
            if(!url) {
                chain.next();
                return;
            }

            for(var i=0, l=internal.length; i<l; ++i) {
                url = a.parameter.extrapolate(url, hash, internal[i]);
            }
            this._storm.html = url;
            a.template.get(url, {}, chain.next, chain.error);
        }, this));

        // Loading partials
        a.each(partials, function(uri, name) {
            sync.addCallback(function(chain) {
                a.template.partial(name, uri, function() {
                    chain.next();
                }, function() {
                    chain.error();
                });
            });
        });


        sync.start();
    });

    // Load: converter before rendering data
    a.state.chain.add(true, 'converter',
    // Test
    function() {
        return (('converter' in this) && a.isFunction(this.converter));
    },
    // Content
    function() {
        this.converter.call(this, this.data);
        goToNextStep.apply(this, arguments);
    });

    // LOAD: content (insert HTML content)
    a.state.chain.add(true, 'contentLoad',
    // Test
    function() {
        return (('include' in this) && ('html' in this.include));
    },
    // Content
    function() {
        var args  = a.toArray(arguments),
            chain = a.last(args);

        a.template.get(this._storm.html, this.data, a.scope(
        function(content) {
            var entry = getEntry.call(this);

            // User can also define their custom function directly into state
            if(a.isFunction(this.type)) {
                // We call the function, and give the chain to system
                this.type.call(this, entry, content, chain);

            } else if(entry) {
                var el    = a.dom.query(entry),
                    type  = this.type || 'replace',
                    obj   = a.state.type.get(type);

                if(obj && a.isFunction(obj.input)) {
                    if(obj.async) {
                        // We delegate the chain continuation
                        obj.input.call(this, el, content, chain);
                    } else {
                       obj.input.call(this, el, content);
                       goToNextStep.apply(this, args);
                    }

                } else {
                    // TODO: print error
                    goToNextStep.apply(this, args);
                }
            }
        }, this));
    });

    // LOAD: load
    a.state.chain.add(true, 'load',
    // Test
    function() {
        return (('load' in this) && a.isFunction(this.load));
    },
    // Content
    function() {
        if(testAsync(this.async, 'load')) {
            this.load.apply(this, arguments);
            return;
        } else {
            this.load.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: bind (HTML events)
    a.state.chain.add(true, 'bindDom',
    // Test
    function() {
        if(!('bind' in this) && !('bindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.bind || this.bindings || null,
            state    = this,
            entry    = a.dom.el(getEntry.call(this));

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    // If el is empty: we bind directly on entry root
                    if(!el) {
                        entry.bind(action, fct, state);
                    } else {
                        a.dom.query(el, entry).bind(action, fct, state);
                    }
                }

            // A single element: direct action on entry level
            } else if(split.length == 1) {
                entry.bind(a.trim(split[0]), fct, state);
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // Load: bind (GLOBAL HTML events)
    a.state.chain.add(true, 'bindGlobalDom',
    // Test
    function() {
        if(!('globalBind' in this) && !('globalBindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.globalBind || this.globalBindings || null,
            state    = this;

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    a.dom.query(el).bind(action, fct, state);
                }
            }
        });

        goToNextStep.apply(this, arguments);
    });


    // LOAD: bind (keyboard events)
    a.state.chain.add(true, 'bindKeyboard',
    // test
    function() {
        if(!('keyboard' in this) && !('accelerator' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        var bindings = this.keyboard || this.accelerator || null;

        a.each(bindings, function(fct, query) {
            // We keyboard binding with key type press selection
            var split = query.split('|');

            a.each(split, function(content) {
                var evt  = content.split(':'),
                    key  = a.trim(evt[0]),
                    type = evt[1] ? a.trim(evt[1]): 'keypress';

                type = type.toLowerCase();
                if(type!='keypress' && type!='keydown' && type!='keyup') {
                    type = 'keypress';
                }

                a.keyboard.bind(key, fct, this, type);
            }, this);
        }, this);

        goToNextStep.apply(this, arguments);
    });

    // LOAD: postLoad
    a.state.chain.add(true, 'postLoad',
    // Test
    function() {
        return (('postLoad' in this) && a.isFunction(this.postLoad));
    },
    // Content
    function() {
        if(testAsync(this.async, 'postLoad')) {
            this.postLoad.apply(this, arguments);
            return;
        } else {
            this.postLoad.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: loadAfter: launch state after this one is loaded
    a.state.chain.add(true, 'loadAfter',
    // Test
    function() {
        return (('loadAfter' in this) && !a.isNone(this.loadAfter));
    },
    // Content
    function() {
        var after = this.loadAfter;
        if(a.isArray(after)) {
            a.each(after, function(state) {
                a.state.load(state);
            });
        } else if(a.isString(after) || a.isNumber(after)) {
            a.state.load(after);
        }
        goToNextStep.apply(this, arguments);
    });


    /*
    ----------------------------------
      DEFAULT UNLOADING CHAIN
    ----------------------------------
    */

    // UNLOAD: preUnload
    a.state.chain.add(false, 'preUnload',
    // Test
    function() {
        return (('preUnload' in this) && a.isFunction(this.preUnload));
    },
    // Content
    function() {
        //a.console.log('unloading');
        //a.console.log(this);
        if(testAsync(this.async, 'preUnload')) {
            this.preUnload.apply(this, arguments);
            return;
        } else {
            this.preUnload.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unbind (keyboard events)
    a.state.chain.add(false, 'unbindKeyboard',
    // Test
    function() {
        if(!('keyboard' in this) && !('accelerator' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        var bindings = this.keyboard || this.accelerator || null;

        a.each(bindings, function(fct, query) {
            // We keyboard binding with key type press selection
            var split = query.split('|');

            a.each(split, function(content) {
                var evt  = content.split(':'),
                    key  = a.trim(evt[0]),
                    type = evt[1] ? a.trim(evt[1]): 'keypress';

                type = type.toLowerCase();
                if(type!='keypress' && type!='keydown' && type!='keyup') {
                    type = 'keypress';
                }

                a.keyboard.unbind(key, fct, type);
            }, this);
        }, this);

        goToNextStep.apply(this, arguments);
    });

    // Load: unbind (GLOBAL HTML events)
    a.state.chain.add(false, 'unbindGlobalDom',
    // Test
    function() {
        if(!('globalBind' in this) && !('globalBindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.globalBind || this.globalBindings || null;

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    a.dom.query(el).unbind(action, fct);
                }

            // A single element: direct action on entry level
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unbind (HTML events)
    a.state.chain.add(false, 'unbindDom',
    // Test
    function() {
        if(!('bind' in this) && !('bindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.bind || this.bindings || null,
            entry    = a.dom.el(getEntry.call(this));

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    // If el is empty: we bind directly on entry root
                    if(!el) {
                        entry.unbind(action, fct);
                    } else {
                        a.dom.query(el, entry).unbind(action, fct);
                    }
                }

            // A single element: direct action on entry level
            } else if(split.length == 1) {
                entry.unbind(a.trim(split[0]), fct);
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unload
    a.state.chain.add(false, 'unload',
    // Test
    function() {
        return (('unload' in this) && a.isFunction(this.unload));
    },
    // Content
    function() {
        if(testAsync(this.async, 'unload')) {
            this.unload.apply(this, arguments);
            return;
        } else {
            this.unload.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: content (unload HTML content)
    a.state.chain.add(false, 'contentUnload',
    // Test
    function() {
        // Little bit different from them other, as it can be modified during
        // runtime
        var entry = getEntry.call(this);
        if(!entry) {
            return false;
        }
        return (a.isFunction(entry) || a.isString(entry));
    },
    // Content
    function() {
        var startingPoint = null,
            entry = getEntry.call(this),
            args  = a.toArray(arguments);

        if(a.isFunction(entry)) {
            startingPoint = a.dom.el(entry());
        } else if(a.isString(entry)) {
            startingPoint = a.dom.query(entry);
        }

        if(startingPoint) {
            var type  = this.type || 'replace',
                obj   = a.state.type.get(type);

            if(obj && a.isFunction(obj.output)) {
                if(obj.async) {
                    var chain = a.last(args);
                    // We delegate the chain continuation
                    obj.output.call(this, startingPoint, chain);
                } else {
                   obj.output.call(this, startingPoint);
                   goToNextStep.apply(this, args);
                }

            } else {
                // TODO: print error
                goToNextStep.apply(this, args);
            }
        }

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: postUnload
    a.state.chain.add(false, 'postUnload',
    // Test
    function() {
        return (('postUnload' in this) && a.isFunction(this.postUnload));
    },
    // Content
    function() {
        if(testAsync(this.async, 'postUnload')) {
            this.postUnload.apply(this, arguments);
            return;
        } else {
            this.postUnload.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: remove parameters previously created
    a.state.chain.add(false, 'removeParameters',
    // Test
    function() {
        return (('hash' in this) && !a.isNone(this.hash));
    },
    // Content
    function() {
        try {
            // Applying parameters
            delete this.parameters;
        } catch(e){}
        goToNextStep.apply(this, arguments);
    });
})();
