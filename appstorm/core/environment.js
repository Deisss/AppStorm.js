/*! ***********************************************************************

    License: MIT Licence

    Description:
        Environment functionnality, to get access to some basic
        'main options' for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some global
 * rules for managing global environment variable. Use the a.mem object
 * for others type of variables.
*/
a.environment = a.mem.getInstance('app.environment');

// Default data

// The application state, debug/production
a.environment.set('app.debug', false);
// The console verbosity (from 1 to 3, 3 most verbose, 1 less verbose)
a.environment.set('console.verbose', 2);
// The console minimum log level (from log to error)
a.environment.set('console.minimum', 'log');
// The ajax cache system
a.environment.set('ajax.cache', false);

// The application url
if(a.isString(a.url) && a.url.length > 0) {
    a.mem.set('app.url', a.url);
}

/*!
------------------------------
  BROWSER HELPERS
------------------------------
*/
(function() {
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Chrome 1+
    var isChrome = !!window.chrome && !isOpera;
    // At least IE6
    var isIE = (document.all && !isChrome && !isOpera && !isSafari && !isFirefox) || !!document.documentMode;

    var browser = 'other';
    if (isOpera) {
        browser = 'opera';
    } else if (isFirefox) {
        browser = 'firefox';
    } else if (isSafari) {
        browser = 'safari';
    } else if (isChrome) {
        browser = 'chrome';
    } else if (isIE) {
        browser = 'ie';
    }

    a.environment.set('browser', browser);
})();

/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('environment', function(value) {
    return new Handlebars.SafeString(a.environment.get(value));
});