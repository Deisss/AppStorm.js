/* ************************************************************************

    License: MIT Licence

    Dependencies: [
        a.js
        core/mem.js
    ]

    Events: [
    ]

    Description:
        Environment functionnality, to get access to some basic
        'main options' for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some global
 * rules for managing global environment variable
 *
 * Examples:
 *     <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:environment">here</a>
 *
 * @class environment
 * @static
 * @namespace a
*/
a.environment = a.mem.getInstance('app.environment');

// Default data
a.environment.set('verbose', 2);
a.environment.set('console', 'log');