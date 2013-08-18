"use strict";
/* ************************************************************************

	Version: 0.3

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-14

	Date of last modification: 2013-06-03

	Dependencies : [
		a.js
	]

	Events : [
		synchronizer : {
			a.callback.synchronizer.success,
			a.callback.synchronizer.error
		},
		chainer : {
			a.callback.chainer.success
			a.callback.chainer.error
		}
	]

	Description:
		Simple synchronizer/chainer for callback list of functions
		synchronizer : Load many functions at same time, when they all finish raise the final callback
		chainer : Load many functions one by one, when last one finish raise the final callback

************************************************************************ */

/**
 * Simple synchronizer/chainer for Array of functions
 *
 * @class callback
 * @static
 * @namespace a
*/
a.callback = {};

/**
 * Load many functions at same time, when they all finish raise the final callback
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:callback">here</a>
 *
 * @class synchronizer
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.synchronizer = function() {
	"use strict";

	var __callback = [],
		__max      = 0,
		__success  = function(){return true;},
		__fail     = function(){return true;},
		__start    = false,
		__wrong    = false,
		__data     = {};

	// Starting an object
	var obj = function(){};
	obj.prototype = new a.eventEmitter();
	obj.prototype.constructor = this;

	/**
	 * The main function when all scripts synchronize this function will raise success method
	 * Note : you can pass any arguments in any way, they will be sended to success function
	 *
	 * @method __done
	 * @private
	*/
	function __done() {
		__max--;
		if(__max <= 0 && __wrong === false) {
			__start = false;
			obj.prototype.dispatch("a.callback.synchronizer.success", {});
			// The setSuccess check already it's a function type...
			
			__success(__getFullData());
		} else if(__max <= 0) {
			__wrong = false;
			__start = false;
		}
	};

	/**
	 * Register any error into the system, it will stop final success execution in this case
	 * Note : you can pass any arguments in any way, they will be sended to error function
	 *
	 * @method __error
	 * @private
	*/
	function __error() {
		if(__start === true) {
			__wrong = true;
			__start = false;
			obj.prototype.dispatch("a.callback.synchronizer.error", {});
			// The setFail check already it's a function type...
			__fail.apply(this, arguments);
		}
	};

	/**
	 * Add data to store
	 *
	 * @method __setData
	 * @private
	 *
	 * @param key {String} The key to set
	 * @param value {Object} The content to store for given object
	*/
	function __setData(key, value) {
		__data[key] = value;
	};

	/**
	 * Replace the store with given data
	 *
	 * @method __setFullData
	 * @private
	 *
	 * @param data {Object} The store to set
	*/
	function __setFullData(data) {
		if(a.isObject(data)) {
			__data = data;
		}
	};

	/**
	 * Retrieve data from store
	 *
	 * @method __getData
	 * @private
	 *
	 * @return {Object | null} The value stored, or null if it's not set
	*/
	function __getData(key) {
		return (a.isNull(__data[key])) ? null : __data[key];
	};

	/**
	 * Retrieve full store
	 *
	 * @method __getFullData
	 * @private
	 *
	 * @return {Object} The current store
	*/
	function __getFullData() {
		return __data;
	};

	/**
	 * Register success function to apply when all jobs are done
	 *
	 * @method setSuccess
	 *
	 * @param success {Function} The success function to use in case of good result from all callbacks
	*/
	obj.prototype.setSuccess = function(success) {
		__success = (a.isFunction(success)) ? success : __success;
	};
	// Alias
	obj.prototype.setDone = obj.prototype.setSuccess;

	/**
	 * Register fail function to apply when all jobs are done
	 *
	 * @method setFail
	 *
	 * @param fail {Function} The fail function to use in case of bad result from one or more callback
	*/
	obj.prototype.setFail = function(fail) {
		__fail = (a.isFunction(fail)) ? fail : __fail;
	};
	// Alias
	obj.prototype.setError = obj.prototype.setFail;

	/**
	 * Add a callback to existing list of callback to start
	 *
	 * @method addCallback
	 *
	 * @param arguments {Array} Every arguments passed is taken as callback to add, so each arguments should be a function (you can also pass one array argument directly)
	*/
	obj.prototype.addCallback = function() {
		var arr = [];
		if(!a.isNull(arguments[0]) && a.isArray(arguments[0])) {
			arr = arguments[0];
		} else {
			arr = arguments;
		}
		for(var i=0, l=arr.length; i<l; ++i) {
			var callback = arr[i];
			if(a.isFunction(callback)) {
				__max++;
				__callback.push(callback);
				// This should never been used like this...
				if(__start === true) {
					callback({
						success : __done,
						done : __done,
						getData : __getData,
						getFullData : __getFullData,
						setData : __setData,
						setFullData : __setFullData,
						fail : __error,
						error : __error
					});
				}
			}
		}
		if(__start === true) {
			a.console.warn("a.callback.synchronizer.addCallback : you should not add/remove callback when synchronizer is running", 1);
		}
	};

	/**
	 * Remove a function to existing list of functions to start
	 *
	 * @method removeCallback
	 *
	 * @param callback {Function} One of the function to not synchronize anymore
	*/
	obj.prototype.removeCallback = function(callback) {
		for(var i=__callback.length-1; i>=0; --i) {
			if(__callback[i] === callback) {
				// This should never been used like this...
				if(__start === true) {
					a.console.warn("a.callback.synchronizer.removeCallback : you should not add/remove callback when synchronizer is running", 1);
				}
				__max--;
				__callback.splice(i, 1);
			}
		}
	};

	/**
	 * Start the synchronizer system
	 *
	 * @method start
	 *
	 * @param timeout {Integer | null} If specified (and > 0), the system will fail if this timeout (in ms) is raised...
	 * @param args {Object | null} Any arguments you would like to send to all callbacks
	*/
	obj.prototype.start = function(timeout, args) {
		if(__max <= 0) {
			// In this case we directly jump to success
			__done();
			return;
		}

		__start = true;
		__data = {};

		// Starting callback list
		for(var i=0, l=__callback.length; i<l; ++i) {
			// We start every callback with object in parameters to call done when finish, or error
			__callback[i]({
				success : __done,
				done : __done,
				getData : __getData,
				getFullData : __getFullData,
				setData : __setData,
				setFullData : __setFullData,
				fail : __error,
				error : __error
			}, args);
		}

		// If timeout is defined, we allow synchronizer to run in a specific amout or time (timeout)
		if(a.isNumber(timeout) && timeout > 0) {
			setTimeout(function() {
				var intTimeout = parseInt(timeout, 10);
				obj.prototype.dispatch("a.callback.synchronizer.error", {timeout : intTimeout});
				__error({timeout : intTimeout});
			}, timeout);
		} else {
			obj.prototype.dispatch("a.callback.synchronizer.start", {timeout : -1});
		}
	};

	/**
	 * Check if the synchronizer is running or not
	 *
	 * @method isRunning
	 *
	 * @return {Boolean} True the system is running, false the system is not running
	*/
	obj.prototype.isRunning = function() {
		return __start;
	};

	var instance = new obj();
	instance.setName("a.callback.synchronizer");
	return instance;
};





/**
 * Load many functions one by one, when last one finish raise the final callback
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:callback">here</a>
 *
 * @class chainer
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.chainer = function() {
	"use strict";

	var __callback = [],
		__max      = 0,
		__success  = function(){return true;},
		__fail     = function(){return true;},
		__waiting  = [],
		__data     = {};

	// Starting an object
	var obj = function(){};
	obj.prototype = new a.eventEmitter();
	obj.prototype.constructor = this;

	/**
	 * Handle a callback success.
	 * Note : you can pass any arguments in any way, they will be sended to success function or next function
	 *
	 * @method __done
	 * @private
	*/
	function __done() {
		if(__waiting.length == 0) {
			__waiting = [];
			__success(__getFullData());
			obj.prototype.dispatch("a.callback.chainer.success", {});
		} else {
			obj.prototype.start(arguments);
		}
	};

	/**
	 * Handle a callback error
	 * Note : you can pass any arguments in any way, they will be sended to error function
	 *
	 * @method __error
	 * @private
	*/
	function __error() {
		__waiting = [];
		__fail.apply(this, arguments);
		obj.prototype.dispatch("a.callback.chainer.error", {});
	};

	/**
	 * Add data to store
	 *
	 * @method __setData
	 * @private
	 *
	 * @param key {String} The key to set
	 * @param value {Object} The content to store for given object
	*/
	function __setData(key, value) {
		__data[key] = value;
	};

	/**
	 * Replace the store with given data
	 *
	 * @method __setFullData
	 * @private
	 *
	 * @param data {Object} The store to set
	*/
	function __setFullData(data) {
		if(a.isObject(data)) {
			__data = data;
		}
	};

	/**
	 * Retrieve data from store
	 *
	 * @method __getData
	 * @private
	 *
	 * @return {Object | null} The value stored, or null if it's not set
	*/
	function __getData(key) {
		return (a.isNull(__data[key])) ? null : __data[key];
	};

	/**
	 * Retrieve full store
	 *
	 * @method __getFullData
	 * @private
	 *
	 * @return {Object} The current store
	*/
	function __getFullData() {
		return __data;
	};

	/**
	 * Register success function to apply when all jobs are done
	 *
	 * @method setSuccess
	 *
	 * @param success {Function} The success function to use in case of good result from all callbacks
	*/
	obj.prototype.setSuccess = function(success) {
		__success = (a.isFunction(success)) ? success : __success;
	};
	// Alias
	obj.prototype.setDone = obj.prototype.setSuccess;

	/**
	 * Register fail function to apply when all jobs are done
	 *
	 * @method setFail
	 *
	 * @param fail {Function} The fail function to use in case of bad result from one or more callback
	*/
	obj.prototype.setFail = function(fail) {
		__fail = (a.isFunction(fail)) ? fail : __fail;
	};
	// Alias
	obj.prototype.setError = obj.prototype.setFail;

	/**
	 * Add a callback to existing list of callback to start
	 *
	 * @method addCallback
	 *
	 * @param arguments {Array} Every arguments passed is taken as callback to add, so each arguments should be a function (you can also pass one array argument directly)
	*/
	obj.prototype.addCallback = function() {
		var arr = [];
		if(!a.isNull(arguments[0]) && a.isArray(arguments[0])) {
			arr = arguments[0];
		} else {
			arr = arguments;
		}
		for(var i=0, l=arr.length; i<l; ++i) {
			var callback = arr[i];
			if(a.isFunction(callback)) {
				__callback.push(callback);
				// This should never been used like this...
				if(obj.prototype.isRunning() === true) {
					__waiting.push(callback);
				}
			}
		}
		if(obj.prototype.isRunning() === true) {
			a.console.warn("a.synchronizer.addCallback : you should not add/remove callback when synchronizer is running", 1);
		}
	};

	/**
	 * Remove a function to existing list of functions to start
	 *
	 * @method removeCallback
	 *
	 * @param callback {Function} One of the function to not synchronize anymore
	*/
	obj.prototype.removeCallback = function(callback) {
		for(var i=__callback.length-1; i>=0; --i) {
			if(__callback[i] === callback) {
				// This should never been used like this...
				if(obj.prototype.isRunning() === true) {
					// Should never been used like this...
					for(var j=__waiting.length-1; j>=0; --j) {
						if(__waiting[j] === callback) {
							__waiting.splice(j, 1);
						}
					}
					a.console.warn("a.synchronizer.removeCallback : you should not add/remove callback when synchronizer is running", 1);
				}
				__callback.splice(i, 1);
			}
		}
	};

	/**
	 * Start the chainer
	 * Note : every arguments passed to this function will be sended to first callback functions.
	 *
	 * @method start
	 *
	 * @param args {Object | null} any data to set for other callback
	*/
	obj.prototype.start = function() {
		// User request a start
		if(__waiting.length == 0) {
			// Duplicate entry from callback
			for(var i=0, l=__callback.length; i<l; ++i) {
				__waiting.push(__callback[i]);
			}

			obj.prototype.dispatch("a.callback.chainer.start", {});
			__data = {};

			// If waiting is still empty, we directly jump to success
			if(__waiting.length == 0) {
				__done();
			}
		}

		// We start or continue to callback
		var callback = __waiting.shift();
		if(a.isFunction(callback)) {
			callback({
				success : __done,
				done : __done,
				getData : __getData,
				getFullData : __getFullData,
				setData : __setData,
				setFullData : __setFullData,
				fail : __error,
				error : __error
			}, arguments);
		}
	};

	/**
	 * Check if the chainer is running or not
	 *
	 * @method isRunning
	 *
	 * @return {Boolean} True the system is running, false the system is not running
	*/
	obj.prototype.isRunning = function() {
		return (__waiting.length == 0) ? false : true;
	}

	var instance = new obj();
	instance.setName("a.callback.chainer");
	return instance;
};