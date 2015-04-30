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
     * Register a new partial into template system (handlebars partial).
     *
     * @async
     *
     * @param {String} name                 The partial name to use inside
     *                                      handlebars templates
     * @param {String} uri                  The uri to load (GET method), or
     *                                      a template string (see options
     *                                      parameter)
     * @param {Function | Null} success     The callback to call after loading
     *                                      success
     * @param {Function | Null} error       The callback to call if there is
     *                                      an error
    */
    partial: function(name, uri, success, error) {
        var handler  = null,
            fctName  = 'a.template.partials';

        // Get Handlebars or Mustache
        if (a.isTrueObject(window.Handlebars)) {
            handler = window.Handlebars;
        } else if (a.isTrueObject(window.Mustache)) {
            handler = window.Mustache;
        }

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!', 
                    1);
            return;
        }

        a.loader.html(uri, function(content) {
            handler.registerPartial(name, content);

            // Callback
            if(a.isFunction(success)) {
                success(name, content);
            }
        }, error);
    },

    /**
     * Use cache or retrieve a specific template from network.
     *
     * @async
     *
     * @param {String} uri                  The path to get the template,
     *                                      or an id if the template already
     *                                      listed in html
     * @param {Object} data                 The data to apply to template
     * @param {Function} success            The callback to apply when
     *                                      template finish loading
     * @param {Function | Null} error       The error to raise in case of
     *                                      problem
    */
    get: function(uri, data, success, error) {
        var handler  = null,
            fctName  = 'a.template.get',
            errorStr = 'Success callback not defined';

        // Get Handlebars or Mustache
        if (a.isTrueObject(window.Handlebars)) {
            handler = window.Handlebars;
        } else if (a.isTrueObject(window.Mustache)) {
            handler = window.Mustache;
        }

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!',
                    1);
            return;
        }

        // We use the loader to retrieve file from server side
        a.loader.html(uri, function (content) {
            // Try to use Handlebars
            if (a.isNone(handler.to_html)) {
                var tmpl = handler.compile(content);
                if (a.isFunction(success)) {
                    success(tmpl(data));
                } else {
                    a.console.storm('error', fctName, errorStr, 1);
                    if (a.isFunction(error)) {
                        error(tmpl);
                    }
                }
            } else {
                if (a.isFunction(success)) {
                    success(handler.to_html(content), data);
                } else {
                    a.console.storm('error', fctName, errorStr, 1);
                    if (a.isFunction(error)) {
                        error(tmpl);
                    }
                }
            }
        }, {}, error);
    },

    /**
     * Convert an html to a dom content.
     *
     * @param {String} html                 The string to parse
     * @return {Array}                      The result content
    */
    htmlToDom: function(html) {
        // Why this ?
        // - Using innerHTML is slow,
        //   and can remove binding (like onclick) to sibling children
        // - Doing this way is the only way to have both:
        //   full parsing on every browser, and DOM element to
        //   not have innerHTML bug.
        //   as innerHTML is configured into a temp object,
        //   this problem does not exist here anymore as it will
        //   not affect other children...
        var d      = document.createElement('div'),
            result = [];
        // Remove space before and after : the system fail in other case
        // (but why ?)
        d.innerHTML = a.trim(html);

        // We select sub children of text type or element type
        a.dom.el(d).children([1, 3]).each(function() {
            result.push(this);
        });

        return result;
    },

    /**
     * Empty a dom element.
     *
     * @async
     *
     * @param {DOMElement} el               The element to remove everything
     *                                      inside
     * @param {Function | Null} callback    The function to raise when job is
     *                                      done
    */
    remove: function(el, callback) {
        a.dom.el(el).empty();
        if(a.isFunction(callback)) {
            callback();
        }
    },

    /**
     * Append to the given element (given a DOM element here not a jQuery one).
     *
     * @async
     *
     * @param {DOMElement} el               Any dom element to append to
     * @param {String} content              The html content (in string)
     *                                      to replace
     * @param {Function | Null} callback    The callback to apply when
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
     * Same as append, just replace instead of append to element.
     *
     * @async
     *
     * @param {DOMElement} el               Any dom element to append to
     * @param {String} content              The html content (in string) to
     *                                      replace
     * @param {Function} callback           The callback to apply when
     *                                      template finish loading
    */
    replace: function(el, content, callback) {
        this.remove(el, function() {
            a.template.append(el, content, callback);
        });
    }

    /*!
     * @private
    */
};


/*
------------------------------
  TYPE HELPERS
------------------------------
*/
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