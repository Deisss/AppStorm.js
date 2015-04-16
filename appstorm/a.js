/* ************************************************************************

    License: MIT Licence

    Dependencies : []

    Events : []

    Description:
        Main AppStorm.JS functionality, create some needed system to help plugin or user

************************************************************************ */

;


/*
 * Bind AppStorm.JS to underscore
*/
window.appstorm = window.a = _.cloneDeep(_.noConflict());
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
    }
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
    return (typeof(obj) == 'object' && !a.isNone(obj));
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
                r = new Array(l);
            for(var i = 0; i < l; ++i) {
                r[i] = a.deepClone(obj[i]);
            }
            return r;

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

    if ((type == 'number' || type == 'string') && args[3]
                                && args[3][guard] === source) {
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
})();