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
    var findSearch = ['data-bind', 'a-bind', 'bind'],
        inputSearch = ['INPUT', 'TEXTAREA'];

    /**
     * Get attribute value for given elements
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
     * Perform change on other elements
     *
     * @method applyChange
     * @private
     *
     * @param el {DOMElement}               The dom element requesting change
     * @param name {String}                 The binding name
     * @param value {String}                The binding value to apply
    */
    function applyChange(el, name, value) {
        var el    = this,
            name  = getBindingName(el),
            value = el.value;

        a.dom.attr(findSearch, name).each(function(val) {
            if(el && this === el) {
                return;
            }

            var name = this.nodeName;

            if(a.contains(inputSearch, name)) {
                this.value = val;
            } else {
                this.innerHTML = val;
            }
        }, value);
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
        root = root || document;

        var elements = [];

        // We get elements subject to binding
        a.dom.el(root).attr(findSearch).each(function() {
            var name = this.nodeName;
            if(!a.contains(inputSearch, name)) {
                return;
            }

            elements.push(this);

            var bindingName = getBindingName(this);

            // On change apply binding
            a.dom.el(this).bind('change input keydown', applyChange);

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
        root = root || document;

        var elements = [];

        // We get elements subject to binding
        a.dom.el(root).attr(findSearch).each(function() {
            var name = this.nodeName;
            if(!a.contains(inputSearch, name)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).unbind('change input keydown', applyChange);
        });

        return elements;
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
         * @param name {String} The binding name to refresh
         * @param value {String} The value to apply
        */
        manual: function(name, value) {
            applyChange(null, name, value);
        },

        /**
         * Refresh everything and start again system.
        */
        refresh: function() {
            unbind(document);
            return binding(document);
        }
    };
})();