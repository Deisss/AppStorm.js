/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/message.js
    ]

    Events : [
        init: {}
    ]

    Description:
        Provide a model based system to create and manage models threw
        application lifetime

************************************************************************ */

/*
TODO:
  Check doit pouvoir accepter un tableau

  Accepter un pattern comme validation d'un élément du model
*/


/*
 * Property available element :
 *   - nullable {Boolean}   if the property can be set to null or not
 *   - init {Mixed}         the initial value
 *   - needed {Boolean}     Indicate if the property should ALWAYS be
 *                          included when performing a save to server
 *   - check {String}       the typeof check (like String, Object, ...)
 *   - pattern {String}     the regex pattern to check
 *   - validate {Function}  the function to use for validate input.
 *                          Must return true and false value to validate or not
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
 * @param requests {Object}                 The server side associated requests
 *                                          to manipulate the model, save it...
*/
a.model = function(name, properties, requests) {
    // Only allow new name (already existing name just give already existing
    // model definition)
    if(a.isString(name)) {
        if(!a.modelPooler.get(name)) {
            a.modelPooler.set(name, {
                properties: properties,
                requests: requests
            });

            // We return a function embed to create new instance
            // from variable
            return function() {
                return a.modelPooler.createInstance(name);
            };
        } else {
            // We directly create a new model
            return a.modelPooler.createInstance(name);
        }

    // Name is a search query system
    } else if(a.isTrueObject(name)) {
        return a.modelPooler.searchInstance(name);
    }
};










/**
 * A model manager helps to keep a trace of every model currently used by the
 * application.
 *
 * @class modelManager
 * @namespace a
 * @constructor
*/
a.modelManager = {
    /**
     * Store a pointer to every instance of every model created.
     * @property _store
     * @type Object
     * @default {}
    */
    _store: a.mem.getInstance('app.model.instance'),

    /**
     * Store a new model into the modelManager.
     *
     * @method set
     *
     * @param model {Object}                The new model to store
    */
    set: function(model) {
        this._store.set(model.uid, model);
    },

    /**
     * Get a model from it's uid (the unique id is automatically generated
     * for every model, it's available threw myModelInstance.uid)
     *
     * @method get
     *
     * @param uid {Integer}                 The unique id to search related
     *                                      model from
     * @return {Object | null}              The related model found, or null if
     *                                      nothing is found
    */
    get: function(uid) {
        return this._store.get(uid);
    },

    /**
     * Remove a model from store.
     *
     * @method remove
     *
     * @param uid {Integer}                 The uid to remove
    */
    remove: function(uid) {
        this._store.remove(uid);
    },

    /**
     * Remove all existing model from store
     *
     * @method clear
    */
    clear: function() {
        this._store.clear();
    },

    /**
     * Get all models related to a given namespace. For example, if you create
     * a.model('user'), this function helps to find all *user* model created.
     *
     * @method getByName
     *
     * @param name {String}                 The model name to find
     * @return {Array}                      The array with all model instance
     *                                      related to this name
    */
    getByName: function(name) {
        if(!name || !a.isString(name)) {
            return [];
        }

        var result = [];

        a.each(this._store.list(), function(element) {
            if(element.name === name) {
                result.push(element);
            }
        });

        return result;
    }
};











/**
 * A model pooler aims to create a storage space to keep every model type
 * existing.
 *
 * @class modelPooler
 * @namespace a
 * @constructor
*/
a.modelPooler = a.mem.getInstance('app.model.type');

/**
 * Simple function to generate new instance from a base
 *
 * @method createInstance
 *
 * @param name {String}                     The model type we want to create
 * @return {Object | null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.modelPooler.createInstance = function createInstance(name) {
    var model = this.createTemporaryInstance(name);

    if(!a.isNull(model)) {
        // Adding model to modelManager system
        a.modelManager.set(model);
    }

    return model;
};


/**
 * Simple function to generate new instance from a base. This instance is not
 * stored into a.modelManager.
 * NOTE: this function should not be used, please use createInstance instead.
 *
 * @method createInstance
 *
 * @param name {String}                     The model type we want to create
 * @return {Object | null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.modelPooler.createTemporaryInstance =
                                    function createTemporaryInstance(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var model = a.extend(
            new a.modelInstance(
                name,
                a.clone(instanceType.properties),
                a.clone(instanceType.requests)
            ),
            new a.eventEmitter('a.model')
        );

    // Resetting model
    model.init();

    // Returning freshly created model
    return model;
};

/**
 * From a given query, get back the existing stored model
 *
 * @method searchInstance
 *
 * @param query {Object}                    The query to search inside
 * @return {a.modelInstance | null}         The single instance found,
 *                                          or a list of instances, or null
*/
a.modelPooler.searchInstance = function searchInstance(query) {
    var models = a.modelManager.getByName(query.modelName || query.model ||
                                          query.name);

    // We remove the first searched element
    if(query.modelName) {
        delete query.modelName;
    } else if(query.model) {
        delete query.model;
    } else if(query.name) {
        delete query.name;
    }

    for(var key in query) {
        var value = query[key],
            i = models.length;

        while(i--) {
            var model = models[i];
            // The model is not related to searched value
            if(model.get(key) !== value) {
                models.splice(i, 1);
            }
        }
    }

    if(models.length == 0) {
        return null;
    } else if(models.length == 1) {
        return models[0];
    }
    return models;
};


/**
 * Delete an existing instance.
 *
 * @method deleteInstance
 *
 * @param instance {Object}                 The instance to delete
*/
a.modelPooler.deleteInstance = function(instance) {
    if(a.isTrueObject(instance) && instance.uid) {
        a.modelManager.remove(instance.uid);
    }
};
















/**
 * A model instance generator to manage multiple instance from a main model.
 * NEVER USE BY ITSELF, you should always go threw a.model before.
 *
 * @class modelInstance
 * @namespace a
 * @constructor
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model.
 * @param requests {Object}                 The server side associated requests
 *                                          to manipulate the model, save it...
*/
a.modelInstance = function(name, properties, requests) {
    this.name = name || '';
    this.properties = {};
    this.snapshot   = {};
    this.requests   = {};

    // Internal unique id tracer
    this.uid        = a.uniqueId();
    this.nid        = name + '-' + this.uid;

    if(a.isTrueObject(properties)) {
        this.properties = a.deepClone(properties);
    }

    if(a.isTrueObject(requests)) {
        this.requests = a.deepClone(requests);
    }
}


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
        return p ? p['value'] : null;
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
            var check     = property['check'],
                apply     = property['apply'],
                eventName = property['event'],
                transform = property['transform'],
                validate  = property['validate'],
                old       = property['value'];

            // TRANSFORM
            value = a.isFunction(transform) ? transform(value, old) : value;

            // NULLABLE TEST || CHECK TEST || VALIDATE TEST
            if(
                // Detect null not allowed
                    ( property['nullable'] === false && a.isNone(value) )
                ||  
                    (
                        // Detect basic element type (string, boolean, ...) check error
                           ( a.isString(check) && check.toLowerCase() !== typeof(value) )
                        // Detect model check error (we do allow complex type)
                        && (value instanceof a.modelInstance && check !== value.name)
                    )
                // Detect function validate error
                ||  (a.isFunction(validate) && validate(value, old) !== true)
            ) {
                return;
            }

            // We can apply property value now
            property['value'] = value;

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
            this.properties[property]['value'] = 
                    this.properties[property]['init'] || null;
        }

        // Save current setted data
        this.takeSnapshot();

        this.dispatch('init', {});
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
            obj[property] = this.get(property);
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
                this.properties[property]['value'] = data[property];
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
                currentValue = properties[key]['value'];

            // Validate on value change, or needed stuff
            if(
                    currentValue !== snapValue
                ||  properties[key]['needed'] === true
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
    },

    /**
     * Get one of the associated model request.
     *
     * @param request
     *
     * @param name {String}                 The request name to get
    */
    request: function(name) {
        // TODO: here we take the existing request, and create a ready to use
        // object
        var input  = this.requests[name] || {},
            output = {type: 'json'};

        output.method = input.method;
        output.url    = input.url;

        return output;
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
        return a.modelManager.get(uid);
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