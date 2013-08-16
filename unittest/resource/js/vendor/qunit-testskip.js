// From : http://stackoverflow.com/questions/13748129/skipping-a-test-in-qunit
QUnit.testSkip = function() {
	QUnit.test(arguments[0] + ' (SKIPPED)', function() {
		expect(0);
		var li = document.getElementById(QUnit.config.current.id);
		QUnit.done(function() {
			li.style.background = '#FFFF99';
		});
	});
};
testSkip = QUnit.testSkip;