
// Get filter value, and apply filter to list
function onUserFilter() {
	var filter = document.getElementById("user-list-search");

	a.storage.memory.setItem("user-filter", filter.value);
	a.state.forceReloadById("user-list");
};

// Handle user create by switching back to user list
function onUserCreate() {
	alert("You try to create a user");
	window.location.href = "#user-list";
};


// Handle user modify by switching back to user list
function onUserModify() {
	alert("You try to modify a user");
	window.location.href = "#user-list";
};


// Get filter value, and apply filter to list
function onBillFilter() {
	var filter = document.getElementById("bill-list-search");

	a.storage.memory.setItem("bill-filter", filter.value);
	a.state.forceReloadById("billing-list");
};

// Handle bill create by switching back to bill list
function onBillCreate() {
	alert("You try to create a bill");
	window.location.href = "#billing-list";
};


// Handle bill modify by switching back to bill list
function onBillModify() {
	alert("You try to modify a bill");
	window.location.href = "#billing-list";
};