/**
 * Add two QUnit function: both for doing setup/tearDown only on a specific
 * module and not on global.
*/
(function(w, q) {
    var setup    = {},
        tearDown = {};

    // Bind test start
    q.testStart(function(details) {
        var callback = setup[details.module];

        if(typeof(callback) === 'function') {
            callback.call(q, details);
        }
    });

    // Bind test Done
    q.testDone(function(details) {
        var callback = tearDown[details.module];

        if(typeof(callback) === 'function') {
            callback.call(q, details);
        }
    });

    /**
     * Register a new callback on every test started for the given module
     *
     * @method testModuleStart
     *
     * @param module {String}               The module name to register
     *                                      setup for thoose tests linked to
     * @param callback {Function}           The function to apply on
    */
    w.testModuleStart = function testModuleStart(module, callback) {
        setup[module] = callback;
    };

    /**
     * Register a new callback on every test stopped for the given module.
     *
     * @method testModuleDone
     *
     * @param module {String}               The module name to register
     *                                      tearDown for thoose tests linked to
     * @param callback {Function}           The function to apply on
    */
    w.testModuleDone = function testModuleDone(module, callback) {
        tearDown[module] = callback;
    };
})(window, QUnit);