// Unit test for a.binding (plugin)

module('plugin/binding.js');

// Check converter get/set/delete
test('a.binding.converter', function() {
	function testConverter() {};

	// Before anything: nothing is already existing
	strictEqual(a.binding.getConverter('testConverter'), null, 'Test null');

	// Creating the converter
	a.binding.registerConverter('testConverter', testConverter);

	// Checking everything is fine
	strictEqual(a.binding.getConverter('testConverter'), testConverter,
		'Test get');

	// Removing converter
	a.binding.removeConverter('testConverter');

	// Test remove work
	strictEqual(a.binding.getConverter('testConverter'), null, 'Test remove');
});

// Check inner bind function
test('a.binding.registerInnerBind', function() {
	var p = document.createElement('p');
	p.innerHTML = 'This should {{handle}} as {{expected}} data';

	var div = document.createElement('div');
	div.style.display = 'none';
	div.appendChild(p);

	a.binding.registerInnerBind(div);

	// Now we can test p has been parsed as expected
	var html = p.innerHTML;

	strictEqual(html, 'This should  as  data', 'Test content');
	strictEqual(p.getAttribute('data-inner-bind-handle-start'), '12');
	strictEqual(p.getAttribute('data-inner-bind-handle-stop'), '0');
	strictEqual(p.getAttribute('data-inner-bind-expected-start'), '16');
	strictEqual(p.getAttribute('data-inner-bind-expected-stop'), '0');
});