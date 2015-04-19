/* ************************************************************************

    License: MIT Licence

    Description:
        Console functionnality, based on debugger.js, it provides basic
        map surround normal console stuff, including markdown template

************************************************************************ */


/**
 * wrapper for system console, allowing to use console even if there is not console support on given browser.
 * Also, it does provide a trace utility in case of bug/check
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:console">here</a>
 *
 * @class console
 * @static
 * @namespace a
*/
(function(win, a) {
    a.console = new a.debugger('console', true, null);
    a.console.isDirect = true;
})(window, window.appstorm);