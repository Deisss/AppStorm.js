/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js
        core/dom.js
    ]

    Events : []

    Description:
        Manage translation

************************************************************************ */

a.translate = a.i18n = (function() {
    'use strict';

    // Internal variable
    var language         = 'en-US',
        dictionnary      = {},
        globalVariable   = {},
        defaultAttribute = 'tr',
        customAttribute  = 'custom-tr',
        eraseAttribute   = 'erase-tr',
        regexVariable    = /\{\{[a-z0-9\-_]+\}\}/gi;

    var storageSupported = (a.storage && a.storage.persistent.support);

    /**
     * Get attribute stored into given element
     *
     * @method getAttr
     * @private
     *
     * @param element {DOMElement}          The dom object to get
    *                                       attribute from
     * @param search {String}               The attribute name searched
     * @return {String}                     The founded attribute
     *                                      content or empty string
    */
    function getAttr(element, search) {
        return  element.getAttribute(search)
            ||  element.getAttribute('a-' + search)
            ||  element.getAttribute('data-' + search)
            ||  '';
    };

    /**
     * Apply to a given element the given translation
     *
     * @method applyTranslationToElement
     * @private
     *
     * @param node {DOMElement}             The element to apply
     * @param translation {String}          The translation to apply
    */
    function applyTranslationToElement(node, translation) {
        var customTagAttribute = getAttr(node, customAttribute);

        if(customTagAttribute && customTagAttribute != '') {
            try {
                node[customTagAttribute] = translation;
            } catch(e) {}
            return;
        }

        // We are on a submit/reset button
        if(node.nodeName == 'INPUT') {
            var type = node.type;
            if(type == 'submit' || type == 'reset' || type == 'button') {
                node.value = translation;
            } else {
                try {
                    node.placeholder = translation;
                } catch(e) {}
            }

        // On fieldset we apply title
        } else if(node.nodeName === 'FIELDSET') {
            node.title = translation;

        // XML translate (only for IE)
        //} else if(!a.isNone(node.text) && document.all ) {
        //    node.text = translation;

        // We are in erase mode, so we erase everything
        } else if(getAttr(node, eraseAttribute) !== '') {
            a.dom.el(node).empty().append(
                document.createTextNode(translation)
            );

        // We do translation system
        } else {
            // We separate textnode and other elements using <tag> element
            var splittedTranslation = translation.split('<tag>'),
                i = 0,
                l = node.childNodes.length,
                m = splittedTranslation.length;

            // 1) We remove text node elements
            for(; i<l; ++i) {
                var el = node.childNodes[i];
                if(el && el.nodeType == 3) {
                    el.parentNode.removeChild(el);
                }
            }

            i = 0;
            a.dom.el(node).children().each(function() {
                var tr   = splittedTranslation[i] || '',
                    text = document.createTextNode(tr);
                i++;

                this.parentNode.insertBefore(text, this);
            });

            // We add latests elements to end
            if(m > i) {
                var j = m - i;
                for(var j=0, k=(m-i); j<k; ++j) {
                    node.appendChild(
                        document.createTextNode(splittedTranslation[i + j])
                    );
                }
            }
        }
    };

    /**
     * Apply translation to a given document/sub-document
     *
     * @method i18n
     *
     * @param root {DOMElement | null}      The root element to 
     *                                      start translate from
    */
    function i18n(root) {
        root = root || document;

        // Selecting elements
        var el   = a.dom.el(root),
            // We search 'tr' and 'data-tr' tag on elements
            srch = defaultAttribute
                + ',a-' + defaultAttribute
                + ',data-' + defaultAttribute;

        var currentDictionnary = dictionnary[language] || {};

        var elements = el.attr(srch).getElements();

        // Elements may have also the initial element itself
       if(root.getAttribute && 
            (
                root.getAttribute(defaultAttribute) ||
                root.getAttribute('a-' + defaultAttribute) ||
                root.getAttribute('data-' + defaultAttribute)
            )) {
            elements.push(root);
        }

        // Selecting only elements with tr/a-tr/data-tr html tag setted
        a.dom.el(elements).each(function() {
            // Getting the searched key translate
            var key       = getAttr(this, defaultAttribute),
                attribute = currentDictionnary[key] || '';

            // In case of trouble, we rollback on key elements
            if(attribute === '') {
                attribute = key;
            }

            // use regexVariable to extract variable from string
            var foundVariables = attribute.match(regexVariable);
            // We got something like ['{{a}}', '{{b}}']

            // We remove '{{' and '}}'
            var matches = a.map(foundVariables, function(value) {
                return value.replace('{{', '').replace('}}', '');
            });

            // We create final variables object
            var variables = {},
                i=matches.length;
            while(i--) {
                var variable = matches[i],
                    searchedVariable = defaultAttribute + '-' + variable,
                    value = getAttr(this, searchedVariable);
                if(value) {
                    variables[variable] = value;
                }
            }

            // Now we extract variable, we need to translate
            var translate = get(key, variables, true);

            // Finally we can apply translation
            applyTranslationToElement(this, translate);
        });
    };

    /**
     * Get the current used language
     *
     * @method getLanguage
     *
     * @return {String}                     The language setted by
     *                                      user/system (default is 'en-US')
    */
    function getLanguage() {
        return language;
    };

    /**
     * Set the current used language.
     * Auto-translate current document except if update is set to false.
     *
     * @method setLanguage
     *
     * @param lang {String}                 The new language to apply
     * @param update {Boolean | null}       If we should translate
     *                                      current (default: yes)
    */
    function setLanguage(lang, update) {
        if(!a.isString(lang) || !lang) {
            a.console.error('a.translate.setLanguage: setting a non-string ' +
                            'lang, or empty string, as default translate: ',
                            'Test non-string value is refused', 1);
        } else {
            language = lang;

            if(storageSupported) {
                a.storage.persistent.set('app.language', language);
            }

            if(update !== false) {
                i18n();
            }
        }
    };

    /**
     * Get any global variable setted
     *
     * @method getGlobalVariable
     *
     * @param key {String}                  The variable key to search
     * @return {String}                     The variable value or
     *                                      an empty string if not found
    */
    function getGlobalVariable(key) {
        return globalVariable[key] || '';
    };

    /**
     * Set a global variable to be used if possible when translating
     *
     * @method setGlobalVariable
     *
     * @param key {String}                  The variable key to register
     * @param value {String}                The linked value
    */
    function setGlobalVariable(key, value) {
        globalVariable[key] = value;
    };

    /**
     * Register a new translation for given language.
     * After register is done, you can now use data-tr='{{hash}}' inside
     * HTML page to have corresponding translation.
     * Note: you can use a quicker version add(lang, object, update)
     * Where the object will be a key/value translate list for lang
     *
     * @method add
     *
     * @param lang {String}                 The language to
     *                                      register hash/value pair
     * @param hash {String}                 The refered hash to
     *                                      use for translation
     * @param value {String}                The linked translation
     *                                      for given language
     * @param update {Boolean | null}       If we should fully
     *                                      update or not document
    */
    function add(lang, hash, value, update) {
        if(a.isTrueObject(hash)) {
            a.each(hash, function(val, index) {
                add(lang, index, val, update);
            });
            return;
        }
        if(!dictionnary[lang]) {
            dictionnary[lang] = {};
        }

        dictionnary[lang][hash] = value;

        if(update !== false) {
            i18n();
        }
    };

    /**
     * Set a new translation set for a given language.
     * If dict is set to null, it will erase language.
     *
     * @method set
     *
     * @param lang {String}                 The language to register dict
     * @param dict {Object}                 A key/value pair object for
     *                                      registrating many translation
     *                                      at once
     * @param update {Boolean | null}       If we should fully
     *                                      update or not document
    */
    function set(lang, dict, update) {
        if(dict === null) {
            delete dictionnary[lang];
        } else {
            for(var i in dict) {
                add(lang, i, dict[i], false);
            }
        }

        if(update !== false) {
            i18n();
        }
    };

    /**
     * Get an existing translation stored
     *
     * @method get
     *
     * @param key {String | null}           The searched translation key
     * @param variables {Object | null}     Any key/value pair variable to pass
     * @param translate {Boolean | null}    If we should or not translate
     *                                      (including variable) or simply
     *                                      send back entry (default: true)
     *
     * @return {String}                     The translated key or an empty
     *                                      string in case of problem
    */
    function get(key, variables, translate) {
        if(!dictionnary[language]) {
            return key;
        }
        var tr = dictionnary[language][key] || null;

        if(a.isNull(tr)) {
            return key;
        }

        if(translate === false) {
            return tr;
        }

        /**
         * From a hash, try to find the good variable content
         *
         * @param hash {String}             The hash to find in variable list
         * @return {String}                 The variable content or empty
         *                                  string in case of not found
        */
        function hashToVariable(hash) {
            var lvar = variables,
                gvar = globalVariable,
                // First local var, and second global var check
                avar = [lvar, gvar];

            for(var i=0; i<2; ++i) {
                for(var j in avar[i]) {
                    if(hash === '{{' + j + '}}') {
                        return avar[i][j];
                    }
                }
            }

            // Nothing found
            return '';
        };

        var trVariables = tr.match(regexVariable) || [];

        for(var i=0, l=trVariables.length; i<l; ++i) {
            var el = trVariables[i];
            tr = tr.replace(el, hashToVariable(el));
        }

        // If it has still some unknow variable, we remove them...
        return tr.replace(regexVariable, '');
    };

    /**
     * Get the full stored dictionnary.
     *
     * @param lang {String | null}          If lang is setted, retrieve only
     *                                      the given language. In other cases
     *                                      retrieve all dictionnaries.
    */
    function getDictionnary(lang) {
        if(lang) {
            return dictionnary[lang] || {};
        }
        return dictionnary;
    };


    /**
     * Erase dictionnary
     *
     * @method clearDictionnary
    */
    function clearDictionnary() {
        dictionnary = {};
    };



    // If storage is enabled, we try to get the stored language in the store
    if(storageSupported) {
        var storedLanguage = a.storage.persistent.get('app.language');

        // If language do exist and is setted
        if(a.isString(storedLanguage) && storedLanguage.length > 0) {
            language = storedLanguage;
            i18n();
        }
    }



    // Final object
    return {
        getLanguage: getLanguage,
        getCurrent:  getLanguage,

        setLanguage: setLanguage,
        setCurrent:  setLanguage,

        translate:   i18n,
        i18n:        i18n,

        getDictionnary:    getDictionnary,

        getGlobalVariable: getGlobalVariable,
        addGlobalVariable: setGlobalVariable,
        setGlobalVariable: setGlobalVariable,

        add:            add,
        addTranslation: add,

        get:            get,
        getTranslation: get,

        set:            set,
        setTranslation: set,

        clear: clearDictionnary
    };
})();
