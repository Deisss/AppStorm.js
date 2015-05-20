/* ************************************************************************

    License: MIT Licence

    Description:
        Main AppStorm.JS functionality, create some needed system to help plugin or user

************************************************************************ */

/*!
 * @private
*/
;


/*
 * Bind AppStorm.JS to lodash.
 * Note: in node module, we need to deep clone it (does not seems to be
 * needed for chrome/firefox/others version)
*/
window.appstorm = window.a = _.cloneDeep(_.noConflict());

(function(a) {
    /**
     * Avoid namespace conflict.
     *
     * @return {AppStorm.JS}                The main a object from AppStorm.JS
    */
    a.noConflict = function() {
        return this;
    };
})(window.appstorm);

/**
 * The core url (for vendor loading)
 *
 * @property url
 * @type String
*/
a.url = '';

/**
 * Change the function initial scope for given one
 *
 * @method scope
 *
 * @param fct {Function}                    The function to bind scope
 * @param scope {Object}                    The object scope to link
 * @return {Function}                       Intermediate function with scope
 *                                          binding
*/
a.scope = function(fct, scope) {
    return function() {
        return fct.apply(scope, arguments);
    };
};

/**
 * Get the existing stack trace
 *
 * @method getStackTrace
 *
 * @return {String}                         Stack trace
*/
a.getStackTrace = function() {
    var err = new Error();
    return err.stack;
};

/**
 * Test if the element is null or undefined
 *
 * @method isNone
 *
 * @param obj {Object}                      The element to test
 * @return {Boolean}                        True if element is null/undefined
 *                                          False in other cases
*/
a.isNone = function(obj) {
    return (a.isNull(obj) || a.isUndefined(obj));
};


/**
 * Test if the element is a non-null object type
 *
 * @method isTrueObject
 *
 * @param obj {Object}                      The element to test
 * @return {Boolean}                        True if it's an object, false if
 *                                          it's a null value, or not an object
*/
a.isTrueObject = function(obj) {
    return (typeof(obj) === 'object' && !a.isNone(obj));
};


/**
 * Allow trimming string value
 *
 * @method trim
 *
 * @param str {String}                      The value to trim
 * @return {String}                         The trimmed value
*/
a.trim = function(str) {
    // We allow both native and custom trim
    if (!String.prototype.trim) {
        return str.replace(/^\s+|\s+$/g, '');
    } else {
        return str.trim();
    }
};


/**
 * Make the first letter of given string, uppercase.
 *
 * @method firstLetterUpperCase
 *
 * @param str {String}                      The string to apply transformation
 * @param prefix {String}                   A prefix to apply aftre transform
 * @return {String}                         The string with first letter in
 *                                          uppercase
*/
a.firstLetterUppercase = function(str, prefix) {
    prefix = prefix || '';
    return prefix + str.charAt(0).toUpperCase() + str.slice(1);
};


/**
* Create a deep copy (used internally)
* FROM : http://www.xenoveritas.org/blog/xeno/the-correct-way-to-clone-javascript-arrays
* Credits to them ! Little bug corrected :p
*
* @method clone
*
* @param obj {Object}                       A state object
* @return {Object}                          A new state object
*/
a.deepClone = function(obj) {
    // The deep clone only take care of object, and not function
    if (a.isTrueObject(obj) && !a.isFunction(obj)) {
        // Array cloning
        if(a.isArray(obj)) {
            var l = obj.length,
                y = new Array(l);
            for(var i = 0; i < l; ++i) {
                y[i] = a.deepClone(obj[i]);
            }
            return y;

        // Object cloning
        } else {
            var r = {};
            if(a.isFunction(obj.constructor)) {
                r = new obj.constructor();
            }
            // Bug : json object does not have prototype
            if(a.isTrueObject(obj.prototype)) {
                r.prototype = obj.prototype;
            }
            for(var k in obj) {
                r[k] = a.deepClone(obj[k]);
            }
            return r;
        }
    }
    return obj;
};


/**
 * Get the difference between objects.
 *
 * @method
 *
 * @param obj1 {Object}                     The object initial to retrieve
 *                                          difference from
 * @param obj2 {Object}                     The second object to check
 *                                          difference from
 * @return {Object}                         The result-free object
*/
a.differenceObject = function(obj1, obj2) {
    var keys = a.difference(a.keys(obj1), a.keys(obj2)),
        result = {};

    a.each(keys, function(key) {
        result[key] = this[key];
    }, obj1);

    return result;
};


/**
 * Extend an object with child properties (underscore.js like)
 *
 * @method extend
 *
 * @param object {Object}                   The element to extend with other
 *                                          properties
 * @param source {Object}                   The source object to take
 *                                          properties from
 * @return {Object}                         A combined object
*/
a.extend = function(object, source, guard) {
    if (!object) {
        return object;
    }
    var args = arguments,
        argsIndex = 0,
        argsLength = args.length,
        type = typeof guard;

    if ((type == 'number' || type == 'string') && args[3] &&
            args[3][guard] === source) {
        argsLength = 2;
    }
    while (++argsIndex < argsLength) {
        source = args[argsIndex];
        if (source) {
            for (var key in source) {
                object[key] = source[key];
            }
        }
    }
    return object;
};

/**
 * Alias for Watch.JS
 *
 * @method watch
 * @see https://github.com/melanke/Watch.JS/
 *
 * @param                                   See Watch.JS documentation
*/
a.watch = function() {
    WatchJS.watch.apply(this, arguments);
};

/**
 * Alias for Watch.JS
 *
 * @method unwatch
 * @see https://github.com/melanke/Watch.JS/
 *
 * @param                                   See Watch.JS documentation
*/
a.unwatch = function() {
    WatchJS.unwatch.apply(this, arguments);
};

/**
 * Sanitize a URL. Mostly usefull internally to avoid loading twice the
 * same url because of stupid hack like this ./hello/../hello.
 * FROM: http://jsperf.com/normalize-path
 *
 * @param {String} url                      The url to sanitize
 * @return {String}                         The url sanitize
*/
a.sanitize = function(url) {
    var parts       = url.split('/'),
        directories = [],
        prev;

    for (var i = 0, l = parts.length - 1; i <= l; i++) {
        var directory = parts[i];
  
        // if it's blank, but it's not the first thing, and not the
        // last thing, skip it.
        if (directory === '' && i !== 0 && i !== l) {
            continue;
        }
  
        // if it's a dot, and there was some previous dir already, then
        // skip it.
        if (directory === '.' && typeof prev !== 'undefined') {
            continue;
        }
  
        // if it starts with "", and is a . or .., then skip it.
        if (directories.length === 1 && directories[0] === '' &&
                (directory === '.' || directory === '..')) {
            continue;
        }
  
        if (directory === '..' && directories.length && prev !== '..' &&
                prev !== '.' && typeof prev !== 'undefined' &&
                prev !== '') {
            directories.pop();
            prev = directories.slice(-1)[0]
        } else {
            if (prev === '.') {
                directories.pop();
            }
            directories.push(directory);
            prev = directory;
        }
    }

    var result = directories.join('/');

    // It may contains a first char '/'
    if (result.length > 0 && result[0] === '/') {
        result = result.substr(1);
    }

    return result;
};

/**
 * Define the default ajax options to send on every request.
 * At any time, by providing good options, you can override this content
 * on a single ajax request.
 *
 * @method setDefaultAjaxOptions
 *
 * @param options {Object}                  The default options to set
*/
a.setDefaultAjaxOptions = function(options) {
    if(a.isTrueObject(options)) {
        a.mem.set('app.ajax.default', options);
    }
};

/**
 * Get the default ajax options currently stored
 * (and used by every ajax request)
 *
 * @method getDefaultAjaxOptions
 *
 * @return {Object}                         The default ajax options setted
*/
a.getDefaultAjaxOptions = function() {
    return a.mem.get('app.ajax.default') || {};
};

/**
 * Define an ajax template to use for the given request
 *
 * @method setTemplateAjaxOptions
 *
 * @param name {String}                     The template name to define
 * @param options {Object}                  The options linked to template
*/
a.setTemplateAjaxOptions = function(name, options) {
    if(name && a.isTrueObject(options)) {
        a.mem.set('app.ajax.template.' + name, options);
    }
};

/**
 * Get an existing template rearding it's name
 *
 * @method getTemplateAjaxOptions
 *
 * @param name {String}                     The template name to retrieve
 * @return {Object | null}                  The resulting object content
*/
a.getTemplateAjaxOptions = function(name) {
    return a.mem.get('app.ajax.template.' + name);
};

/**
 * Set a before action to perform on every ajax request using it
 *
 * @method setAjaxBefore
 *
 * @param name {String}                     The name to use for recall
 * @param fct {Function | null}             The linked function to use
*/
a.setAjaxBefore = function(name, fct) {
    if(name && a.isFunction(fct)) {
        a.mem.set('app.ajax.before.' + name, fct);
    }
};

/**
 * Get an existing ajax before function, or null if nothing is found
 *
 * @method getAjaxBefore
 *
 * @param name {String}                     The name previously stored using
 *                                          setAjaxBefore
 * @return {Function | null}                The function if found, null in
 *                                          other cases
*/
a.getAjaxBefore = function(name) {
    return a.mem.get('app.ajax.before.' + name) || null;
};

/**
 * Set an after action to perform on every ajax request using it
 *
 * @method setAjaxAfter
 *
 * @param name {String}                     The name to use for recall
 * @param fct {Function | null}             The linked function to use
*/
a.setAjaxAfter = function(name, fct) {
    if(name && a.isFunction(fct)) {
        a.mem.set('app.ajax.after.' + name, fct);
    }
};

/**
 * Get an existing ajax after function, or null if nothing is found
 *
 * @method getAjaxAfter
 *
 * @param name {String}                     The name previously stored using
 *                                          setAjaxAfter
 * @return {Function | null}                The function if found, null in
 *                                          other cases
*/
a.getAjaxAfter = function(name) {
    return a.mem.get('app.ajax.after.' + name) || null;
};

/*
 * Check AppStorm.JS source url
*/
(function() {
    // Detecting base url of AppStorm.JS
    var me = document.getElementById('a-core');
    if(me && !a.isNone(me.src)) {
        a.url = me.src.replace(new RegExp('/[^/]*$'), '/');
    }
}());


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // From: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks
    Handlebars.registerHelper('debug', function(optionalValue) {
        a.console.log('===== CONTEXT ======');
        a.console.log(this);
     
        if(!a.isUndefined(optionalValue)) {
            a.console.log('====== VALUE =======');
            a.console.log(optionalValue);
        }
    });

    // Try to count elements
    Handlebars.registerHelper('count', function(value) {
        a.console.log('=== DEBUG COUNT ====');
        if(a.isUndefined(value.length)) {
            a.console.log('Length is not defined for value');
            a.console.log(value);
        } else {
            a.console.log(value.length);
        }
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide easy store object, with global prefix value system on top of it

************************************************************************ */


/**
 * Provide easy store object, with global prefix value system on top of it.
 *
 * @constructor
*/
a.mem = (function() {
    var store = {};

    /**
     * Sanitize a key to generate a 'usable' key.
     *
     * @private
     *
     * @param {String} key                  The key string to sanitize
     * @return {String}                     The key sanitize
    */
    function sanitizeKey(key) {
        if(!a.isString(key)) {
            return null;
        }

        // remove all whitespace
        key = key.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
                 .replace(/\s+/g, ' ');

        // Sanitize double .. and replace by '.'
        while(key.indexOf('..') >= 0) {
            key = key.replace(/(\.\.)/g, '.');
        }

        // Remove '.' at the beginning and at the end
        if(key.charAt(0) == '.') {
            key = key.substring(1);
        }
        if(key.charAt(key.length - 1) == '.') {
            key = key.substr(0, key.length - 1);
        }
        return key;
    }

    /**
     * Get a stored element.
     *
     * @private
     *
     * @param {String} key                  The key to retrieve value from
     * @return {Object | Null}              null in case of not found, and
     *                                      the stored value if found
    */
    function getFromStore(key) {
        key = sanitizeKey(key);
        if(key) {
            var result = store[key];
            if(!a.isUndefined(result)) {
                return result;
            }
        }
        return null;
    }

    /**
     * Get the full stored elements.
     *
     * @private
     *
     * @param {String} prefix               The prefix to use as 'search from
     *                                      that point'
     * @return {Object}                     A key value object with all values
     *                                      found matching prefix
    */
    function listFromStore(prefix) {
        var key = sanitizeKey(prefix);
        if(!key) {
            return store;
        } else {
            var partialStore = {};
            a.each(store, function(value, index) {
                if(index.indexOf(key) === 0) {
                    // We remove the prefix stored
                    var parsedIndex = index.substring(key.length + 1);
                    partialStore[parsedIndex] = value;
                }
            });
            return partialStore;
        }
    }

    /**
     * Store a new element, or erase a previous element.
     *
     * @private
     *
     * @param {String} key                  The key to set value linked to
     * @param {Object} value                The value to associate to key
    */
    function setToStore(key, value) {
        key = sanitizeKey(key);
        if(key) {
            store[key] = value;
        }
    }

    /**
     * Remove an element from store.
     *
     * @private
     *
     * @param {String} key                  The key to erase from store
    */
    function removeFromStore(key) {
        key = sanitizeKey(key);
        delete store[key];
    }


    /**
     * Clear the full store.
     *
     * @private
     *
     * @param {String} prefix               The prefix to clear.
    */
    function clearStore(prefix) {
        for(var key in store) {
            if(key.indexOf(prefix) === 0) {
                delete store[key];
            }
        }
    }


    /**
     * Generic object to derivate from prefix element.
     *
     * @private
     *
     * @param {String} prefix               The prefix
    */
    var genericObject = function(prefix) {
        this.prefix = prefix;
    };

    // Create the default prototype instance
    genericObject.prototype = {
        /**
         * Get a stored element.
         *
         * @param {String} key              The key to retrieve value from
         * @return {Object | Null}          null in case of not found, and
         *                                  the stored value if found
        */
        get: function(key) {
            return getFromStore(this.prefix + '.' + key);
        },

        /**
         * Get the full currently stored elements.
         *
         * @return {Object}                  An object of all currently stored
         *                                   elements
        */
        list: function() {
            return listFromStore(this.prefix);
        },

        /**
         * Store a new element, or erase a previous element.
         *
         * @param {String} key              The key to set value linked to
         * @param {Object} value            The value to associate to key
        */
        set: function(key, value) {
            setToStore(this.prefix + '.' + key, value);
        },

        /**
         * Remove an element from store.
         *
         * @param {String} key              The key to erase from store
        */
        remove: function(key) {
            removeFromStore(this.prefix + '.' + key);
        },

        /**
         * Clear everything stored inside store.
        */
        clear: function() {
            // Must be a string not empty...
            if(this.prefix) {
                clearStore(this.prefix);
            }
        }
        /*!
         * @private
        */
    };

    var defaultInstance = new genericObject('');

    /**
     * Retrieve a custom mem object to manipulate from root prefix.
     *
     * @param {String} prefix               The prefix to use as base
     * @return {Object}                     An instance ready to use
    */
    defaultInstance.getInstance = function(prefix) {
        return new genericObject(prefix);
    };
    /*!
     * @private
    */

    // return the custom object
    return defaultInstance;
})();


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Get mem elements
    Handlebars.registerHelper('mem', function(value) {
        return new Handlebars.SafeString(a.mem.get(value));
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Environment functionnality, to get access to some basic
        'main options' for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some global
 * rules for managing global environment variable. Use the a.mem object
 * for others type of variables.
*/
a.environment = a.mem.getInstance('app.environment');

// Default data

// The application state, debug/production
a.environment.set('app.debug', false);
// The console verbosity (from 1 to 3, 3 most verbose, 1 less verbose)
a.environment.set('console.verbose', 3);
// The console minimum log level (from log to error)
a.environment.set('console.minimum', 'log');
// The ajax cache system
a.environment.set('ajax.cache', false);

// The application url
if(a.isString(a.url) && a.url.length > 0) {
    a.mem.set('app.url', a.url);
}

/*!
------------------------------
  BROWSER HELPERS
------------------------------
*/
(function() {
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Chrome 1+
    var isChrome = !!window.chrome && !isOpera;
    // At least IE6
    var isIE = (document.all && !isChrome && !isOpera && !isSafari && !isFirefox) || !!document.documentMode;

    var browser = 'other';
    if (isOpera) {
        browser = 'opera';
    } else if (isFirefox) {
        browser = 'firefox';
    } else if (isSafari) {
        browser = 'safari';
    } else if (isChrome) {
        browser = 'chrome';
    } else if (isIE) {
        browser = 'ie';
    }

    a.environment.set('browser', browser);
})();

/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('environment', function(value) {
    return new Handlebars.SafeString(a.environment.get(value));
});;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Debugger functionnality including nested group system like console
        usually provide

************************************************************************ */

(function (win, a) {
    'use strict';

    /**
     * Test if browser support or not the CSS in console.
     *
     * @private
     *
     * @param {String} browser              The browser name (firefox, ...)
     * @return                              True it does support, false it
     *                                      does not support...
    */
    function testBrowserSupportCSS(browser) {
        // TODO: Maybe too simple test...
        // IE does not support it...
        return (browser === 'opera' || browser === 'firefox' ||
                browser === 'chrome');
    }

    // We can have only one element printing at a time.
    // This variable is a kind of lock for this.
    var concurrentConsoleAccess = false,
        browser = a.environment.get('browser'),
        cssSupport = testBrowserSupportCSS(browser),
        // Used only when system does not support groupCollapsed/group system
        // in console
        indent = 0;

    if (win.console) {
        if (!a.isFunction(win.console.groupCollapsed)) {
            win.console.groupCollapsed = function() {
                win.console.log(arguments);
                indent += 1;
            };
        }

        if (!a.isFunction(win.console.group)) {
            win.console.group = function() {
                win.console.log(arguments);
                indent += 1;
            };
        }

        if (!a.isFunction(win.console.groupEnd)) {
            win.console.groupEnd = function() {
                indent -= 1;
            };
        }
    }

    /*!
     * Regex used for markdown parsing.
     *
     * Strongly inspired by: https://github.com/adamschwartz/log
     * All credit goes to him !!!!!
    */
    var formats = [{
        regex: /\*\*([^\*]+)\*\*/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['font-weight: bold', ''];
         }
    }, {
        regex: /\_\_([^\_]+)\_\_/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['font-style: italic', ''];
        }
    }, {
        regex: /\`\`\`([^\`]+)\`\`\`/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)', ''];
        }
    }, {
        regex: /\[c\=(?:\"|\')?((?:(?!(?:\"|\')\]).)*)(?:\"|\')?\]((?:(?!\[c\]).)*)\[c\]/,
        replacer: function(m, p1, p2) {
            return cssSupport ? '%c' + p2 + '%c' : p2;
        },
        styles: function(match) {
            return [match[1], ''];
        }
    }];


    /**
     * Detect if there is some markdown to parse...
     * @see https://github.com/adamschwartz/log
     *
     * @private
     *
     * @param {String} str                  The string to search markdown in
     * @return {Boolean}                    True, markdown exist, false not.
    */
    function hasMarkdownMatches(str) {
        var has = false;

        for (var i = 0, l = formats.length; i < l && !has; ++i) {
            if (formats[i].regex.test(str)) {
                has = true;
            }
        }

        return has;
    }

    /**
     * Get ordered matches for every markdown existing.
     * @see https://github.com/adamschwartz/log
     *
     * @private
     *
     * @param {String} str                  The string to markdown
     * @return {Array}                      The matches found
    */
    function getOrderedMarkdownMatches(str) {
        var matches = [];

        // Testing
        a.each(formats, function(format) {
            var match = str.match(format.regex);
            if (match) {
                matches.push({
                    format: format,
                    match: match
                });
            }
        });


        // Sorting
        matches = a.sortBy(matches, function(entry) {
            return entry.match.index;
        });

        return matches;
    }

    /**
     * Parse the value and replace it by correct CSS rules.
     *
     * @private
     *
     * @param {String} str                  The value to modify it's markdown
     * @return {Array}                      The value with CSS replaced as an
    */
    function markdown(str) {
        if (!a.isString(str)) {
            return [str];
        }

        var first, matches, styles;
        styles = [];
        while (hasMarkdownMatches(str)) {
            matches = getOrderedMarkdownMatches(str);
            first = matches[0];
            str = str.replace(first.format.regex, first.format.replacer);
            styles = styles.concat(first.format.styles(first.match));
        }

        // Correcting the indent if the group system
        // does not exist
        if (indent > 0) {
            for (var i = 0, l = indent.length; i < l; ++i) {
                str = '  ' + str;
            }
        }

        if (cssSupport) {
            return [str].concat(styles);
        } else {
            return [str];
        }
    }

    /**
     * Test the minimum type for a given log.
     * Like we can test the 'log' can be printed or not according
     * to current verbose parameter configured in a.environment.
     *
     * @private
     *
     * @param currentType {String}          The level to test
     * @return {Boolean}                    True the minimum level is OK for
     *                                      current test, false the minimum
     *                                      level is too high for current test.
    */
    function testMinimumType(currentType) {
        var minimumType = a.environment.get('console.minimum');
        switch (minimumType) {
        case 'error':
            if (currentType !== 'error') {
                return false;
            }
            break;
        case 'warning':
        case 'warn':
            if (currentType !== 'warn' &&
                    currentType !== 'warning' &&
                    currentType !== 'error') {
                return false;
            }
            break;
        case 'info':
            if (currentType === 'log') {
                return false;
            }
            break;
        default:
            break;
        }
        return true;
    }

    /**
     * Test the minimum allowed verbose level.
     *
     * @private
     *
     * @param currentSource {String}        The source (may change the verbose)
     * @param currentVerbose {Integer}      The verbose level to test
     * @return {Boolean}                    The verbose level is allowed for
     *                                      the current configured verbose
    */
    function testMinimumVerbose(currentSource, currentVerbose) {
        var cv = 'console.verbose',
            minimumGlobalVerbose = a.environment.get(cv),
            minimumSourceVerbose = a.environment.get(cv + '-' +
                currentSource);

        if (minimumGlobalVerbose === null && minimumSourceVerbose === null) {
            return true;
        }

        // This part can override the default verbose level.
        if (currentSource && minimumSourceVerbose !== null) {
            return currentVerbose <= minimumSourceVerbose;
        }

        return currentVerbose <= minimumGlobalVerbose;
    }

    /**
     * Print a single log on console (if console is available).
     *
     * @private
     *
     * @param entry {Object}                The log to print on console
    */
    function output(entry) {
        // We can't print anything if the console does not exist...
        if (a.isNone(win.console) || !a.isFunction(win.console.log)) {
            return;
        }

        // This does not work for printing groups
        if (entry.type === 'group') {
            return;
        }

        var cs = win.console[entry.type],
            source = entry.source;

        // Rollback to log if user is accessing something not existing
        // like 'table' may be in this category on some browser...
        if (a.isNone(cs)) {
            cs = win.console.log;
        }

        // Test if the log is allowed to be printed or not
        if (testMinimumType(entry.type) &&
                testMinimumVerbose(source, entry.verbose)) {

            // This is the most common case
            // In this particular case, we can do many things...
            if (entry.args.length === 1) {
                // We try to call the console with the markdown style...
                cs.apply(win.console, markdown(entry.args[0]));

            // In this case we can't really do something...
            } else {
                cs.apply(win.console, entry.args);
            }
        }
    }

    /**
     * Generate from the type, source and value the related storm printing.
     *
     * @private
     *
     * @param {String} type                 The type (log, warn, error,...)
     * @param {String} source               The source (the function/object
     *                                      name)
     * @param {String} value                The usual log.
     * @return {String}                     The markdown version for all
     *                                      AppStorm.JS messages
    */
    function storm(type, source, value) {
        // Content got one empty string at beginning to insert
        // %c with join at the beginning of string
        var content = '',
            white = 'color:white;',
            padding = (browser === 'firefox') ? 'padding:3px;' :
                    'padding:1px;';

        switch (type) {
        case 'log':
            content += '[c="' + padding + 'background:#2d89ef;' + white +
                    '"]   LOG   [c]';
            break;
        case 'info':
            content += '[c="' + padding + 'background:#00a300;' + white +
                    '"]  INFO.  [c]';
            break;
        case 'warn':
        case 'warning':
            content += '[c="' + padding + 'background:#ffc40d;' + white +
                    '"]  WARN.  [c]';
            break;
        case 'error':
            content += '[c="' + padding + 'background:#ee1111;' + white +
                    '"]  ERROR  [c]';
            break;
        }

        if (source) {
            content += '[c="' + padding + 'background:#666;' + white + '"]  ' +
                    source + '  [c]';
        }

        content += '[c="background:inherits;color:inherits;"] [c]' + value;

        return content;
    }

    /**
     * Register a new log.
     *=
     * @private
     *
     * @param type {String}                 The log type (log, warn, info...)
     * @param args {Object}                 The log data
    */
    function register(type, args) {
        // If nothing is set, the verbose level is consider as
        // critical - must be printed
        var verbose = 1,
            source = '';

        if (args.length > 0 && a.isTrueObject(args[0]) &&
                args[0].storm === true) {
            verbose = parseInt(args[0].verbose, 10);
            source = args[0].source;

            // In the storm case, we create specific rendering
            var textMarkdown = storm(type, source, args[0].value);

            // The first element is the log, others are CSS
            args = [textMarkdown];
        }

        // Creating the data structure
        var data = {
            type: type,
            verbose: verbose,
            source: source,
            args: args
        };

        this.logs.push(data);

        // We clear if there is too much logs
        while(this.logs.length > 2000) {
            this.logs.shift();
        }

        // On direct case we print it
        if (this.isDirect) {
            output(data);
        }
    }

    /*
     * Debugger is a wrapper around window.console to provide a more
     * structured way to access and use group system provided by console.
     *
     * @constructor
     *
     * @param {String} name                 The debugger name
     * @param {Boolean} collapsed           The collapsed state, only useful
     *                                      if isDirect is set to false
     * @param {Object | Null} parent        The parent of this debugger, can be
     *                                      null
    */
    a.debugger = function (name, collapsed, parent) {
        // New problem
        if (!(this instanceof a.debugger)) {
            return new a.debugger(name, collapsed, parent);
        }

        this.name = name;
        this.collapsed = collapsed || false;
        this.parent = parent || null;
        this.logs = [];
        this.isDirect = true;
    };

    a.debugger.prototype = {
        /**
         * Create a group inside this debugger.
         *
         * @param {String} name                 The new sub group name
         * @param {Boolean | Null} collapsed    If we should collapse or not when
         *                                      printing to console
         * @return {a.debugger}                 The debugger associated or null
         *                                      value if group is not allowed
        */
        group: function (name, collapsed) {
            // In direct mode there is no group support
            if (this.isDirect) {
                return null;
            }
            var root = a.debugger(name, collapsed, this);
            this.logs.push({
                type: 'group',
                args: root
            });
            return root;
        },

        /**
         * Render the group and all sub groups into console.
        */
        print: function () {
            // In direct mode there is no print support
            if (this.isDirect) {
                return;
            }
            // Somebody is already using it... We have to wait a while
            if (this.parent === null && concurrentConsoleAccess === true) {
                setTimeout(this.print, 50);
                return;
            }

            var cs = win.console;

            // The root (the original one), lock the console
            // to not pollute with other eventual print
            if (this.parent === null) {
                concurrentConsoleAccess = true;
            }

            // Starting groups
            if (this.collapsed === true) {
                cs.groupCollapsed(this.name);
            } else {
                cs.group(this.name);
            }

            // Loggings
            a.each(this.logs, function(log) {
                if (log.type === 'group') {
                    var group = log.args;
                    group.print();
                }else {
                    output(log);
                }
            });

            // Ending group
            cs.groupEnd();

            if (this.parent === null) {
                concurrentConsoleAccess = false;
            }
        },

        /**
         * Print into console as a table.
         *
         * @param {Object} any              Anything to send to console
        */
        table: function() {
            register.call(this, 'table',
                    Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into console.
         *
         * @param {Object} any              Anything to send to console
        */
        log: function() {
            register.call(this, 'log', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into console.
         *
         * @param {Object} any              Anything to send to console
        */
        warn: function() {
            register.call(this, 'warn', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into info.
         *
         * @param {Object} any              Anything to send to console
        */
        info: function() {
            register.call(this, 'info', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into error.
         *
         * @param {Object} any              Anything to send to console
        */
        error: function() {
            register.call(this, 'error',
                    Array.prototype.slice.call(arguments));
        },

        /**
         * Specific AppStorm.JS debug element, allowing to print
         * nice message on the console.
         *
         * @param {String} level            The level like log, info, error...
         * @param {String} source           The object source raising this
         *                                  log
         * @param {String} log              The log message
         * @param {Integer} verbose         The verbose (1, 2, 3)
        */
        storm: function(level, source, log, verbose) {
            register.call(this, level, [{
                storm: true,
                source: source || '',
                verbose: verbose || 1,
                value: log || ''
            }]);
        },

        /**
         * Get the current trace stored into debugger.
         *
         * @param {String | Null} type      The type like log, info... If null,
         *                                  We get all trace...
         * @return {Array}                  The tracelog currently stored
        */
        trace: function(type) {
            if (a.isString(type)) {
                return a.filter(this.logs, function(el) {
                    return el.type === type;
                });
            }
            return this.logs;
        },

        /**
         * Clear the debugger.
        */
        clear: function() {
            this.logs = [];
        }
        /*!
         * @private
        */
    };
})(window, window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Console functionnality, based on debugger.js, it provides basic
        map surround normal console stuff, including markdown template

************************************************************************ */


/**
 * Wrapper for system console, allowing to use console even if there is no
 * console support on given browser.
 * Also, it does provide a trace utility in case of bug/check to recover all
 * passed log to it.
 *
 * @constructor
 *
 * @see core/debugger
*/
(function(a) {
    a.console = a.debugger('console', true, null);
    a.console.isDirect = true;
})(window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Define one reusable object (eventEmitter)
        and create a root event system (message)
        ( @see : http://simplapi.wordpress.com/2012/09/01/custom-event-listener-in-javascript/ )

************************************************************************ */



/**
 * Simple message/event system allowing to exchange data across elements threw
 * events. **a.message is an instance of a.eventEmitter**.
 *
 * @constructor
 *
 * @param {String} base                     The event system name. Like for
 *                                          a.message it's 'a.message'
*/
a.eventEmitter = function(base) {
    if (!(this instanceof a.eventEmitter)) {
      return new a.eventEmitter(base);
    }

    this.eventList = {};
    this.eventBaseName = base;
};


a.eventEmitter.prototype = {
    /**
     * Clear the event listeners which don't have any function added.
     *
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
     * Bind a function to an event type.
     *
     * @param {String} type                 The event type
     * @param {Function} fn                 The function to bind to event
     * @param {Object | Null} scope         The scope to bind to function
     * @param {Boolean | Null} once         If we should start it only once or
     *                                      not
     * @param {Boolean | Null} clear        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bind: function(type, fn, scope, once, clear) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var pbBind = 'The type ```' + type + '``` cannot be bind';
            a.console.storm('warn', this.eventBaseName + '.bind', pbBind, 1);
            return;
        }

        // The function is invalid (not a function)
        if(!a.isFunction(fn)) {
            var notFunc = 'unable to bind function, ```' + fn +
                    '``` is not a function';
            a.console.storm('warn', this.eventBaseName + '.bind', notFunc, 1);
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
     * Adding a listener only once.
     *
     * @param {String} type                 The event type
     * @param {Function} fn                 The function to bind to event
     * @param {Object | Null} scope         The scope to bind to function
     * @param {Boolean | Null} clear        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bindOnce: function(type, fn, scope, clear) {
        this.bind(type, fn, scope, true, clear);
    },

    /**
     * Removing a listener to a specific message type.
     *
     * @param {String} type                 The event name
     * @param {Function} fn                 The function to detach
    */
    unbind: function(type, fn) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var msg = 'The type ```' + type + '``` cannot be unbind';
            a.console.storm('warn', this.eventBaseName + '.unbind', msg, 1);
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
     * Remove all listeners for a given type.
     *
     * @param {String} type                 The event type to remove
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
     * Clear all listeners from all event type.
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
     * Call an event, according to it's type.
     *
     * @param {String} type                 The event name to dispatch
     * @param {Object} data                 Anything you want to pass threw
     *                                      this event
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

        // The global event catcher
        if (type !== '*') {
            this.dispatch.call(this, '*', data);
        }
    }
};


/*
------------------------------
  MESSAGE
------------------------------
*/
/**
 * The bus system to exchange message globally between all application object.
*/
a.message = a.eventEmitter('a.message');


/*
------------------------------
  GLOBAL
------------------------------
*/
/*!
 * @private
*/
(function() {
    var ready = false,
        tmp = [];

    /*!
     * @private
    */

    /**
     * Internal function to call function regarding it's scope.
     *
     * @private
     *
     * @param {Function} func               The function to call
     * @param {Object | Null} scope         The potential scope (optional)
    */
    function internalCall(func, scope) {
        setTimeout(function() {
            if(scope) {
                func.call(scope);
            } else {
                func();
            }
        }, 0);
    }

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
     * Alias mostly used for appstorm ready event.
     *
     * @param {String} name                     The event name
     * @param {Function} func                   The function to start
     * @param {Object | Null} scope             The scope to apply (optional)
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

    /*!
     * @private
    */
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide parsing/stringify functionnality for JSON and XML format

************************************************************************ */

/**
 * Provide parsing/stringify functionnality for JSON and XML format.
 *
 * @constructor
*/
a.parser = {
    /**
     * Basic JSON handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check.
     *
     * @constructor
    */
    json: {
        /**
         * Serialize a JSON into a string.
         *
         * @param {Object} value            Any data to be converted
         * @return {String}                 A JSON parsed string, or an empty
         *                                  string if the parsing fails
        */
        stringify: function() {
            try {
                return JSON.stringify.apply(null, arguments);
            } catch(e) {
                var error = 'Unable to stringify the value ```' +
                        arguments.toString() + '```. Below the stack trace.';
                a.console.storm('error', 'a.parser.json.stringify', error, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('app.debug')) {
                    a.console.error(a.getStackTrace());
                }
                return '';
            }
        },

        /**
         * Deserialize a string into JSON.
         *
         * @param {String} value            The value un-stringify
         * @return {Mixed | Null}           The converted value
        */
        parse: function(value) {
            try {
                return JSON.parse(value);
            } catch(e) {
                var error = 'Unable to parse the value ```' + value +
                        '```. Below the stack trace.';
                a.console.storm('error', 'a.parser.json.parse', error, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('app.debug')) {
                    a.console.error(a.getStackTrace());
                }
                return null;
            }
        }
    },

    /**
     * Basic XML handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check.
     *
     * @constructor
    */
    xml: {
        /**
         * Serialize a XML into a string.
         *
         * @param {Object} value            Any data to be converted
         * @return {String}                 A parsed string, or an empty
         *                                  string if the parsing fails
        */
        stringify: function(value) {
            if(!a.isNone(value) && !a.isNone(value.xml)) {
                return value.xml;
            } else if(!a.isNone(window.XMLSerializer)) {
                try {
                    var serializer = new window.XMLSerializer();
                    return serializer.serializeToString(value);
                } catch(e) {
                    var error = 'Unable to stringify the value ```' + value +
                            '```. Below the stack trace.';
                    a.console.storm('error', 'a.parser.xml.stringify',
                            error, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('app.debug')) {
                        a.console.error(a.getStackTrace());
                    }
                }
            }

            a.console.storm('error', 'a.parser.xml.stringify', 
                'Unable to find any parser for stringify xml...', 1);
            return '';
        },

        /**
         * Deserialize a string into XML.
         *
         * @param {String} value            The value un-stringify
         * @return {DOMElement | Null}      The resulting doc element, or null
         *                                  in case of problem
        */
        parse: function(value) {
            if(!a.isNone(window.ActiveXObject)) {
                var doc = null;
                // 4: we stop at MSXML 3.0
                for(var i=0; i<4; ++i) {
                    try {
                        // Name are: Msxml2.DOMDocument.6.0 to 3.0
                        var msxml = 'MSXML2.DOMDocument.' + (6 - i) + '.0';
                        doc = new ActiveXObject(msxml[i]);
                    } catch(e) {}
                }
                doc.async = false;
                doc.loadXML(value);
                if (doc.parseError.errorCode !== 0) {
                    var error = 'Unable to parse the value ```' + value +
                            '```, reason ```' + doc.parseError.reason + '```' +
                            '. Below the stack trace.';
                    a.console.storm('error', 'a.parser.xml.parse', error, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('app.debug')) {
                        a.console.error(a.getStackTrace());
                    }

                    return null;
                }
                return doc;
            } else if(!a.isNone(window.DOMParser)) {
                return (new DOMParser()).parseFromString(value, 'text/xml');
            }

            a.console.storm('error', 'a.parser.xml.parse', 
                'Unable to find any parser for parsing xml...', 1);
            return null;
        }
    }
};






/*!
 * USE OF JSON3:
 *    JSON v3.2.4
 *    http://bestiejs.github.com/json3
 *    Copyright 2012, Kit Cambridge
 *    http://kit.mit-license.org
 *
 * It seems JSON3 fully bind at all times, so we change... 
*/
/* jshint ignore:start */

// BEGIN JSON3 - only if json is not supported
if(a.isNone(JSON) && (a.isNone(JSON.parser) || a.isNone(JSON.stringify)) ) {

;(function(){var e=void 0,i=!0,k=null,l={}.toString,m,n,p="function"===typeof define&&define.c,q=!p&&"object"==typeof exports&&exports;q||p?"object"==typeof JSON&&JSON?p?q=JSON:(q.stringify=JSON.stringify,q.parse=JSON.parse):p&&(q=this.JSON={}):q=this.JSON||(this.JSON={});var r,t,u,x,z,B,C,D,E,F,G,H,I,J=new Date(-3509827334573292),K,O,P;try{J=-109252==J.getUTCFullYear()&&0===J.getUTCMonth()&&1==J.getUTCDate()&&10==J.getUTCHours()&&37==J.getUTCMinutes()&&6==J.getUTCSeconds()&&708==J.getUTCMilliseconds()}catch(Q){}
function R(b){var c,a,d,j=b=="json";if(j||b=="json-stringify"||b=="json-parse"){if(b=="json-stringify"||j){if(c=typeof q.stringify=="function"&&J){(d=function(){return 1}).toJSON=d;try{c=q.stringify(0)==="0"&&q.stringify(new Number)==="0"&&q.stringify(new String)=='""'&&q.stringify(l)===e&&q.stringify(e)===e&&q.stringify()===e&&q.stringify(d)==="1"&&q.stringify([d])=="[1]"&&q.stringify([e])=="[null]"&&q.stringify(k)=="null"&&q.stringify([e,l,k])=="[null,null,null]"&&q.stringify({A:[d,i,false,k,"\x00\u0008\n\u000c\r\t"]})==
'{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'&&q.stringify(k,d)==="1"&&q.stringify([1,2],k,1)=="[\n 1,\n 2\n]"&&q.stringify(new Date(-864E13))=='"-271821-04-20T00:00:00.000Z"'&&q.stringify(new Date(864E13))=='"+275760-09-13T00:00:00.000Z"'&&q.stringify(new Date(-621987552E5))=='"-000001-01-01T00:00:00.000Z"'&&q.stringify(new Date(-1))=='"1969-12-31T23:59:59.999Z"'}catch(f){c=false}}if(!j)return c}if(b=="json-parse"||j){if(typeof q.parse=="function")try{if(q.parse("0")===0&&!q.parse(false)){d=
q.parse('{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');if(a=d.a.length==5&&d.a[0]==1){try{a=!q.parse('"\t"')}catch(o){}if(a)try{a=q.parse("01")!=1}catch(g){}}}}catch(h){a=false}if(!j)return a}return c&&a}}
if(!R("json")){J||(K=Math.floor,O=[0,31,59,90,120,151,181,212,243,273,304,334],P=function(b,c){return O[c]+365*(b-1970)+K((b-1969+(c=+(c>1)))/4)-K((b-1901+c)/100)+K((b-1601+c)/400)});if(!(m={}.hasOwnProperty))m=function(b){var c={},a;if((c.__proto__=k,c.__proto__={toString:1},c).toString!=l)m=function(a){var b=this.__proto__,a=a in(this.__proto__=k,this);this.__proto__=b;return a};else{a=c.constructor;m=function(b){var c=(this.constructor||a).prototype;return b in this&&!(b in c&&this[b]===c[b])}}c=
k;return m.call(this,b)};n=function(b,c){var a=0,d,j,f;(d=function(){this.valueOf=0}).prototype.valueOf=0;j=new d;for(f in j)m.call(j,f)&&a++;d=j=k;if(a)a=a==2?function(a,b){var c={},d=l.call(a)=="[object Function]",f;for(f in a)!(d&&f=="prototype")&&!m.call(c,f)&&(c[f]=1)&&m.call(a,f)&&b(f)}:function(a,b){var c=l.call(a)=="[object Function]",d,f;for(d in a)!(c&&d=="prototype")&&m.call(a,d)&&!(f=d==="constructor")&&b(d);(f||m.call(a,d="constructor"))&&b(d)};else{j=["valueOf","toString","toLocaleString",
"propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];a=function(a,b){var c=l.call(a)=="[object Function]",d;for(d in a)!(c&&d=="prototype")&&m.call(a,d)&&b(d);for(c=j.length;d=j[--c];m.call(a,d)&&b(d));}}a(b,c)};R("json-stringify")||(r={"\\":"\\\\",'"':'\\"',"\u0008":"\\b","\u000c":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"},t=function(b,c){return("000000"+(c||0)).slice(-b)},u=function(b){for(var c='"',a=0,d;d=b.charAt(a);a++)c=c+('\\"\u0008\u000c\n\r\t'.indexOf(d)>-1?r[d]:r[d]=d<" "?
"\\u00"+t(2,d.charCodeAt(0).toString(16)):d);return c+'"'},x=function(b,c,a,d,j,f,o){var g=c[b],h,s,v,w,L,M,N,y,A;if(typeof g=="object"&&g){h=l.call(g);if(h=="[object Date]"&&!m.call(g,"toJSON"))if(g>-1/0&&g<1/0){if(P){v=K(g/864E5);for(h=K(v/365.2425)+1970-1;P(h+1,0)<=v;h++);for(s=K((v-P(h,0))/30.42);P(h,s+1)<=v;s++);v=1+v-P(h,s);w=(g%864E5+864E5)%864E5;L=K(w/36E5)%24;M=K(w/6E4)%60;N=K(w/1E3)%60;w=w%1E3}else{h=g.getUTCFullYear();s=g.getUTCMonth();v=g.getUTCDate();L=g.getUTCHours();M=g.getUTCMinutes();
N=g.getUTCSeconds();w=g.getUTCMilliseconds()}g=(h<=0||h>=1E4?(h<0?"-":"+")+t(6,h<0?-h:h):t(4,h))+"-"+t(2,s+1)+"-"+t(2,v)+"T"+t(2,L)+":"+t(2,M)+":"+t(2,N)+"."+t(3,w)+"Z"}else g=k;else if(typeof g.toJSON=="function"&&(h!="[object Number]"&&h!="[object String]"&&h!="[object Array]"||m.call(g,"toJSON")))g=g.toJSON(b)}a&&(g=a.call(c,b,g));if(g===k)return"null";h=l.call(g);if(h=="[object Boolean]")return""+g;if(h=="[object Number]")return g>-1/0&&g<1/0?""+g:"null";if(h=="[object String]")return u(g);if(typeof g==
"object"){for(b=o.length;b--;)if(o[b]===g)throw TypeError();o.push(g);y=[];c=f;f=f+j;if(h=="[object Array]"){s=0;for(b=g.length;s<b;A||(A=i),s++){h=x(s,g,a,d,j,f,o);y.push(h===e?"null":h)}b=A?j?"[\n"+f+y.join(",\n"+f)+"\n"+c+"]":"["+y.join(",")+"]":"[]"}else{n(d||g,function(b){var c=x(b,g,a,d,j,f,o);c!==e&&y.push(u(b)+":"+(j?" ":"")+c);A||(A=i)});b=A?j?"{\n"+f+y.join(",\n"+f)+"\n"+c+"}":"{"+y.join(",")+"}":"{}"}o.pop();return b}},q.stringify=function(b,c,a){var d,j,f,o,g,h;if(typeof c=="function"||
typeof c=="object"&&c)if(l.call(c)=="[object Function]")j=c;else if(l.call(c)=="[object Array]"){f={};o=0;for(g=c.length;o<g;h=c[o++],(l.call(h)=="[object String]"||l.call(h)=="[object Number]")&&(f[h]=1));}if(a)if(l.call(a)=="[object Number]"){if((a=a-a%1)>0){d="";for(a>10&&(a=10);d.length<a;d=d+" ");}}else l.call(a)=="[object String]"&&(d=a.length<=10?a:a.slice(0,10));return x("",(h={},h[""]=b,h),j,f,d,"",[])});R("json-parse")||(z=String.fromCharCode,B={"\\":"\\",'"':'"',"/":"/",b:"\u0008",t:"\t",
n:"\n",f:"\u000c",r:"\r"},C=function(){H=I=k;throw SyntaxError();},D=function(){for(var b=I,c=b.length,a,d,j,f,o;H<c;){a=b.charAt(H);if("\t\r\n ".indexOf(a)>-1)H++;else{if("{}[]:,".indexOf(a)>-1){H++;return a}if(a=='"'){d="@";for(H++;H<c;){a=b.charAt(H);if(a<" ")C();else if(a=="\\"){a=b.charAt(++H);if('\\"/btnfr'.indexOf(a)>-1){d=d+B[a];H++}else if(a=="u"){j=++H;for(f=H+4;H<f;H++){a=b.charAt(H);a>="0"&&a<="9"||a>="a"&&a<="f"||a>="A"&&a<="F"||C()}d=d+z("0x"+b.slice(j,H))}else C()}else{if(a=='"')break;
d=d+a;H++}}if(b.charAt(H)=='"'){H++;return d}}else{j=H;if(a=="-"){o=i;a=b.charAt(++H)}if(a>="0"&&a<="9"){for(a=="0"&&(a=b.charAt(H+1),a>="0"&&a<="9")&&C();H<c&&(a=b.charAt(H),a>="0"&&a<="9");H++);if(b.charAt(H)=="."){for(f=++H;f<c&&(a=b.charAt(f),a>="0"&&a<="9");f++);f==H&&C();H=f}a=b.charAt(H);if(a=="e"||a=="E"){a=b.charAt(++H);(a=="+"||a=="-")&&H++;for(f=H;f<c&&(a=b.charAt(f),a>="0"&&a<="9");f++);f==H&&C();H=f}return+b.slice(j,H)}o&&C();if(b.slice(H,H+4)=="true"){H=H+4;return i}if(b.slice(H,H+5)==
"false"){H=H+5;return false}if(b.slice(H,H+4)=="null"){H=H+4;return k}}C()}}return"$"},E=function(b){var c,a;b=="$"&&C();if(typeof b=="string"){if(b.charAt(0)=="@")return b.slice(1);if(b=="["){for(c=[];;a||(a=i)){b=D();if(b=="]")break;if(a)if(b==","){b=D();b=="]"&&C()}else C();b==","&&C();c.push(E(b))}return c}if(b=="{"){for(c={};;a||(a=i)){b=D();if(b=="}")break;if(a)if(b==","){b=D();b=="}"&&C()}else C();(b==","||typeof b!="string"||b.charAt(0)!="@"||D()!=":")&&C();c[b.slice(1)]=E(D())}return c}C()}return b},
G=function(b,c,a){a=F(b,c,a);a===e?delete b[c]:b[c]=a},F=function(b,c,a){var d=b[c],j;if(typeof d=="object"&&d)if(l.call(d)=="[object Array]")for(j=d.length;j--;)G(d,j,a);else n(d,function(b){G(d,b,a)});return a.call(b,c,d)},q.parse=function(b,c){var a,d;H=0;I=b;a=E(D());D()!="$"&&C();H=I=k;return c&&l.call(c)=="[object Function]"?F((d={},d[""]=a,d),"",c):a})}p&&define(function(){return q});
}());


// END JSON3
}

/* jshint ignore:end */;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Simple timer system, provide a single timer for many bindings

************************************************************************ */

/**
 * Simple timer system, provide a single timer for many bindings.
 *
 * @constructor
*/
a.timer = (function() {
    'use strict';

    // Internal data
    var delay = 50,
        store = {};

    /**
     * Proceed timer tick
     *
     * @method tick
     * @private
    */
    function tick() {
        // We dispatch a new tick
        a.message.dispatch('a.timer.tick');

        // For every stored function, we scan and apply
        for(var i in store) {
            var obj = store[i];
            obj.current += delay;

            // If it's time to tick
            if(obj.current >= obj.timeout) {
                obj.current = 0;
                if(a.isFunction(obj.fct)) {
                    // Call function on tick OK
                    obj.fct.call(obj.scope || this);
                }
            }
        }
    }

    // Auto-start timer
    setInterval(tick, delay);

    return {
        /**
         * Register a function for regular timer tick.
         *
         * @async
         *
         * @param {Function} fct            The function to bind
         * @param {Object | Null} scope     The scope to use when calling
         *                                  function
         * @param {Integer} timeout         The timeout between two call
         * @return {Integer}                A generated id used to access
         *                                  this entry
        */
        add: function(fct, scope, timeout) {
            var id = a.uniqueId();

            if(!a.isNumber(timeout) || timeout <= 0) {
                timeout = 1000;
                a.console.storm('warn', 'a.timer.add', 'The timeout has not ' +
                                    'been setted properly ' +
                                    ', timeout has been rollback to ' +
                                    '```1000ms``` value', 1);
            }

            // Store the new entry
            store[id] = {
                fct:     fct,
                scope:   scope,
                timeout: timeout,
                current: 0
            };

            // Return the unique id to manipulate it
            return id;
        },

        /**
         * Register a function for a single timer tick.
         *
         * @async
         *
         * @param {Function} fct            The function to bind
         * @param {Object | Null} scope     The scope to use when calling
         *                                  function
         * @param {Integer} timeout         The timeout when calling function
         * @return {Integer}                A generated id used to
         *                                  manipulate ticker access
        */
        once: function(fct, scope, timeout) {
            var id = this.add(
                function() {
                    if(a.isFunction(fct)) {
                        fct.call(this);
                    }
                    a.timer.remove(id);
                },
            scope, timeout);
            return id;
        },

        /**
         * Get a function registred into the timer.
         *
         * @return {Object | Null}          The object linked to id, or null
         *                                  if nothing is related to id
        */
        get: function(id) {
            var item = store[id];
            return a.isNone(item) ? null : item;
        },

        /**
         * Remove a function currently stored into the timer.
         *
         * @param id {Integer}              The id to delete
         * @return {Boolean}                The item has been delete or not
        */
        remove: function(id) {
            return delete store[id];
        },

        /**
         * Clear the current all timers.
        */
        clear: function() {
            store = {};
        }

        /*!
         * @private
        */
    };
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a really basic dom manipulation plugin.
        This helps to use appstorm by itself without any jQuery or others.
        It really not the best, but it does work well, and already pretty 
        usefull!

************************************************************************ */


/*!
 * From: http://www.codecouch.com/2012/05/adding-document-queryselectorall-support-to-ie-7/
 * Adding 'uber basic' support of querySelectorAll for IE browsers
 * Only if user does not make usage of any library like jQuery
*/
/* jshint ignore:start */
if(document.all && ! ('querySelectorAll' in document) && !window.jQuery) {
    // IE7 support for querySelectorAll in 274 bytes. Supports multiple / grouped selectors and the attribute selector with a "for" attribute. http://www.codecouch.com/
    (function(d,s){d=document,s=d.createStyleSheet();d.querySelectorAll=function(r,c,i,j,a){a=d.all,c=[],r=r.replace(/\[for\b/gi,'[htmlFor').split(',');for(i=r.length;i--;){s.addRule(r[i],'k:v');for(j=a.length;j--;)a[j].currentStyle.k&&c.push(a[j]);s.removeRule(0)}return c}})()
}
/* jshint ignore:end */


/**
 * Provide a really basic dom manipulation plugin.
 * This helps to use appstorm by itself without any other framework.
 * It does work well, and already pretty usefull! But there is better dom
 * manipulation out there...
 *
 * @constructor
*/
a.dom = {
    /**
     * USE ONLY IF YOU HAVE JQUERY, OR DON'T CARE OLD BROWSER (IE 8 and +)
     * Use direct jquery or querySelectorAll to select items.
     *
     * @param {String} check                The string to search for
     * @param {DOMElement} dom              The dom to search inside
     * @return {a.dom.children}             A chainable object
    */
    query: function(check, dom) {
        dom = a.dom.el(dom).get(0) || document;

        // If jQuery is defined, rely on it instead of querySelectorAll...
        if(window.jQuery) {
            return this.el(jQuery(check));
        }

        // Nothing found, we go for QuerySelectorAll
        try {
            return this.el(dom.querySelectorAll(check));
        } catch (e) {
            // Return empty set if a problem is found...
            return this.el([]);
        }
    },

    /**
     * Embed a javascript dom element into **a.dom** system.
     *
     * @param {DOMElement} element          A dom element to work with
     * @return {a.dom.children}             A chainable object
    */
    el: function(element) {
        // Detect already parsed
        if(element instanceof a.dom.children) {
            return element;
        }

        if(a.isString(element)) {
            element = a.trim(element);

            // If there is only alphanumeric, we go for id
            var reg = /^[a-zA-Z0-9 _-]+$/i;
            if(reg.test(element)) {
                return this.id(element);
            } else {
                return this.query(element);
            }
        }

        // Detect jQuery elements
        if(window.jQuery && element instanceof jQuery) {
            var domList = [],
                i       = element.size();

            while(i--) {
                domList.push(element.get(i));
            }
            // Erase and continue with
            element = domList;
        }

        // Detecting NodeList (special case)
        if(element instanceof window.NodeList) {
            element = a.toArray(element);
        }

        // Detect array elements
        if(a.isArray(element)) {
            return this.children(element);
        }

        // Detect single DOM element
        return this.children([element]);
    },

    /**
     * Find element by id, or a list of ids (separator: ',', or an array).
     *
     * @param {String | Array} id           The id(s) to search
     * @return {a.dom.children}             A chainable object
    */
    id: function(id) {
        return this.attr('id', id, document);
    },

    /**
     * Find elements by classname, or a list of classname
     * (separator: ',', or an array).
     *
     * @param {String | Array} clsname      The classname(s) to search
     *                                      (like 'active', 'container', ...)
     * @param {DOMElement | null} dom       The init dom to start searching
     *                                      from or null to use document
     * @return {a.dom.children}             A chainable object
    */
    cls: function(clsname, dom) {
        return this.attr('class', clsname, dom);
    },

    /**
     * Find elemnts by their tagname, or a list of tagname
     * (separator: ',', or an array).
     *
     * @param {String | Array} name         The tag(s) to search (input, a,...)
     * @param {DOMElement | Null} dom       The init dom to start searching
     *                                      from, or null to use document
     * @return {a.dom.children}             A chainable object
    */
    tag: function(name, dom) {
        // Remove string from name
        dom = (a.isTrueObject(dom)) ? dom : document;

        var tagList = a.isString(name) ? name.replace(/ /g,'').split(',') :
                name,
            domList = [],
            i       = tagList.length;

        if(i > 1) {
            while(i--) {
                var chainElement = this.tag(tagList[i], dom),
                    elements  = chainElement.getElements();

                a.each(elements, function (element) {
                    if (!a.contains(domList, element)) {
                        domList.push(element);
                    }
                });
            }

            return a.dom.children(domList);
        }

        if(dom.querySelectorAll) {
            domList = dom.querySelectorAll(name);
        } else {
            domList = dom.getElementsByTagName(name);
        }

        return a.dom.children(domList);
    },

    /**
     * Find elements by attribute name.
     *
     * @param {String | Array} name         The attribute name to search
     * @param {String | Null} value         The attribute value (can be empty)
     * @param {DOMElement} dom              The dom to start search from
     * @return {a.dom.children}             A chainable object
    */
    attr: function(name, value, dom) {
        /*!
         * -----------------------------------
         *   Detect parameter chain
         * -----------------------------------
        */

        // In case of null dom, it's 2 parameters or single parameter mode
        if(a.isNone(dom)) {
            // We are in single parameter mode
            if(a.isNone(value)) {
                value = document;
            }
            // We are in 2 parameters mode, with value = dom
            if(a.isTrueObject(value) && !a.isArray(value)) {
                return this.attr(name, null, value);

            // We are in 2 parameters mode, without value = dom
            } else {
                dom = document;
            }
        }

        /**
         * From a string or an array, get a string version.
         *
         * @private
         *
         * @param {String | Array} str      Separate elements
         * @return {Array}                  The split version
        */
        function stringToArray(str) {
            return a.isString(str) ? str.replace(/ /g,'').split(',') : str;
        }

        /**
         * Append elements to parentList only if there are not already
         * inside collection.
         *
         * @private
         *
         * @param {Array} parentList        The arrays to append elements to
         * @param {Array} children          The list of elements to append
        */
        function appendList(parentList, children) {
            a.each(children, function(child) {
                if(!a.contains(parentList, child)) {
                    parentList.push(child);
                }
            });
        }

        /*!
         * -----------------------------------
         *   Recursive attribute search
         * -----------------------------------
        */

        // If attribute = array, or a string with ',', we do recursive search
        if(name && (a.isArray(name) || name.indexOf(',') >= 0)) {
            var attributeList = stringToArray(name),
                i             = attributeList.length;

            // In case of multi attribute, we apply recursive search
            if(i > 1) {
                var doms = [];

                while(i--) {
                    var chains      = this.attr(attributeList[i], value, dom),
                        elements    = chains.getElements();
                    appendList(doms, elements);
                }

                // Returning element parsed
                return a.dom.children(doms);
            }
        }

        /*!
         * -----------------------------------
         *   Recursive value search
         * -----------------------------------
        */

        // If value = array, or a string with ',', we do recursive search
        if(value && (a.isArray(value) || value.indexOf(',') > 0)) {
            var valueList = stringToArray(value),
                j         = valueList.length;

            // In case of multi value, we apply recursive search
            if(j > 1) {
                var oDom = [];

                while(j--) {
                    var oChains   = this.attr(name, valueList[j], dom),
                        oElements = oChains.getElements();
                    appendList(oDom, oElements);
                }

                // Returning element parsed
                return a.dom.children(oDom);
            }
        }

        /*!
         * -----------------------------------
         *   Select elements regarding search
         * -----------------------------------
        */

        var isStringValue = a.isString(value),
            domList       = [];

        // We remove ' ' from value and attribute
        name  = name.replace(/ /g,'');
        if(isStringValue) {
            value = value.replace(/ /g,''); 
        }

        // Simple version, for latest browser
        if(name == 'class') {
            domList = dom.getElementsByClassName(value);

        } else if(name == 'id') {
            domList = [dom.getElementById(value)];
            // In case of 'not found', we remove
            if(a.isNull(domList[0])) {
                domList.pop();
            }

        } else if(dom.querySelectorAll) {
            // We get [class="ok"] or [class] depending on value setted or not

            var search = isStringValue ? '[' + name + '="' + value + '"]' :
                '[' + name + ']';

            domList = dom.querySelectorAll(search);

        // Complex version, for older browser
        } else {
            var allList = dom.getElementsByTagName('*'),
                k       = allList.length;

            while(k--) {
                // Select element (faster)
                var el    = allList[k],
                    // Check the attribute exist or not
                    found = el.getAttribute(name);

                // We found the attribute
                if(found) {
                    // 1) Attribute has been found, and is equal to value
                    // 2) No value setted, we just need attribute exist
                    if(
                        (isStringValue && found == value) ||
                        (!isStringValue)
                    ) {
                        // Don't keep duplicate
                        if(!a.contains(domList, el)) {
                            domList.push(el);
                        }
                    }
                }
            }
        }

        return a.dom.children(domList);
    }

    /*!
     * @private
    */
};




















/*
------------------------------
  EVENT
------------------------------
*/
/**
 * Unified event system for DOM element (to have always the same behavior
 * between all browser).
*/
a.dom.event = function(e) {
    if(!(this instanceof a.dom.event)) {
        return new a.dom.event(e);
    }

    e = e || window.event;
    this.target        = e.target || e.srcElement;
    this.currentTarget = e.currentTarget || null;
    this.type          = e.type;

    // Multiple binding to never loose original event
    this._e            = e;
    this.event         = e;
    this.originalEvent = e;
};

/*!
 * Event prototype
*/
a.dom.event.prototype = {
    /**
     * Stop event propagation.
    */
    stopPropagation: function() {
        var e = this.originalEvent;
        if(e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },

    /**
     * Prevent default behavior.
    */
    preventDefault: function() {
        var e = this.originalEvent;
        if(e.preventDefault) {
          e.preventDefault();
        }
        e.returnValue = false;
    }
};

/*
------------------------------
  EVENT BINDER
------------------------------
*/
/**
 * Generic function to use for converting event to appstorm event type.
 *
 * @param {Function} fn                     The function to encaps
 * @param {Object | Null} scope             The scope to apply if possible
 * @return {Function}                       The binded function
*/
a.dom.eventBinder = function(fn, scope) {
    if (!(this instanceof a.dom.eventBinder)) {
        return new a.dom.eventBinder(fn, scope);
    }

    return function(e) {
        if(a.isFunction(fn)) {
            if(a.isObject(scope)) {
                fn.call(scope, a.dom.event(e));
            } else {
                fn.call(null, a.dom.event(e));
            }
        }
    };
};


/*
------------------------------
  EVENT LISTENER
------------------------------
*/
/**
 * Abstract layer for binding event with DOM.
*/
a.dom.eventListener = (function() {
    var store = [],
        bind = null,
        unbind = null;

    /**
     * Add binder between true event and function catch.
     *
     * @private
     *
     * @param {DOMElement} el               The element binded
     * @param {String} type                 The event type
     * @param {Function} fn                 The function called when event
     *                                      occurs
     * @param {Object} scope                The associated scope
     * @return {Object}                     The binder
    */
    function addListener(el, type, fn, scope) {
        var binder = a.dom.eventBinder(fn, scope || null);
        store.push({
            el:   el,
            type: type,
            fn:   fn,
            bn:   binder
        });
        return binder;
    }

    /**
     * Destroy stored event reference.
     *
     * @private
     *
     * @param {DOMElement} el               The element to unbind event from
     * @param {String} type                 The event type to unbind
     * @param {Function} fn                 The event associated function
     * @return {Object}                     The binder
    */
    function removeListener(el, type, fn) {
        var s = store,
            i = s.length,
            binder = null;
        while(i--) {
            var evt = s[i];
            if(evt.fn === fn && evt.el === el && evt.type === type) {
                binder = evt.bn;
                s.splice(i, 1);
                break;
            }
        }
        return binder;
    }

    /*!
     * -------------------
     *   NEW BROWER
     * -------------------
    */
    /**
     * @private
    */
    function addEventListener(el, type, fn, scope) {
        el.addEventListener(type,    addListener(el, type, fn, scope), false);
    }
    /**
     * @private
    */
    function removeEventListener(el, type, fn) {
        el.removeEventListener(type, removeListener(el, type, fn), false);
    }

    /*!
     * -------------------
     *   INTERNET EXPLORER
     * -------------------
    */
    /**
     * @private
    */
    function attachEvent(el, type, fn, scope) {
        el.attachEvent('on' + type, addListener(el, type, fn, scope));
    }
    /**
     * @private
    */
    function detachEvent(el, type, fn) {
        el.detachEvent('on' + type, removeListener(el, type, fn));
    }

    /*!
     * -------------------
     *   OLD BROWSER
     * -------------------
    */
    /**
     * @private
    */
    function rawBindEvent(el, type, fn, scope) {
        el['on' + type] = addListener(el, type, fn, scope);
    }
    /**
     * @private
    */
    function rawUnbindEvent(el, type, fn) {
        removeListener(el, type, fn);
        el['on' + type] = null;
    }

    if(a.isFunction(window.addEventListener)) {
        bind   = addEventListener;
        unbind = removeEventListener;
    } else if(a.isFunction(document.attachEvent)) {
        bind   = attachEvent;
        unbind = detachEvent;
    } else {
        bind   = rawBindEvent;
        unbind = rawUnbindEvent;
    }

    return {
        /**
         * Bind event to DOM.
         *
         * @param {DOMElement} el           The element to bind
         * @param {String} type             The event name to bind
         * @param {Function} fn             The associated function
         * @param {Object} scope            The function scope to apply
        */
        bind: bind,

        /**
         * Unbind event previously attached to DOM.
         *
         * @param {DOMElement} el           The element to unbind
         * @param {String} type             The event name to unbind
         * @param {Function} fn             The function to unbind
        */
        unbind: unbind

        /*!
         * @private
        */
    };
})();






























/*
------------------------------
  CHILDREN
------------------------------
*/
/**
 * Handle recursive sub-search.
 *
 * @constructor
 *
 * @param {Array} elementList               The list of elements to use
*/
a.dom.children = function(elementList) {
    if (!(this instanceof a.dom.children)) {
        return new a.dom.children(elementList);
    }

    elementList = a.isUndefined(elementList.length) ?
                        [elementList] : elementList;

    this.elementList = elementList;
    // Copy the property length at any time
    this.length      = elementList.length;
};


a.dom.children.prototype = {
    /**
     * Perform a recursive task to select sub children using a.dom.
     *
     * The first parameter must be the a.dom to use
     * Other parameters are parameter to pass to this function
     * The last parameter should be the dom to use for search.
     *
     * @private
    */
    _perform: function() {
        var list          = [],
            elementList   = this.elementList,
            argsArray     = a.toArray(arguments),
            fct           = argsArray[0],
            args          = argsArray.slice(1),
            argsLength    = args.length,
            i             = elementList.length;

        // We add one item at the end, as it will be erased by local dom
        args.push(null);

        // We search on every currently stored elements, children
        while(i--) {
            // We add a null value at the end,
            // so argsLength is already length - 1
            // as we don't update it when pushing to args
            args[argsLength] = elementList[i];
            // We call the apply function with this as 'a.dom'
            var chainList = fct.apply(a.dom, args),
                children  = chainList.getElements(),
                j         = children.length;

            while(j--) {
                if(!a.contains(list, children[j])) {
                    list.push(children[j]);
                }
            }
        }

        // We update list and length
        this.elementList = list;
        this.length      = list.length;

        return this;
    },

    /**
     * Get a single DOM element.
     *
     * @param {Integer} index               The index to retrieve
     * @return {DOMElement | Null}          The dom element linked or null
     *                                      if not found
    */
    get: function(index) {
        return this.elementList[index] || null;
    },

    /**
     * Get the DOM elements stored.
     *
     * @return {Array}                      The element list stored
    */
    getElements: function() {
        return this.elementList;
    },

    /**
     * Select sub-id elements.
     *
     * @chainable
     *
     * @param {String} id                   The id or list of ids to search
    */
    id: function(id) {
        return this._perform(a.dom.id, id);
    },

    /**
     * Select sub-class elements.
     *
     * @chainable
     *
     * @param {String} clsname              The class or list of classes to
     *                                      search
    */
    cls: function(clsname) {
        return this._perform(a.dom.cls, clsname);
    },

    /**
     * Get or set style for given elements
     *
     * @param {String} rule                 The CSS rule we are working with
     * @param {String} value                The value to set (can be empty for
     *                                      get)
     * @return {String | Null}              The CSS value found in case of get
    */
    css: function(rule, value) {
        rule = rule || '';

        // Transform rule for a js like ruler
        if(rule.indexOf('-') >= 0) {
            var splitRule = rule.split('-');

            for(var i=1, l=splitRule.length; i<l; ++i) {
                var s = splitRule[i];
                splitRule[i] = a.firstLetterUppercase(s);
            }

            rule = splitRule.join('');
        }

        // Getter
        if(a.isUndefined(value)) {
            var cssList     = [],
                elementList = this.elementList,
                j           = elementList.length;

            while(j--) {
                var data = elementList[j].style[rule];
                if(!a.isNone(data)) {
                    cssList.push(data);
                }
            }

            if(cssList.length <= 1) {
                return cssList[0] || '';
            } else {
                return cssList;
            }
        // Setter
        } else {
            this.each(function() {
                this.style[rule] = value;
            });
        }
    },

    /**
     * Add a class to elements.
     *
     * @chainable
     *
     * @param {String} classname            The classname to append to every
     *                                      elements
    */
    addClass: function(classname) {
        var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
        this.each(function() {
            if(this.classList) {
                this.classList.add(classname);
            // We test the element don't have classname first
            } else if(!this.className.match(reg)) {
                this.className += ' ' + classname;
            }
        });
        return this;
    },

    /**
     * Test if all elements got classname or not.
     *
     * @chainable
     *
     * @param {String} classname            The classname to test on every
     *                                      elements
    */
    hasClass: function(classname) {
        var reg      = new RegExp('(\\s|^)' + classname + '(\\s|$)'),
            elements = this.elementList,
            i        = elements.length;

        while(i--) {
            if(!elements[i].className.match(reg)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Remove a class element.
     *
     * @chainable
     *
     * @param {String} classname            The classname to remove on every
     *                                      elements
    */
    removeClass: function(classname) {
        this.each(function(scope) {
            if(this.classList) {
                this.classList.remove(classname);
            // We test element has classname before remove
            } else {
                var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
                if(this.className.match(reg)) {
                    this.className.replace(reg, '');
                }
            }
        }, this);
        return this;
    },

    /**
     * toggle a class element.
     *
     * @chainable
     *
     * @param {String} classname            The classname to toggle on every
     *                                      elements
    */
    toggleClass: function(classname) {
        this.each(function(scope) {
            if(this.classList) {
                this.classList.toggle(classname);
            } else {
                var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
                // If we have class or not, we switch
                if(this.className.match(reg)) {
                    this.className.replace(reg, '');
                } else {
                    this.className += ' ' + classname;
                }
            }
        }, this);
        return this;
    },

    /**
     * Bind element event to given function (like click, submit...).
     *
     * @chainable
     *
     * @param {String | Array} binding      The event/list to apply to
     * @param {Function} fct                The handler to receive event
     * @param {Object | Null} scope         The scope to apply
    */
    bind: function(binding, fct, scope) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] === '') {
                continue;
            }
            this.each(function(evt) {
                a.dom.eventListener.bind(this, evt, fct, scope);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Unbind element event to given function (like click, submit...).
     *
     * @chainable
     *
     * @param {String | Array} binding      The event/list to remove
     * @param {Function} fct                The handler of event
    */
    unbind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] === '') {
                continue;
            }

            this.each(function(evt) {
                a.dom.eventListener.unbind(this, evt, fct);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Select sub-tag elements.
     *
     * @chainable
     *
     * @param {String} name                 The tag or list of tags to search
    */
    tag: function(name) {
        return this._perform(a.dom.tag, name);
    },

    /**
     * Select sub-attributes elements.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute or list of
     *                                      attributes to search
     * @param {String | Null} value         The value to use, can be empty
    */
    attr: function(attribute, value) {
        return this._perform(a.dom.attr, attribute, value);
    },

    /**
     * Append or get attribute.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String | Null} value         The value to set
    */
    attribute: function(attribute, value) {
        var attributes = 
            a.isString(attribute) ?   attribute.replace(/ /g,'').split(',')
                                  :   attribute;

        // Getter
        if(a.isUndefined(value)) {
            var values    = [],
                elements  = this.elementList,
                i         = elements.length;

            while(i--) {
                var element = elements[i];
                a.each(attributes, function(attr) {
                    try {
                        var data = element.getAttribute(attr);
                        if(!a.isNone(data) && !a.contains(values, data)) {
                            values.push(data);
                        }
                    } catch(ex) {}
                });
            }

            if(values.length < 2) {
                return values.join('');
            } else {
                return values;
            }

        // Setter
        } else {
            this.each(function() {
                a.each(attributes, function(attr) {
                    try {
                        this.setAttribute(attr, value); 
                    } catch(ex) {}
                }, this);
            });
            return this;
        }
    },

    /**
     * Get or set the input/textarea value.
     *
     * @chainable
     *
     * @param {String | Null} value         The value to set
    */
    val: function(value) {
        return this.attribute('value', value);
    },

    /**
     * Same as attribute, but for data- HTML5 tag.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String | Null} value         The value to get
    */
    data: function(attribute, value) {
        return this.attribute('data-' + attribute, value);
    },

    /**
     * Same as data or attribute, but multi tag check.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    appstorm: function(attribute, value) {
        var sequence   = [],
            tmp        = '',
            attributes = 
            a.isString(attribute) ?   attribute.replace(/ /g,'').split(',')
                                  :   attribute;

        for (var i = 0, l = attributes.length; i < l; ++i) {
            tmp = attributes[i];
            sequence.push('data-' + tmp);
            sequence.push('a-' + tmp);
            sequence.push(tmp);
        }

        // Removing duplicates
        sequence = a.uniq(sequence);
        return this.attribute(sequence.join(','), value);
    },

    /**
     * Move to the parent element for every element stored.
     *
     * @chainable
    */
    parent: function() {
        var elements = this.elementList,
            result   = [];

        a.each(elements, function(element) {
            var node = element.parentNode;
            if(!a.contains(result, node)) {
                result.push(node);
            }
        });

        this.elementList = result;
        this.length = result.length;

        return this;
    },

    /**
     * Select direct children of all stored elements.
     *
     * @chainable
     *
     * @param {Array | Null} types          The nodeTypes to keep (default: 3)
    */
    children: function(types) {
        var elementList = this.elementList,
            replaceList = [],
            i           = elementList.length;

        types = types || [1];

        while(i--) {
            replaceList.push(a.toArray(elementList[i].childNodes));
        }

        // Erasing previous list with new one
        var flatArray = a.remove(
            a.uniq(a.flatten(replaceList)),
            function(element) {
                if(!a.contains(types, element.nodeType)) {
                    return false;
                }
                return true;
            }
        );

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Select all sub elements.
     *
     * @chainable
    */
    all: function() {
        var elementList = this.elementList,
            replaceList = [],
            i           = elementList.length;

        while(i--) {
            replaceList.push(a.toArray(
                elementList[i].getElementsByTagName('*')
            ));
        }

        // Erasing previous list with new one, remove wrong nodeType
        var flatArray = a.remove(
                a.uniq(a.flatten(replaceList)),
                function(element) {

            if(element.nodeType == 3) {
                return false;
            }
            return true;
        });

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Insert before selected element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to insert
    */
    insertBefore: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.parentNode.insertBefore(element, this);
            }, this);
        });
        return this;
    },

    /**
     * Insert after selected element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to insert
    */
    insertAfter: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.parentNode.insertBefore(element, this.nextSibling);
            }, this);
        });
        return this;
    },

    /**
     * Empty all elements stored.
     *
     * @chainable
    */
    empty: function() {
        this.each(function() {
            while(this.firstChild) {
                this.removeChild(this.firstChild);
            }
        });
        return this;
    },

    /**
     * Remove element from content.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to remove
    */
    remove: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                try {
                    this.removeChild(element);
                } catch(ex) {}
            }, this);
        });
        return this;
    },

    /**
     * Append element to the existing content.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to append
    */
    append: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.appendChild(element);
            }, this);
        });
        return this;
    },

    /**
     * Replace the existing content with given element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to append
    */
    replace: function(element) {
        this.empty();
        return this.append(element);
    },

    /**
     * Set inside the current elements the content, or get the current html.
     *
     * @param {String | Null} content       The content to set, or nothing to
     *                                      get
     * @return {String | Null}              The current content, or null
    */
    html: function(content) {
        if(!a.isUndefined(content)) {
            this.each(function() {
                this.innerHTML = content;
            });
            return this;
        } else {
            var results = [];
            this.each(function() {
                results.push(this.innerHTML);
            });
            if(results.length === 0) {
                return '';
            } else if(results.length === 1) {
                return results[0];
            }
            return results;
        }
    },

    /**
     * Get the text content of every elements included. If the parameter is
     * set to false, children are not included, if the parameter is set on
     * true, children are included.
     *
     * @param {Boolean} includeChildren     True, the children are included
     *                                      False, they are not
     * @return {String  | Array}            If the array contains one element
     *                                      the direct string is returned, in
     *                                      other cases, the array is returned
    */
    text: function(includeChildren) {
        // If not defined, we set on true by default
        if (includeChildren !== false) {
            includeChildren = true;
        }

        var results = [];

        this.each(function() {
            if (includeChildren) {
                results.push(this.textContent);
            } else {
                var content = '';
                for(var i = 0, l = this.childNodes.length; i < l; ++i) {
                    var node = this.childNodes[i];
                    if(node.nodeType === 3) {
                        content += node.nodeValue;
                    }
                }
                results.push(content);
            }
        });

        if(results.length === 0) {
            return '';
        } else if(results.length === 1) {
            return results[0];
        }
        return results;
    },

    /**
     * Apply on each elements the given function.
     *
     * @chainable
     *
     * @param {Function} fct                The function to apply to elements
     * Other parameters are passed to every function call as arguments
    */
    each: function() {
        var list          = this.elementList,
            argumentArray = a.toArray(arguments),
            fct           = argumentArray[0],
            args          = argumentArray.slice(1);

        fct = a.isFunction(fct) ? fct : null;

        if (!a.isNone(fct)) {
            a.each(list, function(element) {
                // Calling element with this as element currently selected
                fct.apply(element, args);
            });
        }

        return this;
    }
    /*!
     * @private
    */
};;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manipulate page hash, be able to retrieve also the list of hash
        previously used.

************************************************************************ */


/**
 * Manipulate page hash, be able to retrieve also the list of hash previously
 * used.
 *
 * @constructor
*/
a.hash = function() {
    var previousHash  = null,
        traceHashList = [],
        that          = this,
        store         = a.mem.getInstance('app.hash');

    // The traceHashList is linked to store
    store.set('history', traceHashList);

    /**
     * Retrieve the current system hash.
     *
     * @private
     *
     * @return {String | Null}              The hash, or null if nothing is set
     */
    function getCurrentPageHash() {
        var h = window.location.hash;
        return h ? h.substring(1) : null;
    }


    /**
     * Store the latest event appearing into a store.
     *
     * @private
     *
      @param {String} hash                  The new hash incoming
    */
    function registerNewHash(hash) {
        store.set('current', hash);

        // Store both hash and time used
        traceHashList.push({
            hash: hash,
            time: (new Date()).getTime()
        });

        // Remove exceed hash stored
        while(traceHashList.length > 500) {
            traceHashList.shift();
        }
    }

    /**
     * Check for existing hash, call the callback if there is any change.
     *
     * @private
     */
    function checkAndComputeHashChange(evt) {
        //Extracting hash, or null if there is nothing to extract
        var currentHash = null;

        // Current hash is superseeded by the event one...
        if(evt && evt.originalEvent && evt.originalEvent.newURL) {
            var newUrl = evt.originalEvent.newURL;
            currentHash = newUrl.substring(newUrl.indexOf('#') + 1);
        } else {
            currentHash = getCurrentPageHash();
        }

        if(previousHash != currentHash) {
            registerNewHash(currentHash);
            // Dispatch event
            var eventObject = {
                value: currentHash,
                old:   previousHash
            };
            that.dispatch('change', eventObject);
            a.message.dispatch('a.hash.change', eventObject);
            previousHash = currentHash;
            store.set('previous', previousHash);
        }
    }

    // Initiate the system (when appstorm is ready !)
    a.on('ready', function() {
        checkAndComputeHashChange();
    });

    // The onhashchange exist in IE8 in compatibility mode,
    // but does not work because it is disabled like IE7
    if( ('onhashchange' in window) &&
        (document.documentMode === undefined || document.documentMode > 7)) {
        //Many browser support the onhashchange event, but not all of them
        a.dom.eventListener.bind(window, 'hashchange',
                            checkAndComputeHashChange, null);
    } else {
        //Starting manual function check, if there is no event to attach
        a.timer.add(checkAndComputeHashChange, null, 50);
    }


    /**
     * Fake the hashtag change (can be usefull sometimes), it really apply
     * hash change, but does not change the browser hashtag.
     *
     * @param {String} currentHash          The hash to fake
    */
    this.fake = function(currentHash) {
        if(previousHash != currentHash) {
            registerNewHash(currentHash);
            // Dispatch event
            var eventObject = {
                value: currentHash,
                old:   previousHash
            };
            that.dispatch('change', eventObject);
            a.message.dispatch('a.hash.change', eventObject);
        }
        previousHash = currentHash;
        store.set('previous', previousHash);
    };

    /**
     * Retrieve the current system hash.
     *
     * @return {String | Null}              The hash, or null if nothing is set
     */
    this.getHash = function() {
        return getCurrentPageHash();
    };

    /**
     * Retrieve the current system hash (getHash alias).
     *
     * @return {String | Null}              The hash, or null if nothing is set
    */
    this.get = function() {
        return getCurrentPageHash();
    };

    /**
     * Get the previous page hash (can be null).
     *
     * @return {String | Null}              The hash, or null if nothing is set
    */
    this.getPreviousHash = function() {
        return previousHash;
    };

    /**
     * Force the system to set a specific hash.
     *
     * @param {String} value                The hash to set
     */
    this.setPreviousHash = function(value) {
        previousHash = value;
        store.set('previous', previousHash);
    };

    /**
     * Get list of existing previous hash used into system.
     *
     * @return {Array}                      An array with all hash
     *                                      done since beginning
    */
    this.trace = function() {
        return traceHashList;
    };

    /*!
     * @private
    */
};

// Erasing previous a.hash and add event system to it
a.hash = a.extend(new a.hash(), a.eventEmitter('a.hash'));;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Send a request to server side

************************************************************************ */



(function(a) {
    /**
     * Ajax cache object, used to store cached request and retrieve it if possible.
     *
     * @private
    */
    var ajaxCache = {
        /**
         * Add a new cached ajax element.
         *
         * @private
         *
         * @param {String} method               GET/POST/PUT/DELETE/...
         * @param {String} url                  The url to catch
         * @param {Object} results              The related result
         * @param {Integer} timeout             The timeout (in ms)
        */
        add: function(method, url, results, timeout) {
            if(timeout <= 0) {
                timeout = 1000;
            }

            var id = a.uniqueId(),
                obj = {
                id: id,
                method: method.toUpperCase(),
                url: url,
                results: results
            };

            a.mem.set('app.ajax.cache.' + obj.id, obj);

            // Creating the auto-delete timeout
            setTimeout(a.scope(function() {
                a.mem.remove('app.ajax.cache.' + this.id);
            }, obj), timeout);
        },

        /**
         * Get a previously cached element.
         *
         * @private
         *
         * @param {String} method               GET/POST/PUT/DELETE/...
         * @param {String} url                  The url to catch
         * @return {Object | Null}              Return the previously stored
         *                                      element or null if nothing is
         *                                      found
        */
        get: function(method, url) {
            if(!method || !url) {
                return null;
            }
            method = method.toUpperCase();

            var mem = a.mem.getInstance('app.ajax.cache'),
                list = mem.list();

            for(var key in list) {
                var element = list[key];

                if(element.method === method && element.url === url) {
                    return element.results;
                }
            }
            return null;
        }
        /*!
         * @private
        */
    };

    // Ajax status store function to detect which status is consider
    // as valid, and which is not
    a.ajaxStatus = [];
    a.mem.set('app.ajax.status', a.ajaxStatus);

    // Default one
    a.ajaxStatus.push(function (method, url, status) {
        if (status >= 200 && status <= 400) {
            return 'success';
        } else {
            return 'error';
        }
    });


    /**
     * Help to get a new model, or update an existing one, regarding
     * primary keys inside a model.
     *
     * @private
     *
     * @param {String} name                 The model name to search instance
     * @param {Array} primaries             List of primary key inside the
     *                                      model
     * @param {Object} content              The content of current model
     *                                      data (containing the primary
     *                                      key's data to match)
     * @return {a.modelInstance}            The new model created
    */
    function getOrCreateModel(name, primaries, content) {
        if(a.isNone(primaries) || (a.isArray(primaries) && 
            primaries.length === 0)) {
            return a.model.pooler.createInstance(name);
        } else {
            var search = {};
            // Adding primaries to search
            for(var i=0, l=primaries.length; i<l; ++i) {
                var tmp = content[primaries[i]];
                if(tmp) {
                    search[primaries[i]] = tmp;
                }
            }

            // Adding last model search
            search.modelName = name;

            var found = a.model.pooler.searchInstance(search);

            if(found.length > 0) {
                return found[0];
            } else {
                return a.model.pooler.createInstance(name);
            }
        }
    }

    /**
     * Ajax object to call server.
     *
     * @constructor
     *
     * @param {Object} options                  An option map to change
     *                                          the behaviour of component
     * @param {Function} success                The success function called
     *                                          in case of async
     * @param {Function} error                  The error function called in
     *                                          case of async
    */
    a.ajax = function(options, success, error) {
        'use strict';

        // New problem corrected
        if (!(this instanceof a.ajax)) {
            return new a.ajax(options, success, error);
        }

        var templates = [a.getDefaultAjaxOptions()];

        // Transforming single element into array
        if(a.isString(options.template) && options.template) {
            options.template = [options.template];
        }

        // Parsing array of templates
        if(a.isArray(options.template)) {
            for(var t=0, n=options.template.length; t<n; ++t) {
                var tmpAjaxOpt = a.getTemplateAjaxOptions(options.template[t]);
                if(a.isTrueObject(tmpAjaxOpt)) {
                    templates.push(tmpAjaxOpt);
                }
            }
        }

        this.params = {
            before : [],      // Allowed type : any string function name
            url    : '',      // Allowed type : any URL
            method : 'GET',   // Allowed type : "GET", "POST"
            type   : 'raw',   // Allowed type : raw, json, xml
            async  : true,    // Allowed type : true, false
            cache  : false,   // Allowed type : true, false
            store  : '',      // Allowed type : string like 4s
            data   : {},      // Allowed type : any kind of object | key => value
            header : {},      // Allowed type : any kind of object | key => value
            many   : false,   // Allowed type : true, false
            model  : '',      // Allowed type : any model name
            after  : []       // Allowed type : any string function name
        };

        // We override the cache by the "default" value
        if(a.environment.get('ajax.cache') === true) {
            this.params.cache = true;
        }

        // Binding options
        for(var p in this.params) {
            if(p === 'data' || p === 'header') {
                continue;
            }

            // We check given options are same type (from specific request)
            for(var o=0, l=templates.length; o<l; ++o) {
                var tmpl = templates[o];
                if(p in tmpl && typeof(tmpl[p]) === typeof(this.params[p])) {
                    // Special case for array
                    if(a.isArray(tmpl[p])) {
                        this.params[p] = a.union(this.params[p], tmpl[p]);
                    } else {
                        this.params[p] = tmpl[p];
                    }
                }
            }

            // We check given options are same type (from specific request)
            if(p in options && typeof(options[p]) === typeof(this.params[p])) {
                this.params[p] = options[p];
            }
        }

        // Now we take care of special case of data and header
        for(var i=0, y=templates.length; i<y; ++i) {
            var tmpla = templates[i];

            if(a.isTrueObject(tmpla.data)) {
                for(var d in tmpla.data) {
                    this.params.data[d] = tmpla.data[d];
                }
            }

            if(a.isTrueObject(tmpla.header)) {
                for(var h in tmpla.header) {
                    this.params.header[h] = tmpla.header[h];
                }
            }
        }

        if(a.isString(options.data)) {
            this.params.data = options.data;
        } else if(a.isTrueObject(options.data)) {
            for(var dd in options.data) {
                this.params.data[dd] = options.data[dd];
            }
        }

        if(a.isTrueObject(options.header)) {
            for(var hh in options.header) {
                this.params.header[hh] = options.header[hh];
            }
        }

        // Binding result function
        this.success = (a.isFunction(success)) ? success : function(){};
        this.error   = (a.isFunction(error)) ? error : function(){};

        // Detecting browser support of ajax (including old browser support
        this.request = null;
        if(!a.isNone(window.XMLHttpRequest)) {
            this.request = new XMLHttpRequest();
        // Internet explorer specific
        } else {
            var msxml = [
                'Msxml2.XMLHTTP.6.0',
                'Msxml2.XMLHTTP.3.0',
                'Msxml2.XMLHTTP',
                'Microsoft.XMLHTTP'
            ];
            for(var w=0, q=msxml.length; w<q; ++w) {
                try {
                    this.request = new ActiveXObject(msxml[w]);
                } catch(e) {}
            }
        }
    };

    /**
     * Parse the data to return the formated object (if needed).
     *
     * @private
     *
     * @param {Object} params                   The parameter list from
     *                                          configuration ajax
     * @param {Object} http                     The xmlHttpRequest started
     * @return {Object | String}                The parsed results
    */
    a.ajax.prototype.parseResult = function(params, http) {
        // Escape on special case HTTP 204
        if(http.status === 204) {
            return '';
        }

        //We are in non async mode, so the function should reply something
        var type = params.type.toLowerCase(),
            result = (type === 'json') ? a.parser.json.parse(http.responseText):
                    (type === 'xml') ? http.responseXML:
                    http.responseText;

        // User is asking for a model convertion
        if(params.model) {
            var modelName = params.model,
                errorStr = 'Model ' + modelName +
                            ' not found, empty object recieve Model Pooler';

            // We get primary elements from model
            var primaries = a.model.pooler.getPrimary(modelName);

            // Model not found
            if(primaries === null) {
                a.console.storm('error', 'a.ajax', errorStr, 1);

            // No primaries into the model, we create new model
            } else if(params.many === true && a.isArray(result)) {
                var content = [];
                for(var i=0, l=result.length; i<l; ++i) {
                    var data = result[i],
                        model = getOrCreateModel(modelName, primaries,
                                                            data);
                    if(model !== null) {
                        model.fromObject(data);
                        content.push(model);
                    } else {
                        a.console.storm('error', 'a.ajax', errorStr, 1);
                    }
                }
                // We replace
                result = content;
            } else {
                var fmdl = getOrCreateModel(modelName, primaries, result);

                // This test is probably not neeeded, but, who knows,
                // maybe one day it will raise to power and conquer
                // the world.
                if(fmdl) {
                    fmdl.fromObject(result);
                    result = fmdl;
                } else {
                    a.console.storm('error', 'a.ajax', errorStr, 1);
                }
            }
        }

        // After to use/parse on object
        if(params.hasOwnProperty('after')) {
            for(var t=0, k=params.after.length; t<k; ++t) {
                var fct = a.getAjaxAfter(params.after[t]);
                if(a.isFunction(fct)) {
                    result = fct.call(this, params, result);
                }
            }
        }

        // We cache if needed
        if(params.hasOwnProperty('store') && params.store) {
            var store = params.store,
                multiplier = 1;

            if(store.indexOf('min') > 0) {
                multiplier = 60000;
            } else if(store.indexOf('h') > 0) {
                multiplier = 3600000;
            } else if(store.indexOf('s') > 0) {
                multiplier = 1000;
            }

            // Adding element to store
            ajaxCache.add(params.method, params.url, result, 
                multiplier * parseInt(params.store, 10));
        }

        return result;
    };

    /**
     * Manually abort the request.
    */
    a.ajax.prototype.abort = function() {
        try {
            this.request.abort();
        } catch(e) {}
    };

    /**
     * Send the ajax request.
    */
    a.ajax.prototype.send = function() {
        var method = this.params.method.toUpperCase();

        // Skip request in some case, due to mock object (first test)
        var mockResult = a.mock.get(method, this.params.url, this.params.data);
        if(mockResult !== null) {
            var params = this.params;

            // We send a result
            a.message.dispatch('a.ajax', {
                success : true,
                status  : 200,
                url     : params.url,
                method  : method,
                params  : params
            });

            // Directly call success function
            this.success(mockResult, 200);

            // We don't proceed request
            return;
        }

        // We search for cached element
        if(a.isArray(this.params.before)) {
            var befores = this.params.before;
            for(var i=0, l=befores.length; i<l; ++i) {
                var before = a.getAjaxBefore(befores[i]);
                if(a.isFunction(before)) {
                    this.params = before.call(this, this.params);
                }
            }
        }

        // We search for cached element
        var cached = ajaxCache.get(
                            this.params.method || 'GET', this.params.url || '');
        // Something is existing, we return it instead or performing request
        if(cached) {
            this.success(cached, 200);
            return;
        }

        //Creating a cached or not version
        if(this.params.cache === false) {
            // Generate a unique random number
            var rnd = a.uniqueId('rnd_');
            // Safari does not like this...
            try {
                this.params.data.cachedisable = rnd;
            } catch(e) {}
        }

        //Creating the url with GET
        var toSend = '';

        if(a.isString(this.params.data)) {
            toSend = this.params.data;
        } else {
            for(var d in this.params.data) {
                toSend += encodeURIComponent(d) + '=' +
                        encodeURIComponent(this.params.data[d]) + '&';
            }
            //toSend get an extra characters & at the end, removing it
            toSend = toSend.slice(0, -1);
        }

        var url = this.params.url,
            async = this.params.async;
        if(method == 'GET' && toSend) {
            url += '?' + toSend;
        }

        //Catching the state change
        if(async === true) {
            // Scope helper
            var requestScope = {
                success     : this.success,
                params      : this.params,
                error       : this.error,
                request     : this.request,
                parseResult : this.parseResult
            };

            this.request.onreadystatechange = function() {
                // In some cases, the requestScope may be invalid
                // If user cancel the ajax request, so we use this try/catch
                // To prevent this error.
                var status = -1;
                try {
                    status = requestScope.request.status;
                } catch(e) {
                    return;
                }

                // IE9 Bug as reported in jQuery.
                if (status === 1223) {
                    status = 204;
                }

                // Any 200 status will be validated
                if(requestScope.request.readyState === 4) {
                    var great = (status >= 200 && status < 400);

                    // Parsing all possible ajax status handler
                    var great = false,
                        tmpSt = null,
                        u     = a.ajaxStatus.length;
                    while (u--) {
                        tmpSt = a.ajaxStatus[u].call(this, requestScope.method,
                                requestScope.params.url, status);
                        if (tmpSt === 'success') {
                            great = true;
                            // Everything went fine
                            requestScope.success(
                                requestScope.parseResult(requestScope.params,
                                        requestScope.request),
                                status
                            );
                            break;
                        } else if (tmpSt === 'error') {
                            // An error occurs
                            requestScope.error(url, status);
                            break;
                        }
                    }

                    // We send a result
                    a.message.dispatch('a.ajax', {
                        success : great,
                        status  : status,
                        url     : requestScope.params.url,
                        method  : requestScope.method,
                        params  : requestScope.params
                    });
                }
            };
        }

        //Openning the url
        this.request.open(method, url, async);

        //Setting headers (if there is)
        var contentTypeDefault = ['Content-Type', 'Content-type', 'content-type'],
            contentTypeFound   = false;
        for(var header in this.params.header) {
            this.request.setRequestHeader(header, this.params.header[header]);

            // In case of POST:
            //   a specific content type (a default one) may be needed
            if(!contentTypeFound && a.contains(contentTypeDefault, header)) {
                contentTypeFound = true;
            }
        }

        // Set a default one if not already set by user
        if(!contentTypeFound && method === 'POST') {
            this.request.setRequestHeader(
                'Content-type',
                'application/x-www-form-urlencoded'
            );
        }

        // Skip request in some case, due to mock object (second test)
        mockResult = a.mock.get(method, this.params.url);
        if(mockResult !== null) {
            // We send a result
            a.message.dispatch('a.ajax', {
                success : true,
                status  : 200,
                url     : this.params.url,
                method  : method,
                params  : this.params
            });

            // Directly call success function
            this.success(mockResult, 200);

            // We don't proceed request
            return;

        // We proceed normal ajax request
        } else {
            this.request.send(toSend);
        }

        return (async === false) ?
                this.parseResult(this.params, this.request) :
                'No return in async mode';
    };


    /*
     * -------------------------------
     *   APPSTORM TEMPLATE
     * -------------------------------
    */
    // Some basic template to use
    a.setTemplateAjaxOptions('json', {
        type: 'json',
        header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    a.setTemplateAjaxOptions('xml', {
        type: 'xml',
        header: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml'
        }
    });

    // Many models
    a.setTemplateAjaxOptions('list', {many: true});
    a.setTemplateAjaxOptions('array', {many: true});
    a.setTemplateAjaxOptions('many', {many: true});

    // Cache management
    a.setTemplateAjaxOptions('cache-enable', {
        cache: true
    });
    a.setTemplateAjaxOptions('cache-disable', {
        cache: false
    });

    // Creating http verb
    var verbs = ['POST', 'PUT', 'GET', 'DELETE', 'HEAD', 'OPTIONS',
                 'CONNECT', 'TRACE', 'PATCH'];
    for(var z=0, r=verbs.length; z<r; ++z) {
        (function(verb) {
            a.setTemplateAjaxOptions(verb, {
                method: verb
            });
        })(verbs[z]);
    }

})(window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Dynamic loader for many files type

************************************************************************ */


/**
 * Dynamic loader for many files type.
 *
 * @constructor
*/
a.loader = (function() {
    'use strict';

    // The store, curently setted on document and document.body.
    // Can also be setted to something like:
    //   var doc = document.createElement('div');
    //   var doc = document.body;
    // if you want the dom remains empty of appstorm scripts.
    var doc = document.getElementsByTagName('head')[0],
        store = a.mem.getInstance('a.loader');

    /**
     * Create a script html tag element.
     *
     * @private
     *
     * @param {String} type                 The script type, should be
     *                                      text/javascript by default
     * @param {String} src                  The source of the script
     * @param {String} data                 Any data to append to script tag
     * @return {DOMElement}                 The element created
    */
    function createScriptElement(type, src, data) {
        var el = document.createElement('script');

        el.setAttribute('type', type);
        el.setAttribute('data-src', src);
        el.text = data;

        return el;
    }

    /**
     * Create a style html tag element.
     *
     * @private
     *
     * @param {String} data                 The data to append to style tag.
     * @return {DOMElement}                 The element created
    */
    function createStyleElement(data) {
        var el = document.createElement('style');
        el.setAttribute('type', 'text/css');

        // IE
        if (el.styleSheet && !el.sheet) {
            el.styleSheet.cssText = data;
        } else {
            el.appendChild(document.createTextNode(data));
        }

        return el;
    }

    /**
     * Create an HTML script containing data loaded. This helps to avoid
     * loading twice the same resource.
     *
     * @private
     *
     * @param {String} type                 The element type, could be usually
     *                                      css, js, html or translate/json
     * @param {String} src                  The source related to this data
     * @param {String} data                 The associated data
    */
    function createHtmlCache(type, src, data) {
        type = type.toLowerCase();

        var sanitize = a.sanitize(src),
            el = createScriptElement('appstorm/' + type, sanitize, data),
            st = store.get(type);

        if (!a.isArray(st)) {
            st = [sanitize];
            store.set(type, st);
        } else {
            st.push(sanitize);
            st = a.uniq(st);
            store.set(type, st);
        }

        doc.appendChild(el);
    }

    /**
     * Search for an existing data stored in HTML cache.
     *
     * @private
     *
     * @param {String} type                 The type to search (like css, js)
     * @param {String} src                  The source related to data
     * @return {String | Null}              Any string stored, or null if
     *                                      no matching tag where found...
    */
    function searchHtmlCache(type, src) {
        var scripts  = doc.getElementsByTagName('script'),
            sanitize = a.sanitize(src);

        type = type.toLowerCase();

        for (var i = 0, l = scripts.length; i < l; ++i) {
            if (scripts[i].getAttribute('type') === 'appstorm/' + type && 
                    scripts[i].getAttribute('data-src') === sanitize) {
                return scripts[i].text;
            }
        }

        // Nothing found
        return null;
    }

    /**
     * load some data threw AJAX.
     *
     * @private
     * @async
     *
     * @param {String} uri                  The data path
     * @param {Function | Null} success     The callback to apply in
     *                                      case of success
     * @param {Function | Null} error       The callback to apply
     *                                      in case of error
     * @param {Object | Null} args          An ajax argument object,
     *                                      not all of them are used
     *                                      (some are automatically generated
     *                                      and cannot be changed)
    */
    function ajaxLoad(uri, success, error, args) {
        // Searching existing content
        if (a.isTrueObject(args) && args.cacheType) {
            var search = searchHtmlCache(args.cacheType, uri);
            if (search !== null) {
                if (a.isFunction(success)) {
                    success(search, -10);
                }
                return;
            }
        }

        var options = {
            url    : uri,   //Allowed type : any URL
            method : 'GET', //Allowed type : 'GET', 'POST'
            type   : 'raw', //Allowed type : raw, json, xml
            async  : true,  //Allowed type : true, false
            cache  : true,  //Allowed type : true, false
            data   : {},    //Allowed type : any kind of object | key => value
            header : {}     //Allowed type : any kind of object | key => value
        };

        a.console.storm('log', 'a.loader',
                'Loading resource from url ```' + uri + '```', 3);

        if(!a.isNone(args)) {
            if(a.isString(args.method)) {
                options.method = args.method;
            }
            if(!a.isNone(args.type) &&
                    (args.type === 'json' || args.type === 'xml') ) {
                options.type = args.type;
            }
            if(a.isTrueObject(args.data)) {
                options.data = args.data;
            }
            if(a.isTrueObject(args.header)) {
                options.header = args.header;
            }
            if(a.isBoolean(args.cache)) {
                options.cache = args.cache;
            }
        }

        // Loading data
        var er = (a.isFunction(error)) ? error : function(){};
        a.ajax(options, function (content, status) {
            if(a.isFunction(success)) {
                success(content, status);
            }
            if (a.isTrueObject(args) && args.cacheType) {
                createHtmlCache(args.cacheType, uri, content);
            }
        }, er).send();
    }

    /**
     * Append element to head of page.
     *
     * @private
     *
     * @param {String} type                 Script or style
     * @param {String} uri                  The url for this script/style
     * @param {Function | Null} success     The success function
     * @param {Function | Null} error       The error function
     * @param {Object} args                 Any revelant arguments passed to
    */
    function appendElementToHeader(type, uri, success, error, args) {
        // Exiting if type is unknow
        if (type !== 'script' && type !== 'style') {
            a.console.storm('error', 'a.loader', 'Unknow type ```' + type +
                    '```', 1);
            if (a.isFunction(error)) {
                error();
            }
            return;
        }

        ajaxLoad(uri, function(data, status) {
            // It's loaded from cache...
            // Which means we got nothing to do
            if (status === -10) {
                if (a.isFunction(success)) {
                    success(data);
                }
                return;
            }

            var el = null;

            if (type === 'script' && args.tagType) {
                el = createScriptElement(args.tagType, uri, data);
            } else if (type === 'style') {
                el = createStyleElement(data);
            }

            // Append element to dom
            if (el !== null) {
                document.getElementsByTagName('head')[0].appendChild(el);
            }

            // Now we can call back success
            if (a.isFunction(success)) {
                success(data);
            }
        }, error, args || {});
    }

    return {
        /**
         * Javascript loader.
         *
         * @async
         *
         * @param {String} uri              The path to access content
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An ajax argument object,
         *                                  not all of them are used
         *                                  (some are automatically generated
         *                                  and cannot be changed)
        */
        js: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            // TODO: for IE only, for others use application/javascript
            args.tagType = 'text/javascript';
            args.cacheType = 'js';

            appendElementToHeader('script', uri, success, error, args);
        },

        /**
         * JSONP loader.
         *
         * @async
         *
         * @param {String} uri              The path to access content
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An ajax argument object,
         *                                  not all of them are used
         *                                  (some are automatically generated
         *                                  and cannot be changed)
        */
        jsonp: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            // TODO: for IE only, for others use application/javascript
            args.tagType = 'text/javascript';

            appendElementToHeader('script', uri, success, error, args);
        },

        /**
         * JSON loader.
         *
         * @async
         *
         * @param {String} uri              The path to access content
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An ajax argument object,
         *                                  not all of them are used
         *                                  (some are automatically generated
         *                                  and cannot be changed)
        */
        json: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }

            args.type = 'json';
            args.header.accept = 'application/json, text/javascript';

            ajaxLoad(uri, success, error, args);
        },

        /**
         * XML loader.
         *
         * @async
         *
         * @param {String} uri              The path to access content
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An ajax argument object,
         *                                  not all of them are used
         *                                  (some are automatically generated
         *                                  and cannot be changed)
        */
        xml: function(uri, success, error, args) {
            // Setting the type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'xml';

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'application/xml, text/xml';

            ajaxLoad(uri, success, error, args);
        },

        /**
         * CSS loader.
         *
         * @async
         *
         * @param {String} uri              The path to access content
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An ajax argument object,
         *                                  not all of them are used
         *                                  (some are automatically generated
         *                                  and cannot be changed)
        */
        css: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            args.tagType = 'text/css';
            args.cacheType = 'css';

            appendElementToHeader('style', uri, success, error, args);
        },

        /**
         * HTML loader.
         *
         * @async
         *
         * @param {String} uri              The path to access content
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An ajax argument object,
         *                                  not all of them are used
         *                                  (some are automatically generated
         *                                  and cannot be changed)
        */
        html: function(uri, success, error, args) {
            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }

            args.cacheType = 'html';

            // In debug mode, we disallow cache
            if(a.environment.get('app.debug') === true) {
                args.cache = false;
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }

            args.header.accept = 'text/html';

            appendElementToHeader('script', uri, success, error, args);
        },

        /**
         * JavaFX loader.
         *
         * @async
         *
         * @param {String} uri              The path for given jar files to
         *                                  load
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An object to set property for
         *                                  javaFX (like javascript name...),
         *                                  we need : args.code (the main to
         *                                  start), args.id (the id of
         *                                  project). args.width and height
         *                                  are optional
        */
        javafx: function (uri, success, error, args) {
            if(a.isNone(args) || a.isNone(args.code) || a.isNone(args.id)) {
                var errorStr =  'The system need args.code ';
                    errorStr += 'and args.name setted to be able to load any ';
                    errorStr += 'javafx resource... This uri will not be ';
                    errorStr += 'loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.javafx', errorStr, 2);
                return;
            }

            // Load (if needed) javaFX javascript include helper
            var version = (args.version) ? args.version : '1.3';
            this.js('http://dl.javafx.com/' +version+ '/dtfx.js', function() {
                javafx({
                    archive: uri,
                    width: args.width || 1,
                    height: args.height || 1,
                    code: args.code,
                    name: args.id
                });
            });

            // There is no 'load' event, so we emulate one
            var timer = null,
                max = 2000;

            timer = a.timer.add(function() {
                // Valid when max <ait occurs or system is loaded
                if(max-- > 0 && !a.isNone(
                        document.getElementById(args.id).Packages)) {
                    a.timer.remove(timer);
                    if(a.isFunction(success)) {
                        success();
                    }
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Flash loader.
         *
         * @async
         *
         * @param {String} uri              The path for given swf files to
         *                                  load
         * @param {Function | Null} success The callback to call after
         *                                  loading success
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An object to set property for
         *                                  Flash
        */
        flash: function (uri, success, error, args) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr +='parameters: rootId and id, setted to be able ';
                    errorStr += 'to load any flash resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.flash', errorStr, 2);
                return;
            }

            // Load (if needed) the swfobject.js to load flash from that
            console.log(a.url + 'vendor/storage/flash/swfobject.js');
            this.js(a.url + 'vendor/storage/flash/swfobject.js', function() {
                swfobject.embedSWF(
                        uri,
                        args.rootId,
                        '100%',
                        '100%',
                        '10.0.0',
                        a.url + 'vendor/storage/flash/expressInstall.swf',
                        args.flashvars,
                        args.params,
                        {id : args.id},
                function(e) {
                    // We do make a small timeout, for a strange reason 
                    // the success event is not really ready
                    if(e.success === false && a.isFunction(error)) {
                        error(uri, 408);
                    }else if(e.success === true && a.isFunction(success)) {
                        setTimeout(success, 500);
                    }
                });
            }), function() {
                a.console.storm('error', 'a.loader.flash', 'Unable to load ' +
                        '```' + uri + '``` resource', 1);
            };
        },

        /**
         * Silverlight loader.
         *
         * @async
         *
         * @param {String} uri              The path for given xap files to
         *                                  load
         * @param {Function | Null} success The callback to call after
         *                                  loading success (NOTE: silverlight
         *                                  is not able to fire load event,
         *                                  so it's not true here...)
         * @param {Function | Null} error   The callback to call after
         *                                  loading error
         * @param {Object} args             An object to set property for
         *                                  Silverlight
        */
        silverlight: function(uri, success, error, args) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr += 'parameters: rootId, id, setted to be able ';
                    errorStr +='to load any silverlight resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.silverlight', errorStr, 2);
                return;
            }

            var obj  = document.createElement('object');
            obj.id   = args.id;
            obj.data = 'data:application/x-silverlight-2,';
            obj.type = 'application/x-silverlight-2';

            if(!a.isArray(args.params)) {args.params = [];}

            // Adding URI to element
            args.params.push({name : 'source', value : uri});

            for(var i=0, l=args.params.length; i<l; ++i) {
                var param = document.createElement('param');
                param.name = args.params[i].name;
                param.value = args.params[i].value;
                obj.appendChild(param);
            }

            document.getElementById(args.rootId).appendChild(obj);

            // There is no 'load' event, so we emulate one
            var timer = null,
                max = 2000;

            timer = a.timer.add(function() {
                // Valid when max <ait occurs or system is loaded
                if(max-- > 0 &&
                        !a.isNone(document.getElementById(args.id).Content)) {

                    a.timer.remove(timer);
                    if (a.isFunction(success)) {
                        success();
                    }
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Manually register element to cache.
         *
         * @private
         *
         * @param {String} type             The element type, could be usually
         *                                  css, js, html or translate/json
         * @param {String} src              The source related to this data
         * @param {String} data             The associated data
        */
        manuallyAddCache: createHtmlCache,

        /**
         * Get the currently url loaded and cached.
         *
         * @param {String} type             The type to get, like 'js', 'css'
         * @return {Object | Array | Null}  The cache trace, object if type is
         *                                  empty/null, array in other cases.
         *                                  Null if the element does not exist
         *                                  / does not have anything cached
         *                                  yet
        */
        trace: function(type) {
            if (type) {
                return store.get(type);
            }
            return store.list();
        }

        /*!
         * @private
        */
    };
}());
;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manage action related to hash change.

************************************************************************ */

(function(a) {
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
    }

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
    }

    // We bind the hash event system
    a.hash.bind('change', function(data) {
        callApplyHashChange(data.value, 'enter');
        callApplyHashChange(data.old,   'leave');
    }, null, false, false);

    /**
     * Manage action related to hash change.
     *
     * @constructor
    */
    a.route = {

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
        bind: function(hash, fct, action) {
            action = getAction(action) + '.hash';
            var storage = mem.get(action) || {};

            if(!storage[hash]) {
                storage[hash] = [];
            }

            storage[hash].push(fct);
            mem.set(action, storage);
            return this;
        },

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
        unbind: function(hash, fct, action) {
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
        },

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
        otherwise: function(fct, action) {
            action = getAction(action) + '.otherwise';
            if(a.isNone(fct)) {
                mem.remove(action);
            } else {
                mem.set(action, fct);
            }
            return this;
        },

        /**
         * Navigate to a given hashtag.
         *
         * @param {String} hash                 The hashtag to navigate to
         * @param {Object} parameters           Any parameters to give to state
         *                                      system as temp data. This is an
         *                                      equivalent to a.state.inject func.
        */
        go: function(hash, parameters) {
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
        },

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
        fake: function(hash, parameters) {
            if(parameters) {
                a.state.inject(parameters);
            }
            if(hash) {
                a.hash.fake(hash);
            }
        },

        /**
         * Go back one time into history.
        */
        back: function() {
            window.history.back();
        },
    };



    // Aliases
    a.route.href     = a.route.go;
    a.route.ref      = a.route.go;
    a.route.hash     = a.route.go;
    a.route.hashtag  = a.route.go;
    a.route.navigate = a.route.go;
})(window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a way to manipulate, extract and replace parameters like
        {{id: [a-fA-F0-9]+}} as regular expression. This is intensly used
        by appstorm to check and manipulate parameters inside state plugin.

************************************************************************ */

/**
 * Provide a way to manipulate, extract and replace parameters like
 * {{id: [a-fA-F0-9]+}} as regular expression. This is intensly used
 * by appstorm to check and manipulate parameters inside state plugin.
 *
 * @contructor
*/
a.parameter = {
    /**
     * Store cached function to use as replacement method.
     *
     * @private
     * @property _fct
     * @type Object
     * @default {}
    */
    _fct: {},

    /**
     * From a given string, we extract parameter inside.
     *
     * @param {String} input                The string to extract param from
     * @param {RegExp | Null} customRegex   A new regex to replace current one
     * @return {Array}                      An array with every element as
     *                                      object key: name (the key name),
     *                                      regex (the linked regex),
     *                                      start (integer) as content
    */
    extract: function(input, customRegex) {
        // Example allowed : ' id : [a-fA-F0-9]+ is valid,
        // simple-te_st: [0-9]+ is valid too
        // valid : a-z and A-Z and 0-9 and -, _, [, ], +, ?, *
        // and of course () and \ and /
        // var regexParameterExtracter =
        //     /\{\{(\s*[a-zA-Z0-9-_-\-]+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi,
        //var regexParameterExtracter = /\{\{(\s*[a-zA-Z0-9-\--_]+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi;
        var regexParameterExtracter = /\{\{(\s*[^\{\}]+\s*:\s*[^\{\}]+\s*)\}\}/gmi;

        var ex = !a.isNone(customRegex);
        if(ex) {
            regexParameterExtracter = customRegex;
        }

        // We extract all parameters
        var extractedParameters = [],
            match;

        while(match = regexParameterExtracter.exec(input)) {
            // We keep only the matching part
            var separated = null;

            if(ex) {
                // Handle default behaviour
                separated = ['hash', match[1]];
            } else {
                separated = match[1].split(':', 2);
            }

            // And now we trim to keep only content
            extractedParameters.push({
                original:  a.trim(match[0]),
                name:  a.trim(separated[0]),
                regex: a.trim(separated[1]),
                start: match.index
            });
        }

        // We return that content
        return extractedParameters;
    },

    /**
     * Replace a parameter at a specific position.
     *
     * @param {String} input                The string to use as replacement
     * @param {Object} param                An extracted parameter from
     *                                      extract function
     * @param {String | Null} custom        A custom string to add to system
     * @return {String}                     The string replaced with new
     *                                      content
    */
    replace: function(input, param, custom) {
        if(a.isNone(custom)) {
            custom = '(' + param.regex + ')';
        }
        return input.substr(0, param.start) + custom +
                    input.substr(param.start + param.original.length);
    },

    /**
     * Convert a parameter string into a regex string.
     *
     * @param {String} input                The string to convert
     * @param {RegExp | Null} customRegex   A custom regex if needed
     * @return {String}                     The converted string ready to be
     *                                      used as regex tester.
    */
    convert: function(input, customRegex) {
        var extracted = this.extract(input, customRegex),
            i = extracted.length;

        // We will replace into string the current parameter system with regex
        while(i--) {
            input = this.replace(input, extracted[i]);
        }

        return input;
    },


    /**
     * From a given list provided by extract functions, get the related
     * values and bring the new object with, for every regex, the corresponding
     * values.
     *
     * @param {String} input                The input value to extract data
     *                                      from
     * @param {String} internal             The original string regex
     * @param {Object} extract              The extracted object
     * @return {Object}                     The extracted object with values
     *                                      found
    */
    getValues: function(input, internal, extract) {
        var i = extract.length,
            working = '' + internal;

        // We create a huge -global- request matcher
        while(i--) {
            working = this.replace(working, extract[i]);
        }

        // We make a global extraction
        var regex      = new RegExp('^' + working + '$', 'gi'),
            match      = regex.exec(input);

        // Index start at 1, because 0 is the full sentence (unhelpfull here)
        for(var j=1, l=match.length; j<l; ++j) {
            extract[j-1].value = match[j];
        }

        return extract;
    },


    /**
     * Replace inside a given input, the parameters found in internal,
     * by value found in hash.
     * Example:
     *   As input
     *     The page hash (from url-hashtag) is /dashboad/39
     *     The page internal (from state) is /dashboard/{{id: [0-9]+}}
     *     The input (from state include for ex.) is http://mylink.com/{{id}}
     *   It will return
     *     http://mylink.com/39
     *   It also can manage different function loader threw addParameterType,
     *   so it can takes variable content not only from page hash...
     *
     * @param {String} input                The string to replace parameters
     *                                      inside
     * @param {String} hash                 The current string, to extract
     *                                      parameters from.
     * @param {String} internal             The hashtag stored internally
     *                                      (with parameters)
     * @param {Boolean | Null} escape       Indicate if system should escape
     *                                      content to string before sending
     *                                      back, it means if yes, the system
     *                                      will send back '[object object]'
     *                                      for an object (default: yes)
    */
    extrapolate: function(input, hash, internal, escape) {
        if(escape !== false) {
            escape = true;
        }

        // Only if there is some parameters in input
        if (a.isString(input) && input && input.indexOf('{{') >= 0 &&
                input.indexOf('}}') >= 0) {

            var emptyNameRegex = /\{\{(\s*\w+\s*)\}\}/gmi;
            // Param in input should be like this {{hash:name}} or
            // {{store:name}} so it should be same way

            var paramStr =      this.extract(input),
                paramInternal = this.extract(internal),
                extraStr =      this.extract(input, emptyNameRegex);

            // Merge default parameters, and new one
            paramStr = paramStr.concat(extraStr);

            // Now we extract chain
            var pi = paramInternal.length;
            while(pi--) {
                internal = this.replace(internal, paramInternal[pi]);
            }

            // We create regex to extract parameters
            var regex = new RegExp('^' + internal + '$', 'gi'),
            // This time the match will fully match at first time directly...
                match  = regex.exec(hash),
                result = [];

            // if we found a match, we just need to make
            // corresponding data from internal to match
            if(match) {
                var i=0,
                    l=paramInternal.length;
                for(; i<l; ++i) {
                    // match : the first item is direct string (not parsed)
                    paramInternal[i].value = match[i+1];
                }

                // We copy value from paramInternal to paramStr
                // everytime we found a name match
                for(var j=0, k=paramStr.length; j<k; ++j) {
                    for(i=0; i<l; ++i) {
                        // The paramStr is wrongly separate into
                        // hash: name (so regex is param name, and name type)
                        if(paramInternal[i].name === paramStr[j].regex &&
                                paramStr[j].name === 'hash') {
                            paramStr[j].value = paramInternal[i].value;
                        }
                    }
                }
            }

            // We perform final replace : storage replace and hashtag replace
            var ps = paramStr.length,
                pr = (escape === false) ? function(a, b, c){return c;} :
                                                                this.replace;

            while(ps--) {
                var param = paramStr[ps],
                    found = false;

                // Replacing hashtag
                if( (param.name === 'hash' || param.name === 'hashtag') &&
                        !a.isNone(param.value)) {

                    found = true;
                    input = this.replace(input, param, param.value);
                }

                if(!found) {
                    var handlers = this._fct;

                    a.each(handlers, function(handler, index) {
                        if(index == param.name) {
                            input = pr(input, param, handler(param.regex));
                        }
                    });
                }
            }
        }

        return input;
    },

    /**
     * Register a new function parameter (like {{memory: name}}).
     * Here the name will be memory, and the function: the function which will
     * be used to find corresponding name data.
     *
     * @param {String} name                 The parameter type (like 'memory')
     * @param {Function} fct                The function to apply when this
     *                                      parameter type is found
    */
    addParameterType: function(name, fct) {
        if(name && a.isString(name) && a.isFunction(fct)) {
            this._fct[name] = fct;
        }
    },

    /**
     * Unregister a function parameter (should almost never been in fact...).
     *
     * @param {String} name                 The function name to remove
    */
    removeParameterType: function(name) {
        delete this._fct[name];
    }
};



// We allow the 'mem' parameter which manipulate a.mem, and environment for
// same purpose

/*
------------------------------
  PARAMETERS TYPE ASSOCIATED
------------------------------
*/
(function() {
    a.parameter.addParameterType('mem',  function() {
        return a.mem.get.apply(a.mem, arguments);
    });
    a.parameter.addParameterType('environment', function() {
        return a.environment.get.apply(a.environment, arguments);
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a simple ACL rules checker to create different application
        behavior regarding user role

************************************************************************ */


/**
 * Provide a simple ACL rules checker to create different application
 * behavior regarding user role.
 *
 * @constructor
*/
a.acl = a.extend({
    /**
     * The store.
     *
     * @property _store
     * @private
    */
    _store: a.mem.getInstance('app.acl'),

    /**
     * Set the current user role.
     *
     * @param {String} role                 The role to set as 'current' one
    */
    setCurrentRole: function (role) {
        this._store.set('current', role);
        this.dispatch('change', role);
        a.message.dispatch('a.acl.change', role);
    },

    /**
     * Get the current user role stored.
     *
     * @return {String}                     The role found, or an empty
     *                                      string if nothing has been found
    */
    getCurrentRole: function () {
        return this._store.get('current') || '';
    },

    /**
     * Set the current role list. This is used to compare the role to a list.
     *
     * SO: the list order is important! It has to go from the minimum role
     * (less privileges) to the maximum role (more privileges). Ex:
     * ['user', 'leader', 'super administrator']
     * is OK...
     * If one role is not listed here, and still used, it will be consider
     * as minimum role (less than all listed here).
     *
     * Note: this function is quite important, as it register related
     * handlebars helpers: if you create role ['admin', 'superAdmin'], it
     * will automatically create handlebars helpers 'isAdmin' and
     * 'isSuperAdmin', they will both accept a string as parameter, and work
     * as a if: {{isSuperAdmin 'superAdmin'}} will work,
     * {{isSuperAdmin 'superadmin'}} will work too (not case sensitive)
     * Note also you can't pass an object: {{isSuperAdmin user}} will not work
     * if user is not the role in string you want to check...
     *
     * @param {Array} roleList              The role list to store
    */
    setRoleList: function (roleList) {
        if (a.isArray(roleList)) {
            this._store.set('list', roleList);

            // We create related Handlebars helpers for every role
            // Like you get a role 'adMin', it will create 'isAdMin' helper
            a.each(roleList, function (role) {
                var helper = a.firstLetterUppercase(role, 'is'),
                    lower  = role.toLowerCase();

                Handlebars.registerHelper(helper, function (value, options) {
                    if (a.trim(value.toLowerCase()) === a.trim(lower)) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });
            });
        }
    },

    /**
     * Get the current role list.
     *
     * @return {Array | Null}               The current role list stored, or
     *                                      null if nothing is found
    */
    getRoleList: function () {
        return this._store.get('list');
    },

    /**
     * Check if current role is allowed compare to given minimum role.
     *
     * @param {String} minimumRole          The minimum role to check
     * @param {String | Null} currentRole   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The allowed (true) or refused
     *                                      (false) state
    */
    isAllowed: function (minimumRole, currentRole) {
        currentRole = currentRole || this.getCurrentRole();

        var positionCurrentRole = -1,
            positionMinimumRole = -1,
            roleList = this.getRoleList() || [],
            position = roleList.length;

        // Search position in current role list
        while (position--) {
            if (roleList[position]  == minimumRole) {
                positionMinimumRole = position;
            }

            if (roleList[position]  == currentRole) {
                positionCurrentRole = position;
            }

            // Stop before if possible
            if (positionMinimumRole != -1 && positionCurrentRole != -1) {
                break;
            }
        }

        return (positionCurrentRole >= positionMinimumRole);
    },

    /**
     * Check if current role is refused compare to given minimum role.
     *
     * @param {String} minimumRole          The minimum role to check
     * @param {String | null} currentRole   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The refused (true) or allowed
     *                                      (false) state
    */
    isRefused: function (minimumRole, currentRole) {
        return !this.isAllowed(minimumRole, currentRole);
    },

    /**
     * Clear the full ACL rules
    */
    clear: function () {
        this._store.clear();
    }

    /*!
     * @private
    */

}, a.eventEmitter('a.acl'));



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('AclRole', function () {
    return new Handlebars.SafeString(a.acl.getCurrentRole());
});

// Allow to check role is allowed or not
Handlebars.registerHelper('AclIsAllowed', function (minimumRole, currentRole,
                                                                options) {
    // We allow 2 or 3 parameters mode !
    options = a.isString(currentRole) ? options : currentRole;
    currentRole = a.isString(currentRole) ? currentRole :
                                                a.acl.getCurrentRole();

    // We check role is allowed or not
    if (a.acl.isAllowed(minimumRole, currentRole)) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Allow to check role is refused or not
Handlebars.registerHelper('AclIsRefused', function (minimumRole, currentRole,
                                                                options) {
    // We allow 2 or 3 parameters mode !
    options = a.isString(currentRole) ? options : currentRole;
    currentRole = a.isString(currentRole) ? currentRole :
                                                a.acl.getCurrentRole();

    // We check role is allowed or not
    if (a.acl.isAllowed(minimumRole, currentRole)) {
        return options.inverse(this);
    }
    return options.fn(this);
});;/*! ***********************************************************************

    License: MIT Licence

    Description:
        The object is faking a server behavior to skip server creation during
        client creation. It provide a simple emulation of server side.

************************************************************************ */
(function (a) {
    /**
     * @private
    */
    var store = a.mem.getInstance('app.mock');

    /**
     * @private
    */
    function getMethod(method) {
        return (!a.isString(method) || !method) ? 'get' : method.toLowerCase();
    }

    /**
     * @private
    */
    function appendToStore(method, data) {
        method = getMethod(method);
        var mocks = store.get(method) || [];

        // many tag
        data.many = false;
        if (a.isTrueObject(data.model)) {
            data.many  = data.model.many;
            data.model = data.model.model;
        }


        if(data.url.indexOf('{{') >= 0 && data.url.indexOf('}}') >= 0) {
            data.regex   = true;
            data.extract = data.url;
            var reg      = a.parameter.convert(data.url);
            data.url     = new RegExp('^' + reg + '$', 'g');
        } else {
            data.regex   = false;
            data.extract = data.url;
        }

        mocks.push(data);
        store.set(method, mocks);
    }

    function typeToString(el) {
        if(a.isString(el)) {
            return 'string';
        } else if(a.isBoolean(el)) {
            return 'boolean';
        } else if(a.isNumber(el) && !a.isNaN(el)) {
            return 'number';
        } else if(a.isArray(el)) {
            return 'array';
        } else if(a.isTrueObject(el)) {
            return 'object';
        } else {
            return 'UNKNOW';
        }
    }

    /**
     * The object is faking a server behavior to skip server creation during
     * client creation. It provide a simple emulation of server side.
     *
     * @constructor
    */
    a.mock = {
        /**
         * Add a new mock to existing mock collection.
         *
         * @param {String} method            The HTTP method, like GET, POST...
         * @param {String} url               The binded url
         * @param {Object | Function} result The result to call/use when needed
         * @param {String} model             The related model.
        */
        add: function (method, url, result, model) {
            appendToStore(method, {
                url: url || '',
                result: result || {},
                model: model || null
            });
        },

        /**
         * Alias of add.
         * @see add
         *
         * @param {String} method            The HTTP method, like GET, POST...
         * @param {String} url               The binded url
         * @param {Object | Function} result The result to call/use when needed
         * @param {String} model             The related model.
        */
        set: function (method, url, result, model) {
            appendToStore(method, {
                url: url || '',
                result: result || {},
                model: model || null
            });
        },

        /**
         * Get a mock element, you probably don't need to use it at all, as
         * the **a.ajax** object already take care of that for you.
         *
         * @param {String} method           The method to call, like GET, POST.
         * @param {String} url              The url. Must be a real url, not
         *                                  with parameters.
         * @param {Object} data             Any data request should handle
         *                                  by default
        */
        get: function (method, url, data) {
            method    = getMethod(method);
            var mocks = store.get(method) || [],
                mock  = null,
                i     = mocks.length;

            while(i--) {
                mock = mocks[i];

                if (mock.regex === true) {
                    mock.url.lastIndex = 0;
                    if (mock.url.test(url) === true) {
                        var extrapolate = a.parameter.extract(mock.extract),
                            variables   = a.parameter.getValues(url,
                                    mock.extract, extrapolate);

                        if(a.isFunction(mock.result)) {
                            // The variables contains name and value
                            // The pluck create an array containing
                            // only value parameter
                            return mock.result.apply(this,
                                    a.pluck(variables,'value').concat([data]));
                        }
                        return mock.result;
                    }

                } else if (mock.url === url) {
                    if(a.isFunction(mock.result)) {
                        return mock.result.call(this, data);
                    }
                    return mock.result;
                }
            }
            return null;
        },

        /**
         * Clear all the mock objects.
        */
        clear: function() {
            store.clear();
        },

        /**
         * Print a given model structure.
         *
         * @param {String} model            The model to print
         * @return {Object}                 The result object, describing
         *                                  the model structure
        */
        model: function(model) {
            if(!a.isString(model) || !model) {
                return {};
            }

            var data   = [],
                types  = store.list(),
                mocks  = null,
                mock   = null;

            for (var method in types) {
                if (types.hasOwnProperty(method)) {
                    mocks = types[method];

                    for (var j = 0, l = mocks.length; j < l; ++j) {
                        mock = mocks[j];
                        if (mock.model === model && mock.many === true) {
                            if (a.isFunction(mock.result)) {
                                data = data.concat(mock.result());
                            } else {
                                data = data.concat(mock.result);
                            }
                        } else if (mock.model === model) {
                            if (a.isFunction(mock.result)) {
                                data.push(mock.result());
                            } else {
                                data.push(mock.result);
                            }
                        }
                    }
                }
            }

            // Now printing result
            var result   = {},
                property = null,
                line     = null;
            for (var i = 0, l = data.length; i < l; ++i) {
                line = data[i];
                for (property in line) {
                    if (line.hasOwnProperty(property)) {
                        if (!result[property]) {
                            result[property] = [];
                        }

                        result[property].push(typeToString(line[property]));
                    }
                }
            }

            // Now we clean result
            for (property in result) {
                result[property] = a.uniq(result[property]);
                if (result[property].length === 1) {
                    result[property] = result[property][0];
                }
            }

            return result;
        },

        /**
         * Get the API of all mock map.
         *
         * @return {Object}                 An object describing the API.
        */
        api: function() {
            var result = {},
                types  = store.list(),
                mocks  = null,
                mock   = null,
                model  = null;

            for (var method in types) {
                if (types.hasOwnProperty(method)) {
                    mocks = types[method];

                    for (var j = 0, l = mocks.length; j < l; ++j) {
                        mock  = mocks[j];
                        model = mock.model || 'unknow';

                        if (!result[model]) {
                            result[model] = {};
                        }

                        if (!result[model][method]) {
                            result[model][method] = [];
                        }

                        result[model][method].push(mock.extract);
                    }
                }
            }

            return result;
        }

        /*!
         * @private
        */
    };
})(window.appstorm);;/**
 * Helper to use JSEP inside AppStorm.JS.
 *
 * This system provide an interpreter for JSEP parser, allowing to compute
 * a value from a JSEP parsing output.
*/
a.jsep = {
    /**
     * The original JSEP parser
     *
     * @property parser
    */
    jsep: jsep.noConflict() || null,

    /**
     * Evaluate a string as a JSEP instruction. Get back the JSEP tree map.
     *
     * @param {String} str                  The string to get JSEP map from.
     * @return {Object}                     A JSEP tree map.
    */
    parse: function (str) {
        if (a.jsep.jsep === null) {
            return {};
        }
        return a.jsep.jsep(str);
    },

    /**
     * Internal is an object used to count variables when dealing with
     * interpreter. It's usefull to know what variables are used in a given
     * sentence.
     * Note: you probably don't need to deal with it...
    */
    internal: function () {
        if (!(this instanceof a.jsep.internal)) {
            return new a.jsep.internal();
        }

        var data = {};

        /**
         * Increase variable.
         *
         * @private
         *
         * @param {String} name             The variable name to count
        */
        this.increaseVar = function (name) {
            if (data.hasOwnProperty(name)) {
                data[name]++;
            } else {
                data[name] = 1;
            }
        };

        /**
         * Decrease variable.
         *
         * @private
         *
         * @param {String} name             The variable name to count
        */
        this.decreaseVar = function (name) {
            if (data.hasOwnProperty(name)) {
                data[name]--;
                if (data[name] <= 0) {
                    delete data[name];
                }
            }
        };

        /**
         * Get the current variable list.
         *
         * @private
         *
         * @return {Object}                 List of variables in use
        */
        this.getListVar = function () {
            return data;
        };
    },

    /**
     * Get an instance of the default JSEP interpreter.
     * With it, you can convert JSEP tree to actual result. Depending on the
     * configuration you choose.
     *
     * @param {String} name                 The interpreter name, must be
     *                                      unique or you may have conflict
     *                                      with other interpreter instance.
     * @param {Boolean} useDefaultBinaryOperators If system should register
     *                                      for you the default binary
     *                                      operators (+, -, *, /, %, ==, ...)
     * @param {Boolean} useDefaultLogicalOperators If system should register
     *                                      for you the default logical
     *                                      operators (operators: ||, &&)
     * @param {Boolean} useDefaultUnaryOperators If system should register
     *                                      for you the default unary operators
     *                                      (-, +, !, ~).
     * @return {Object}                     A new instance of JSEP interpreter.
    */
    interpreter: function (name, useDefaultBinaryOperators,
            useDefaultLogicalOperators, useDefaultUnaryOperators) {
        if (a.jsep.jsep === null) {
            return {};
        }

        if (!(this instanceof a.jsep.interpreter)) {
            return new a.jsep.interpreter(name, useDefaultBinaryOperators,
                    useDefaultLogicalOperators, useDefaultUnaryOperators);
        }

        // Storage to use functions inside.
        this.logicalOperators = a.mem.getInstance(name + '.operators.logical');
        this.binaryOperators = a.mem.getInstance(name + '.operators.binary');
        this.unaryOperators = a.mem.getInstance(name + '.operators.unary');

        /**
         * Evaluate a given JSEP result (see a.jsep.parse function), and
         * output the value.
         * Note that depending on how the interpreter is configured, the
         * value outputted can be quite different from two interpreter...
         *
         * @param {Object} data         A JSEP parse results.
         * @param {Object} scope        Any scope to use here...
         * @return {Object}             An object composed of result, the
         *                              computed result, and variables, a
         *                              list of variables from scope used.
        */
        this.evaluate = function (data, scope) {
            var internal = a.jsep.internal();
            scope = scope || {};
            var result = this.expressions.parse(data, internal, scope);

            return {
                variables: a.keys(internal.getListVar()),
                result: result
            };
        };

        // Shorter
        var lo = this.logicalOperators,
            bo = this.binaryOperators,
            uo = this.unaryOperators,
            source = 'a.jsep.interpreter.' + name;


        /*!
          ------------------------------
            DEFAULT BINARY OPERATORS
          ------------------------------
        */
        if (useDefaultBinaryOperators === true) {
            bo.set('^', function (left, right) {
                return Math.pow(left, right);
            });
            bo.set('+',   function (left, right) {  return left + right;    });
            bo.set('-',   function (left, right) {  return left - right;    });
            bo.set('*',   function (left, right) {  return left * right;    });
            bo.set('/',   function (left, right) {  return left / right;    });
            bo.set('%',   function (left, right) {  return left % right;    });
            bo.set('|',   function (left, right) {  return left | right;    });
            bo.set('&',   function (left, right) {  return left & right;    });
            bo.set('==',  function (left, right) {  return left == right;   });
            bo.set('===', function (left, right) {  return left === right;  });
            bo.set('!=',  function (left, right) {  return left != right;   });
            bo.set('!==', function (left, right) {  return left !== right;  });
            bo.set('<',   function (left, right) {  return left < right;    });
            bo.set('>',   function (left, right) {  return left > right;    });
            bo.set('<=',  function (left, right) {  return left <= right;   });
            bo.set('>=',  function (left, right) {  return left >= right;   });
            bo.set('<<',  function (left, right) {  return left << right;   });
            bo.set('>>',  function (left, right) {  return left >> right;   });
            bo.set('>>>', function (left, right) {  return left >>> right;  });
        }

        /*!
          ------------------------------
            DEFAULT LOGICAL OPERATORS
          ------------------------------
        */
        if (useDefaultLogicalOperators === true) {
            lo.set('||', function (left, right) { return left || right; });
            lo.set('&&', function (left, right) { return left && right; });
        }

        /*!
          ------------------------------
            DEFAULT UNARY OPERATORS
          ------------------------------
        */
        if (useDefaultUnaryOperators === true) {
            uo.set('-', function (left) {  return -left;  });
            uo.set('!', function (left) {  return !left;  });
            uo.set('~', function (left) {  return ~left;  });
            uo.set('+', function (left) {  return +left;  });
        }

        /*!
         * @private
        */

        /**
         * List of functions actually doing parsing...
         * You can modify those functions in case of specific parsing
         * you may need.
        */
        this.expressions = {
            /**
             * Found literal (constant) value, like 1, or
             * 'hello'. This function simply returns it's value.
             *
             * @param {Object} data         The literal object
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The javascript value of current
             *                              literal expression
            */
            literalExpression: function (data, internal, scope) {
                return data.value;
            },

            /**
             * Found 'this' keyword. This function simply returns scope.
             *
             * @param {Object} data         The this object
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Object}             The scope
            */
            thisExpression: function (data, internal, scope) {
                return scope;
            },

            /**
             * Found member of a given object. A member is a property from
             * an object, like a.b or a[b] in js.
             *
             * @param {Object} data         The data with member expression
             *                              inside
             * @param {Object} internal     Unused
             * @param {Object} scope        The scope associated
             * @return {Object | Null}      The object propery values
            */
            memberExpression: function (data, internal, scope) {
                var obj = this.parse(data.object, internal, scope),
                    property = this.parse(data.property, internal, scope);

                if (typeof obj[property] === 'undefined') {
                    // Specific case to handle
                    if(data.object.type === 'ThisExpression') {
                        return property;
                    }
                    a.console.storm('error', source, 'The property ```' +
                        property + '``` could not be found', 1);
                    return null;
                }

                // We are getting the property
                return obj[property];
            },

            /**
             * Found an identifier. An identifier is basically a variable.
             * Like a + b, a and b are identifiers taken from scope.
             *
             * @param {Object} data         The identifier expression inside
             * @param {Object} internal     The object with variables currently
             *                              in use
             * @param {Object} scope        The scope in use
             * @return {Object | String}    The object propery values, or the
             *                              property string if not found.
            */
            identifierExpression: function (data, internal, scope) {
                if (scope.hasOwnProperty(data.name)) {
                    internal.increaseVar(data.name);
                    return scope[data.name];
                }

                return data.name;
            },

            /**
             * Found an array expression. This function will convert it
             * to true JS array.
             * Note: this function can have pretty bad side effect...
             *
             * @param {Object} data         The array structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Array}              A javascript version of array
            */
            arrayExpression: function (data, internal, scope) {
                var arr = [];

                for (var i in data.elements) {
                    if (data.elements.hasOwnProperty(i)) {
                        arr.push(this.parse(data.elements[i], internal,
                                scope));
                    }
                }

                return arr;
            },

            /**
             * Found a function call. The function will be searched inside
             * the scope.
             *
             * @param {Object} data         The function calling arguments
             *                              and name
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed | Null}       The result of function call, or
             *                              null if function is not found in
             *                              scope
            */
            callExpression: function (data, internal, scope) {
                var fct = this.parse(data.callee, internal, scope),
                    args = [];

                if (a.isFunction(fct)) {
                    internal.decreaseVar(data.callee.name);

                    for (var i in data.arguments) {
                        if (data.arguments.hasOwnProperty(i)) {
                            args.push(this.parse(data.arguments[i],
                                    internal, scope));
                        }
                    }

                    return fct.apply(null, args);
                } else {
                    a.console.storm('error', source, 'The function ```' + 
                            data.callee.name + '``` could not be resolved...',
                            1);
                }
                return null;
            },

            /**
             * Found a conditional expression (a ? b : c). This is the
             * only type of 'if' supported.
             *
             * @param {Object} data         The conditional structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The result of the if selector
            */
            conditionalExpression: function (data, internal, scope) {
                var test = this.parse(data.test, internal, scope),
                    consequent = this.parse(data.consequent, internal,
                            scope),
                    alternate = this.parse(data.alternate, internal,
                            scope);

                return (test === true) ? consequent: alternate;
            },

            /**
             * Found more than one expression. This function will create
             * an array with every result in every case.
             *
             * @param {Object} data         The compound structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Array}              An array of values
            */
            compoundExpression: function (data, internal, scope) {
                var arr = [];

                for (var i in data.body) {
                    if (data.body.hasOwnProperty(i)) {
                        arr.push(this.parse(data.body[i], internal,
                                scope));
                    }
                }

                return arr;
            },

            /**
             * Found a unary operator, like -a (negate a), here the -
             * is a unary operator, or the operator not (!) also...
             * This function will rely on 'unaryOperators' store to find
             * a related function to apply the operation.
             *
             * @param {Object} data         The unary structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The unary result
            */
            unaryExpression: function (data, internal, scope) {
                var result = this.parse(data.argument, internal, scope),
                    operator = uo.get(data.operator);

                if (!a.isFunction(operator)) {
                    a.console.storm('error', source,
                            'Unknow unary operator ```' + data.operator +
                            '```', 1);
                    return result;
                }

                return operator.call(this, result, data, internal, scope);
            },

            /**
             * The most common case, like "+" or "-" or "/" operators.
             * Probably the most common, which are basic manipulations
             * in both number and string areas.
             *
             * @param {Object} data         The binary structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The binary result
            */
            binaryExpression: function (data, internal, scope) {
                var left = this.parse(data.left, internal, scope),
                    right = this.parse(data.right, internal, scope),
                    operator = bo.get(data.operator);

                if (!a.isFunction(operator)) {
                    a.console.storm('error', source,
                        'Unknow binary operator ```' + data.operator +
                        '```', 1);
                    return left + right;
                }

                return operator.call(this, left, right, data, internal,
                        scope);
            },

            /**
             * Logical operators like "||" or "&&".
             *
             * @param {Object} data         The logical structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The logical result
            */
            logicalExpression: function (data, internal, scope) {
                var left = this.parse(data.left, internal, scope),
                    right = this.parse(data.right, internal, scope),
                    operator = lo.get(data.operator);

                if (a.isNone(operator) || !a.isFunction(operator)) {
                    a.console.storm('error', source,
                        'Unknow logical operator ```' + data.operator +
                        '```', 1);
                    return left && right;
                }

                return operator.call(this, left, right, data, internal,
                        scope);
            },

            /**
             * The main parser, will take anything from jsep and convert it
             * to what we need. You probably don't need to touch at all
             * this function.
             *
             * @param {Object} data         The data structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed | Null}       The parsed result, or null in case
             *                              of problem
            */
            parse: function (data, internal, scope) {
                if (data && data.type) {
                    switch (data.type) {
                        case 'BinaryExpression':
                            return this.binaryExpression(data, internal,
                                    scope);
                        case 'UnaryExpression':
                            return this.unaryExpression(data, internal,
                                    scope);
                        case 'LogicalExpression':
                            return this.logicalExpression(data, internal,
                                    scope);
                        case 'CallExpression':
                            return this.callExpression(data, internal,
                                    scope);
                        case 'MemberExpression':
                            return this.memberExpression(data, internal,
                                    scope);
                        case 'Identifier':
                            return this.identifierExpression(data,
                                    internal, scope);
                        case 'Literal':
                            return this.literalExpression(data, internal,
                                    scope);
                        case 'ArrayExpression':
                            return this.arrayExpression(data, internal,
                                    scope);
                        case 'Compound':
                            return this.compoundExpression(data, internal,
                                    scope);
                        case 'ThisExpression':
                            return this.thisExpression(data, internal,
                                    scope);
                        case 'ConditionalExpression':
                            return this.conditionalExpression(data,
                                    internal, scope);
                        default:
                            a.console.storm('error', source,
                                'Unknow type, cannot parse ```' +
                                data.type + '```', 1);
                            return null;
                    }
                }
                return null;
            }

            /*!
             * @private
            */
        };
    }
};;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Simple wrapper for Mousetrap to have unified interface with
        AppStorm.JS system: it does provide multi binding for one key
        (compare to MouseTrap which only allow one key = one function)

************************************************************************ */

/**
 * Simple wrapper for Mousetrap to have unified interface with other part
 * of AppStorm.JS.
 *
 * @constructor
*/
a.keyboard = (function(mt) {
    'use strict';

    var mem = a.mem.getInstance('app.accelerator');

    /**
     * Remove all existing event binded to keyboard.
     *
     * @private
    */
    function clearAllKeyboardEvents() {
        mem.clear();
        mt.reset();
    }

    /**
     * Start to watch a key.
     *
     * @private
     *
     * @param {String} key              The key to bind (with type)
     * @return {Function}               A function to catch key event and
     *                                  dispatch
    */
    function generateKeyBinding(key) {
        return function globalKeyboardBinding(e) {
            var bindArray = mem.get(key) || [],
                i = bindArray.length,
                evtObject = {
                    stopPropagation: function() {
                        if(e.stopPropagation) {
                            e.stopPropagation();
                        } else {
                            e.cancelBubble = true;
                        }
                    },
                    preventDefault: function() {
                        if(e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    },
                    _e: e,
                    event: e,
                    originalEvent: e
                };

            var result = true;
            while(i--) {
                var fn  = bindArray[i].fct,
                    scp = bindArray[i].scope;

                // We don't apply a timeout here to catch return value
                var tmp = fn.call(scp, evtObject);
                if(tmp === false) {
                    result = false;
                }
            }

            return result;
        };
    }

    // No mousetrap support, create dummy empty object
    if(a.isNone(mt)) {
        a.console.storm('error', 'a.keyboard', 'Mousetrap is undefined!', 1);
        var nullFunction = function() {};
        return {
            bind: nullFunction,
            unbind: nullFunction,
            reset: nullFunction,
            clear: nullFunction
        };

    // Create a simple binding between Mousetrap implementation
    // and AppStorm.JS implementation
    } else {
        return {
            /**
             * Register a function for a given keypress command.
             *
             * @param {String} key           The key/keylist to bind
             * @param {Function} fn          The function to bind
             * @param {Object | Null} scope  The scope to apply when binding
             * @param {String | Null} type   The type like 'keydown', 'keyup'..
             *                               default: keypress
            */
            bind: function(key, fn, scope, type) {
                if(!key || !a.isFunction(fn)) {
                    return;
                }

                // Selecting the right type
                type = (a.isString(type) && type) ? type: 'keypress';

                var finalKey = type + '.' + key,
                    bindArray = mem.get(finalKey) || [];

                bindArray.push({
                    fct: fn,
                    scope: scope || mt
                });

                mem.set(finalKey, bindArray);

                // This is the first entry, start to watch the key binding
                if(bindArray.length === 1) {
                    var globalCatcher = generateKeyBinding(finalKey);
                    mt.bind(key, globalCatcher, type);
                }
            },

            /**
             * Remove a binding for a given key.
             *
             * @param {String} key          The key/keylist to unbind
             * @param {Function} fn         The function to unbind
             * @param {String | Null} type  The type like 'keydown', 'keyup'..
             *                              default: keypress
            */
            unbind: function(key, fn, type) {
                if(!a.isFunction(fn)) {
                    return;
                }

                // Selecting the right type
                type = (a.isString(type) && type) ? type: 'keypress';

                var finalKey = type + '.' + key,
                    bindArray = mem.get(finalKey) || [];

                if(bindArray) {
                    var i = bindArray.length;
                    while(i--) {
                        if(bindArray[i].fct === fn) {
                            bindArray.splice(i, 1);
                        }
                    }

                    // There is no binding anymore, we stop binding
                    if(bindArray.length === 0) {
                        mem.remove(finalKey);
                        mt.unbind(key, type);
                    }
                }
            },

            /**
             * Fake a keyboard key press.
             *
             * @param {String | Array} keys The list of keys/single key to
             *                              trigger
             * @param {String} action       The action (like keypress, keyup)
            */
            trigger: function(keys, action) {
                mt.trigger(keys, action || 'keypress');
            },

            /**
             * Reset all bindings.
            */
            reset: clearAllKeyboardEvents,

            /**
             * Reset all bindings.
            */
            clear: clearAllKeyboardEvents

            /*!
             * @private
            */
        };
    }
}(window.Mousetrap));;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Simple synchronizer/chainer for callback list of functions
        synchronizer : Load many functions at same time, when they all finish
                       raise the final callback
        chainer : Load many functions one by one, when last one finish raise
                  the final callback

************************************************************************ */

/**
 * Simple synchronizer/chainer for Array of functions
 *
 * @constructor
*/
a.callback = {};


/**
 * Load many functions at same time,
 * when they all finish raise the final callback.
 *
 * @constructor
*/
a.callback.synchronizer = function(callbacks, success, error) {
    return a.extend(
            a.callback.synchronizerInstance(
                callbacks,
                success,
                error
            ),
            a.eventEmitter('a.callback.synchronizer')
        );
};


/**
 * synchronizerInstance, NEVER use like this,
 * use a.callback.synchronizer instead.
 *
 * @private
*/
a.callback.synchronizerInstance = function(callbacks, success, error) {
    if (!(this instanceof a.callback.synchronizerInstance)) {
        return new a.callback.synchronizerInstance(callbacks, success, error);
    }

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
     * @param {Function} fct                The function to remove from list
    */
    removeCallback: function(fct) {
        this.callbacks = a.without(this.callbacks, fct);
    },

    /**
     * Apply this scope to all callback function.
     *
     * @param {Object} scope                The scope to apply to callbacks
    */
    setScope: function(scope) {
        if(a.isTrueObject(scope)) {
            this.scope = scope;
        }
    },

    /**
     * Get a currently stored data.
     *
     * @param {String} key                  The key linked to value to get data
     * @return {Object | Null}              The value previously stored and
     *                                      content
    */
    getData: function(key) {
        return this.data[key] || null;
    },

    /**
     * Set a new data stored into container.
     *
     * @param {String} key                  The key to retrieve value later
     * @param {Object} value                Any value to store, a null or
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
     * Get if the chain system is currently running or not.
     *
     * @return {Boolean}                    True: currently running
     *                                      False: currently stopped
    */
    isRunning: function() {
        return this.running;
    }

    /*!
     * @private
    */
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
 * callback.
 *
 * @constructor
*/
a.callback.chainer = function(callbacks, success, error) {
    return a.extend(
        a.callback.chainerInstance(
            callbacks,
            success,
            error
        ),
        a.eventEmitter('a.callback.chainer')
    );
};


/**
 * chainerInstance, NEVER use like this, use a.callback.chainer instead.
 *
 * @constructor
 * @private
*/
a.callback.chainerInstance = function(callbacks, success, error) {
    if (!(this instanceof a.callback.chainerInstance)) {
        return new a.callback.chainerInstance(callbacks, success, error);
    }

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
     * @param {Function} fct                The function to remove from list
    */
    removeCallback: function(fct) {
        this.callbacks = a.without(this.callbacks, fct);
        this.queue     = a.without(this.without, fct);
    },

    /**
     * Apply this scope to all callback function.
     *
     * @param {Object} scope                The scope to apply to callbacks
    */
    setScope: function(scope) {
        if(a.isTrueObject(scope)) {
            this.scope = scope;
        }
    },

    /**
     * Get a currently stored data.
     *
     * @param {String} key                  The key linked to value to get data
     * @return {Object | Null}              The value previously stored and
     *                                      content
    */
    getData: function(key) {
        return this.data[key] || null;
    },

    /**
     * Set a new data stored into container.
     *
     * @param {String} key                  The key to retrieve value later
     * @param {Object} value                Any value to store, a null or
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
     * @return {Boolean}                    True: currently running
     *                                      False: currently stopped
    */
    isRunning: function() {
        return this.queue.length ? true : false;
    }

    /*!
     * @private
    */
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
;/*! ***********************************************************************

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
            return true;
        }
        return false;
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
        if(this.support) {
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
        if(this.support) {
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
        return this._store.remove.apply(this._store, arguments);
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
        if(this.support) {
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
            }, null, data);
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
            }, null, data);
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
    a.parameter.addParameterType('temporary', function() {
        return a.storage.temporary.get.apply(a.storage.temporary, arguments);
    });
    a.parameter.addParameterType('memory', function() {
        return a.storage.memory.get.apply(a.storage.memory, arguments);
    });
    a.parameter.addParameterType('persistent', function() {
        return a.storage.persistent.get.apply(a.storage.persistent, arguments);
    });
    a.parameter.addParameterType('cookie', function() {
        return a.storage.cookie.get.apply(a.storage.cookie, arguments);
    });
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
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manage translation

************************************************************************ */

/**
 * A translation system, used to get multi languages support to your app.
 *
 * @constructor
*/
a.translate = a.i18n = (function() {
    'use strict';

    // Internal variable
    var language         = 'en-US',
        dictionnary      = {},
        globalVariable   = {},
        defaultAttribute = 'tr',
        customAttribute  = 'custom-tr',
        eraseAttribute   = 'erase-tr',
        regexVariable    = /\{\{[a-z0-9\-_]+\}\}/gi;

    var storageSupported = (a.storage && a.storage.persistent.support);

    /**
     * Get attribute stored into given element.
     *
     * @private
     *
     * @param {DOMElement} element          The dom object to get
    *                                       attribute from
     * @param {String} search               The attribute name searched
     * @return {String}                     The founded attribute
     *                                      content or empty string
    */
    function getAttr(element, search) {
        return  element.getAttribute(search) || 
                element.getAttribute('a-' + search) ||
                element.getAttribute('data-' + search) ||  '';
    }

    /**
     * Apply to a given element the given translation.
     *
     * @private
     *
     * @param {DOMElement} node             The element to apply
     * @param {String} translation          The translation to apply
    */
    function applyTranslationToElement(node, translation) {
        var customTagAttribute = getAttr(node, customAttribute);

        if(customTagAttribute && customTagAttribute !== '') {
            try {
                node[customTagAttribute] = translation;
            } catch(e) {}
            return;
        }

        // We are on a submit/reset button
        if(node.nodeName == 'INPUT') {
            var type = node.type;
            if(type === 'submit' || type === 'reset' || type === 'button') {
                node.value = translation;
            } else {
                try {
                    node.placeholder = translation;
                } catch(e) {}
            }

        // On fieldset we apply title
        } else if(node.nodeName === 'FIELDSET') {
            node.title = translation;

        // XML translate (only for IE)
        //} else if(!a.isNone(node.text) && document.all ) {
        //    node.text = translation;

        // We are in erase mode, so we erase everything
        } else if(getAttr(node, eraseAttribute) !== '') {
            a.dom.el(node).empty().append(
                document.createTextNode(translation)
            );

        // We do translation system
        } else {
            // We separate textnode and other elements using <tag> element
            var splittedTranslation = translation.split('<tag>'),
                i = 0,
                l = node.childNodes.length,
                m = splittedTranslation.length;

            // 1) We remove text node elements
            for(; i<l; ++i) {
                var el = node.childNodes[i];
                if(el && el.nodeType == 3) {
                    el.parentNode.removeChild(el);
                }
            }

            i = 0;
            a.dom.el(node).children().each(function() {
                var tr   = splittedTranslation[i] || '',
                    text = document.createTextNode(tr);
                i++;

                this.parentNode.insertBefore(text, this);
            });

            // We add latests elements to end
            if(m > i) {
                for(var j=0, k=(m-i); j<k; ++j) {
                    node.appendChild(
                        document.createTextNode(splittedTranslation[i + j])
                    );
                }
            }
        }
    }

    /**
     * Apply translation to a given document/sub-document.
     *
     * @param {DOMElement | Null} root      The root element to 
     *                                      start translate from
    */
    function i18n(root) {
        root = root || document;

        // Selecting elements
        var el   = a.dom.el(root),
            // We search 'tr' and 'data-tr' tag on elements
            srch = defaultAttribute + ',a-' + defaultAttribute + ',data-' +
                    defaultAttribute;

        var currentDictionnary = dictionnary[language] || {};

        var elements = el.attr(srch).getElements();

        // Elements may have also the initial element itself
       if(root.getAttribute && 
            (
                root.getAttribute(defaultAttribute) ||
                root.getAttribute('a-' + defaultAttribute) ||
                root.getAttribute('data-' + defaultAttribute)
            )) {
            elements.push(root);
        }

        // Selecting only elements with tr/a-tr/data-tr html tag setted
        a.dom.el(elements).each(function() {
            // Getting the searched key translate
            var key       = getAttr(this, defaultAttribute),
                attribute = currentDictionnary[key] || '';

            // In case of trouble, we rollback on key elements
            if(attribute === '') {
                attribute = key;
            }

            // use regexVariable to extract variable from string
            var foundVariables = attribute.match(regexVariable);
            // We got something like ['{{a}}', '{{b}}']

            // We remove '{{' and '}}'
            var matches = a.map(foundVariables, function(value) {
                return value.replace('{{', '').replace('}}', '');
            });

            // We create final variables object
            var variables = {},
                i=matches.length;
            while(i--) {
                var variable = matches[i],
                    searchedVariable = defaultAttribute + '-' + variable,
                    value = getAttr(this, searchedVariable);
                if(value) {
                    variables[variable] = value;
                }
            }

            // Now we extract variable, we need to translate
            var translate = get(key, variables, true);

            // Finally we can apply translation
            applyTranslationToElement(this, translate);
        });
    }

    /**
     * Get the current used language.
     *
     * @return {String}                     The language setted by
     *                                      user/system (default is 'en-US')
    */
    function getLanguage() {
        return language;
    }

    /**
     * Set the current used language.
     * Auto-translate current document except if update is set to false.
     *
     * @param {String} lang                 The new language to apply
     * @param {Boolean | Null} update       If we should translate
     *                                      current (default: yes)
    */
    function setLanguage(lang, update) {
        if(!a.isString(lang) || !lang) {
            a.console.storm('error', 'a.translate.setLanguage', 'Setting a ' +
                    'non-string lang, or empty string, as default translate: ',
                            '```' + lang + '```. Cannot proceed', 1);
            a.console.error(lang);
        } else {
            language = lang;

            if(storageSupported) {
                a.storage.persistent.set('app.language', language);
            }

            if(update !== false) {
                i18n();
            }
        }
    }

    /**
     * Get any global variable setted.
     *
     * @param {String} key                  The variable key to search
     * @return {String}                     The variable value or
     *                                      an empty string if not found
    */
    function getGlobalVariable(key) {
        return globalVariable[key] || '';
    }

    /**
     * Set a global variable to be used if possible when translating.
     *
     * @param {String} key                  The variable key to register
     * @param {String} value                The linked value
    */
    function setGlobalVariable(key, value) {
        globalVariable[key] = value;
    }

    /**
     * Register a new translation for given language.
     * After register is done, you can now use data-tr='{{hash}}' inside
     * HTML page to have corresponding translation.
     * Note: you can use a quicker version add(lang, object, update)
     * Where the object will be a key/value translate list for lang.
     *
     * @private
     *
     * @param {String} lang                 The language to
     *                                      register hash/value pair
     * @param {String} hash                 The refered hash to
     *                                      use for translation
     * @param {String} value                The linked translation
     *                                      for given language
     * @param {Boolean | Null} update       If we should fully
     *                                      update or not document
    */
    function add(lang, hash, value, update) {
        if(a.isTrueObject(hash)) {
            a.each(hash, function(val, index) {
                add(lang, index, val, update);
            });
            return;
        }
        if(!dictionnary[lang]) {
            dictionnary[lang] = {};
        }

        dictionnary[lang][hash] = value;

        if(update !== false) {
            i18n();
        }
    }

    /**
     * Set a new translation set for a given language.
     * If dict is set to null, it will erase language.
     *
     * @param {String} lang                 The language to register dict
     * @param {Object} dict                 A key/value pair object for
     *                                      registrating many translation
     *                                      at once
     * @param {Boolean | Null} update       If we should fully
     *                                      update or not document
    */
    function set(lang, dict, update) {
        if(dict === null) {
            delete dictionnary[lang];
        } else {
            for(var i in dict) {
                add(lang, i, dict[i], false);
            }
        }

        if(update !== false) {
            i18n();
        }
    }

    /**
     * Get an existing translation stored.
     *
     * @param {String | Null} key           The searched translation key
     * @param {Object | Null} variables     Any key/value pair variable to pass
     * @param {Boolean | Null} translate    If we should or not translate
     *                                      (including variable) or simply
     *                                      send back entry (default: true)
     *
     * @return {String}                     The translated key or an empty
     *                                      string in case of problem
    */
    function get(key, variables, translate) {
        if(!dictionnary[language]) {
            return key;
        }
        var tr = dictionnary[language][key] || null;

        if(a.isNull(tr)) {
            return key;
        }

        if(translate === false) {
            return tr;
        }

        /**
         * From a hash, try to find the good variable content.
         *
         * @private
         *
         * @param {String} hash             The hash to find in variable list
         * @return {String}                 The variable content or empty
         *                                  string in case of not found
        */
        function hashToVariable(hash) {
            var lvar = variables,
                gvar = globalVariable,
                // First local var, and second global var check
                avar = [lvar, gvar];

            for(var i=0; i<2; ++i) {
                for(var j in avar[i]) {
                    if(hash === '{{' + j + '}}') {
                        return avar[i][j];
                    }
                }
            }

            // Nothing found
            return '';
        }

        var trVariables = tr.match(regexVariable) || [];

        for(var i=0, l=trVariables.length; i<l; ++i) {
            var el = trVariables[i];
            tr = tr.replace(el, hashToVariable(el));
        }

        // If it has still some unknow variable, we remove them...
        return tr.replace(regexVariable, '');
    }

    /**
     * Get the full stored dictionnary.
     *
     * @param {String | Null} lang          If lang is setted, retrieve only
     *                                      the given language. In other cases
     *                                      retrieve all dictionnaries.
    */
    function getDictionnary(lang) {
        if(lang) {
            return dictionnary[lang] || {};
        }
        return dictionnary;
    }


    /**
     * Erase dictionnary.
     *
     * @private
    */
    function clearDictionnary() {
        dictionnary = {};
    }



    // If storage is enabled, we try to get the stored language in the store
    if(storageSupported) {
        var storedLanguage = a.storage.persistent.get('app.language');

        // If language do exist and is setted
        if(a.isString(storedLanguage) && storedLanguage.length > 0) {
            language = storedLanguage;
            i18n();
        }
    }



    // Final object
    return {
        getLanguage: getLanguage,

        /**
         * Alias getLanguage.
         *
         * @see getLanguage
        */
        getCurrent:  getLanguage,

        setLanguage: setLanguage,

        /**
         * Alias setLanguage.
         *
         * @see setLanguage
        */
        setCurrent:  setLanguage,

        /**
         * Alias i18n.
         *
         * @see i18n
        */
        translate:   i18n,
        i18n:        i18n,

        getDictionnary:    getDictionnary,

        getGlobalVariable: getGlobalVariable,
        setGlobalVariable: setGlobalVariable,

        /**
         * Alias setGlobalVariable.
         *
         * @see setGlobalVariable
        */
        addGlobalVariable: setGlobalVariable,

        add:            add,

        /**
         * Alias add.
         *
         * @see add
        */
        addTranslation: add,

        get:            get,

        /**
         * Alias get.
         *
         * @see get
        */
        getTranslation: get,

        set:            set,

        /**
         * Alias set.
         *
         * @see set
        */
        setTranslation: set,

        /**
         * Erase dictionnary.
        */
        clear: clearDictionnary
    };
})();



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    Handlebars.registerHelper('tr', function() {
        return new Handlebars.SafeString(
                a.translate.get.apply(null, arguments));
    });
    Handlebars.registerHelper('translate', function(value) {
        return new Handlebars.SafeString(
                a.translate.get.apply(null, arguments));
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manipulate HTML form by with a simple system.

************************************************************************ */

/**
 * Manipulate HTML form by with a simple system.
 *
 * @constructor
*/
a.form = (function() {
    'use strict';

    // HTML/HTML5 input type allowed 
    var typePatternList  = ['text', 'search', 'url',
                                    'tel', 'email', 'password'],
        minMaxStepList   = ['number', 'range', 'date',
                                    'datetime', 'datetime-local',
                                    'month', 'time', 'week'],
        typeRequiredList = typePatternList.concat(minMaxStepList,
                                    ['number', 'checkbox', 'radio', 'file']),
        typeMultipleList = ['email', 'file'],
        typeList = minMaxStepList.concat(typePatternList,
                                    ['color', 'checkbox', 'file',
                                    'hidden', 'radio']);

    /**
     * Get the field key from given input.
     *
     * @private
     *
     * @param {DOMElement} e                The element o search value inside
     * @return {String}                     The value found
    */
    function getFieldKey(e) {
        var el   = a.dom.el(e),
            name = el.data('name');

        if(a.isNone(name) || name === '') {
            name = el.attribute('name');

            // Search the good attribute in case of problem
            if(a.isNone(name) || name === '') {
                name = el.attribute('id');

                // Should never appear... But we provide it in case of trouble
                if(a.isNone(name) || name === '') {
                    name = el.attribute('class');
                }
            }
        }

        return name;
    }

    /**
     * Get the field value for given input.
     *
     * @private
     *
     * @param {DOMElement} e                The element to search value inside
     * @return {String}                     The value found
    */
    function getFieldValue(e) {
        var type    = e.type || '',
            tagName = e.tagName.toLowerCase();

        if(tagName === 'input' || tagName === 'textarea') {
            return (type === 'checkbox') ? e.checked : e.value;
        } else if(tagName === 'select') {
            if(e.options[e.selectedIndex]) {
                return e.options[e.selectedIndex].value;
            }
            return null;
        }
    }

    /**
     * From a given dom, get the list of revelant elements inside.
     *
     * @private
     *
     * @param {a.dom} dom                   The dom element to search inside
     * @return {Array}                      The element list inside DOM
    */
    function getFieldList(dom) {
        // dom must be a a.dom element
        var elements = dom.tag(['input', 'textarea', 'select']).getElements();

        // We remove input who are not listed in typeList
        // LIKE: submit/reset should not appear in this list
        var i = elements.length;
        while(i--) {
            var el = elements[i];
            if(el.type &&
                    (   el.type == 'submit' ||
                        el.type == 'button' ||
                        el.type == 'reset' ||
                        el.type == 'image'
                    ) ) {
                elements.splice(i, 1);
            }
        }

        // Now filtering is done, we can send back all elements
        return elements;
    }

    /**
     * Raise an error on input.
     *
     * @private
     *
     * @param {DOMElement} el               The element where comes from error
     * @param {String} id                   The element id/name/class
     * @param {String | Null} name          The name (like min, pattern, ...)
     *                                      which is not valid, can be null
     * @param {String | Null} value         The current input value
     *                                      (can be used as parameter)
     * @return {Object}                     A validate object with everything
     *                                      inside if possible
    */
    function validateError(el, id, name, value) {
        // First : we need to get error element and translate if possible
        var error = '';

        // Retrieve error tag
        if(!a.isNone(name) && name !== '') {
            error = el['data-error-' + name] || null;
        }
        if(a.isNone(error) || error === '') {
            error = el['data-error'] || null;
        }

        if(a.isNone(error) || error === '') {
            var errorMessage  = 'A data-error tag has not been setted for id ';
                errorMessage += '```' + id + '``` with value ```' +value+'```';
                errorMessage += '.Cannot proceed error message...';
            a.console.storm('warn', 'a.form', errorMessage, 3);
        }

        // Translate error if possible
        error = a.translate.get(error, {
            name:  name,
            value: value
        });

        // Returning an object with all needed data inside
        return {
            el:    el,
            id:    id,
            error: error
        };
    }


    /**
     * We try to grab the model instance, or a new model instance if it's not
     * an existing model instance.
     *
     * @private
     *
     * @param {String} idOrModelName            From HTML side, the id or the
     *                                          model name to use for this form
     * @return {a.modelInstance}                A new or existing instance
    */
    function getModel(idOrModelName) {
        var model = a.model.manager.get(idOrModelName);
        if(model) {
            return model;
        } else {
            return a.model.pooler.createTemporaryInstance(idOrModelName);
        }
    }

    return {
        /**
         * Allow to skip HTML5 form-novalidate tag or not (boolean).
         * This help to avoid browser HTML5 validation to keep only AppStorm
         * one.
         *
         * @property skipNoValidate
         * @type Boolean
         * @default false
        */
        skipNoValidate: false,

        /**
         * Get the list of element stored into given form.
         *
         * @param {Object} dom              The dom element to search inside
         *                                  - It has to be a valid a.dom.el
         *                                  input
         * @return {Object}                 The list of input tags existing
        */
        get: function(dom) {
            dom = a.dom.el(dom);
            var inputList  = getFieldList(dom),
                outputList = {};

            var i = inputList.length;
            while(i--) {
                var input = inputList[i];

                var name  = a.trim(getFieldKey(input)),
                    value = getFieldValue(input);

                // We don't continue if we don't find any data on element
                if(a.isNone(name) || !name) {
                    continue;
                }

                var parse = false;

                // We got a special case with input radio type
                if(!a.isNone(input) && input.type === 'radio') {
                    // Only checked one are validated
                    if(input.checked) {
                        parse = true;
                    }
                } else if(!a.isNone(input) && input.type === 'checkbox') {
                    parse = false;
                    outputList[name] = (input.checked) ? true: false;
                } else {
                    parse = true;
                }

                if(parse) {
                    // Name is a multiple value one (using [] at the end)
                    if(name.substr(name.length - 2) === '[]') {
                        if(!a.isArray(outputList[name])) {
                            outputList[name] = [];
                        }
                        value = (value) ? value: null;
                        outputList[name].push(value);
                    } else {
                       outputList[name] = (value) ? value: null;
                   }
                }
            }

            return outputList;
        },

        /**
         * Validate a form.
         * Note : multiple tester (email, file) is not supported
         * Note : date field (date, datetime, datetime-local,
         * month, time, week) are not supported
         * Note : tel/file field are not supported
         *
         * @method validate
         *
         * @param {Object} dom              The dom element to search inside
         *                                  - It has to be a valid a.dom.el
         *                                  input
         * @return {Array}                  An array with all errors listed
         *                                  inside, an empty array if there
         *                                  is no error to show
        */
        validate: function(dom) {
            dom = a.dom.el(dom);
            // On form tag, the "novalidate" allow to not validate a form
            if(this.skipNoValidate === false &&
                    !a.isNone(dom.get(0).novalidate)) {
                return [];
            }

            var inputList    = getFieldList(dom),
                // Store all errors appearing
                errorList    = [],
                allowedTypes = ['number', 'range', 'text', 'search',
                                        'url', 'email', 'password',
                                        'color', 'checkbox',
                                        'hidden', 'radio'],
                // Pretty basic url tester
                urlTester    = new RegExp(
                    '^[a-z]{2,}:\\/\\/([a-z0-9\\/\\.\\-_~+;:&=]{2,})$', 'gi'),
                // Pretty basic email tester
                emailTester  = new RegExp('^.{2,}@.*\\.[a-z0-9]{2,}$', 'gi'),
                colorTester  = new RegExp('^#([a-f]{3}|[a-f]{6})$', 'gi');

            // required : at least one char
            //    (text, search, url, tel, email, password, date, datetime,
            //    datetime-local, month, time, week, number, checkbox,
            //    radio, file)
            // pattern : a regex to test (Use title like a helper),
            //    (text, search, url, tel, email, password)
            //    multiple : the user is allowed to enter more than one element
            //    (only for email, file)
            // min/max : min/max value
            //    (number, range, date, datetime, datetime-local,
            //    month, time, week)
            // step : multiplier
            //    (number, range, date, datetime, datetime-local,
            //    month, time, week)
            var i = inputList.length;
            while(i--) {
                // Does only work for input tags
                var el      = inputList[i],
                    tagName = el.tagName.toLowerCase();

                // form novalidate : we must not validate
                // this element (including all select)
                if(tagName == 'select' || !a.isNone(el.novalidate)) {
                    continue;
                }

                var type     = el.type,
                    name    = getFieldKey(el),
                    value    = el.value,

                    required = el.required,
                    pattern  = el.pattern,
                    multiple = el.multiple,
                    min      = el.min,
                    max      = el.max,
                    step     = el.step;

                // Double check float data
                min  = (a.isNone(min) || min === '')   ? null :
                        parseFloat(min);
                max  = (a.isNone(max) || max === '')   ? null :
                        parseFloat(max);
                step = (a.isNone(step) || step === '') ? null :
                        parseFloat(step);

                // Check input type does existing in allowed type list
                if(tagName == 'input' && !a.contains(allowedTypes, type) &&
                        !a.isNone(type)) {
                    var errorSupport =  'Type ```' + type;
                        errorSupport += '``` for input ```' + name + '```';
                        errorSupport += 'is not recognized and/or supported';
                    a.console.storm('warn', 'a.form.validate', errorSupport,3);
                    continue;
                }

                // Now checking type
                if( (type == 'number' || type == 'range') &&
                        !a.isNumber(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }
                if(type == 'url' && !urlTester.test(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }
                if(type == 'email' && !emailTester.test(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }
                if(type == 'color' && !colorTester.test(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }

                // Required test
                if( required !== null && a.contains(typeRequiredList, type) &&
                        (value === '' || a.isNone(value)) ) {
                    errorList.push(validateError(el, name, 'required', value));
                    continue;
                }

                // Pattern test
                if( pattern !== null && (tagName === "textarea" || 
                        (a.contains(typePatternList, type)) || a.isNone(type))
                ) {
                    var reg = new RegExp(pattern);
                    if(!reg.test(value)) {
                        errorList.push(validateError(
                                            el, name, 'pattern', value));
                        continue;
                    }
                }

                // Min/max/step test
                if( (min !== null || max !== null || step !== null) &&
                        a.contains(minMaxStepList, type) ) {

                    var pval = parseFloat(value);
                    if( min !== null && pval < min ) {
                        errorList.push(validateError(el, name, 'min', value));
                        continue;
                    }
                    if( max !== null && pval > max ) {
                        errorList.push(validateError(el, name, 'max', value));
                        continue;
                    }
                    if( step !== null && pval % step !== 0 ) {
                        errorList.push(validateError(el, name, 'step', value));
                        continue;
                    }
                }
            }

            return errorList;
        },

        /**
         * Validate and get the form content.
         *
         * @param {Object} dom              The dom element to search inside
         *                                  - It has to be a valid a.dom.el
         *                                  input
         * @return {Object}                 An object with error (boolean),
         *                                  errorList (Array)
         *                                  and contentList (Array)
        */
        validateAndGet: function(dom) {
            var obj = {
                errorList   : this.validate(dom),
                error       : false,
                contentList : this.get(dom)
            };
            if(obj.errorList.length > 0) {
                obj.error = true;
            }
            return obj;
        }

        /*!
         * @private
        */
    };
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        State main manager.

************************************************************************ */

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
        if(!state) {
            a.console.storm('error', 'An error has occurs, with no ' +
                    'state linked to it... Below the stack trace', 1);
            a.console.error(a.getStackTrace());
        }
        var id = (state) ? state.id: null;
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
            state  = a.state._errorState,
            id = (state) ? state.id : null;

        if(!a.isNone(resource)) {
            report.resource = resource;
        }
        if(!a.isNone(status)) {
            report.status = status;
        }

        // Get the error
        var raiseError   = getError(state, status),
            messageError = 'An error occurs, but ' +
                           'no error function/hash inside the state '+
                           'can handle it. Please ' +
                           'check your error handler for the state ```' + id +
                           '```, HTTP status code ```' + status + '```, and ' +
                           'resource ```' + resource + '```';

        // Raising global message
        // TODO: make state able to send requests, and make THIS as state
        // this.dispatch('error', report);
        a.message.dispatch('a.state.error', report);

        if(raiseError) {
            if(a.isString(raiseError)) {
                window.location.href = '#' + raiseError;

            } else if(a.isFunction(raiseError)) {
                raiseError(id, resource, status);

            // No handler to catch error, we raise an error on console
            } else {
                a.console.storm('error', 'a.state', messageError, 1);
            }

        // Nothing exist, we alert user
        } else {
            a.console.storm('error', 'a.state', messageError, 1);
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
        var callbacks = a.state.chain.getWithTest(loadOrUnload, state),
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

            if(state._storm.hash && a.isArray(state._storm.hash)) {
                var parents = [];
                for(var j=0, l=state._storm.hash.length; j<l; ++j) {
                    var store = state._storm.hash[j];

                    if(store.isRegexHash) {
                        store.regex.lastIndex=0;
                        if(store.regex.test(hash)) {
                            parents = foundParentState(state);
                            // We stop, we found match
                            break;
                        }
                    // We are in non-regex mode
                    // Note: DO NOT PUT ELSE IF here
                    } else {
                        if(store.hash == hash) {
                            parents = foundParentState(state);
                            // We stop, we found match
                            break;
                        }
                    }
                }

                // Test ACL at the end
                if(testAcl(parents)) {
                    result.push(parents); 
                } else {
                    a.console.storm('log', 'a.state.foundHashState', 
                            'Acl have been refused for state ```' + state.id +
                            '```', 3);
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
     * Remove persistent state from unloading chain
     *
     * @method removePersistentState
     * @private
     *
     * @param states {Array}                Array of elements to filter
     * @return {Array}                      The persistent states removed
    */
    function removePersistentState(states) {
        var i = states.length;
        while(i--) {
            var state = states[i];
            if(
                ('persistent' in state && state.persistent === true)
                ||
                ('persist' in state && state.persist === true)
            ) {
                states.splice(i, 1);
            }
        }
        return states;
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

        // Removing persistent states from unloading chain
        unloadingIntersection = removePersistentState(unloadingIntersection);
        // Perform the unload/load process
        setTimeout(function() {
            performUnloadChanges(unloadingIntersection, function() {
                setTimeout(function() {
                    performLoadChanges(loadingIntersection, function() {
                        // We clear inject, and raise event
                        a.state._inject = {};
                        a.message.dispatch('a.state.end', data);
                    });
                }, 0);
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
    a.acl.bind('change', function(role) {
        performAclChange(role);
        // For a unknow reason
        // this helps to refresh hash path finding...
        // (prevent a bug)
        // Seems to be resolved...
        /*performHashChange({
            value: a.hash.getHash(),
            old: a.hash.getPreviousHash()
        });*/
    }, null, false, false);









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
            parent: state.parent || null,
            options: state.options || null,
            data: state.data || {},
            flash: state.flash || null,
            level: 0,
            acl: null
        };

        // We create the flash element (if it's not already a function)
        state.flash = a.scope(function(message) {
            // We go for an inside flash
            if(a.isString(this._storm.flash) && this._storm.flash) {
                var entry = this.entry || this.target || this.el || this.dom ||
                        null;

                if(a.isFunction(entry)) {
                    entry = entry.call(this);
                }

                if(entry && a.isString(entry)) {
                    a.dom.query(this._storm.flash, entry).html(message);
                } else {
                    a.dom.query(this._storm.flash).html(message);
                }

            // User want a deeper control
            } else if(a.isFunction(this._storm.flash)) {
                this._storm.flash.apply(this, arguments);

            // We go up one level to parent
            } else if(this.parent && a.isFunction(this.parent.flash)) {
                this.parent.flash(message);

            // No way to handle it
            } else {
                a.console.storm('error', 'a.state', 'The state ```' + this.id +
                        '``` was unable to proceed flash message ```' +
                        this._storm.flash + '```', 1);
            }
        }, state);

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
                a.console.storm('error', 'a.state.add', 'Unable to find ' +
                        'the parent ```' + state.parent + '``` for state ```' +
                        state.id + '```', 1);
            }
        } else {
            state.parent = null;
        }

        // We convert into array of values
        if(state.hash && a.isString(state.hash)) {
            state.hash = [state.hash];
        }

        // Every hash are parsed and checked
        if(state.hash && a.isArray(state.hash)) {
            state._storm.hash = [];
            for(var i=0, l=state.hash.length; i<l; ++i) {
                var hash = state.hash[i];
                // First of all: we get the protocol loader
                var protocol = a.state.protocol.tester(hash);

                // The protocol exist, we can parse it
                if(protocol) {
                    // We get the related function extracter
                    var type = a.state.protocol.get(protocol);
                    // The system exist, we can apply transformation
                    if(a.isTrueObject(type)) {
                        // We apply converter to get the final good hash
                        hash = type.fn(state, i);
                    }
                }

                var store = {
                    isRegexHash: false,
                    regex: null,
                    hash: a.parameter.convert(hash)
                };

                if(hash.indexOf('{{') >= 0 && hash.indexOf('}}') >= 0) {
                    store.isRegexHash = true;
                }

                // Making it strict catch for regex one
                if(store.isRegexHash) {
                    store.hash = '^' + store.hash + '$';
                    store.regex = new RegExp(store.hash, 'g');
                }

                state._storm.hash.push(store);
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
            // We remove the parent to avoid recursive clone of parents too...
            var parent = state.parent;
            delete state.parent;
            var clone = a.deepClone(state);
            clone.parent = state.parent = parent;
            this.add(a.extend(clone, extendState));
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
        this._errorState = null;
        this._inject = {};
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
     * Reload a state
     *
     * @method reload
     *
     * @param id {String}                   The state id to reload
    */
    this.reload = function(id) {
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
        // Perform the unload/load process
            setTimeout(function() {
                performUnloadChanges(difference, function() {
                    setTimeout(function() {
                        performLoadChanges(difference);
                    }, 0);
                });
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
     * Mostly for testing purpose, but this return the currently
     * loaded states (all of them).
     *
     * @param {String | Null} id            The specific state id you want
     *                                      to retrieve
     * @return {Array}                      The array with all loaded states.
    */
    this.loaded = function(id) {
        if (id) {
            var results = [];
            for (var i = 0, l = loaded.length; i < l; ++i) {
                if (loaded[i].id === id) {
                    results.push(loaded[i]);
                }
            }
            return results;
        }
        return loaded;
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
     * Inject an object for next state.
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
Handlebars.registerHelper('inject', function(key) {
    return new Handlebars.SafeString(a.state._inject[key] || null);
});

/*
------------------------------
  PARAMETERS HELPERS
------------------------------
*/
a.parameter.addParameterType('inject',  function(key) {
    return a.state._inject[key] || null;
});;/* ************************************************************************

    License: MIT Licence

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
     * @param success {Function | null}     The success function to use before
     *                                      leaving loading data
     * @param error {Function | null}       The error handler to use in case
     *                                      of any error
    */
    function generateDataLoader(state, name, url, options, success, error) {
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

                var request = a.ajax(options,
                // Success
                function(content) {
                    if(a.isNone(name)) {
                        state.data = content;
                    } else {
                        state.data[name] = content;
                    }

                    if(a.isFunction(success)) {
                        success.call(state, content, chain);
                    } else {
                        chain.next();
                    }

                // Error
                }, function(url, status) {
                    if(a.isFunction(error)) {
                        error.call(state, url, status, chain);
                    } else {
                        chain.error.apply(state, arguments);
                    }
                });

                // Starting and waiting reply
                request.send();

            // Parsed is probably null, it means the content is not ready to show
            } else {
                a.console.storm('error', 'a.state.chain', 'Request cannot ' +
                        'be proceed, url parsing have fail. It can be ' +
                        ' related to some missing parameters. Request: ```' +
                        name + '```, state: ```' + state.id + '```', 2);
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
                options: a.clone(this.options),
                error:   null,
                success: null
            };
        }

        // The data is not a single string but rather a multi load system
        if(a.isTrueObject(this.data)) {
            // We are in single-data mode
            if('url' in this.data && 'options' in this.data) {
                sync.addCallback(generateDataLoader(this, null, this.data.url,
                                    this.data.options, null, null));

            // We are in multi-data mode
            } else {
                a.each(this.data, function(data, name) {
                    if(a.isString(data)) {
                        data = {
                            url:     data,
                            options: this.options,
                            error:   null,
                            success: null
                        };
                    }

                    // Little convertion
                    data.error   = (a.isFunction(data.error)) ?
                                                    data.error: null;
                    data.success = (a.isFunction(data.success)) ?
                                                    data.success: null;

                    sync.addCallback(generateDataLoader(this, name, data.url,
                                    data.options, data.success, data.error));
                }, this);

                // We put back data into element
                if(differenceData) {
                    a.each(differenceData, function(data, name) {
                        this.data[name] = data;
                    }, this);
                }
            }
        } else if(a.isFunction(this.data)) {
            sync.addCallback(generateDataLoader(this, null, this.data, null,
                                                        null, null));
        } else {
            a.console.storm('error', 'a.state.chain.include', 'The state ```' +
                    this.id + '``` is not valid (data is not valid)', 1);
        }

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
;/*! ***********************************************************************

    License: MIT Licence

    Description:
        State type to manage custom system type.

************************************************************************ */

/**
 * State type to manage custom system type.
 * A type can be for example 'replace', 'append', it's used between transition
 * during html loading or unloading of a given state.
 *
 * @constructor
*/
a.state.type = {
    /**
     * The store.
     *
     * @property _store
     * @private
    */
    _store: a.mem.getInstance('app.state.type'),

    /**
     * Add a new type to state system.
     * Type allow you to control how the html will be loaded to system.
     *
     * @param {String} name                 The name to use inside state
     * @param {Function} input              The function to call when name is
     *                                      found on a loading state.
     *                                      The first param given to this
     *                                      function will be entry point
     *                                      (a.dom), then the html, and finally
     *                                      if async the chain object.
     *                                      This is the function to call on
     *                                      input
     * @param {Function} output             The function to call on output
     * @param {Boolean} async               Indicate if the type should be run
     *                                      as an async or not. If the async
     *                                      is set to true, the last parameter
     *                                      will be the chain objet to continue
     *                                      like in default state.
    */
    add: function(name, input, output, async) {
        this._store.set(name, {
            input:  input,
            output: output,
            async:  async
        });
    },

    /**
     * Remove a type from existing type elements.
     *
     * @param {String} name                 The type name to remove
    */
    remove: function(name) {
        this._store.remove(name);
    },

    /**
     * Get a type from existing type list.
     *
     * @param {String} name                 The name to get
     * @return {Object | Function | Null}   The founded elements
    */
    get: function(name) {
        return this._store.get(name);
    },

    /**
     * Print the full list of type currently available.
     *
     * @return {Object}                     The list of types found
    */
    list: function() {
        return this._store.list();
    }

    /*!
     * @private
    */
};
;/* ************************************************************************

    License: MIT Licence

    Description:
        State protocol management, allow to define custom hashtag response/
        treatment

************************************************************************ */

/**
 * State protocol management, allow to define custom hashtag response/
 * treatment
 *
 * @class protocol
 * @static
 * @namespace a.state
*/
a.state.protocol = new function() {
    var mem = a.mem.getInstance('app.state.protocol');

    /**
     * Add a new function as protocol available one.
     *
     * @method add
     *
     * @param name {String}                 The protocol name, like uri will
     *                                      produce uri:// protocol into your
     *                                      state
     * @param fct {Function}                The function to use when such a
     *                                      protocol is found
     * @param isDefault {Boolean | null}    If it's the default (no need to 
     *                                      set uri:// in front) or not.
     *                                      Note: only one default can be set
     *                                      And it's by default url (already
     *                                      setted)
    */
    this.add = function(name, fct, isDefault) {
        isDefault = (isDefault === true) ? true : false;

        mem.set(name, {
            isDefault: isDefault,
            fn:        fct
        });
    };

    /**
     * Remove from store the given protocol
     *
     * @method remove
     *
     * @param name {String}                 The protocol name to delete
    */
    this.remove = function(name) {
        mem.remove(name);
    };

    /**
     * Get from store the given protocol
     *
     * @method get
     *
     * @param name {String}                 The protocol to get
    */
    this.get = function(name) {
        return mem.get(name);
    };

    /**
     * Test the given hash and found the related protocol
     *
     * @method tester
     *
     * @param hash {String}                 The hashtag to test
     * @return {String}                     The name of the protocol found who
     *                                      fit to the hashtag. You can then
     *                                      use that name to get the full
     *                                      protocol function using get of this
     *                                      object
    */
    this.tester = function(hash) {
        if(a.isNone(hash)) {
            return null;
        }

        var protocols = mem.list(),
            isDefaultFirstName = null;

        for(var name in protocols) {
            // This is the protocol we were searching for
            if(hash.indexOf(name) === 0) {
                return name;

            // This is not the protocol, but at least the first one
            // who is default behavior
            } else if(a.isNull(isDefaultFirstName)
                        && protocols[name].isDefault) {

                isDefaultFirstName = name;
            }
        }

        // If we got a prototype of request 'like uri://', but the selected
        // name is not ok, we send back null instead
        var type = /^([a-zA-Z0-9\-\_]*):\/\//i,
            res  = type.exec(hash);

        // We found a typed prototype
        if(res && res[1] !== isDefaultFirstName) {
            return null;
        }

        return isDefaultFirstName;
    };
};


(function() {
    // Define the most basic case, using direct hashtag
    a.state.protocol.add('url', function(state, index) {
        var hash = (a.isArray(state.hash)) ? state.hash[index]: null;
        if(hash && hash.indexOf('url://') === 0) {
            return hash.substring(6);
        }
        return hash;
    }, true);

    // Define a parent related url where you get use of parent to define
    // the given hashtag final url...
    a.state.protocol.add('uri', function(state, index) {
        var hash = (a.isArray(state.hash)) ? state.hash[index]: '';
        if(hash && hash.indexOf('uri://') === 0) {
            hash = hash.substring(6);
        }

        var search = state.parent;

        while(!a.isNone(search)) {
            // Search is defined, we use it !
            if(search.hash) {
                var found = false;
                for(var i=0, l=search.hash.length; i<l; ++i) {
                    var parentType = a.state.protocol.tester(search.hash[i]);

                    // Parent type is defined, we extract data from
                    if(!a.isNull(parentType)) {
                        var type = a.state.protocol.get(parentType),
                            result = type.fn(search, i);

                        hash = result + '/' + hash;

                        // In any case, we stop as calling type.fn will already
                        // do parents of parents...
                        found = true;
                        break;
                    }
                }

                // Double exit
                if(found) {
                    break;
                }
            }

            // Still no hash to show, we continue...
            search = search.parent;
        }

        return hash;
    }, false);
})();;/**
 * Create a binding system between HTML dom elements.
 * This plugin aims to run better on browser who supports 'input' HTML5 event.
 * But it still run on older browser, just slower...
 *
 * Basic usage:
 *   <a data-bind="helloworld"></a>
 *   <input type="text" data-bind="helloworld" />
 *
 *   If one of them get a different value, the other get the new value automatically
 *
 *   You can also use quicker binding:
 *   <a a-bind="helloworld"></a>
 *
 *   Or even shorter:
 *   <a bind="helloworld"></a>
*/


a.binding = (function() {
    // Searched string/elements type
    var findSearch  = ['data-bind', 'a-bind', 'bind'],
        inputSearch = ['INPUT', 'TEXTAREA'],
    // Converter function storage
        converters  = {};

    /**
     * Get attribute value for given elements
     *
     * @method getBindingName
     * @private
     *
     * @param element {DOMElement}          The element to get attribute from
     * @param search {String}               The searched attribute
     * @return {String | null}              The attribute content found
    */
    function getBindingName(element, search) {
        search = search || findSearch;
        var value = a.dom.el(element).attribute(search);

        if(a.isString(value)) {
            return value;
        } else if(value.length > 0) {
            return value[0];
        }

        return null;
    };

    /**
     * Get The stored element value
     *
     * @method getElementValue
     * @private
     *
     * @param element {DOMElement}          The element to search inside
     * @return {String}                     The InnerHTML/value inside
    */
    function getElementValue(element) {
        if(a.contains(inputSearch, element.nodeName)) {
            return element.value;
        } else {
            var content = '';
            for(var i=0, l=element.childNodes.length; i<l; ++i) {
                var node = element.childNodes[i];
                if(node.nodeType == 3) {
                    content += node.nodeValue;
                }
            }
            return content;
        }
    };

    /**
     * Perform change on other elements
     *
     * @method applyChange
     * @private
     *
     * @param name {String}                 The binding name
     * @param value {String}                The binding value to apply
    */
    function applyChange(el, name, value) {
        // Updating data
        el = this || el;
        name = getBindingName(el) || name;
        value = value || el.value;

        // Searching data-bind elements tags
        a.dom.attr(findSearch, name).each(function(val) {
            if(el && this === el) {
                return;
            }

            if(a.contains(inputSearch, this.nodeName)) {
                this.value = val;
            } else {
                this.innerHTML = val;
            }
        }, value);


        /*var innerSearch = [
                'data-inner-bind-' + name,
                'a-inner-bind-' + name,
                'inner-bind-' + name
            ];

        // From innerSearch, create the start/stop elements
        var innerStart = innerSearch.slice(),
            innerStop  = innerSearch.slice(),
            x = innerStart.length,
            y = innerStop.length;

        while(x--) {
            innerStart[x] += '-start';
        }
        while(y--) {
            innerStart[y] += '-stop';
        }

        a.message.dispatch('a.binding', {
            name: name,
            value: value
        });*/

        // Searching inner-bind-{{name}} elements tags
        /*a.dom.attr(innerStart).each(function(val) {
            if(el && this === el) {
                return;
            }

            var current = getElementValue(this),
                start   = a.dom.el(this).attribute(innerStart),
                stop    = a.dom.el(this).attribute(innerStop) || 0;

            // We skip previous value, and setup new value
            current = current.substr(0, start)
                        + val + current.substr(start + stop);

            // TODO: all other values linked should have their
            // start value updated if above the current start position
            // (has we change the length of string) !
        }, value);*/
        /*a.dom.attr(innerStart).each(function(val) {
            // TODO: take advantages of functionnalities here
        }, value);*/
    };

    /**
     * Tiny binder between the applyChange function and event related
     *
     * @method eventApplyChange
     * @private
     *
     * @param evt {Object}                  The input event
    */
    function eventApplyChange(evt) {
        applyChange.call(evt.target);
    };

    /**
     * Search for sub elements linked by binding to another element
     *
     * @method detectBinding
     * @private
     *
     * @param root {DOMElement}             The root element to start searching
     *                                      from.
     * @return {Array}                      The HTML elements who are emitting
    */
    function binding(root) {
        var elements = [];

        // We get elements subject to binding
        a.dom.el(root || document).attr(findSearch).each(function() {
            if(!a.contains(inputSearch, this.nodeName)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).bind('change input keydown', eventApplyChange);

            // Start first time
            applyChange.call(this);
        });

        return elements;
    };

    /**
     * Unbind previously binded elements
     *
     * @method unbinding
     * @private
     *
     * @param root {DOMElement}             The root element to start searching
     *                                      from.
     * @return {Array}                      The HTML elements who are emitting
    */
    function unbinding(root) {
        var elements = [];

        // We get elements subject to binding
        a.dom.el(root || document).attr(findSearch).each(function() {
            if(!a.contains(inputSearch, this.nodeName)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).unbind('change input keydown', eventApplyChange);
        });

        return elements;
    };

    /**
     * Find elements who include inner data to register,
     * and mark them for later use.
     *
     * @method findInnerDataElement
     * @private
     *
     * @param root {DOMElement | null}      The root element to start search
     *                                      from
    */
    function findInnerDataElement(root) {
        root = root || document;

        var reg = /\{\{\s*(\w+)\s*\}\}/gi;

        // Search in all sub elements of root if they need to be
        // marked as inner data
        a.dom.el(root).all().each(function() {
            // Erasing previous reg test
            reg.lastIndex = 0;

            // Selecting HTML content
            var value = getElementValue(this);

            // Searching TAG inside value
            if(
                    !value ||
                    value.indexOf('{{') == -1 ||
                    value.indexOf('}}') == -1 ||
                    !reg.test(value)) {
                return;
            }

            // To remember position of all elements
            var matches = value.match(reg);
            reg.lastIndex = 0;

            // We remove '{{' and '}}' and replace them by invisible char
            // We also remove inside {{...}} because we don't need it
            // (as matches already keep position of every elements)
            console.log(value.replace(reg, '\u200C\u200c\u200C\u200c'));

            // TODO: we add attribute tag to retrieve them
            // TODO: create a fct to insert tag into element at specified position

            /*console.log(this);

            // For every entry found in the string
            // We create a linked marker
            var m     = null,
                found = false;

            while(m = reg.exec(value)) {
                var start   = m.index,
                    bracket = m[0],
                    name    = a.trim(m[1]),
                    base    = 'data-inner-bind-' + name;

                found = true;

                // Set tags as follow for every entries: name & start pos
                this.setAttribute(
                    base + '-start', '' + start
                );
                this.setAttribute(
                    base + '-stop', '0'
                );

                // We update the value to remove old position marker
                value = value.replace(bracket, '');
            }

            // If we found something, it means we have to update content
            // with removed tag found
            if(found) {
                setElementValue(this, value);
            }*/
        });
    };

    return {
        /**
         * Search binding into given dom object, and try to find bindings
         * to use.
         *
         * @method bind
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who recieve
         *                                  event binding
        */
        bind: function(dom) {
            return binding(dom);
        },

        /**
         * From a given start point, unbind sub children to binding system.
         *
         * @method unbind
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who loose
         *                                  event binding
        */
        unbind: function(dom) {
            return unbinding(dom);
        },

        /**
         * Manually call a binding refresh.
         *
         * @method manual
         *
         * @param name {String}             The binding name to refresh
         * @param value {String}            The value to apply
        */
        manual: function(name, value) {
            applyChange(null, name, value);
        },

        /**
         * Refresh everything and start again system.
         *
         * @method refresh
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who recieve
         *                                  event binding
        */
        refresh: function(dom) {
            unbinding(dom);
            return binding(dom);
        },

        /**
         * Register a new converter to use
         *
         * @method registerConverter
         *
         * @param name {String}             The name to use inside html tags
         * @param fct {Function}            The function linked to name
        */
        /*registerConverter: function(name, fct) {
            if(a.isFunction(fct)) {
                converters[name] = fct;
            }
        },*/

        /**
         * Get a converter by it's name
         *
         * @method getConverter
         *
         * @param name {String}             The name used for registerConverter
         * @return {Function | null}        The related function, or null
         *                                  if nothing has been found
        */
        /*getConverter: function(name) {
            return converters[name] || null;
        },*/

        /**
         * Remove a converter from existing converter list
         *
         * @method remove
         *
         * @param name {String}             The converter name to remove
        */
        /*removeConverter: function(name) {
            delete converters[name];
        },*/

        /**
         * From a given root (document), find the elements who needs to be
         * internally updated and mark them as "to watch".
         *
         * @param root {DOMElement | null}  The dom root, document if null
        */
        watchInnerBind: function(root) {
            // change name to bindInner(root)
            findInnerDataElement(root);
        },
        unwatchInnerBind: function(root) {
            unbindInner(root);
        }
    };
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model based system to create and manage models threw
        application lifetime

************************************************************************ */


/*
 * Property available element :
 *   - nullable {Boolean}   if the property can be set to null or not
 *   - init {Mixed}         the initial value
 *   - primary {Boolean}    Indicate if property is a primary type or not,
 *                          it's used internally to find models who match...
 *   - needed {Boolean}     Indicate if the property should ALWAYS be
 *                          included when performing a save to server
 *   - check {String}       the typeof check (like String, Object, ...)
 *   - pattern {String}     the regex pattern to check
 *   - validate {Function}  the function to use for validate input.
 *                          Must return true and false value to validate or not
 *                          Validate can also act like pattern (string regex)
 *                          but it's more recommanded to use pattern instead
 *   - many {Boolean}       Indicate if check should expect an array instead
 *                          of a single value.
 *   - transform {Function} the transformation to apply before setting data
 *   - event {String}       the event to raise on any change
 *   - apply {Function}     the apply element
*/

/**
 * A model creator to manage your model type.
 *
 * @function model
 * @namespace a
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model.
*/
a.model = function(name, properties) {
    // Only allow new name (already existing name just give already existing
    // model definition)
    if(a.isString(name)) {
        if(!a.model.pooler.get(name)) {
            // Remove functions from object
            var functions = {};
            for (var el in properties) {
                if (properties.hasOwnProperty(el) && a.isFunction(properties[el])) {
                    functions[el] = properties[el];
                    delete properties[el];
                }
            }
            // Register model into pooler
            a.model.pooler.set(name, {
                properties: properties,
                functions: functions
            });

            // Register model into ajax
            // We auto-add the type 'json' as for now AppStorm
            // is only able to parse JSON elements
            a.setTemplateAjaxOptions('model:' + name, {
                model: name,
                type: 'json'
            });

            // We return a function embed to create new instance
            // from variable
            return function() {
                return a.model.pooler.createInstance(name);
            };
        } else {
            // We directly create a new model
            return a.model.pooler.createInstance(name);
        }

    // Name is a search query system
    } else if(a.isTrueObject(name)) {
        if('destroy' in name) {
            var instances = name['instances'];
            if(instances && a.isArray(instances)) {
                var i = instances.length;
                while(i--) {
                    a.model.pooler.deleteInstance(instances[i]);
                }
            }
        } else {
            return a.model.pooler.searchInstance(name);
        }
    }
};






















/**
 * A model instance generator to manage multiple instance from a main model.
 * NEVER USE BY ITSELF, you should always go threw a.model before.
 *
 * @constructor
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model
 * @param functions {Object}                The functions associated to the
 *                                          model
*/
a.modelInstance = function(name, properties, functions) {
    this.modelName  = name || '';
    this.properties = {};
    this.snapshot   = {};
    // List properties originally found in the model
    // by default which cannot be changed by user
    this.originalContent = [];

    // Internal unique id tracer
    this.uid = a.uniqueId();
    this.nid = name + '-' + this.uid;

    if (a.isTrueObject(properties)) {
        this.properties = a.deepClone(properties);
    }

    for (var key in this) {
        this.originalContent.push(key);
    }

    // Applying functions
    if (a.isTrueObject(functions)) {
        for (var key in functions) {
            if(!a.contains(this.originalContent, key)) {
                this[key] = functions[key];
                // We also add it to original content
                this.originalContent.push(key);
            }
        }
    }
};


a.modelInstance.prototype = {
    /**
     * Get a single property value.
     *
     * @method get
     *
     * @param key {String}                  The property key
     * @return {Object}                     The property value or null if not
     *                                      existing
    */
    get: function(key) {
        var p = this.properties[key];
        return p ? p.value : null;
    },

    /**
     * Get a single property type.
     *
     * @method type
     *
     * @param key {String}                  The property key
     * @return {Object}                     The property type found, or null
    */
    type: function(key) {
        var p = this.properties[key];
        if(!p) {
            return 'text';
        }

        if(p.type) {
            return p.type;

        // Now we try to guess
        } else if(p.primary === true) {
            return 'hidden';
        } else if(a.isArray(p.check)) {
            return 'select';
        } else if(p.check) {
            var content = p.check.toLowerCase();
            if(content === 'boolean') {
                return 'checkbox';
            } else if(content === 'number' || content === 'float' || 
                content === 'double' || content === 'integer') {
                return 'number';
            }
            // TODO: add the lastest HTML like date, phone...
        }

        return 'text';
    },

    /**
     * Get the property list stored in the model.
     *
     * @method list
     *
     * @return {Object}                     The property list currently setted
    */
    list: function() {
        var properties = [];
        for(var i in this.properties) {
            properties.push(i);
        }
        return properties;
    },

    /**
     * Set the given property value.
     *
     * @method set
     *
     * @param key {String}                  The property key
     * @param value {Object}                The property value
    */
    set: function(key, value) {
        var property = this.properties[key];

        // If the property is setted, we can use it
        if(property) {
            var check     = property.check,
                apply     = property.apply,
                eventName = property.event,
                pattern   = property.pattern,
                transform = property.transform,
                validate  = property.validate,
                many      = property.many || false,
                old       = property.value;


            // TRANSFORM
            value = a.isFunction(transform) ? transform(value, old) : value;

            // NULLABLE TEST
            if(property['nullable'] === false && a.isNone(value)) {
                return;
            }

            // TODO: one of the solution here is to convert value into
            // an array (except in case of many = true) and then
            // try to check it
            // CHECK TEST - basic typeof test
            // CHECK TEST - model check error (we do allow complex sub type)
            if(a.isString(check)) {

                // Little hack to prevent wrong typeof check
                check = check.toLowerCase();
                if(check === 'integer' || check === 'float'
                    || check === 'double') {
                    check = 'number';
                }

                var instance = value instanceof a.modelInstance;
                if(instance && check !== value.modelName) {
                    return;
                } else if(!instance && check !== typeof(value)) {
                    return;
                }

            // CHECK TEST - array of values
            // Note: don't mix if...
            } else if(a.isArray(check)) {
                if(!a.contains(check, value)) {
                    return;
                }

            // CHECK TEST - key in object
            // Note: don't mix if...
            } else if(a.isTrueObject(check)) {
                if(!a.has(check, value)) {
                    return;
                }
            }

            // PATTERN TEST
            if(!a.isNone(value) && a.isString(pattern) && pattern) {
                if(many === true && a.isArray(value)) {
                    for(var i=0, l=value.length; i<l; ++i) {
                        var reg = new RegExp(pattern, 'g');
                        if(!reg.test(value[i])) {
                            return;
                        }
                    }
                } else {
                    var reg = new RegExp(pattern, 'g');
                    if(!reg.test(value)) {
                        return;
                    }
                }
            }

            // VALIDATE TEST - function
            if(a.isFunction(validate) && validate(value, old) !== true) {
                return;

            // VALIDATE TEST - regex
            } else if(a.isString(validate)
                        && !(new RegExp(validate, 'gi').test(value))) {
                return;
            }

            // We can apply property value now
            property.value = value;

            // If it's possible, we also update the 'direct' value
            if(!a.contains(this.originalContent, key)) {
                this[key] = value;
            }

            // APPLY TEST
            if(a.isFunction(apply)) {
                apply(value, old);
            }

            if(eventName) {
                this.dispatch(eventName, {
                    value: value,
                    old: old
                });

            // if no event, we raise a default 'change%Key%'
            } else {
                this.dispatch(a.firstLetterUppercase(key, 'change'), {
                    value: value,
                    old: old
                });
            }
        }
    },

    /**
     * Watch a model property for changes
     *
     * @method watch
     *
     * @param key {String}                  The model key to watch
     * @param fct {Function}                The function to bind
    */
    watch: function(key, fct) {
        if(a.isString(key) && a.isFunction(fct)) {
            a.watch.call(this, this.properties[key].value, fct);
        } else {
            a.console.storm('error', 'a.model.watch', 'Unable to watch the ' +
                'property ```' + key + '``` for model ```' + this.modelName +
                '```', 1);
        }
    },

    /**
     * Unwatch a mdoel property changes
     *
     * @method unwatch
     *
     * @param key {String}                  The model key to stop watching
     * @param fct {Function}                The function to unbind
    */
    unwatch: function(key, fct) {
        if(a.isString(key) && a.isFunction(fct)) {
            a.unwatch.call(this, this.properties[key].value, fct);
        } else {
            a.console.storm('error', 'a.model.unwatch', 'Unable to unwatch ' +
                'the property ```' + key + '``` for model ```' +
                this.modelName + '```', 1);
        }
    },

    /**
     * Check if a given key exist or not in model.
     *
     * @method has
     *
     * @param key {String}                  The key to test
    */
    has: function(key) {
        return key in this.properties;
    },

    /**
     * Clear model (rollback to default values for all properties)
     *
     * @method init
    */
    init: function() {
        for(var property in this.properties) {
            if (this.properties[property].hasOwnProperty('init')) {
                this.properties[property].value =
                        this.properties[property].init;
            } else {
                this.properties[property].value = null;
            }

            // Now we push data into directly the model itself
            if(!a.contains(this.originalContent, property)) {
                this[property] = this.get(property);
            } else {
                a.console.storm('error', 'a.model', 'The model ```' +
                        this.modelName + '``` has the property ```' + key + 
                        '``` which is in conflict with internal model system.'+
                        ' Please change the property name...', 1);
            }
        }

        // Save current setted data
        this.takeSnapshot();

        this.dispatch('init', {});
    },

    /**
     * Get a fresh copy of the model, another instance with same data
     *
     * @method clone
     *
     * @return {a.modelInstance}            A new instance with exactly same
     *                                      data
    */
    clone: function() {
        var data = a.deepClone(this.toObject()),
            instance = a.model.pooler.createInstance(this.modelName);

        instance.fromObject(data);
        return instance;
    },

    /**
     * Convert model to a simple json object like
     *
     * @method toObject
     *
     * @return {Object}                     The result object
    */
    toObject: function() {
        var obj = {};
        for(var property in this.properties) {
            var result = this.get(property);
            if(result instanceof a.modelInstance) {
                obj[property] = result.toObject();
            } else if(a.isArray(result)) {
                var content = [];
                for(var i=0, l=result.length; i<l; ++i) {
                    var element = result[i];
                    if(element instanceof a.modelInstance) {
                        content.push(element.toObject());
                    } else {
                        content.push(element);
                    }
                }
                obj[property] = content;
            } else {
                obj[property] = result;
            }
        }
        return obj;
    },

    /**
     * From a JSON object like, fill this model with element found
     *
     * @method fromObject
     *
     * @param data {Object}                 The input data
    */
    fromObject: function(data) {
        for(var property in this.properties) {
            if(property in data) {
                // We update everything
                this.set(property, data[property]);
            }
        }
    },

    /**
     * Convert model to JSON data
     *
     * @method toJSON
     *
     * @return {String}                     The serialized JSON model
    */
    toJSON: function() {
        return a.parser.json.stringify(this.toObject());
    },

    /**
     * From a JSON, fill a JSON instance
     *
     * @method fromJSON
     *
     * @param data {Object}                 The input JSON data
    */
    fromJSON: function(data) {
        if(a.isString(data) && data.length > 0) {
            data = a.parser.json.parse(data);
        }
        this.fromObject(data);
    },

    /**
     * Take a model snapshot.
     *
     * @method takeSnapshot
     *
     * @return {Object}                     The snapshot created
    */
    takeSnapshot: function() {
        this.snapshot = {};
        for(var property in this.properties) {
            this.snapshot[property] = this.get(property);
        }
        return this.getSnapshot();
    },

    /**
     * Get the current stored snapshot.
     *
     * @method getSnapshot
     *
     * @return {Object}                     The snapshot currently stored
    */
    getSnapshot: function() {
        return this.snapshot;
    },

    /**
     * From the latest takeSnapshot used, retrieve the properties value
     * difference.
     * It helps to send to server only modified informations since last
     * snapshot.
     *
     * @method differenceSnapshot
     *
     * @param onlyCurrentValues {Boolean}   By default every properties found
     *                                      got a couple {value/old} object.
     *                                      But sometimes you may prefer to get
     *                                      only the current value and not old
     *                                      one, this parameter is for that.
     *                                      (default: false)
     * @return {Object}                     The difference between old and
     *                                      current model state
    */
    differenceSnapshot: function(onlyCurrentValues) {
        var snapshot   = this.snapshot,
            properties = this.properties,
            difference = {};

        for(var key in snapshot) {
            var snapValue    = snapshot[key],
                currentValue = properties[key].value;

            // Validate on value change, or needed stuff
            if(
                    currentValue !== snapValue
                ||  properties[key].needed === true
            ) {
                if(onlyCurrentValues) {
                    difference[key] = currentValue;
                } else {
                    difference[key] = {
                        value: currentValue,
                        old:   snapValue
                    };
                }
            }
        }

        return difference;
    }
};



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // From a given uid, get the linked model
    a.parameter.addParameterType('model',  function(uid) {
        return a.model.manager.get(uid);
    });

    // This helps to get model uid from a given model
    // The idea behind this is to recieve a model in parameter and lets
    // get the uid for form plugin
    Handlebars.registerHelper('model', function(object) {
        if(a.isString(object) || a.isNumber(object)) {
            return object;
        } else if(a.isTrueObject(object) && object.uid) {
            return object.uid;
        }
        return null;
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Keep a trace of every created model, to be able to search them
        with ease.

************************************************************************ */


/**
 * A model manager helps to keep a trace of every model currently used by the
 * application.
 *
 * @constructor
*/
a.model.manager = {
    /**
     * Store a pointer to every instance of every model created.
     *
     * @property _store
     * @private
     * @type Object
     * @default {}
    */
    _store: a.mem.getInstance('app.model.instance'),

    /**
     * Store a new model into the manager.
     *
     * @param {Object} model                The new model to store
    */
    set: function(model) {
        this._store.set(model.uid, model);
    },

    /**
     * Get a model from it's uid (the unique id is automatically generated
     * for every model, it's available threw myModelInstance.uid).
     *
     * @param {Integer} uid                 The unique id to search related
     *                                      model from
     * @return {Object | Null}              The related model found, or null if
     *                                      nothing is found
    */
    get: function(uid) {
        return this._store.get(uid);
    },

    /**
     * Remove a model from store.
     *
     * @param {Integer} uid                 The uid to remove
    */
    remove: function(uid) {
        this._store.remove(uid);
    },

    /**
     * Get the full model list.
     *
     * @return {Array}                      The list of stored models
    */
    list: function() {
        return this._store.list();
    },

    /**
     * Remove all existing model from store.
    */
    clear: function() {
        this._store.clear();
    },

    /**
     * Get all models related to a given namespace. For example, if you create
     * a.model('user'), this function helps to find all *user* model created.
     *
     * @param {String} name                 The model name to find
     * @return {Array}                      The array with all model instance
     *                                      related to this name
    */
    getByName: function(name) {
        if(!name || !a.isString(name)) {
            return [];
        }

        var result = [];

        a.each(this._store.list(), function(element) {
            if(element.modelName === name) {
                result.push(element);
            }
        });

        return result;
    }

    /*!
     * @private
    */
};;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a model storage system, and keep a trace of model created
        (threw a.model.manager)

************************************************************************ */

/**
 * A model pooler aims to create a storage space to keep every model type
 * existing.
 *
 * @constructor
*/
a.model.pooler = a.mem.getInstance('app.model.type');

/**
 * Simple function to generate new instance from a base.
 *
 * @param {String} name                     The model type we want to create
 * @return {Object | Null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.model.pooler.createInstance = function(name) {
    var model = this.createTemporaryInstance(name);

    if(!a.isNull(model)) {
        // Adding model to manager system
        a.model.manager.set(model);
    }

    return model;
};


/**
 * Simple function to generate new instance from a base. This instance is not
 * stored into a.model.manager.
 * **NOTE: do not use, please use createInstance instead.**
 *
 * @private
 *
 * @param {String} name                     The model type we want to create
 * @return {Object | Null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.model.pooler.createTemporaryInstance = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var model = a.extend(
            new a.modelInstance(
                name,
                a.clone(instanceType.properties),
                instanceType.functions
            ),
            a.eventEmitter('a.model')
        );

    // Resetting model
    model.init();

    // Returning freshly created model
    return model;
};

/**
 * From a given query, get back the existing stored model.
 *
 * @param {Object} query                    The query to search inside
 * @return {a.modelInstance | Null}         The single instance found,
 *                                          or a list of instances, or null
*/
a.model.pooler.searchInstance = function(query) {
    var name = query.modelName || query.model || query.name || null;

    // Faster search
    var models;
    if(name && a.isString(name)) {
        models = a.model.manager.getByName(name);
    } else {
        var list = a.model.manager.list(),
            models = [];
        a.each(list, function(element) {
            models.push(element);
        });
    }

    // We remove the first searched element
    if(query.modelName) {
        delete query.modelName;
    } else if(query.model) {
        delete query.model;
    } else if(query.name) {
        delete query.name;
    }

    for(var key in query) {
        var value = query[key],
            i = models.length;

        while(i--) {
            var model = models[i];
            // The model is not related to searched value
            if(!a.isTrueObject(value) && model.get(key) !== value) {
                models.splice(i, 1);
            // The value is an object itself, we should check deeper inside
            } else if(a.isTrueObject(value)) {

            }
        }
    }

    return models;
};


/**
 * Search primary keys inside a model, to be able to perform a search after.
 *
 * @param {String} name                     The model name to get related
 *                                          primary
 * @return {Array | Null}                   Array if it has been found, null
 *                                          if there is any problem
*/
a.model.pooler.getPrimary = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var properties = instanceType.properties,
        results = [];

    for(var key in properties) {
        var property = properties[key];
        if(property.primary === true) {
            results.push(key);
        }
    }

    return results;
};


/**
 * Delete an existing instance.
 *
 * @param {Object} instance                 The instance to delete
*/
a.model.pooler.deleteInstance = function(instance) {
    if(a.isTrueObject(instance) && instance.uid) {
        a.model.manager.remove(instance.uid);
    }
};

;/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model rendering system, aims to quickly create forms
        and related data presentation. For a quicker bindings.

************************************************************************ */

/**
 * Provide a model rendering system, aims to quickly create forms
 * and related data presentation. For a quicker bindings.
 *
 * @class template
 * @namespace a.model
*/
a.model.template = {
    engine: 'raw',

    generator: a.mem.getInstance('app.model.template.engine'),
    descriptor: a.mem.getInstance('app.model.template.render'),

    /**
     * Get the render descriptor, able to render the given element
     * in the current situation (regarding engine, current template...).
     * YOU SHOULD NOT USE THIS FUNCTION BY YOURSELF
     *
     * @method getDescriptor
     * @private
     *
     * @param type {String}                 The main type, can be one of the
     *                                      following: column, row, fieldset,
     *                                      input
     * @param subtype {String}              Mostly for input field, the subtype
     *                                      like 'text', 'checkbox', 'radio',
     *                                      but input, is also a generic name
     *                                      so it can also be 'textarea',
     *                                      'select', ...
     * @param key {String}                  In case of input type, it should be
     *                                      the model key to get, in any other
     *                                      cases, the current row/column
     * @param template {Object}             The template currently selected
     *                                      by user
     * @return {Function}                   The most appropriate function found
     *                                      to apply rendering.
    */
    getDescriptor: function(type, subtype, key, template) {
        // Template rendering
        var renderTmpl = (('rendering' in template) &&
                a.isTrueObject(template.rendering))? template.rendering : null,
        // Engine rendering
            engine = a.model.template.generator.get(a.model.template.engine),
            renderNgin = (('rendering' in engine) &&
                a.isTrueObject(engine.rendering)) ? engine.rendering : null;

        var source = 'a.model.template.getDescriptor';

        // If engine is not found, we raise error
        if(a.isNone(engine) || a.isNone(renderNgin)) {
            a.console.storm('error', source, 
                    'Unable to find the ```' + a.model.template.engine + '```'+
                    ' engine', 1);
        }

        var error = 'Unable to find descriptor for ```' + key + '```' +
                    ' with engine ```' + 
                    a.model.template.engine + '``` and template ```' + 
                    template.templateName + '```';

        // Structure elements like row, columns...
        if(type === 'column' || type === 'row' || type === 'fieldset' ||
            type === 'clearfix') {
            // Exact match search
            var exact = type + key;

            // 1: we search for specific row number, first in template,
            // second in engine
            if(renderTmpl && a.isFunction(renderTmpl[exact])) {
                return renderTmpl[exact];
            } else if(renderNgin && a.isFunction(renderNgin[exact])) {
                return renderNgin[exact];
            }

            // 2: we search for generic row, first in template,
            // second in engine
            if(renderTmpl && a.isFunction(renderTmpl[type])) {
                return renderTmpl[type];
            } else if(renderNgin && a.isFunction(renderNgin[type])) {
                return renderNgin[type];
            } else {
                a.console.storm('error', source, error, 1);
                return null;
            }

        } else if(type === 'input') {
            if(renderTmpl) {
                // 1: we search for a direct model key binded into the template
                // we dont do the same in the engine (no sense to have it in
                // engine level)
                if(a.isFunction(renderTmpl[key])) {
                    return renderTmpl[key];

                // 2: We search for a direct sub-type in the template
                } else if(a.isFunction(renderTmpl[subtype])) {
                    return renderTmpl[subtype];
                }
            }

            // 3: we search for a direct sub-type in the engine
            if(renderNgin && a.isFunction(renderNgin[subtype])) {
                return renderNgin[subtype];
            }

            // 4: still nothing found, we go for a direct search, first in
            // template, second in engine
            if(renderTmpl && a.isFunction(renderTmpl[type])) {
                return renderTmpl[type];
            } else if(renderNgin && a.isFunction(renderNgin[type])) {
                return renderNgin[type];
            } else {
                a.console.storm('error', source, error, 1);
                return null;
            }

        } else {
            a.console.storm('error', 'a.model.template.getDescriptor', 
                    'The type ```' + type + '``` is unknow', 1);
            return null;
        }
        // POUR INPUT:
        // 1: on cherche dans le template s'il n'existe pas
        // le nom de la clef du modèle (rendering custom)
        // 2: on cherche dans le template s'il n'existe pas
        // un 'type' => exemple "textarea" ou "text" ou "checkbox"
        // ou "select" ou "hidden"
        // dans le template
        // 3: on cherche dans l'engine pour cette bestiole
        // 4: on cherche dans le template le type global: input, textarea...
        // 5: on cherche dans l'engine le template input, textarea...
        // 6: on print un message d'erreur...

        // POUR COLUMN:
        // 1: on cherche le column1/2/3 dans le template
        // 2: on cherche le column1/2/3 dans l'engine
        // 3: on cherche le column dans template
        // 4: on cherche le column dans l'engine

        // POUR ROW:
        // 1: on cherche le row1/2/3 dans le template
        // 2: on cherche le row1/2/3 dans l'engine
        // 3: on cherche le row dans template
        // 4: on cherche le row dans l'engine
    },

    output: {
        /**
         * Print a single input on output (including label)
         *
         * @method input
         *
         * @param model 
        */
        input: function(model, propertyName, parameters, template) {
            var type = model.type(propertyName),
                value = model.get(propertyName),
                descriptor = a.model.template.getDescriptor(
                            'input', type, propertyName, template);

            // We got a function as result, so we can continue
            if(a.isFunction(descriptor)) {
                // TODO: get the label content
                // TODO: create lblClass
                // TODO: create iptClass
                var label = propertyName,
                    lblClass = '',
                    iptClass = '';
                return descriptor.call(this, model, propertyName, type, label,
                                value, lblClass, iptClass, parameters);
            } else {
                return null;
            }
        },

        /**
         * Print a column system (like on bootstrap or fundation)
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method column
         * @private
         *
         * @param model {a.model.instance}  The model to present to user
         * @param number {Integer}          The column separator (1 to 12)
         * @param template {Object}         The template object
         * @param extra {Object}            Any extra elements (the position
         *                                  left/right for example)
         * @return {DOMelement | null}      The dom element created (can
         *                                  be also null)
        */
        column: function(model, number, template, extra) {
            var descriptor = a.model.template.getDescriptor(
                'column', null, number, template);

            // We got a function as result, so we can continue
            if(a.isFunction(descriptor)) {
                return descriptor.call(this, number, extra);
            } else {
                return null;
            }
        },

        /**
         * Print a single line content.
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method row
         * @private
         *
         * @param model {a.model.instance}  The model to bind
         * @param row {String}              The line properties
         * @param number {Integer}          The current row number
         * @param template {Object}         The template object
         * @return {DOMElement}             The row full of content
        */
        row: function(model, row, number, template) {
            var properties = row.split('&&'),
                line = null,
                descriptor = a.model.template.getDescriptor(
                    'row', null, number, template);

            // We search for a text align
            var position = null,
                possiblePosition = ['left', 'right', 'justify', 'center'];
            // We got exactly one position, it's the line element
            // which may handle left/right positioning
            if(properties.length === 1) {
                var separator = properties[0].split('::');
                for(var y=0, u=separator.length; y<u; ++y) {
                    var tmp = a.trim(separator[y]);
                    if(a.contains(possiblePosition, tmp)) {
                        position = tmp;
                    }
                }
            }

            if(a.isFunction(descriptor)) {
                line = descriptor.call(this, number, template, {
                    position: position
                });
            } else {
                line = document.createElement('div');
            }

            for(var i=0, l=properties.length; i<l; ++i) {
                var element = a.trim(properties[i]);

                // Now we cut the parameters
                // We erase position
                position = null;
                var cut = element.split('::'),
                    column = null;

                // treatment for special case '::col3' which makes a blank
                // div spacer
                if(cut[0] === '' && cut[1].indexOf('col') === 0) {
                    // We create an empty column
                    column = this.column.call(this, model, cut[1], template);
                    if(column) {
                        // TODO: check if it's the only way
                        // Special treatment to make space appearing
                        // column.innerHTML = '&nbsp;';
                        line.appendChild(column);
                        continue;
                    }
                }

                // We got some extra parameters
                // We are searching here ONLY for column system
                if(cut.length > 1) {
                    // First we search a position placement
                    var j = cut.length,
                        k = cut.length;
                    while(j--) {
                        cut[j] = a.trim(cut[j]);
                        if(a.contains(possiblePosition, cut[j])) {
                            position = cut[j];
                        }
                    }
                    for(j=0; j<k; ++j) {
                        var el = cut[j];
                        // User request to create column system
                        if(el.indexOf('col') === 0) {
                            column = this.column.call(this, model, el,
                                            template, {position: position});
                        }
                    }
                }

                var input = this.input.call(this, model, cut[0],
                                                cut.splice(1), template);

                if(column) {
                    column.appendChild(input);
                    line.appendChild(column);
                } else {
                    line.appendChild(input);
                }
            }

            // We add the clearfix if needed
            var clearfix = a.model.template.getDescriptor('clearfix', null,
                number, template);
            if(a.isFunction(clearfix)) {
                line.appendChild(clearfix.call(this, number, template));
            }

            return line;
        },

        /**
         * Render a fieldset inside the given model.
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method fieldset
         * @private
         *
         * @param model {a.model.instance}  The model to render
         * @param row {Array}               The row current value
         * @param number {Integer}          The current row number
         * @param template {Object}         The current template to render
         * @return {DOMElement}             The fieldset created
        */
        fieldset: function(model, row, number, template) {
            var fieldset = a.model.template.getDescriptor('fieldset', 
                null, number, template);

            for(var i=0, l=row.length; i<l; ++i) {
                var element = a.trim(row[i]),
                    line = null;
                if(element[i].indexOf('legend')) {
                    // TODO: do the legend line here
                } else {
                    line = this.row.call(this, model, element, i, template);
                }
                if(line) {
                    fieldset.appendChild(line);
                }
            }

            return fieldset;
        },

        /**
         * Render a given model, regarding the given template, and the
         * current global rendering engine
         *
         * @method model
         *
         * @param model {a.model.instance}  The model to render
         * @param templateName {String}     The template to use for rendering
         * @return {Array}                  A list of DOMElement to append
         *                                  to current HTML as rendering system
        */
        model: function(model, templateName) {
            var tmpl = a.model.template.descriptor.get(templateName);

            if(!tmpl) {
                a.console.storm('error', 'a.model.template.output.model', 
                        'The template ```' + templateName + '```' +
                        ' could not be found', 1);
                return;
            }

            var content = tmpl.template,
                render = [];

            // Adding a little extra
            tmpl.templateName = templateName;

            for(var i=0, l=content.length; i<l; ++i) {
                // It's a fieldset
                if(a.isArray(content[i])) {
                    render.push(this.fieldset.call(this, model, content[i],
                        i, content));
                } else {
                    render.push(this.row.call(this, model, content[i], i,
                                                                content));
                }
            }

            return render;
        }
    }
};




/*
 * -----------------
 *   RAW RENDERING
 * -----------------
*/
(function() {
    a.model.template.generator.set('raw', {
        rendering: {
            /**
             * Render a single row element
             *
             * @method row
             *
             * @param number {Integer}      The current row number
             * @param template {Object}     The template currently printed
             * @param extra {Object}        Any special element, here only
             *                              'extra.position' can be passed
             *                              defining the text content position
             * @return {DOMElement}         The row element created
            */
            row: function(number, template, extra) {
                var row = document.createElement('div');

                if(a.isString(extra.position)) {
                    row.style.textAlign = extra.position;
                }

                return row;
            },

            /**
             * Render a clearfix element
             *
             * @method clearfix
             *
             * @return {DOMElement | null}  The clearfix element to clear the
             *                              float problem
            */
            clearfix: function() {
                var div = document.createElement('div');
                div.style.clear = 'both';
                div.style.height = '0px';
                div.style.overflow = 'hidden';
                return div;
            },

            /**
             * Render a column separator
             *
             * @method column
             *
             * @param number {Integer}      The col space (from 1 to 12)
             * @return {DOMElement}         The column system created
            */
            column: function(number, extra) {
                var div = document.createElement('div');

                // Convert col-xs, col-md, col3 things into number
                number = parseInt(number.match(/[0-9]+/)[0], 10);

                // Creating real system
                var real = Math.round(number * 8.33333333 * 100000) / 100000;
                div.style.styleFloat = 'left';
                div.style.cssFloat = 'left';
                div.style.width = real + '%';

                if(a.isString(extra.position)) {
                    div.style.textAlign = extra.position;
                }

                return div;
            },

            /**
             * Generate a reset button
             *
             * @method reset
             *
             * @param value {String | null} The value to put instead of 'reset'
             * @return {DOMElement}         The button
            */
            reset: function(value) {
                var reset = document.createElement('input');
                reset.type = 'reset';
                if(value) {
                    reset.value = value;
                }
                return reset;
            },

            /**
             * Create a submit button
             *
             * @method submit
             *
             * @param value {String | null} The value to put instead of 'send'
             * @return {DOMElement}         The button
            */
            submit: function(value) {
                var submit = document.createElement('submit');
                submit.type = 'submit';
                if(value) {
                    submit.value = value;
                }
                return submit;
            },

            /**
             * Render an input
             *
             * @method input
             *
             * @param model {a.model.instance} The model to get data from
             * @param name {String}         The input name to validate, like
             *                              'login' or 'password'
             * @param type {String}         The input type, like text
             * @param label {String}        The label to show to user
             * @param value {String | null} The value to start with
             * @param lblClass {String}     The label class to add
             * @param iptClass {String}     The input class to add
             * @param extra {Array}         Extra parameters (any kind)
             * @return {DOMElement}         The dom element created
            */
            input: function(model, name, type, label, value, lblClass,
                iptClass, extra) {
                var staticElement = a.contains(extra, 'static');

                var div = document.createElement('div'),
                    lbl = document.createElement('label'),
                    ipt = null;

                var id = 'model-' + name;

                lbl.for = id;
                lbl.className = lblClass;
                lbl.innerHTML = label;

                if(staticElement) {
                    ipt = document.createElement('p');
                    ipt.innerHTML = value || '';
                } else if(type === 'textarea') {
                    ipt = document.createElement('textarea');
                    ipt.innerHTML = value || '';
                } else if(type === 'select') {
                    ipt = document.createElement('select');

                    // We add all sub elements into the select
                    // TODO: get check elements
                    var check = ['opt1', 'opt2'];
                    // TODO: add currently selected
                    for(var i=0, l=check.length; i<l; ++i) {
                        var option = document.createElement('option');
                        option.value = check[i];
                        option.innerHTML = check[i];
                        ipt.appendChild(option);
                    }
                } else {
                    ipt = document.createElement('input');
                    ipt.type = type;
                    // TODO: be able to have more than once
                    ipt.placeholder = label;
                    ipt.value = value || '';
                }

                ipt.id = id;
                ipt.className = iptClass;

                if(!staticElement) {
                    ipt.name = name;
                    ipt.id = id;

                    // Applying extra parameters
                    for(var i=0, l=extra.length; i<l; ++i) {
                        var content = a.trim(extra[i]);
                        if(content === 'disable' || content === 'disabled') {
                            ipt.disabled = true;
                        }
                    }
                }

                div.appendChild(lbl);
                div.appendChild(ipt);
                return div;
            }
        }
    });
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        Manipulate the page history and templates.
        We define here some usefull function to catch some important event.

        template: Create a simple but powerfull template system based on
                    handlebars
        hash: Manage hash manipulate for page

************************************************************************ */


/**
 * Create a template system based on handlebars.
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:page">here</a>
 *
 * @class template
 * @static
 * @namespace a
*/
a.template = {
    /**
     * Store cached partials
     * @property _part
     * @private
     * @type Object
     * @default {}
    */
    _part: {},

    /**
     * Register a new partial into template system (handlebars partial).
     *
     * @async
     *
     * @param {String} name                 The partial name to use inside
     *                                      handlebars templates
     * @param {String} uri                  The uri to load (GET method), or
     *                                      a template string (see options
     *                                      parameter)
     * @param {Function | Null} success     The callback to call after loading
     *                                      success
     * @param {Function | Null} error       The callback to call if there is
     *                                      an error
    */
    partial: function(name, uri, success, error) {
        var handler  = null,
            fctName  = 'a.template.partials';

        // Get Handlebars or Mustache
        if (a.isTrueObject(window.Handlebars)) {
            handler = window.Handlebars;
        } else if (a.isTrueObject(window.Mustache)) {
            handler = window.Mustache;
        }

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!', 
                    1);
            return;
        }

        a.loader.html(uri, function(content) {
            handler.registerPartial(name, content);

            // Callback
            if(a.isFunction(success)) {
                success(name, content);
            }
        }, error);
    },

    /**
     * Use cache or retrieve a specific template from network.
     *
     * @async
     *
     * @param {String} uri                  The path to get the template,
     *                                      or an id if the template already
     *                                      listed in html
     * @param {Object} data                 The data to apply to template
     * @param {Function} success            The callback to apply when
     *                                      template finish loading
     * @param {Function | Null} error       The error to raise in case of
     *                                      problem
    */
    get: function(uri, data, success, error) {
        var handler  = null,
            fctName  = 'a.template.get',
            errorStr = 'Success callback not defined';

        // Get Handlebars or Mustache
        if (a.isTrueObject(window.Handlebars)) {
            handler = window.Handlebars;
        } else if (a.isTrueObject(window.Mustache)) {
            handler = window.Mustache;
        }

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!',
                    1);
            return;
        }

        // We use the loader to retrieve file from server side
        a.loader.html(uri, function (content) {
            // Try to use Handlebars
            if (a.isNone(handler.to_html)) {
                var tmpl = handler.compile(content);
                if (a.isFunction(success)) {
                    success(tmpl(data));
                } else {
                    a.console.storm('error', fctName, errorStr, 1);
                    if (a.isFunction(error)) {
                        error(tmpl);
                    }
                }
            } else {
                if (a.isFunction(success)) {
                    success(handler.to_html(content), data);
                } else {
                    a.console.storm('error', fctName, errorStr, 1);
                    if (a.isFunction(error)) {
                        error(tmpl);
                    }
                }
            }
        }, error);
    },

    /**
     * Convert an html to a dom content.
     *
     * @param {String} html                 The string to parse
     * @return {Array}                      The result content
    */
    htmlToDom: function(html) {
        // Why this ?
        // - Using innerHTML is slow,
        //   and can remove binding (like onclick) to sibling children
        // - Doing this way is the only way to have both:
        //   full parsing on every browser, and DOM element to
        //   not have innerHTML bug.
        //   as innerHTML is configured into a temp object,
        //   this problem does not exist here anymore as it will
        //   not affect other children...
        var d      = document.createElement('div'),
            result = [];
        // Remove space before and after : the system fail in other case
        // (but why ?)
        d.innerHTML = a.trim(html);

        // We select sub children of text type or element type
        a.dom.el(d).children([1, 3]).each(function() {
            result.push(this);
        });

        return result;
    },

    /**
     * Append to the given element (given a DOM element here not a jQuery one).
     * The advantage over a.dom version, is the auto-translate system.
     *
     * @async
     *
     * @param {DOMElement} el               Any dom element to append to
     * @param {String} content              The html content (in string)
     *                                      to replace
    */
    append: function(el, content) {
        el = a.dom.el(el);
        var h = this.htmlToDom(content);

        if(a.isTrueObject(h)) {
            el.append(h);
        }
        a.each(el.getElements(), function(element) {
            a.translate.translate(element);
        });
    },

    /**
     * Same as append, just replace instead of append to element.
     * The advantage over a.dom version, is the auto-translate system.
     *
     * @async
     *
     * @param {DOMElement} el               Any dom element to append to
     * @param {String} content              The html content (in string) to
     *                                      replace
    */
    replace: function(el, content) {
        a.dom.el(el).empty();
        a.template.append(el, content);
    }

    /*!
     * @private
    */
};


/*
------------------------------
  TYPE HELPERS
------------------------------
*/
(function() {
    // Replace type
    a.state.type.add('replace', function replace(entry, content, chain) {
        if(content) {
            a.template.replace(entry, content);
            if(chain) {
                chain.next();    
            }
        }
    }, function(entry, chain) {
        if(chain) {
            chain.next();
        }
    }, true);

    // Append type
    a.state.type.add('append', function append(entry, content, chain) {
        if(content) {
            a.template.append(entry, content);
            if(chain) {
                chain.next();
            }
        }
    }, function(entry, chain) {
        if(chain) {
            chain.next();
        }
    }, true);
})();;/**
 * Compact is a tiny object used when switching an AppStorm.JS project into
 * production. It aims to load the appstorm.compact.html file with ease and
 * be ready to use it inside every state who need it...
 *
 * @constructor
*/
a.compact = {
    /**
     * The url to load when system needs it.
     *
     * @property url
     * @default ./appstorm.compact.html
    */
    url: './appstorm.compact.html',

    /**
     * If the compact element is active or not.
     *
     * @property active
     * @default false
    */
    active: false,

    /**
     * Load the appstorm compact data.
     * Should be called right after application start.
     *
     * @param {Function | Null} callback    Any callback to call after loading.
     *                                      First parameter is error or not,
     *                                      second is html if no error
    */
    load: function (callback) {
        var that = this;

        a.loader.html(this.url, function (content) {
            a.console.storm('log', 'a.compact', 'URL ```' + that.url +
                '``` loaded with success', 3);

            var dom = a.template.htmlToDom(content),
                el  = null;
            for (var i = 0, l = dom.length; i < l; ++i) {
                el = dom[i];
                if (el.tagName === 'SCRIPT') {
                    var type = el.getAttribute('type'),
                        src  = el.getAttribute('data-src'),
                        text = el.text;

                    // We remove "appstorm/" on type
                    a.loader.manuallyAddCache(type.substr(9), src, text);
                }
            }

            if (a.isFunction(callback)) {
                callback(false, content);
            }
        }, function() {
            a.console.storm('error', 'a.compact', 'Unable to load ```' +
                that.url + '```, compact will not be used...', 1);
            that.active = false;
            if (a.isFunction(callback)) {
                callback(true, null);
            }
        });
    }
};;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Live is a live data binding inside HTML element. Allowing to
        quickly create dynamic elements in your application.

************************************************************************ */

(function(a) {
    // Test there is or not position inside
    var regIsLive = /\u200c\u200c([^\u200c]+)\u200c\u200c/i,
        regExtractLive = /\u200c\u200c([^\u200c]+)\u200c\u200c/gi;

    // Interpreter is the main elements for changing "a + b"
    // into actual a + b compute.
    var interpreter = a.jsep.interpreter('app.live', true, true, true);

    /**
     * Increase the internal counter.
     * The internal counter is used to know what are the variables in use
     * in this system.
     *
     * @param internal The internal object.
     * @param name The property name to store.
    */
    function increaseInternal(internal, name) {
        if (internal.hasOwnProperty(name)) {
            internal[name]++;
        } else {
            internal[name] = 1;
        }
    }

    // We need to change one method from interpreter
    // We need to know every variables involved, no matter if they
    // exist or not, compare to official solution which matters.
    interpreter.expressions.identifierExpression = function (data, internal,
            scope) {
        // No matter is the element is found in the scope or
        // not, it's counted as inside the scope.
        increaseInternal(internal, data.name);

        if (scope.hasOwnProperty(data.name)) {
            return scope[data.name];
        }

        return data.name;
    };

    // Will store all last bindings found
    var store = a.mem.getInstance('app.live.local');

    /**
     * The given element can change element.
     *
     * @private
     *
     * @param {DOMElement} el               The element to check.
    */
    function isEmitter(el) {
        var tag = el.tagName;
        return (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
    }

    /**
     * The element accept full replace data binding.
     *
     * @private
     *
     * @param {DOMElement} el               The element to check.
    */
    function isLiveGlobal(el) {
        var data = el.getAttribute('data-live');
        return !a.isNone(data);
    }

    /**
     * The element implements some live position.
     *
     * @private
     *
     * @param {DOMElement} el               The element to check.
    */
    function isLiveLocal(el) {
        regIsLive.lastIndex = 0;
        var text = a.dom.el(el).text(false);
        return regIsLive.test(text);
    }

    /**
     * Search for local bindings, and create the final data-live-local tag
     *
     * @private
     *
     * @param {DOMElement} el               The element to check
    */
    function createLiveLocal(el) {
        var text  = a.dom.el(el).text(false),
            local = [],
            match = null;

        regExtractLive.lastIndex = 0;

        // For every \u200C\u200C something \u200C\u200C tag found,
        // We append to local

        while ((match = regExtractLive.exec(text)) !== null) {
            local.push(match[1]);
        }

        // Publishing local
        el.setAttribute('data-live-local', local.join(','));
    }

    /**
     * Perform change on other elements
     *
     * @method applyChange
     * @private
     *
     * @param name {String}                 The binding name
     * @param value {String}                The binding value to apply
    */
    function applyChange(el, name, value) {
        // Updating data
        el = this || el;
        // TODO: change that for el => data-live
        name = el.getAttribute('data-live') || name;
        value = value || el.value;

        var nameTree = a.jsep.parse(name),
            nameOutput = interpreter.evaluate(nameTree);

        // Storing every variables
        for (var i = 0, l = nameOutput.variables.length; i < l; ++i) {
            store.set(nameOutput.variables[i], value);
        }

        // Getting the store list
        var list = store.list();

        // Searching data-bind elements tags
        a.dom.attr('data-live').each(function() {
            if (el && this === el) {
                return;
            }

            var resultTree = a.jsep.parse(this.getAttribute('data-live')),
                resultOutput = interpreter.evaluate(resultTree, list);

            if (isEmitter(this)) {
                this.value = resultOutput.result;
            } else {
                this.innerHTML = resultOutput.result;
            }
        });

        // Search live elements tag
        a.dom.attr('data-live-local').each(function() {
            if (el && this === el) {
                return;
            }

            var resultTree = a.jsep.parse(this.getAttribute('data-live-local')),
                resultOutput = interpreter.evaluate(resultTree, list);

            // The most simple case, data-live-local is a single element
            if (!a.isArray(resultOutput.result)) {
                resultOutput.result = [resultOutput.result];
            }

            var found = 0,
                max = resultOutput.result.length;

            for(var i = 0, l = this.childNodes.length; i < l && found < max;
                    ++i) {
                var node = this.childNodes[i];
                if(node.nodeType === 3) {
                    var str   = node.nodeValue,
                        start = str.indexOf('\u200c\u200c'),
                        end   = str.indexOf('\u200c\u200c', start + 1);

                    if (start > 0 && end > 0 && start < end) {
                        offset = end + 1;
                        node.nodeValue = str.substr(0, start + 2) +
                            resultOutput.result[found] +
                            str.substr(end, str.length - 1);
                        found++;
                    }
                }
            }
        });
    }

    /**
     * Tiny binder between the applyChange function and event related.
     *
     * @private
     *
     * @param {Object} evt                  The input event.
    */
    function eventApplyChange(e) {
        applyChange.call(e.target);
    }

    a.live = {
        /**
         * The global store where everything is stored for usage.
         *
         * @property store
        */
        store: a.mem.getInstance('app.live.global'),

        /**
         * Bind every elements using tag live.
         * NOTE: this concern only emitters, like input, textarea... Other
         * elements are always affacted.
         *
         * @param {DOMElement | Null} root  The element to start binding from
         * @return {Array}                  All the HTML elements binded
        */
        bind: function(root) {
            var elements = [];

            // We get elements subject to binding
            a.dom.el(root || document).each(function() {
                // We try to catch every sub elements
                a.dom.el(this).children().each(function() {
                    var tmpElements = a.live.bind(this);
                    elements.concat(tmpElements);
                });

                var liveGlobal = isLiveGlobal(this);

                // We bind elements who emit data
                if (isEmitter(this) && liveGlobal) {
                    elements.push(this);
                    // On change apply binding
                    a.dom.el(this).bind('change input keydown',
                            eventApplyChange);
                    // Start first time
                    applyChange.call(this);

                // In this case we have elements binding inside the text
                } else if (isLiveLocal(this) && !liveGlobal) {
                    createLiveLocal(this);
                }
            });

            return elements;
        },

        /**
         * Remove binded elements which are using tag live.
         * NOTE: this concern only emitters, like input, textarea... Other
         * elements are always affacted.
         *
         * @param {DOMElement | Null} root The element to start unbind from
         * @return {Array}                 All the html elements binded
        */
        unbind: function(root) {
            var elements = [];

            // We get elements subject to binding
            a.dom.el(root || document).each(function() {
                // We try to catch every sub elements
                a.dom.el(this).children().each(function() {
                    var tmpElements = a.live.bind(this);
                    elements.concat(tmpElements);
                });

                if (!isEmitter(this) || !isLiveGlobal(this)) {
                    return;
                }

                elements.push(this);

                // On change apply binding
                a.dom.el(this).unbind('change input keydown',
                        eventApplyChange);
            });

            return elements;
        }
    };
})(window.appstorm);


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('live', function(expression) {
    // The \u200c unicode char is written:
    //    &#x200c; in HTML (hex)
    //    &#8204;  in HTML (dec)
    return '&#8204;&#8204;' + expression + '&#8204;&#8204;';
});;/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a basic REST object allowing to quickly draw on top of
        a.mock a full REST API system.

************************************************************************ */
(function (a) {
    /**
     * From a list of primaries, get the resulting request style
     *
     * @private
     *
     * like:
     * a.model('test', {
     *   id: {
     *     primary: true,
     *     pattern: '[a-fA-F0-9]+'
     *   }
     * });
     * Will give:
     *   getPrimaryRequest('test') => '{{id: [a-fA-F0-9]+}}'
    */
    function getPrimaryRequest(model) {
        // Building primaries
        var primaries  = a.model.pooler.getPrimary(model),
            properties = a.model.pooler.get(model),
            pattern    = null,
            result     = [];

        for (var i = 0, l = primaries.length; i < l; ++i) {
            var p = primaries[i];
            pattern = properties.properties[p].pattern || '[0-9]+'
            result.push('{{' + p + ': ' + pattern + '}}');
        }

        if (result.length === 0) {
            a.console.storm('error', 'The model ```' + model.modelName +
                '``` does not have any primary keys, yet, you are using it ' +
                'inside ```a.rest```, which will probably have unwanted ' +
                'behavior', 1);
        }

        return result.join('/');
    };

    /**
     * Construct the search request from the model name, their primaries, and
     * their data.
     *
     * @private
     *
     * @param {String} model                The model name
     * @param {Array} data                  The list of data inside the model
     * @return {Object}                     The search object
    */
    function getSearchRequest(model, data) {
        var primaries = a.model.pooler.getPrimary(model),
            results   = {
                modelName: model
            };

        for (var i = 0, l = primaries.length; i < l; ++i) {
            if (!isNaN(data[i])) {
                results[primaries[i]] = parseFloat(data[i]);
            } else {
                results[primaries[i]] = data[i];
            }
        }

        return results;
    };

    /**
     * Simple rest object.
     *
     * @constructor
     *
     * @param {String} name                 The rest name, usually the resource
     *                                      name like 'user', 'project'...
     * @param {String} uri                  The associated base URI
     * @param {String} model                The associated model name
     * @param {Object | Null} options       Any revelant options to use.
     *                                      Currently supporting 'mock', and
     *                                      'header' only
    */
    a.rest = function(name, uri, model, options) {
        if (!(this instanceof a.rest)) {
            return new a.rest(name, uri, model, options);
        }

        // If uri ends with '/', remove it.
        uri = (uri.slice(-1) === '/') ? uri.slice(0, -1) : uri;
        uri = a.sanitize(uri);

        options = options || {};

        // Basic stored data
        this.name  = name;
        this.uri   = uri;
        this.store = a.mem.getInstance('a.rest.' + name);

        if (!a.isArray(this.store.get('data'))) {
            this.store.set('data', []);
        }
        this.data       = this.store.get('data');

        // Get the primary chain for requesting something...
        var single = a.sanitize(uri + '/' + getPrimaryRequest(model));

        // Creating request
        this.store.set('request.LIST', function (data, success, error) {
            a.ajax({
                url: uri,
                data: data,
                header: options.header || {},
                template: ['GET', 'json', 'model:' + model, 'many']
            }, success, error).send();
        });
        this.store.set('request.GET', function (data, success, error) {
            a.ajax({
                url: single,
                data: data,
                header: options.header || {},
                template: ['GET', 'json', 'model:' + model]
            }, success, error).send();
        });
        this.store.set('request.POST', function (data, success, error) {
            a.ajax({
                url: uri,
                data: data,
                header: options.header || {},
                template: ['POST', 'json', 'model:' + model]
            }, success, error).send();
        });
        this.store.set('request.PUT', function (data, success, error) {
            a.ajax({
                url: single,
                data: data,
                header: options.header || {},
                template: ['PUT', 'json', 'model:' + model]
            }, success, error).send();
        });
        this.store.set('request.DELETE', function (data, success, error) {
            a.ajax({
                url: single,
                data: data,
                header: options.header || {},
                template: ['DELETE', 'json', 'model:' + model]
            }, success, error).send();
        });

        // In case of mock
        if (options.mock) {
            // Get all entries
            a.mock.add('GET', uri, function () {
                var parameters = a.toArray(arguments);
                parameters.modelName = model;
                return a.model.pooler.searchInstance(parameters);
            }, model);

            // Get an entry
            a.mock.add('GET', single, function() {
                var parameters = getSearchRequest(model, a.toArray(arguments)),
                    instances  = a.model.pooler.searchInstance(parameters);

                if (a.isArray(instances) && instances.length > 0) {
                    return instances[0];
                } else {
                    return null;
                }
            }, model);

            // Add an entry
            a.mock.add('POST', uri, function() {
                var parameters = a.toArray(arguments);
                var tmp = a.model(model);
                tmp.fromObject(parameters.splice(-1)[0]);
                return tmp;
            }, model);

            // Update an existing entry
            a.mock.add('PUT', single, function() {
                var parameters = getSearchRequest(model, a.toArray(arguments)),
                    instances  = a.model.pooler.searchInstance(parameters);

                if (a.isArray(instances) && instances.length > 0) {
                    instances[0].fromObject(data);
                    return instances[0];
                } else {
                    return null;
                }
            }, model);

            // Delete a single entry
            a.mock.add('DELETE', single, function() {
                var parameters = getSearchRequest(model, a.toArray(arguments)),
                    instances  = a.model.pooler.searchInstance(parameters);

                if (a.isArray(instances) && instances.length > 0) {
                    a.model.manager.remove(instances[0].uid);
                }

                return null;
            }, model);
        }

        /**
         * This function helps to use inside a state.
         *
         * @param {String} name                 The request name
         * @return {Function}                   A state ready to use function
        */
        this.state = function(name) {
            var that = this;
            return function(chain) {
                that.request(name, null, chain.next, chain.error);
            };
        };

        /**
         * Send a request to server, or, if using mock, use mock object instead.
         *
         * @param {String} name                 The request name
         * @param {Object} data                 Any data to pass to request
         * @param 
        */
        this.request = function(name, data, success, error) {
            var req = this.store.get('request.' + name);
            if (req) {
                // TODO: Call request

            } else {
                error();
            }
        }
    };
})(window.appstorm);;// Final script, appstorm is ready
a.message.dispatch('ready');