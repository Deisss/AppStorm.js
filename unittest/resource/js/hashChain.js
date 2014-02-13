var chain = function chain(href, callback, ms) {
    var inner = function() {
        a.hash.unbind('change', inner);
        if(ms) {
            setTimeout(callback, ms);
        } else {
            callback();
        }
    };
    a.hash.bind('change', inner);
};

function hashtag(uri) {
    window.location.href = '#' + uri;
};