/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
    ]

    Events : []

    Description:
        Provide a really basic dom manipulation plugin.
        This helps to use appstorm by itself without any jQuery or others.
        It really not the best, but it does work well, and already pretty 
        usefull!

************************************************************************ */
/**
 * Provide a really basic dom manipulation plugin.
 * This helps to use appstorm by itself without any jQuery or others.
 * It really not the best, but it does work well, and already pretty 
 * usefull!
 *
 * @class dom
 * @static
 * @namespace a
*/
a.dom = {
    /**
     * USE ONLY IF YOU HAVE JQUERY, OR DONT CARE OLD BROWSER (IE 8 and +)
     * Use direct jquery or querySelectorAll to select items
     *
     * @method query
     *
     * @param check {String}            The string to search for
     * @param dom {DOMElement}          The dom to search inside
     * @return {a.dom.children}         A chainable object
    */
    query: function(check, dom) {
        dom = dom || document;

        if(!dom.querySelectorAll && window.jQuery) {
            return this.el(jQuery(check));
        }

        return this.el(dom.querySelectorAll(check)); 
    },

    /**
     * Embed a dom element into a.dom system
     *
     * @method el
     *
     * @param element {DOMElement}      A dom element to work with
     * @return {a.dom.children}         A chainable object
    */
    el: function(element) {
        // Detect already parsed
        if(element instanceof a.dom.children) {
            return element;
        }

        if(a.isString(element)) {
            if(String.prototype.trim) {
                element = element.trim();
            } else {
                element = element.replace(/^\s+|\s+$/g, '');
            }

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

        // Detect array elements
        if(a.isArray(element)) {
            return new this.children(element);
        }

        // Detect single DOM element
        return new this.children([element]);
    },

    /**
     * Find element by id, or a list of ids (separator: ',', or an array)
     *
     * @method id
     *
     * @param id {String | Array}       The id(s) to search
     * @return {a.dom.children}         A chainable object
    */
    id: function(id) {
        return this.attr('id', id, document);
    },

    /**
     * Find elements by classname, or a list of classname
     * (separator: ',', or an array)
     *
     * @method cls
     *
     * @param clsname {String | Array}  The classname(s) to search
     *                                  (like 'active', 'container', ...)
     * @param dom {DOMElement | null}   The init dom to start searching from
                                        or null to use document
     * @return {a.dom.children}         A chainable object
    */
    cls: function(clsname, dom) {
        return this.attr('class', clsname, dom);
    },

    /**
     * Find elemnts by their tagname, or a list of tagname
     * (separator: ',', or an array)
     *
     * @method tag
     *
     * @param name {String | Array}     The tag(s) to search (input, a, ...)
     * @param dom {DOMElement | null}   The init dom to start searching from,
     *                                  or null to use document
     * @return {a.dom.children}         A chainable object
    */
    tag: function(name, dom) {
        // Remove string from name
        dom = (a.isObject(dom)) ? dom : document;

        var tagList = a.isString(name)
                        ? name.replace(/ /g,'').split(',')
                        : name,
            domList = [],
            i       = tagList.length;

        if(i > 1) {
            while(i--) {
                var chainElement = this.tag(tagList[i], dom),
                    elementList  = chainElement.getElements();

                var j = elementList.length;
                while(j--) {
                    if(!a.contains(domList, elementList[j])) {
                        domList.push(elementList[j]);
                    }
                }
            }

            return new a.dom.children(domList);
        }

        if(dom.querySelectorAll) {
            domList = dom.querySelectorAll(name);
        } else {
            domList = dom.getElementsByTagName(name);
        }

        return new a.dom.children(domList);
    },

    /**
     * Find elements by attribute name
     *
     * @method attr
     *
     * @param name {String | Array}         The attribute name to search
     * @param value {String | null}         The attribute value (can be empty)
     * @param dom {DOMElement}              The dom to start search from
     * @return {a.dom.children}             A chainable object
    */
    attr: function(name, value, dom) {
        /*
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
            if(a.isObject(value) && !a.isArray(value)) {
                return this.attr(name, null, value);

            // We are in 2 parameters mode, without value = dom
            } else {
                dom = document;
            }
        }

        /**
         * From a string or an array, get a string version
         *
         * @param str {String | Array}     Separate elements
         * @return {Array}                 The split version
        */
        function stringToArray(str) {
            return a.isString(str) ? str.replace(/ /g,'').split(',') : str;
        };

        /**
         * Append elements to parentList only if there are not already
         * inside collection.
         *
         * @param parentList {Array}       The parentList to append elements to
         * @param appendList {Array}       The list of elements to append
        */
        function appendList(parentList, children) {
            var i = children.length;
            while(i--) {
                if(!a.contains(parentList, children[i])) {
                    parentList.push(children[i]);
                }
            }
        };

        /*
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
                var domList   = [];

                while(i--) {
                    var chainList   = this.attr(attributeList[i], value, dom),
                        elementList = chainList.getElements();
                    appendList(domList, elementList);
                }

                // Returning element parsed
                return new a.dom.children(domList);
            }
        }

        /*
         * -----------------------------------
         *   Recursive value search
         * -----------------------------------
        */

        // If value = array, or a string with ',', we do recursive search
        if(value && (a.isArray(value) || value.indexOf(',') > 0)) {
            var valueList = stringToArray(value),
                i         = valueList.length;

            // In case of multi value, we apply recursive search
            if(i > 1) {
                var domList   = [];

                while(i--) {
                    var chainList   = this.attr(name, valueList[i], dom),
                        elementList = chainList.getElements();
                    appendList(domList, elementList);
                }

                // Returning element parsed
                return new a.dom.children(domList);
            }
        }

        /*
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

            var search = isStringValue
                            ? '[' + name + '="' + value + '"]'
                            : '[' + name + ']';

            domList = dom.querySelectorAll(search);

        // Complex version, for older browser
        } else {
            var allList = dom.getElementsByTagName('*'),
                i       = allList.length;

            while(i--) {
                // Select element (faster)
                var el    = allList[i],
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

        return new a.dom.children(domList);
    }
};
























/**
 * Abstract layer for binding event with DOM
*/
a.dom.event = new function() {
    // New browser
    function addEventListener(el, type, fn) {
        el.addEventListener(type, fn, false);
    };
    function removeEventListener(el, type, fn) {
        el.removeEventListener(type, fn, false);
    };

    // IE
    function attachEvent(el, type, fn) {
        el.attachEvent('on' + type, fn);
    };
    function detachEvent(el, type, fn) {
        el.detachEvent('on' + type, fn);
    };

    // Old Browsers
    function rawBindEvent(el, type, fn) {
        el['on' + type] = fn;
    };
    function rawUnbindEvent(el, type, fn) {
        el['on' + type] = null;
    };



    if(a.isFunction(window.addEventListener)) {
        this.bind   = addEventListener;
        this.unbind = removeEventListener;
    } else if(a.isFunction(document.attachEvent)) {
        this.bind   = attachEvent;
        this.unbind = detachEvent;
    } else {
        this.bind   = rawBindEvent;
        this.unbind = rawUnbindEvent;
    }
};































/**
 * Handle recursive sub-search
 *
 * @param elementList {Array}    The list of elements to use
*/
a.dom.children = function(elementList) {
    elementList = a.isUndefined(elementList.length) ?
                        [elementList] : elementList;

    this.elementList = elementList;
    // Copy the property length at any time
    this.length      = elementList.length;
};


a.dom.children.prototype = {
    /**
     * Perform a recursive task to select sub children using a.dom
     *
     * The first parameter must be the a.dom to use
     * Other parameters are parameter to pass to this function
     * The last parameter should be the dom to use for search
     *
     * @method _perform
     * @chainable
     * @private
    */
    _perform: function() {
        var list          = [],
            elementList   = this.elementList,
            argsArray     = Array.prototype.slice.call(arguments),
            fct           = argsArray[0],
            args          = argsArray.slice(1),
            argsLength    = args.length,
            i             = elementList.length;

        // We add one item at the end, as it will be erased by local dom
        args.push(null);

        // We search on every currently stored elements, children
        while(i--) {
            /*
             * We add a null value at the end,
             * so argsLength is already length - 1
             * as we don't update it when pushing to args
            */
            args[argsLength] = elementList[i];
            // We call the apply function with this as 'a.dom'
            var chainList  = fct.apply(a.dom, args),
                childList  = chainList.getElements(),
                j          = childList.length;

            while(j--) {
                if(!a.contains(list, childList[j])) {
                    list.push(childList[j]);
                }
            }
        }

        // We update list and length
        this.elementList = list;
        this.length      = list.length;

        return this;
    },

    /**
     * Get a single DOM element
     *
     * @method get
     *
     * @param index {Integer}        The index to retrieve
     * @return {DOMElement | null}   The dom element linked or null
     *                               if not found
    */
    get: function(index) {
        return this.elementList[index] || null;
    },

    /**
     * Get the DOM elements stored
     *
     * @method getElements
     *
     * @return {Array}    The element list stored
    */
    getElements: function() {
        return this.elementList;
    },

    /**
     * Select sub-id elements
     *
     * @method id
     * @chainable
     *
     * @param id {String}    The id or list of ids to search
    */
    id: function(id) {
        return this._perform(a.dom.id, id);
    },

    /**
     * Select sub-class elements
     *
     * @method cls
     * @chainable
     *
     * @param clsname {String}    The class or list of classes to search
    */
    cls: function(clsname) {
        return this._perform(a.dom.cls, clsname);
    },

    /**
     * Get or set style for given elements
     *
     * @method css
     *
     * @param rule {String}         The CSS rule we are working with
     * @param value {String}        The value to set (can be empty for get)
     * @return {String | null}      The CSS value found in case of get
    */
    css: function(rule, value) {
        rule = rule || '';

        // Transform rule for a js like ruler
        if(rule.indexOf('-') >= 0) {
            var splitRule = rule.split('-');
            for(var i=1, l=splitRule.length; i<l; ++i) {
                var s = splitRule[i];
                splitRule[i] = s.charAt(0).toUpperCase() + s.slice(1);
            }
            rule = splitRule.join('');
        }

        // Getter
        if(a.isUndefined(value)) {
            var cssList     = [],
                elementList = this.elementList,
                i           = elementList.length;

            while(i--) {
                var data = elementList[i].style[rule];
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
     * Add a class to elements
     *
     * @method addClass
     * @chainable
     *
     * @param classname {String}    The classname to append to every elements
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
     * Test if all elements got classname or not
     *
     * @method hasClass
     * @chainable
     *
     * @param classname {String}     The classname to test on every elements
    */
    hasClass: function(classname) {
        var reg         = new RegExp('(\\s|^)' + classname + '(\\s|$)'),
            elementList = this.elementList,
            i           = elementList.length;

        while(i--) {
            if(!elementList[i].className.match(reg)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Remove a class element
     *
     * @method removeClass
     * @chainable
     *
     * @param classname {String}     The classname to remove on every elements
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
     * toggle a class element
     *
     * @method toggleClass
     * @chainable
     *
     * @param classname {String}      The classname to toggle on every elements
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
     * Bind function to given event
     *
     * @method bind
     * @chainable
     *
     * @param binding {String | Array}   The event/list to apply to
     * @param fct {Function}             The handler to receive event
    */
    bind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] == '') {
                continue;
            }
            this.each(function(evt) {
                a.dom.event.bind(this, evt, fct);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Unbind event to given function
     *
     * @method unbind
     * @chainable
     *
     * @param binding {String | Array}   The event/list to remove
     * @param fct {Function}             The handler of event
    */
    unbind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] == '') {
                continue;
            }

            this.each(function(evt) {
                a.dom.event.unbind(this, evt, fct);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Select sub-tag elements
     *
     * @method tag
     * @chainable
     *
     * @param name {String}    The tag or list of tags to search
    */
    tag: function(name) {
        return this._perform(a.dom.tag, name);
    },

    /**
     * Select sub-attributes elements
     *
     * @method attr
     * @chainable
     *
     * @param attribute {String}    The attribute or list of
     *                              attributes to search
     * @param value {String | null} The value to use, can be empty
    */
    attr: function(attribute, value) {
        return this._perform(a.dom.attr, attribute, value);
    },

    /**
     * Append or get attribute
     *
     * @method attribute
     * @chainable
     *
     * @param attribute {String}    The attribute to set
     * @param value {String}        The value to get
    */
    attribute: function(attribute, value) {
        var arrayAttribute = 
            a.isString(attribute) ?   attribute.replace(/ /g,'').split(',')
                                  :   attribute;

        // Getter
        if(a.isUndefined(value)) {
            var valueList   = [],
                elementList = this.elementList,
                i           = elementList.length;

            while(i--) {
                for(var j=0, l=arrayAttribute.length; j<l; ++j) {
                    try {
                        var data = elementList[i]
                                .getAttribute(arrayAttribute[j]);
                        if(!a.isNone(data) && !a.contains(valueList, data)) {
                            valueList.push(data);
                        }
                    } catch(ex) {}
                }
            }

            if(valueList.length < 2) {
                return valueList.join('');
            } else {
                return valueList;
            }

        // Setter
        } else {
            this.each(function() {
                for(var j=0, l=arrayAttribute.length; j<l; ++j) {
                    try {
                        this.setAttribute(arrayAttribute[j], value);
                    } catch(ex) {}
                }
            });
            return this;
        }
    },

    /**
     * Same as attribute, but for data- HTML5 tag
     *
     * @method data
     * @chainable
     *
     * @param attribute {String}    The attribute to set
     * @param value {String}        The value to get
    */
    data: function(attribute, value) {
        return this.attribute('data-' + attribute, value);
    },

    /**
     * Same as data or attribute, but multi tag check
     *
     * @method appstorm
     * @chainable
     *
     * @param attribute {String}    The attribute to set
     * @param value {String}        The value to get
    */
    appstorm: function(attribute, value) {
        // TODO: attribute does not handle ',' and array delimiter
        return this.attribute(
              'data-' + attribute
            + ',a-'   + attribute
            + ','     + attribute, value);
    },

    /**
     * Move to the parent element for every element stored
     *
     * @method parent
     * @chainable
    */
    parent: function() {
        var elementList = this.elementList,
            newList     = [],
            i           = elementList.length;

        while(i--) {
            var element = elementList[i].parentNode;
            // We append only if parent is not already register
            if(!a.contains(newList, element)) {
                newList.push(element);
            }
        }

        this.elementList = newList;
        this.length = newList.length;

        return this;
    },

    /**
     * Select direct children of all stored elements
     *
     * @method children
     * @chainable
     *
     * @param types {Array | null}  The nodeTypes to keep (default: 3)
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
        var flatArray = a.uniq(a.flatten(replaceList)),
            j = flatArray.length;

        while(j--) {
            if(!a.contains(types, flatArray[j].nodeType)) {
                flatArray.splice(j, 1);
            }
        }

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Select all sub elements
     *
     * @method all
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

        // Erasing previous list with new one
        var flatArray = a.uniq(a.flatten(replaceList)),
            j = flatArray.length;

        while(j--) {
            if(flatArray[j].nodeType == 3) {
                flatArray.splice(j, 1);
            }
        }

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Insert before selected element
     *
     * @method insertBefore
     * @chainable
     *
     * @param element {DOMElement}  The element to insert
    */
    insertBefore: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            for(var i=0, l=elements.length; i<l; ++i) {
                this.parentNode.insertBefore(elements[i], this);
            }
        });
        return this;
    },

    /**
     * Insert after selected element
     *
     * @method insertAfter
     * @chainable
     *
     * @param element {DOMElement}  The element to insert
    */
    insertAfter: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            for(var i=0, l=elements.length; i<l; ++i) {
                this.parentNode.insertBefore(elements[i], this.nextSibling);
            }
        });
        return this;
    },

    /**
     * Empty all elements stored
     *
     * @method empty
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
     * Remove element from content
     *
     * @method remove
     * @chainable
     *
     * @param element {DOMElement}  The element to remove
    */
    remove: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            try {
                for(var i=0, l=elements.length; i<l; ++i) {
                    this.removeChild(elements[i]);
                }
            } catch(ex) {}
        });
        return this;
    },

    /**
     * Append element to the existing content
     *
     * @method append
     * @chainable
     *
     * @param element {DOMElement}  The element to append
    */
    append: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            for(var i=0, l=elements.length; i<l; ++i) {
                this.appendChild(elements[i]);
            }
        });
        return this;
    },

    /**
     * Replace the existing content with given element
     *
     * @method replace
     * @chainable
     *
     * @param element {DOMElement}  The element to append
    */
    replace: function(element) {
        this.empty();
        return this.append(element);
    },

    /**
     * Apply on each elements the given function
     *
     * @method each
     * @chainable
     *
     * @param fct {Function}        The function to apply to elements
     * Other parameters are passed to every function call as arguments
    */
    each: function() {
        var list          = this.elementList,
            argumentArray = Array.prototype.slice.call(arguments),
            fct           = argumentArray[0],
            args          = argumentArray.slice(1);

        fct = a.isFunction(fct) ? fct : function() {};
        for(var i=0, l=list.length; i<l; ++i) {
            // Calling element with this as element currently selected
            fct.apply(list[i], args);
        }
        return this;
    }
};