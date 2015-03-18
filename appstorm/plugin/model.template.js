/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/message.js
        plugin/model.js
    ]

    Events : []

    Description:
        Provide a model rendering system, aims to quickly create forms
        and related data presentation. For a quicker bindings.

************************************************************************ */

// TODO: DO PRESENTATION TEXT HERE
/**
    Provide a model rendering system, aims to quickly create forms
    and related data presentation. For a quicker bindings.
*/
a.model.template = {
    engine: 'raw',

    generator: a.mem.getInstance('app.model.template.engine'),
    descriptor: a.mem.getInstance('app.model.template.render'),

    /**
     * Get the render descriptor, able to render the given element
     * in the current situation (regarding engine, current template...).
     * YOU SHOULD NOT USE THIS FUNCTION BY YOURSELF
     *
     * @method getDescriptor
     * @private
     *
     * @param type {String}                 The main type, can be one of the
     *                                      following: column, row, fieldset,
     *                                      input
     * @param subtype {String}              Mostly for input field, the subtype
     *                                      like 'text', 'checkbox', 'radio',
     *                                      but input, is also a generic name
     *                                      so it can also be 'textarea',
     *                                      'select', ...
     * @param key {String}                  In case of input type, it should be
     *                                      the model key to get, in any other
     *                                      cases, the current row/column
     * @param template {Object}             The template currently selected
     *                                      by user
     * @return {Function}                   The most appropriate function found
     *                                      to apply rendering.
    */
    getDescriptor: function(type, subtype, key, template) {
        // Template rendering
        var renderTmpl = (('rendering' in template) &&
                a.isTrueObject(template.rendering))? template.rendering : null,
        // Engine rendering
            engine = a.model.template.generator.get(a.model.template.engine),
            renderNgin = (('rendering' in engine) &&
                a.isTrueObject(engine.rendering)) ? engine.rendering : null;

        // If engine is not found, we raise error
        if(a.isNone(engine) || a.isNone(renderNgin)) {
            a.console.error('a.model.template.getDescriptor: unable to find ' +
                a.model.template.engine + ' engine', 1);
        }

        var error = 'a.model.template.getDescriptor: unable to ' +
                    'find descriptor for ' + key + ' with engine ' + 
                    a.model.template.engine + ' and template ' + 
                    template.templateName;

        // Structure elements like row, columns...
        if(type === 'column' || type === 'row' || type === 'fieldset' ||
            type === 'clearfix') {
            // Exact match search
            var exact = type + key;

            // 1: we search for specific row number, first in template,
            // second in engine
            if(renderTmpl && a.isFunction(renderTmpl[exact])) {
                return renderTmpl[exact];
            } else if(renderNgin && a.isFunction(renderNgin[exact])) {
                return renderNgin[exact];
            }

            // 2: we search for generic row, first in template,
            // second in engine
            if(renderTmpl && a.isFunction(renderTmpl[type])) {
                return renderTmpl[type];
            } else if(renderNgin && a.isFunction(renderNgin[type])) {
                return renderNgin[type];
            } else {
                a.console.error(error, 1);
                return null;
            }

        } else if(type === 'input') {
            if(renderTmpl) {
                // 1: we search for a direct model key binded into the template
                // we dont do the same in the engine (no sense to have it in
                // engine level)
                if(a.isFunction(renderTmpl[key])) {
                    return renderTmpl[key];

                // 2: We search for a direct sub-type in the template
                } else if(a.isFunction(renderTmpl[subtype])) {
                    return renderTmpl[subtype];
                }
            }

            // 3: we search for a direct sub-type in the engine
            if(renderNgin && a.isFunction(renderNgin[subtype])) {
                return renderNgin[subtype];
            }

            // 4: still nothing found, we go for a direct search, first in
            // template, second in engine
            if(renderTmpl && a.isFunction(renderTmpl[type])) {
                return renderTmpl[type];
            } else if(renderNgin && a.isFunction(renderNgin[type])) {
                return renderNgin[type];
            } else {
                a.console.error(error, 1);
                return null;
            }

        } else {
            a.console.error('a.model.template.getDescriptor: The type ' + type
                + ' is unknow', 1);
            return null;
        }
        // POUR INPUT:
        // 1: on cherche dans le template s'il n'existe pas
        // le nom de la clef du modèle (rendering custom)
        // 2: on cherche dans le template s'il n'existe pas
        // un 'type' => exemple "textarea" ou "text" ou "checkbox"
        // ou "select" ou "hidden"
        // dans le template
        // 3: on cherche dans l'engine pour cette bestiole
        // 4: on cherche dans le template le type global: input, textarea...
        // 5: on cherche dans l'engine le template input, textarea...
        // 6: on print un message d'erreur...

        // POUR COLUMN:
        // 1: on cherche le column1/2/3 dans le template
        // 2: on cherche le column1/2/3 dans l'engine
        // 3: on cherche le column dans template
        // 4: on cherche le column dans l'engine

        // POUR ROW:
        // 1: on cherche le row1/2/3 dans le template
        // 2: on cherche le row1/2/3 dans l'engine
        // 3: on cherche le row dans template
        // 4: on cherche le row dans l'engine
    },

    output: {
        /**
         * Print a single input on output (including label)
         *
         * @method input
         *
         * @param model 
        */
        input: function(model, propertyName, parameters, template) {
            var type = model.type(propertyName),
                value = model.get(propertyName),
                descriptor = a.model.template.getDescriptor(
                            'input', type, propertyName, template);

            // We got a function as result, so we can continue
            if(a.isFunction(descriptor)) {
                // TODO: get the label content
                // TODO: create lblClass
                // TODO: create iptClass
                var label = propertyName,
                    lblClass = '',
                    iptClass = '';
                return descriptor.call(this, model, propertyName, type, label,
                                value, lblClass, iptClass, parameters);
            } else {
                return null;
            }
        },

        /**
         * Print a column system (like on bootstrap or fundation)
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method column
         * @private
         *
         * @param model {a.model.instance}  The model to present to user
         * @param number {Integer}          The column separator (1 to 12)
         * @param template {Object}         The template object
         * @param extra {Object}            Any extra elements (the position
         *                                  left/right for example)
         * @return {DOMelement | null}      The dom element created (can
         *                                  be also null)
        */
        column: function(model, number, template, extra) {
            var descriptor = a.model.template.getDescriptor(
                'column', null, number, template);

            // We got a function as result, so we can continue
            if(a.isFunction(descriptor)) {
                return descriptor.call(this, number, extra);
            } else {
                return null;
            }
        },

        /**
         * Print a single line content.
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method row
         * @private
         *
         * @param model {a.model.instance}  The model to bind
         * @param row {String}              The line properties
         * @param number {Integer}          The current row number
         * @param template {Object}         The template object
         * @return {DOMElement}             The row full of content
        */
        row: function(model, row, number, template) {
            var properties = row.split('&&'),
                line = null,
                descriptor = a.model.template.getDescriptor(
                    'row', null, number, template);

            // We search for a text align
            var position = null,
                possiblePosition = ['left', 'right', 'justify', 'center'];
            // We got exactly one position, it's the line element
            // which may handle left/right positioning
            if(properties.length === 1) {
                var separator = properties[0].split('::');
                for(var y=0, u=separator.length; y<u; ++y) {
                    var tmp = a.trim(separator[y]);
                    if(a.contains(possiblePosition, tmp)) {
                        position = tmp;
                    }
                }
            }

            if(a.isFunction(descriptor)) {
                line = descriptor.call(this, number, template, {
                    position: position
                });
            } else {
                line = document.createElement('div');
            }

            for(var i=0, l=properties.length; i<l; ++i) {
                var element = a.trim(properties[i]);

                // Now we cut the parameters
                // We erase position
                position = null;
                var cut = element.split('::'),
                    column = null;

                // treatment for special case '::col3' which makes a blank
                // div spacer
                if(cut[0] === '' && cut[1].indexOf('col') === 0) {
                    // We create an empty column
                    column = this.column.call(this, model, cut[1], template);
                    if(column) {
                        // TODO: check if it's the only way
                        // Special treatment to make space appearing
                        // column.innerHTML = '&nbsp;';
                        line.appendChild(column);
                        continue;
                    }
                }

                // We got some extra parameters
                // We are searching here ONLY for column system
                if(cut.length > 1) {
                    // First we search a position placement
                    var j = cut.length,
                        k = cut.length;
                    while(j--) {
                        cut[j] = a.trim(cut[j]);
                        if(a.contains(possiblePosition, cut[j])) {
                            position = cut[j];
                        }
                    }
                    for(j=0; j<k; ++j) {
                        var el = cut[j];
                        // User request to create column system
                        if(el.indexOf('col') === 0) {
                            column = this.column.call(this, model, el,
                                            template, {position: position});
                        }
                    }
                }

                var input = this.input.call(this, model, cut[0],
                                                cut.splice(1), template);

                if(column) {
                    column.appendChild(input);
                    line.appendChild(column);
                } else {
                    line.appendChild(input);
                }
            }

            // We add the clearfix if needed
            var clearfix = a.model.template.getDescriptor('clearfix', null,
                number, template);
            if(a.isFunction(clearfix)) {
                line.appendChild(clearfix.call(this, number, template));
            }

            return line;
        },

        /**
         * Render a fieldset inside the given model.
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method fieldset
         * @private
         *
         * @param model {a.model.instance}  The model to render
         * @param row {Array}               The row current value
         * @param number {Integer}          The current row number
         * @param template {Object}         The current template to render
         * @return {DOMElement}             The fieldset created
        */
        fieldset: function(model, row, number, template) {
            var fieldset = a.model.template.getDescriptor('fieldset', 
                null, number, template);

            for(var i=0, l=row.length; i<l; ++i) {
                var element = a.trim(row[i]),
                    line = null;
                if(element[i].indexOf('legend')) {
                    // TODO: do the legend line here
                } else {
                    line = this.row.call(this, model, element, i, template);
                }
                if(line) {
                    fieldset.appendChild(line);
                }
            }

            return fieldset;
        },

        /**
         * Render a given model, regarding the given template, and the
         * current global rendering engine
         *
         * @method model
         *
         * @param model {a.model.instance}  The model to render
         * @param templateName {String}     The template to use for rendering
         * @return {Array}                  A list of DOMElement to append
         *                                  to current HTML as rendering system
        */
        model: function(model, templateName) {
            var tmpl = a.model.template.descriptor.get(templateName);

            if(!tmpl) {
                a.console.error('a.model.template.output.model: The template '+
                    templateName + ' could not be found', 1);
                return;
            }

            var content = tmpl.template,
                render = [];

            // Adding a little extra
            tmpl.templateName = templateName;

            for(var i=0, l=content.length; i<l; ++i) {
                // It's a fieldset
                if(a.isArray(content[i])) {
                    render.push(this.fieldset.call(this, model, content[i],
                        i, content));
                } else {
                    render.push(this.row.call(this, model, content[i], i,
                                                                content));
                }
            }

            return render;
        }
    }
};




/*
 * -----------------
 *   RAW RENDERING
 * -----------------
*/
(function() {
    a.model.template.generator.set('raw', {
        rendering: {
            /**
             * Render a single row element
             *
             * @method row
             *
             * @param number {Integer}      The current row number
             * @param template {Object}     The template currently printed
             * @param extra {Object}        Any special element, here only
             *                              'extra.position' can be passed
             *                              defining the text content position
             * @return {DOMElement}         The row element created
            */
            row: function(number, template, extra) {
                var row = document.createElement('div');

                if(a.isString(extra.position)) {
                    row.style.textAlign = extra.position;
                }

                return row;
            },

            /**
             * Render a clearfix element
             *
             * @method clearfix
             *
             * @return {DOMElement | null}  The clearfix element to clear the
             *                              float problem
            */
            clearfix: function() {
                var div = document.createElement('div');
                div.style.clear = 'both';
                div.style.height = '0px';
                div.style.overflow = 'hidden';
                return div;
            },

            /**
             * Render a column separator
             *
             * @method column
             *
             * @param number {Integer}      The col space (from 1 to 12)
             * @return {DOMElement}         The column system created
            */
            column: function(number, extra) {
                var div = document.createElement('div');

                // Convert col-xs, col-md, col3 things into number
                number = parseInt(number.match(/[0-9]+/)[0], 10);

                // Creating real system
                var real = Math.round(number * 8.33333333 * 100000) / 100000;
                div.style.styleFloat = 'left';
                div.style.cssFloat = 'left';
                div.style.width = real + '%';

                if(a.isString(extra.position)) {
                    div.style.textAlign = extra.position;
                }

                return div;
            },

            /**
             * Generate a reset button
             *
             * @method reset
             *
             * @param value {String | null} The value to put instead of 'reset'
             * @return {DOMElement}         The button
            */
            reset: function(value) {
                var reset = document.createElement('input');
                reset.type = 'reset';
                if(value) {
                    reset.value = value;
                }
                return reset;
            },

            /**
             * Create a submit button
             *
             * @method submit
             *
             * @param value {String | null} The value to put instead of 'send'
             * @return {DOMElement}         The button
            */
            submit: function(value) {
                var submit = document.createElement('submit');
                submit.type = 'submit';
                if(value) {
                    submit.value = value;
                }
                return submit;
            },

            /**
             * Render an input
             *
             * @method input
             *
             * @param model {a.model.instance} The model to get data from
             * @param name {String}         The input name to validate, like
             *                              'login' or 'password'
             * @param type {String}         The input type, like text
             * @param label {String}        The label to show to user
             * @param value {String | null} The value to start with
             * @param lblClass {String}     The label class to add
             * @param iptClass {String}     The input class to add
             * @param extra {Array}         Extra parameters (any kind)
             * @return {DOMElement}         The dom element created
            */
            input: function(model, name, type, label, value, lblClass,
                iptClass, extra) {
                var staticElement = a.contains(extra, 'static');

                var div = document.createElement('div'),
                    lbl = document.createElement('label'),
                    ipt = null;

                var id = 'model-' + name;

                lbl.for = id;
                lbl.className = lblClass;
                lbl.innerHTML = label;

                if(staticElement) {
                    ipt = document.createElement('p');
                    ipt.innerHTML = value || '';
                } else if(type === 'textarea') {
                    ipt = document.createElement('textarea');
                    ipt.innerHTML = value || '';
                } else if(type === 'select') {
                    ipt = document.createElement('select');

                    // We add all sub elements into the select
                    // TODO: get check elements
                    var check = ['opt1', 'opt2'];
                    // TODO: add currently selected
                    for(var i=0, l=check.length; i<l; ++i) {
                        var option = document.createElement('option');
                        option.value = check[i];
                        option.innerHTML = check[i];
                        ipt.appendChild(option);
                    }
                } else {
                    ipt = document.createElement('input');
                    ipt.type = type;
                    // TODO: be able to have more than once
                    ipt.placeholder = label;
                    ipt.value = value || '';
                }

                ipt.id = id;
                ipt.className = iptClass;

                if(!staticElement) {
                    ipt.name = name;
                    ipt.id = id;

                    // Applying extra parameters
                    for(var i=0, l=extra.length; i<l; ++i) {
                        var content = a.trim(extra[i]);
                        if(content === 'disable' || content === 'disabled') {
                            ipt.disabled = true;
                        }
                    }
                }

                div.appendChild(lbl);
                div.appendChild(ipt);
                return div;
            }
        }
    });
})();