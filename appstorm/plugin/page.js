"use strict";
/* ************************************************************************

	Version: 0.3

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-14

	Date of last modification: 2013-07-12

	Dependencies : [
		a.js
		plugin/callback.js
		plugin/language.js (optional)

		** Mustache.js OR handlebars.js IS NEEDED AND IS EXTERNAL LIBRARY **
	]

	Events : [
		event {
			a.page.event.resize    : {}
			a.page.event.load      : {}
			a.page.event.unload    : {}
			a.page.event.hibernate : {}
			a.page.event.hash      : {value : current value, old : previous value}
		}
	]

	Description:
		Manipulate the page event, history. We define here some usefull function to catch some important event (page lifetime)

		template : Create a simple but powerfull template system
		event : Catch here basic windows event : onload, onunload, onresize, onhibernate, onhash

************************************************************************ */
/**
 * Main plugin structure
 *
 * @class page
 * @static
 * @namespace a
*/
a.page = {};




/**
 * Create a simple but powerfull template system
 *
 * @class template
 * @static
 * @namespace a.page
*/
a.page.template = {
	/**
	 * Store cached template
	 * @property __tmpl
	 * @type Object
	 * @default {}
	*/
	__tmpl : {},

	/**
	 * Use cache or retrieve a specific template from network
	 *
	 * @method get
	 *
	 * @param uri {String} The path to get the template, or an id if the template already listed in html
	 * @param data {Object} The data to apply to template
	 * @param callback {Function} The callback to apply when template finish loading
	 * @param error {Function | null} The error to raise in case of problem
	*/
	get : function(uri, data, callback, error) {
		var handler = null;

		// If mustache is not define (Mustache is not defined) we exit
		if(a.isObject(window.Mustache)) {
			handler = window.Mustache;
		} else if(a.isObject(window.Handlebars)) {
			handler = window.Handlebars;
		}

		// Crash if none is found
		if(handler == null) {
			a.console.error("a.page.template.get: unable to find Mustache.JS or Handlebars.JS ! Can't proceed", 1);
			return;
		}

		// We create a hash from uri and sanitize everything by replacing by underscore
		var orig = uri.replace(/[^a-zA-Z0-9\\-]/g, "_"),
			hash = "a_tmpl_" + orig + "_a";

		/**
		 * Parse the content with data from client, then call callback with result
		 *
		 * @method callCallback
		 * @private
		 *
		 * @param clb {Function} The callback function to call
		 * @param h {String} The hash representing the unique id of template
		 * @param d {Object} The data associated
		*/
		var callCallback = function(clb, h, d) {
			if(a.isFunction(clb)) {

				// First try to use Handlebars.js
				if(a.isNull(handler.to_html)) {
					// Act like a render method (threw compile method)
					var tmpl = handler.compile(a.page.template.__tmpl[h]);
					clb(tmpl(d));

				// Rollback on Mustache.js
				} else {
					clb(handler.to_html(a.page.template.__tmpl[h], d));
				}
			}
		};

		// If the template is already listed into existing template, directly load
		if(a.isString(this.__tmpl[hash])) {
			a.console.log("a.page.template.get: loading " + hash + " from cache", 3);
			callCallback(callback, hash, data);
			return;
		}

		// Template exist on page DOM, but it's not registred to ich for now
		if(document.getElementById(hash)) {
			// We add it to template list registered to go quicker next time
			if(!this.__tmpl[hash]) {
				a.console.log("a.page.template.get: loading " + hash + " from inner html page", 3);
				this.__tmpl[hash] = document.getElementById(hash).innerHTML;
			}

			// We finally send the callback
			callCallback(callback, hash, data);
			return;
		}

		// Same with this time original id, template exist on page DOM
		if(document.getElementById(orig)) {
			// We add it to template list registered to go quicker next time
			if(!this.__tmpl[orig]) {
				a.console.log("a.page.template.get: loading " + orig + " from inner html page", 3);
				this.__tmpl[orig] = document.getElementById(orig).innerHTML;
			}

			// We finally send the callback
			callCallback(callback, orig, data);
			return;
		}

		// Last try : we try to use uri to load template from server side, then parse it
		var parse = function(content, status, state) {
			if(!a.page.template.__tmpl[hash]) {
				a.page.template.__tmpl[hash] = content;
			}
			callCallback(callback, hash, data);
			return;
		};

		// We use the loader to retrieve file from server side
		a.console.log("a.page.template.get: loading " + uri + " from external resource", 3);
		a.loader.html(uri, parse, {}, error);
	},

	/**
	 * Convert an html to a dom content
	 *
	 * @method htmlToDom
	 *
	 * @param html {String} The string to parse
	 * @return {Array} The result content
	*/
	htmlToDom : function(html) {
		/*
		 * Why this ?
		 * - Using innerHTML is slow, and can remove binding (like onclick) to sibling children
		 * - Doing this way is the only way to have both: full parsing on every browser, and DOM element to not have innerHTML bug.
		 *      as innerHTML is configured into a temp object, this problem does not exist here anymore as it will not affect other children...
		*/
		var d = document.createElement("div");
		// Remove space before and after : the system fail in other case (why ?)
		d.innerHTML  = html.replace(/^\s+|\s+$/g, "");
		var nodeList = d.childNodes,
			result   = [];
		for(var i=0, l=nodeList.length; i<l; ++i) {
			var item = nodeList.item(i);
			if(a.isObject(item) && (item.nodeType.toString() === "1" || item.nodeType.toString() === "3")) {
				result.push(item);
			}
		}
		return result;
	},

	/**
	 * Empty a dom element
	 *
	 * @method remove
	 *
	 * @param el {DOMElement} The element to remove everything inside
	 * @param callback {Function | null} The function to raise when job is done
	*/
	remove : function(el, callback) {
		while(el.firstChild) {
			el.removeChild(el.firstChild);
		}
		if(a.isFunction(callback)) {
			callback();
		}
	},

	/**
	 * Append to the given element (given a DOM element here not a jquery one)
	 *
	 * @method append
	 *
	 * @param el {DOMElement} Any dom element to append to
	 * @param content {String} The html content (in string) to replace
	 * @param callback {Function} The callback to apply when template finish loading
	*/
	append : function(el, content, callback) {
		var h = this.htmlToDom(content);
		if(a.isObject(h)) {
			for(var i=0, l=h.length; i<l; ++i) {
				el.appendChild(h[i]);
			}
		}
		if(!a.isNull(a.language)) {
			a.language.translate(el);
		}
		if(a.isFunction(callback)) {
			callback(content);
		}
	},

	/**
	 * Same as append, just replace instead of append to element
	 *
	 * @method replace
	 *
	 * @param el {DOMElement} Any dom element to append to
	 * @param content {String} The html content (in string) to replace
	 * @param callback {Function} The callback to apply when template finish loading
	*/
	replace : function(el, content, callback) {
		this.remove(el);
		this.append(el, content, callback);
	}
};





/**
 * Catch here basic windows event : onload, onunload, onresize, onhibernate, onhash
 * onHibernate is a custom event when system seems to come back from hibernate mode
 * onHash is a custom event when page hash change
 *
 * @class event
 * @static
 * @namespace a.page
*/
a.page.event = (function() {
	"use strict";

	/*
	---------------------------------
	  HIBERNATE EVENT
	---------------------------------
	*/

	// Patching himself with new elements
	var obj = {};

	// We create a new event hibernate : when the system go into a hibernate state, when going back, the system raise this event
	// This can be pretty helpfull on real time system saying "hey you should reload stuff you may have a data lost"
	var __hibernateDelay = 10000,
		__last = (new Date()).getTime();

	/**
	 * Create the callback from the given event name
	 *
	 * @method __getPageEventCallback
	 * @private
	 *
	 * @param event {String} The event name
	 * @param data {Object | null} The data attached to event
	 * @return {Function} A ready to use callback
	*/
	function __getPageEventCallback(event, data) {
		if(!a.isObject(data)) {
			data = {};
		}
		return function() {
			a.message.dispatch("a.page.event." + event, data);
		};
	};

	/**
	 * Check the system is hibernating or not
	 *
	 * @method __checkHibernate
	 * @private
	*/
	function __checkHibernate() {
		var current = (new Date()).getTime();
		if(current > (__last + __hibernateDelay * 2)) {
			//The system probably woke up, we send an event for that
			a.console.log("a.page.event.hibernate: hibernate mode has been detected", 3);
			var fct = __getPageEventCallback("hibernate");
			fct();
		}
		__last = current;
	};

	/**
	 * Attach a callback to a DOM event
	 *
	 * @method __attachDOMEvent
	 * @private
	 *
	 * @param event {String} The event name
	 * @param callback {Function} The callback to attach
	*/
	function __attachDOMEvent(event, callback) {
		if(window.addEventListener) { // W3C
			window.addEventListener(event, callback, false);
		} else if(window.attachEvent) { // Microsoft
			window.attachEvent("on" + event, callback);
		}
	};




	/*
	---------------------------------
	  HASH EVENT
	---------------------------------
	*/
	var __previousHash = null,
		__registredHash = [];

	/**
	 * Retrieve the current system hash
	 *
	 * @method __getHash
	 * @private
	 *
	 * @return {String | null} The hash, or null if nothing is set
	 */
	function __getHash() {
		return (window.location.hash) ? window.location.hash.substring(1) : null;
	};


	/**
	 * Store the latest event appearing into a store
	 *
	 * @method __addHash
	 * @private
	 *
	  @param hash {String} The new hash incoming
	*/
	function __addHash(hash) {
		// Store both hash and time used
		__registredHash.push({
			hash : hash,
			time : (new Date()).getTime()
		});

		// Remove exceed hash stored
		while(__registredHash.length > 1000) {
			__registredHash.shift();
		}
	};

	/**
	 * Check for existing hash, call the callback if there is any change
	 *
	 * @method __checkHash
	 * @private
	 *
	 * @param noCallback {Boolean} Indicate if the system should call the callback or not
	 */
	function __checkHash(noCallback) {
		//Extracting hash, or null if there is nothing to extract
		var currentHash = __getHash();
		if(__previousHash !== currentHash) {
			if(noCallback !== true) {
				__addHash(currentHash);
				// Dispatch event
				a.console.log("a.page.event.hash: hash change (previous: " + __previousHash + ", new: " + currentHash + ")", 3);
				var fct = __getPageEventCallback("hash", {
					value : currentHash,
					old : __previousHash
				});
				fct();
			}
			__previousHash = currentHash;
		}
	};

	// Get hash data threw this specific object type
	// see : http://simplapi.wordpress.com/2012/08/20/checking-an-url-hash-change-in-javascript/
	/**
	 * Manipulate page hash
	 *
	 * @class hash
	 * @static
	 * @namespace a.page.event
	*/
	obj.hash = {
		/**
		 * Retrieve the current system hash
		 *
		 * @method getHash
		 *
		 * @return {String | null} The hash, or null if nothing is set
		 */
		getHash : function() {
			return __getHash();
		},

		/**
		 * Get the previous page hash (can be null)
		 *
		 * @method getPreviousHash
		 *
		 * @return {String | null} The hash, or null if nothing is set
		*/
		getPreviousHash : function() {
			return __previousHash;
		},

		/**
		 * Force the system to set a specific hash
		 *
		 * @method setPreviousHash
		 *
		 * @param value {String} The hash to set
		 */
		setPreviousHash : function(value) {
			a.console.log("a.page.event.hash.setPreviousHash: change previous hash to " + value, 3);
			__previousHash = value;
		},

		/**
		 * Get list of existing previous hash used into system
		 *
		 * @method trace
		 *
		 * @return {Array} An array with all hash done since beginning
		*/
		trace : function() {
			return __registredHash;
		}
	};

	//Initiate the system
	__checkHash(true);

	//The onhashchange exist in IE8 in compatibility mode, but does not work because it is disabled like IE7
	if(!a.isNull(window.onhashchange) && (document.documentMode === undefined || document.documentMode > 7)) {
		//Many browser support the onhashchange event, but not all of them
		window.onhashchange = __checkHash;
	} else {
		//Starting manual function check, if there is no event to attach
		setInterval(__checkHash, 50);
	}

	


	/*
	---------------------------------
	  DOM LOAD/UNLOAD EVENT
	---------------------------------
	*/

	// Now on event, raise the object behaviour
	var eventList = ["resize", "load", "unload"];
	for(var i in eventList) {
		__attachDOMEvent(eventList[i], __getPageEventCallback(eventList[i]));
	}

	// Bind the hibernate starter with onload event, 
	// because before the system may not respond on time, indicating an hibernate event to timer
	// Which is not true.
	__attachDOMEvent("load", function() {
		// We start hibernate system
		setInterval(__checkHibernate, __hibernateDelay);
	});

	return obj;
}());
