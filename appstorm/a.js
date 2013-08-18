"use strict";
/* ************************************************************************

	Version: 0.4

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-10

	Date of last modification: 2013-07-11

	Dependencies : []

	Events : [
		message : {
			a.message.add {type : the type listeners (like "a.storage.add"), function : the associated function}
			a.message.remove {type : the type listeners (like "a.storage.add"), function : the associated function}
			a.message.removeAll {type : the type listeners (like "a.storage.add")}
			a.message.clear {}
		},
		ajax : {
			a.ajax : {success : boolean (true fine, false error), status : http code result, url : the url used (before data join), method : the method used, params : the parameters used for request}
		},
		environment : {
			a.environment.add : {key : the environment key added/modified, value : the value linked to}
			a.environment.remove : {key : the environment key removed}
		}
	]

	Description:
		Main AppStorm.JS functionnality, create some needed system to help plugin or user

		loader : Dynamic loader for many files type
		console : Console functionnality, the system will automatically choose what kind of console is acceptable or not
		parser : provide parsing functionnality for using json, xml, html...
		message : define one reusable object (eventEmitter) and create a root event system (message) ( @see : http://simplapi.wordpress.com/2012/09/01/custom-event-listener-in-javascript/ )
		environment : Environment functionnality, to get access to some basic "main options" for system
		ajax : Send a request to server side
		synchronizer : load many async function, and wait for final one to start final callback

************************************************************************ */


/**
 * Main AppStorm.JS object (define only the main objects here)
 *
 * @module a
*/
window.appstorm = window.a = (function() {
	"use strict";

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
		}
	};

	// Detecting base url of AppStorm.JS
	var me = document.getElementById("a-core");
	if(me && typeof(me.src) !== "undefined") {
		obj.url = me.src.replace(new RegExp("/[^/]*$"), "/");
	}

	return obj;
}());


/**
 * wrapper for system console, allowing to use console even if there is not console support on given browser.
 * Also, it does provide a trace utility in case of bug/check
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:console">here</a>
 *
 * @class console
 * @static
 * @namespace a
*/
a.console = (function() {
	"use strict";

	// Store some data if console.log is not available
	var __data = {log : [], warn : [], info : [], error : []};

	/**
	 * Output to console any given value. If console is not ready, the content will be stored into object, the list function allow to access stored content in this case
	 *
	 * @method __out
	 * @private
	 *
	 * @param type {String} The type, like "log", "warn", "info", "error", ...
	 * @param value {Mixed} The value to output
	 * @param level {Integer | null} Indicate the message priority level, can be null
	 * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
	*/
	function __out(type, value, level, appear) {
		// Rollback to log in case of problem
		if(!a.isArray(__data[type])) {
			type = "log";
		}
		__data[type].push(value);

		// Bug: IE does not support testing variable existence if they are not scopped with the root (here window)
		if(!a.isNull(window.console) && a.isFunction(window.console.log) && appear !== false) {
			// We disable log depending of console level.
			// If no console, or log level, we allow all
			switch(a.environment.get("console")) {
				case "error":
					if(type !== "error") {
						break;
					}
				case "warning":
				case "warn":
					if(type !== "warn" && type !== "error") {
						break;
					}
				case "info":
					if(type === "log") {
						break;
					}
				default:
					var print = true,
						found = false;

					// We search for fine verbose element
					if(a.isString(value) && value.indexOf(":") >= 0) {
						var name     = value.substr(0, value.indexOf(":")),
							splitted = name.split("."),
							i        = splitted.length;

						// We go from full array recomposed, to only first item
						while(i--) {
							var key = "verbose-" + splitted.join("."),
								en  = a.environment.get(key);

							if(!a.isNull(en)) {
								found = true;
								print = (en < level) ? false : true;
								break;
							}

							// We don't find any, we go one level up
							splitted.pop();
						}
					}

					// Check the verbose state to know if we should print or not
					if(!found && !a.isNull(a.environment.get("verbose")) && !a.isNull(level)) {
						var iverb = parseInt(a.environment.get("verbose"), 10);
						if(iverb < level) {
							print = false;
						}
					}
					if(print) {
						window.console[type](value);
					}
					break;
			};
		}

		// If data exceed limit, we remove some
		while(__data[type].length > 2000) {
			__data[type].shift();
		}
	};

	return {
		/**
		 * Log data
		 *
		 * @method log
		 *
		 * @param value {Mixed} The value to log on debug
		 * @param level {Integer | null} Indicate the message priority level, can be null
		 * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
		*/
		log : function(value, level, appear) {		__out("log", value, level, appear);	},

		/**
		 * Warning data
		 *
		 * @method warn
		 *
		 * @param value {Mixed} The value to warning on debug
		 * @param level {Integer | null} Indicate the message priority level, can be null
		 * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
		*/
		warn : function(value, level, appear) {	__out("warn", value, level, appear);	},

		/**
		 * Information data
		 *
		 * @method info
		 *
		 * @param value {Mixed} The value to inform on debug
		 * @param level {Integer | null} Indicate the message priority level, can be null
		 * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
		*/
		info : function(value, level, appear) {	__out("info", value, level, appear);	},

		/**
		 * Error data
		 *
		 * @method error
		 *
		 * @param value {Mixed} The value to error on debug
		 * @param level {Integer | null} Indicate the message priority level, can be null
		 * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
		*/
		error : function(value, level, appear) {	__out("error", value, level, appear);	},

		/**
		 * List all currently stored content
		 *
		 * @method trace
		 *
		 * @param type {String | null} The string type (can be null)
		 * @return The stored data, the object got 4 properties : log, info, warn, error
		*/
		trace : function(type) {
			return (a.isString(type) && type in __data) ? __data[type] : __data;
		},

		/**
		 * Clear the stored content
		 *
		 * @method clear
		*/
		clear : function() {
			__data = {log : [], warn : [], info : [], error : []};
		}
	};
}());



/**
 * provide parsing functionality for using json, xml, html...
 *
 * @class parser
 * @static
 * @namespace a
*/
a.parser = {
	/**
	 * Basic JSON handler wich prevent from "no data" or "wrong data" input, with a log message to check
	 *
	 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:parser">here</a>
	 *
	 * @class json
	 * @static
	 * @namespace a.parser
	*/
	json : {
		/**
		 * Serialize a JSON into a string
		 *
		 * @method stringify
		 *
		 * @param value {Mixed} Any data to be converted into String
		 * @return {String} A parsed string, or an empty string if the parsing fails
		*/
		stringify : function(value) {
			try {
				return JSON.stringify(value);
			} catch(e) {
				a.console.error("a.parser.json.stringify : unable to stringify the value : " + value, 1);
				return "";
			}
		},

		/**
		 * Deserialize a string into JSON
		 *
		 * @method parse
		 *
		 * @param value {String} The value un-stringify
		 * @return {Mixed | null} The converted value
		*/
		parse : function(value) {
			try {
				return JSON.parse(value);
			} catch(e) {
				a.console.error("a.parser.json.parse : unable to parse the value : " + value, 1);
				return null;
			}
		}
	},

	/**
	 * Basic XML handler wich prevent from "no data" or "wrong data" input, with a log message to check
	 *
	 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:parser">here</a>
	 *
	 * @class xml
	 * @static
	 * @namespace a.parser
	*/
	xml : {
		/**
		 * Serialize a XML into a string
		 *
		 * @method stringify
		 *
		 * @param value {Mixed} Any data to be converted into String
		 * @return {String} A parsed string, or an empty string if the parsing fails
		*/
		stringify : function(value) {
			if(!a.isNull(value) && !a.isNull(value.xml)) {
				return value.xml;
			} else if(!a.isNull(window.XMLSerializer)) {
				try {
					return (new window.XMLSerializer()).serializeToString(value);
				} catch(e) {
					a.console.error("a.parser.xml.stringify : unable to stringify the value : " + value, 1);
					return "";
				}
			}
			a.console.error("a.parser.xml.stringify : unable to find any parser available", 1);
			return "";
		},

		/**
		 * Deserialize a string into XML
		 *
		 * @method parse
		 *
		 * @param value {String} The value un-stringify
		 * @return {DOCElement | null} The resulting doc element (null in case of problem)
		*/
		parse : function(value) {
			if(!a.isNull(window.ActiveXObject)) {
				var doc = null;
				var msxml = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.5.0", "Msxml2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0"];
				for(var i=0, l=msxml.length; i<l; ++i) {
					try {
						doc = new ActiveXObject(msxml[i]);
					} catch(e) {}
				}
				doc.async = false;
				doc.loadXML(value);
				if (doc.parseError.errorCode != 0) {
					a.console.error("a.parser.xml.parse : error while parsing content : " + doc.parseError.reason, 1);
					return null;
				}
				return doc;
			} else if(!a.isNull(window.DOMParser)) {
				return (new DOMParser()).parseFromString(value, "text/xml");
			}
			a.console.error("a.parser.xml.parse : unable to find any parser available", 1);
			return null;
		}
	}
};








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
	},

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










/**
 * Main environment data store, allow to generally define some main rules for project
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:environment">here</a>
 *
 * @class environment
 * @static
 * @namespace a
*/
a.environment = (function() {
	"use strict";

	var __data = {
		verbose : 2,
		console : "log"
	};

	return {
		/**
		 * Get the stored value, null if nothing is stored
		 *
		 * @method get
		 *
		 * @param key {String} A value to get
		*/
		get : function(key) {
			if(key in __data) {
				return __data[key];
			}
			return null;
		},

		/**
		 * Set the value to store
		 *
		 * @method set
		 *
		 * @param key {String} The key to store
		 * @param value {Mixed} Some data to associate
		*/
		set : function(key, value) {
			if(a.isNull(key)) {
				return;
			}
			a.console.log("a.environment.set: add item (key: " + key + ", value: " + value + ")", 3);
			__data[key] = value;

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
		 * @param key {String} The environment stored key to remove
		*/
		remove : function(key) {
			if(a.isNull(__data[key])) {
				return;
			}
			a.console.log("a.environment.remove: remove item (key: " + key + ")", 3);
			delete __data[key];

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
			__data = {
				verbose : 2,
				console : "log"
			};
		}
	}
}());












/**
 * Ajax object to call server
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:ajax">here</a>
 *
 * @class ajax
 * @namespace a
 * @constructor
 * @async
 *
 * @param options {Object} An option map to change the behaviour of component
 * @param success {Function} The success function called in case of async
 * @param error {Function} The error function called in case of async
*/
a.ajax = function(options, success, error) {
	"use strict";

	this.params = {
		url    : "",    //Allowed type : any URL
		method : "GET", //Allowed type : "GET", "POST"
		type   : "raw", //Allowed type : raw, json, xml
		async  : true,  //Allowed type : true, false
		cache  : false, //Allowed type : true, false
		data   : {},    //Allowed type : any kind of object composed of key => value
		header : {}     //Allowed type : any kind of object composed of key => value
	};

	// Binding result function
	this.success = (a.isFunction(success)) ? success : function(){};
	this.error   = (a.isFunction(error)) ? error : function(){};

	//Populate params with options
	for(var p in this.params) {
		//We check given options are same type
		if(p in options && typeof(options[p]) === typeof(this.params[p])) {
			this.params[p] = options[p];
		}
	}

	// Handle specific case for data
	if(a.isString(options.data)) {
		this.params.data = options.data;
	}

	// Detecting browser support of ajax (including old browser support
	this.request = null;
	if(!a.isNull(window.XMLHttpRequest)) {
		this.request = new XMLHttpRequest();
	// Internet explorer specific
	} else {
		var msxml = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
		for(var i in msxml) {
			try {
				this.request = new ActiveXObject(msxml[i]);
			} catch(e) {}
		}
	}
};

/**
 * Parse the data to return the formated object (if needed)
 *
 * @method parseResult
 *
 * @param params {Object} The parameter list from configuration ajax
 * @param http {Object} The xmlHttpRequest started
 * @return {Object | String} The parsed results
*/
a.ajax.prototype.parseResult = function(params, http) {
	//We are in non async mode, so the function should reply something
	var type = params.type.toLowerCase();
	if(type === "json") {
		return a.parser.json.parse(http.responseText);
	}
	return (type === "xml") ? http.responseXML : http.responseText;
};

/**
 * Send the ajax request
 *
 * @method send
*/
a.ajax.prototype.send = function() {
	var method = this.params.method.toUpperCase();

	//Creating a cached or not version
	if(this.params.cache === false) {
		// Generate a unique random number
		var rnd = Math.floor(Math.random() * 100000) + 1;
		// Safari does not like this...
		try {
			this.params.data["cachedisable"] = rnd;
		} catch(e) {}
	}

	//Creating the url with GET
	var toSend = "";

	if(a.isString(this.params.data)) {
		toSend = this.params.data;
	} else {
		for(var d in this.params.data) {
			toSend += encodeURIComponent(d) + "=" + encodeURIComponent(this.params.data[d]) + "&";
		}
		//toSend get an extra characters & at the end, removing it
		toSend = toSend.slice(0, -1);
	}

	var url = this.params.url,
		async = this.params.async;
	if(method === "GET" && toSend !== "") {
		url += "?" + toSend;
	}

	//Catching the state change
	if(async === true) {
		// Scope helper
		var scope = {
			success : this.success,
			params : this.params,
			error : this.error,
			request : this.request,
			parseResult : this.parseResult
		};

		this.request.onreadystatechange = function() {
			// Any 200 status will be validated
			if(scope.request.readyState === 4) {
				var great = (scope.request.status >= 200 && scope.request.status < 300);
				if(great) {
					// Everything went fine
					scope.success(scope.parseResult(scope.params, scope.request), scope.request.status);
				} else {
					// An error occurs
					scope.error(url, scope.request.status);
				}

				// We send a result
				a.message.dispatch("a.ajax", {
					success : great,
					status : scope.request.status,
					url : scope.params.url,
					method : scope.method,
					params : scope.params
				});
			}
		};
	}

	//Openning the url
	this.request.open(method, url, async);

	if(method === "POST") {
		this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	}

	//Setting headers (if there is)
	for(var h in this.params.header) {
		this.request.setRequestHeader(h, this.params.header[h]);
	}

	this.request.send(toSend);

	return (async === false) ? this.parseResult(this.params, this.request) : "No return in async mode";
};




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
	var delay = 50,
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
			obj.current += delay;

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
	setInterval(__tick, delay);

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





/**
 * Dynamic loader for many files type
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:loader">here</a>
 *
 * @class loader
 * @static
 * @namespace a
*/
a.loader = (function() {
	"use strict";

	// Store some cache here
	var __cache = [],
		// Store the number of css files currently loading threw timer hack...
		nCSS = 0,
		nJS  = 0,
		htmlMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"];

	/**
	 * Check the cache, and launch callback if uri is already listed in cache
	 *
	 * @method __checkCache
	 * @private
	 * @async
	 *
	 * @param uri {String} The path to access data
	 * @param callback {Function | null} The callback to apply after loader
	 * @return {Boolean} True if it's already inside cache, and false in other case
	*/
	function __checkCache(uri, callback) {
		// Search in cache
		if(a.isNull(uri)) {
			return false;
		}

		for(var i=0, l=__cache.length; i<l; ++i) {
			if(__cache[i] === uri) {
				// This exist in cache, we directly call callback
				if(a.isFunction(callback)) {
					callback();
				}
				return true;
			}
		}

		return false;
	};

	/**
	 * Insert into cache if needed the uri
	 *
	 * @method __populateCache
	 * @private
	 *
	 * @param uri {String} The path to access data
	 * @param args {Object} The arguments to check if cache is specified and policy to use
	*/
	function __populateCache(uri, args) {
		// By default, we cache
		if(!a.isNull(args) && args.cache === false) {
			return;
		}
		__cache.push(uri);
	};

	/**
	 * Append to header the given tag, used by JS and CSS loader especially
	 *
	 * @method __appendToHeader
	 * @private
	 * @async
	 *
	 * @param el {DOM} A createElement type result
	 * @param options {Object} HTML Options to add to link appended
	 * @param callback {Function | null} The callback to apply after loader
	 * @param uri {String} The path to access data
	 * @param args {Object | null} The arguments to check if cache is specified and policy to use
	 * @param error {Function | null} The callback to raise in case of problem (never used)
	*/
	function __appendToHeader(el, options, callback, uri, args, error) {
		for(var i in options) {
			el.setAttribute(i, options[i]);
		}

		if(!a.isNull(args) && args.id) {
			el.setAttribute("id", args.id);
		}

		// Handle if system already trigger or not callback

		var trigger = false;
		// The common callback for both onload and readystatechange
		var cb = function(e) {
			if(trigger) {
				return;
			}

			trigger = true;
			if(a.isFunction(callback)) {
				callback(el);
			}
			__populateCache(uri, args);
		};

		if(el.addEventListener) {
			el.addEventListener("load", cb, false);
		} else if(el.readyState) {
			el.onreadystatechange = function() {
				if (this.readyState === "complete" || this.readyState === "loaded") {
					cb();
				}
			};
		} else {
			el.onload = cb;
		}

		// Hack for old Firefox/webkit browsers (who does not have onload on link elements)
		// Note : using 'onload' in document.createElement('link') is not always enough
		// By default, too many browser got this bug, so we always activate it
		if(options.type === "text/css") {
			var currentCSS = document.styleSheets.length;
			nCSS++;
			var cssLoad = a.timer.add(
				function() {
					if (document.styleSheets.length > (currentCSS + nCSS - 1)) {
						nCSS--;
						a.timer.remove(cssLoad);
						cb();
					}   
				}
			, null, 50);
		}

		// Inserting document into header
		document.getElementsByTagName("head")[0].appendChild(el);
	};

	/**
	 * load some data threw AJAX
	 *
	 * @method __ajaxLoader
	 * @private
	 * @async
	 *
	 * @param uri {String} The data path
	 * @param callback {Function | null} The callback to apply in case of success
	 * @param args {Object | null} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
	 * @param error {Function | null} The callback to apply in case of error
	*/
	function __ajaxLoader(uri, callback, args, error) {
		var options = {
			url    : uri,   //Allowed type : any URL
			method : "GET", //Allowed type : "GET", "POST"
			type   : "raw", //Allowed type : raw, json, xml
			async  : true,  //Allowed type : true, false
			cache  : true,  //Allowed type : true, false
			data   : {},    //Allowed type : any kind of object composed of key => value
			header : {}     //Allowed type : any kind of object composed of key => value
		};

		a.console.log("a.loader: load resource (url: " + uri + ")", 3);
		if(!a.isNull(args)) {
			if(a.contains(htmlMethods, args.method) ) {
				options.method = args.method;
			}
			if(!a.isNull(args.type) && (args.type === "json" || args.type === "xml") ) {
				options.type = args.type;
			}
			if(a.isObject(args.data)) {
				options.data = args.data;
			}
			if(a.isObject(args.header)) {
				options.header = args.header;
			}
			if(a.isBoolean(args.cache)) {
				options.cache = args.cache;
			}
		}

		// The real callback handling response
		var handlerCallback = function(content, status) {
			if(a.isFunction(callback)) {
				callback(content, status);
			}
			__populateCache(uri, args);
		};

		// Loading data
		var er = (a.isFunction(error)) ? error : function(){};
		(new a.ajax(options, handlerCallback, er)).send();
	};

	return {
		/**
		 * Javascript loader
		 *
		 * @method js
		 * @async
		 *
		 * @param uri {String} The path to access content
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
		*/
		js : function(uri, callback, args, error) {
			if(__checkCache(uri, callback)) {
				return;
			}

			this.jsonp(uri, callback, args, error);
		},

		/**
		 * JSONP loader
		 *
		 * @method jsonp
		 * @async
		 *
		 * @param uri {String} The path to access content
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
		*/
		jsonp : function(uri, callback, args, error){
			var type = (a.isObject(args) && args.type) ? args.type : "text/javascript";
			a.console.log("a.loader: load resource (url: " + uri + ")", 3);
			__appendToHeader(document.createElement("script"), {
					type : type,
					src : uri
				}, callback, uri, args, error
			);
		},

		/**
		 * JSON loader
		 *
		 * @method json
		 * @async
		 *
		 * @param uri {String} The path to access content
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
		*/
		json : function(uri, callback, args, error) {
			// Setting type
			if(!a.isObject(args)) {
				args = {};
			}
			args.type = "json";

			// Setting the accepted return type
			if(!a.isObject(args.header)) {
				args.header = {};
			}
			args.header["accept"] = "application/json, text/javascript";

			__ajaxLoader(uri, callback, args, error);
		},

		/**
		 * XML loader
		 *
		 * @method xml
		 * @async
		 *
		 * @param uri {String} The path to access content
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
		*/
		xml : function(uri, callback, args, error) {
			// Setting the type
			if(!a.isObject(args)) {
				args = {};
			}
			args.type = "xml";

			// Setting the accepted return type
			if(!a.isObject(args.header)) {
				args.header = {};
			}
			args.header["accept"] = "application/xml, text/xml";

			__ajaxLoader(uri, callback, args, error);
		},

		/**
		 * CSS loader
		 *
		 * @method css
		 * @async
		 *
		 * @param uri {String} The path to access content
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
		*/
		css : function(uri, callback, args, error) {
			if(__checkCache(uri, callback)) {
				return;
			}

			a.console.log("a.loader: load resource (url: " + uri + ")", 3);
			__appendToHeader(document.createElement("link"), {
					rel  : "stylesheet",
					type : "text/css",
					href : uri
				}, callback, uri, args, error
			);
		},

		/**
		 * HTML loader
		 * NOTE : only valid XHTML is accepted !
		 *
		 * @method html
		 * @async
		 *
		 * @param uri {String} The path to access content
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An ajax argument object, not all of them are used (some are automatically generated and cannot be changed)
		*/
		html : function(uri, callback, args, error) {
			if(__checkCache(uri, callback)) {
				return;
			}

			// Setting type
			if(!a.isObject(args)) {
				args = {};
			}
			args.type = "raw";

			// In debug mode, we disallow cache
			if(a.environment.get("debug") === true) {
				args.cache = false;
			}

			// Setting the accepted return type
			if(!a.isObject(args.header)) {
				args.header = {};
			}
			args.header["accept"] = "text/html";
			__ajaxLoader(uri, callback, args, error);
		},

		/**
		 * JavaFX loader
		 *
		 * @method javafx
		 * @async
		 *
		 * @param uri {String} The path for given jar files to load
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An object to set property for javaFX (like javascript name...), we need : args.code (the main to start), args.id (the id of project). args.width and height are optional
		*/
		javafx : function(uri, callback, args, error) {
			if(a.isNull(args) || a.isNull(args.code) || a.isNull(args.id)) {
				a.console.warn("a.loader.javafx : the system need args.code and args.name setted to be able to load any javafx resource... This uri will not be loaded : " + uri, 3);
				return;
			}

			if(__checkCache(uri, callback)) {
				return;
			}

			// Load (if needed) javaFX javascript include helper
			var version = (args.version) ? args.version : "1.3";
			this.js("http://dl.javafx.com/" + version + "/dtfx.js", function() {
				javafx({
					archive: uri,
					width: args.width || 1,
					height: args.height || 1,
					code: args.code,
					name: args.id
				});
			});

			// There is no "load" event, so we emulate one
			var timer = null,
				max = 2000;

			timer = a.timer.add(function() {
				// Valid when max <ait occurs or system is loaded
				if(max-- > 0 && !a.isNull(document.getElementById(args.id).Packages)) {
					a.timer.remove(timer);
					if(a.isFunction(callback)) {
						callback();
					}
				} else if(max <= 0 && a.isFunction(error)) {
					error(uri, 408);
				}
			}, null, 200);
		},

		/**
		 * Flash loader
		 *
		 * @method flash
		 * @async
		 *
		 * @param uri {String} The path for given swf files to load
		 * @param callback {Function | null} The callback to call after loading success
		 * @param args {Object} An object to set property for Flash
		*/
		flash : function(uri, callback, args, error) {
			if(a.isNull(args) || a.isNull(args.rootId) || a.isNull(args.id)) {
				a.console.warn("a.loader.flash : the system need args parameters : rootId, id, setted to be able to load any flash resource... This uri will not be loaded : " + uri, 3);
				return;
			}

			if(__checkCache(uri, callback)) {
				return;
			}

			// Load (if needed) the swfobject.js to load flash from that
			this.js(a.url + "vendor/storage/flash/swfobject.js", function() {
				swfobject.embedSWF(uri, args.rootId, "100%", "100%", "10.0.0", a.url + "vendor/storage/flash/expressInstall.swf", args.flashvars, args.params, {id : args.id}, function(e) {
					// We do make a small timeout, for a strange reason the success event is not really ready
					if(e.success === false && a.isFunction(error)) {
						error(uri, 408);
					}else if(e.success === true && a.isFunction(callback)) {
						setTimeout(callback, 500);
					}
				});
			});
		},

		/**
		 * Silverlight loader
		 *
		 * @method silverlight
		 * @async
		 *
		 * @param uri {String} The path for given xap files to load
		 * @param callback {Function | null} The callback to call after loading success (NOTE : silverlight is not able to fire load event, so it's not true here...)
		 * @param args {Object} An object to set property for Silverlight
		*/
		silverlight : function(uri, callback, args, error) {
			if(a.isNull(args) || a.isNull(args.rootId) || a.isNull(args.id)) {
				a.console.warn("a.loader.silverlight : the system need args parameters : rootId, id, setted to be able to load any silverlight resource... This uri will not be loaded : " + uri, 3);
				return;
			}

			if(__checkCache(uri, callback)) {
				return;
			}

			a.console.log("a.loader: load resource (url: " + uri + ")", 3);
			var obj = document.createElement("object");
			obj.id = args.id;
			obj.data = "data:application/x-silverlight-2,"
			obj.type = "application/x-silverlight-2";

			if(!a.isArray(args.params)) {args.params = [];}

			// Adding URI to element
			args.params.push({name : "source", value : uri});

			for(var i=0, l=args.params.length; i<l; ++i) {
				var param = document.createElement("param");
				param.name = args.params[i].name;
				param.value = args.params[i].value;
				obj.appendChild(param);
			}

			document.getElementById(args.rootId).appendChild(obj);

			// There is no "load" event, so we emulate one
			var timer = null,
				max = 2000;

			timer = a.timer.add(function() {
				// Valid when max <ait occurs or system is loaded
				if(max-- > 0 && !a.isNull(document.getElementById(args.id).Content)) {
					a.timer.remove(timer);
					callback();
				} else if(max <= 0 && a.isFunction(error)) {
					error(uri, 408);
				}
			}, null, 200);
		},

		/**
		 * Get the cache trace loaded
		 *
		 * @method trace
		 *
		 * @return {Array} The cache trace
		*/
		trace : function() {
			return __cache;
		}
	};
}());