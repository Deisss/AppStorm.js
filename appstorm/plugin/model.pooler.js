/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model storage system, and keep a trace of model created
        (threw a.model.manager)

************************************************************************ */

/**
 * A model pooler aims to create a storage space to keep every model type
 * existing.
 *
 * @class pooler
 * @namespace a.model
 * @constructor
*/
a.model.pooler = a.mem.getInstance('app.model.type');

/**
 * Simple function to generate new instance from a base
 *
 * @method createInstance
 *
 * @param name {String}                     The model type we want to create
 * @return {Object | null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.model.pooler.createInstance = function(name) {
    var model = this.createTemporaryInstance(name);

    if(!a.isNull(model)) {
        // Adding model to manager system
        a.model.manager.set(model);
    }

    return model;
};


/**
 * Simple function to generate new instance from a base. This instance is not
 * stored into a.model.manager.
 * NOTE: this function should not be used, please use createInstance instead.
 *
 * @method createInstance
 *
 * @param name {String}                     The model type we want to create
 * @return {Object | null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.model.pooler.createTemporaryInstance = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var model = a.extend(
            new a.modelInstance(
                name,
                a.clone(instanceType.properties)
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
a.model.pooler.searchInstance = function(query) {
    var name = query.modelName || query.model || query.name || null;

    // Faster search
    var models;
    if(name && a.isString(name)) {
        models = a.model.manager.getByName(name);
    } else {
        var list = a.model.manager.list(),
            models = [];
        a.each(list, function(element) {
            models.push(element);
        });
    }

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
            if(!a.isTrueObject(value) && model.get(key) !== value) {
                models.splice(i, 1);
            // The value is an object itself, we should check deeper inside
            } else if(a.isTrueObject(value)) {

            }
        }
    }

    return models;
};


/**
 * Search primary keys inside a model, to be able to perform a search
 * after.
 *
 * @method getPrimary
 *
 * @param name {String}                     The model name to get related
 *                                          primary
 * @return {Array | null}                   Array if it has been found, null
 *                                          if there is any problem
*/
a.model.pooler.getPrimary = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var properties = instanceType.properties,
        results = [];

    for(var key in properties) {
        var property = properties[key];
        if(('primary' in property) && property['primary'] === true) {
            results.push(key);
        }
    }

    return results;
};


/**
 * Delete an existing instance.
 *
 * @method deleteInstance
 *
 * @param instance {Object}                 The instance to delete
*/
a.model.pooler.deleteInstance = function(instance) {
    if(a.isTrueObject(instance) && instance.uid) {
        a.model.manager.remove(instance.uid);
    }
};

