/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/parser.js
        core/message.js
    ]

    Events : [
        a.ajax : {
            success : boolean (true fine, false error)
            status : http code result
            url : the url used (before data join)
            method : the method used
            params : the parameters used for request
        }
    ]

    Description:
        Send a request to server side

************************************************************************ */


/**
 * Ajax object to call server
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:ajax">here</a>
 *
 * @class ajax
 * @namespace a
 * @constructor
 * @async
 *
 * @param options {Object}                  An option map to change
 *                                          the behaviour of component
 * @param success {Function}                The success function called
 *                                          in case of async
 * @param error {Function}                  The error function called in
 *                                          case of async
*/
a.ajax = function(options, success, error) {
    'use strict';

    var dp = a.getDefaultAjaxOptions();

    this.params = {
        url    : '',      // Allowed type : any URL
        method : 'GET',   // Allowed type : "GET", "POST"
        type   : 'raw',   // Allowed type : raw, json, xml
        async  : true,    // Allowed type : true, false
        cache  : false,   // Allowed type : true, false
        data   : {},      // Allowed type : any kind of object | key => value
        header : {}       // Allowed type : any kind of object | key => value
    };

    // Binding options
    for(var p in this.params) {
        if(p === 'data' || p === 'header') {
            continue;
        }
        // We check given options are same type (from specific request)
        if(p in dp && typeof(dp[p]) === typeof(this.params[p])) {
            this.params[p] = dp[p];
        }
        // We check given options are same type (from specific request)
        if(p in options && typeof(options[p]) === typeof(this.params[p])) {
            this.params[p] = options[p];
        }
    }

    // Now we take care of special case of data and header
    if(a.isObject(dp.data)) {
        for(var d in dp.data) {
            this.params.data[d] = dp.data[d];
        }
    }
    if(a.isObject(dp.header)) {
        for(var h in dp.header) {
            this.params.header[h] = dp.header[h];
        }
    }

    if(a.isString(options.data)) {
        this.params.data = options.data;
    } else if(a.isObject(options.data)) {
        for(var dd in options.data) {
            this.params.data[dd] = options.data[dd];
        }
    }

    if(a.isObject(options.header)) {
        for(var hh in options.header) {
            this.params.header[hh] = options.header[hh];
        }
    }

    // Binding result function
    this.success = (a.isFunction(success)) ? success : function(){};
    this.error   = (a.isFunction(error)) ? error : function(){};

    // Detecting browser support of ajax (including old browser support
    this.request = null;
    if(!a.isNone(window.XMLHttpRequest)) {
        this.request = new XMLHttpRequest();
    // Internet explorer specific
    } else {
        var msxml = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Msxml2.XMLHTTP',
            'Microsoft.XMLHTTP'
        ];
        for(var i=0, l=msxml.length; i<l; ++i) {
            try {
                this.request = new ActiveXObject(msxml[i]);
            } catch(e) {}
        }
    }
};

/**
 * Parse the data to return the formated object (if needed)
 *
 * @method parseResult
 *
 * @param params {Object}                   The parameter list from
 *                                          configuration ajax
 * @param http {Object}                     The xmlHttpRequest started
 * @return {Object | String}                The parsed results
*/
a.ajax.prototype.parseResult = function(params, http) {
    // Escape on special case HTTP 204
    if(http.status === 204) {
        return '';
    }

    //We are in non async mode, so the function should reply something
    var type = params.type.toLowerCase();
    if(type == 'json') {
        return a.parser.json.parse(http.responseText);
    }
    return (type == 'xml') ? http.responseXML : http.responseText;
};

/**
 * Manually abort the request
 *
 * @method abort
*/
a.ajax.prototype.abort = function() {
    try {
        this.request.abort();
    } catch(e) {}
};

/**
 * Send the ajax request
 *
 * @method send
*/
a.ajax.prototype.send = function() {
    var method = this.params.method.toUpperCase();

    //Creating a cached or not version
    if(this.params.cache === false) {
        // Generate a unique random number
        var rnd = a.uniqueId('rnd_');
        // Safari does not like this...
        try {
            this.params.data['cachedisable'] = rnd;
        } catch(e) {}
    }

    //Creating the url with GET
    var toSend = "";

    if(a.isString(this.params.data)) {
        toSend = this.params.data;
    } else {
        for(var d in this.params.data) {
            toSend += encodeURIComponent(d) + '=' +
                    encodeURIComponent(this.params.data[d]) + '&';
        }
        //toSend get an extra characters & at the end, removing it
        toSend = toSend.slice(0, -1);
    }

    var url = this.params.url,
        async = this.params.async;
    if(method == 'GET' && toSend) {
        url += '?' + toSend;
    }

    //Catching the state change
    if(async === true) {
        // Scope helper
        var scope = {
            success     : this.success,
            params      : this.params,
            error       : this.error,
            request     : this.request,
            parseResult : this.parseResult
        };

        this.request.onreadystatechange = function() {
            var status = scope.request.status;
            // Any 200 status will be validated
            if(scope.request.readyState === 4) {
                var great = (status >= 200 && status < 400);
                if(great) {
                    // Everything went fine
                    scope.success(
                        scope.parseResult(scope.params, scope.request),
                        status
                    );
                } else {
                    // An error occurs
                    scope.error(url, status);
                }

                // We send a result
                a.message.dispatch("a.ajax", {
                    success : great,
                    status  : status,
                    url     : scope.params.url,
                    method  : scope.method,
                    params  : scope.params
                });
            }
        };
    }

    //Openning the url
    this.request.open(method, url, async);

    //Setting headers (if there is)
    var contentTypeDefault = ['Content-Type', 'Content-type', 'content-type'],
        contentTypeFound   = false;
    for(var header in this.params.header) {
        this.request.setRequestHeader(header, this.params.header[header]);

        // In case of POST:
        //   a specific content type (a default one) may be needed
        if(!contentTypeFound && a.contains(contentTypeDefault, header)) {
            contentTypeFound = true;
        }
    }

    // Set a default one if not already set by user
    if(!contentTypeFound && method === 'POST') {
        this.request.setRequestHeader(
            'Content-type',
            'application/x-www-form-urlencoded'
        );
    }

    this.request.send(toSend);

    return (async === false) ?
            this.parseResult(this.params, this.request) :
            'No return in async mode';
};
