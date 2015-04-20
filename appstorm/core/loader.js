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

    // Store some cache here
    var internalCache = [],
        // Store the number of css files currently loading threw timer hack...
        nCSS          = 0,
        nJS           = 0,
        htmlMethods   = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

    /**
     * Check the cache, and launch callback if uri is already listed in cache.
     *
     * @private
     * @async
     *
     * @param {String} uri                  The path to access data
     * @param {Function | Null} callback    The callback to apply after loader
     * @return {Boolean}                    True if it's already inside cache,
     *                                      and false in other case
    */
    function checkInternalCache(uri, callback) {
        // Search in cache
        if(a.isNone(uri)) {
            return false;
        }

        for(var i=0, l=internalCache.length; i<l; ++i) {
            if(internalCache[i] === uri) {
                // This exist in cache, we directly call callback
                if(a.isFunction(callback)) {
                    callback();
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Insert into cache if needed the uri.
     *
     * @private
     *
     * @param {String} uri                  The path to access data
     * @param {Object} args                 The arguments to check if cache
     *                                      is specified and policy to use
    */
    function populateInternalCache(uri, args) {
        // By default, we cache
        if(!a.isNone(args) && args.cache === false) {
            return;
        }
        internalCache.push(uri);
    }

    /**
     * Append to header the given tag, used by JS and CSS loader especially.
     *
     * @private
     * @async
     *
     * @param {DOMElement} el               A createElement type result
     * @param {Object} options              HTML Options to add to link
     *                                      appended
     * @param {Function | Null} callback    The callback to apply after loader
     * @param {String} uri                  The path to access data
     * @param {Object | Null} args          The arguments to check if cache
     *                                      is specified and policy to use
     * @param {Function | Null} error       The callback to raise in case
     *                                      of problem (never used)
    */
    function appendElementToHeader(el, options, callback, uri, args, error) {
        for(var i in options) {
            el.setAttribute(i, options[i]);
        }

        if(!a.isNone(args) && args.id) {
            el.setAttribute('id', args.id);
        }

        // Handle if system already trigger or not callback

        var trigger = false;
        // The common callback for both onload and readystatechange
        var cb = function(e) {
            if(trigger) {
                return;
            }

            trigger = true;
            if(a.isFunction(callback)) {
                callback(el);
            }
            populateInternalCache(uri, args);
        };

        if(el.addEventListener) {
            el.addEventListener('load', cb, false);
        } else if(el.readyState) {
            el.onreadystatechange = function() {
                if (this.readyState == 'complete' ||
                        this.readyState == 'loaded') {
                    cb();
                }
            };
        } else {
            el.onload = cb;
        }

        // Hack for old Firefox/webkit browsers
        // (who does not have onload on link elements)
        //
        // Note : using 'onload' in document.createElement('link')
        // is not always enough
        //
        // By default, too many browser got this bug, so we always activate it
        if(options.type === 'text/css') {
            var currentCSS = document.styleSheets.length;
            nCSS++;
            var cssLoad = a.timer.add(function() {
                if (document.styleSheets.length > (currentCSS + nCSS-1)) {
                    nCSS--;
                    a.timer.remove(cssLoad);
                    cb();
                }   
            }, null, 50);
        }

        // Inserting document into header
        document.getElementsByTagName('head')[0].appendChild(el);
    }

    /**
     * load some data threw AJAX.
     *
     * @private
     * @async
     *
     * @param {String} uri                  The data path
     * @param {Function | Null} callback    The callback to apply in
     *                                      case of success
     * @param {Object | Null} args          An ajax argument object,
     *                                      not all of them are used
     *                                      (some are automatically generated
     *                                      and cannot be changed)
     * @param {Function | Null} error       The callback to apply
     *                                      in case of error
    */
    function performAjaxLoading(uri, callback, args, error) {
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
            if(a.contains(htmlMethods, args.method) ) {
                options.method = args.method;
            }
            if(!a.isNone(args.type) &&
                    (args.type == 'json' || args.type == 'xml') ) {
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
            if(a.isFunction(callback)) {
                callback(content, status);
            }
            populateInternalCache(uri, args);
        };

        // Loading data
        var er = (a.isFunction(error)) ? error : function(){};
        (new a.ajax(options, handlerCallback, er)).send();
    }

    return {
        /**
         * Javascript loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        js: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            this.jsonp(uri, callback, args, error);
        },

        /**
         * JSONP loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        jsonp: function(uri, callback, args, error){
            var type = (a.isTrueObject(args) && args.type) ? args.type
                        : 'text/javascript';

            a.console.storm('log', 'a.loader',
                    'Loading resource from url ```' + uri + '```', 3);

            appendElementToHeader(document.createElement('script'), {
                    type : type,
                    src : uri
                }, callback, uri, args, error
            );
        },

        /**
         * JSON loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        json: function(uri, callback, args, error) {
            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'json';

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'application/json, text/javascript';

            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * XML loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        xml: function(uri, callback, args, error) {
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

            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * CSS loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        css: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            a.console.storm('log', 'a.loader',
                    'Loading resource from url ```' + uri + '```', 3);

            appendElementToHeader(document.createElement('link'), {
                    rel  : 'stylesheet',
                    type : 'text/css',
                    href : uri
                }, callback, uri, args, error
            );
        },

        /**
         * HTML loader.
         * NOTE : only valid XHTML is accepted !
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        html: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'raw';

            // In debug mode, we disallow cache
            if(a.environment.get('app.debug') === true) {
                args.cache = false;
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'text/html';
            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * JavaFX loader.
         *
         * @async
         *
         * @param {String} uri               The path for given jar files to
         *                                   load
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An object to set property for
         *                                   javaFX (like javascript name...),
         *                                   we need : args.code (the main to
         *                                   start), args.id (the id of
         *                                   project). args.width and height
         *                                   are optional
        */
        javafx: function (uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.code) || a.isNone(args.id)) {
                var errorStr =  'The system need args.code ';
                    errorStr += 'and args.name setted to be able to load any ';
                    errorStr += 'javafx resource... This uri will not be ';
                    errorStr += 'loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.javafx', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, callback)) {
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
                    if(a.isFunction(callback)) {
                        callback();
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
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An object to set property for
         *                                   Flash
        */
        flash: function (uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr +='parameters: rootId and id, setted to be able ';
                    errorStr += 'to load any flash resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.flash', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, callback)) {
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
                    }else if(e.success === true && a.isFunction(callback)) {
                        setTimeout(callback, 500);
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
         * @param {Function | Null} callback The callback to call after
         *                                   loading success (NOTE: silverlight
         *                                   is not able to fire load event,
         *                                   so it's not true here...)
         * @param {Object} args              An object to set property for
         *                                   Silverlight
        */
        silverlight: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr += 'parameters: rootId, id, setted to be able ';
                    errorStr +='to load any silverlight resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.silverlight', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, callback)) {
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
                    callback();
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