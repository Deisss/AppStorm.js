/* ************************************************************************

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-10

	Date of last modification: 2013-07-11

	Dependencies : []

	Events : []

	Description:
		Main AppStorm.JS functionnality, create some needed system to help plugin or user

************************************************************************ */


/**
 * Main AppStorm.JS object (define only the main objects here)
 *
 * @module a
*/
window.appstorm = window.a = (function() {
	"use strict";

	var __defaultAjaxOptions = {};

	/**
	 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core">here</a>
	 *
	 * @class a
	 * @static
	*/
	var obj = {
		/**
		 * The core url (for vendor loading)
		 *
		 * @property url
		 * @type String
		*/
		url : "",

		/**
		 * The value exist in given object/array
		 *
		 * @method contains
		 *
		 * @param obj {Array | Object} A collection to search in
		 * @value {Mixed} The value to search
		*/
		contains : function(obj, value) {
			if(obj instanceof Array) {
				var i = obj.length;
				while(i--) {
					if(obj[i] === value) {
						return true;
					}
				}
			} else if(this.isObject(obj)) {
				return (value in obj);
			}
			return false;
		},

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
		clone : function(obj) {
			if (a.isObject(obj)) {
				// Array cloning
				if(a.isArray(obj)) {
					var l = obj.length,
						r = new Array(l);
					for(var i = 0; i < l; ++i) {
						r[i] = a.clone(obj[i]);
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
						r[k] = a.clone(obj[k]);
					}
					return r;
				}
			}
			return obj;
		},

		/**
		 * Get the existing stack trace
		*/
		getStackTrace: function() {
			var err = new Error();
			return err.stack;
		},

		/**
		 * Check a variable is a number
		 *
		 * @method isNumber
		 *
		 * @param o {Mixed} The variable to check
		 * @return {Boolean} True if it's a number, false in other cases
		*/
		isNumber : function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},

		/**
		 * Check a variable is an object
		 *
		 * @method isObject
		 *
		 * @param o {Mixed} The variable to check
		 * @return {Boolean} True if it's an object, false in other cases
		*/
		isObject : function(o) {
			return (typeof(o) === "object" && o !== null);
		},

		/**
		 * Check a variable is a string
		 *
		 * @method isString
		 *
		 * @param s {Mixed} The variable to check
		 * @return {Boolean} True if it's a string, false in other cases
		*/
		isString : function(s) {
			return (typeof(s) === "string");
		},

		/**
		 * Check a variable is a function
		 *
		 * @method isFunction
		 *
		 * @param s {Mixed} The variable to check
		 * @return {Boolean} True if it's a function, false in other cases
		*/
		isFunction : function(f) {
			return (typeof(f) === "function");
		},

		/**
		 * Test a variable is undefined or null
		 *
		 * @method isNull
		 *
		 * @param u {Mixed} The variable to check
		 * @return {Boolean} True if it's a undefined variable, false in other cases
		*/
		isNull : function(u) {
			return (typeof(u) === "undefined" || u === null);
		},

		/**
		 * Test a variable is a boolean
		 *
		 * @method isBoolean
		 *
		 * @param u {Mixed} The variable to check
		 * @return {Boolean} True if it's a boolean, false in other cases
		*/
		isBoolean : function(b) {
			return (typeof(b) === "boolean");
		},

		/**
		 * Test a variable is an array
		 *
		 * @method isArray
		 *
		 * @param ar {Mixed} The variable to check
		 * @return {Boolean} True if it's an array, false in other cases
		*/
		isArray : function(ar) {
			return (ar instanceof Array);
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
				__defaultAjaxOptions = options;
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
			return __defaultAjaxOptions;
		}
	};

	// Detecting base url of AppStorm.JS
	var me = document.getElementById("a-core");
	if(me && typeof(me.src) !== "undefined") {
		obj.url = me.src.replace(new RegExp("/[^/]*$"), "/");
	}

	return obj;
}());