// Unit test for a.dom.*

module('CORE');


/*
-------------------------------------------
  GLOBAL ELEMENTS
-------------------------------------------
*/


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

    var arrElements = a.dom.id(['a.dom.testid', 'a.dom.secondtestid'])
                        .getElements();
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

    var dual = a.dom.cls('a.dom.testclass,a.dom.secondtestclass')
                    .getElements();
    strictEqual(dual.length, 4, 'Test length');

    var third = a.dom.cls(['a.dom.testclass', 'a.dom.secondtestclass'])
                    .getElements();
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



/*
-------------------------------------------
  CHILDREN ELEMENTS
-------------------------------------------
*/
// Test getting single element
test('a.dom.children.get', function() {
    var elements = a.dom.id(['a.dom.testtag', 'a.dom.secondtesttag']);

    for(var i=0; i<2; ++i) {
        strictEqual(elements.get(i).nodeName, 'DIV', 'Test node name');
    }
});

// Test getting stored elements
test('a.dom.children.getElements', function() {
    var elements = a.dom.id(['a.dom.testtag', 'a.dom.secondtesttag'])
                    .getElements();
    for(var i=0, l=elements.length; i<l; ++i) {
        strictEqual(elements[i].nodeName, 'DIV', 'Test node name');
    }
    strictEqual(elements.length, 2, 'Test length');
});

// Test getting specific id from element
test('a.dom.children.id', function() {
    var sub = a.dom.tag('div').id('a.dom.secondtesttag').getElements();

    strictEqual(sub.length, 1, 'Test length');
    strictEqual(sub[0].nodeName, 'DIV', 'Test node name');
});

// Test getting specific class from element
test('a.dom.children.cls', function() {
    var sub = a.dom.id('a.dom.testtag').cls('a.dom.testclass').getElements();

    strictEqual(sub.length, 2, 'Test length');
    strictEqual(sub[0].nodeName, 'I', 'Test node name');
    strictEqual(sub[1].nodeName, 'A', 'Test node name');
});

// Test setting or getting CSS attribute
test('a.dom.children.css', function() {
    // Test setter
    a.dom.id('a.dom.secondtesttag').tag('a').css('text-align', 'right');

    var el = a.dom.id('a.dom.secondtesttag').tag('a').get(0);
    strictEqual(el.style.textAlign, 'right', 'Test css setter');

    // Test getter
    strictEqual(a.dom.id('a.dom.secondtesttag').tag('a').css('text-align'),
            'right', 'Test CSS getter');

    // Many getter
    var multiGetter = a.dom.id('a.dom.secondtesttag').tag('a,b')
                        .css('text-align');
    // First text align is blank, second one ir 'right'
    strictEqual(multiGetter.join(','),
            ',right', 'Test multi CSS getter');
});

// Test adding class to system
test('a.dom.children.addClass', function() {
    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass');

    strictEqual(document.getElementById('a.dom.testtag').className,
                'a.dom.testaddclass',
                'Test class');

    // We try a second time
    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass');
    strictEqual(document.getElementById('a.dom.testid').className,
                'a.dom.testaddclass',
                'Test class');
});

// Test checking class existence
test('a.dom.children.hasClass', function() {
    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass');

    strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.testid'])
                .hasClass('a.dom.testaddclass'),
        true,
        'Test simple hasclass'
    );

    strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.testid'])
                .hasClass('wrong'),
        false,
        'Test no hasclass'
    );

    // Mixed (has and not has) give false result
    strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.children.parenttest'])
                .hasClass('a.dom.testaddclass'),
        false,
        'Test mixed wrong hasclass'
    );
});

// Test remove class
test('a.dom.children.removeClass', function() {
    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass')
                .removeClass('a.dom.testaddclass');

    strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.testid'])
                .hasClass('a.dom.testaddclass'),
        false,
        'Test no class setted'
    );

    // Trying to setup many classes and remove all of them
    // Then check space
    a.dom.id('a.dom.testid').addClass('a.dom.specialclass')
            .addClass('a.dom.secondclass');
    a.dom.id('a.dom.testid').removeClass('a.dom.specialclass')
            .removeClass('a.dom.secondclass');

    strictEqual(
        document.getElementById('a.dom.testid').className,
        '',
        'Test empty classname'
    );
});

// Test toggle class
test('a.dom.children.toggleClass', function() {
    // We set one class, and not the other
    a.dom.id('a.dom.testid').addClass('a.dom.toggletest');

    a.dom.id(['a.dom.testtag', 'a.dom.testid'])
        .toggleClass('a.dom.toggletest');

    strictEqual(a.dom.id('a.dom.testtag').hasClass('a.dom.toggletest'),
            true, 'Test has class is true');
    strictEqual(a.dom.id('a.dom.testid').hasClass('a.dom.toggletest'),
            false, 'Test has class is false');

    // We invert again
    a.dom.id(['a.dom.testtag', 'a.dom.testid'])
        .toggleClass('a.dom.toggletest');

    strictEqual(a.dom.id('a.dom.testtag').hasClass('a.dom.toggletest'),
            false, 'Test has class inverted is false');
    strictEqual(a.dom.id('a.dom.testid').hasClass('a.dom.toggletest'),
            true, 'Test has class inverted is true');
});

test('a.dom.children.bind', function() {

});

test('a.dom.children.unbind', function() {

});

// Test getting sub element by tag
test('a.dom.children.tag', function() {
    var sub = a.dom.id('a.dom.testtag').tag('a').getElements();

    strictEqual(sub.length, 2, 'Test length');
    strictEqual(sub[0].nodeName, 'A', 'Test node name');
    strictEqual(sub[1].nodeName, 'A', 'Test second node name');

    // TODO: do a double tag check .tag().tag()
    var subsub = a.dom.id('a.dom.testtag').tag('span').tag('i').getElements();
    strictEqual(subsub.length, 1, 'Test length');
    strictEqual(a.dom.el(subsub[0]).hasClass('a.dom.testclass'), true,
                                                'Test element');
});

// Test selecting threw attribute
test('a.dom.children.attr', function() {
    var attr1 = a.dom.id('a.dom.testidattr')
        .attr('data-attr-test').getElements();
    strictEqual(attr1.length, 2, 'Test length');


    var attr2 = a.dom.id('a.dom.testidattr')
        .attr('data-attr-test', 'a.dom.secondtestattr').getElements();
    strictEqual(attr2.length, 1, 'Test length');
});

test('a.dom.children.attribute', function() {

});

test('a.dom.children.data', function() {

});

// Test going to parent element
test('a.dom.children.parent', function() {
    // Point to same element id 'a.dom.secondtesttag'
    var elements = a.dom.id('a.dom.secondtesttag').tag('a').parent()
                    .getElements();
    strictEqual(elements.length, 1, 'Test length');
    strictEqual(elements[0].id, 'a.dom.secondtesttag', 'Test element result');

    // Two children 'a.dom.children.parent' and same parent give back
    // only one parent
    var sub = a.dom.cls('a.dom.children.parent').parent().getElements();
    strictEqual(sub.length, 1, 'Test only one parent is selected');
    console.log(sub);
    strictEqual(sub[0].id, 'a.dom.children.parenttest', 'Test element');
});

test('a.dom.children.children', function() {

});

test('a.dom.children.insertBefore', function() {

});

test('a.dom.children.insertAfter', function() {

});

test('a.dom.children.empty', function() {

});

test('a.dom.children.remove', function() {

});

test('a.dom.children.append', function() {

});

test('a.dom.children.replace', function() {

});

test('a.dom.children.each', function() {

});