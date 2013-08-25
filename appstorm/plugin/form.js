"use strict";
/* ************************************************************************

	Version: 0.1

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-07-12

	Date of last modification: 2013-07-12

	Dependencies : [
		a.js
		plugin/language.js (optional)
	]

	Events : []

	Description:
		Manipulate HTML form by with a simple system

************************************************************************ */

/**
 * Manipulate HTML form by with a simple system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:form">here</a>
 *
 * @class form
 * @static
 * @namespace a
*/
a.form = (function() {
	"use strict";

	// HTML/HTML5 input type allowed224 
	var typePatternList = ["text", "search", "url", "tel", "email", "password"],
		minMaxStepList = ["number", "range", "date", "datetime", "datetime-local", "month", "time", "week"],
		typeRequiredList = typePatternList.concat(minMaxStepList, ["number", "checkbox", "radio", "file"]),
		typeMultipleList = ["email", "file"],
		typeList = minMaxStepList.concat(typePatternList, ["color", "checkbox", "file", "hidden", "radio"]);

	/**
	 * Get the attribute from it's name
	 *
	 * @method __attr
	 * @private
	 *
	 * @param el {DOMElement} An element to get hash from
	 * @param attr {String | null} The attribute to search for that element (default : see __attr)
	 * @return {String | null} The hash tag associated (if found)
	*/
	function __attr(el, attr) {
		return (!a.isNull(el.getAttribute)) ? el.getAttribute(attr) : null;
	};

	/**
	 * Convert an HTMLCollection to array
	 *
	 * @method __htmlCollectionToArray
	 * @private
	 *
	 * @param el {HTMLCollection} The collection to convert
	 * @return {Array} An array version
	*/
	function __htmlCollectionToArray(el) {
		var ret = [],
			i   = el.length;
		while(i--) {
			ret.push(el[i]);
		}
		return ret;
	};

	/**
	 * Get the field key from given input
	 *
	 * @method __getFieldKey
	 * @private
	 *
	 * @param e {DOMElement} The element o search value inside
	 * @return {String} The value found
	*/
	function __getFieldKey(e) {
		var name  = __attr(e, "name");

		// Search the good attribute in case of problem
		if(a.isNull(name) || name === "") {
			name = __attr(e, "id");
			// Should never appear... But we provide it in case of trouble
			if(a.isNull(name) || name === "") {
				name = __attr(e, "class");
			}
		}

		return name;
	};

	/**
	 * Get the field value for given input
	 *
	 * @method __getFieldValue
	 * @private
	 *
	 * @param e {DOMElement} The element to search value inside
	 * @return {String} The value found
	*/
	function __getFieldValue(e){
		var type    = __attr(e, "type"),
			tagName = e.tagName.toLowerCase();

		if(tagName === "input" || tagName === "textarea") {
			return (type === "checkbox") ? e.checked : e.value;
		} else if(tagName === "select") {
			return e.options[e.selectedIndex].value;
		}
	};

	/**
	 * From a given dom, get the list of elements inside
	 *
	 * @method __getFieldList
	 * @private
	 *
	 * @param dom {DOMElement} The dom element to search inside
	 * @return {Array} The element list inside DOM
	*/
	function __getFieldList(dom) {
		var inputList     = dom.getElementsByTagName("input"),
			textAreaList  = dom.getElementsByTagName("textarea"),
			selectList    = dom.getElementsByTagName("select"),
			outputList    = [];

		// We remove input who are not listed in typeList (like submit should not appear here)
		inputList = __htmlCollectionToArray(inputList);

		var i = inputList.length;
		while(i--) {
			var at = __attr(inputList[i], "type");
			if(!a.contains(typeList, at) && !a.isNull(at)) {
				inputList.splice(i, 1);
			}
		}

		
		// Concat everything
		return inputList.concat(
			__htmlCollectionToArray(textAreaList),
			__htmlCollectionToArray(selectList)
		);
	};

	/**
	 * Raise an error on input
	 *
	 * @method __validateError
	 * @private
	 *
	 * @param el {DOMElement} The element where comes from error
	 * @param id {String} The element id/name/class
	 * @param name {String | null} The name (like min, pattern, ...) which is not valid, can be null
	 * @param value {String | null} The current input value (can be used as parameter
	 * @return {Object} A validate object with everything inside if possible
	*/
	function __validateError(el, id, name, value) {
		// First : we need to get error element and translate if possible
		var error = "";

		// Retrieve error tag
		if(!a.isNull(name) && name !== "") {
			error = __attr(el, "data-error-" + name);
		}
		if(a.isNull(error) || error === "") {
			error = __attr(el, "data-error");
		}

		if(a.isNull(error) || error === "") {
			a.console.warn("A data-error tag has not been setted for " + id + " with value " + value + ", can't proceed error show", 3);
		}

		// Translate error if possible
		if(!a.isNull(a.language)) {
			error = a.language.getSingleTranslation(error, {
				name : name,
				value : value
			});
		}

		// Returning an object with all needed data inside
		return {
			el : el,
			id : id,
			error : error
		};
	};

	return {
		/**
		 * Allow to skip HTML5 form-novalidate tag or not (boolean)
		 *
		 * @property skipNoValidate
		 * @type Boolean
		 * @default false
		*/
		skipNoValidate : false,

		/**
		 * Get the list of element stored into given form
		 *
		 * @method get
		 *
		 * @param dom {DOMElement} The dom element to search inside (basically it should be document.getElementById("myFormId"))
		 * @return {Object} The list of input tags existing
		*/
		get : function(dom) {
			var inputList  = __getFieldList(dom),
				outputList = {};

			var i = inputList.length;
			while(i--) {
				var input = inputList[i];

				var name  = __getFieldKey(input),
					value = __getFieldValue(input);

				// We don't continue if we don't find any data on element
				if(name === null || name === "") {
					continue;
				}

				// We got a special case with input radio type
				if(!a.isNull(input) && __attr(input, "type") === "radio") {
					// Only checked one are validated
					if(input.checked) {
						outputList[name] = (value === "") ? null : value;
					}
				} else {
					outputList[name] = (value === "") ? null : value;
				}
			};

			a.console.log("a.form.get: found element list:", 3);
			a.console.log(outputList, 3);
			return outputList;
		},

		/**
		 * Validate a form
		 * Note : multiple tester (email, file) is not supported
		 * Note : date field (date, datetime, datetime-local, month, time, week) are not supported
		 * Note : tel/file field are not supported
		 *
		 * @method validate
		 *
		 * @param dom {DOMElement} The dom element to search inside (basically it should be document.getElementById("myFormId"))
		 * @return {Array} An array with all errors listed inside, an empty array if there is no error to show
		*/
		validate : function(dom) {
			// On form tag, the "novalidate" allow to not validate a form
			if(!a.isNull(__attr(dom, "novalidate")) && this.skipNoValidate === false) {
				return [];
			}

			var inputList    = __getFieldList(dom),
				// Store all errors appearing
				errorList    = [],
				// TODO : after todos are ended, remove this...
				allowedTypes = ["number", "range", "text", "search", "url", "email", "password", "color", "checkbox", "hidden", "radio"],
				// Pretty basic url tester
				urlTester    = new RegExp("^[a-z]{2,}:\\/\\/([a-z0-9\\/\\.\\-_~+;:&=]{2,})$", "gi"),
				// Pretty basic email tester
				emailTester  = new RegExp("^.{2,}@.*\\.[a-z0-9]{2,}$", "gi"),
				colorTester  = new RegExp("^#([a-f]{3}|[a-f]{6})$", "gi");

			/*
			 * required : at least one char (text, search, url, tel, email, password, date, datetime, datetime-local, month, time, week, number, checkbox, radio, file)
			 * pattern : a regex to test (Use title like a helper), (text, search, url, tel, email, password)
			 * multiple : the user is allowed to enter more than one element (only for email, file)
			 * min/max : min/max value (number, range, date, datetime, datetime-local, month, time, week)
			 * step : multiplicateur (The step attribute works with the following input types: number, range, date, datetime, datetime-local, month, time, week)
			*/
			var i = inputList.length;
			while(i--) {
				// Does only work for input tags
				var el      = inputList[i],
					tagName = el.tagName.toLowerCase();

				// formnovalidate : we must not validate this element (including all select)
				if(tagName === "select" || !a.isNull(__attr(el, "formnovalidate"))) {
					continue;
				}

				var type     = __attr(el, "type"),
					name    = __getFieldKey(el),
					value    = el.value,

					required = __attr(el, "required"),
					pattern  = __attr(el, "pattern"),
					multiple = __attr(el, "multiple"),
					min      = __attr(el, "min"),
					max      = __attr(el, "max"),
					step     = __attr(el, "step");

				// Double check float data
				min  = (a.isNull(min) || min === "")   ? null : parseFloat(min);
				max  = (a.isNull(max) || max === "")   ? null : parseFloat(max);
				step = (a.isNull(step) || step === "") ? null : parseFloat(step);

				// Check input type does existing in allowed type list
				if(tagName === "input" && !a.contains(allowedTypes, type)) {
					a.console.warn("Type " + type + " for input " + name + " not recognized or not supported", 3);
					continue;
				}

				// Now checking type
				if( (type === "number" || type === "range") && !a.isNumber(value) ) {
					errorList.push(__validateError(el, name, null, value));
					continue;
				}
				if(type === "url" && !urlTester.test(value) ) {
					errorList.push(__validateError(el, name, null, value));
					continue;
				}
				if(type === "email" && !emailTester.test(value) ) {
					errorList.push(__validateError(el, name, null, value));
					continue;
				}
				if(type === "color" && !colorTester.test(value) ) {
					errorList.push(__validateError(el, name, null, value));
					continue;
				}

				// Required test
				if( required !== null && a.contains(typeRequiredList, type) && (value === "" || a.isNull(value)) ) {
					errorList.push(__validateError(el, name, "required", value));
					continue;
				}

				// Pattern test
				if( pattern !== null && (tagName === "textarea" || a.contains(typePatternList, type)) ) {
					var reg = new RegExp(pattern);
					if(!reg.test(value)) {
						errorList.push(__validateError(el, name, "pattern", value));
						continue;
					}
				}

				// Min/max/step test
				if( (min !== null || max != null || step != null) && a.contains(minMaxStepList, type) ) {
					var pval = parseFloat(value);
					if( min !== null && pval < min ) {
						errorList.push(__validateError(el, name, "min", value));
						continue;
					}
					if( max !== null && pval > max ) {
						errorList.push(__validateError(el, name, "max", value));
						continue;
					}
					if( step !== null && pval % step !== 0 ) {
						errorList.push(__validateError(el, name, "step", value));
						continue;
					}
				}
			}

			a.console.log("a.form.validate: found error list:", 3);
			a.console.log(errorList, 3);
			return errorList;
		},

		/**
		 * Validate and get the form content
		 *
		 * @method validateAndGet
		 *
		 * @param dom {DOMElement} The dom element to search inside (basically it should be document.getElementById("myFormId"))
		 * @return {Object} An object with error (boolean), errorList (Array), and contentList (Array)
		*/
		validateAndGet : function(dom) {
			return {
				errorList   : this.validate(dom),
				error       : (obj.errorList.length > 0) ? true : false,
				contentList : this.get(dom)
			};
		}
	};

})();