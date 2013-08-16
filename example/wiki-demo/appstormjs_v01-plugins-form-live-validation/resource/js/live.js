/**
 * @class live
 * @extends a.form
 *
 * The live validation plugin allow to manage this application content
*/
a.form.live = (function() {
	// List of input tag we don't accept...
	var __refused = ["submit", "reset", "radio", "checkbox"];

	/**
	 * Get the watched element regarding a given dom element
	 *
	 * @param dom {DOMElement} The dom element to load
	*/
	function __getWatched(dom) {
		var input = dom.getElementsByTagName("input"),
			text  = dom.getElementsByTagName("textarea");

		var res = [], i = text.length, j = input.length;

		while(i--) {
			res.push(text[i]);
		}

		while(j--) {
			var el = input[j];
			// We refuse some elements to be used
			if(!a.contains(__refused, el.type)) {
				res.push(el);
			}
		}

		return res;
	};

	/**
	 * Add or remove the error class
	 *
	 * @param root {DOMElement} The root to test
	 * @param current {DOMElement} The current element to test
	 * @param done {Array} The list of previous dom parsed
	*/
	function __watcher(root, current, done) {
		var parent = root.parentNode;

		if(root === current) {
			parent.className += " error";
		} else {
			var i     = done.length,
				found = false;
			while(i--) {
				if(done[i] === root) {
					found = true;
					break;
				}
			}
			if(!found) {
				parent.className = parent.className.replace(/\berror\b/, "");
			}
		}
	};

	/**
	 * Validate form content and show error if needed
	 *
	 * @param dom {DOMElement} The form
	 * @param input {DOMElement} The input content
	 * @param errorList {Array} The a.form.validate response
	*/
	function __validate(dom, input, errorList) {
		var i = errorList.length;

		// If there is no error, we set default one
		if(i === 0) {
			__watcher(input, null, []);
		}

		// The error does exist, so we catch it
		var done = [];
		while(i--) {
			__watcher(input, errorList[i].el, done);
			done.push(errorList[i].el);
		}
	};

	return {
		/**
		 * Start to live watch error plugin system
		 *
		 * @param dom {DOMElement} The form root element to search inside
		*/
		start : function(dom) {
			var elements = __getWatched(dom),
				i = elements.length;

			while(i--) {
				elements[i].onkeyup = function() {
					__validate(dom, this, a.form.validate(dom));
				};
			}
		},

		/**
		 * Validate only once form
		 *
		 * @param dom {DOMElement} The form root element to watch
		*/
		once : function(dom) {
			var errorList = a.form.validate(dom);

			var elements = __getWatched(dom),
				i = elements.length;

			while(i--) {
				__validate(dom, elements[i], errorList);
			}
		},

		/**
		 * Stop the love watch
		 *
		 * @param dom {DOMElement} The form root element to stop watching
		*/
		stop : function(dom) {
			var elements = __getWatched(dom),
				i = elements.length;

			while(i--) {
				elements[i].onkeyup = null;
			}
		}
	};
})();