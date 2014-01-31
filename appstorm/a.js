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
window.appstorm = window.a = _.noConflict();


/**
 * Store default ajax options
 *
 * @private
*/
a._defaultAjaxOptions = {};

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
a.scope = function scope(fct, scope) {
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
a.getStackTrace = function getStackTrace() {
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
a.isNone = function isNone(obj) {
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
a.isTrueObject = function isTrueObject(obj) {
    return (typeof(obj) == 'object' && !a.isNone(obj));
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
a.deepClone = function deepClone(obj) {
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
a.extend = function extend(object, source, guard) {
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
  }

/**
 * Define the default ajax options to send on every request.
 * At any time, by providing good options, you can override this content
 * on a single ajax request.
 *
 * @method setDefaultAjaxOptions
 *
 * @param options {Object}                  The default options to set
*/
a.setDefaultAjaxOptions = function setDefaultAjaxOptions(options) {
    if(a.isTrueObject(options)) {
        a.mem.set('app.ajax.default', options);
        this._defaultAjaxOptions = options;
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
a.getDefaultAjaxOptions = function getDefaultAjaxOptions() {
    return this._defaultAjaxOptions;
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