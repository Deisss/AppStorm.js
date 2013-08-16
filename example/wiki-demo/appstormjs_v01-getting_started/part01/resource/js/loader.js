// resource/js/loader.js
 
// The main "skeleton" of our application will remain here
(function() {
    /**
     * Replace the content regarding the id given
     *
     * @param id {String} The id to replace inner html
    */
    function __replaceById(id) {
        return function(content) {
            a.page.template.replace(document.getElementById(id), content);
        }
    };
 
    // Define our login and password lost page behaviour
    var notLoggedState = {
        id         : "notlogged",
        bootOnLoad : true,
        load       : __replaceById("page-container"),
        include    : {
            html : "resource/html/notlogged.html",
            css  : "resource/css/notlogged.css"
        },
        children : [
            {
                id      : "login",
                hash    : "login",
                title   : "AppStorm.JS - login",
                load    : __replaceById("notlogged-content"),
                include : {
                    html : "resource/html/login.html"
                }
            },
            {
                id      : "password-lost",
                hash    : "password-lost",
                title   : "AppStorm.JS - Forgotten your password",
                load    : __replaceById("notlogged-content"),
                include : {
                    html : "resource/html/password-lost.html"
                }
            }
        ]
    };

	// We add the tree to existing state tree
    a.state.add(notLoggedState);
})();