/**
 * Helper for unit test above QUnit
 *
 * @class QAppStorm
*/
var QAppStorm = {
    // The current used element
    _current: null,

    // The next element to pop...
    _next: null,

    _tail: [],

    /**
     * Clear QAppStorm
     *
     * @method clear
    */
    clear: function() {
        this._current = null;
        this._next = null;
        this._tail = [];
    },

    /**
     * Check if system can go to next level or not
     *
     * @method isReady
     *
     * @return {Boolean}                    True if system is ready to jump
     *                                      to next unit test or not
    */
    isReady: function() {
        if(this._current) {
            return (this._current.expect === 0);
        } else {
            return true;
        }
    },

    /**
     * An error occurs as the system is below 0...
     *
     * @method isError
     *
     * @return {Boolean}                    True if the system still have some
     *                                      elements to run or not...
    */
    isError: function() {
        if(this._current) {
            return (this._current.expect < 0);
        } else {
            return false;
        }
    },

    /**
     * Chain every hashtag the test need to follow to run this test
     *
     * @method chain
    */
    chain: function() {
        var args = arguments;
        for(var i=0, l=args.length; i<l; ++i) {
            var hash = args[i];
            this._tail.push(hash);
        }

        if(this._tail.length > 0) {
            var last = this._tail[this._tail.length - 1];

            // It's different, we add the lasted hash
            if(typeof(last.hash) !== 'undefined' && last.hash !== null || last.hash !== '') {
                this._tail.push({
                    hash: '',
                    expect: 0,
                    // The default callback is to go to next unit test by default...
                    callback: function(chain) {
                        setTimeout(function() {
                            try {
                                QUnit.start();
                            } catch(e) {
                                console.error(e);
                            }
                            chain.next();
                        }, 100);
                    }
                });
            }
        }

        if(this.isReady() && !this.isError()) {
            this.next();
        }
    },

    /**
     * Going to next element into the chain
     *
     * @method next
    */
    next: function() {
        // Already a next element pushed
        if(this._next) {
            return;
        }

        var next = this._tail.shift(),
            previous = this._current;

        if(next) {
            this._next = next;
        }

        // If system got a callback to apply...
        var callback = null;
        if(previous && previous.callback) {
            callback = previous.callback;
            // We remove the callback to not have it called again
            previous.callback = null;
        }

        if(typeof(callback) !== 'function') {
            callback = function(chain) {
                chain.next();
            }
        }

        var that = this;
        callback.call(null, {
            next: function() {
                // May be undefined
                that._current = null;
                that._next = null;
                if(next) {
                    that._current = next;

                    if(!that._current.hash) {
                        window.location.href = '#';
                    } else {
                        window.location.href = '#' + that._current.hash;
                    }
                }
            },
            error: function() {
                alert('An error occurs... Excpect is negative...');
                console.error('An error occurs... Expect is negative...');
                console.error(that._current);
                console.error(that._tail);
                that.clear();
            }
        });
    },

    /**
     * Remove to the current counter one test to do...
     *
     * @method pop
    */
    pop: function() {
        if(this._current) {
            if(this._current.expect <= 0) {
                console.error('Error pop got negative result');
                console.error(this._current.hash);
                console.error(this._current.expect);
                var trace = a.getStackTrace();
                console.error(trace);
            }
            this._current.expect--;
        }

        if(this.isReady() && !this.isError()) {
            this.next();
        }
    }
};


// This timer is here to prevent a bug which may easily occurs:
// if the system setup an element with expect = 0 (typically the unit test
// release is one of them), the system will never raise "pop" function
// This is here to prevent this bug, by automatically apply and remove
// it from queue, even if no pop appears (as it should never appear...).
setInterval(function() {
    if(QAppStorm.isReady() && !QAppStorm.isError()) {
        QAppStorm.next();
    }
}, 200);

/*
// Add the custon functions for handling custom raise
(function(w) {
    var availableAsserts = ['deepEqual', 'equal', 'notDeepEqual', 'notEqual', 'notPropEqual', 'notStrictEqual', 'ok', 'propEqual', 'strictEqual', 'throws'];

    // We add to window object the following tests
    for(var i=0, l=availableAsserts.length; i<l; ++i) {
        var ast = availableAsserts[i],
            yup = ast.charAt(0).toUpperCase() + ast.slice(1),
            // Will create the following functions: qAppStormDeepEqual, aDeepEqual, stateDeepEqual...
            // Recommended to use: QAppStormDeepEqual, even if it's long, it's the best one...
            finals = ['QAppStorm' + yup, 'a' + yup];

        for(var j=0, k=finals.length; j<k; ++j) {
            (function(w, name, replacement) {
                w[replacement] = function() {
                    var args = a.toArray(arguments);

                    // Getting the assert scope
                    var assert = args.pop();

                    // Launching pop
                    QAppStorm.pop();

                    var original = assert[w[name]];
                    original.apply(this, arguments);
                };
            })(w, ast, finals[j]);
        }
    }
})(window);
*/