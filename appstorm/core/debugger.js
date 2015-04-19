/*! ***********************************************************************

    License: MIT Licence

    Description:
        Debugger functionnality including nested group system like console
        usually provide

************************************************************************ */

(function (win, a) {
    'use strict';

    /**
     * Test if browser support or not the CSS in console.
     *
     * @private
     *
     * @param {String} browser              The browser name (firefox, ...)
     * @return                              True it does support, false it
     *                                      does not support...
    */
    function testBrowserSupportCSS(browser) {
        // TODO: Maybe too simple test...
        // IE does not support it...
        return (browser === 'opera' || browser === 'firefox' ||
                browser === 'chrome');
    }

    // We can have only one element printing at a time.
    // This variable is a kind of lock for this.
    var concurrentConsoleAccess = false,
        browser = a.environment.get('browser'),
        cssSupport = testBrowserSupportCSS(browser),
        // Used only when system does not support groupCollapsed/group system
        // in console
        indent = 0;

    if (win.console) {
        if (!a.isFunction(win.console.groupCollapsed)) {
            win.console.groupCollapsed = function() {
                win.console.log(arguments);
                indent += 1;
            }
        }

        if (!a.isFunction(win.console.group)) {
            win.console.group = function() {
                win.console.log(arguments);
                indent += 1;
            }
        }

        if (!a.isFunction(win.console.groupEnd)) {
            win.console.groupEnd = function() {
                indent -= 1;
            }
        }
    }

    /*!
     * Regex used for markdown parsing.
     *
     * Strongly inspired by: https://github.com/adamschwartz/log
     * All credit goes to him !!!!!
    */
    var formats = [{
        regex: /\*\*([^\*]+)\*\*/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['font-weight: bold', ''];
         }
    }, {
        regex: /\_\_([^\_]+)\_\_/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['font-style: italic', ''];
        }
    }, {
        regex: /\`\`\`([^\`]+)\`\`\`/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)', ''];
        }
    }, {
        regex: /\[c\=(?:\"|\')?((?:(?!(?:\"|\')\]).)*)(?:\"|\')?\]((?:(?!\[c\]).)*)\[c\]/,
        replacer: function(m, p1, p2) {
            return cssSupport ? '%c' + p2 + '%c' : p2;
        },
        styles: function(match) {
            return [match[1], ''];
        }
    }];


    /**
     * Detect if there is some markdown to parse...
     * @see https://github.com/adamschwartz/log
     *
     * @private
     *
     * @param {String} str                  The string to search markdown in
     * @return {Boolean}                    True, markdown exist, false not.
    */
    function hasMarkdownMatches(str) {
        var has = false;

        for (var i = 0, l = formats.length; i < l && !has; ++i) {
            if (formats[i].regex.test(str)) {
                has = true;
            }
        }

        return has;
    };

    /**
     * Get ordered matches for every markdown existing.
     * @see https://github.com/adamschwartz/log
     *
     * @private
     *
     * @param {String} str                  The string to markdown
     * @return {Array}                      The matches found
    */
    function getOrderedMarkdownMatches(str) {
        var matches = [];

        // Testing
        a.each(formats, function(format) {
            var match = str.match(format.regex);
            if (match) {
                matches.push({
                    format: format,
                    match: match
                });
            }
        });


        // Sorting
        matches = a.sortBy(matches, function(entry) {
            return entry.match.index;
        });

        return matches;
    }

    /**
     * Parse the value and replace it by correct CSS rules.
     *
     * @private
     *
     * @param {String} str                  The value to modify it's markdown
     * @return {Array}                      The value with CSS replaced as an
    */
    function markdown(str) {
        if (!a.isString(str)) {
            return [str];
        }

        var first, matches, styles;
        styles = [];
        while (hasMarkdownMatches(str)) {
            matches = getOrderedMarkdownMatches(str);
            first = matches[0];
            str = str.replace(first.format.regex, first.format.replacer);
            styles = styles.concat(first.format.styles(first.match));
        }

        // Correcting the indent if the group system
        // does not exist
        if (indent > 0) {
            for (var i = 0, l = indent.length; i < l; ++i) {
                str = '  ' + str;
            }
        }

        if (cssSupport) {
            return [str].concat(styles);
        } else {
            return [str];
        }
    }

    /**
     * Test the minimum type for a given log.
     * Like we can test the 'log' can be printed or not according
     * to current verbose parameter configured in a.environment.
     *
     * @private
     *
     * @param currentType {String}          The level to test
     * @return {Boolean}                    True the minimum level is OK for
     *                                      current test, false the minimum
     *                                      level is too high for current test.
    */
    function testMinimumType(currentType) {
        var minimumType = a.environment.get('console.minimum');
        switch (minimumType) {
        case 'error':
            if (currentType !== 'error') {
                return false;
            }
            break;
        case 'warning':
        case 'warn':
            if (currentType !== 'warn' &&
                    currentType !== 'warning' &&
                    currentType !== 'error') {
                return false;
            }
            break;
        case 'info':
            if (currentType === 'log') {
                return false;
            }
            break;
        default:
            break;
        }
        return true;
    }

    /**
     * Test the minimum allowed verbose level.
     *
     * @private
     *
     * @param currentSource {String}        The source (may change the verbose)
     * @param currentVerbose {Integer}      The verbose level to test
     * @return {Boolean}                    The verbose level is allowed for
     *                                      the current configured verbose
    */
    function testMinimumVerbose(currentSource, currentVerbose) {
        var cv = 'console.verbose',
            minimumGlobalVerbose = a.environment.get(cv),
            minimumSourceVerbose = a.environment.get(cv + '-' +
                currentSource);

        if (minimumGlobalVerbose === null && minimumSourceVerbose === null) {
            return true;
        }

        // This part can override the default verbose level.
        if (currentSource && minimumSourceVerbose !== null) {
            return currentVerbose <= minimumSourceVerbose;
        }

        return currentVerbose <= minimumGlobalVerbose;
    }

    /**
     * Print a single log on console (if console is available).
     *
     * @private
     *
     * @param entry {Object}                The log to print on console
    */
    function output(entry) {
        // We can't print anything if the console does not exist...
        if (a.isNone(win.console) || !a.isFunction(win.console.log)) {
            return;
        }

        // This does not work for printing groups
        if (entry.type === 'group') {
            return;
        }

        var cs = win.console[entry.type],
            source = entry.source;

        // Rollback to log if user is accessing something not existing
        // like 'table' may be in this category on some browser...
        if (a.isNone(cs)) {
            cs = win.console['log'];
        }

        // Test if the log is allowed to be printed or not
        if (testMinimumType(entry.type) &&
                testMinimumVerbose(source, entry.verbose)) {

            // This is the most common case
            // In this particular case, we can do many things...
            if (entry.args.length === 1) {
                // We try to call the console with the markdown style...
                cs.apply(win.console, markdown(entry.args[0]));

            // In this case we can't really do something...
            } else {
                cs.apply(win.console, entry.args);
            }
        }
    }

    /**
     * Generate from the type, source and value the related storm printing.
     *
     * @private
     *
     * @param {String} type                 The type (log, warn, error,...)
     * @param {String} source               The source (the function/object
     *                                      name)
     * @param {String} value                The usual log.
     * @return {String}                     The markdown version for all
     *                                      AppStorm.JS messages
    */
    function storm(type, source, value) {
        // Content got one empty string at beginning to insert
        // %c with join at the beginning of string
        var content = '',
            white = 'color:white;',
            padding = (browser === 'firefox') ? 'padding:3px;' :
                    'padding:1px;';

        switch (type) {
        case 'log':
            content += '[c="' + padding + 'background:#2d89ef;' + white +
                    '"]   LOG   [c]';
            break;
        case 'info':
            content += '[c="' + padding + 'background:#00a300;' + white +
                    '"]  INFO.  [c]';
            break;
        case 'warn':
        case 'warning':
            content += '[c="' + padding + 'background:#ffc40d;' + white +
                    '"]  WARN.  [c]';
            break;
        case 'error':
            content += '[c="' + padding + 'background:#ee1111;' + white +
                    '"]  ERROR  [c]';
            break;
        }

        if (source) {
            content += '[c="' + padding + 'background:#666;' + white + '"]  ' +
                    source + '  [c]';
        }

        content += '[c="background:inherits;color:inherits;"] [c]' + value;

        return content;
    }

    /**
     * Register a new log.
     *=
     * @private
     *
     * @param type {String}                 The log type (log, warn, info...)
     * @param args {Object}                 The log data
    */
    function register(type, args) {
        // If nothing is set, the verbose level is consider as
        // critical - must be printed
        var verbose = 1,
            source = '';

        if (args.length > 0 && a.isTrueObject(args[0]) &&
                args[0]['storm'] === true) {
            verbose = parseInt(args[0].verbose, 10);
            source = args[0].source;

            // In the storm case, we create specific rendering
            var textMarkdown = storm(type, source, args[0].value);

            // The first element is the log, others are CSS
            args = [textMarkdown];
        }

        // Creating the data structure
        var data = {
            type: type,
            verbose: verbose,
            source: source,
            args: args
        };

        this.logs.push(data);

        // We clear if there is too much logs
        while(this.logs.length > 2000) {
            this.logs.shift();
        }

        // On direct case we print it
        if (this.isDirect) {
            output(data);
        }
    }

    /*
     * Debugger is a wrapper around window.console to provide a more
     * structured way to access and use group system provided by console.
    */
    a.debugger = function (name, collapsed, parent) {
        this.name = name;
        this.collapsed = collapsed || false;
        this.parent = parent || null;
        this.logs = [];
        this.isDirect = true;
    };

    a.debugger.prototype = {
        /**
         * Create a group inside this debugger.
         *
         * @param {String} name                 The new sub group name
         * @param {Boolean | Null} collapsed    If we should collapse or not when
         *                                      printing to console
         * @return {a.debugger}                 The debugger associated or null
         *                                      value if group is not allowed
        */
        group: function (name, collapsed) {
            // In direct mode there is no group support
            if (this.isDirect) {
                return null;
            }
            var root = new a.debugger(name, collapsed, this);
            this.logs.push({
                type: 'group',
                args: root
            });
            return root;
        },

        /**
         * Render the group and all sub groups into console.
        */
        print: function () {
            // In direct mode there is no print support
            if (this.isDirect) {
                return;
            }
            // Somebody is already using it... We have to wait a while
            if (this.parent === null && concurrentConsoleAccess === true) {
                setTimeout(this.print, 50);
                return;
            }

            var cs = win.console;

            // The root (the original one), lock the console
            // to not pollute with other eventual print
            if (this.parent === null) {
                concurrentConsoleAccess = true;
            }

            // Starting groups
            if (this.collapsed === true) {
                cs.groupCollapsed(this.name);
            } else {
                cs.group(this.name);
            }

            // Loggings
            a.each(this.logs, function(log) {
                if (log.type === 'group') {
                    var group = log.args;
                    group.print();
                }else {
                    output(log);
                }
            });

            // Ending group
            cs.groupEnd();

            if (this.parent == null) {
                concurrentConsoleAccess = false;
            }
        },

        /**
         * Print into console as a table.
         *
         * @param {Object} any              Anything to send to console
        */
        table: function() {
            register.call(this, 'table',
                    Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into console.
         *
         * @param {Object} any              Anything to send to console
        */
        log: function() {
            register.call(this, 'log', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into console.
         *
         * @param {Object} any              Anything to send to console
        */
        warn: function() {
            register.call(this, 'warn', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into info.
         *
         * @param {Object} any              Anything to send to console
        */
        info: function() {
            register.call(this, 'info', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into error.
         *
         * @param {Object} any              Anything to send to console
        */
        error: function() {
            register.call(this, 'error',
                    Array.prototype.slice.call(arguments));
        },

        /**
         * Specific AppStorm.JS debug element, allowing to print
         * nice message on the console.
         *
         * @param {String} level            The level like log, info, error...
         * @param {String} source           The object source raising this
         *                                  log
         * @param {String} log              The log message
         * @param {Integer} verbose         The verbose (1, 2, 3)
        */
        storm: function(level, source, log, verbose) {
            register.call(this, level, [{
                storm: true,
                source: source || '',
                verbose: verbose || 1,
                value: log || ''
            }]);
        },

        /**
         * Get the current trace stored into debugger.
         *
         * @param {String | Null} type      The type like log, info... If null,
         *                                  We get all trace...
         * @return {Array}                  The tracelog currently stored
        */
        trace: function(type) {
            if (a.isString(type)) {
                return a.filter(this.logs, function(el) {
                    return el.type === type;
                });
            }
            return this.logs;
        },

        /**
         * Clear the debugger.
        */
        clear: function() {
            this.logs = [];
        }
    };
})(window, window.appstorm);