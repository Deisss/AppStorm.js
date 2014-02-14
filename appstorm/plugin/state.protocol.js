/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        plugin/state.js
    ]

    Events : []

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

    this.add = function(name, isDefault, fct) {
        if(a.isFunction(isDefault)) {
            mem.set(name, {
                isDefault: false,
                fn:        isDefault
            });
        } else {
            mem.set(name, {
                isDefault: isDefault,
                fn:        fct
            });
        }
    };

    /**
     * Remove from store the given protocol
     *
     * @method remove
     *
     * @param name {String}                 The protocol name to delete
    */
    this.remove = mem.remove;

    /**
     * Get from store the given protocol
     *
     * @method get
     *
     * @param name {String}                 The protocol to get
    */
    this.get = mem.get;

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
        var protocols = this.list(),
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

        // Return null if isDefaultFirstName is still empty
        return isDefaultFirstName ? isDefaultFirstName : null;
    };
};


(function() {
    /*
    * Utilisation:
    *  sur un state.add
    *    checker le hashtag, s'il est pas vide et définit, alors:
    *    on l'envoi sur protocol.tester, pour récup le nom
    *    ensuite on get le protocole
    *    enfin on applique la fct du protocol qui va nous donner la bonne url
    */

    a.state.protocol.add('url', true, function() {
        var hash = this.hash;
        if(hash.indexOf('url://')) {
            return hash.substring(6);
        }
        return hash;
    });

    a.state.protocol.add('uri', false, function() {
        /*
         * Va chercher le parent, et renvoi le résultat depuis les parents & co
         * Permet de créer des trucs à la jersey like...
        */

        var hash = this.hash;
        if(hash.indexOf('uri://')) {
            hash = hash.substring(6);
        }

        // Now we search all parents to find the final hashtag
        // TODO: search all parents to get it
    });

    a.state.protocol.add('model', false, function() {
        /*
        * Prend l'url d'un modèle en fonction de son nom
        * Genre model://name:request
        */
    });
})();