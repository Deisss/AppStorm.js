/* ************************************************************************

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-10

	Date of last modification: 2013-07-11

	Dependencies : [
		a.js
	]

	Events : []

	Description:
		Simple one tick timer

************************************************************************ */

/**
 * Timer is a class to get access to a tick timer
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:timer">here</a>
 *
 * @class timer
 * @static
 * @namespace a
*/
a.timer = (function() {
	"use strict";

	var __delay = 50,
		__data = {};

	/**
	 * Proceed timer tick
	 *
	 * @method __tick
	 * @private
	*/
	function __tick() {
		// We dispatch a new tick
		a.message.dispatch("a.timer.tick", {});

		// For every stored function, we scan and apply
		for(var i in __data) {
			var obj = __data[i];
			obj.current += __delay;

			// If it's time to tick
			if(obj.current >= obj.timeout) {
				obj.current = 0;
				if(a.isFunction(obj.fct)) {
					var scp = (a.isObject(obj.scope)) ? obj.scope : null;
					// Using closure to not link function to global process
					(function(f, s) {
						f.call(s, null);
					})(obj.fct, scp);
				}
			}
		}
	};

	/**
	 * Generate a new random
	 *
	 * @method __generate
	 * @private
	 *
	 * @return A new integer generated
	*/
	function __generate() {
		var rnd = Math.floor(Math.random() * 1000000);

		while(!a.isNull(__data[rnd])) {
			rnd = Math.floor(Math.random() * 1000000)
		}

		return rnd;
	};

	// Auto-start timer
	setInterval(__tick, __delay);

	return {
		/**
		 * Register a function into timer tick
		 *
		 * @method add
		 * @async
		 *
		 * @param fct {Function} The function to bind
		 * @param scope {Object | null} The scope to bind to function
		 * @param timeout {Integer} The timeout when calling function
		 * @return {Integer} A generated id used to manipulate ticker access
		*/
		add : function(fct, scope, timeout) {
			var id = __generate();

			if(!a.isNumber(timeout) || timeout <= 0) {
				timeout = 1000;
				a.console.error("The timeout has not been setted properly into timer, timeout has been setted to 1000ms", 1);
			}

			__data[id] = {
				fct : fct,
				scope : scope,
				timeout : timeout,
				current : 0
			};
			return id;
		},

		/**
		 * Register a function for a single timer shot
		 *
		 * @method once
		 * @async
		 *
		 * @param fct {Function} The function to bind
		 * @param scope {Object | null} The scope to bind to function
		 * @param timeout {Integer} The timeout when calling function
		 * @return {Integer} A generated id used to manipulate ticker access
		*/
		once : function(fct, scope, timeout) {
			var id = this.add(function() {
				if(a.isFunction(fct)) {
					fct.call(this, null);
				}
				a.timer.remove(id);
			}, scope, timeout);
			return id;
		},

		/**
		 * Get a function registred into the timer
		 *
		 * @method get
		 *
		 * @return {Object | null} The object linked to id, or null if nothing is found
		*/
		get : function(id) {
			var item = __data[id];
			if(a.isNull(item)) {
				return null;
			}
			return item;
		},

		/**
		 * Remove a function registred into the timer
		 *
		 * @method remove
		 *
		 * @param id {Integer} The id to delete
		 * @return {Boolean} The item has been delete or not
		*/
		remove : function(id) {
			var item = __data[id];
			if(!a.isNull(item)) {
				delete __data[id];
				return true;
			}
			return false;
		},

		/**
		 * Clear the current timer content
		 *
		 * @method clear
		*/
		clear : function() {
			__data = {};
		}
	};
})();