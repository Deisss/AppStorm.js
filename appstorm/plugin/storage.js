/*! ***********************************************************************

    License: MIT Licence

    Description:
        Storage capacities, allow to manage many storage to get quick access
        to everything

        cookie : Cookie functionnality, manipulate cookie with a simplified
                 interface
        temporary : Use the "most powerfull" system in the whole list of
                    temporary store available

************************************************************************ */
/**
 * Storage capacities, allow to manage many storage to get quick
 * access to everything.
 *
 * @constructor
*/
a.storage = {
    /**
     * Debug on console the get item action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
     * @param {Mixed} value                 The value to dump
    */
    debugGet: function(element, key, value) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.get',
                    'Get the element ```' + key + '``` with value ```' + value+
                    '```', 3);
        }
    },

    /**
     * Debug on console the get item error action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
    */
    printError: function(element, key) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.get',
                    'Unable to find the key ```' + key + '``` in store...', 3);
        }
    },

    /**
     * Debug on console the set item action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
     * @param {Mixed} value                 The value to dump
    */
    debugSet: function(element, key, value) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.set',
                    'Add the element key ```' + key + '``` with value ```' +
                    value + '```', 3);
        }
    },

    /**
     * Debug on console the remove item action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
    */
    debugRemove: function(element, key) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.remove',
                    'Remove the element ```' + key + '```', 3);
        }
    },

    // Access to individual storage
    type: {}
};


/*
------------------------------
  COOKIE
------------------------------
*/
/**
 * Cookie functionnality, manipulate cookie with a simplified interface.
 *
 * @constructor
*/
a.storage.type.cookie = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default cookie
     * @final
    */
    engine: 'cookie',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        // Cookie
        // Testing the current
        var test = '_support_t';
        this.set(test, 'o');

        // Test system is working
        if(this.get(test) == 'o') {
            this.remove(test);
            this.support = true;
        }
    },

    /**
     * Set a new cookie, or delete a cookie using a too old expires.
     *
     * @param {String} name                 The key to use
     * @param {Mixed} value                 The value to store
     * @param {Integer} days                Number of days before expires
    */
    set: function(name, value, days) {
        var expires = '';
        a.storage.debugSet('cookie', name, value);
        if(days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = '; expires=' + date.toGMTString();
        }

        var cookieSet =  name + '=' + escape(a.parser.json.stringify(value));
            cookieSet += expires + '; path=/';
        document.cookie = cookieSet;
    },

    /**
     * Get the stored cookie, return null if something went wrong.
     *
     * @param {String} name                 The cookie name stored
     * @return {Mixed | Null}               Any data stored inside cookie
    */
    get: function(name) {
        if (document.cookie.length > 0) {
            var start = document.cookie.indexOf(name + '=');
            if (start != -1) {
                start = start + name.length + 1;
                var end = document.cookie.indexOf(';', start);
                if (end == -1) {
                    end = document.cookie.length;
                }
                var result = a.parser.json.parse(
                            unescape(document.cookie.substring(start, end)));
                a.storage.debugGet('cookie', name, result);
                return result;
            }
        }
        a.storage.printError('cookie', name);
        return null;
    },

    /**
     * Remove a previously stored cookie.
     *
     * @param {String} name                 The cookie name to delete
    */
    remove: function(name) {
        a.storage.debugRemove('cookie', name);
        this.set(name, '', -1);
    }
};


/**
 * Cookie functionnality, manipulate cookie with a simplified interface.
 *
 * @constructor
*/
a.storage.cookie = a.storage.type.cookie;




/*
------------------------------
  LOCAL STORAGE
------------------------------
*/
/**
 * LocalStorage HTML5 support.
 *
 * @constructor
*/
a.storage.type.localStorage = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default localStorage
     * @final
    */
    engine: 'localStorage',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var obj     = a.storage.type.localStorage,
            idTest  = '_support_t';

        // Test support (if you use localStorageShim
        // this should work for most of browsers (including old IE) !)
        if('localStorage' in window && window.localStorage !== null) {
            // localStorage may have no space left, making everything crash
            try {
                // Testing database work or not
                window.localStorage.setItem(idTest, 'o');

                // Test system is working
                if(window.localStorage.getItem(idTest) === 'o') {
                    window.localStorage.removeItem(idTest);
                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(support) {
            var item = window.localStorage.getItem(key);
            if(a.isNone(item)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(this.support) {
            a.storage.debugSet(this.engine, key, value);
            window.localStorage.setItem(key, a.parser.json.stringify(value));
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(this.support) {
            a.storage.debugRemove(this.engine, key);
            window.localStorage.removeItem(key);
        }
    }
};



/*
------------------------------
  GLOBAL STORAGE
------------------------------
*/
/**
 * globalStorage HTML5 support (old).
 *
 * @constructor
*/
a.storage.type.globalStorage = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default globalStorage
     * @final
    */
    engine: 'globalStorage',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var idTest   = '_support_t',
            hostname = window.location.hostname;

        if(!a.isNone(window.globalStorage)) {
            // In case of space not left, we can have crash
            try {
                window.globalStorage[hostname].setItem(idTest, 'o');

                // Test system is working
                if(window.globalStorage[hostname].getItem(idTest) == 'o') {
                    window.globalStorage[hostname].removeItem(idTest);
                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(support) {
            var item = window.globalStorage[hostname].getItem(key),
                value = null;
            // On some system, item will be an object with
            // "value" and "secure" property
            if(a.isTrueObject(item) && !a.isNone(item.value)) {
                value = a.parser.json.parse(item.value);
                a.storage.debugGet(this.engine, key, value);
                return value;
            } else if(!a.isNone(item)) {
                value = a.parser.json.parse(item);
                a.storage.debugGet(this.engine, key, value);
                return value;
            } else {
                a.storage.printError(this.engine, key);
                return null;
            }
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(this.support) {
            a.storage.debugSet(this.engine, key, value);
            window.globalStorage[hostname].setItem(key,
                                        a.parser.json.stringify(value));
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(this.support) {
            a.storage.debugRemove(this.engine, key);
            window.globalStorage[hostname].removeItem(key);
        }
    }
};


/*
------------------------------
  MEMORY STORE
------------------------------
*/
/**
 * memory object (so if page close, everything is lost).
 *
 * @constructor
*/
a.storage.type.memory = {
    /**
     * @property _store
     * @private
     * @type a.mem
    */
    _store: a.mem.getInstance('app.storage'),

    /**
     * @property support
     * @type Boolean
     * @default true
    */
    support: true,

    /**
     * @property engine
     * @type String
     * @default memory
     * @final
    */
    engine: 'memory',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        return true;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function() {
        return this._store.get.apply(this._store, arguments);
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function() {
        return this._store.set.apply(this._store, arguments);
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function() {
        return this._store.remove(this._store, arguments);
    }
};


/**
 * Memory store functionnality, manipulate memory storage class with a
 * simplified interface.
 *
 * @constructor
*/
a.storage.memory = a.storage.type.memory;




/*
------------------------------
  SESSION STORAGE
------------------------------
*/
/**
 * sessionStorage HTML5 support.
 *
 * @constructor
*/
a.storage.type.sessionStorage = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default sessionStorage
     * @final
    */
    engine: 'sessionStorage',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var idTest  = '_support_t',
            ss      = 'sessionStorage';


        // Test support
        if(ss in window && !a.isNone(window[ss])) {
            try {
                // Testing database work or not
                window.sessionStorage.setItem(idTest, 'o');

                // Test system is working
                if(window.sessionStorage.getItem(idTest) == 'o') {
                    window.sessionStorage.removeItem(idTest);
                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(this.support) {
            var item = window.sessionStorage.getItem(key);
            if(a.isNone(item)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(this.support) {
            a.storage.debugSet(this.engine, key, value);
            window.sessionStorage.setItem(key, a.parser.json.stringify(value));
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            window.sessionStorage.removeItem(key);
        }
    }
};



/*
------------------------------
  USER DATA (Internet Explorer)
------------------------------
*/
/**
 * userData IE support (old).
 *
 * @constructor
*/
a.storage.type.userData = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default userData
     * @final
    */
    engine: 'userData',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var idTest  = '_support_t',
            uid     = 'a_storage',
            dbName  = 'aUserDataStorage';

        // Store for internet explorer

        // Test support
        if(document.all) {
            // On some IE, db.load and db.save may be disabled
            // (binary behavior disable)...
            try {
                // Creating userData storage
                document.write(
                    '<input type="hidden" id="' + uid +
                    '" style="display:none;behavior:url(\'#default#userData\')" />'
                );

                var db = document.getElementById(uid);
                db.load(dbName);

                // Testing work before setting as default
                db.setAttribute(idTest, 'o');
                db.save(dbName);

                // Test system is working
                if(db.getAttribute(idTest) == 'o') {
                    // Deleting test
                    db.removeAttribute(idTest);
                    db.save(dbName);

                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(support) {
            var value = a.parser.json.parse(db.getAttribute(key));
            if(a.isNone(value)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(support) {
            a.storage.debugSet(this.engine, key, value);
            db.setAttribute(key, a.parser.json.stringify(value));
            db.save(dbName);
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            db.removeAttribute(key);
            db.save(dbName);
        }
    }
};


/*
------------------------------
  FLASH
------------------------------
*/
/**
 * flash external storage.
 *
 * @constructor
*/
a.storage.type.flash = new function() {
    var support = false,
        ready   = false,
        id      = 'flashstorage';

    /**
     * Start flash and check availability.
     *
     * @private
     * @async
     *
     * @param {Function | Null} callback    The callback function to call
     *                                      after loading
    */
    function includeFlash(callback) {
        if(support === false && ready === false) {
            // Append to root an object for recieving flash
            var root = document.createElement('div');
            root.id = 'flashstoragecontent';
            document.body.appendChild(root);

            var data = {
                id : id,
                rootId : root.id,

                flashvars : {},
                params : {
                    wmode: 'transparent',
                    menu: 'false',
                    scale: 'noScale',
                    allowFullscreen: 'true',
                    allowScriptAccess: 'always'
                }
            };

            // Loading file
            a.loader.flash(a.url + 'vendor/storage/flash/localStorage.swf',
            function(e) {
                ready = true;

                var el = document.getElementById(data.id);

                if(el.testData() === true) {
                    support = true;
                    el.setDatabase('a_flashStorage');
                }
                if(support === true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support === true && a.isFunction(callback)) {
            callback(support);
        }
    }

    /**
     * Get the support state of flash.
     * Note: it may arrive little bit after using start function...
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};

    /**
     * Get the ready state of flash object.
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;};

    /**
     * @property engine
     * @type String
     * @default flash
     * @final
    */
    this.engine = 'flash';

    /**
     * Start (include and prepare) flash object
     * Note: automatically done by system you don't need to...
     *
     * @async
     *
     * @param {Function} callback           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeFlash(callback);
    };

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support === true) {
            var item = document.getElementById(id).getData(key);
            if(a.isNone(item)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            a.storage.debugGet(this.engine, key, item);
            return item;
        }
        return null;
    };

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support === true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).setData(key, value);
        }
    };

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support === true) {
            a.storage.debugRemove(this.engine, key);
            return document.getElementById(id).removeData(key);
        }
    };
};


/*
------------------------------
  SILVERLIGHT
------------------------------
*/
/**
 * silverlight external storage.
 *
 * @constructor
*/
a.storage.type.silverlight = new function() {
    var support = false,
        ready   = false,
        id      = 'silverlightstorage';

    /**
     * Start silverlight and check availability.
     *
     * @private
     * @async
     *
     * @param {Function | Null} callback    The callback function to
     *                                      call after loading
    */
    function includeSilverlight(callback) {
        if(support === false && ready === false) {
            // Append to root an object for recieving flash
            var root = document.createElement('div');
            root.id = '_silverlightstorage';
            document.body.appendChild(root);

            var data = {
                id : id,
                rootId : root.id,

                params : [{
                    name : 'minRuntimeVersion',
                    value : '2.0.31005.0'
                },{
                    name : 'autoUpgrade',
                    value : 'true'
                }]
            };

            // Loading file
            a.loader.silverlight(a.url +
                'vendor/storage/silverlight/silverlightStorage.xap',
            function(e) {
                ready = true;

                var el = document.getElementById(data.id);
                if(el.Content.store.testData() === true) {
                    support = true;
                }
                if(support === true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support === true && a.isFunction(callback)) {
            callback(support);
        }
    }


    /**
     * Get the support state of silverlight.
     * Note: it may arrive little bit after using start function...
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};

    /**
     * Get the ready state of silverlight object
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;};

    /**
     * @property engine
     * @type String
     * @default silverlight
     * @final
    */
    this.engine = 'silverlight';

    /**
     * Start (include and prepare) silverlight object
     * Note: automatically done by system you don't need to...
     *
     * @async
     *
     * @param {Function} callback           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeSilverlight(callback);
    };

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support === true) {
            var item = document.getElementById(id).Content.store.loadData(key);
            if(a.isNone(item) || item === 'false') {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    };

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support === true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).Content.store.saveData(
                                key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support === true) {
            a.storage.debugRemove(this.engine, key);
            document.getElementById(id).Content.store.removeData(key);
        }
    };
};


/*
------------------------------
  JAVAFX
------------------------------
*/
/**
 * javafx external storage.
 *
 * @constructor
*/
a.storage.type.javafx = new function() {
    var support = false,
        ready   = false,
        id      = 'javafxstorage';

    /**
     * Start javaFX and check availability
     *
     * @private
     * @async
     *
     * @param {Function | Null} callback    The callback function to
     *                                      call after loading
    */
    function includeJavaFX(callback) {
        if(support === false && ready === false) {
            var data = {
                code : 'javafxstorage.Main',
                id : id
            };

            // Loading file
            a.loader.javafx(a.url +
                'vendor/storage/javafx/JavaFXStorage.jar',
            function() {
                ready = true;
                var t = document.getElementById(id);

                if(t.Packages.javafxstorage.localStorage.testData() === true) {
                    support = true;
                    el.setDatabase('a_javafxStorage');
                }
                
                if(support === true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support === true && a.isFunction(callback)) {
            callback(support);
        }
    }

    /**
     * Get the support state of javafx.
     * Note: it may arrive little bit after using start function...
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};
    /**
     * Get the ready state of javafx object.
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;};
    /**
     * @property engine
     * @type String
     * @default javafx
     * @final
    */
    this.engine = 'javafx';

    /**
     * Start (include and prepare) javafx object
     * Note: automatically done by system you don't need to...
     *
     * @async
     *
     * @param {Function} callback           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeJavaFX(callback);
    };

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support === true) {
            var item = document.getElementById(id).Packages.
                                javafxstorage.localStorage.loadData(key);
            if(a.isNone(item) || item === 'false') {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    };

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support === true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).Packages.javafxstorage.
                    localStorage.saveData(key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support === true) {
            a.storage.debugRemove(this.engine, key);
            document.getElementById(id).Packages.
                        javafxstorage.localStorage.removeData(key);
        }
    };
};



/*! ************************
  POPULATING SUPPORT
************************* */
(function() {
    var engines = [a.storage.type.cookie, a.storage.type.localStorage,
        a.storage.type.globalStorage, a.storage.type.sessionStorage,
        a.storage.type.userData];

    for (var i = 0, l = engines.length; i < l; ++i) {
        engines[i].support = engines[i].test();
    }
})();


/*! ************************
  POPULATING DATA FOR TEMPORARY AND PERSIST
************************* */
/*
------------------------------
  TEMPORARY ALIAS
------------------------------
*/
/**
 * Select the best temp storage available.
 *
 * @constructor
*/
a.storage.temporary = (function() {
    'use strict';

    var store = ['sessionStorage', 'cookie', 'memory'];
    for(var i=0, l=store.length; i<l; ++i) {
        var temp = store[i];
        if(a.storage.type[temp].support) {
            a.console.storm('info', 'a.storage.temporary', 'Choosing the ' +
                    'storage ```' + a.storage.type[temp].engine + '```', 3);
            a.message.dispatch('a.storage.temporary.change', 
                            { engine : temp });
            return a.storage.type[temp];
        }
    }

    // Memory store should be always OK, so this should never arrive
    return null;
})();


/*
------------------------------
  EXTERNAL ALIAS
------------------------------
*/
/**
 * Select the best external storage available.
 *
 * @constructor
*/
a.storage.external = (function() {
    'use strict';

    var started = false;

    /**
     * Start the callback function if possible.
     *
     * @private
     * @async
     *
     * @param {Object} type                 The object to use for external
     * @param {Function | Null} callback    The function to launch if a
     *                                      store has been found
    */
    function startCallback(type, callback) {
        a.storage.external.ready   = type.ready;
        a.storage.external.support = type.support;
        a.storage.external.engine  = type.engine;
        a.storage.external.get     = type.get;
        a.storage.external.set     = type.set;
        a.storage.external.remove  = type.remove;

        if(a.isFunction(callback)) {
            callback();
        }
    }

    return {
        /**
         * Start the external tool, try to find an available store.
         *
         * @async
         *
         * @param {Function | Null} callback    The function to launch if
         *                                      a store has been found
        */
        start : function(callback) {
            var silvt = a.storage.type.silverlight,
                flash = a.storage.type.flash,
                javax = a.storage.type.javafx,
                source= 'a.storage.external',
                cs    = 'Choosing the storage ';

            // Loading silverlight
            silvt.start(function(svtSupport) {
                if(svtSupport) {
                    a.console.storm('info', source, cs + 'silverlight', 3);
                    startCallback(silvt, callback);
                } else {
                    // Loading flash
                    flash.start(function(flashSupport) {
                        if(flashSupport) {
                            a.console.storm('info', source, cs + 'flash', 3);
                            startCallback(flash, callback);
                        } else {
                            javax.start(function(javaxSupport) {
                                if(javaxSupport) {
                                    a.console.storm('info', source, cs +
                                            'javafx', 3);
                                    startCallback(javax, callback);
                                } else {
                                    a.console.storm('info', source, cs +
                                            'NONE AVAILABLE', 3);
                                }
                            });
                        }
                    });
                }
            });
        }
    };
}());


/*
------------------------------
  PERSISTENT ALIAS
------------------------------
*/
/**
 * Select the best long term storage available.
 *
 * @constructor
*/
a.storage.persistent = (function() {
    'use strict';

    var store = ['localStorage', 'globalStorage', 'userData', 'cookie'];
    for(var i=0, l=store.length; i<l; ++i) {
        var temp = store[i];
        if(a.storage.type[temp].support) {
            a.console.storm('info', 'a.storage.persistent', 'Choosing the ' +
                'storage ```' + a.storage.type[temp].engine + '```', 3);
            a.message.dispatch('a.storage.persistent.change', 
                                    { engine : temp });
            return a.storage.type[temp];
        }
    }

    // This one may append
    return null;
})();

if(a.storage.persistent === null) {
    a.storage.persistent = {};
    a.storage.persistent.support = false;
    a.storage.persistent.engine  = function(){return 'none';};
    a.storage.persistent.get     = function(){return null;};
    a.storage.persistent.set     = function(){};
    a.storage.persistent.remove  = function(){};
}

// Now storage himself got same as persistent
a.storage.support = a.storage.persistent.support;
a.storage.engine  = a.storage.persistent.engine;
a.storage.get     = a.storage.persistent.get;
a.storage.set     = a.storage.persistent.set;
a.storage.remove  = a.storage.persistent.remove;














/*
------------------------------
  PARAMETERS HELPERS
------------------------------
*/
(function() {
    // Default 'store' behavior
    function getGlobalStore(name) {
        var temp = a.storage.temporary.get(name);
        if(a.isNone(temp)) {
            temp = a.storage.persistent.get(name);
        }
        return temp;
    }

    a.parameter.addParameterType('storage', getGlobalStore);
    a.parameter.addParameterType('store', getGlobalStore);

    // Parameters type
    a.parameter.addParameterType('temporary',  a.storage.temporary.get);
    a.parameter.addParameterType('memory',     a.storage.memory.get);
    a.parameter.addParameterType('persistent', a.storage.persistent.get);
    a.parameter.addParameterType('cookie',     a.storage.cookie.get);
})();

/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Handlebars type
    Handlebars.registerHelper('temporary', function(value) {
        return new Handlebars.SafeString(a.storage.temporary.get(value));
    });
    Handlebars.registerHelper('memory', function(value) {
        return new Handlebars.SafeString(a.storage.memory.get(value));
    });
    Handlebars.registerHelper('persistent', function(value) {
        return new Handlebars.SafeString(a.storage.persistent.get(value));
    });
    Handlebars.registerHelper('cookie', function(value) {
        return new Handlebars.SafeString(a.storage.cookie.get(value));
    });

    // Default 'store' behavior, encaps into Handlebars SafeString
    function getHandlebarsStore(name) {
        var temp = a.storage.temporary.get(name);
        if(a.isNone(temp)) {
            temp = a.storage.persistent.get(name);
        }
        return new Handlebars.SafeString(temp);
    }

    Handlebars.registerHelper('storage', getHandlebarsStore);
    Handlebars.registerHelper('store', getHandlebarsStore);
})();