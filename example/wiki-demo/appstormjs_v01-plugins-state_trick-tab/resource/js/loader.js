/**
 * Ask to load a new tab
 *
 * @param number {String} The tab number to show
*/
function changeTab(number) {
	a.storage.memory.setItem("current_tab", number);
	a.state.loadById("tab");
};


// Root controller system, loading main app system here
(function() {
	// Describe our behaviour
	var tree = {
		id   : "root",
		hash : "tab",
		load : function(content) {
			a.page.template.replace(document.getElementById("page-container"), content);
		},
		include  : {
			css  : "resource/css/main.css",
			html : "resource/html/page.html"
		},
		children : {
			id   : "tab",
			preLoad : function(result) {
				// We directly retrieve content instead of using data element
				var number = a.storage.memory.getItem("current_tab");

				/*
					//jQuery version
					$("#content-tab > .tab, #menu-tab > li").removeClass("selected");
					$("#content-tab > #tab-" + number + ", #menu-tab > #menu-" + number).addClass("selected");
				*/

				// Simple function to type less
				var activeId = function(el, id) {
					if(el && !a.isNull(el.className)) {
						el.className = el.className.replace(/\bselected\b/, "");
						if(el.id === id) {
							el.className += " selected";
						}
					}
				};

				// Content
				// Instead of adding/Removing html, this time we will show/hide content
				// Using jQuery/querySelector here will make system really shorter...
				var root = document.getElementById("content-tab");
				for(var i=0, l=root.childNodes.length; i<l; ++i) {
					activeId(root.childNodes[i], "tab-" + number);
				}

				// Menu
				// Using jQuery/querySelector here will make system really shorter...
				var menu = document.getElementById("menu-tab");
				for(var j=0, m=menu.childNodes.length; j<m; ++j) {
					activeId(menu.childNodes[j], "menu-" + number);
				}
			}
		}
	};

	// Register our document
	a.state.add(tree);
})();