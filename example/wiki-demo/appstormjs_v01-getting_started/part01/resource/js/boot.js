// resource/js/boot.js

(function() {
	// Set AppStorm.JS default behavior
	a.environment.set("console", "log");
	a.environment.set("verbose", 3);

	var currentHash = a.page.event.hash.getHash(),
		timerId = null,
		max = 200;
 
	// Initialise page event hash system
	a.page.event.hash.setPreviousHash("");
	window.location.href = "#loading_application";
 
	/**
	 * handle "state change" for every browser
	*/
	function firstHandle() {
		if(a.page.event.hash.getHash() !== currentHash) {
			window.location.href = "#" + currentHash;
			max = 0;
		}
		if(max-- <= 0) {
			a.timer.remove(timerId);
		}
	};
 
	// The main starter is here, we will customize it soon
	if(currentHash === null || currentHash === "" || !a.state.hashExists(currentHash)) {
		currentHash = "login";
	}
 
	// Launch the application asap
	timerId = a.timer.add(firstHandle, null, 50);
})();