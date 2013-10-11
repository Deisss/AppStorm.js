/* ************************************************************************

	License: MIT Licence

	Authors: VILLETTE Charles

	Date: 2013-05-10

	Date of last modification: 2013-10-11

	Dependencies : [
		a.js
	]

	Events : []

	Description:
		Provide parsing functionnality for using json, xml, html...

************************************************************************ */


// provide parsing functionality for using json, xml, html...
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
