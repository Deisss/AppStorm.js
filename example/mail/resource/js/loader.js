// Root controller system, loading main app system here
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

	// We got two main states : the login/password lost one, and the main page (after login)
	var notLoggedState = {
		id : "root-notlogged",
		// We load base data : centered element to recieve login and password lost
		include : {
			css  : "resource/css/root-notlogged.css",
			html : "resource/html/root-notlogged.html"
		},

		// We define how to use html loaded (content is a DOM document)
		load : __replaceById("page-container"),

		// From 'not logged' state, we can access to 2 sub states : password lost page, and login page
		children : [
			{
				id    : "login",
				hash  : "login",
				title : "AppStorm.JS - login",
				include : {
					css  : "resource/css/root-notlogged-login.css",
					html : "resource/html/root-notlogged-login.html"
				},

				// We define how to use html loaded (content is a DOM document)
				load : __replaceById("root-notlogged-content")
			},
			{
				id    : "password-lost",
				hash  : "password-lost",
				title : "AppStorm.JS - password lost",
				include : {
					css  : "resource/css/root-notlogged-password-lost.css",
					html : "resource/html/root-notlogged-password-lost.html"
				},

				// We define how to use html loaded (content is a DOM document)
				load :  __replaceById("root-notlogged-content")
			}
		]
	};




	// Handle the logged part (when user sign in successfully)
	var loggedState = {
		id : "root-logged",
		// We load base structure : logo in top-left corner, and two part : menu and content
		include : {
			css  : "resource/css/root-logged.css",
			html : "resource/html/root-logged.html"
		},

		// We define how to use html loaded (content is a DOM document)
		load : __replaceById("page-container"),

		children : [
			// Handling mail menu
			{
				id   : "mail-menu",

				include : {
					// you can define shared css, it will be loaded only once
					css  : "resource/css/root-logged-menu.css",
					html : "resource/html/root-logged-mail-menu.html"
				},

				// We define how to use html loaded (content is a DOM document)
				load : __replaceById("root-logged-menu"),

				// Dummy loader : we provide a simple hack to prevent bug on reloading directly on inbox (not showing menu)
				children : [
					{
						hash : "mail-{{type : [a-zA-Z0-9]+}}-{{page : \\d+}}"
					}
				]
			},

			// Handling mail content
			{
				id    : "mail-content",
				title : "AppStorm.JS - mail",

				// We separate content in two sub content : the left panel, and right panel
				include : {
					css  : "resource/css/root-logged-mail-content.css",
					html : "resource/html/root-logged-mail-content.html"
				},

				// We define how to use html loaded (content is a DOM document)
				load : __replaceById("root-logged-content"),

				// We include mail content as children to not unload other stuff
				children : [
					{
						id : "mail-content-inbox-menu",
						hash : "mail-inbox-{{page : \\d+}}",

						// We separate content in two sub content : the left panel, and right panel
						include : {
							html : "resource/html/root-logged-mail-menu-inbox.html"
						},

						// We apply data
						load : __replaceById("root-logged-mail-content-left")
					},
					{
						id : "mail-content-trash-menu",
						hash : "mail-trash-{{page : \\d+}}",

						// We separate content in two sub content : the left panel, and right panel
						include : {
							html : "resource/html/root-logged-mail-menu-trash.html"
						},

						// We apply data
						load : __replaceById("root-logged-mail-content-left")
					},
					{
						id : "mail-content-box",
						hash : "mail-{{type : [a-zA-Z0-9]+}}-{{page : \\d+}}",
						title : "AppStorm.JS - {{hash : type}} page {{hash : page}}",

						// We use the hashtag to generate custom url regarding hastag
						data : "resource/data/{{hash : type}}{{hash : page}}.json",

						// We separate content in two sub content : the left panel, and right panel
						include : {
							html : "resource/html/root-logged-mail-content-{{hash : type}}.html"
						},

						// We apply data
						load : __replaceById("root-logged-mail-content-right")
					}
				]
			},

			// Handling about menu
			{
				id   : "about-menu",
				hash : "about",

				// We separate content in two sub content : the left panel, and right panel
				include : {
					// you can define shared css, it will be loaded only once
					css  : "resource/css/root-logged-menu.css",
					html : "resource/html/root-logged-about-menu.html"
				},

				// We define how to use html loaded (content is a DOM document)
				load : __replaceById("root-logged-menu")
			},

			// Handling about content
			{
				id    : "about-content",
				hash  : "about",
				title : "AppStorm.JS - about",

				include : {
					css  : "resource/css/root-logged-about-content.css",
					html : "resource/html/root-logged-about-content.html"
				},

				// We define how to use html loaded (content is a DOM document)
				load : __replaceById("root-logged-content")
			}
		]
	};


	// This state is a "side" state : manually loaded by user, it does provide resource to create new email structure
	// outside any "hashtag" change/event
	var actionNewEmailState = {
		id : "root-new-email",

		include : {
			// We does create a basic structure for handling multiple "add email"
			css  : "resource/css/root-logged-root-new-email.css",
			html : "resource/html/root-logged-root-new-email.html"
		},

		// We define how to use html loaded (content is a DOM document)
		load : function(content) {
			a.page.template.append(document.body, content);
		},

		children : [
			{
				id : "new-email",

				include : {
					html : "resource/html/root-logged-new-email.html"
				},

				load : function(content) {
					a.page.template.append(document.getElementById("root-new-email"), content);
				},

				unload : function(result) {
					document.getElementById("root-new-email").innerHTML = "";
					result.done();
				}
			}
		]
	};




	// Finally we add elements to system
	a.state.add(notLoggedState);
	a.state.add(loggedState);
	a.state.add(actionNewEmailState);
})();