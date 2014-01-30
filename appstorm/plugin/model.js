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
  Avoir un model manager permettant de gérer le binding avec un formulaire.
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
    return function() {
        var model = 
            a.extend(
                new a.modelInstance(
                    name,
                    a.clone(properties),
                    a.clone(requests)
                ),
                new a.eventEmitter('a.model')
            );

        // Resetting model
        model.init();

        // Returning freshly created model
        return model;
    };
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

    if(a.isObject(properties) && !a.isNone(properties)) {
        this.properties = properties;
    }

    if(a.isObject(requests) && !a.isNone(requests)) {
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