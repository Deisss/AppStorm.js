/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manipulate page hash, be able to retrieve also the list of hash
        previously used.

************************************************************************ */


/**
 * Manipulate page hash, be able to retrieve also the list of hash previously
 * used.
*/
a.hash = new function() {
    var previousHash  = null,
        traceHashList = [],
        that          = this,
        store         = a.mem.getInstance('app.hash');

    // The traceHashList is linked to store
    store.set('history', traceHashList);

    /**
     * Retrieve the current system hash.
     *
     * @private
     *
     * @return {String | Null}              The hash, or null if nothing is set
     */
    function getCurrentPageHash() {
        var h = window.location.hash;
        return h ? h.substring(1) : null;
    };


    /**
     * Store the latest event appearing into a store.
     *
     * @private
     *
      @param {String} hash                  The new hash incoming
    */
    function registerNewHash(hash) {
        store.set('current', hash);

        // Store both hash and time used
        traceHashList.push({
            hash: hash,
            time: (new Date()).getTime()
        });

        // Remove exceed hash stored
        while(traceHashList.length > 500) {
            traceHashList.shift();
        }
    };

    /**
     * Check for existing hash, call the callback if there is any change.
     *
     * @private
     */
    function checkAndComputeHashChange(evt) {
        //Extracting hash, or null if there is nothing to extract
        var currentHash = null;

        // Current hash is superseeded by the event one...
        if(evt && evt.originalEvent && evt.originalEvent.newURL) {
            var newUrl = evt.originalEvent.newURL;
            currentHash = newUrl.substring(newUrl.indexOf('#') + 1);
        } else {
            currentHash = getCurrentPageHash();
        }

        if(previousHash != currentHash) {
            registerNewHash(currentHash);
            // Dispatch event
            var eventObject = {
                value: currentHash,
                old:   previousHash
            };
            that.dispatch('change', eventObject);
            a.message.dispatch('a.hash.change', eventObject);
            previousHash = currentHash;
            store.set('previous', previousHash);
        }
    };

    // Initiate the system (when appstorm is ready !)
    a.on('ready', function() {
        checkAndComputeHashChange();
    });

    // The onhashchange exist in IE8 in compatibility mode,
    // but does not work because it is disabled like IE7
    if( ('onhashchange' in window) &&
        (document.documentMode === undefined || document.documentMode > 7)) {
        //Many browser support the onhashchange event, but not all of them
        a.dom.eventListener.bind(window, 'hashchange',
                            checkAndComputeHashChange, null);
    } else {
        //Starting manual function check, if there is no event to attach
        a.timer.add(checkAndComputeHashChange, null, 50);
    }


    /**
     * Fake the hashtag change (can be usefull sometimes), it really apply
     * hash change, but does not change the browser hashtag.
     *
     * @param {String} currentHash          The hash to fake
    */
    this.fake = function(currentHash) {
        if(previousHash != currentHash) {
            registerNewHash(currentHash);
            // Dispatch event
            var eventObject = {
                value: currentHash,
                old:   previousHash
            };
            that.dispatch('change', eventObject);
            a.message.dispatch('a.hash.change', eventObject);
        }
        previousHash = currentHash;
        store.set('previous', previousHash);
    };

    /**
     * Retrieve the current system hash.
     *
     * @return {String | Null}              The hash, or null if nothing is set
     */
    this.getHash = function() {
        return getCurrentPageHash();
    };

    /**
     * Retrieve the current system hash (getHash alias).
     *
     * @return {String | Null}              The hash, or null if nothing is set
    */
    this.get = function() {
        return getCurrentPageHash();
    };

    /**
     * Get the previous page hash (can be null).
     *
     * @return {String | Null}              The hash, or null if nothing is set
    */
    this.getPreviousHash = function() {
        return previousHash;
    };

    /**
     * Force the system to set a specific hash.
     *
     * @param {String} value                The hash to set
     */
    this.setPreviousHash = function(value) {
        previousHash = value;
        store.set('previous', previousHash);
    };

    /**
     * Get list of existing previous hash used into system.
     *
     * @return {Array}                      An array with all hash
     *                                      done since beginning
    */
    this.trace = function() {
        return traceHashList;
    };
};

// Erasing previous a.hash and add event system to it
a.hash = a.extend(a.hash, new a.eventEmitter('a.hash'));