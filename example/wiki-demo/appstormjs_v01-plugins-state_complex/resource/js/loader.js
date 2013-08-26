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
			html  : "resource/html/not-logged/home.html",
			js    : "resource/js/notlogged-action.js"
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
		load : __replaceById("page-container"),
		include : {
			css   : "resource/css/logged.css",
			html  : "resource/html/logged/home.html",
			js    : "resource/js/logged-action.js"
		},
		children : [
			{
				id : "menu-user",
				load : __replaceById("logged-content"),
				include : {
					html  : "resource/html/logged/menu/user.html"
				}
			},
			{
				id : "menu-billing",
				load : __replaceById("logged-content"),
				include : {
					html  : "resource/html/logged/menu/billing.html"
				}
			},
			{
				id   : "dashboard",
				hash : "dashboard",
				load : __replaceById("logged-content"),
				data : {
					lastBill     : "resource/data/bill/latest.json",
					lastCustomer : "resource/data/customer/latest.json"
				},
				include : {
					html  : "resource/html/logged/page/dashboard.html"
				}
			}
		]
	};
 
	// We separate to make it more easy to read
	var userManagement = [
		{
			id      : "user-root",
			parent  : "menu-user",
			data    : "resource/data/customer/list.json",
			load    : __replaceById("user-content"),
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
				load    : __replaceById("user-list-content"),
				converter : function(data) {
					var filter = a.storage.memory.getItem("user-filter"),
						content = a.storage.memory.getItem("user-list");

					// We make a copy of it : memory store is a javascript object, so it is working by reference...
					content = a.clone(content);

					if(content && filter) {
						filter = filter.toLowerCase();
						var i = content.length;
						while(i--) {
							if(content[i].name.toLowerCase().search(filter) === -1 && content[i].country.toLowerCase().search(filter) === -1 && content[i].id.toString().search(filter) === -1) {
								content.splice(i, 1);
							}
						}
					}

					// We append to data
					data.userlist = content;
				},
				include : {
					html : "resource/html/logged/page/user-list.html"
				}
			}
		},
		{
			id      : "user-see",
			hash    : "user-see-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-user",
			load    : __replaceById("user-content"),
			data    : "resource/data/customer/{{id}}.json",
			include : {
				html  : "resource/html/logged/page/user-see.html"
			}
		},
		{
			id      : "user-create",
			hash    : "user-create",
			parent  : "menu-user",
			load    : __replaceById("user-content"),
			include : {
				html  : "resource/html/logged/page/user-create.html"
			}
		},
		{
			id      : "user-modify",
			hash    : "user-modify-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-user",
			load    : __replaceById("user-content"),
			data    : "resource/data/customer/{{id}}.json",
			include : {
				html  : "resource/html/logged/page/user-modify.html"
			}
		}
	];
 
	// We separate to make it more easy to read
	var billingManagement = [
		{
			id      : "billing-list-root",
			parent  : "menu-billing",
			data    : "resource/data/bill/list.json",
			load    : __replaceById("billing-content"),
			converter : function(data) {
				// Store the data loaded into storage to use it later (see filter trick)
				a.storage.memory.setItem("billing-list", data);
			},
			include : {
				html  : "resource/html/logged/page/bill-root.html"
			},
			children : {
				id      : "billing-list",
				hash    : "billing-list",
				load    : __replaceById("bill-list-content"),
				converter : function(data) {
					var filter = a.storage.memory.getItem("bill-filter"),
						content = a.storage.memory.getItem("billing-list");

					// We make a copy of it : memory store is a javascript object, so it is working by reference...
					content = a.clone(content);

					if(content && filter) {
						filter = filter.toLowerCase();
						var i = content.length;
						while(i--) {
							if(content[i].customer.toLowerCase().search(filter) === -1 && content[i].date.toLowerCase().search(filter) === -1 && content[i].id.toString().search(filter) === -1) {
								content.splice(i, 1);
							}
						}
					}

					// We append to data
					data.billlist = content;
				},
				include : {
					html  : "resource/html/logged/page/bill-list.html"
				}
			}
		},
		{
			id      : "billing-see",
			hash    : "bill-see-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-billing",
			load    : __replaceById("billing-content"),
			data    : "resource/data/bill/{{id}}.json",
			include : {
				html  : "resource/html/logged/page/bill-see.html"
			}
		},
		{
			id      : "billing-create",
			hash    : "bill-create",
			parent  : "menu-billing",
			load    : __replaceById("billing-content"),
			include : {
				html  : "resource/html/logged/page/bill-create.html"
			}
		},
		{
			id      : "billing-modify",
			hash    : "bill-modify-{{id : [a-fA-F0-9]+}}",
			parent  : "menu-billing",
			load    : __replaceById("billing-content"),
			data    : "resource/data/bill/{{id}}.json",
			include : {
				html  : "resource/html/logged/page/bill-modify.html"
			}
		}
	];
 
	a.state.add(notLogged);
	a.state.add(logged);
	a.state.add(userManagement);
	a.state.add(billingManagement);
})();