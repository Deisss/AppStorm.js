/* ************************************************************************

    License: MIT Licence

    Description:
        State type to manage custom system type.

************************************************************************ */

/**
 * State type to manage custom system type.
 *
 * @class type
 * @static
 * @namespace a.state
*/
a.state.type = new function() {
    var mem = a.mem.getInstance('app.state.type');

    /**
     * Add a new type to state system.
     * Type allow you to control how the html will be loaded to system.
     *
     * @method add
     *
     * @param name {String}                 The name to use inside state
     * @param input {Function}              The function to call when name is
     *                                      found on a loading state.
     *                                      The first param given to this
     *                                      function will be entry point
     *                                      (a.dom), then the html, and finally
     *                                      if async the chain object.
     *                                      This is the function to call on
     *                                      input
     * @param output {Function}             The function to call on output
     * @param async {Boolean}               Indicate if the type should be run
     *                                      as an async or not. If the async
     *                                      is set to true, the last parameter
     *                                      will be the chain objet to continue
     *                                      like in default state.
    */
    this.add = function(name, input, output, async) {
        mem.set(name, {
            input:  input,
            output: output,
            async:  async
        });
    };

    /**
     * Remove a type from existing type elements.
     *
     * @method remove
     *
     * @param name {String}                 The type name to remove
    */
    this.remove = function(name) {
        mem.remove(name);
    };

    /**
     * Get a type from existing type list
     *
     * @method get
     *
     * @param name {String}                 The name to get
     * @return {Object | Function | null}   The founded elements
    */
    this.get = function(name) {
        return mem.get(name);
    };

    /**
     * Print the full list of type currently available.
     *
     * @method list
     *
     * @return {Object}                     The list of types found
    */
    this.list = function() {
        return mem.list();
    };
};
