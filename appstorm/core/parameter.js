/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a way to manipulate, extract and replace parameters like
        {{id: [a-fA-F0-9]+}} as regular expression. This is intensly used
        by appstorm to check and manipulate parameters inside state plugin.

************************************************************************ */

/**
 * Provide a way to manipulate, extract and replace parameters like
 * {{id: [a-fA-F0-9]+}} as regular expression. This is intensly used
 * by appstorm to check and manipulate parameters inside state plugin.
 *
 * @contructor
*/
a.parameter = {
    /**
     * Store cached function to use as replacement method.
     *
     * @private
     * @property _fct
     * @type Object
     * @default {}
    */
    _fct: {},

    /**
     * From a given string, we extract parameter inside.
     *
     * @param {String} input                The string to extract param from
     * @param {RegExp | Null} customRegex   A new regex to replace current one
     * @return {Array}                      An array with every element as
     *                                      object key: name (the key name),
     *                                      regex (the linked regex),
     *                                      start (integer) as content
    */
    extract: function(input, customRegex) {
        // Example allowed : ' id : [a-fA-F0-9]+ is valid,
        // simple-te_st: [0-9]+ is valid too
        // valid : a-z and A-Z and 0-9 and -, _, [, ], +, ?, *
        // and of course () and \ and /
        // var regexParameterExtracter =
        //     /\{\{(\s*[a-zA-Z0-9-_-\-]+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi,
        var regexParameterExtracter = /\{\{(\s*[a-zA-Z0-9-\--_]+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi;

        var ex = !a.isNone(customRegex);
        if(ex) {
            regexParameterExtracter = customRegex;
        }

        // We extract all parameters
        var extractedParameters = [],
            match;

        while(match = regexParameterExtracter.exec(input)) {
            // We keep only the matching part
            var separated = null;

            if(ex) {
                // Handle default behaviour
                separated = ['hash', match[1]];
            } else {
                separated = match[1].split(':', 2);
            }

            // And now we trim to keep only content
            extractedParameters.push({
                original:  a.trim(match[0]),
                name:  a.trim(separated[0]),
                regex: a.trim(separated[1]),
                start: match.index
            });
        }

        // We return that content
        return extractedParameters;
    },

    /**
     * Replace a parameter at a specific position.
     *
     * @param {String} input                The string to use as replacement
     * @param {Object} param                An extracted parameter from
     *                                      extract function
     * @param {String | Null} custom        A custom string to add to system
     * @return {String}                     The string replaced with new
     *                                      content
    */
    replace: function(input, param, custom) {
        if(a.isNone(custom)) {
            custom = '(' + param.regex + ')';
        }
        return input.substr(0, param.start) + custom +
                    input.substr(param.start + param.original.length);
    },

    /**
     * Convert a parameter string into a regex string.
     *
     * @param {String} input                The string to convert
     * @param {RegExp | Null} customRegex   A custom regex if needed
     * @return {String}                     The converted string ready to be
     *                                      used as regex tester.
    */
    convert: function(input, customRegex) {
        var extracted = this.extract(input, customRegex),
            i = extracted.length;

        // We will replace into string the current parameter system with regex
        while(i--) {
            input = this.replace(input, extracted[i]);
        }

        return input;
    },


    /**
     * From a given list provided by extract functions, get the related
     * values and bring the new object with, for every regex, the corresponding
     * values.
     *
     * @param {String} input                The input value to extract data
     *                                      from
     * @param {String} internal             The original string regex
     * @param {Object} extract              The extracted object
     * @return {Object}                     The extracted object with values
     *                                      found
    */
    getValues: function(input, internal, extract) {
        var i = extract.length,
            working = '' + internal;

        // We create a huge -global- request matcher
        while(i--) {
            working = this.replace(working, extract[i]);
        }

        // We make a global extraction
        var regex      = new RegExp('^' + working + '$', 'gi'),
            match      = regex.exec(input);

        // Index start at 1, because 0 is the full sentence (unhelpfull here)
        for(var j=1, l=match.length; j<l; ++j) {
            extract[j-1].value = match[j];
        }

        return extract;
    },


    /**
     * Replace inside a given input, the parameters found in internal,
     * by value found in hash.
     * Example:
     *   As input
     *     The page hash (from url-hashtag) is /dashboad/39
     *     The page internal (from state) is /dashboard/{{id: [0-9]+}}
     *     The input (from state include for ex.) is http://mylink.com/{{id}}
     *   It will return
     *     http://mylink.com/39
     *   It also can manage different function loader threw addParameterType,
     *   so it can takes variable content not only from page hash...
     *
     * @param {String} input                The string to replace parameters
     *                                      inside
     * @param {String} hash                 The current string, to extract
     *                                      parameters from.
     * @param {String} internal             The hashtag stored internally
     *                                      (with parameters)
     * @param {Boolean | Null} escape       Indicate if system should escape
     *                                      content to string before sending
     *                                      back, it means if yes, the system
     *                                      will send back '[object object]'
     *                                      for an object (default: yes)
    */
    extrapolate: function(input, hash, internal, escape) {
        if(escape !== false) {
            escape = true;
        }

        // Only if there is some parameters in input
        if (a.isString(input) && input && input.indexOf('{{') >= 0 &&
                input.indexOf('}}') >= 0) {

            var emptyNameRegex = /\{\{(\s*\w+\s*)\}\}/gmi;
            // Param in input should be like this {{hash:name}} or
            // {{store:name}} so it should be same way

            var paramStr =      this.extract(input),
                paramInternal = this.extract(internal),
                extraStr =      this.extract(input, emptyNameRegex);

            // Merge default parameters, and new one
            paramStr = paramStr.concat(extraStr);

            // Now we extract chain
            var pi = paramInternal.length;
            while(pi--) {
                internal = this.replace(internal, paramInternal[pi]);
            }

            // We create regex to extract parameters
            var regex = new RegExp('^' + internal + '$', 'gi'),
            // This time the match will fully match at first time directly...
                match  = regex.exec(hash),
                result = [];

            // if we found a match, we just need to make
            // corresponding data from internal to match
            if(match) {
                var i=0,
                    l=paramInternal.length;
                for(; i<l; ++i) {
                    // match : the first item is direct string (not parsed)
                    paramInternal[i].value = match[i+1];
                }

                // We copy value from paramInternal to paramStr
                // everytime we found a name match
                for(var j=0, k=paramStr.length; j<k; ++j) {
                    for(i=0; i<l; ++i) {
                        // The paramStr is wrongly separate into
                        // hash: name (so regex is param name, and name type)
                        if(paramInternal[i].name === paramStr[j].regex &&
                                paramStr[j].name === 'hash') {
                            paramStr[j].value = paramInternal[i].value;
                        }
                    }
                }
            }

            // We perform final replace : storage replace and hashtag replace
            var ps = paramStr.length,
                pr = (escape === false) ? function(a, b, c){return c;} :
                                                                this.replace;

            while(ps--) {
                var param = paramStr[ps],
                    found = false;

                // Replacing hashtag
                if( (param.name === 'hash' || param.name === 'hashtag') &&
                        !a.isNone(param.value)) {

                    found = true;
                    input = this.replace(input, param, param.value);
                }

                if(!found) {
                    var handlers = this._fct;

                    a.each(handlers, function(handler, index) {
                        if(index == param.name) {
                            input = pr(input, param, handler(param.regex));
                        }
                    });
                }
            }
        }

        return input;
    },

    /**
     * Register a new function parameter (like {{memory: name}}).
     * Here the name will be memory, and the function: the function which will
     * be used to find corresponding name data.
     *
     * @param {String} name                 The parameter type (like 'memory')
     * @param {Function} fct                The function to apply when this
     *                                      parameter type is found
    */
    addParameterType: function(name, fct) {
        if(name && a.isString(name) && a.isFunction(fct)) {
            this._fct[name] = fct;
        }
    },

    /**
     * Unregister a function parameter (should almost never been in fact...).
     *
     * @param {String} name                 The function name to remove
    */
    removeParameterType: function(name) {
        delete this._fct[name];
    }
};



// We allow the 'mem' parameter which manipulate a.mem, and environment for
// same purpose

/*
------------------------------
  PARAMETERS TYPE ASSOCIATED
------------------------------
*/
(function() {
    a.parameter.addParameterType('mem',  function() {
        return a.mem.get.apply(a.mem, arguments);
    });
    a.parameter.addParameterType('environment', function() {
        return a.environment.get.apply(a.environment, arguments);
    });
})();