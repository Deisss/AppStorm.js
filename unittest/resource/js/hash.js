/**
 * When the given hashtag will appear, call this callback with given ms waiting
 *
 * @method chain
 *
 * @param hashtag {String}                  The hashtag to wait
 * @param callback {Function}               The callback to apply when hashtag
 *                                          is found
 * @param ms {Integer | null}               The time to wait (can be null)
*/
var chain = function chain(hashtag, callback, ms) {
    var inner = function() {
        // We stop if the current hashtag is not the one we wanted...
        if(a.hash.getHash() != hashtag) {
            return;
        }

        a.hash.unbind('change', inner);
        if(ms && ms > 0) {
            setTimeout(callback, ms);
        } else {
            callback();
        }
    };
    a.hash.bind('change', inner);
};

/**
 * Change the page hashtag
 *
 * @method hashtag
 *
 * @param uri {String}                      The new hashtag to set
*/
function hashtag(uri) {
    window.location.href = '#' + uri;
};