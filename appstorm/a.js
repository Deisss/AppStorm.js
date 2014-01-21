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
a.__defaultAjaxOptions = {};

/**
 * The core url (for vendor loading)
 *
 * @property url
 * @type String
*/
a.url = '';

/**
 * Get the existing stack trace
 *
 * @method getStackTrace
 *
 * @return {String} Stack trace
*/
a.getStackTrace = function() {
    var err = new Error();
    return err.stack;
};

/**
 * If the element is null or undefined
 *
 * @param obj {Object} The element to test
*/
a.isNone = function(obj) {
    return (a.isNull(obj) || a.isUndefined(obj));
};

/**
* Duplicate a state (used internally)
* FROM : http://www.xenoveritas.org/blog/xeno/the-correct-way-to-clone-javascript-arrays
* Credits to them ! Little bug corrected :p
*
* @method clone
*
* @param obj {Object} A state object
* @return {Object} A new state object
*/
a.deepClone = function(obj) {
    // The deep clone only take care of object, and not function
    if (a.isObject(obj) && !a.isFunction(obj)) {
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
            if(a.isObject(obj.prototype)) {
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
 * Define the default ajax options to send on every request.
 * At any time, by providing good options, you can override this content on a single ajax request.
 *
 * @method setDefaultAjaxOptions
 *
 * @param options {Object} The default options to set
*/
a.setDefaultAjaxOptions = function(options) {
    if(a.isObject(options)) {
        a.mem.set('app.ajax.default', options);
        this.__defaultAjaxOptions = options;
    }
};

/**
 * Get the default ajax options currently stored (and used by every ajax request)
 *
 * @method getDefaultAjaxOptions
 *
 * @return {Object} The default ajax options setted
*/
a.getDefaultAjaxOptions = function() {
    return this.__defaultAjaxOptions;
};

/*
 * Check AppStorm.JS source url
*/
(function() {
    // Detecting base url of AppStorm.JS
    var me = document.getElementById('a-core');
    if(me && typeof(me.src) !== 'undefined') {
        a.url = me.src.replace(new RegExp('/[^/]*$'), '/');
    }
}());