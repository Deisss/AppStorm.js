/* ************************************************************************

    License: MIT Licence

    Description:
        Manipulate the page history and templates.
        We define here some usefull function to catch some important event.

        template: Create a simple but powerfull template system based on
                    handlebars
        hash: Manage hash manipulate for page

************************************************************************ */


/**
 * Create a template system based on handlebars.
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:page">here</a>
 *
 * @class template
 * @static
 * @namespace a
*/
a.template = {
    /**
     * Store cached partials
     * @property _part
     * @private
     * @type Object
     * @default {}
    */
    _part: {},

    /**
     * Store cached template
     * @property _tmpl
     * @private
     * @type Object
     * @default {}
    */
    _tmpl: {},

    /**
     * Register a new partial into template system (handlebars partial).
     *
     * @method partial
     * @async
     *
     * @param name {String}                 The partial name to use inside
     *                                      handlebars templates
     * @param uri {String}                  The uri to load (GET method), or
     *                                      a template string (see options
     *                                      parameter)
     * @param callback {Function | null}    The callback to call after loading
     *                                      success
     * @param options {Object}              Options can have only one element:
     *                                      noLoading : Boolean
     *                                      Indicate if we should use uri as
     *                                      template string instead of uri to 
     *                                      load from network
    */
    partial: function(name, uri, callback, options) {
        var handler = a.isTrueObject(window.Handlebars) ? window.Handlebars :
                                                                        null,
            fctName = 'a.template.partial';

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!', 
                    1);
            return;
        }

        var partialsStore = this._part;

        if(a.isString(partialsStore[name])) {
            a.console.storm('log', fctName, 'Loading ```' + name + '``` from '+
                    'cache', 3);

            if(a.isFunction(callback)) {
                callback(name, partialsStore[name]);
            }
        } else if(options && options.noloading === true) {
            a.console.storm('log', fctName, 'Loading ```' + name + '``` from '+
                    'parameter', 3);
            partialsStore[name] = uri;
            handler.registerPartial(name, uri);

            // Callback
            if(a.isFunction(callback)) {
                callback(name, uri);
            }
        } else {
            a.loader.html(uri, function(content) {
                a.console.storm('log', fctName, 'Loading ```' + name + '```' +
                        ' from url', 3);
                partialsStore[name] = content;
                handler.registerPartial(name, content);

                // Callback
                if(a.isFunction(callback)) {
                    callback(name, content);
                }
            });
        }
    },

    /**
     * Use cache or retrieve a specific template from network
     *
     * @method get
     * @async
     *
     * @param uri {String}                  The path to get the template,
     *                                      or an id if the template already
     *                                      listed in html
     * @param data {Object}                 The data to apply to template
     * @param callback {Function}           The callback to apply when
     *                                      template finish loading
     * @param error {Function | null}       The error to raise in case of
     *                                      problem
    */
    get: function(uri, data, callback, error) {
        var handler = a.isTrueObject(window.Handlebars) ? window.Handlebars :
                                                                        null,
            fctName = 'a.template.get';

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!',
                    1);
            return;
        }

        // We create a hash from uri and sanitize
        // everything by replacing by underscore
        var orig = uri.replace(/[^a-zA-Z0-9\\-]/g, '_'),
            hash = 'a_tmpl_' + orig;

        /**
         * Parse the content with data from client,
         * then call callback with result
         *
         * @method callCallback
         * @private
         * @async
         *
         * @param clb {Function}            The callback function to call
         * @param h {String}                The hash representing the
         *                                  unique id of template
         * @param d {Object}                The data associated
        */
        var callCallback = function(clb, h, d) {
            if(a.isFunction(clb)) {

                // First try to use Handlebars.js
                if(a.isNone(handler.to_html)) {
                    // Act like a render method (threw compile method)
                    var tmpl = handler.compile(a.template._tmpl[h]);
                    clb(tmpl(d));

                // Rollback on Mustache.js
                } else {
                    clb(handler.to_html(a.template._tmpl[h], d));
                }
            }
        };

        // If the template is already listed into existing template,
        // directly load
        if(a.isString(this._tmpl[hash])) {
            a.console.storm('log', fctName, 'Loading ```' + hash + '``` from' +
                    ' cache', 3);
            callCallback(callback, hash, data);
            return;
        }

        // Template exist on page DOM, but it's not registred to ich for now
        if(document.getElementById(hash)) {
            // We add it to template list registered to go quicker next time
            if(!this._tmpl[hash]) {
                a.console.storm('log', fctName, 'Loading ```' + hash + '```' +
                        ' from inner html page', 3);
                this._tmpl[hash] = a.dom.id(hash).html();
            }

            // We finally send the callback
            callCallback(callback, hash, data);
            return;
        }

        // Same with this time original id, template exist on page DOM
        if(document.getElementById(orig)) {
            // We add it to template list registered to go quicker next time
            if(!this._tmpl[orig]) {
                a.console.storm('log', fctName, 'Loading ```' + orig + '``` ' +
                        'from inner html page', 3);
                this._tmpl[orig] = a.dom.id(orig).html();
            }

            // We finally send the callback
            callCallback(callback, orig, data);
            return;
        }

        // Last try : we try to use uri to load template from server side,
        // then parse it
        var parse = function(content, status, state) {
            if(!a.template._tmpl[hash]) {
                a.template._tmpl[hash] = content;
            }
            callCallback(callback, hash, data);
            return;
        };

        // We use the loader to retrieve file from server side
        a.console.storm('log', fctName, 'Loading ```' + uri + '``` from ' +
                'external resource', 3);
        a.loader.html(uri, parse, {}, error);
    },

    /**
     * Convert an html to a dom content
     *
     * @method htmlToDom
     *
     * @param html {String}                 The string to parse
     * @return {Array}                      The result content
    */
    htmlToDom: function(html) {
        /*
         * Why this ?
         * - Using innerHTML is slow,
         *   and can remove binding (like onclick) to sibling children
         * - Doing this way is the only way to have both:
         *   full parsing on every browser, and DOM element to
         *   not have innerHTML bug.
         *   as innerHTML is configured into a temp object,
         *   this problem does not exist here anymore as it will
         *   not affect other children...
        */
        var d      = document.createElement('div'),
            result = [];
        // Remove space before and after : the system fail in other case
        // (but why ?)
        d.innerHTML  = a.trim(html);

        // We select sub children of text type or element type
        a.dom.el(d).children([1, 3]).each(function() {
            result.push(this);
        });

        return result;
    },

    /**
     * Empty a dom element
     *
     * @method remove
     * @async
     *
     * @param el {DOMElement} The element to remove everything inside
     * @param callback {Function | null} The function to raise when job is done
    */
    remove: function(el, callback) {
        a.dom.el(el).empty();
        if(a.isFunction(callback)) {
            callback();
        }
    },

    /**
     * Append to the given element (given a DOM element here not a jquery one)
     *
     * @method append
     * @async
     *
     * @param el {DOMElement}               Any dom element to append to
     * @param content {String}              The html content (in string)
     *                                      to replace
     * @param callback {Function}           The callback to apply when
     *                                      template finish loading
    */
    append: function(el, content, callback) {
        el = a.dom.el(el);
        var h = this.htmlToDom(content);

        if(a.isTrueObject(h)) {
            el.append(h);
        }
        a.each(el.getElements(), function(element) {
            a.translate.translate(element);
        });
        if(a.isFunction(callback)) {
            callback(content);
        }
    },

    /**
     * Same as append, just replace instead of append to element
     *
     * @method replace
     * @async
     *
     * @param el {DOMElement}               Any dom element to append to
     * @param content {String}              The html content (in string) to
     *                                      replace
     * @param callback {Function}           The callback to apply when
     *                                      template finish loading
    */
    replace: function(el, content, callback) {
        this.remove(el, function() {
            a.template.append(el, content, callback);
        });
    }
};


(function() {
    // Replace type
    a.state.type.add('replace', function replace(entry, content, chain) {
        if(content) {
            a.template.replace(entry, content, function() {
                if(chain) {
                    chain.next();    
                }
            });
        }
    }, function(entry, chain) {
        if(chain) {
            chain.next();
        }
    }, true);

    // Append type
    a.state.type.add('append', function append(entry, content, chain) {
        if(content) {
            a.template.append(entry, content, function() {
                if(chain) {
                    chain.next();
                }
            });
        }
    }, function(entry, chain) {
        if(chain) {
            chain.next();
        }
    }, true);
})();