/* ************************************************************************

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-10

	Date of last modification: 2013-10-11

	Dependencies : [
		a.js
	]

	Events : [
		a.message.add {type : the type listeners (like "a.storage.add"), function : the associated function}
		a.message.remove {type : the type listeners (like "a.storage.add"), function : the associated function}
		a.message.removeAll {type : the type listeners (like "a.storage.add")}
		a.message.clear {}
	]

	Description:
		Define one reusable object (eventEmitter) and create a root event system (message)
		( @see : http://simplapi.wordpress.com/2012/09/01/custom-event-listener-in-javascript/ )

************************************************************************ */


/**
 * Simple hash change checker to allow creating multi-page system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:message">here</a>
 *
 * @class eventEmitter
 * @constructor
 * @namespace a
*/
a.eventEmitter = (function() {
	"use strict";

	var obj = function(){
		this.__list = {};
		this.__base = "a.message";
	};

	/**
	 * Clear the unused (empty) types
	 *
	 * @method __clearEventType
	 * @private
	 *
	 * @param type {String} The type associated with current clearing
	*/
	function __clearEventType(type) {
		// At the end, we clear unused listeners array type (we must go backward for multi splice problem)
		for(var i in obj.__list) {
			if(obj.__list[i].length < 1) {
				delete obj.__list[i];
			}
		}
	};

	/**
	 * Set the name of event root type, you can specify your own "root name" to identify more easily the event emitter
	 *
	 * @method setName
	 *
	 * @param name {String} The name to set (default is "a.message")
	*/
	obj.prototype.setName = function(name) {
		this.__base = "" + name;
	};

	/**
	 * Adding a listener to a specific message type
	 *
	 * @method addListener
	 *
	 * @param type {String} The event name
	 * @param fn {Function} The function to attach
	*/
	obj.prototype.addListener = function(type, fn) {
		if(!a.isFunction(fn)) {
			a.console.warn(this.__base + ".addListener : unable to bind function, this is not a function", 1);
			return;
		}

		if(a.isNull(this.__list[type])) {
			this.__list[type] = [];
		}
		this.__list[type].push(fn);

		// Dispatch event
		this.dispatch(this.__base + ".add", {
			type : type,
			fct : fn
		});
	};

	// Alias
	obj.prototype.add = obj.prototype.on = obj.prototype.bind = obj.prototype.addListener;

	/**
	 * Adding a listener only one
	 *
	 * @method addListenerOnce
	 *
	 * @param type {String} The event name
	 * @param fn {Function} The function to attach
	*/
	obj.prototype.addListenerOnce = function(type, fn) {
		var _this = this;

		var once = function(data) {
			fn(data);
			_this.removeListener(type, once);
		};

		this.addListener(type, once);
	};

	// Alias
	obj.prototype.once = obj.prototype.onOnce = obj.prototype.bindOnce = obj.prototype.addListenerOnce;

	/**
	 * Removing a listener to a specific message type
	 *
	 * @method removeListener
	 *
	 * @param type {String} The event name
	 * @param fn {Function} The function to detach
	*/
	obj.prototype.removeListener = function(type, fn) {
		// If the event type is not listed as existing, we don't need to remove anything
		if(a.isNull(this.__list[type])) {
			return;
		}

		// Multiple splice : we must go backward to prevent index error
		var i = this.__list[type].length;
		if(a.isFunction(fn)) {
			while(i--) {
				if(this.__list[type][i] === fn) {
					this.__list[type].splice(i, 1);
				}
			}
		}

		// Dispatch event
		this.dispatch(this.__base + ".remove", {
			type : type,
			fct : fn
		});

		// We clear unused list type
		__clearEventType(type);
	};

	// Alias
	obj.prototype.remove = obj.prototype.off = obj.prototype.unbind = obj.prototype.removeListener;

	/**
	 * Remove all listeners for a given type
	 *
	 * @method removeAllListeners
	 *
	 * @param type {String} The event type to remove
	*/
	obj.prototype.removeAllListeners = function(type) {
		if(!a.isNull(this.__list[type])) {
			this.__list[type] = [];

			// We clear unused list type
			__clearEventType(type);
		}
	};

	// Alias
	obj.prototype.removeAll = obj.prototype.offAll = obj.prototype.unbindAll = obj.prototype.removeAllListeners;


	/**
	 * Clear all listeners from all event type
	 *
	 * @method clear
	*/
	obj.prototype.clear = function() {
		var c = this.__base + ".clear";

		for(var i in this.__list) {
			if(i !== c) {
				delete this.__list[i];
			}
		}

		// Dispatch event
		this.dispatch(c, {});
	};

	/**
	 * Call an event, according to it's type
	 *
	 * @method dispatch
	 *
	 * @param type {String} The event name to dispatch
	 * @param data {Object} Anything you want to pass threw this event
	*/
	obj.prototype.dispatch = function(type, data) {
		var t = this.__list[type];
		if(!a.isNull(t)) {
			for(var i=0, l=t.length; i<l; ++i) {
				// Scoping to not have trouble
				(function(fct) {
					// Binding into timeout for not waiting function to finish
					setTimeout(function() {
						fct(data);
					}, 0);
				})(t[i]);
			}
		}
	};

	return obj;
}());


/**
 * The bus system to exchange message globally between all application object
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:message">here</a>
 *
 * @class message
 * @static
 * @requires eventEmitter
 * @uses eventEmitter
 * @namespace a
*/
// Setting main event loop (general one where everybody can access it from everywhere)
a.message = new a.eventEmitter();
// Removing setName, unused on message object
a.message.setName = function(){};
