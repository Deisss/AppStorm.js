/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a basic REST object allowing to quickly draw on top of
        a.mock a full REST API system.

************************************************************************ */
(function (a) {
    /**
     * From a list of primaries, get the resulting request style
     *
     * @private
     *
     * like:
     * a.model('test', {
     *   id: {
     *     primary: true,
     *     pattern: '[a-fA-F0-9]+'
     *   }
     * });
     * Will give:
     *   getPrimaryRequest('test') => '{{id: [a-fA-F0-9]+}}'
    */
    function getPrimaryRequest(model) {
        // Building primaries
        var primaries  = a.model.pooler.getPrimary(model),
            properties = a.model.pooler.get(model),
            pattern    = null,
            result     = [];

        for (var i = 0, l = primaries.length; i < l; ++i) {
            var p = primaries[i];
            pattern = properties.properties[p].pattern || '[0-9]+'
            result.push('{{' + p + ': ' + pattern + '}}');
        }

        if (result.length === 0) {
            a.console.storm('error', 'The model ```' + model.modelName +
                '``` does not have any primary keys, yet, you are using it ' +
                'inside ```a.rest```, which will probably have unwanted ' +
                'behavior', 1);
        }

        return result.join('/');
    };

    /**
     * Construct the search request from the model name, their primaries, and
     * their data.
     *
     * @private
     *
     * @param {String} model                The model name
     * @param {Array} data                  The list of data inside the model
     * @return {Object}                     The search object
    */
    function getSearchRequest(model, data) {
        var primaries = a.model.pooler.getPrimary(model),
            results   = {
                modelName: model
            };

        for (var i = 0, l = primaries.length; i < l; ++i) {
            if (!isNaN(data[i])) {
                results[primaries[i]] = parseFloat(data[i]);
            } else {
                results[primaries[i]] = data[i];
            }
        }

        return results;
    };

    /**
     * Simple rest object.
     *
     * @constructor
     *
     * @param {String} name                 The rest name, usually the resource
     *                                      name like 'user', 'project'...
     * @param {String} uri                  The associated base URI
     * @param {String} model                The associated model name
     * @param {Object | Null} options       Any revelant options to use.
     *                                      Currently supporting 'mock', and
     *                                      'header' only
    */
    a.rest = function(name, uri, model, options) {
        if (!(this instanceof a.rest)) {
            return new a.rest(name, uri, model, options);
        }

        // If uri ends with '/', remove it.
        uri = (uri.slice(-1) === '/') ? uri.slice(0, -1) : uri;
        uri = a.sanitize(uri);

        options = options || {};

        // Basic stored data
        this.name  = name;
        this.uri   = uri;
        this.store = a.mem.getInstance('a.rest.' + name);

        if (!a.isArray(this.store.get('data'))) {
            this.store.set('data', []);
        }
        this.data       = this.store.get('data');

        // Get the primary chain for requesting something...
        var single = a.sanitize(uri + '/' + getPrimaryRequest(model));

        // Creating request
        this.store.set('request.LIST', function (data, success, error) {
            a.ajax({
                url: uri,
                data: data,
                header: options.header || {},
                template: ['GET', 'json', 'model:' + model, 'many']
            }, success, error).send();
        });
        this.store.set('request.GET', function (data, success, error) {
            a.ajax({
                url: single,
                data: data,
                header: options.header || {},
                template: ['GET', 'json', 'model:' + model]
            }, success, error).send();
        });
        this.store.set('request.POST', function (data, success, error) {
            a.ajax({
                url: uri,
                data: data,
                header: options.header || {},
                template: ['POST', 'json', 'model:' + model]
            }, success, error).send();
        });
        this.store.set('request.PUT', function (data, success, error) {
            a.ajax({
                url: single,
                data: data,
                header: options.header || {},
                template: ['PUT', 'json', 'model:' + model]
            }, success, error).send();
        });
        this.store.set('request.DELETE', function (data, success, error) {
            a.ajax({
                url: single,
                data: data,
                header: options.header || {},
                template: ['DELETE', 'json', 'model:' + model]
            }, success, error).send();
        });

        // In case of mock
        if (options.mock) {
            // Get all entries
            a.mock.add('GET', uri, function () {
                var parameters = a.toArray(arguments);
                parameters.modelName = model;
                return a.model.pooler.searchInstance(parameters);
            }, model);

            // Get an entry
            a.mock.add('GET', single, function() {
                var parameters = getSearchRequest(model, a.toArray(arguments)),
                    instances  = a.model.pooler.searchInstance(parameters);

                if (a.isArray(instances) && instances.length > 0) {
                    return instances[0];
                } else {
                    return null;
                }
            }, model);

            // Add an entry
            a.mock.add('POST', uri, function() {
                var parameters = a.toArray(arguments);
                var tmp = a.model(model);
                tmp.fromObject(parameters.splice(-1)[0]);
                return tmp;
            }, model);

            // Update an existing entry
            a.mock.add('PUT', single, function() {
                var parameters = getSearchRequest(model, a.toArray(arguments)),
                    instances  = a.model.pooler.searchInstance(parameters);

                if (a.isArray(instances) && instances.length > 0) {
                    instances[0].fromObject(data);
                    return instances[0];
                } else {
                    return null;
                }
            }, model);

            // Delete a single entry
            a.mock.add('DELETE', single, function() {
                var parameters = getSearchRequest(model, a.toArray(arguments)),
                    instances  = a.model.pooler.searchInstance(parameters);

                if (a.isArray(instances) && instances.length > 0) {
                    a.model.manager.remove(instances[0].uid);
                }

                return null;
            }, model);
        }

        /**
         * This function helps to use inside a state.
         *
         * @param {String} name                 The request name
         * @return {Function}                   A state ready to use function
        */
        this.state = function(name) {
            var that = this;
            return function(chain) {
                that.request(name, null, chain.next, chain.error);
            };
        };

        /**
         * Send a request to server, or, if using mock, use mock object instead.
         *
         * @param {String} name                 The request name
         * @param {Object} data                 Any data to pass to request
         * @param 
        */
        this.request = function(name, data, success, error) {
            var req = this.store.get('request.' + name);
            if (req) {
                // TODO: Call request

            } else {
                error();
            }
        }
    };
})(window.appstorm);