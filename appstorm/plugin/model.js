/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model based system to create and manage models threw
        application lifetime

************************************************************************ */


/*
 * Property available element :
 *   - nullable {Boolean}   if the property can be set to null or not
 *   - init {Mixed}         the initial value
 *   - primary {Boolean}    Indicate if property is a primary type or not,
 *                          it's used internally to find models who match...
 *   - needed {Boolean}     Indicate if the property should ALWAYS be
 *                          included when performing a save to server
 *   - check {String}       the typeof check (like String, Object, ...)
 *   - pattern {String}     the regex pattern to check
 *   - validate {Function}  the function to use for validate input.
 *                          Must return true and false value to validate or not
 *                          Validate can also act like pattern (string regex)
 *                          but it's more recommanded to use pattern instead
 *   - many {Boolean}       Indicate if check should expect an array instead
 *                          of a single value.
 *   - transform {Function} the transformation to apply before setting data
 *   - event {String}       the event to raise on any change
 *   - apply {Function}     the apply element
*/

/**
 * A model creator to manage your model type.
 *
 * @function model
 * @namespace a
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model.
*/
a.model = function(name, properties) {
    // Only allow new name (already existing name just give already existing
    // model definition)
    if(a.isString(name)) {
        if(!a.model.pooler.get(name)) {
            // Remove functions from object
            var functions = {};
            for (var el in properties) {
                if (properties.hasOwnProperty(el) && a.isFunction(properties[el])) {
                    functions[el] = properties[el];
                    delete properties[el];
                }
            }
            // Register model into pooler
            a.model.pooler.set(name, {
                properties: properties,
                functions: functions
            });

            // Register model into ajax
            // We auto-add the type 'json' as for now AppStorm
            // is only able to parse JSON elements
            a.setTemplateAjaxOptions('model:' + name, {
                model: name,
                type: 'json'
            });

            // We return a function embed to create new instance
            // from variable
            return function() {
                return a.model.pooler.createInstance(name);
            };
        } else {
            // We directly create a new model
            return a.model.pooler.createInstance(name);
        }

    // Name is a search query system
    } else if(a.isTrueObject(name)) {
        if('destroy' in name) {
            var instances = name['instances'];
            if(instances && a.isArray(instances)) {
                var i = instances.length;
                while(i--) {
                    a.model.pooler.deleteInstance(instances[i]);
                }
            }
        } else {
            return a.model.pooler.searchInstance(name);
        }
    }
};






















/**
 * A model instance generator to manage multiple instance from a main model.
 * NEVER USE BY ITSELF, you should always go threw a.model before.
 *
 * @constructor
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model
 * @param functions {Object}                The functions associated to the
 *                                          model
*/
a.modelInstance = function(name, properties, functions) {
    this.modelName  = name || '';
    this.properties = {};
    this.snapshot   = {};
    // List properties originally found in the model
    // by default which cannot be changed by user
    this.originalContent = [];

    // Internal unique id tracer
    this.uid = a.uniqueId();
    this.nid = name + '-' + this.uid;

    if (a.isTrueObject(properties)) {
        this.properties = a.deepClone(properties);
    }

    for (var key in this) {
        this.originalContent.push(key);
    }

    // Applying functions
    if (a.isTrueObject(functions)) {
        for (var key in functions) {
            if(!a.contains(this.originalContent, key)) {
                this[key] = functions[key];
                // We also add it to original content
                this.originalContent.push(key);
            }
        }
    }
};


a.modelInstance.prototype = {
    /**
     * Get a single property value.
     *
     * @method get
     *
     * @param key {String}                  The property key
     * @return {Object}                     The property value or null if not
     *                                      existing
    */
    get: function(key) {
        var p = this.properties[key];
        return p ? p.value : null;
    },

    /**
     * Get a single property type.
     *
     * @method type
     *
     * @param key {String}                  The property key
     * @return {Object}                     The property type found, or null
    */
    type: function(key) {
        var p = this.properties[key];
        if(!p) {
            return 'text';
        }

        if(p.type) {
            return p.type;

        // Now we try to guess
        } else if(p.primary === true) {
            return 'hidden';
        } else if(a.isArray(p.check)) {
            return 'select';
        } else if(p.check) {
            var content = p.check.toLowerCase();
            if(content === 'boolean') {
                return 'checkbox';
            } else if(content === 'number' || content === 'float' || 
                content === 'double' || content === 'integer') {
                return 'number';
            }
            // TODO: add the lastest HTML like date, phone...
        }

        return 'text';
    },

    /**
     * Get the property list stored in the model.
     *
     * @method list
     *
     * @return {Object}                     The property list currently setted
    */
    list: function() {
        var properties = [];
        for(var i in this.properties) {
            properties.push(i);
        }
        return properties;
    },

    /**
     * Set the given property value.
     *
     * @method set
     *
     * @param key {String}                  The property key
     * @param value {Object}                The property value
    */
    set: function(key, value) {
        var property = this.properties[key];

        // If the property is setted, we can use it
        if(property) {
            var check     = property.check,
                apply     = property.apply,
                eventName = property.event,
                pattern   = property.pattern,
                transform = property.transform,
                validate  = property.validate,
                many      = property.many || false,
                old       = property.value;


            // TRANSFORM
            value = a.isFunction(transform) ? transform(value, old) : value;

            // NULLABLE TEST
            if(property['nullable'] === false && a.isNone(value)) {
                return;
            }

            // TODO: one of the solution here is to convert value into
            // an array (except in case of many = true) and then
            // try to check it
            // CHECK TEST - basic typeof test
            // CHECK TEST - model check error (we do allow complex sub type)
            if(a.isString(check)) {

                // Little hack to prevent wrong typeof check
                check = check.toLowerCase();
                if(check === 'integer' || check === 'float'
                    || check === 'double') {
                    check = 'number';
                }

                var instance = value instanceof a.modelInstance;
                if(instance && check !== value.modelName) {
                    return;
                } else if(!instance && check !== typeof(value)) {
                    return;
                }

            // CHECK TEST - array of values
            // Note: don't mix if...
            } else if(a.isArray(check)) {
                if(!a.contains(check, value)) {
                    return;
                }

            // CHECK TEST - key in object
            // Note: don't mix if...
            } else if(a.isTrueObject(check)) {
                if(!a.has(check, value)) {
                    return;
                }
            }

            // PATTERN TEST
            if(!a.isNone(value) && a.isString(pattern) && pattern) {
                if(many === true && a.isArray(value)) {
                    for(var i=0, l=value.length; i<l; ++i) {
                        var reg = new RegExp(pattern, 'g');
                        if(!reg.test(value[i])) {
                            return;
                        }
                    }
                } else {
                    var reg = new RegExp(pattern, 'g');
                    if(!reg.test(value)) {
                        return;
                    }
                }
            }

            // VALIDATE TEST - function
            if(a.isFunction(validate) && validate(value, old) !== true) {
                return;

            // VALIDATE TEST - regex
            } else if(a.isString(validate)
                        && !(new RegExp(validate, 'gi').test(value))) {
                return;
            }

            // We can apply property value now
            property.value = value;

            // If it's possible, we also update the 'direct' value
            if(!a.contains(this.originalContent, key)) {
                this[key] = value;
            }

            // APPLY TEST
            if(a.isFunction(apply)) {
                apply(value, old);
            }

            if(eventName) {
                this.dispatch(eventName, {
                    value: value,
                    old: old
                });
            }
        }
    },

    /**
     * Watch a model property for changes
     *
     * @method watch
     *
     * @param key {String}                  The model key to watch
     * @param fct {Function}                The function to bind
    */
    watch: function(key, fct) {
        if(a.isString(key) && a.isFunction(fct)) {
            a.watch.call(this, this.properties[key].value, fct);
        } else {
            a.console.storm('error', 'a.model.watch', 'Unable to watch the ' +
                'property ```' + key + '``` for model ```' + this.modelName +
                '```', 1);
        }
    },

    /**
     * Unwatch a mdoel property changes
     *
     * @method unwatch
     *
     * @param key {String}                  The model key to stop watching
     * @param fct {Function}                The function to unbind
    */
    unwatch: function(key, fct) {
        if(a.isString(key) && a.isFunction(fct)) {
            a.unwatch.call(this, this.properties[key].value, fct);
        } else {
            a.console.storm('error', 'a.model.unwatch', 'Unable to unwatch ' +
                'the property ```' + key + '``` for model ```' +
                this.modelName + '```', 1);
        }
    },

    /**
     * Check if a given key exist or not in model.
     *
     * @method has
     *
     * @param key {String}                  The key to test
    */
    has: function(key) {
        return key in this.properties;
    },

    /**
     * Clear model (rollback to default values for all properties)
     *
     * @method init
    */
    init: function() {
        for(var property in this.properties) {
            if (this.properties[property].hasOwnProperty('init')) {
                this.properties[property].value =
                        this.properties[property].init;
            } else {
                this.properties[property].value = null;
            }

            // Now we push data into directly the model itself
            if(!a.contains(this.originalContent, property)) {
                this[property] = this.get(property);
            } else {
                a.console.storm('error', 'a.model', 'The model ```' +
                        this.modelName + '``` has the property ```' + key + 
                        '``` which is in conflict with internal model system.'+
                        ' Please change the property name...', 1);
            }
        }

        // Save current setted data
        this.takeSnapshot();

        this.dispatch('init', {});
    },

    /**
     * Get a fresh copy of the model, another instance with same data
     *
     * @method clone
     *
     * @return {a.modelInstance}            A new instance with exactly same
     *                                      data
    */
    clone: function() {
        var data = a.deepClone(this.toObject()),
            instance = a.model.pooler.createInstance(this.modelName);

        instance.fromObject(data);
        return instance;
    },

    /**
     * Convert model to a simple json object like
     *
     * @method toObject
     *
     * @return {Object}                     The result object
    */
    toObject: function() {
        var obj = {};
        for(var property in this.properties) {
            var result = this.get(property);
            if(result instanceof a.modelInstance) {
                obj[property] = result.toObject();
            } else if(a.isArray(result)) {
                var content = [];
                for(var i=0, l=result.length; i<l; ++i) {
                    var element = result[i];
                    if(element instanceof a.modelInstance) {
                        content.push(element.toObject());
                    } else {
                        content.push(element);
                    }
                }
                obj[property] = content;
            } else {
                obj[property] = result;
            }
        }
        return obj;
    },

    /**
     * From a JSON object like, fill this model with element found
     *
     * @method fromObject
     *
     * @param data {Object}                 The input data
    */
    fromObject: function(data) {
        for(var property in this.properties) {
            if(property in data) {
                this.properties[property].value = data[property];
                // If it's possible, we also update the 'direct' value
                if(!a.contains(this.originalContent, property)) {
                    this[property] = data[property];
                }
            }
        }
    },

    /**
     * Convert model to JSON data
     *
     * @method toJSON
     *
     * @return {String}                     The serialized JSON model
    */
    toJSON: function() {
        return a.parser.json.stringify(this.toObject());
    },

    /**
     * From a JSON, fill a JSON instance
     *
     * @method fromJSON
     *
     * @param data {Object}                 The input JSON data
    */
    fromJSON: function(data) {
        if(a.isString(data) && data.length > 0) {
            data = a.parser.json.parse(data);
        }
        this.fromObject(data);
    },

    /**
     * Take a model snapshot.
     *
     * @method takeSnapshot
     *
     * @return {Object}                     The snapshot created
    */
    takeSnapshot: function() {
        this.snapshot = {};
        for(var property in this.properties) {
            this.snapshot[property] = this.get(property);
        }
        return this.getSnapshot();
    },

    /**
     * Get the current stored snapshot.
     *
     * @method getSnapshot
     *
     * @return {Object}                     The snapshot currently stored
    */
    getSnapshot: function() {
        return this.snapshot;
    },

    /**
     * From the latest takeSnapshot used, retrieve the properties value
     * difference.
     * It helps to send to server only modified informations since last
     * snapshot.
     *
     * @method differenceSnapshot
     *
     * @param onlyCurrentValues {Boolean}   By default every properties found
     *                                      got a couple {value/old} object.
     *                                      But sometimes you may prefer to get
     *                                      only the current value and not old
     *                                      one, this parameter is for that.
     *                                      (default: false)
     * @return {Object}                     The difference between old and
     *                                      current model state
    */
    differenceSnapshot: function(onlyCurrentValues) {
        var snapshot   = this.snapshot,
            properties = this.properties,
            difference = {};

        for(var key in snapshot) {
            var snapValue    = snapshot[key],
                currentValue = properties[key].value;

            // Validate on value change, or needed stuff
            if(
                    currentValue !== snapValue
                ||  properties[key].needed === true
            ) {
                if(onlyCurrentValues) {
                    difference[key] = currentValue;
                } else {
                    difference[key] = {
                        value: currentValue,
                        old:   snapValue
                    };
                }
            }
        }

        return difference;
    }
};



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // From a given uid, get the linked model
    a.parameter.addParameterType('model',  function(uid) {
        return a.model.manager.get(uid);
    });

    // This helps to get model uid from a given model
    // The idea behind this is to recieve a model in parameter and lets
    // get the uid for form plugin
    Handlebars.registerHelper('model', function(object) {
        if(a.isString(object) || a.isNumber(object)) {
            return object;
        } else if(a.isTrueObject(object) && object.uid) {
            return object.uid;
        }
        return null;
    });
})();