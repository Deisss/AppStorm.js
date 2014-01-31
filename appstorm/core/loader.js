/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js
        core/timer.js
        core/environment.js
        core/ajax.js
    ]

    Events : []

    Description:
        Dynamic loader for many files type

************************************************************************ */


/**
 * Dynamic loader for many files type
 *
 * Examples: <a href='http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:loader'>here</a>
 *
 * @class loader
 * @static
 * @namespace a
*/
a.loader = (function() {
    'use strict';

    // Store some cache here
    var __cache     = [],
        // Store the number of css files currently loading threw timer hack...
        nCSS        = 0,
        nJS         = 0,
        htmlMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

    /**
     * Check the cache, and launch callback if uri is already listed in cache
     *
     * @method __checkCache
     * @private
     * @async
     *
     * @param uri {String}                  The path to access data
     * @param callback {Function | null}    The callback to apply after loader
     * @return {Boolean}                    True if it's already inside cache,
     *                                      and false in other case
    */
    function __checkCache(uri, callback) {
        // Search in cache
        if(a.isNone(uri)) {
            return false;
        }

        for(var i=0, l=__cache.length; i<l; ++i) {
            if(__cache[i] === uri) {
                // This exist in cache, we directly call callback
                if(a.isFunction(callback)) {
                    callback();
                }
                return true;
            }
        }

        return false;
    };

    /**
     * Insert into cache if needed the uri
     *
     * @method __populateCache
     * @private
     *
     * @param uri {String}                  The path to access data
     * @param args {Object}                 The arguments to check if cache
     *                                      is specified and policy to use
    */
    function __populateCache(uri, args) {
        // By default, we cache
        if(!a.isNone(args) && args.cache === false) {
            return;
        }
        __cache.push(uri);
    };

    /**
     * Append to header the given tag, used by JS and CSS loader especially
     *
     * @method __appendToHeader
     * @private
     * @async
     *
     * @param el {DOM}                      A createElement type result
     * @param options {Object}              HTML Options to add to link
     *                                      appended
     * @param callback {Function | null}    The callback to apply after loader
     * @param uri {String}                  The path to access data
     * @param args {Object | null}          The arguments to check if cache
     *                                      is specified and policy to use
     * @param error {Function | null}       The callback to raise in case
     *                                      of problem (never used)
    */
    function __appendToHeader(el, options, callback, uri, args, error) {
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
            __populateCache(uri, args);
        };

        if(el.addEventListener) {
            el.addEventListener('load', cb, false);
        } else if(el.readyState) {
            el.onreadystatechange = function() {
                if (this.readyState == 'complete'
                        || this.readyState == 'loaded') {
                    cb();
                }
            };
        } else {
            el.onload = cb;
        }

        /*
         * Hack for old Firefox/webkit browsers
         * (who does not have onload on link elements)
         *
         * Note : using 'onload' in document.createElement('link')
         * is not always enough
         *
         * By default, too many browser got this bug, so we always activate it
        */
        if(options.type === 'text/css') {
            var currentCSS = document.styleSheets.length;
            nCSS++;
            var cssLoad = a.timer.add(
                function() {
                    if (document.styleSheets.length > (currentCSS + nCSS-1)) {
                        nCSS--;
                        a.timer.remove(cssLoad);
                        cb();
                    }   
                }
            , null, 50);
        }

        // Inserting document into header
        document.getElementsByTagName('head')[0].appendChild(el);
    };

    /**
     * load some data threw AJAX
     *
     * @method __ajaxLoader
     * @private
     * @async
     *
     * @param uri {String}                  The data path
     * @param callback {Function | null}    The callback to apply in
     *                                      case of success
     * @param args {Object | null}          An ajax argument object,
     *                                      not all of them are used
     *                                      (some are automatically generated
     *                                      and cannot be changed)
     * @param error {Function | null}       The callback to apply
     *                                      in case of error
    */
    function __ajaxLoader(uri, callback, args, error) {
        var options = {
            url    : uri,   //Allowed type : any URL
            method : 'GET', //Allowed type : 'GET', 'POST'
            type   : 'raw', //Allowed type : raw, json, xml
            async  : true,  //Allowed type : true, false
            cache  : true,  //Allowed type : true, false
            data   : {},    //Allowed type : any kind of object | key => value
            header : {}     //Allowed type : any kind of object | key => value
        };

        a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
        if(!a.isNone(args)) {
            if(a.contains(htmlMethods, args.method) ) {
                options.method = args.method;
            }
            if(!a.isNone(args.type)
                && (args.type == 'json' || args.type == 'xml') ) {
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
            __populateCache(uri, args);
        };

        // Loading data
        var er = (a.isFunction(error)) ? error : function(){};
        (new a.ajax(options, handlerCallback, er)).send();
    };

    return {
        /**
         * Javascript loader
         *
         * @method js
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        js : function(uri, callback, args, error) {
            if(__checkCache(uri, callback)) {
                return;
            }

            this.jsonp(uri, callback, args, error);
        },

        /**
         * JSONP loader
         *
         * @method jsonp
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        jsonp: function(uri, callback, args, error){
            var type = (a.isTrueObject(args) && args.type) ? args.type
                        : 'text/javascript';
            a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
            __appendToHeader(document.createElement('script'), {
                    type : type,
                    src : uri
                }, callback, uri, args, error
            );
        },

        /**
         * JSON loader
         *
         * @method json
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
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
            args.header['accept'] = 'application/json, text/javascript';

            __ajaxLoader(uri, callback, args, error);
        },

        /**
         * XML loader
         *
         * @method xml
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
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
            args.header['accept'] = 'application/xml, text/xml';

            __ajaxLoader(uri, callback, args, error);
        },

        /**
         * CSS loader
         *
         * @method css
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        css: function(uri, callback, args, error) {
            if(__checkCache(uri, callback)) {
                return;
            }

            a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
            __appendToHeader(document.createElement('link'), {
                    rel  : 'stylesheet',
                    type : 'text/css',
                    href : uri
                }, callback, uri, args, error
            );
        },

        /**
         * HTML loader
         * NOTE : only valid XHTML is accepted !
         *
         * @method html
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        html: function(uri, callback, args, error) {
            if(__checkCache(uri, callback)) {
                return;
            }

            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'raw';

            // In debug mode, we disallow cache
            if(a.environment.get('debug') === true) {
                args.cache = false;
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header['accept'] = 'text/html';
            __ajaxLoader(uri, callback, args, error);
        },

        /**
         * JavaFX loader
         *
         * @method javafx
         * @async
         *
         * @param uri {String}               The path for given jar files to
         *                                   load
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An object to set property for
         *                                   javaFX (like javascript name...),
         *                                   we need : args.code (the main to
         *                                   start), args.id (the id of
         *                                   project). args.width and height
         *                                   are optional
        */
        javafx: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.code) || a.isNone(args.id)) {
                var error =  'a.loader.javafx: the system need args.code ';
                    error += 'and args.name setted to be able to load any ';
                    error += 'javafx resource... This uri will not be ';
                    error += 'loaded: ' + uri;
                a.console.warn(error, 3);
                return;
            }

            if(__checkCache(uri, callback)) {
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
         * Flash loader
         *
         * @method flash
         * @async
         *
         * @param uri {String}               The path for given swf files to
         *                                   load
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An object to set property for
         *                                   Flash
        */
        flash: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var error =  'a.loader.flash: the system need args ';
                    error += 'parameters: rootId, id, setted to be able ';
                    error += 'to load any flash resource... This uri ';
                    error += 'will not be loaded: ' + uri;
                a.console.warn(error, 3);
                return;
            }

            if(__checkCache(uri, callback)) {
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
         * Silverlight loader
         *
         * @method silverlight
         * @async
         *
         * @param uri {String}               The path for given xap files to load
         * @param callback {Function | null} The callback to call after
         *                                   loading success (NOTE: silverlight
         *                                   is not able to fire load event,
         *                                   so it's not true here...)
         * @param args {Object}              An object to set property for
         *                                   Silverlight
        */
        silverlight: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var error =  'a.loader.silverlight: the system need args ';
                    error += 'parameters: rootId, id, setted to be able ';
                    error += 'to load any silverlight resource... This uri ';
                    error += 'will not be loaded: ' + uri;
                a.console.warn(error, 3);
                return;
            }

            if(__checkCache(uri, callback)) {
                return;
            }

            a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
            var obj  = document.createElement('object');
            obj.id   = args.id;
            obj.data = 'data:application/x-silverlight-2,'
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
                if(max-- > 0
                    && !a.isNone(document.getElementById(args.id).Content)) {

                    a.timer.remove(timer);
                    callback();
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Get the cache trace loaded
         *
         * @method trace
         *
         * @return {Array} The cache trace
        */
        trace: function() {
            return __cache;
        }
    };
}());