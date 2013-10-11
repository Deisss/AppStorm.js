/* ************************************************************************

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-10

	Date of last modification: 2013-10-11

	Dependencies : [
		a.js
	]

	Events : [
		a.environment.add : {key : the environment key added/modified, value : the value linked to}
		a.environment.remove : {key : the environment key removed}
	]

	Description:
		Environment functionnality, to get access to some basic "main options" for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some rules for project
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:environment">here</a>
 *
 * @class environment
 * @static
 * @namespace a
*/
a.environment = (function() {
	"use strict";

	// Internal storage
	var __store = {
		verbose : 2,
		console : "log"
	};

	return {
		/**
		 * Get the stored value, null if nothing is stored
		 *
		 * @method get
		 *
		 * @param key {String} The key to get
		 * @return {Object} The result object, or null if key is not found
		*/
		get : function(key) {
			return (key in __store) ? __store[key] : null;
		},

		/**
		 * Set a new value to store
		 *
		 * @method set
		 *
		 * @param key {String} The key to store
		 * @param value {Mixed} Some data to associate to key
		*/
		set : function(key, value) {
			if(a.isNull(key)) {
				return;
			}
			a.console.log("a.environment.set: add item (key: " + key + ", value: " + value + ")", 3);
			__store[key] = value;

			// Dispatch event
			a.message.dispatch("a.environment.add", {
				key : key,
				value : value
			});
		},

		/**
		 * Remove a value stored into environment
		 *
		 * @method remove
		 *
		 * @param key {String} The previously stored key to remove
		*/
		remove : function(key) {
			if(a.isNull(__store[key])) {
				return;
			}
			a.console.log("a.environment.remove: remove item (key: " + key + ")", 3);
			delete __store[key];

			// Dispatch event
			a.message.dispatch("a.environment.remove", {
				key : key
			});
		},

		/**
		 * Clear the stored content (all of them)
		 *
		 * @method clear
		*/
		clear : function() {
			__store = {
				verbose : 2,
				console : "log"
			};
		}
	}
}());