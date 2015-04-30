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
     * Load the appstorm compact data.
     * Should be called right after application start.
     *
     * @param {Function | Null} callback    Any callback to call after loading.
     *                                      First parameter is error or not,
     *                                      second is html if no error
    */
    load: function (callback) {
        var that = this;

        a.loader.html(this.url, function (content) {
            a.console.storm('log', 'a.compact', 'URL ```' + that.url +
                '``` loaded with success', 3);

            var dom = a.template.htmlToDom(content),
                el  = null;
            for (var i = 0, l = dom.length; i < l; ++i) {
                el = dom[i];
                if (el.tagName === 'SCRIPT') {
                    var type = el.getAttribute('type'),
                        src  = el.getAttribute('data-src'),
                        text = el.text;

                    // We remove "appstorm/" on type
                    a.loader.manuallyAddCache(type.substr(9), src, text);
                }
            }

            if (a.isFunction(callback)) {
                callback(false, content);
            }
        }, function() {
            a.console.storm('error', 'a.compact', 'Unable to load ```' +
                that.url + '```, compact will not be used...', 1);
            that.active = false;
            if (a.isFunction(callback)) {
                callback(true, null);
            }
        });
    }
};