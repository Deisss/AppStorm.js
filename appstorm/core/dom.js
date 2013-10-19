/**
 * Provide basic DOM manipulation (really basic one)
*/
a.dom = {
    /**
     * USE ONLY IF YOU HAVE JQUERY, OR DONT CARE OLD BROWSER
     * Use direct jquery or querySelectorAll to select items
     *
     * @method query
     *
     * @param check {String}            The string to search for
     * @param dom {DOMElement}          The dom to search inside
     * @return {a.dom.children}         A chain object
    */
    query: function(check, dom) {
        dom = (a.isObject(dom)) ? dom : document;

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
     * @return {a.dom.children}         A chain object
    */
    el: function(element) {
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
     * @return {a.dom.children}         A chain object
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
     * @return {a.dom.children}         A chain object
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
     * @return {Array}                  The list of elements found
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
     * @param name {String | Array} 
     * @return {Array}                  The list of elements found
    */
    attr: function(name, value, dom) {
        /*
         * -----------------------------------
         *   Detect parameter chain
         * -----------------------------------
        */

        // In case of null dom, it's 2 parameters or single parameter mode
        if(a.isNull(dom)) {
            // We are in single parameter mode
            if(a.isNull(value)) {
                value = document;
            }
            // We are in 2 parameters mode, with value = dom
            if(a.isObject(value)) {
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
        value = value.replace(/ /g,'');


        // Simple version, for latest browser
        if(dom.querySelectorAll) {
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
 * Handle recursive sub-search
 *
 * @param elementList {Array}    The list of elements to use
*/
a.dom.children = function(elementList) {
    this.elementList = elementList;
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
     * @private
     *
     * @return {this}       The chain element
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
     *
     * @param id {String}    The id or list of ids to search
     * @return {this}        The chain element
    */
    id: function(id) {
        return this._perform(a.dom.id, id);
    },

    /**
     * Select sub-class elements
     *
     * @method cls
     *
     * @param clsname {String}    The class or list of classes to search
     * @return {this}             The chain element
    */
    cls: function(clsname) {
        return this._perform(a.dom.cls, clsname);
    },

    /**
     * Add a class to elements
     *
     * @method addClass
     *
     * @param classname {String}    The classname to append to every elements
     * @return {this}               The chain element
    */
    addClass: function(classname) {
        this.each(function() {
            if(this.classList) {
                this.classList.add(classname);
            // We test the element don't have classname first
            } else if(
                !this.className.match(
                    new RegExp('(\\s|^)' + classname + '(\\s|$)')
                )
            ) {
                this.className += ' ' + classname;
            }
        });
        return this;
    },

    /**
     * Test if all elements got classname or not
     *
     * @param classname {String}     The classname to test on every elements
     * @return {this}                The chain element
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
     * @param classname {String}     The classname to remove on every elements
     * @return {this}                The chain element
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
     * @param classname {String}      The classname to toggle on every elements
     * @return {this}                 The chain element
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
     * @param binding {String | Array}   The event/list to apply to
     * @param fct {Function}             The handler to receive event
     * @return {this}                    The chain element
    */
    bind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] == '') {
                continue;
            }
            this.each(function(evt) {
                if(document.addEventListener) {
                    this.addEventListener(evt, fct, false);
                } else if(document.attachEvent) {
                    this.attachEvent('on' + evt, fct);
                } else {
                    this['on' + evt] = fct;
                }
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Unbind event to given function
     *
     * @param binding {String | Array}   The event/list to remove
     * @param fct {Function}             The handler of event
     * @return {this}                    The chain element
    */
    unbind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] == '') {
                continue;
            }

            this.each(function(evt) {
                if(document.removeEventListener) {
                    this.removeEventListener(evt, fct, false);
                } else if(document.detachEvent) {
                    this.detachEvent('on' + evt, fct);
                } else {
                    this['on' + evt] = undefined;
                }
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Select sub-tag elements
     *
     * @param name {String}    The tag or list of tags to search
     * @return {this}          The chain element
    */
    tag: function(name) {
        return this._perform(a.dom.tag, name);
    },

    /**
     * Select sub-attributes elements
     *
     * @param attribute {String}    The attribute or list of
     *                              attributes to search
     * @param value {String | null} The value to use, can be empty
     * @return {this}               The chain element
    */
    attr: function(attribute, value) {
        return this._perform(a.dom.attr, attribute, value);
    },

    /**
     * Append or get attribute
     *
     * @param attribute {String}    The attribute to set
     * @param value {String}        The value to get
    */
    attribute: function(attribute, value) {
        if(typeof(value) === 'undefined') {
            var valueList   = [],
                elementList = this.elementList,
                i           = elementList.length;

            while(i--) {
                try {
                    var data = elementList[i].getAttribute();
                    if(!a.isNull(data) && !a.contains(valueList, data)) {
                        valueList.push(data);
                    }
                } catch(ex) {}
            }

            return valueList;
        } else {
            this.each(function() {
                try {
                    this.setAttribute(attribute, value);
                } catch(ex) {}
            });
            return this;
        }
    },

    /**
     * Same as attribute, but for data- HTML5 tag
     *
     * @param attribute {String}    The attribute to set
     * @param value {String}        The value to get
    */
    data: function(attribute, value) {
        return this.attribute('data-' + attribute, value);
    },

    /**
     * Move to the parent element for every element stored
     *
     * @return {this}               The chain element
    */
    parent: function() {
        var elementList = this.elementList,
            i           = elementList.length;
        while(i--) {
            elementList[i] = elementList[i].parentNode;
        }
        return this;
    },

    /**
     * Insert before selected element
     *
     * @method insertBefore
     *
     * @param element {DOMElement}  The element to insert
     * @return {this}               The chain element
    */
    insertBefore: function(element) {
        this.each(function() {
            this.parentNode.insertBefore(element, this);
        });
        return this;
    },

    /**
     * Insert after selected element
     *
     * @method insertAfter
     *
     * @param element {DOMElement}  The element to insert
     * @return {this}               The chain element
    */
    insertAfter: function(element) {
        this.each(function() {
            this.parentNode.insertBefore(element, this.nextSibling);
        });
        return this;
    },

    /**
     * Empty all elements stored
     *
     * @method empty
     *
     * @return {this}    The chain element
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
     *
     * @param element {DOMElement}  The element to remove
     * @return {this}               The chain element
    */
    remove: function(element) {
        this.each(function() {
            try {
                this.parentNode.removeChild(element);
            } catch(ex) {}
        });
        return this;
    },

    /**
     * Append element to the existing content
     *
     * @method append
     *
     * @param element {DOMElement}  The element to append
     * @return {this}               The chain element
    */
    append: function(element) {
        this.each(function() {
            this.appendChild(element);
        });
        return this;
    },

    /**
     * Replace the existing content with given element
     *
     * @method replace
     *
     * @param element {DOMElement}  The element to append
     * @return {this}               The chain element
    */
    replace: function(element) {
        this.empty();
        this.append(element);
        return this;
    },

    /**
     * Apply on each elements the given function
     *
     * @method each
     *
     * @param fct {Function}        The function to apply to elements
     * Other parameters are passed to every function call as arguments
     * @return {this}               The chain element
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