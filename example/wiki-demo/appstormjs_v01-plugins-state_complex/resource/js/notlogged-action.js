// Change the hashtag to load dashboard.
// In a normal situation, you will do an ajax request here (see a.ajax)
function onLogin() {
	alert("You sign in on our service");
	window.location.href = "#dashboard";
};

function onPasswordLost() {
	alert("You try to change your password");
	window.location.href = "#login";
};