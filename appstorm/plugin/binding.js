/**
 * Create a binding system between HTML dom elements.
 * This plugin aims to run better on browser who supports 'input' HTML5 event.
 * But it still run on older browser, just slower...
 *
 * Basic usage:
 *   <a data-bind="helloworld"></a>
 *   <input type="text" data-bind="helloworld" />
 *
 *   If one of them get a different value, the other get the new value automatically
 *
 *   You can also use quicker binding:
 *   <a a-bind="helloworld"></a>
 *
 *   Or even shorter:
 *   <a bind="helloworld"></a>
*/


a.binding = (function() {
    // Searched string/elements type
    var findSearch  = ['data-bind', 'a-bind', 'bind'],
        inputSearch = ['INPUT', 'TEXTAREA'],
    // Converter function storage
        converters  = {};

    /**
     * Get attribute value for given elements
     *
     * @method getBindingName
     * @private
     *
     * @param element {DOMElement}          The element to get attribute from
     * @param search {String}               The searched attribute
     * @return {String | null}              The attribute content found
    */
    function getBindingName(element, search) {
        search = search || findSearch;
        var value = a.dom.el(element).attribute(search);

        if(a.isString(value)) {
            return value;
        } else if(value.length > 0) {
            return value[0];
        }

        return null;
    };

    /**
     * Get The stored element value
     *
     * @method getElementValue
     * @private
     *
     * @param element {DOMElement}          The element to search inside
     * @return {String}                     The InnerHTML/value inside
    */
    function getElementValue(element) {
        if(a.contains(inputSearch, element.nodeName)) {
            return element.value;
        } else {
            var content = '';
            for(var i=0, l=element.childNodes.length; i<l; ++i) {
                var node = element.childNodes[i];
                if(node.nodeType == 3) {
                    content += node.nodeValue;
                }
            }
            return content;
        }
    };

    /**
     * Perform change on other elements
     *
     * @method applyChange
     * @private
     *
     * @param name {String}                 The binding name
     * @param value {String}                The binding value to apply
    */
    function applyChange(el, name, value) {
        // Updating data
        el = this || el;
        name = getBindingName(el) || name;
        value = value || el.value;

        // Searching data-bind elements tags
        a.dom.attr(findSearch, name).each(function(val) {
            if(el && this === el) {
                return;
            }

            if(a.contains(inputSearch, this.nodeName)) {
                this.value = val;
            } else {
                this.innerHTML = val;
            }
        }, value);


        /*var innerSearch = [
                'data-inner-bind-' + name,
                'a-inner-bind-' + name,
                'inner-bind-' + name
            ];

        // From innerSearch, create the start/stop elements
        var innerStart = innerSearch.slice(),
            innerStop  = innerSearch.slice(),
            x = innerStart.length,
            y = innerStop.length;

        while(x--) {
            innerStart[x] += '-start';
        }
        while(y--) {
            innerStart[y] += '-stop';
        }

        a.message.dispatch('a.binding', {
            name: name,
            value: value
        });*/

        // Searching inner-bind-{{name}} elements tags
        /*a.dom.attr(innerStart).each(function(val) {
            if(el && this === el) {
                return;
            }

            var current = getElementValue(this),
                start   = a.dom.el(this).attribute(innerStart),
                stop    = a.dom.el(this).attribute(innerStop) || 0;

            // We skip previous value, and setup new value
            current = current.substr(0, start)
                        + val + current.substr(start + stop);

            // TODO: all other values linked should have their
            // start value updated if above the current start position
            // (has we change the length of string) !
        }, value);*/
        /*a.dom.attr(innerStart).each(function(val) {
            // TODO: take advantages of functionnalities here
        }, value);*/
    };

    /**
     * Tiny binder between the applyChange function and event related
     *
     * @method eventApplyChange
     * @private
     *
     * @param evt {Object}                  The input event
    */
    function eventApplyChange(evt) {
        applyChange.call(evt.target);
    };

    /**
     * Search for sub elements linked by binding to another element
     *
     * @method detectBinding
     * @private
     *
     * @param root {DOMElement}             The root element to start searching
     *                                      from.
     * @return {Array}                      The HTML elements who are emitting
    */
    function binding(root) {
        var elements = [];

        // We get elements subject to binding
        a.dom.el(root || document).attr(findSearch).each(function() {
            if(!a.contains(inputSearch, this.nodeName)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).bind('change input keydown', eventApplyChange);

            // Start first time
            applyChange.call(this);
        });

        return elements;
    };

    /**
     * Unbind previously binded elements
     *
     * @method unbinding
     * @private
     *
     * @param root {DOMElement}             The root element to start searching
     *                                      from.
     * @return {Array}                      The HTML elements who are emitting
    */
    function unbinding(root) {
        var elements = [];

        // We get elements subject to binding
        a.dom.el(root || document).attr(findSearch).each(function() {
            if(!a.contains(inputSearch, this.nodeName)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).unbind('change input keydown', eventApplyChange);
        });

        return elements;
    };

    /**
     * Find elements who include inner data to register,
     * and mark them for later use.
     *
     * @method findInnerDataElement
     * @private
     *
     * @param root {DOMElement | null}      The root element to start search
     *                                      from
    */
    function findInnerDataElement(root) {
        root = root || document;

        var reg = /\{\{\s*(\w+)\s*\}\}/gi;

        // Search in all sub elements of root if they need to be
        // marked as inner data
        a.dom.el(root).all().each(function() {
            // Erasing previous reg test
            reg.lastIndex = 0;

            // Selecting HTML content
            var value = getElementValue(this);

            // Searching TAG inside value
            if(
                    !value ||
                    value.indexOf('{{') == -1 ||
                    value.indexOf('}}') == -1 ||
                    !reg.test(value)) {
                return;
            }

            // To remember position of all elements
            var matches = value.match(reg);
            reg.lastIndex = 0;

            // We remove '{{' and '}}' and replace them by invisible char
            // We also remove inside {{...}} because we don't need it
            // (as matches already keep position of every elements)
            console.log(value.replace(reg, '\u200C\u200c\u200C\u200c'));

            // TODO: we add attribute tag to retrieve them
            // TODO: create a fct to insert tag into element at specified position

            /*console.log(this);

            // For every entry found in the string
            // We create a linked marker
            var m     = null,
                found = false;

            while(m = reg.exec(value)) {
                var start   = m.index,
                    bracket = m[0],
                    name    = a.trim(m[1]),
                    base    = 'data-inner-bind-' + name;

                found = true;

                // Set tags as follow for every entries: name & start pos
                this.setAttribute(
                    base + '-start', '' + start
                );
                this.setAttribute(
                    base + '-stop', '0'
                );

                // We update the value to remove old position marker
                value = value.replace(bracket, '');
            }

            // If we found something, it means we have to update content
            // with removed tag found
            if(found) {
                setElementValue(this, value);
            }*/
        });
    };

    return {
        /**
         * Search binding into given dom object, and try to find bindings
         * to use.
         *
         * @method bind
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who recieve
         *                                  event binding
        */
        bind: function(dom) {
            return binding(dom);
        },

        /**
         * From a given start point, unbind sub children to binding system.
         *
         * @method unbind
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who loose
         *                                  event binding
        */
        unbind: function(dom) {
            return unbinding(dom);
        },

        /**
         * Manually call a binding refresh.
         *
         * @method manual
         *
         * @param name {String}             The binding name to refresh
         * @param value {String}            The value to apply
        */
        manual: function(name, value) {
            applyChange(null, name, value);
        },

        /**
         * Refresh everything and start again system.
         *
         * @method refresh
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who recieve
         *                                  event binding
        */
        refresh: function(dom) {
            unbinding(dom);
            return binding(dom);
        },

        /**
         * Register a new converter to use
         *
         * @method registerConverter
         *
         * @param name {String}             The name to use inside html tags
         * @param fct {Function}            The function linked to name
        */
        /*registerConverter: function(name, fct) {
            if(a.isFunction(fct)) {
                converters[name] = fct;
            }
        },*/

        /**
         * Get a converter by it's name
         *
         * @method getConverter
         *
         * @param name {String}             The name used for registerConverter
         * @return {Function | null}        The related function, or null
         *                                  if nothing has been found
        */
        /*getConverter: function(name) {
            return converters[name] || null;
        },*/

        /**
         * Remove a converter from existing converter list
         *
         * @method remove
         *
         * @param name {String}             The converter name to remove
        */
        /*removeConverter: function(name) {
            delete converters[name];
        },*/

        /**
         * From a given root (document), find the elements who needs to be
         * internally updated and mark them as "to watch".
         *
         * @param root {DOMElement | null}  The dom root, document if null
        */
        watchInnerBind: function(root) {
            // change name to bindInner(root)
            findInnerDataElement(root);
        },
        unwatchInnerBind: function(root) {
            unbindInner(root);
        }
    };
})();