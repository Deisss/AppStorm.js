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
            var sanitize = a.sanitize(url),
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