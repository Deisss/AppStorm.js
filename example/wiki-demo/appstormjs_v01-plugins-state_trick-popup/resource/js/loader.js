function exSignal() {
	popup.signal("This is a signal template");
};

function exAlert() {
	popup.alert("This is an alert template", function() {
		popup.alert("You validate");
	});
};

function exConfirm() {
	popup.confirm("Are you sure ?", function(e) {
		if(e.ok) {
			popup.alert("You click ok");
		} else if(e.cancel) {
			popup.alert("You click cancel");
		}
	});
};

function exPrompt() {
	popup.prompt("What is your name ?", "", function(e) {
		if(e.ok) {
			popup.alert("You click ok and provide text : " + e.value);
		} else if(e.cancel) {
			popup.alert("You click cancel");
		}
	});
};

function exCustom() {
	var buttonList = [];

	buttonList.push({
		id : "ok",
		value : "ok",
		focus : true
	});

	buttonList.push({
		id : "restart",
		value : "restart system"
	});

	buttonList.push({
		id : "stop",
		value : "stop system"
	});

	popup.custom("The system got a problem...", buttonList, function(e) {
		if(e.ok) {
			popup.alert("You click ok");
		} else if(e.restart) {
			popup.alert("You click restart");
		} else if(e.stop) {
			popup.alert("You click stop");
		}
	});
};



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

	// Describe our behaviour
	var tree = {
		id : "root",
		hash : "root",
		load : __replaceById("page-container"),
		include : {
			css : "resource/css/main.css",
			html : "resource/html/page.html"
		}
	};

	// Register our document
	a.state.add(tree);
})();