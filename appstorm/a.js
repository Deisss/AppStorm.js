/* ************************************************************************

    License: MIT Licence

    Dependencies : []

    Events : []

    Description:
        Main AppStorm.JS functionality, create some needed system to help plugin or user

************************************************************************ */

/*
 * Bind AppStorm.JS to underscore
*/
window.appstorm = window.a = _.noConflict();

_.extend(window.a, {
    /**
     * Store default ajax options
     *
     * @private
    */
    __defaultAjaxOptions: {},

    /**
     * The core url (for vendor loading)
     *
     * @property url
     * @type String
    */
    url: '',

    /**
     * Get the existing stack trace
     *
     * @method getStackTrace
     *
     * @return {String} Stack trace
    */
    getStackTrace: function() {
        var err = new Error();
        return err.stack;
    },

    /**
     * If the element is null or undefined
     *
     * @param obj {Object} The element to test
    */
    isNone: function(obj) {
        return (a.isNull(obj) || a.isUndefined(obj));
    },

    /**
     * Define the default ajax options to send on every request.
     * At any time, by providing good options, you can override this content on a single ajax request.
     *
     * @method setDefaultAjaxOptions
     *
     * @param options {Object} The default options to set
    */
    setDefaultAjaxOptions : function(options) {
        if(a.isObject(options)) {
            this.__defaultAjaxOptions = options;
        }
    },

    /**
     * Get the default ajax options currently stored (and used by every ajax request)
     *
     * @method getDefaultAjaxOptions
     *
     * @return {Object} The default ajax options setted
    */
    getDefaultAjaxOptions : function() {
        return this.__defaultAjaxOptions;
    }
});

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