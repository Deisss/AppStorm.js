/*! ***********************************************************************

    License: MIT Licence

    Description:
        Dynamic loader for many files type

************************************************************************ */


/**
 * Dynamic loader for many files type.
 *
 * @constructor
*/
a.loader = (function() {
    'use strict';

    // The store, curently setted on document and document.body.
    // Can also be setted to something like:
    //   var doc = document.createElement('div');
    //   var doc = document.body;
    // if you want the dom remains empty of appstorm scripts.
    var doc = document.getElementsByTagName('head')[0];

    /**
     * Create a script html tag element.
     *
     * @private
     *
     * @param {String} type                 The script type, should be
     *                                      text/javascript by default
     * @param {String} src                  The source of the script
     * @param {String} data                 Any data to append to script tag
     * @return {DOMElement}                 The element created
    */
    function createScriptElement(type, src, data) {
        var el = document.createElement('script');

        el.setAttribute('type', type);
        el.setAttribute('data-src', src);
        el.text = data;

        return el;
    }

    /**
     * Create a style html tag element.
     *
     * @private
     *
     * @param {String} data                 The data to append to style tag.
     * @return {DOMElement}                 The element created
    */
    function createStyleElement(data) {
        var el = document.createElement('style');
        el.setAttribute('type', 'text/css');

        // IE
        if (el.styleSheet && !el.sheet) {
            el.styleSheet.cssText = data;
        } else {
            el.appendChild(document.createTextNode(data));
        }

        return el;
    }

    /**
     * Create an HTML script containing data loaded. This helps to avoid
     * loading twice the same resource.
     *
     * @private
     *
     * @param {String} type                 The element type, could be usually
     *                                      css, js, html or translate/json
     * @param {String} src                  The source related to this data
     * @param {String} data                 The associated data
    */
    function createHtmlCache(type, src, data) {
        var el = createScriptElement('appstorm/' + type.toLowerCase(),
                a.sanitize(src), data);

        doc.appendChild(el);
    }

    /**
     * Search for an existing data stored in HTML cache.
     *
     * @private
     *
     * @param {String} type                 The type to search (like css, js)
     * @param {String} src                  The source related to data
     * @return {String | Null}              Any string stored, or null if
     *                                      no matching tag where found...
    */
    function searchHtmlCache(type, src) {
        var scripts  = doc.getElementsByTagName('script'),
            sanitize = a.sanitize(src);

        type = type.toLowerCase();

        for (var i = 0, l = scripts.length; i < l; ++i) {
            if (scripts[i].getAttribute('type') === 'appstorm/' + type && 
                    scripts[i].getAttribute('data-src') === sanitize) {
                return scripts[i].text;
            }
        }

        // Nothing found
        return null;
    }

    /**
     * load some data threw AJAX.
     *
     * @private
     * @async
     *
     * @param {String} uri                  The data path
     * @param {Function | Null} success    The callback to apply in
     *                                      case of success
     * @param {Function | Null} error       The callback to apply
     *                                      in case of error
     * @param {Object | Null} args          An ajax argument object,
     *                                      not all of them are used
     *                                      (some are automatically generated
     *                                      and cannot be changed)
    */
    function ajaxLoad(uri, success, error, args) {
        // Searching existing content
        if (a.isTrueObject(args) && args.cacheType) {
            var search = searchHtmlCache(args.cacheType, uri);
            if (search !== null) {
                if (a.isFunction(success)) {
                    success(search, -10);
                }
                return;
            }
        }

        var options = {
            url    : uri,   //Allowed type : any URL
            method : 'GET', //Allowed type : 'GET', 'POST'
            type   : 'raw', //Allowed type : raw, json, xml
            async  : true,  //Allowed type : true, false
            cache  : true,  //Allowed type : true, false
            data   : {},    //Allowed type : any kind of object | key => value
            header : {}     //Allowed type : any kind of object | key => value
        };

        a.console.storm('log', 'a.loader',
                'Loading resource from url ```' + uri + '```', 3);

        if(!a.isNone(args)) {
            if(a.isString(args.method)) {
                options.method = args.method;
            }
            if(!a.isNone(args.type) &&
                    (args.type === 'json' || args.type === 'xml') ) {
                options.type = args.type;
            }
            if(a.isTrueObject(args.data)) {
                options.data = args.data;
            }
            if(a.isTrueObject(args.header)) {
                options.header = args.header;
            }
            if(a.isBoolean(args.cache)) {
                options.cache = args.cache;
            }
        }

        // The real callback handling response
        var handlerCallback = function(content, status) {
            if(a.isFunction(success)) {
                success(content, status);
            }
            if (a.isTrueObject(args) && args.cacheType) {
                createHtmlCache(args.cacheType, uri, content);
            }
        };

        // Loading data
        var er = (a.isFunction(error)) ? error : function(){};
        a.ajax(options, handlerCallback, er).send();
    }

    function appendElementToHeader(type, uri, success, error, args) {
        // Exiting if type is unknow
        if (type !== 'script' && type !== 'style') {
            a.console.storm('error', 'a.loader', 'Unknow type ```' + type +
                    '```', 1);
            if (a.isFunction(error)) {
                error();
            }
            return;
        }

        ajaxLoad(uri, function(data, status) {
            // It's loaded from cache...
            // Which means we got nothing to do
            if (status === -10) {
                if (a.isFunction(success)) {
                    success(data);
                }
                return;
            }

            var el = null;

            if (type === 'script') {
                el = createScriptElement(args.tagType, uri, data);
            } else if (type === 'style') {
                el = createStyleElement(data);
            }

            // Append element to dom
            document.getElementsByTagName('head')[0].appendChild(el);

            // Now we can call back success
            if (a.isFunction(success)) {
                success(data);
            }
        }, error, args || {});
    }

    return {
        /**
         * Javascript loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        js: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            // TODO: for IE only, for others use application/javascript
            args.tagType = 'text/javascript';
            args.cacheType = 'js';

            appendElementToHeader('script', uri, success, error, args);
        },

        /**
         * JSONP loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        jsonp: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            // TODO: for IE only, for others use application/javascript
            args.tagType = 'text/javascript';

            appendElementToHeader('script', uri, success, error, args);
        },

        /**
         * JSON loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        json: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }

            args.type = 'json';
            args.header.accept = 'application/json, text/javascript';

            ajaxLoad(uri, success, error, args);
        },

        /**
         * XML loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        xml: function(uri, success, error, args) {
            // Setting the type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'xml';

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'application/xml, text/xml';

            ajaxLoad(uri, success, error, args);
        },

        /**
         * CSS loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        css: function(uri, success, error, args) {
            if (!a.isTrueObject(args)) {
                args = {};
            }

            args.tagType = 'text/css';
            args.cacheType = 'css';

            appendElementToHeader('style', uri, success, error, args);
        },

        /**
         * HTML loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        html: function(uri, success, error, args) {
            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }

            args.tagType = 'text/html';
            args.cacheType = 'html';

            // In debug mode, we disallow cache
            if(a.environment.get('app.debug') === true) {
                args.cache = false;
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }

            args.header.accept = 'text/html';

            appendElementToHeader('script', uri, success, error, args);
        },

        /**
         * JavaFX loader.
         *
         * @async
         *
         * @param {String} uri               The path for given jar files to
         *                                   load
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An object to set property for
         *                                   javaFX (like javascript name...),
         *                                   we need : args.code (the main to
         *                                   start), args.id (the id of
         *                                   project). args.width and height
         *                                   are optional
        */
        javafx: function (uri, success, error, args) {
            if(a.isNone(args) || a.isNone(args.code) || a.isNone(args.id)) {
                var errorStr =  'The system need args.code ';
                    errorStr += 'and args.name setted to be able to load any ';
                    errorStr += 'javafx resource... This uri will not be ';
                    errorStr += 'loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.javafx', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, success)) {
                return;
            }

            // Load (if needed) javaFX javascript include helper
            var version = (args.version) ? args.version : '1.3';
            this.js('http://dl.javafx.com/' +version+ '/dtfx.js', function() {
                javafx({
                    archive: uri,
                    width: args.width || 1,
                    height: args.height || 1,
                    code: args.code,
                    name: args.id
                });
            });

            // There is no 'load' event, so we emulate one
            var timer = null,
                max = 2000;

            timer = a.timer.add(function() {
                // Valid when max <ait occurs or system is loaded
                if(max-- > 0 && !a.isNone(
                        document.getElementById(args.id).Packages)) {
                    a.timer.remove(timer);
                    if(a.isFunction(success)) {
                        success();
                    }
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Flash loader.
         *
         * @async
         *
         * @param {String} uri               The path for given swf files to
         *                                   load
         * @param {Function | Null} success  The callback to call after
         *                                   loading success
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An object to set property for
         *                                   Flash
        */
        flash: function (uri, success, error, args) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr +='parameters: rootId and id, setted to be able ';
                    errorStr += 'to load any flash resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.flash', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, success)) {
                return;
            }

            // Load (if needed) the swfobject.js to load flash from that
            this.js(a.url + 'vendor/storage/flash/swfobject.js', function() {
                swfobject.embedSWF(
                        uri,
                        args.rootId,
                        '100%',
                        '100%',
                        '10.0.0',
                        a.url + 'vendor/storage/flash/expressInstall.swf',
                        args.flashvars,
                        args.params,
                        {id : args.id},
                function(e) {
                    // We do make a small timeout, for a strange reason 
                    // the success event is not really ready
                    if(e.success === false && a.isFunction(error)) {
                        error(uri, 408);
                    }else if(e.success === true && a.isFunction(success)) {
                        setTimeout(success, 500);
                    }
                });
            });
        },

        /**
         * Silverlight loader.
         *
         * @async
         *
         * @param {String} uri               The path for given xap files to
         *                                   load
         * @param {Function | Null} success  The callback to call after
         *                                   loading success (NOTE: silverlight
         *                                   is not able to fire load event,
         *                                   so it's not true here...)
         * @param {Function | Null} error    The callback to call after
         *                                   loading error
         * @param {Object} args              An object to set property for
         *                                   Silverlight
        */
        silverlight: function(uri, success, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr += 'parameters: rootId, id, setted to be able ';
                    errorStr +='to load any silverlight resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.silverlight', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, success)) {
                return;
            }

            a.console.storm('log', 'a.loader',
                    'Loading resource from url ```' + uri + '```', 3);

            var obj  = document.createElement('object');
            obj.id   = args.id;
            obj.data = 'data:application/x-silverlight-2,';
            obj.type = 'application/x-silverlight-2';

            if(!a.isArray(args.params)) {args.params = [];}

            // Adding URI to element
            args.params.push({name : 'source', value : uri});

            for(var i=0, l=args.params.length; i<l; ++i) {
                var param = document.createElement('param');
                param.name = args.params[i].name;
                param.value = args.params[i].value;
                obj.appendChild(param);
            }

            document.getElementById(args.rootId).appendChild(obj);

            // There is no 'load' event, so we emulate one
            var timer = null,
                max = 2000;

            timer = a.timer.add(function() {
                // Valid when max <ait occurs or system is loaded
                if(max-- > 0 &&
                        !a.isNone(document.getElementById(args.id).Content)) {

                    a.timer.remove(timer);
                    if (a.isFunction(success)) {
                        success();
                    }
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Get the cache trace loaded.
         *
         * @return {Array}                  The cache trace
        */
        trace: function() {
            return internalCache;
        }
    };
}());