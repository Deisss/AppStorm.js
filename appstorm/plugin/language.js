"use strict";
/* ************************************************************************

	Version: 0.3

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-14

	Date of last modification: 2013-07-08

	Dependencies : [
		a.js

		plugin/storage.js (optional, store the user preference between 2 page access)
	]

	Events : [
		a.language.change : {value : the new language setted by user}
	]

	Description:
		Translation support for international site

************************************************************************ */

/** @namespace language */
/**
 * Translation support for international site
 * The system allow to set on HTML tag data-tr for translate, and data-tr1, 2, 3... for variable to apply to translate
*/
a.language = (function() {
	"use strict";

	// Contains the current translated message
	var __language = "en",
		// Contains the possible list of translation
		__allowed = ["en", "fr", "de", "sp"],
		__dict    = {},
		__attr    = "data-tr",
		__custom  = "data-tr-attr",
		__stored  = "a_language_store_",
		// Store global variable
		__global  = {};

	// Boolean value to check if storage is supported or not
	var storageSupported = (!a.isNull(a.storage) && a.storage.persistent.support === true);

	/**
	 * Get a specific hash, raw one
	 *
	 * @param lang {String} The language we want to retrieve hash from
	 * @param hash {String} The hash we want to retrieve
	 * @returns {String | null} Null if there is a problem (no hash found), the hash translated if everything went fine
	*/
	function __getRawTranslate(lang, hash) {
		// Searching for good language set
		if(a.isNull(__dict[lang])) {
			return null;
		}

		var tr = __dict[lang][hash];
		if(!a.isNull(tr)) {
			return tr;
		} else {
			a.console.info("a.language.__getRawTranslate: unable to find hash in dictionnary (value: " + hash + ", language: " + lang + ")", 3);
		}

		return null;
	};

	/**
	 * Convert a variable for regex util replace
	 *
	 * @param variable {String} The content "hash" which will be translated
	 * @returns {String} The ready to use regex version
	*/
	function __convertVariable(variable) {
		// Convert to string in any case before anything else
		var convert = "" + variable;
		// If the variable is not properly set...
		if(convert.indexOf("{{") < 0) {
			convert = "{{" + convert;
			convert += "}}";
		}
		convert = convert.replace("{{", "\\{\\{");
		convert = convert.replace("}}", "\\}\\}");

		return convert;
	};

	/**
	 * Extract from a string the list of variables
	 *
	 * @param cmd {String} The command to get
	 * @returns {Array} The splitted variable list
	*/
	function __extractVariableList(cmd) {
		return cmd.match(/\{\{[a-z0-9\-_]+\}\}/gi) || [];
	};

	/**
	 * Get a specific translation from it's hash
	 *
	 * @param hash {String} The hash to retrieve
	 * @param variables {Array | null} A list of variables to pass to system
	 * @returns {String} The translated string, or same string as input (+ language identifier) if nothing is found
	*/
	function __getTranslate(hash, variables) {
		var tr = __getRawTranslate(__language, hash);

		// We return (if not found) the hash himself. In other case we return translated message
		if(!a.isNull(tr)) {

			// Creating a text to perform replace inside
			var text = tr;
			if(a.isArray(variables)) {
				for(var i=0, l=variables.length; i<l; ++i) {
					var convert = __convertVariable(i + 1);
					var regex = new RegExp(convert, 'gi');
					text = text.replace(regex, variables[i]);
				}
			} else {
				for(var i in variables) {
					var convert = __convertVariable(i);

					// Now we apply translate to system
					var regex = new RegExp(convert, 'gi');
					text = text.replace(regex, variables[i]);
				}
			}

			// If some variable are not setted, we search in global scope
			if(text.indexOf("{{") >= 0 && text.indexOf("}}") >= 0) {
				var varList = __extractVariableList(tr);

				// Now we get a variable list to apply, we search them in HTML tag
				for(var g=0, h=varList.length; g<h; ++g) {
					var element = __convertVariable(varList[g]),
						name    = varList[g].replace("{{", "").replace("}}", ""),
						global  = (a.isNull(__global[name])) ? null : __global[name];

					// Now we apply translate to system
					if(!a.isNull(global)) {
						var regex = new RegExp(element, 'gi');
						text = text.replace(regex, global);
					}
				}
			}

			// If there is some unused variable, we remove them (allowed char are : a to z, 0 to 9, and - and _
			text = text.replace(/\{\{[a-z\-_0-9]+\}\}/gi, "");
			return text;
		}

		return hash;
	};

	/**
	 * Get the translate tag from an HTML element
	 *
	 * @param el {DOMElement} An element to get hash from
	 * @param attr {String | null} The attribute to search for that element (default : see __attr)
	 * @returns {String | null} The hash tag associated (if found)
	*/
	function __getAttr(el, attr) {
		if(!a.isString(attr)) {
			attr = __attr;
		}
		// Bug : IE report getAttribute as object, not function, so we just set undefined test...
		try {
			return el.getAttribute(attr);
		} catch(e) {
			return null;
		}
	};

	/**
	 * Translate all possible content from a given root element (or document if element is not defined)
	 *
	 * @param el {DOMElement} A root element to start searching translate element from it
	*/
	function __applyTranslate(el) {
		// If element is not defined, we take global document directly
		if(a.isNull(el)) {
			el = document;
		}

		var ett = [];

		// If the element itself has to be translated
		if(!a.isNull(__getAttr(el))) {
			ett.push(el);
		}

		// If possible we use the fastest version
		var all = [];
		if(el.querySelectorAll) {
			// Take all elements and select the where data-tr is available
			all = el.querySelectorAll("*[" + __attr + "]");
			// Bug : in some browser (like old opera), the system is not able to handle such query
			// going back to "default" one if the query is empty
			if(all.length === 0) {
				all = el.querySelectorAll("*");
			}

		// Old browsers support
		} else {
			all = el.getElementsByTagName("*");
		}

		// Selecting elements to translate
		for (var i=0, l=all.length; i<l; ++i) {
			// The attribute is defined on tag element
			if(!a.isNull(__getAttr(all[i]))) {
				ett.push(all[i]);
			}
		}

		// If we found something to translate, we apply
		for(var e=0, f=ett.length; e<f; ++e) {
			var node = ett[e];
			var hash = __getAttr(node);
			if(!a.isNull(hash)) {
				// From the hash, we retrieve the translated version
				var tr = __getRawTranslate(__language, hash),
					variables = {};

				if(a.isNull(tr)) {
					tr = hash;
				}

				// From hash, we extract possible variable
				// If match does not return anything we apply an empty array
				var varList = __extractVariableList(tr);

				// Now we get a variable list to apply, we search them in HTML tag
				for(var g=0, h=varList.length; g<h; ++g) {
					// We get attribute by data-tr-variable, but variable got {{ and }} at beginning and end, so we remove
					var extract = varList[g].replace("{{", "").replace("}}", "");

					var v = __getAttr(node, __attr + "-" + extract);

					// The variable has been found in attribute, we add this as expected
					if(!a.isNull(v)) {
						// We push the name : value for string to recover everything
						variables[extract] = v;

					// The variable has not been found, we try global store to find a global variable
					} else {
						var global = (__global[extract] === "undefined") ? null : __global[extract];
						if(!a.isNull(global)) {
							variables[extract] = global;
						}
					}
				}

				// Catching the translated version directly, we allow also XML (because of IE parsing is using xml parser)
				// We try to avoid innerHTML usage
				tr = __getTranslate(hash, variables);

				// The data-tr-attr is a custom tag to set custom properties translated
				var customTag = __getAttr(node, __custom);
				if(!a.isNull(customTag)) {
					try {
						node[customTag] = tr;
					} catch(z) {}
				} else if(node) {
					// We try input tags
					if(node.nodeName === "INPUT" && (node.type === "submit" || node.type === "reset")) {
						node.value = tr;

					// We are in placeholder mode
					} else if(node.nodeName === "INPUT") {
						try {
							node.placeholder = tr;
						} catch(z) {}

					// We try fieldset tags
					} else if(node.nodeName === "FIELDSET") {
						node.title = tr;

					// We try xml translate (only for IE)
					} else if(!a.isNull(node.text) && document.all ) {
						node.text = tr;

					// We try using DOM
					} else if(!a.isNull(node.childNodes)) {
						// First we remove all children
						while(node.childNodes.length > 0) {
							node.removeChild(node.firstChild);
						}
						node.appendChild(document.createTextNode(tr));

					// Rollback only if needed...
					} else {
						node.innerHTML = tr;
					}
				}
			}
		}
	};

	// If storage is enabled, we try to get the stored value in the store
	if(storageSupported) {
		var tmpLanguage = a.storage.persistent.getItem(__stored + "language"),
			tmpAllowed  = a.storage.persistent.getItem(__stored + "allowed");

		// If language do exist
		if(a.isString(tmpLanguage)) {
			__language = tmpLanguage;
			// We apply language directly
			__applyTranslate(document);
		}
		if(a.isArray(tmpAllowed)) {
			__allowed = tmpAllowed;
		}
	}

	/** @lends language */
	return {
		/**
		 * Get the current stored language
		 *
		 * @returns {String} The current language, like "en", "en-en"
		*/
		getCurrent : function() {
			return __language;
		},

		/**
		 * Set the language as current language
		 *
		 * @param lang {String} The language to set
		 * @param update {Boolean} The system should not call a new translate update
		*/
		setCurrent : function(lang, update) {
			// We refuse non-string or empty string
			if(!a.isString(lang) || lang.length <= 0) {
				a.console.error("a.language.setCurrent: setting a non-string lang, or empty string, as default language: " + lang, 1);
				return;
			}

			if(a.isNull(update)) {
				update = true;
			}

			// We raise a small message when lang is not existing into allowed...
			if( !a.contains(__allowed, lang) ) {
				a.console.warn("a.language.setCurrent: unable to find language in available language list (value: " + lang + ", available: " + __allowed.join(";") + ")", 2);
			}

			__language = lang;

			// Populate dictionnary if needed
			if(a.isNull(__dict[__language])) {
				__dict[__language] = {};
			}

			// Send that translate to everybody
			a.console.log("a.language.setCurrent: set current language to " + __language + ", request update ? " + update, 3);
			a.message.dispatch("a.language.change", {value : __language});

			// Save language if possible
			if(storageSupported) {
				a.storage.persistent.setItem(__stored + "language", __language);
			}

			this.translate(document, update);
		},

		/**
		 * Get the allowed languages
		 *
		 * @returns {Array} The list of available language setted by user
		*/
		getAllowed : function() {
			return __allowed;
		},

		/**
		 * Set a list of allowed languages
		 *
		 * @param allow {Array | String} The new list of languages
		*/
		setAllowed : function(allow) {
			if(a.isString(allow)) {
				allow = [ allow ];
			}

			if(!a.isArray(allow)) {
				a.console.error("a.language.setAllowed: the allowed language must be an Array (value: " + allow + ")", 1);
				return;
			}

			__allowed = allow;
			for(var lang=0, l=allow.length; lang<l; ++lang) {
				// Create language if they are not set for now
				if(a.isNull(__dict[lang])) {
					__dict[lang] = {};
				}
			}

			// We try to store into storage if available
			if(storageSupported) {
				a.console.log("a.language.setAllowed: set allowed language to " + __allowed, 3);
				a.storage.persistent.setItem(__stored + "allowed", __allowed);
			}
		},

		/**
		 * Get a specific translation from it's hash
		 *
		 * @param hash {String} The hash to retrieve
		 * @param variables {Array | null} A list of variables to pass to system
		 * @returns {String} The translated string, or same string as input (+ language identifier) if nothing is found
		*/
		getSingleTranslation : function(hash, variables) {
			return __getTranslate(hash, variables);
		},

		/**
		 * Add a translation into available translation
		 *
		 * @param lang {String} The language to use
		 * @param hash {String} The hashtag to define
		 * @param value {String} The corresponding content
		 * @param update {Boolean} The system should not call a new translate update
		*/
		addSingleTranslation : function(lang, hash, value, update) {
			if(a.isNull(__dict[lang])) {
				a.console.warn("a.language.addSingleTranslation: be carefull, the language you submit does not seems to exist in dict (value: " + lang + ", dict: " + __allowed.join(";") + ")", 1);
				__dict[lang] = {};
			}

			// We add translation to existing one
			__dict[lang][hash] = value;

			this.translate(document, update);
		},

		/**
		 * Append to existing dict a full list of translate
		 *
		 * @param lang {String} The language to use for this translate
		 * @param dict {Object} A dictionnary to append to existing/new language
		 * @param update {Boolean} The system should not call a new translate update
		*/
		addTranslation : function(lang, dict, update) {
			// Creating lang if it's not set
			if(a.isNull(__dict[lang])) {
				__dict[lang] = {};
			}

			for(var i in dict) {
				__dict[lang][i] = dict[i];
			}

			this.translate(document, update);
		},

		/**
		 * Get the current dict, if lang is specified, only for the given language
		 *
		 * @param lang {String | null} The lang to get
		 * @returns {Object | null} The corresponding dictionnary (null if you ask a language not setted in dictionnary)
		*/
		getTranslation : function(lang) {
			return (a.isString(lang)) ? __dict[lang] : __dict;
		},

		/**
		 * Translate the content of an element, or translate the full page if element is not set
		 *
		 * @param element {DOMElement} The element to start translate from
		 * @param update {Boolean | null} Indicate if the system should perform translate (should never been used except internally)
		*/
		translate : function(element, update) {
			if(update !== false) {
				__applyTranslate(element);
			}
		},

		/**
		 * Add a variable to global variable store
		 *
		 * @param key {String} The value key
		 * @param value {Object} The linked value to apply
		*/
		addVariable : function(key, value) {
			a.console.log("a.language.addVariable: add global variable (key: " + key + ", value: " + value + ")", 3);
			__global[key] = value;
		},

		/**
		 * Get a variable stored in global variable store
		 *
		 * @param key {String} The key to get
		*/
		getVariable : function(key) {
			return (__global[key] === "undefined") ? null : __global[key];
		},

		/**
		 * Remove a variable from global variable store
		 *
		 * @param key {String} The key to remove from global variable list
		*/
		removeVariable : function(key) {
			a.console.log("a.language.removeVariable: remove global variable (key: " + key + ")", 3);
			delete __global[key];
		},

		/**
		 * Clear the dictionnary
		*/
		clear : function() {
			__dict = {};
		}
	};
}());