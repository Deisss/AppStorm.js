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
    a.modelPooler.set(name, {
        properties: properties,
        requests: requests
    });

    return function() {
        return a.modelPooler.createInstance(name);
    };
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
 * @return {Object}                         The model instance created
*/
a.modelPooler.createInstance = function(name) {
    var instanceType = this.get(name);

    var model = 
        a.extend(
            new a.modelInstance(
                name,
                a.clone(instanceType.properties),
                a.clone(instanceType.requests)
            ),
            new a.eventEmitter('a.model')
        );

    // Resetting model
    model.init();

    // Adding model to modelManager system
    a.modelManager.set(model);

    // Returning freshly created model
    return model;
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
        this.properties = properties;
    }

    if(a.isTrueObject(requests)) {
        this.requests = requests;
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
                    ( property['nullable'] === false && a.isNone(value) )
                ||  ( a.isString(check) && check.toLowerCase() !== typeof(value) )
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
     * Convert model to JSON data
     *
     * @method toJSON
     *
     * @return {Object}                     The serialized JSON model
    */
    toJSON: function() {
        var json = {};
        for(var property in this.properties) {
            json[property] = this.get(property);
        }
        return a.parser.json.stringify(json);
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
        for(var property in this.properties) {
            if(property in data) {
                this.properties[property]['value'] = data[property];
            }
        }
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

    */
    request: function(name) {
        // TODO: here we take the existing request, and create a ready to use
        // object
        var input  = this.requests[name] || {},
            output = {};


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