/* ************************************************************************

    License: MIT Licence

    Description:
        State protocol management, allow to define custom hashtag response/
        treatment

************************************************************************ */

/**
 * State protocol management, allow to define custom hashtag response/
 * treatment
 *
 * @class protocol
 * @static
 * @namespace a.state
*/
a.state.protocol = new function() {
    var mem = a.mem.getInstance('app.state.protocol');

    /**
     * Add a new function as protocol available one.
     *
     * @method add
     *
     * @param name {String}                 The protocol name, like uri will
     *                                      produce uri:// protocol into your
     *                                      state
     * @param fct {Function}                The function to use when such a
     *                                      protocol is found
     * @param isDefault {Boolean | null}    If it's the default (no need to 
     *                                      set uri:// in front) or not.
     *                                      Note: only one default can be set
     *                                      And it's by default url (already
     *                                      setted)
    */
    this.add = function(name, fct, isDefault) {
        isDefault = (isDefault === true) ? true : false;

        mem.set(name, {
            isDefault: isDefault,
            fn:        fct
        });
    };

    /**
     * Remove from store the given protocol
     *
     * @method remove
     *
     * @param name {String}                 The protocol name to delete
    */
    this.remove = function(name) {
        mem.remove(name);
    };

    /**
     * Get from store the given protocol
     *
     * @method get
     *
     * @param name {String}                 The protocol to get
    */
    this.get = function(name) {
        return mem.get(name);
    };

    /**
     * Test the given hash and found the related protocol
     *
     * @method tester
     *
     * @param hash {String}                 The hashtag to test
     * @return {String}                     The name of the protocol found who
     *                                      fit to the hashtag. You can then
     *                                      use that name to get the full
     *                                      protocol function using get of this
     *                                      object
    */
    this.tester = function(hash) {
        if(a.isNone(hash)) {
            return null;
        }

        var protocols = mem.list(),
            isDefaultFirstName = null;

        for(var name in protocols) {
            // This is the protocol we were searching for
            if(hash.indexOf(name) === 0) {
                return name;

            // This is not the protocol, but at least the first one
            // who is default behavior
            } else if(a.isNull(isDefaultFirstName)
                        && protocols[name].isDefault) {

                isDefaultFirstName = name;
            }
        }

        // If we got a prototype of request 'like uri://', but the selected
        // name is not ok, we send back null instead
        var type = /^([a-zA-Z0-9\-\_]*):\/\//i,
            res  = type.exec(hash);

        // We found a typed prototype
        if(res && res[1] !== isDefaultFirstName) {
            return null;
        }

        return isDefaultFirstName;
    };
};


(function() {
    // Define the most basic case, using direct hashtag
    a.state.protocol.add('url', function(state, index) {
        var hash = (a.isArray(state.hash)) ? state.hash[index]: null;
        if(hash && hash.indexOf('url://') === 0) {
            return hash.substring(6);
        }
        return hash;
    }, true);

    // Define a parent related url where you get use of parent to define
    // the given hashtag final url...
    a.state.protocol.add('uri', function(state, index) {
        var hash = (a.isArray(state.hash)) ? state.hash[index]: '';
        if(hash && hash.indexOf('uri://') === 0) {
            hash = hash.substring(6);
        }

        var search = state.parent;

        while(!a.isNone(search)) {
            // Search is defined, we use it !
            if(search.hash) {
                var found = false;
                for(var i=0, l=search.hash.length; i<l; ++i) {
                    var parentType = a.state.protocol.tester(search.hash[i]);

                    // Parent type is defined, we extract data from
                    if(!a.isNull(parentType)) {
                        var type = a.state.protocol.get(parentType),
                            result = type.fn(search, i);

                        hash = result + '/' + hash;

                        // In any case, we stop as calling type.fn will already
                        // do parents of parents...
                        found = true;
                        break;
                    }
                }

                // Double exit
                if(found) {
                    break;
                }
            }

            // Still no hash to show, we continue...
            search = search.parent;
        }

        return hash;
    }, false);
})();