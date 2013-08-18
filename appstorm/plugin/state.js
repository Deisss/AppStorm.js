"use strict";
/* ************************************************************************

	Version: 0.5

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-06-01

	Date of last modification: 2013-07-06

	Dependencies : [
		a.js
		plugin/page.js
		plugin/callback.js
		plugin/language.js (optional)

		** Mustache.JS OR Handlebars.JS IS NEEDED AND IS EXTERNAL LIBRARY **
	]

	Events : [
		a.state.begin (with old as previous hash, and value as current hash)
		a.state.error (an error occurs while loading state)
		a.state.end   (with old as previous hash, and value as current hash)
	]

	Description:
		State system allow to build a tree controller system : having intermediate controller reaching final rendering

		state : main state system
		state.helper : internally use, this class provide help for tree management

************************************************************************ */

/*
 A controller can have thoose parameters :
 var full = {
   id    : "string | integer",
   hash  : "string",
   title : "string",

   parent  : "reference to any existing id (string | integer)",
   chidren : "An array of sub object like this one",

   data      : "string or object (see below)",
   options   : "options to give to ajax request (for data, see below)",
   converter : "function (see below)",

   // Compare to data, thoose files are loaded only once, and cached
   // For CSS, JS and translate, they are not deleted on unload
   include : {
     css       : "string | Array of string",
	 js        : "string | Array of string",
	 translate : "string | Array of string",
	 html      : "string",
   },

   bootOnLoad : "boolean, load all data on adding controller to state",

   preLoad  : "function",
   load     : "function",
   postLoad : "function",

   preUnload  : "function",
   unload     : "function",
   postUnload : "function"
 };
*/


/**
 * Managing state threw this interface
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:state">here</a>
 *
 * @class state
 * @static
 * @namespace a
*/
a.state = (function() {
	"use strict";

	// Store the tree state
	var __root  = [],
		// Store element "outside default" to delete at a specific moment
		__del   = [],
		// Store the unique id generated on each load
		__req   = -1,
		// Store custom helper list registered by users
		__param = [];

	/*
	------------------------------------
	 HELPER
	------------------------------------
	*/
	/**
	 * Convert anything into an array, used to convert CSS/JS, HTML, ... file listing
	 *
	 * @method __arrayConverter
	 * @private
	 *
	 * @param value {Mixed} A value to convert
	 * @return {Array} A value converted, or dropped if it was not possible to convert
	*/
	function __arrayConverter(value) {
		if(a.isArray(value)) {
			return value.reverse();
		} else if(a.isString(value)) {
			return [ value ];
		}
		return [];
	};

	/**
	 * Generate a unique id
	 *
	 * @method __rnd
	 * @private
	 *
	 * @return {Integer} A unique id, different from previous one
	*/
	function __rnd() {
		// Generating a unique id for loader
		var previousRequest = __req;
		while(__req === previousRequest || __req <= 0) {
			__req = Math.floor(Math.random() * 100000);
		}
		return __req;
	};

	/**
	 * From a given list, keep only item appearing only once
	 *
	 * @method __extractUniqueId
	 * @private
	 *
	 * @param list {Array} A list of state to select
	 * @param tester {Function | null} An extra function to use for adding selection over existing selection
	 * @return {Array} The extracted array of unique id
	*/
	function __extractUniqueId(list, tester) {
		var path = [],
			l    = list.length;

		tester = (a.isFunction(tester)) ? tester : function(){return true;};

		for(var i=0; i<l; ++i) {
			var found = false;

			for(var j=0; j<l; ++j) {
				if(i != j && list[i].id === list[j].id && tester(list[i])) {
					found = true;
					break;
				}
			}

			if(!found) {
				path.push(list[i].id);
			}
		}

		return path;
	};

	/**
	 * From a given list, we search for maximum level (deeper child)
	 *
	 * @method __getByLevel
	 * @private
	 *
	 * @param list {Array} The list to find
	 * @return {Array} The system sorted by level
	*/
	function __getByLevel(list) {
		var max = 0,
			level = [];
		var current = a.state.helper.tree.selectLevel(list, __getTreeFiller, max);
		while(current.length > 0) {
			level.push(current);
			max++;
			current = a.state.helper.tree.selectLevel(list, __getTreeFiller, max);
		}

		return level;
	};

	/**
	 * From a given hash, select items which should be deleted (can't stay on this hash), and parent of course
	 *
	 * @method __getExternalDelete
	 * @private
	 *
	 * @param hash {String} The hashtag to search and register as delete
	 * @return {Array} An array of id to validate for delete
	*/
	function __getExternalDelete(hash) {
		var hashNew = __getTreeHashTester(hash),
			deleteLength = __del.length,
			ret = [];

		// Now we search on "outside elements" if some of them should be deleted
		while(deleteLength--) {
			var tagList = __del[deleteLength].hashtagList;
			// We test current hash exist in tagList, we emulate an item to use hashNew for that...
			var tagLength = tagList.length,
				found = false;

			while(tagLength--) {
				// We create a fake object to be able to use hashNew directly
				var tmpItem = {
					hash : tagList[tagLength]
				};

				found = hashNew(tmpItem);
				if(found === true) {
					break;
				}
			}

			// If no hashtag linked has been found, this one can be deleted
			if(!found) {
				// We add possible elements to array tag
				ret = ret.concat(__del[deleteLength].itemList.slice());
				// We delete element
				__del.splice(deleteLength, 1);
			}
		}

		return ret;
	};

	/*
	------------------------------------
	 TREE HELPER
	------------------------------------
	*/
	/**
	 * From a given hash, generate a function which select an item (or not) regarding it's hash code (including template system)
	 *
	 * @method __getTreeHashTester
	 * @private
	 *
	 * @param hash {String} Any hashtag to search
	 * @return {Function} The function ready to use inside tree helper
	*/
	function __getTreeHashTester(hash) {
		return function(item) {
			// Try to check the item got a specific searched hashtag
			if(a.isObject(item) && item.hash.length > 0) {
				// Direct match
				if(item.hash === hash) {
					return true;

				// Pattern match (at least one pattern is defined)
				} else if(item.hash.indexOf("{{") >= 0 && item.hash.indexOf("}}") >= 0) {
					var extracted = a.state.helper.parameter.extract(item.hash);

					// Now for every name we replace with extracted content
					var tester = item.hash,
						i = extracted.length;

					while(i--) {
						tester = a.state.helper.parameter.replace(tester, extracted[i]);
					}

					// Now we can test (we test on full chain directly)
					var regex = new RegExp("^" + tester + "$", "gi");
					return regex.test(hash);
				}
			}
			return false;
		};
	};

	/**
	 * From a given id, generate a function which select an item (or not) regarding it's id
	 *
	 * @method __getTreeIdTester
	 * @private
	 *
	 * @param id {String | Integer | Array} Any id to search
	 * @return {Function} The function ready to use inside tree helper
	*/
	function __getTreeIdTester(id) {
		return function(item) {
			if(!a.isObject(item)) {
				return false;
			} else if(
				(a.isArray(id) && a.contains(id, item.id)) ||
				(item.id === id)
			) {
				return true;
			}
			return false;
		};
	};

	/**
	 * Allow to select item regarding both hashtag, or exist as id
	 *
	 * @method __getTreeHashAndIdTester
	 * @private
	 *
	 * @param hash {String} The hashtag to check
	 * @param idList {Array} The id list to check
	 * @return {Function} The function ready to use inside tree helper
	*/
	function __getTreeHashAndIdTester(hash, idList) {
		var f1 = __getTreeIdTester(idList),
			f2 = __getTreeHashTester(hash);

		return function(item) {
			if(f1(item) === true || f2(item) === true) {
				return true;
			}
			return false;
		}
	};

	/**
	 * This function try to find children for a given object, it is directly used by system (does not return any function)
	 *
	 * @method __getTreeFiller
	 * @private
	 *
	 * @param item {Object} Should be a state
	 * @return {Array} An item list, or empty list if nothing if found
	*/
	function __getTreeFiller(item) {
		return (a.isObject(item) && a.isArray(item.children)) ? item.children : [];
	};

	/**
	 * Filter an element to extract data, it is directly used by system (does not return any function)
	 *
	 * @method __getTreeConverterId
	 * @private
	 *
	 * @param item {Object} Should be a state
	 * @return {Integer} The id found
	*/
	function __getTreeConverterId(item) {
		return (a.isObject(item)) ? item.id : -1;
	};

	/*
	------------------------------------
	 CORE
	------------------------------------
	*/
	/**
	 * Main process function
	 *
	 * @method __proceed
	 * @private
	 *
	 * @param data {Object} Object from hash event, contains value (current hash) and old (previous hash)
	*/
	function __proceed(data) {
		/*
			Algorithm :
				1) We get id list to add, id list to delete, by selecting branch corresponding to hashtag searched
				2) From thoose 2 arrays, we remove duplicate (because it means we will unload to reload just after)

				=> This tab contains all id (from delete or add), which should be manage by system.
				=> The 2 object contains add list, or delete list, used with array you can found what you should add, what you should delete

				3) We start by deleting, in this case we must take the "highest" level, it means latest added children.
				So we start by searching maximum children level, and we delete from that level, to root

				4) We build exactly the opposite : we need root setup before adding a children to it.
				So we start from base level, and go up until latest children

				=> Now system unbuild delete, and rebuild add, and takes care to not unbuild something which don't need to.
				Also, The system is hanble to run synchronously for going faster (unloading/loading item list of same level is done synchronously)
		*/
		var pathToDelete = a.clone(__root),
			pathToAdd    = a.clone(__root),
			pathWildcard = a.clone(__root),

		// We search extra controller loaded by user, to delete
			externalDelete = __getExternalDelete(data.value);

		var hashOld      = __getTreeHashTester(data.old),
			hashOldAndId = __getTreeHashAndIdTester(data.old, externalDelete),
			hashNew      = __getTreeHashTester(data.value);


		// Populating data
		a.state.helper.tree.selectBranch(pathToDelete, __getTreeFiller, hashOldAndId);
		a.state.helper.tree.selectBranch(pathToAdd,    __getTreeFiller, hashNew);
		a.state.helper.tree.selectBranch(pathWildcard, __getTreeFiller, __getTreeHashTester("*"));

		// We store only parts not common to pathToDelete AND pathToAdd
		var rawPathChange = a.state.helper.tree.flat(pathToDelete.concat(pathToAdd), __getTreeFiller);

		// Remove all duplicates item, but keep duplicate hastag-variable items, when they don't have children...
		var pathChange = __extractUniqueId(rawPathChange, function(item) {
			if (
				(item.hash.indexOf("{{") >= 0 && item.hash.indexOf("}}") >= 0) &&
				// We allow only index hashtag which are final state (no other children to load)
				!a.state.helper.tree.isInBranch(item, __getTreeFiller, hashNew) &&
				!a.state.helper.tree.isInBranch(item, __getTreeFiller, hashOld)
			) {
				return false;
			}
			return true;
		});

		// Doing the same for wildcard (in fact selecting everything...
		var pathWildcardChange = a.state.helper.tree.flat(pathWildcard, __getTreeFiller, __getTreeConverterId);

		// Now we have the path to apply only, we still need to do one easy things : we go from top level element in delete, to bottom for add

		// To delete, we start at the maximum level, so we start to search maximum level
		var levelDelete = __getByLevel(pathToDelete),
			levelAdd    = __getByLevel(pathToAdd);

		// Start loading
		a.message.dispatch("a.state.begin", data);

		// Debug
		a.console.log("a.state: element allowed to proceed change: " + pathChange + " (does not mean all of them will be loaded)", 3);

		var internalId = __rnd();

		// Now we call delete, and the chain to add
		// Note : unload is never shutted down
		a.state.helper.chainer("unload", levelDelete, pathChange, -1, function() {
			a.state.helper.chainer("load", levelAdd, pathChange, internalId, function() {

				// Now we finish main chain, we do wildcard !
				if(pathWildcard.length > 0) {
					// The system is expecting array inside array
					pathWildcard = [ pathWildcard ];
					a.console.log("a.state: wildcard allowed to proceed change: " + pathWildcardChange + " (does not mean all of them will be loaded)", 3);
					a.state.helper.chainer("unload", pathWildcard, pathWildcardChange, -1, function() {
						a.state.helper.chainer("load", pathWildcard, pathWildcardChange, -1, function(){
							// Loading finish
							a.message.dispatch("a.state.end", data);
						});
					});
				} else {
					// Loading finish
					a.message.dispatch("a.state.end", data);
				}
			});
		});
	};

	// Bind the hash change to internal process
	a.message.addListener("a.page.event.hash", __proceed);

	// We we recieve clear message, after few time, we bind again
	a.message.addListener("a.message.clear", function() {
		a.message.addListener("a.page.event.hash", __proceed);
	});

	/*
	------------------------------------
	 OBJECT FACTORY
	------------------------------------
	*/
	return {
		/**
		 * Erase the full state tree stored
		 *
		 * @method clear
		*/
		clear : function() {
			__root = [];
		},

		/**
		 * Get a copy of current tree stored into system
		 *
		 * @method tree
		 *
		 * @return {Array} A clone of current stored object
		*/
		tree : function() {
			return a.clone(__root);
		},

		/**
		 * Register a state
		 *
		 * @method add
		 * @async
		 *
		 * @param ctrl {Object} A state (see create function from a.state) to register
		 * @param callback {Function | null} A callback to call after add, ONLY if loadOnStartup is defined
		 * @return {String | null} The control id setted, or a null value if we could not add state
		*/
		add : function(ctrl, callback) {
			// Only state type are accepted here
			if(!a.isObject(ctrl)) {
				return null;
			}

			// If ctrl is an array, then we send to all sub elements
			if(a.isArray(ctrl)) {
				for(var i=0, l=ctrl.length; i<l; ++i) {
					this.add(ctrl[i]);
				}
				return;
			}

			// Purge data (transform all null values into something usable)
			ctrl.hash = (a.isString(ctrl.hash)) ? ctrl.hash : "";

			if(!a.isObject(ctrl.include)) {
				ctrl.include = {};
			}

			// Managing include
			ctrl.include.css       = __arrayConverter(ctrl.include.css);
			ctrl.include.js        = __arrayConverter(ctrl.include.js);
			ctrl.include.translate = __arrayConverter(ctrl.include.translate);

			// HTML is the only parameter which does not accept multiple files
			ctrl.include.html      = (!a.isString(ctrl.include.html)) ? null : ctrl.include.html;

			// We do some basic check on function parameters (check it does have at least one parameter)
			var fctToCheck = ["preLoad", "postLoad", "preUnload", "unload", "postUnload"];
			for(var w=0, x=fctToCheck.length; w<x; ++w) {
				var tmpFct = ctrl[fctToCheck[w]];
				if(a.isFunction(tmpFct)) {
					var fnStr = tmpFct.toString();
					fnStr = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
					if(a.isNull(fnStr)) {
						a.console.warn("The result parameter for function '" + fctToCheck[w] + "' in id '" + ctrl.id + "' has not been found, the state may not work properly", 2);
					}
				}
			}

			// We allow children to be a single object and not an array
			if(!a.isArray(ctrl.children) && a.isObject(ctrl.children)) {
				ctrl.children = [ a.clone(ctrl.children) ];
			}

			var parentCheck   = (!a.isNull(ctrl.parent)),
				childrenCheck = a.isArray(ctrl.children);

			// Specific case for wildcard : we accept them only to root
			if(ctrl.hash === "*") {
				if(parentCheck) {
					a.console.warn("a.state.add : The wildcard has a parent setted (not allowed)", 1);
				}
				if(childrenCheck) {
					a.console.warn("a.state.add : The wildcard has children (not allowed)", 1);
				}
				ctrl.parent = null;
				parentCheck = false;
				ctrl.children = [];
			}

			// Modify parent system
			var children = [];

			// We create a copy the destroy children tab : because we must be sure every children are state type
			// So we can't include them like this, we will send them one by one to add function again
			if(childrenCheck) {
				children = ctrl.children.slice();
			}
			ctrl.children = [];
			

			// We search for existing state, if we find we generate new id
			if(a.isNull(ctrl.id)) {
				ctrl.id = 1;
			}

			// Searching for an already existing id
			while(!a.isNull(a.state.helper.tree.getItem(__root, __getTreeFiller, __getTreeIdTester(ctrl.id)))) {
				ctrl.id = Math.floor((Math.random()*100000)+1);
			}

			// Modify some content to be sure everything is fine
			if(parentCheck) {
				var parent = a.state.helper.tree.getItem(__root, __getTreeFiller, __getTreeIdTester(ctrl.parent));
				if(!a.isNull(parent)) {
					parent.children.push(ctrl);
				} else {
					return null;
				}
			} else {
				__root.push(ctrl);
			}

			var id = ctrl.id;

			// Now we add to system this item, we can try to add children to it
			for(var i=0, l=children.length; i<l; ++i) {
				if(a.isObject(children[i])) {
					children[i].parent = id;
					this.add(children[i]);
				}
			}

			// On wildcard added, we directly start them
			if(ctrl.hash === "*") {
				a.state.helper.chainer("load", [ [ ctrl ] ], [id], -1, function(){});
			}

			// The user ask to preload everything, so we handle this
			if(ctrl.bootOnLoad === true) {
				// We clone, then remove everything linked to data : we want to load everything, except data
				var copy = a.clone(ctrl);
				// Remove all load function/unload functions, and data info
				copy.data = copy.converter = copy.options = null;
				copy.preLoad = copy.load = copy.postLoad = null;
				copy.preUnload = copy.unload = copy.postUnload = null;

				callback = (a.isFunction(callback)) ? callback : function() {};
				a.state.helper.chainer("load", [ [ copy ] ], [id], -1, callback);
			}

			return id;
		},

		/**
		 * Get an element regarding it's id
		 *
		 * @method getById
		 *
		 * @param id {String | Integer} The id to find in list
		 * @return {Object | null} The result content
		*/
		getById : function(id) {
			return a.state.helper.tree.getItem(__root, __getTreeFiller, __getTreeIdTester(id));
		},

		/**
		 * Remove an element regarding it's id
		 *
		 * @method removeById
		 *
		 * @param id {String | Integer} The id to find in list
		*/
		removeById : function(id) {
			// We search the element to delete
			var del = a.state.helper.tree.getItem(__root, __getTreeFiller, __getTreeIdTester(id));

			// The delete function catch an element and invalidate it
			var deleteFunction = function(item) {
				return (item === del) ? false : true;
			};

			a.console.log("a.state.removeById: remove element (id: " + id + ")", 3);

			// We do a selectInBranch, and not keeping only if system does not have
			a.state.helper.tree.selectBranch(__root, __getTreeFiller, deleteFunction);
		},

		/**
		 * From a given id, load a state without modify hashtag, and allow controller to stay alive on specific hashtag given
		 *
		 * @method loadById
		 * @async
		 *
		 * @param id {String | Integer} The controller id to load
		 * @param hashtagList {Array | null} The hastag to let it stay alive
		 * @param callback {Function | null} callback function after loading ends
		*/
		loadById : function(id, hashtagList, callback) {
			// We search for id chain
			var pathToAdd = a.clone(__root),
				// We need to know the current path, and the current root
				hash = a.page.event.hash.getHash(),
				path = a.clone(__root);

			// Selecting the good path (the path to add, the path added
			a.state.helper.tree.selectBranch(pathToAdd, __getTreeFiller, __getTreeIdTester(id));
			a.state.helper.tree.selectBranch(path,      __getTreeFiller, __getTreeHashTester(hash));

			// Now we apply same transform as hashtag loading : selecting only items not in common
			var rawPathToAdd = a.state.helper.tree.flat(pathToAdd, __getTreeFiller),
				rawPath      = a.state.helper.tree.flat(path,      __getTreeFiller);

			var pathChange   = __extractUniqueId(rawPath.concat(rawPathToAdd)),
			// We add state to existing system
				levelAdd     = __getByLevel(pathToAdd),
				cb           = (a.isFunction(callback)) ? callback : function() {};

			// Debug
			a.console.log("a.state.loadById: element allowed to proceed change: " + pathChange + " (does not mean all of them will be loaded)", 3);

			a.state.helper.chainer("load", levelAdd, pathChange, -1, cb);

			// If hashtagList is not defined or not good, we register current hashtag
			if(a.isNull(hashtagList)) {
				hashtagList = hash;
			}

			// Create an object to send to register function to mark as potential delete thoose elements
			var register = {
				id : id,
				// Extract all id to register as potential delete
				itemList : a.state.helper.tree.flat(rawPathToAdd, __getTreeFiller, __getTreeConverterId),
				hashtagList : __arrayConverter(hashtagList)
			};

			// We add element loaded to list of potential item to delete
			__del.push(register);
		},

		/**
		 * From a given id, unload from this id, including all children
		 * NOTE : only item created with loadById can be deleted using this function
		 *
		 * @method unloadById
		 * @async
		 *
		 * @param id {String | Integer} The controller to unload
		 * @param callback {Function | null} callback function after unloading ends
		*/
		unloadById : function(id, callback) {
			var ctr = this.getById(id);

			// Now from all elements, we unload
			var levelDelete = __getByLevel([ ctr ]),
			// We register all id we previously load (so we accept only id created with loadById)
				pathChange = [],
				length = __del.length;

			while(length--) {
				pathChange = pathChange.concat(__del[length].itemList);
			}

			// Debug
			a.console.log("a.state.unloadById: element allowed to proceed change: " + pathChange + " (does not mean all of them will be unloaded)", 3);

			// We unload
			var cb = (a.isFunction(callback)) ? callback : function() {};
			a.state.helper.chainer("unload", levelDelete, pathChange, -1, cb);
		},

		/**
		 * Ask to reload an id, and all children
		 *
		 * @method forceReloadById
		 * @async
		 *
		 * @param id {String | Integer} The id to force reload
		 * @param callback {Function | null} callback function after unloading and loading ends
		*/
		forceReloadById : function(id, callback) {
			var cb = (a.isFunction(callback)) ? callback : function() {};

			// 1 : try to unload/load from manual id
			var length    = __del.length,
				count     = [],
				// After delete : we setup again delete as it was before
				// this is because unloadById will not remove previous entry
				duplicate = a.clone(__del);

			while(length--) {
				if(a.contains(__del[length].itemList, id)) {
					count.push(__del[length].hashtagList);
				}
			}

			if(count.length > 0) {
				// We unload only one time (as it will unload all of them)
				this.unloadById(id, function() {
					var lc = count.length;
					while(lc--) {
						a.state.loadById(id, count[lc]);
					}
					__del = duplicate;
					cb();
				});

				// We found, we stop
				return;
			}

			// Nothing found into system, we go for hashtag reload (instead of manual reload)
			var currentPath = a.clone(__root),
				hash = a.page.event.hash.getHash();

			// Selecting the good path (the path to add, the path added
			a.state.helper.tree.selectBranch(currentPath, __getTreeFiller, __getTreeHashTester(hash));

			// Now we can search and select item to reload
			var currentFlat = a.state.helper.tree.flat(currentPath, __getTreeFiller);
			var lflat = currentFlat.length;
			while(lflat--) {
				// If we found the good one, we does reload
				if(currentFlat[lflat].id === id) {
					// Now we unload and reload
					var level = __getByLevel([ currentFlat[lflat] ]);

					// We register all id as path change
					var pathChange = a.state.helper.tree.flat(currentPath, __getTreeFiller, __getTreeConverterId);

					// Debug
					a.console.log("a.state.forceReloadById: element allowed to proceed change: " + pathChange + " (does not mean all of them will be loaded/unloaded)", 3);

					var internalId = __rnd();

					a.state.helper.chainer("unload", level, pathChange, -1, function() {
						a.state.helper.chainer("load", level, pathChange, internalId, cb);
					});
					// No need to do more...
					return;
				}
			}
		},

		/**
		 * Test a given hash got at least one children using it
		 *
		 * @method hashExists
		 *
		 * @param hash {String} The hashtag to search
		 * @return {Boolean} True the hash is defined and does exist, false in other case
		*/
		hashExists : function(hash) {
			if(!a.isString(hash) || hash === "") {
				return false;
			}

			// Test at least one element is defined into root for given hash
			return a.state.helper.tree.isInBranch(__root, __getTreeFiller, __getTreeHashTester(hash));
		},

		/**
		 * INTERNAL USE ONLY
		 * Get the unique id currently used
		 *
		 * @method __currentGeneratedId
		 *
		 * @return {Integer} The current id
		*/
		__currentGeneratedId : function() {
			return __req;
		},

		/**
		 * Allow to manage parameter object, to add custom function & co
		 * (like memory, temporary into variable)
		 *
		 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:state">here</a>
		 *
		 * @class type
		 * @static
		 * @namespace a.state
		*/
		type : {
			/**
			 * Add a custom type to existing parameter system
			 *
			 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:state">here</a>
			 *
			 * @method add
			 *
			 * @param id {String} The id to register (like myHandler, ...)
			 * @param fct {Function} The function to bind to this hash (null to erase)
			*/
			add : function(id, fct) {
				__param[id] = fct;
			},

			/**
			 * Get a stored custom parameter function
			 *
			 * @method get
			 *
			 * @param id {String} The corresponding id to search
			 * @return {Function | null} The founded function or null if something happens
			*/
			get : function(id) {
				if(a.isFunction(__param[id])) {
					return __param[id];
				}
				return null;
			},

			/**
			 * Get the full list of parameters types stored by user
			 *
			 * @method list
			 *
			 * @return {Object} The parameter list
			*/
			list : function() {
				return __param;
			}
		},

		helper : {
			tree:{},
			chainer:{},
			parameter:{}
		}
	};
}());








/**
 * Tree manipulation used by state
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:state">here</a>
 *
 * @class tree
 * @static
 * @namespace a.state.helper
*/
a.state.helper.tree = {
	/**
	 * Flat a tree structure into an array one...
	 * Ex filler (must return an array, so send back empty array in case of problem) :
	 * function(item){return item.children;}
	 * Ex converter (must return something, even null) :
	 * function(item){return item.id;}
	 *
	 * @method flat
	 *
	 * @param tree {Array} A tree structure to transform
	 * @param filler {Function} From an item, give back the potential list of children to add...
	 * @param converter {Function | null} Used to transform every items before they get into array
	 * @return {Array} A flatten modified array
	*/
	flat : function(tree, filler, converter) {
		var result = [];

		// Prevent bug
		if(!a.isArray(tree) || !a.isFunction(filler)) {
			return [];
		}

		// Converter is optional, so in case of problem we dummy return item...
		converter = (a.isFunction(converter)) ? converter : function(item){return item;};

		for(var i=0, l=tree.length; i<l; ++i) {
			// First we search children
			var children = this.flat(filler(tree[i]), filler, converter);
			result.push(converter(tree[i]));
			if(children.length > 0) {
				result = result.concat(children);
			}
		}

		return result;
	},

	/**
	 * Recursive search inside tree to find the first good element
	 * Ex : tester (id come from other scope) :
	 * function(item){if(item.id === id){return true;}; return false;}
	 * Ex : filler (must return an array, so send back empty array in case of problem) :
	 * function(item){return item.children;}
	 *
	 * @method getItem
	 *
	 * @param tree {Array} A tree structure to search inside
	 * @param filler {Function} From an item, give back the potential list of children to search inside...
	 * @param tester {Function} The function to test if item is the good one or not
	 * @return {Object | null} An object selected, or null if no item found
	*/
	getItem : function(tree, filler, tester) {
		if(!a.isArray(tree) || !a.isFunction(tester) || !a.isFunction(filler)) {
			return null;
		}

		for(var i=0, l=tree.length; i<l; ++i) {
			if(tester(tree[i]) === true) {
				return tree[i];
			}
			// Search inside children
			var result = this.getItem(filler(tree[i]), filler, tester);
			if(!a.isNull(result)) {
				return result;
			}
		}

		return null;
	},

	/**
	 * Check if the given tester found in the given tree
	 * @see getItem (used internally)
	 *
	 * @method isInBranch
	 *
	 * @param tree {Array} A tree structure to search inside
	 * @param filler {Function} From an item, give back the potential list of children to search inside...
	 * @param tester {Function} The function to test if item is the good one or not
	 * @return {Boolean} True if the selected item is in given tree, false in other case
	*/
	isInBranch : function(tree, filler, tester) {
		var item = this.getItem(tree, filler, tester);
		return (a.isNull(item)) ? false : true;
	},

	/**
	 * Keep only branch where specific item appears
	 * Note : there is no return value because tree will be modified as a "pointed tree", so use tree after.
	 * Note : If you need to keep original tree, you need to duplicate the tree before using this function (use a.clone for that)
	 * Ex : tester (hash come from other scope) :
	 * function(item){if(item.hash === hash || item.hash === "*"){return true;}; return false;}
	 * Ex : filler (must return an array, so send back empty array in case of problem) :
	 * function(item){return item.children;}
	 *
	 * @method selectBranch
	 *
	 * @param tree {Array} A tree structure to select inside
	 * @param filler {Function} From an item, give back the potential list of children to search inside...
	 * @param tester {Function} The function to test if item is the good one or not
	*/
	selectBranch : function(tree, filler, tester) {
		if(!a.isArray(tree) || !a.isFunction(filler) || !a.isFunction(tester)) {
			return;
		}

		var result = [],
			i      = tree.length;

		// We move in reverse order to prevent multiple splice problem
		while(i--) {
			// If the parent (and all children) are not good, we delete branch
			var children = filler(tree[i]);

			// The item is not good, and children too
			if(tester(tree[i]) === false && a.isNull(this.getItem(children, filler, tester))) {
				tree.splice(i, 1);
				continue;
			}

			// If we are here, it means the tree got at last one good children, or the tree himself
			// So we go deeper
			if(children.length > 0) {
				this.selectBranch(children, filler, tester);
			}
		}
	},

	/**
	 * Get the given level inside a tree structure : example 
	 * 1 =>
	 *   2 =>
	 *     4 => "something"
	 *   3 =>
	 *     5 => "something"
	 *
	 * If we want level 1, we get array [2, 3] (and 2, 3 contains 4, 5), if we want level 2, we get [4, 5] (nothing inside).
	 * This function is used to know loading/unloading sequence priority (we must unload 4 before 2, we must load 3 before 5...)
	 *
	 * @method selectLevel
	 *
	 * @param tree {Array} A tree structure to select inside
	 * @param filler {Function} From an item, give back the potential list of children to search inside...
	 * @param level {Integer} The level we are searching for
	*/
	selectLevel : function(tree, filler, level) {
		// Test input
		if(!a.isArray(tree) || !a.isFunction(filler)) {
			return [];
		}

		var result = [],
			i      = tree.length;

		// Test level now
		if(a.isNull(level) || isNaN(level) || level <= 0) {
			return tree;
		}

		level--;

		// Selecting all item existing, going deeper if possible
		while(i--) {
			// If the parent (and all children) are not good, we delete branch
			var children = filler(tree[i]);

			if(children.length > 0) {
				result = result.concat(this.selectLevel(children, filler, level));
			}
		}

		return result;
	}
};









/**
 * Release a chain (full unload, or full load)
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:state">here</a>
 *
 * @class chainer
 * @namespace a.state.helper
 * @constructor
 * @async
 *
 * @param type {String} Can be "unload", or "load"
 * @param path {Array} The path to add or delete
 * @param allowed {Array} Array of id allowed into system
 * @param id {Integer} The unique id to be able to control system flow (too long request should be stopped)
 * @param callback {Function} On full chain finish, the callback called
*/
a.state.helper.chainer = function(type, path, allowed, id, callback) {
	var max = path.length;

	type = (type === "unload") ? "unload" : "load";
	allowed = allowed || [];

	/**
	 * Handle a chain error
	 *
	 * @method __error
	 * @private
	 *
	 * @param resource {String} The uri which fail to load
	 * @param status {String} The error status (like 404)
	*/
	function __error(resource, status) {
		var obj = {};

		if(!a.isNull(resource)) {
			obj.resource = resource;
		}
		if(!a.isNull(status)) {
			obj.status = status;
		}
		
		// Raising global message
		a.message.dispatch("a.state.error", obj);
	};

	/**
	 * start level callback function.
	 * This is used to not have outside scope problem.
	 *
	 * @method __generateStartLevelCallback
	 * @private
	 *
	 * @param level {Array} The current level to perform
	*/
	function __generateStartLevelCallback(level) {
		return function(resultChain) {__startLevel(level, function() {resultChain.done();});};
	};

	/**
	 * Create a callback function for loader system
	 *
	 * @method __generateDefaultLoader
	 * @private
	 *
	 * @param fct {Function} The loader function used
	 * @param uri {String} The uri to load
	 * @param extra {Function | null} The extra parsing function (may be needed)
	*/
	function __generateDefaultLoader(fct, uri, extra) {
		return function(result) {
			a.loader[fct](uri, function(data) {
				if(a.isFunction(extra)) {
					extra(data);
				}
				result.done();
			});
		};
	};

	/**
	 * Replace every needed content with data stored
	 *
	 * @method __parseOptions
	 * @private
	 *
	 * @param name {String | null} The name to give to data
	 * @param internal {String} The hash (internal one with param definition)
	 * @param options {Object} The data parameter for calling ajax request
	*/
	function __parseOptions(hash, internal, options) {
		if(a.isObject(options)) {
			for(var i in options) {
				options[i] = a.state.helper.parameter.extrapolate(options[i], hash, internal);
				__parseOptions(hash, internal, options[i]);
			}
		}
	};

	/**
	 * Specific data loading for data parameter
	 *
	 * @method __generateDefaultDataLoader
	 * @private
	 *
	 * @param name {String | null} The name to give to data
	 * @param data {String} The data url to load
	 * @param options {Object} The data parameter for calling ajax request
	 * @param internal {String} The hash (internal one with param definition)
	 * @return {Function} The function to use for loading data
	*/
	function __generateDefaultDataLoader(name, data, options, internal) {
		var opt  = a.clone(options),
			hash = a.page.event.hash.getHash();

		// Parsing options with parameters if possible
		opt.url = a.state.helper.parameter.extrapolate(data, hash, internal);
		__parseOptions(hash, internal, opt);

		// Trimming value
		data = data.replace(/^\s+|\s+$/g, "");

		// If data contains {{ and }} at beginning and ending, then it's not an url but a parameter binding (from hashtag)
		if(data.indexOf("{{") === 0 && data.indexOf("}}") === (data.length - 2)) {
			data = a.state.helper.parameter.extrapolate(data, hash, internal, false);
			return function(result) {
				var d = result.getData("data") || {};
				// If it's first use, we setup data system
				if(!a.isObject(d.a)) {
					d.a = d.appstorm = {};
					d.a.parameter = d.appstorm.parameter = {};
				}
				if(a.isNull(name)) {
					d = data;
				} else {
					// The variable name = content
					d.a.parameter[name] = data;
					d.appstorm.parameter = d.a.parameter;
					// We bind to default parameter only if not already used
					if(a.isNull(d[name])) {
						d[name] = data;
					}
				}
				result.setData("data", d);
				result.done();
			};
		}

		// Give back a function to load data content
		return function(result) {
			// Generate default result before anything else
			if(a.isNull(result.getData("data"))) {
				result.setData("data", {});
			}
			var ajx = new a.ajax(opt, function(content) {
				if(a.isNull(name)) {
					result.setData("data", content);
				} else {
					var d = result.getData("data");
					d[name] = content;
					result.setData("data", d);
				}
				result.done();
			}, __error);

			// Starting and waiting reply
			ajx.send();
		};
	};

	/**
	 * From a list of url, load every resource
	 *
	 * @method __generateLoader
	 * @private
	 * @async
	 *
	 * @param state {Object} The state object with all needed data inside to perform scan
	 * @param callback {Function} The function to call when load is finished
	*/
	function __generateLoader(state, callback) {
		var sync      = new a.callback.synchronizer(),
			css       = state.include.css,
			js        = state.include.js,
			html      = state.include.html,
			translate = state.include.translate,
			data      = state.data,
			title     = state.title,
			options   = state.options,
			converter = state.converter,
			internal  = state.hash;

		var lcss = css.length,
			ljs  = js.length;

		while(lcss--) {
			sync.addCallback(__generateDefaultLoader("css", css[lcss]));
		}
		while(ljs--) {
			sync.addCallback(__generateDefaultLoader("js", js[ljs]));
		}

		// Only if translate is register...
		if(!a.isNull(a.language) && translate.length > 0) {
			var ltr = translate.length;
			while(ltr--) {
				sync.addCallback(
					__generateDefaultLoader("json", translate[ltr], function(content) {
						for(var i in content) {
							a.language.addTranslation(i, content[i], true);
						}
					})
				);
			}
		}

		// Loading html
		if(a.isString(html)) {
			// Replacing eventual hashtag param with data
			html = a.state.helper.parameter.extrapolate(html, a.page.event.hash.getHash(), internal);

			sync.addCallback(function(result) {
				result.setData("html", html);
				a.page.template.get(html, {}, result.done, __error);
			});
		}

		// Loading data

		if(a.isString(data) || a.isObject(data)) {
			// Correct options trouble behaviour
			if(!a.isObject(options)) {
				options = {
					type : "json"
				};
			}

			if(!a.isString(options.type)) {
				options.type = "json";
			}

			if(a.isString(data)) {
				sync.addCallback(__generateDefaultDataLoader(null, data, options, internal));
			} else {
				for(var u in data) {
					if(a.isObject(data[u]) && a.isString(data[u].url)) {
						if(!a.isObject(data[u].options)) {
							data[u].options = {
								type : "json"
							};
						}
						sync.addCallback(__generateDefaultDataLoader(u, data[u].url, data[u].options, internal));
					} else {
						sync.addCallback(__generateDefaultDataLoader(u, data[u], options, internal));
					}
				}
			}
		} else {
			// Populating data if there is no data to load, to never crash converter
			sync.addCallback(function(result) {
				result.setData("data", {});
				result.done();
			});
		}

		// Preparing callback to group data with html content
		var internalCallback = function(obj) {
			if(!a.isNull(converter)) {
				converter(obj.data);
			}

			if(!a.isNull(title)) {
				// Allow title to retrieve data from hashtag
				title = a.state.helper.parameter.extrapolate(title, a.page.event.hash.getHash(), internal);
				if(!a.isNull(a.language)) {
					document.title = a.language.getSingleTranslation(title);
				} else {
					document.title = title;
				}
			}

			var d = obj.data,
				h = obj.html;

			d = (!a.isNull(d)) ? d : {};

			if(!a.isNull(h)) {
				a.page.template.get(h, d, function(content) {
					if(a.isFunction(callback)) {
						callback(obj, content);
					}
				});
			} else if(a.isFunction(callback)) {
				callback(obj, null);
			}
		};

		sync.setSuccess(internalCallback);
		sync.setFail(__error);

		sync.start();
	};

	/**
	 * Start a state chain (unload, or load chain)
	 *
	 * @method __startState
	 * @private
	 * @async
	 *
	 * @param state {Object} A state to start
	 * @param clb {Function} The callback to apply on success (or fail)
	*/
	function __startState(state, clb) {
		var chain = new a.callback.chainer();

		if(type === "unload") {
			chain.addCallback(state.preUnload, state.unload, state.postUnload);
		} else {
			// Load chain, including content (like HTML, CSS, ...)
			chain.addCallback(
				// Preload
				function(result) {
					if( a.isFunction(state.preLoad) && (id == -1 || (id >= 0 && a.state.__currentGeneratedId() === id)) ) {
						state.preLoad(result);
					} else {
						result.done();
					}
				},
				// Load
				function(result) {
					__generateLoader(state, function(obj, content) {
						if( a.isFunction(state.load) && (id == -1 || (id >= 0 && a.state.__currentGeneratedId() === id)) ) {
							state.load(content);
						}
						var data = result.getFullData() || {};
						if(a.isObject(obj.data)) {
							for(var i in obj.data) {
								data[i] = obj.data[i];
							}
						}
						result.setFullData(data);
						result.done();
					});
				},
				// Postload
				function(result) {
					if( a.isFunction(state.postLoad) && (id == -1 || (id >= 0 && a.state.__currentGeneratedId() === id)) ) {
						state.postLoad(result);
					} else {
						result.done();
					}
				}
			);
		}
		
		chain.setSuccess(clb);
		// We must continue even if system fail
		chain.setFail(__error);

		chain.start();
	};

	/**
	 * Unload a full state level
	 *
	 * @method __startLevel
	 * @private
	 * @async
	 *
	 * @param stateList {Array} A list of state to delete
	 * @param clb {Function} The callback to apply on success (or fail)
	*/
	function __startLevel(stateList, clb) {
		var sync = new a.callback.synchronizer(),
			i = stateList.length;

		while(i--) {
			if(a.contains(allowed, stateList[i].id)) {
				// We add a callback : apply start chain for state, then load callback
				(function(state) {
					sync.addCallback(function(result) {
						__startState(state, function() {result.done();});
					});
				})(stateList[i]);
			}
		}

		sync.setSuccess(clb);
		// We must continue even if system fail
		sync.setFail(__error);
		sync.start();
	};

	// We start the loader/unloader system
	var chain = new a.callback.chainer();

	if(type === "unload") {
		while(max--) {
			chain.addCallback(__generateStartLevelCallback(path[max]));
		}
	} else {
		var i = 0;
		while(i < max) {
			chain.addCallback(__generateStartLevelCallback(path[i]));
			i++;
		}
	}

	chain.setSuccess(callback);
	// We must continue even if system fail
	chain.setFail(__error);
	chain.start();
};



/**
 * Allow parameter inside string system, it is used for many things : parameters inside data url, inside options, inside hashtag...
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:state">here</a>
 *
 * @class parameter
 * @static
 * @namespace a.state.helper
*/
a.state.helper.parameter = {
	/**
	 * From a given string, we extract parameter inside
	 *
	 * @method extract
	 *
	 * @param str {String} The string to extract param from
	 * @param customReg {RegExp} A new regex to replace current one
	 * @return {Array} An array with every element as object key : name (the key name), regex (the linked regex), start (integer) as content
	*/
	extract : function(str, customReg) {
		// Example allowed : " id : [a-fA-F0-9]+ is valid
		// valid : a-z and A-Z and 0-9 and -, _, [, ], +, ?, * and of course () and \ and /
		// var rgxp = /\{\{(\s*\w+\s*:\s*[a-z0-9_\-\[\]\(\)\+\*\?\\\/]+\s*)\}\}/gmi,
		var rgxp = /\{\{(\s*\w+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi,
			// trim
			rgxr = /^\s+|\s+$/g;

		var ex = (!a.isNull(customReg));
		if(ex) {
			rgxp = customReg;
		}

		// We extract all parameters
		var param = [],
			match;

		while(match = rgxp.exec(str)) {
			// We keep only the matching part
			var splitted = null;

			if(ex) {
				// Handle default behaviour
				splitted = ["hash", match[1]];
			} else {
				splitted = match[1].split(":", 2);
			}

			// And now we trim to keep only content
			param.push({
				original : match[0].replace(rgxr, ""),
				name : splitted[0].replace(rgxr, ""),
				regex : splitted[1].replace(rgxr, ""),
				start : match["index"]
			});
		}

		// We return that content
		return param;
	},

	/**
	 * Replace a parameter at a specific position
	 *
	 * @method replace
	 *
	 * @param str {String} The string to use as replacement
	 * @param param {Object} An extracted parameter from extract function
	 * @param custom {String | null} A custom string to add to system
	 * @return {String} The string replaced with new content
	*/
	replace : function(str, param, custom) {
		custom = (!a.isNull(custom)) ? custom : "(" + param.regex + ")";
		return str.substr(0, param.start) + custom + str.substr(param.start + param.original.length);
	},

	/**
	 * Replace inside a given str, the parameters found in internal, by value found in hash
	 *
	 * @method extrapolate
	 *
	 * @param str {String} The string to replace parameters inside
	 * @param hash {String} The current system hash
	 * @param internal {String} The hashtag stored internally (with parameters)
	 * @param replace {Boolean | null} Indicate if system should use replace or directly send back data (default : true)
	*/
	extrapolate : function(str, hash, internal, replace) {
		// Only if there is some parameters in str
		if (a.isString(str) && str.indexOf("{{") >= 0 && str.indexOf("}}") >= 0) {
			var rgx = /\{\{(\s*\w+\s*)\}\}/gmi;
			// Param in str should be like this {{hash:name}} or {{store::name}} so it should be same way
			var paramStr      = this.extract(str),
				paramInternal = this.extract(internal),
				extraStr      = this.extract(str, rgx);

			// Merge default parameters, and new one
			paramStr = paramStr.concat(extraStr);

			// Now we extract chain
			var pi = paramInternal.length;
			while(pi--) {
				internal = this.replace(internal, paramInternal[pi]);
			}

			// We create regex to extract parameters
			var regex = new RegExp("^" + internal + "$", "gi");

			// This time the match will fully match at first time directly...
			var match = regex.exec(hash),
				result = [];

			// if we found a match, we just need to make corresponding data from internal to match
			if(match) {
				var i=0,
					l=paramInternal.length;
				for(; i<l; ++i) {
					// match : the first item is direct string (not parsed)
					paramInternal[i]["value"] = match[i+1];
				}

				// We copy value from paramInternal to paramStr everytime we found a name match
				for(var j=0, k=paramStr.length; j<k; ++j) {
					for(i=0; i<l; ++i) {
						// The paramStr is wrongly separate into hash : name (so regex is param name, and name type)
						if(paramInternal[i].name === paramStr[j].regex && paramStr[j].name === "hash") {
							paramStr[j]["value"] = paramInternal[i]["value"];
						}
					}
				}
			}

			// We perform final replace : storage replace and/or hashtag replace
			var ps = paramStr.length,
				pr = (replace === false) ? function(a, b, c){return c;} : this.replace;
			while(ps--) {
				var param = paramStr[ps];
				// Replacing hashtag
				if( (param.name === "hash" || param.name === "hashtag") && !a.isNull(param.value)) {
					str = this.replace(str, param, param["value"]);
				}

				var found = false;

				// Replacing storage
				if(!a.isNull(a.storage)) {
					switch(param.name) {
						case "temporary":
							str = pr(str, param, a.storage.temporary.getItem(param.regex));
							found = true;
							break;
						case "memory":
							str = pr(str, param, a.storage.memory.getItem(param.regex));
							found = true;
							break;
						case "persistent":
							str = pr(str, param, a.storage.persistent.getItem(param.regex));
							found = true;
							break;
						case "cookie":
							str = pr(str, param, a.storage.cookie.getItem(param.regex));
							found = true;
							break;
						case "store":
						case "storage":
							var it = a.storage.temporary.getItem(param.regex);
							if(!a.isNull(it)) {
								str = pr(str, param, it);
							} else {
								str = pr(str, param, a.storage.persistent.getItem(param.regex));
							}
							found = true;
							break;
						default:
							break;
					}
				}

				// If the system does not pass on existing parameter type
				// We try to find a custom one
				if(!found) {
					var handlerList = a.state.type.list();

					if(a.isObject(handlerList)) {
						for(var h in handlerList) {
							if(h === param.name) {
								var fct = handlerList[h];
								if(a.isFunction(fct)) {
									str = pr(str, param, fct(param.regex));
								} else {
									str = pr(str, param, fct);
								}
							}
						}
					}
				}
			}
		}

		return str;
	}
};