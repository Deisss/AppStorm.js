// Unit test for a.binding (plugin)


// FOR NOW THIS IS UNUSED AND UNTRUSTED CODE

/*
QUnit.module('plugin/binding.js');

// Check converter get/set/delete
QUnit.test('a.binding.converter', function(assert) {
	assert.expect(3);

	function testConverter() {};

	// Before anything: nothing is already existing
	assert.strictEqual(a.binding.getConverter('testConverter'), null, 'Test null');

	// Creating the converter
	a.binding.registerConverter('testConverter', testConverter);

	// Checking everything is fine
	assert.strictEqual(a.binding.getConverter('testConverter'), testConverter,
		'Test get');

	// Removing converter
	a.binding.removeConverter('testConverter');

	// Test remove work
	assert.strictEqual(a.binding.getConverter('testConverter'), null, 'Test remove');
});

// Check inner bind function
QUnit.test('a.binding.registerInnerBind', function(assert) {
	assert.expect(5);

	var p = document.createElement('p');
	p.innerHTML = 'This should {{handle}} as {{expected}} data';

	var div = document.createElement('div');
	div.style.display = 'none';
	div.appendChild(p);

	a.binding.registerInnerBind(div);

	// Now we can test p has been parsed as expected
	var html = p.innerHTML;

	assert.strictEqual(html, 'This should  as  data', 'Test content');
	assert.strictEqual(p.getAttribute('data-inner-bind-handle-start'), '12');
	assert.strictEqual(p.getAttribute('data-inner-bind-handle-stop'), '0');
	assert.strictEqual(p.getAttribute('data-inner-bind-expected-start'), '16');
	assert.strictEqual(p.getAttribute('data-inner-bind-expected-stop'), '0');
});
*/