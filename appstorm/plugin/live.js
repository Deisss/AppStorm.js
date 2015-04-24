/*! ***********************************************************************

    License: MIT Licence

    Description:
        Live is a live data binding inside HTML element. Allowing to
        quickly create dynamic elements in your application.

************************************************************************ */

(function(a) {
    // Test there is or not position inside
    var regIsLive = /\u200c\u200c([^\u200c]+)\u200c\u200c/i,
        regExtractLive = /\u200c\u200c([^\u200c]+)\u200c\u200c/gi;

    // Interpreter is the main elements for changing "a + b"
    // into actual a + b compute.
    var interpreter = a.jsep.interpreter('app.live', true, true, true);

    /**
     * Increase the internal counter.
     * The internal counter is used to know what are the variables in use
     * in this system.
     *
     * @param internal The internal object.
     * @param name The property name to store.
    */
    function increaseInternal(internal, name) {
        if (internal.hasOwnProperty(name)) {
            internal[name]++;
        } else {
            internal[name] = 1;
        }
    }

    // We need to change one method from interpreter
    // We need to know every variables involved, no matter if they
    // exist or not, compare to official solution which matters.
    interpreter.expressions.identifierExpression = function (data, internal,
            scope) {
        // No matter is the element is found in the scope or
        // not, it's counted as inside the scope.
        increaseInternal(internal, data.name);

        if (scope.hasOwnProperty(data.name)) {
            return scope[data.name];
        }

        return data.name;
    };

    // Will store all last bindings found
    var store = a.mem.getInstance('app.live.local');

    /**
     * The given element can change element.
     *
     * @private
     *
     * @param {DOMElement} el               The element to check.
    */
    function isEmitter(el) {
        var tag = el.tagName;
        return (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
    }

    /**
     * The element accept full replace data binding.
     *
     * @private
     *
     * @param {DOMElement} el               The element to check.
    */
    function isLiveGlobal(el) {
        var data = el.getAttribute('data-live');
        return !a.isNone(data);
    }

    /**
     * The element implements some live position.
     *
     * @private
     *
     * @param {DOMElement} el               The element to check.
    */
    function isLiveLocal(el) {
        regIsLive.lastIndex = 0;
        var text = a.dom.el(el).text(false);
        return regIsLive.test(text);
    }

    /**
     * Search for local bindings, and create the final data-live-local tag
     *
     * @private
     *
     * @param {DOMElement} el               The element to check
    */
    function createLiveLocal(el) {
        var text  = a.dom.el(el).text(false),
            local = [],
            match = null;

        regExtractLive.lastIndex = 0;

        // For every \u200C\u200C something \u200C\u200C tag found,
        // We append to local

        while ((match = regExtractLive.exec(text)) !== null) {
            local.push(match[1]);
        }

        // Publishing local
        el.setAttribute('data-live-local', local.join(','));
    }

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
        // TODO: change that for el => data-live
        name = el.getAttribute('data-live') || name;
        value = value || el.value;

        var nameTree = a.jsep.parse(name),
            nameOutput = interpreter.evaluate(nameTree);

        // Storing every variables
        for (var i = 0, l = nameOutput.variables.length; i < l; ++i) {
            store.set(nameOutput.variables[i], value);
        }

        // Getting the store list
        var list = store.list();

        // Searching data-bind elements tags
        a.dom.attr('data-live').each(function() {
            if (el && this === el) {
                return;
            }

            var resultTree = a.jsep.parse(this.getAttribute('data-live')),
                resultOutput = interpreter.evaluate(resultTree, list);

            if (isEmitter(this)) {
                this.value = resultOutput.result;
            } else {
                this.innerHTML = resultOutput.result;
            }
        });

        // Search live elements tag
        a.dom.attr('data-live-local').each(function() {
            if (el && this === el) {
                return;
            }

            var resultTree = a.jsep.parse(this.getAttribute('data-live-local')),
                resultOutput = interpreter.evaluate(resultTree, list);

            // The most simple case, data-live-local is a single element
            if (!a.isArray(resultOutput.result)) {
                resultOutput.result = [resultOutput.result];
            }

            var found = 0,
                max = resultOutput.result.length;

            for(var i = 0, l = this.childNodes.length; i < l && found < max;
                    ++i) {
                var node = this.childNodes[i];
                if(node.nodeType === 3) {
                    var str   = node.nodeValue,
                        start = str.indexOf('\u200c\u200c'),
                        end   = str.indexOf('\u200c\u200c', start + 1);

                    if (start > 0 && end > 0 && start < end) {
                        offset = end + 1;
                        node.nodeValue = str.substr(0, start + 2) +
                            resultOutput.result[found] +
                            str.substr(end, str.length - 1);
                        found++;
                    }
                }
            }
        });
    }

    /**
     * Tiny binder between the applyChange function and event related.
     *
     * @private
     *
     * @param {Object} evt                  The input event.
    */
    function eventApplyChange(e) {
        applyChange.call(e.target);
    }

    a.live = {
        /**
         * The global store where everything is stored for usage.
         *
         * @property store
        */
        store: a.mem.getInstance('app.live.global'),

        /**
         * Bind every elements using tag live.
         * NOTE: this concern only emitters, like input, textarea... Other
         * elements are always affacted.
         *
         * @param {DOMElement | Null} root  The element to start binding from
         * @return {Array}                  All the HTML elements binded
        */
        bind: function(root) {
            var elements = [];

            // We get elements subject to binding
            a.dom.el(root || document).each(function() {
                // We try to catch every sub elements
                a.dom.el(this).children().each(function() {
                    var tmpElements = a.live.bind(this);
                    elements.concat(tmpElements);
                });

                var liveGlobal = isLiveGlobal(this);

                // We bind elements who emit data
                if (isEmitter(this) && liveGlobal) {
                    elements.push(this);
                    // On change apply binding
                    a.dom.el(this).bind('change input keydown',
                            eventApplyChange);
                    // Start first time
                    applyChange.call(this);

                // In this case we have elements binding inside the text
                } else if (isLiveLocal(this) && !liveGlobal) {
                    createLiveLocal(this);
                }
            });

            return elements;
        },

        /**
         * Remove binded elements which are using tag live.
         * NOTE: this concern only emitters, like input, textarea... Other
         * elements are always affacted.
         *
         * @param {DOMElement | Null} root The element to start unbind from
         * @return {Array}                 All the html elements binded
        */
        unbind: function(root) {
            var elements = [];

            // We get elements subject to binding
            a.dom.el(root || document).each(function() {
                // We try to catch every sub elements
                a.dom.el(this).children().each(function() {
                    var tmpElements = a.live.bind(this);
                    elements.concat(tmpElements);
                });

                if (!isEmitter(this) || !isLiveGlobal(this)) {
                    return;
                }

                elements.push(this);

                // On change apply binding
                a.dom.el(this).unbind('change input keydown',
                        eventApplyChange);
            });

            return elements;
        }
    };
})(window.appstorm);


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('live', function(expression) {
    // The \u200c unicode char is written:
    //    &#x200c; in HTML (hex)
    //    &#8204;  in HTML (dec)
    return '&#8204;&#8204;' + expression + '&#8204;&#8204;';
});