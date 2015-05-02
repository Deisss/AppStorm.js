/*! ***********************************************************************

    License: MIT Licence

    Description:
        The object is faking a server behavior to skip server creation during
        client creation. It provide a simple emulation of server side.

************************************************************************ */
(function (a) {
    /**
     * @private
    */
    var store = a.mem.getInstance('app.mock');

    /**
     * @private
    */
    function getMethod(method) {
        return (!a.isString(method) || !method) ? 'get' : method.toLowerCase();
    }

    /**
     * @private
    */
    function appendToStore(method, data) {
        method = getMethod(method);
        var mocks = store.get(method) || [];

        // many tag
        data.many = false;
        if (a.isTrueObject(data.model)) {
            data.many  = data.model.many;
            data.model = data.model.model;
        }


        if(data.url.indexOf('{{') >= 0 && data.url.indexOf('}}') >= 0) {
            data.regex   = true;
            data.extract = data.url;
            var reg      = a.parameter.convert(data.url);
            data.url     = new RegExp('^' + reg + '$', 'g');
        } else {
            data.regex   = false;
            data.extract = data.url;
        }

        mocks.push(data);
        store.set(method, mocks);
    }

    function typeToString(el) {
        if(a.isString(el)) {
            return 'string';
        } else if(a.isBoolean(el)) {
            return 'boolean';
        } else if(a.isNumber(el) && !a.isNaN(el)) {
            return 'number';
        } else if(a.isArray(el)) {
            return 'array';
        } else if(a.isTrueObject(el)) {
            return 'object';
        } else {
            return 'UNKNOW';
        }
    }

    /**
     * The object is faking a server behavior to skip server creation during
     * client creation. It provide a simple emulation of server side.
     *
     * @constructor
    */
    a.mock = {
        add: function (method, url, result, model) {
            appendToStore(method, {
                url: url || '',
                result: result || {},
                model: model || null
            });
        },

        set: function (method, url, result, model) {
            appendToStore(method, {
                url: url || '',
                result: result || {},
                model: model || null
            });
        },

        get: function (method, url) {
            method    = getMethod(method);
            var mocks = store.get(method) || [],
                mock  = null,
                i     = mocks.length;

            while(i--) {
                mock = mocks[i];

                if (mock.regex === true) {
                    mock.url.lastIndex = 0;
                    if (mock.url.test(url) === true) {
                        var extrapolate = a.parameter.extract(mock.extract),
                            variables   = a.parameter.getValues(url,
                                    mock.extract, extrapolate);

                        if(a.isFunction(mock.result)) {
                            // The variables contains name and value
                            // The pluck create an array containing
                            // only value parameter
                            return mock.result.apply(this,
                                    a.pluck(variables, 'value'));
                        }
                        return mock.result;
                    }

                } else if (mock.url === url) {
                    if(a.isFunction(mock.result)) {
                        return mock.result();
                    }
                    return mock.result;
                }
            }
            return null;
        },

        clear: function() {
            store.clear();
        },

        /**
         * Print a given model structure
        */
        model: function(model) {
            if(!a.isString(model) || !model) {
                return {};
            }

            var data   = [],
                types  = store.list(),
                mocks  = null,
                mock   = null;

            for (var method in types) {
                if (types.hasOwnProperty(method)) {
                    mocks = types[method];

                    for (var j = 0, l = mocks.length; j < l; ++j) {
                        mock = mocks[j];
                        if (mock.model === model && mock.many === true) {
                            if (a.isFunction(mock.result)) {
                                data = data.concat(mock.result());
                            } else {
                                data = data.concat(mock.result);
                            }
                        } else if (mock.model === model) {
                            if (a.isFunction(mock.result)) {
                                data.push(mock.result());
                            } else {
                                data.push(mock.result);
                            }
                        }
                    }
                }
            }

            // Now printing result
            var result   = {},
                property = null,
                line     = null;
            for (var i = 0, l = data.length; i < l; ++i) {
                line = data[i];
                for (property in line) {
                    if (line.hasOwnProperty(property)) {
                        if (!result[property]) {
                            result[property] = [];
                        }

                        result[property].push(typeToString(line[property]));
                    }
                }
            }

            // Now we clean result
            for (property in result) {
                result[property] = a.uniq(result[property]);
                if (result[property].length === 1) {
                    result[property] = result[property][0];
                }
            }

            return result;
        },

        api: function() {
            var result = {},
                types  = store.list(),
                mocks  = null,
                mock   = null,
                model  = null;

            for (var method in types) {
                if (types.hasOwnProperty(method)) {
                    mocks = types[method];

                    for (var j = 0, l = mocks.length; j < l; ++j) {
                        mock  = mocks[j];
                        model = mock.model || 'unknow';

                        if (!result[model]) {
                            result[model] = {};
                        }

                        if (!result[model][method]) {
                            result[model][method] = [];
                        }

                        result[model][method].push(mock.extract);
                    }
                }
            }

            return result;
        }

        /*!
         * @private
        */
    };
})(window.appstorm);