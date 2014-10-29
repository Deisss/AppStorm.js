// From : http://stackoverflow.com/questions/13748129/skipping-a-test-in-qunit
QUnit.testSkip = function() {
	QUnit.test(arguments[0] + ' (SKIPPED)', function(assert) {
		assert.expect(0);

        // Get the current unit test, wich is an ID number (integer)
        var id = QUnit.config.current.testNumber;

        // Get the corresponding LI element to the given test number
        var li = document.getElementById('qunit-test-output' + id);
        QUnit.done(function() {
            if(li) {
                li.style.background = '#FFFF99';
            }
        });
	});
};
testSkip = QUnit.testSkip;