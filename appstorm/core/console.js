/*! ***********************************************************************

    License: MIT Licence

    Description:
        Console functionnality, based on debugger.js, it provides basic
        map surround normal console stuff, including markdown template

************************************************************************ */


/**
 * Wrapper for system console, allowing to use console even if there is no
 * console support on given browser.
 * Also, it does provide a trace utility in case of bug/check to recover all
 * passed log to it.
 *
 * @constructor
 *
 * @see core/debugger
*/
(function(win, a) {
    a.console = new a.debugger('console', true, null);
    a.console.isDirect = true;
})(window, window.appstorm);