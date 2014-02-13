var chain = function chain(href, callback, ms) {
    var inner = function() {
        // We stop if the current hashtag is not the one we wanted...
        if(a.hash.getHash() != href) {
            return;
        }

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