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

	var notLogged = {
		id : "root-notlogged",
		load : __replaceById("page-container"),
		include : {
			css   : "resource/css/notlogged.css",
			html  : "resource/html/not-logged/home.html"
		},
		children : [
			{
				id    : "login",
				hash  : "login",
				title : "MyApp - Login",
				load : __replaceById("notlogged-content"),
				include : {
					html  : "resource/html/not-logged/page/login.html"
				}
			},
			{
				id    : "password-lost",
				hash  : "password-lost",
				title : "MyApp - Password lost",
				load : __replaceById("notlogged-content"),
				include : {
					html  : "resource/html/not-logged/page/password-lost.html"
				}
			}
		]
	};
 
	var logged = {
		id : "root-logged",
		include : {
			css   : "resource/css/logged.css",
			html  : "resource/html/logged/home.html"
		},
		children : [
			{
				id : "menu-user",
				include : {
					html  : "resource/html/logged/menu/user.html"
				}
			},
			{
				id : "menu-billing",
				include : {
					html  : "resource/html/logged/menu/billing.html"
				}
			},
			{
				id   : "dashboard",
				hash : "dashboard",
				data : {
					lastBill     : "resource/data/bill/latest",
					lastCustomer : "resource/data/customer/latest"
				},
				include : {
					html  : "resource/html/logged/dashboard.html"
				}
			}
		]
	};
 
	// We separate to make it more easy to read
	var userManagement = [
		{
			id      : "user-root",
			parent  : "menu-user",
			data    : "resource/data/user/list",
			converter : function(data) {
				// Store the data loaded into storage to use it later (see filter trick)
				a.storage.memory.setItem("user-list", data);
			},
			include : {
				html  : "resource/html/logged/page/user-root.html"
			},
			children : {
				id      : "user-list",
				hash    : "user-list",
				include : {
					html : "resource/html/logged/page/user-list.html"
				}
			}
		},
		{
			id      : "user-see",
			hash    : "user-see-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-user",
			data    : "resource/data/user/{{id}}",
			include : {
				html  : "resource/html/logged/page/user-see.html"
			}
		},
		{
			id      : "user-create",
			hash    : "user-create",
			parent  : "menu-user",
			include : {
				html  : "resource/html/logged/page/user-create.html"
			}
		},
		{
			id      : "user-modify",
			hash    : "user-modify-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-user",
			data    : "resource/data/user/{{id}}",
			include : {
				html  : "resource/html/logged/page/user-see.html"
			}
		}
	];
 
	// We separate to make it more easy to read
	var billingManagement = [
		{
			id      : "billing-list-root",
			parent  : "menu-billing",
			data    : "resource/data/billing/list",
			converter : function(data) {
				// Store the data loaded into storage to use it later (see filter trick)
				a.storage.memory.setItem("billing-list", data);
			},
			include : {
				html  : "resource/html/logged/page/billing-list-root.html"
			},
			children : {
				id      : "billing-list",
				hash    : "billing-list",
				include : {
					html  : "resource/html/logged/page/billing-list.html"
				}
			}
		},
		{
			id      : "billing-see",
			hash    : "billing-see-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-billing",
			data    : "resource/data/billing/{{id}}",
			include : {
				html  : "resource/html/logged/page/billing-see.html"
			}
		},
		{
			id      : "billing-create",
			hash    : "billing-create",
			parent  : "menu-billing",
			include : {
				html  : "resource/html/logged/page/billing-create.html"
			}
		},
		{
			id      : "billing-modify",
			hash    : "billing-modify-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-billing",
			data    : "resource/data/billing/{{id}}",
			include : {
				html  : "resource/html/logged/page/billing-see.html"
			}
		}
	];
 
	a.state.add(notLogged);
	a.state.add(logged);
	a.state.add(userManagement);
	a.state.add(billingManagement);
})();