/* ************************************************************************

    License: MIT Licence

    Description:
        The object is faking a server behavior to skip server creation during
        client creation. It provide a simple emulation of server side.

************************************************************************ */

/**
 * The object is faking a server behavior to skip server creation during
 * client creation. It provide a simple emulation of server side.
 *
 * @class mock
 * @static
 * @namespace a
*/
a.mock = {
    /**
     * Store the existing mock to use with application
     *
     * @property _mock
     * @type Array
     * @default []
    */
    _mock: [],

    /**
     * Rollback to default content (nothing)
     *
     * @method clear
    */
    clear: function() {
        a.mock._mock = [];
    },

    /**
     * Add a new mock to system
     *
     * @method add
     *
     * @param method {String}               The HTTP method (GET/POST/PUT/...)
     * @param url {String}                  The url to catch
     * @param result {Object | Function}    The attempted result
     * @param model {String | null}         The model linked to the answer. Use
     *                                      's' at the end if it's a list of...
    */
    add: function(method, url, result, model) {
        var mocks = a.mock._mock;

        if(!method) {
            method = 'get';
        }

        mocks.push({
            method: method.toLowerCase(),
            url:    url,
            result: result || {},
            model:  model || null
        });
    },

    /**
     * Get an existing result from model
     *
     * @method get
     *
     * @param method {String}               The HTTP method (GET/POST/PUT/...)
     * @param url {String}                  The url to catch
     * @return {Object | null}              The result associated to mock
    */
    get: function(method, url) {
        var mocks = a.mock._mock,
            i = mocks.length;

        while(i--) {
            var mock = mocks[i];
            if(mock.method === method.toLowerCase() && mock.url === url) {
                if(a.isFunction(mock.result)) {
                    return mock.result();
                }
                return mock.result;
            }
        }
        return null;
    },

    /**
     * Get all mock related to model, and merge their content (= get a unique
     * object containing ALL properties found)
     *
     * @method merge
     *
     * @param model {String}                The model name to search
     * @return {Object}                     The merge realise, or an empty
     *                                      object if trouble
    */
    merge: function(model) {
        if(!model) {
            return {};
        }

        var result = {},
            mocks = a.mock._mock,
            i = mocks.length;

        // Creating a final object containings all properties found
        while(i--) {
            var mock = mocks[i];

            if(mock.model) {
                // Single model
                if(mock.model === model) {
                    var part = a.isFunction(mock.result) ? mock.result() :
                                                                mock.result;
                    result = a.assign(result, part);

                // Multiple model
                } else if(mock.model === model + 's') {
                    var part = a.isFunction(mock.result) ? mock.result() :
                                                                mock.result,
                        j = part.length;
                    while(j--) {
                        result = a.assign(result, part[j]);
                    }
                }
            }
        }

        // Try to (ONLY TRY) to find properties type
        // ONLY Try because it can easily fail by overwriting properties
        // can skip some type for given elements
        for(var j in result) {
            var property = result[j];

            if(a.isString(property)) {
                result[j] = 'string';
            } else if(a.isBoolean(property)) {
                result[j] = 'boolean';
            } else if(a.isNumber(property) && !a.isNaN(property)) {
                result[j] = 'number';
            } else if(a.isArray(property)) {
                result[j] = 'array';
            } else if(a.isTrueObject(property)) {
                result[j] = 'object';
            } else {
                result[j] = 'UNKNOW';
            }
        }

        return result;
    },

    /**
     * Generate a simple map of all urls/method couple you are currently using.
     * It is sorted by model type... If the model type is using a 's', for
     * now it still linked like this, as it was with a 's', we keep that for
     * saying 'those url returns array'.
     *
     * @method map
     *
     * @return {Object}                     A related object
    */
    map: function() {
        var result = {},
            mocks = a.mock._mock,
            i = mocks.length;

        while(i--) {
            var mock = mocks[i];
            // Check model
            if(mock.model) {
                var model = mock.model,
                    method = mock.method;

                if(!result[model]) {
                    result[model] = {};
                }

                if(!result[model][method]) {
                    result[model][method] = [];
                }

                result[model][method].push(mock.url);

            // We are in 'unknow' mode
            } else {
                var unknow = 'unknow';
                if(!result[unknow]) {
                    result[unknow] = {};
                }

                if(!result[unknow][method]) {
                    result[unknow][method] = [];
                }

                result[unknow][method].push(mock.url);
            }
        }

        return result;
    }
};