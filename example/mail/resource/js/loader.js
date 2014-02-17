// Root controller system, loading main app system here
(function() {
    // We got two main states : the login/password lost one,
    // and the main page (after login)
    var notLoggedState = {
        id:    'root-notlogged',
        entry: '#page-container',
        type:  'replace',

        // We load base data : centered element to recieve login and
        // password lost
        include: {
            css:  'resource/css/root-notlogged.css',
            html: 'resource/html/root-notlogged.html'
        },

        // From 'not logged' state, we can access to 2 sub states:
        // password lost page, and login page
        children: [
            {
                id:    'login',
                hash:  'login',
                title: 'AppStorm.JS - login',

                entry: '#root-notlogged-content',
                type:  'replace',

                include: {
                    css:  'resource/css/root-notlogged-login.css',
                    html: 'resource/html/root-notlogged-login.html'
                }
            },
            {
                id:    'password-lost',
                hash:  'password-lost',
                title: 'AppStorm.JS - password lost',

                entry: '#root-notlogged-content',
                type:  'replace',

                include: {
                    css:  'resource/css/root-notlogged-password-lost.css',
                    html: 'resource/html/root-notlogged-password-lost.html'
                }
            }
        ]
    };




    // Handle the logged part (when user sign in successfully)
    var loggedState = {
        id:    'root-logged',
        entry: '#page-container',
        type:  'replace',

        // We load base structure : logo in top-left corner, and two part:
        // menu and content
        include: {
            css:  'resource/css/root-logged.css',
            html: 'resource/html/root-logged.html'
        },

        children: [
            // Handling mail menu
            {
                id: 'mail-menu',
                entry: '#root-logged-menu',
                type:  'replace',

                include: {
                    // you can define shared css, it will be loaded only once
                    css:  'resource/css/root-logged-menu.css',
                    html: 'resource/html/root-logged-mail-menu.html'
                },

                // Dummy loader : we provide a simple hack to prevent bug on
                // reloading directly on inbox (not showing menu)
                children: [
                    {
                        hash: 'mail-{{type : [a-zA-Z0-9]+}}-{{page : \\d+}}'
                    }
                ]
            },

            // Handling mail content
            {
                id:    'mail-content',
                title: 'AppStorm.JS - mail',
                entry: '#root-logged-content',
                type:  'replace',

                // We separate content in two sub content : the left panel,
                // and right panel
                include: {
                    css:  'resource/css/root-logged-mail-content.css',
                    html: 'resource/html/root-logged-mail-content.html'
                },

                // We include mail content as children to not unload other
                // stuff
                children: [
                    {
                        id:    'mail-content-inbox-menu',
                        hash:  'mail-inbox-{{page : \\d+}}',
                        entry: '#root-logged-mail-content-left',
                        type:  'replace',

                        // We separate content in two sub content : the
                        // left panel, and right panel
                        include: {
                            html: 'resource/html/root-logged-mail-menu-inbox.html'
                        }
                    },
                    {
                        id:    'mail-content-trash-menu',
                        hash:  'mail-trash-{{page : \\d+}}',
                        entry: '#root-logged-mail-content-left',
                        type:  'replace', 

                        // We separate content in two sub content :
                        // the left panel, and right panel
                        include: {
                            html: 'resource/html/root-logged-mail-menu-trash.html'
                        }
                    },
                    {
                        id:    'mail-content-box',
                        hash:  'mail-{{type : [a-zA-Z0-9]+}}-{{page : \\d+}}',
                        title: 'AppStorm.JS - {{hash : type}} page {{hash : page}}',
                        entry: '#root-logged-mail-content-right',
                        type:  'replace',

                        // We use the hashtag to generate custom url regarding hastag
                        data: 'resource/data/{{hash : type}}{{hash : page}}.json',

                        // We separate content in two sub content :
                        // the left panel, and right panel
                        include: {
                            html: 'resource/html/root-logged-mail-content-{{hash : type}}.html'
                        }
                    }
                ]
            },

            // Handling about menu
            {
                id:    'about-menu',
                hash:  'about',
                entry: '#root-logged-menu',
                type:  'replace',

                // We separate content in two sub content:
                // the left panel, and right panel
                include: {
                    // you can define shared css, it will be loaded only once
                    css:  'resource/css/root-logged-menu.css',
                    html: 'resource/html/root-logged-about-menu.html'
                }
            },

            // Handling about content
            {
                id:    'about-content',
                hash:  'about',
                title: 'AppStorm.JS - about',
                entry: '#root-logged-content',
                type:  'replace',

                include: {
                    css:  'resource/css/root-logged-about-content.css',
                    html: 'resource/html/root-logged-about-content.html'
                }
            }
        ]
    };


    // This state is a 'side' state : manually loaded by user,
    // it does provide resource to create new email structure
    // outside any 'hashtag' change/event
    var actionNewEmailState = {
        id:    'root-new-email',
        entry: 'body',
        type:  'append',

        include: {
            // We does create a basic structure for handling
            // multiple 'add email'
            css:  'resource/css/root-logged-root-new-email.css',
            html: 'resource/html/root-logged-root-new-email.html'
        },

        children: {
            id:    'new-email',
            entry: '#root-new-email',
            type:  'append',

            include: {
                html: 'resource/html/root-logged-new-email.html'
            },

            unload: function() {
                a.dom.id('root-new-email').empty();
            }
        }
    };




    // Finally we add elements to system
    a.state.add(notLoggedState);
    a.state.add(loggedState);
    a.state.add(actionNewEmailState);
})();