// Unit test for a.dom.*

module('CORE');



// Testing dom id search
test('a.dom.id', function() {
    // Test find one id
    var first = a.dom.id('a.dom.testid').getElements();
    strictEqual(first[0].innerHTML, 'a.dom.testid', 'Test id content');
    strictEqual(first.length, 1, 'Test length');

    // Test find another id
    var second = a.dom.id('a.dom.secondtestid').getElements();
    strictEqual(second[0].nodeName, 'INPUT', 'Test node type found');
    strictEqual(second.length, 1, 'Test length');

    // Test find multiple elements
    var elements = a.dom.id('a.dom.testid,a.dom.secondtestid').getElements();
    strictEqual(elements.length, 2, 'Test length');

    var arrElements = a.dom.id(['a.dom.testid', 'a.dom.secondtestid']).getElements();
    strictEqual(arrElements.length, 2, 'Test length');

    // Test unknow id does not create trouble
    var notFound = a.dom.id('supernotfound').getElements();
    strictEqual(notFound.length, 0, 'Test length');
});



// Testing dom class search
test('a.dom.cls', function() {
    // Test default search
    var elements = a.dom.cls('a.dom.testclass').getElements();
    strictEqual(elements.length, 3, 'Test length');
    strictEqual(elements[0].nodeName, 'A', 'Test first');
    strictEqual(elements[1].nodeName, 'A', 'Test second');
    strictEqual(elements[2].nodeName, 'I', 'Test third');

    var dual = a.dom.cls('a.dom.testclass,a.dom.secondtestclass').getElements();
    strictEqual(dual.length, 4, 'Test length');

    var third = a.dom.cls(['a.dom.testclass', 'a.dom.secondtestclass']).getElements();
    strictEqual(third.length, 4, 'Test length');
});



// Testing searching by tag name
test('a.dom.tag', function() {
    // First easy test
    var elements = a.dom.id('a.dom.testtag').tag('a').getElements();
    strictEqual(elements.length, 2, 'Test length');

    // Second test
    var sub = a.dom.id('a.dom.testtag').tag('a,i').getElements();
    strictEqual(sub.length, 3, 'Test length');

    // Third test
    var sub2 = a.dom.id('a.dom.testtag').tag(['a', 'i']).getElements();
    strictEqual(sub2.length, 3, 'Test length');

    // Complex test case
    var subsub = a.dom.id(['a.dom.testtag', 'a.dom.secondtesttag'])
                .tag('a,i').getElements();
    strictEqual(subsub.length, 4, 'Test length');
});



// Testing searching by attribute
test('a.dom.attr', function() {
    // Simple attribute check
    var first = a.dom.attr('data-attr-test', 'a.dom.testattr').getElements();
    strictEqual(first.length, 2, 'Test length');
    strictEqual(first[0].nodeName, 'A', 'Test A tag');
    strictEqual(first[1].nodeName, 'SPAN', 'Test SPAN tag');

    // Little bit more complex attribute
    var second = a.dom.attr(
                    'data-attr-test',
                    ['a.dom.testattr', 'a.dom.secondtestattr']).getElements();
    strictEqual(second.length, 3, 'Test length');

    // Much more complex attribute
    var third = a.dom.attr(
                    ['id', 'data-attr-test'],
                    ['a.dom.testid', 'a.dom.secondtestattr']
                ).getElements();
    strictEqual(third.length, 2, 'Test length');
});



// Testing converting element to a.dom
test('a.dom.el', function() {
    var doc = document.createElement('div');
    var el = a.dom.el(doc);

    strictEqual(el.get(0).nodeName, 'DIV', 'Test passing element');
});