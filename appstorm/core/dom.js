/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a really basic dom manipulation plugin.
        This helps to use appstorm by itself without any jQuery or others.
        It really not the best, but it does work well, and already pretty 
        usefull!

************************************************************************ */


/*!
 * From: http://www.codecouch.com/2012/05/adding-document-queryselectorall-support-to-ie-7/
 * Adding 'uber basic' support of querySelectorAll for IE browsers
 * Only if user does not make usage of any library like jQuery
*/
/* jshint ignore:start */
if(document.all && ! ('querySelectorAll' in document) && !window.jQuery) {
    // IE7 support for querySelectorAll in 274 bytes. Supports multiple / grouped selectors and the attribute selector with a "for" attribute. http://www.codecouch.com/
    (function(d,s){d=document,s=d.createStyleSheet();d.querySelectorAll=function(r,c,i,j,a){a=d.all,c=[],r=r.replace(/\[for\b/gi,'[htmlFor').split(',');for(i=r.length;i--;){s.addRule(r[i],'k:v');for(j=a.length;j--;)a[j].currentStyle.k&&c.push(a[j]);s.removeRule(0)}return c}})()
}
/* jshint ignore:end */


/**
 * Provide a really basic dom manipulation plugin.
 * This helps to use appstorm by itself without any other framework.
 * It does work well, and already pretty usefull! But there is better dom
 * manipulation out there...
 *
 * @constructor
*/
a.dom = {
    /**
     * USE ONLY IF YOU HAVE JQUERY, OR DON'T CARE OLD BROWSER (IE 8 and +)
     * Use direct jquery or querySelectorAll to select items.
     *
     * @param {String} check                The string to search for
     * @param {DOMElement} dom              The dom to search inside
     * @return {a.dom.children}             A chainable object
    */
    query: function(check, dom) {
        dom = a.dom.el(dom).get(0) || document;

        // If jQuery is defined, rely on it instead of querySelectorAll...
        if(window.jQuery) {
            return this.el(jQuery(check));
        }

        // Nothing found, we go for QuerySelectorAll
        try {
            return this.el(dom.querySelectorAll(check));
        } catch (e) {
            // Return empty set if a problem is found...
            return this.el([]);
        }
    },

    /**
     * Embed a javascript dom element into **a.dom** system.
     *
     * @param {DOMElement} element          A dom element to work with
     * @return {a.dom.children}             A chainable object
    */
    el: function(element) {
        // Detect already parsed
        if(element instanceof a.dom.children) {
            return element;
        }

        if(a.isString(element)) {
            element = a.trim(element);

            // If there is only alphanumeric, we go for id
            var reg = /^[a-zA-Z0-9 _-]+$/i;
            if(reg.test(element)) {
                return this.id(element);
            } else {
                return this.query(element);
            }
        }

        // Detect jQuery elements
        if(window.jQuery && element instanceof jQuery) {
            var domList = [],
                i       = element.size();

            while(i--) {
                domList.push(element.get(i));
            }
            // Erase and continue with
            element = domList;
        }

        // Detecting NodeList (special case)
        if(element instanceof window.NodeList) {
            element = a.toArray(element);
        }

        // Detect array elements
        if(a.isArray(element)) {
            return this.children(element);
        }

        // Detect single DOM element
        return this.children([element]);
    },

    /**
     * Find element by id, or a list of ids (separator: ',', or an array).
     *
     * @param {String | Array} id           The id(s) to search
     * @return {a.dom.children}             A chainable object
    */
    id: function(id) {
        return this.attr('id', id, document);
    },

    /**
     * Find elements by classname, or a list of classname
     * (separator: ',', or an array).
     *
     * @param {String | Array} clsname      The classname(s) to search
     *                                      (like 'active', 'container', ...)
     * @param {DOMElement | null} dom       The init dom to start searching
     *                                      from or null to use document
     * @return {a.dom.children}             A chainable object
    */
    cls: function(clsname, dom) {
        return this.attr('class', clsname, dom);
    },

    /**
     * Find elemnts by their tagname, or a list of tagname
     * (separator: ',', or an array).
     *
     * @param {String | Array} name         The tag(s) to search (input, a,...)
     * @param {DOMElement | Null} dom       The init dom to start searching
     *                                      from, or null to use document
     * @return {a.dom.children}             A chainable object
    */
    tag: function(name, dom) {
        // Remove string from name
        dom = (a.isTrueObject(dom)) ? dom : document;

        var tagList = a.isString(name) ? name.replace(/ /g,'').split(',') :
                name,
            domList = [],
            i       = tagList.length;

        if(i > 1) {
            while(i--) {
                var chainElement = this.tag(tagList[i], dom),
                    elements  = chainElement.getElements();

                a.each(elements, function (element) {
                    if (!a.contains(domList, element)) {
                        domList.push(element);
                    }
                });
            }

            return a.dom.children(domList);
        }

        if(dom.querySelectorAll) {
            domList = dom.querySelectorAll(name);
        } else {
            domList = dom.getElementsByTagName(name);
        }

        return a.dom.children(domList);
    },

    /**
     * Find elements by attribute name.
     *
     * @param {String | Array} name         The attribute name to search
     * @param {String | Null} value         The attribute value (can be empty)
     * @param {DOMElement} dom              The dom to start search from
     * @return {a.dom.children}             A chainable object
    */
    attr: function(name, value, dom) {
        /*!
         * -----------------------------------
         *   Detect parameter chain
         * -----------------------------------
        */

        // In case of null dom, it's 2 parameters or single parameter mode
        if(a.isNone(dom)) {
            // We are in single parameter mode
            if(a.isNone(value)) {
                value = document;
            }
            // We are in 2 parameters mode, with value = dom
            if(a.isTrueObject(value) && !a.isArray(value)) {
                return this.attr(name, null, value);

            // We are in 2 parameters mode, without value = dom
            } else {
                dom = document;
            }
        }

        /**
         * From a string or an array, get a string version.
         *
         * @private
         *
         * @param {String | Array} str      Separate elements
         * @return {Array}                  The split version
        */
        function stringToArray(str) {
            return a.isString(str) ? str.replace(/ /g,'').split(',') : str;
        }

        /**
         * Append elements to parentList only if there are not already
         * inside collection.
         *
         * @private
         *
         * @param {Array} parentList        The arrays to append elements to
         * @param {Array} children          The list of elements to append
        */
        function appendList(parentList, children) {
            a.each(children, function(child) {
                if(!a.contains(parentList, child)) {
                    parentList.push(child);
                }
            });
        }

        /*!
         * -----------------------------------
         *   Recursive attribute search
         * -----------------------------------
        */

        // If attribute = array, or a string with ',', we do recursive search
        if(name && (a.isArray(name) || name.indexOf(',') >= 0)) {
            var attributeList = stringToArray(name),
                i             = attributeList.length;

            // In case of multi attribute, we apply recursive search
            if(i > 1) {
                var doms = [];

                while(i--) {
                    var chains      = this.attr(attributeList[i], value, dom),
                        elements    = chains.getElements();
                    appendList(doms, elements);
                }

                // Returning element parsed
                return a.dom.children(doms);
            }
        }

        /*!
         * -----------------------------------
         *   Recursive value search
         * -----------------------------------
        */

        // If value = array, or a string with ',', we do recursive search
        if(value && (a.isArray(value) || value.indexOf(',') > 0)) {
            var valueList = stringToArray(value),
                j         = valueList.length;

            // In case of multi value, we apply recursive search
            if(j > 1) {
                var oDom = [];

                while(j--) {
                    var oChains   = this.attr(name, valueList[j], dom),
                        oElements = oChains.getElements();
                    appendList(oDom, oElements);
                }

                // Returning element parsed
                return a.dom.children(oDom);
            }
        }

        /*!
         * -----------------------------------
         *   Select elements regarding search
         * -----------------------------------
        */

        var isStringValue = a.isString(value),
            domList       = [];

        // We remove ' ' from value and attribute
        name  = name.replace(/ /g,'');
        if(isStringValue) {
            value = value.replace(/ /g,''); 
        }

        // Simple version, for latest browser
        if(name == 'class') {
            domList = dom.getElementsByClassName(value);

        } else if(name == 'id') {
            domList = [dom.getElementById(value)];
            // In case of 'not found', we remove
            if(a.isNull(domList[0])) {
                domList.pop();
            }

        } else if(dom.querySelectorAll) {
            // We get [class="ok"] or [class] depending on value setted or not

            var search = isStringValue ? '[' + name + '="' + value + '"]' :
                '[' + name + ']';

            domList = dom.querySelectorAll(search);

        // Complex version, for older browser
        } else {
            var allList = dom.getElementsByTagName('*'),
                k       = allList.length;

            while(k--) {
                // Select element (faster)
                var el    = allList[k],
                    // Check the attribute exist or not
                    found = el.getAttribute(name);

                // We found the attribute
                if(found) {
                    // 1) Attribute has been found, and is equal to value
                    // 2) No value setted, we just need attribute exist
                    if(
                        (isStringValue && found == value) ||
                        (!isStringValue)
                    ) {
                        // Don't keep duplicate
                        if(!a.contains(domList, el)) {
                            domList.push(el);
                        }
                    }
                }
            }
        }

        return a.dom.children(domList);
    }

    /*!
     * @private
    */
};




















/*
------------------------------
  EVENT
------------------------------
*/
/**
 * Unified event system for DOM element (to have always the same behavior
 * between all browser).
*/
a.dom.event = function(e) {
    if(!(this instanceof a.dom.event)) {
        return new a.dom.event(e);
    }

    e = e || window.event;
    this.target        = e.target || e.srcElement;
    this.currentTarget = e.currentTarget || null;
    this.type          = e.type;

    // Multiple binding to never loose original event
    this._e            = e;
    this.event         = e;
    this.originalEvent = e;
};

/*!
 * Event prototype
*/
a.dom.event.prototype = {
    /**
     * Stop event propagation.
    */
    stopPropagation: function() {
        var e = this.originalEvent;
        if(e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },

    /**
     * Prevent default behavior.
    */
    preventDefault: function() {
        var e = this.originalEvent;
        if(e.preventDefault) {
          e.preventDefault();
        }
        e.returnValue = false;
    }
};

/*
------------------------------
  EVENT BINDER
------------------------------
*/
/**
 * Generic function to use for converting event to appstorm event type.
 *
 * @param {Function} fn                     The function to encaps
 * @param {Object | Null} scope             The scope to apply if possible
 * @return {Function}                       The binded function
*/
a.dom.eventBinder = function(fn, scope) {
    if (!(this instanceof a.dom.eventBinder)) {
        return new a.dom.eventBinder(fn, scope);
    }

    return function(e) {
        if(a.isFunction(fn)) {
            if(a.isObject(scope)) {
                fn.call(scope, a.dom.event(e));
            } else {
                fn.call(null, a.dom.event(e));
            }
        }
    };
};


/*
------------------------------
  EVENT LISTENER
------------------------------
*/
/**
 * Abstract layer for binding event with DOM.
*/
a.dom.eventListener = (function() {
    var store = [],
        bind = null,
        unbind = null;

    /**
     * Add binder between true event and function catch.
     *
     * @private
     *
     * @param {DOMElement} el               The element binded
     * @param {String} type                 The event type
     * @param {Function} fn                 The function called when event
     *                                      occurs
     * @param {Object} scope                The associated scope
     * @return {Object}                     The binder
    */
    function addListener(el, type, fn, scope) {
        var binder = a.dom.eventBinder(fn, scope || null);
        store.push({
            el:   el,
            type: type,
            fn:   fn,
            bn:   binder
        });
        return binder;
    }

    /**
     * Destroy stored event reference.
     *
     * @private
     *
     * @param {DOMElement} el               The element to unbind event from
     * @param {String} type                 The event type to unbind
     * @param {Function} fn                 The event associated function
     * @return {Object}                     The binder
    */
    function removeListener(el, type, fn) {
        var s = store,
            i = s.length,
            binder = null;
        while(i--) {
            var evt = s[i];
            if(evt.fn === fn && evt.el === el && evt.type === type) {
                binder = evt.bn;
                s.splice(i, 1);
                break;
            }
        }
        return binder;
    }

    /*!
     * -------------------
     *   NEW BROWER
     * -------------------
    */
    /**
     * @private
    */
    function addEventListener(el, type, fn, scope) {
        el.addEventListener(type,    addListener(el, type, fn, scope), false);
    }
    /**
     * @private
    */
    function removeEventListener(el, type, fn) {
        el.removeEventListener(type, removeListener(el, type, fn), false);
    }

    /*!
     * -------------------
     *   INTERNET EXPLORER
     * -------------------
    */
    /**
     * @private
    */
    function attachEvent(el, type, fn, scope) {
        el.attachEvent('on' + type, addListener(el, type, fn, scope));
    }
    /**
     * @private
    */
    function detachEvent(el, type, fn) {
        el.detachEvent('on' + type, removeListener(el, type, fn));
    }

    /*!
     * -------------------
     *   OLD BROWSER
     * -------------------
    */
    /**
     * @private
    */
    function rawBindEvent(el, type, fn, scope) {
        el['on' + type] = addListener(el, type, fn, scope);
    }
    /**
     * @private
    */
    function rawUnbindEvent(el, type, fn) {
        removeListener(el, type, fn);
        el['on' + type] = null;
    }

    if(a.isFunction(window.addEventListener)) {
        bind   = addEventListener;
        unbind = removeEventListener;
    } else if(a.isFunction(document.attachEvent)) {
        bind   = attachEvent;
        unbind = detachEvent;
    } else {
        bind   = rawBindEvent;
        unbind = rawUnbindEvent;
    }

    return {
        /**
         * Bind event to DOM.
         *
         * @param {DOMElement} el           The element to bind
         * @param {String} type             The event name to bind
         * @param {Function} fn             The associated function
         * @param {Object} scope            The function scope to apply
        */
        bind: bind,

        /**
         * Unbind event previously attached to DOM.
         *
         * @param {DOMElement} el           The element to unbind
         * @param {String} type             The event name to unbind
         * @param {Function} fn             The function to unbind
        */
        unbind: unbind

        /*!
         * @private
        */
    };
})();






























/*
------------------------------
  CHILDREN
------------------------------
*/
/**
 * Handle recursive sub-search.
 *
 * @constructor
 *
 * @param {Array} elementList               The list of elements to use
*/
a.dom.children = function(elementList) {
    if (!(this instanceof a.dom.children)) {
        return new a.dom.children(elementList);
    }

    elementList = a.isUndefined(elementList.length) ?
                        [elementList] : elementList;

    this.elementList = elementList;
    // Copy the property length at any time
    this.length      = elementList.length;
};


a.dom.children.prototype = {
    /**
     * Perform a recursive task to select sub children using a.dom.
     *
     * The first parameter must be the a.dom to use
     * Other parameters are parameter to pass to this function
     * The last parameter should be the dom to use for search.
     *
     * @private
    */
    _perform: function() {
        var list          = [],
            elementList   = this.elementList,
            argsArray     = a.toArray(arguments),
            fct           = argsArray[0],
            args          = argsArray.slice(1),
            argsLength    = args.length,
            i             = elementList.length;

        // We add one item at the end, as it will be erased by local dom
        args.push(null);

        // We search on every currently stored elements, children
        while(i--) {
            // We add a null value at the end,
            // so argsLength is already length - 1
            // as we don't update it when pushing to args
            args[argsLength] = elementList[i];
            // We call the apply function with this as 'a.dom'
            var chainList = fct.apply(a.dom, args),
                children  = chainList.getElements(),
                j         = children.length;

            while(j--) {
                if(!a.contains(list, children[j])) {
                    list.push(children[j]);
                }
            }
        }

        // We update list and length
        this.elementList = list;
        this.length      = list.length;

        return this;
    },

    /**
     * Get a single DOM element.
     *
     * @param {Integer} index               The index to retrieve
     * @return {DOMElement | Null}          The dom element linked or null
     *                                      if not found
    */
    get: function(index) {
        return this.elementList[index] || null;
    },

    /**
     * Get the DOM elements stored.
     *
     * @return {Array}                      The element list stored
    */
    getElements: function() {
        return this.elementList;
    },

    /**
     * Select sub-id elements.
     *
     * @chainable
     *
     * @param {String} id                   The id or list of ids to search
    */
    id: function(id) {
        return this._perform(a.dom.id, id);
    },

    /**
     * Select sub-class elements.
     *
     * @chainable
     *
     * @param {String} clsname              The class or list of classes to
     *                                      search
    */
    cls: function(clsname) {
        return this._perform(a.dom.cls, clsname);
    },

    /**
     * Get or set style for given elements
     *
     * @param {String} rule                 The CSS rule we are working with
     * @param {String} value                The value to set (can be empty for
     *                                      get)
     * @return {String | Null}              The CSS value found in case of get
    */
    css: function(rule, value) {
        rule = rule || '';

        // Transform rule for a js like ruler
        if(rule.indexOf('-') >= 0) {
            var splitRule = rule.split('-');

            for(var i=1, l=splitRule.length; i<l; ++i) {
                var s = splitRule[i];
                splitRule[i] = a.firstLetterUppercase(s);
            }

            rule = splitRule.join('');
        }

        // Getter
        if(a.isUndefined(value)) {
            var cssList     = [],
                elementList = this.elementList,
                j           = elementList.length;

            while(j--) {
                var data = elementList[j].style[rule];
                if(!a.isNone(data)) {
                    cssList.push(data);
                }
            }

            if(cssList.length <= 1) {
                return cssList[0] || '';
            } else {
                return cssList;
            }
        // Setter
        } else {
            this.each(function() {
                this.style[rule] = value;
            });
        }
    },

    /**
     * Add a class to elements.
     *
     * @chainable
     *
     * @param {String} classname            The classname to append to every
     *                                      elements
    */
    addClass: function(classname) {
        var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
        this.each(function() {
            if(this.classList) {
                this.classList.add(classname);
            // We test the element don't have classname first
            } else if(!this.className.match(reg)) {
                this.className += ' ' + classname;
            }
        });
        return this;
    },

    /**
     * Test if all elements got classname or not.
     *
     * @chainable
     *
     * @param {String} classname            The classname to test on every
     *                                      elements
    */
    hasClass: function(classname) {
        var reg      = new RegExp('(\\s|^)' + classname + '(\\s|$)'),
            elements = this.elementList,
            i        = elements.length;

        while(i--) {
            if(!elements[i].className.match(reg)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Remove a class element.
     *
     * @chainable
     *
     * @param {String} classname            The classname to remove on every
     *                                      elements
    */
    removeClass: function(classname) {
        this.each(function(scope) {
            if(this.classList) {
                this.classList.remove(classname);
            // We test element has classname before remove
            } else {
                var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
                if(this.className.match(reg)) {
                    this.className.replace(reg, '');
                }
            }
        }, this);
        return this;
    },

    /**
     * toggle a class element.
     *
     * @chainable
     *
     * @param {String} classname            The classname to toggle on every
     *                                      elements
    */
    toggleClass: function(classname) {
        this.each(function(scope) {
            if(this.classList) {
                this.classList.toggle(classname);
            } else {
                var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
                // If we have class or not, we switch
                if(this.className.match(reg)) {
                    this.className.replace(reg, '');
                } else {
                    this.className += ' ' + classname;
                }
            }
        }, this);
        return this;
    },

    /**
     * Bind element event to given function (like click, submit...).
     *
     * @chainable
     *
     * @param {String | Array} binding      The event/list to apply to
     * @param {Function} fct                The handler to receive event
     * @param {Object | Null} scope         The scope to apply
    */
    bind: function(binding, fct, scope) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] === '') {
                continue;
            }
            this.each(function(evt) {
                a.dom.eventListener.bind(this, evt, fct, scope);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Unbind element event to given function (like click, submit...).
     *
     * @chainable
     *
     * @param {String | Array} binding      The event/list to remove
     * @param {Function} fct                The handler of event
    */
    unbind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] === '') {
                continue;
            }

            this.each(function(evt) {
                a.dom.eventListener.unbind(this, evt, fct);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Select sub-tag elements.
     *
     * @chainable
     *
     * @param {String} name                 The tag or list of tags to search
    */
    tag: function(name) {
        return this._perform(a.dom.tag, name);
    },

    /**
     * Select sub-attributes elements.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute or list of
     *                                      attributes to search
     * @param {String | Null} value         The value to use, can be empty
    */
    attr: function(attribute, value) {
        return this._perform(a.dom.attr, attribute, value);
    },

    /**
     * Append or get attribute.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    attribute: function(attribute, value) {
        var attributes = 
            a.isString(attribute) ?   attribute.replace(/ /g,'').split(',')
                                  :   attribute;

        // Getter
        if(a.isUndefined(value)) {
            var values    = [],
                elements  = this.elementList,
                i         = elements.length;

            while(i--) {
                var element = elements[i];
                a.each(attributes, function(attr) {
                    try {
                        var data = element.getAttribute(attr);
                        if(!a.isNone(data) && !a.contains(values, data)) {
                            values.push(data);
                        }
                    } catch(ex) {}
                });
            }

            if(values.length < 2) {
                return values.join('');
            } else {
                return values;
            }

        // Setter
        } else {
            this.each(function() {
                a.each(attributes, function(attr) {
                    try {
                        this.setAttribute(attr, value); 
                    } catch(ex) {}
                }, this);
            });
            return this;
        }
    },

    /**
     * Same as attribute, but for data- HTML5 tag.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    data: function(attribute, value) {
        return this.attribute('data-' + attribute, value);
    },

    /**
     * Same as data or attribute, but multi tag check.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    appstorm: function(attribute, value) {
        var sequence   = [],
            tmp        = '',
            attributes = 
            a.isString(attribute) ?   attribute.replace(/ /g,'').split(',')
                                  :   attribute;

        for (var i = 0, l = attributes.length; i < l; ++i) {
            tmp = attributes[i];
            sequence.push('data-' + tmp);
            sequence.push('a-' + tmp);
            sequence.push(tmp);
        }

        // Removing duplicates
        sequence = a.uniq(sequence);
        return this.attribute(sequence.join(','), value);
    },

    /**
     * Move to the parent element for every element stored.
     *
     * @chainable
    */
    parent: function() {
        var elements = this.elementList,
            result   = [];

        a.each(elements, function(element) {
            var node = element.parentNode;
            if(!a.contains(result, node)) {
                result.push(node);
            }
        });

        this.elementList = result;
        this.length = result.length;

        return this;
    },

    /**
     * Select direct children of all stored elements.
     *
     * @chainable
     *
     * @param {Array | Null} types          The nodeTypes to keep (default: 3)
    */
    children: function(types) {
        var elementList = this.elementList,
            replaceList = [],
            i           = elementList.length;

        types = types || [1];

        while(i--) {
            replaceList.push(a.toArray(elementList[i].childNodes));
        }

        // Erasing previous list with new one
        var flatArray = a.remove(
            a.uniq(a.flatten(replaceList)),
            function(element) {
                if(!a.contains(types, element.nodeType)) {
                    return false;
                }
                return true;
            }
        );

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Select all sub elements.
     *
     * @chainable
    */
    all: function() {
        var elementList = this.elementList,
            replaceList = [],
            i           = elementList.length;

        while(i--) {
            replaceList.push(a.toArray(
                elementList[i].getElementsByTagName('*')
            ));
        }

        // Erasing previous list with new one, remove wrong nodeType
        var flatArray = a.remove(
                a.uniq(a.flatten(replaceList)),
                function(element) {

            if(element.nodeType == 3) {
                return false;
            }
            return true;
        });

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Insert before selected element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to insert
    */
    insertBefore: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.parentNode.insertBefore(element, this);
            }, this);
        });
        return this;
    },

    /**
     * Insert after selected element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to insert
    */
    insertAfter: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.parentNode.insertBefore(element, this.nextSibling);
            }, this);
        });
        return this;
    },

    /**
     * Empty all elements stored.
     *
     * @chainable
    */
    empty: function() {
        this.each(function() {
            while(this.firstChild) {
                this.removeChild(this.firstChild);
            }
        });
        return this;
    },

    /**
     * Remove element from content.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to remove
    */
    remove: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                try {
                    this.removeChild(element);
                } catch(ex) {}
            }, this);
        });
        return this;
    },

    /**
     * Append element to the existing content.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to append
    */
    append: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.appendChild(element);
            }, this);
        });
        return this;
    },

    /**
     * Replace the existing content with given element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to append
    */
    replace: function(element) {
        this.empty();
        return this.append(element);
    },

    /**
     * Set inside the current elements the content, or get the current html.
     *
     * @param {String | Null} content       The content to set, or nothing to
     *                                      get
     * @return {String | Null}              The current content, or null
    */
    html: function(content) {
        if(!a.isUndefined(content)) {
            this.each(function() {
                this.innerHTML = content;
            });
            return this;
        } else {
            var results = [];
            this.each(function() {
                results.push(this.innerHTML);
            });
            if(results.length === 0) {
                return '';
            } else if(results.length === 1) {
                return results[0];
            }
            return results;
        }
    },

    /**
     * Get the text content of every elements included. If the parameter is
     * set to false, children are not included, if the parameter is set on
     * true, children are included.
     *
     * @param {Boolean} includeChildren     True, the children are included
     *                                      False, they are not
     * @return {String  | Array}            If the array contains one element
     *                                      the direct string is returned, in
     *                                      other cases, the array is returned
    */
    text: function(includeChildren) {
        // If not defined, we set on true by default
        if (includeChildren !== false) {
            includeChildren = true;
        }

        var results = [];

        this.each(function() {
            if (includeChildren) {
                results.push(this.textContent);
            } else {
                var content = '';
                for(var i = 0, l = this.childNodes.length; i < l; ++i) {
                    var node = this.childNodes[i];
                    if(node.nodeType === 3) {
                        content += node.nodeValue;
                    }
                }
                results.push(content);
            }
        });

        if(results.length === 0) {
            return '';
        } else if(results.length === 1) {
            return results[0];
        }
        return results;
    },

    /**
     * Apply on each elements the given function.
     *
     * @chainable
     *
     * @param {Function} fct                The function to apply to elements
     * Other parameters are passed to every function call as arguments
    */
    each: function() {
        var list          = this.elementList,
            argumentArray = a.toArray(arguments),
            fct           = argumentArray[0],
            args          = argumentArray.slice(1);

        fct = a.isFunction(fct) ? fct : null;

        if (!a.isNone(fct)) {
            a.each(list, function(element) {
                // Calling element with this as element currently selected
                fct.apply(element, args);
            });
        }

        return this;
    }
    /*!
     * @private
    */
};