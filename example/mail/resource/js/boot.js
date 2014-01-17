// This part allow system to startup (decide what to startup, in which situation)

(function() {
	var currentHash = a.hash.getHash(),
		timerId = null,
		max = 1000;

	// Initialise page event hash system
	a.hash.setPreviousHash("");
	window.location.href = "#loading_application";

	/**
	 * handle "state change" for every browser
	*/
	function firstHandle() {
		if(a.hash.getHash() !== currentHash) {
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

	// Some browser don't get hash change with onHashchange event, so we decide to use timer
	// Note : a.page.event.hash is more complex, here is little example
	timerId = a.timer.add(firstHandle, null, 10);
})();