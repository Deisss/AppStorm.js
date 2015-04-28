/**
 * Compact is a tiny object used when switching an AppStorm.JS project into
 * production. It aims to load the appstorm.compact.html file with ease and
 * be ready to use it inside every state who need it...
 *
 * @constructor
*/
a.compact = {
    /**
     * The url to load when system needs it.
     *
     * @property url
     * @default ./appstorm.compact.html
    */
    url: './appstorm.compact.html',

    /**
     * If the compact element is active or not.
     *
     * @property active
     * @default false
    */
    active: false,

    /**
     * The content loaded. DO NOT TOUCH.
     *
     * @property content
     * @default null
     * @private
    */
    content: null,

    /**
     * Load the appstorm compact data.
     * Should be called right after application start.
     *
     * @param {Function | Null} callback    Any callback to call after loading.
     *                                      First parameter is error or not,
     *                                      second is html if no error
    */
    load: function (callback) {
        var that = this;
        callback = a.isFunction(callback) ? callback: function() {};

        a.template.get(this.url, {}, function (html) {
            that.content = a.template.htmlToDom(html);
            a.console.storm('log', 'a.compact', 'URL ```' + that.url +
                '``` loaded with success', 3);
            callback(false, html);
        }, function () {
            a.console.storm('error', 'a.compact', 'Unable to load ```' +
                that.url + '```, compact will not be used...', 1);
            that.active = false;
            callback(true, null);
        });
    },

    /**
     * Sanitize an url. Really basic one...
     * FROM: http://jsperf.com/normalize-path
     *
     * @private
    */
    sanitize: function (url) {
        var parts       = url.split('/'),
            directories = [],
            prev;

        for (var i = 0, l = parts.length - 1; i <= l; i++) {
            var directory = parts[i];
      
            // if it's blank, but it's not the first thing, and not the
            // last thing, skip it.
            if (directory === '' && i !== 0 && i !== l) {
                continue;
            }
      
            // if it's a dot, and there was some previous dir already, then
            // skip it.
            if (directory === '.' && typeof prev !== 'undefined') {
                continue;
            }
      
            // if it starts with "", and is a . or .., then skip it.
            if (directories.length === 1 && directories[0] === '' &&
                    (directory === '.' || directory === '..')) {
                continue;
            }
      
            if (directory === '..' && directories.length && prev !== '..' &&
                    prev !== '.' && typeof prev !== 'undefined' &&
                    prev !== '') {
                directories.pop();
                prev = directories.slice(-1)[0]
            } else {
                if (prev === '.') {
                    directories.pop();
                }
                directories.push(directory);
                prev = directory;
            }
        }

        var result = directories.join('/');

        // It may contains a first char '/'
        if (result.length > 0 && result[0] === '/') {
            result = result.substr(1);
        }

        return result;
    },

    /**
     * When a.compact.active is set on true, this function is used to get
     * related content.
     *
     * @param {String} type                 Like CSS, JS, HTML...
     * @param {String} url                  The usual url, as written in
     *                                      a state.
     * @return {String | Null}              The content found or null
    */
    get: function(type, url) {
        if (this.active && this.content !== null) {
            var sanitize = this.sanitize(url),
                element  = null;
            for (var i = 0, l = this.content.length; i < l; ++i) {
                element = this.content[i];
                if (element.tagName === 'SCRIPT' &&
                    element.getAttribute('type') === 'appstorm/' + type &&
                    element.getAttribute('data-src') === sanitize) {
                    return element.innerHTML;
                }
            }
        }
        return null;
    }
};