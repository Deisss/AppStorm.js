/* ************************************************************************

    License: MIT Licence

    Authors: VILLETTE Charles

    Date: 2013-05-10

    Date of last modification: 2013-10-20

    Dependencies : [
        a.js
    ]

    Events : []

    Description:
        Provide parsing/stringify functionnality for JSON and XML format

************************************************************************ */

// Provide parsing/stringify functionnality for JSON and XML format
a.parser = {
    /**
     * Basic JSON handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check
     *
     * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:parser">here</a>
     *
     * @class json
     * @static
     * @namespace a.parser
    */
    json: {
        /**
         * Serialize a JSON into a string
         *
         * @method stringify
         *
         * @param value {Object}         Any data to be converted into String
         * @return {String}              A JSON parsed string, or an empty
         *                               string if the parsing fails
        */
        stringify: function(value) {
            try {
                return JSON.stringify(value);
            } catch(e) {
                var unable = 'a.parser.json.stringify: ' +
                            'unable to stringify (value: ' + value + ')';
                a.console.error(unable, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('debug')) {
                    a.console.error(a.getStackTrace(), 1);
                }
                return '';
            }
        },

        /**
         * Deserialize a string into JSON
         *
         * @method parse
         *
         * @param value {String}            The value un-stringify
         * @return {Mixed | null}           The converted value
        */
        parse: function(value) {
            try {
                return JSON.parse(value);
            } catch(e) {
                var unable = 'a.parser.json.parse: ' +
                            'unable to parse (value: ' + value + ')';
                a.console.error(unable, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('debug')) {
                    a.console.error(a.getStackTrace(), 1);
                }
                return null;
            }
        }
    },

    /**
     * Basic XML handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check
     *
     * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:parser">here</a>
     *
     * @class xml
     * @static
     * @namespace a.parser
    */
    xml: {
        /**
         * Serialize a XML into a string
         *
         * @method stringify
         *
         * @param value {Object}      Any data to be converted into String
         * @return {String}           A parsed string, or an empty
         *                            string if the parsing fails
        */
        stringify: function(value) {
            if(!a.isNull(value) && !a.isNull(value.xml)) {
                return value.xml;
            } else if(!a.isNull(window.XMLSerializer)) {
                try {
                    var serializer = new window.XMLSerializer();
                    return serializer.serializeToString(value);
                } catch(e) {
                    var unable = 'a.parser.xml.stringify: ' +
                                 'unable to stringify (value: ' + value + ')';
                    a.console.error(unable, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('debug')) {
                        a.console.error(a.getStackTrace(), 1);
                    }
                } finally {
                    return '';
                }
            }

            var noParserFound = 'a.parser.xml.stringify: ' +
                                'unable to find any parser available';
            a.console.error(noParserFound, 1);
            return '';
        },

        /**
         * Deserialize a string into XML
         *
         * @method parse
         *
         * @param value {String}          The value un-stringify
         * @return {DOMElement | null}    The resulting doc element, or null
         *                                in case of problem
        */
        parse: function(value) {
            if(!a.isNull(window.ActiveXObject)) {
                var doc = null;
                // 4: we stop at MSXML 3.0
                for(var i=0; i<4; ++i) {
                    try {
                        // Name are: Msxml2.DOMDocument.6.0 to 3.0
                        var msxml = 'MSXML2.DOMDocument.' + (6 - i) + '.0';
                        doc = new ActiveXObject(msxml[i]);
                    } catch(e) {}
                }
                doc.async = false;
                doc.loadXML(value);
                if (doc.parseError.errorCode != 0) {
                    var unable = 'a.parser.xml.parse: ' +
                                 'unable to parse (value: ' + value +
                                 ', reason' + doc.parseError.reason + ')';
                    a.console.error(unable, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('debug')) {
                        a.console.error(a.getStackTrace(), 1);
                    }

                    return null;
                }
                return doc;
            } else if(!a.isNull(window.DOMParser)) {
                return (new DOMParser()).parseFromString(value, 'text/xml');
            }

            var noParserFound = 'a.parser.xml.parse: ' +
                                'unable to find any parser available';
            a.console.error(noParserFound, 1);
            return null;
        }
    }
};
