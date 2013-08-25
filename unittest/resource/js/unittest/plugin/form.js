// Unit test for a.form (plugin)

module("PLUGIN/form");

/*
---------------------------------
  GET TEST
---------------------------------
*/
// Test default behavior
test("a.form.default", function() {
	expect(2);

	var id = "a.form.default-behavior";

	// Main element
	var f = document.createElement("form");
	f.id = id;
	f.style.display = "none";
	f.onsubmit=function(){return false;}

	// We create some basic element: input, selectbox and submit button
	var input = document.createElement("input");
	input.name = id + "-input";
	input.value = "input-ok";
	f.appendChild(input);

	// Select box
	var select = document.createElement("select");
	select.name = id + "-select";
	// Sub child
	var o1 = document.createElement("option");
	o1.value = "select-choice1";
	select.appendChild(o1);
	var o2 = document.createElement("option");
	o2.value = "select-choice2";
	select.appendChild(o2);
	f.appendChild(select);

	// Submit
	var submit = document.createElement("submit");
	submit.name = id + "-submit";
	submit.value = "send";
	f.appendChild(submit);

	// Register element on dom
	document.body.appendChild(f);

	var test = a.form.get(document.getElementById(id));

	strictEqual(test[id + "-input"], "input-ok", "Test input");
	strictEqual(test[id + "-select"], "select-choice1", "Test select");
});


// Test checkbox
test("a.form.checkbox", function() {
	expect(2);

	var id = "a.form.checkbox-test";

	// Main element
	var f = document.createElement("form");
	f.id = id;
	f.style.display = "none";
	f.onsubmit=function(){return false;}

	// First checkbox button
	var c1 = document.createElement("input");
	c1.type = "checkbox";
	c1.name = id + "-c1";
	c1.checked = true;
	f.appendChild(c1);

	// Second checkbox button
	var c2 = document.createElement("input");
	c2.type = "checkbox";
	c2.name = id + "-c2";
	c2.checked = false;
	f.appendChild(c2);

	// Register element on dom
	document.body.appendChild(f);

	// Get elements
	var test = a.form.get(document.getElementById(id));

	strictEqual(test[id + "-c1"], true, "Test first checkbox");
	strictEqual(test[id + "-c2"], false, "Test second checkbox");
});


// Test radio button group
test("a.form.radio", function() {
	expect(2);

	var id = "a.form.radio-test";

	// Main element
	var f = document.createElement("form");
	f.id = id;
	f.style.display = "none";
	f.onsubmit=function(){return false;}

	// First radio button
	var r1 = document.createElement("input");
	r1.type = "radio";
	r1.name = id + "-content";
	r1.value = "r1";
	f.appendChild(r1);

	// Second radio button
	var r2 = document.createElement("input");
	r2.type = "radio";
	r2.name = id + "-content";
	r2.value = "r2";
	f.appendChild(r2);

	// Register element on dom
	document.body.appendChild(f);

	// Get first radio button check
	r1.checked = true;
	r2.checked = false;
	var test1 = a.form.get(document.getElementById(id));
	strictEqual(test1[id + "-content"], "r1", "Test first radio is found as checked");

	r1.checked = false;
	r2.checked = true;
	var test2 = a.form.get(document.getElementById(id));
	strictEqual(test2[id + "-content"], "r2", "Test second radio is found as checked");
});


/*
---------------------------------
  VALIDATE TEST
---------------------------------
*/