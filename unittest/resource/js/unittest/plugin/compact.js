// Unit test for a.callback (plugin)

QUnit.module('plugin/compact.js');

// Test compact does load everything and register
// everything into a.loader
QUnit.asyncTest('a.compact', function (assert) {
    assert.expect(2);

    a.compact.active = true;
    a.compact.load(function (error, content) {
        if (error) {
            assert.strictEqual(false, true, 'Error loading resources');
            QUnit.start();
        } else {
            var html = a.template.htmlToDom(content);
            // 3 scripts + text node space
            assert.strictEqual(html.length, 8);

            // We don't need to check for HTML
            // tag, as real element does not exist
            a.loader.html('resources/partials/test.html', function (content) {
                assert.strictEqual("\n<div>I'm a partials !</div>\n", content);
                QUnit.start();
            });
        }
    });
});
