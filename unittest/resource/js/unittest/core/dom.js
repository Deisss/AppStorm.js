// Unit test for a.dom.*

QUnit.module('core/dom.js');


/*
-------------------------------------------
  GLOBAL ELEMENTS
-------------------------------------------
*/


// Testing dom id search
QUnit.test('a.dom.id', function(assert) {
    expect(7);

    // Test find one id
    var first = a.dom.id('a.dom.testid').getElements();
    assert.strictEqual(first[0].innerHTML, 'a.dom.testid', 'Test id content');
    assert.strictEqual(first.length, 1, 'Test length');

    // Test find another id
    var second = a.dom.id('a.dom.secondtestid').getElements();
    assert.strictEqual(second[0].nodeName, 'INPUT', 'Test node type found');
    assert.strictEqual(second.length, 1, 'Test length');

    // Test find multiple elements
    var elements = a.dom.id('a.dom.testid,a.dom.secondtestid').getElements();
    assert.strictEqual(elements.length, 2, 'Test length');

    var arrElements = a.dom.id(['a.dom.testid', 'a.dom.secondtestid'])
                        .getElements();
    assert.strictEqual(arrElements.length, 2, 'Test length');

    // Test unknow id does not create trouble
    var notFound = a.dom.id('supernotfound').getElements();
    assert.strictEqual(notFound.length, 0, 'Test length');
});



// Testing dom class search
QUnit.test('a.dom.cls', function(assert) {
    expect(6);

    // Test default search
    var elements = a.dom.cls('a.dom.testclass').getElements();
    assert.strictEqual(elements.length, 3, 'Test length');
    assert.strictEqual(elements[0].nodeName, 'A', 'Test first');
    assert.strictEqual(elements[1].nodeName, 'A', 'Test second');
    assert.strictEqual(elements[2].nodeName, 'I', 'Test third');

    var dual = a.dom.cls('a.dom.testclass,a.dom.secondtestclass')
                    .getElements();
    assert.strictEqual(dual.length, 4, 'Test length');

    var third = a.dom.cls(['a.dom.testclass', 'a.dom.secondtestclass'])
                    .getElements();
    assert.strictEqual(third.length, 4, 'Test length');
});



// Testing searching by tag name
QUnit.test('a.dom.tag', function(assert) {
    expect(4);

    // First easy test
    var elements = a.dom.id('a.dom.testtag').tag('a').getElements();
    assert.strictEqual(elements.length, 2, 'Test length');

    // Second test
    var sub = a.dom.id('a.dom.testtag').tag('a,i').getElements();
    assert.strictEqual(sub.length, 3, 'Test length');

    // Third test
    var sub2 = a.dom.id('a.dom.testtag').tag(['a', 'i']).getElements();
    assert.strictEqual(sub2.length, 3, 'Test length');

    // Complex test case
    var subsub = a.dom.id(['a.dom.testtag', 'a.dom.secondtesttag'])
                .tag('a,i').getElements();
    assert.strictEqual(subsub.length, 4, 'Test length');
});



// Testing searching by attribute
QUnit.test('a.dom.attr', function(assert) {
    expect(5);

    // Simple attribute check
    var first = a.dom.attr('data-attr-test', 'a.dom.testattr').getElements();
    assert.strictEqual(first.length, 2, 'Test length');
    assert.strictEqual(first[0].nodeName, 'A', 'Test A tag');
    assert.strictEqual(first[1].nodeName, 'SPAN', 'Test SPAN tag');

    // Little bit more complex attribute
    var second = a.dom.attr(
                    'data-attr-test',
                    ['a.dom.testattr', 'a.dom.secondtestattr']).getElements();
    assert.strictEqual(second.length, 3, 'Test length');

    // Much more complex attribute
    var third = a.dom.attr(
                    ['id', 'data-attr-test'],
                    ['a.dom.testid', 'a.dom.secondtestattr']
                ).getElements();
    assert.strictEqual(third.length, 2, 'Test length');
});



// Testing converting element to a.dom
QUnit.test('a.dom.el', function(assert) {
    expect(1);

    var doc = document.createElement('div');
    var el = a.dom.el(doc);

    assert.strictEqual(el.get(0).nodeName, 'DIV', 'Test passing element');
});



/*
-------------------------------------------
  CHILDREN ELEMENTS
-------------------------------------------
*/
// Test getting single element
QUnit.test('a.dom.children.get', function(assert) {
    expect(2);

    var elements = a.dom.id(['a.dom.testtag', 'a.dom.secondtesttag']);

    for(var i=0; i<2; ++i) {
        assert.strictEqual(elements.get(i).nodeName, 'DIV', 'Test node name');
    }
});

// Test getting stored elements
QUnit.test('a.dom.children.getElements', function(assert) {
    expect(3);

    var elements = a.dom.id(['a.dom.testtag', 'a.dom.secondtesttag'])
                    .getElements();
    for(var i=0, l=elements.length; i<l; ++i) {
        assert.strictEqual(elements[i].nodeName, 'DIV', 'Test node name');
    }
    assert.strictEqual(elements.length, 2, 'Test length');
});

// Test getting specific id from element
QUnit.test('a.dom.children.id', function(assert) {
    expect(2);

    var sub = a.dom.tag('div').id('a.dom.secondtesttag').getElements();

    assert.strictEqual(sub.length, 1, 'Test length');
    assert.strictEqual(sub[0].nodeName, 'DIV', 'Test node name');
});

// Test getting specific class from element
QUnit.test('a.dom.children.cls', function(assert) {
    expect(3);

    var sub = a.dom.id('a.dom.testtag').cls('a.dom.testclass').getElements();

    assert.strictEqual(sub.length, 2, 'Test length');
    assert.strictEqual(sub[0].nodeName, 'I', 'Test node name');
    assert.strictEqual(sub[1].nodeName, 'A', 'Test node name');
});

// Test setting or getting CSS attribute
QUnit.test('a.dom.children.css', function(assert) {
    expect(3);

    // Test setter
    a.dom.id('a.dom.secondtesttag').tag('a').css('text-align', 'right');

    var el = a.dom.id('a.dom.secondtesttag').tag('a').get(0);
    assert.strictEqual(el.style.textAlign, 'right', 'Test css setter');

    // Test getter
    assert.strictEqual(a.dom.id('a.dom.secondtesttag').tag('a').css('text-align'),
            'right', 'Test CSS getter');

    // Many getter
    var multiGetter = a.dom.id('a.dom.secondtesttag').tag('a,b')
                        .css('text-align');
    // First text align is blank, second one ir 'right'
    assert.strictEqual(multiGetter.join(','),
            ',right', 'Test multi CSS getter');
});

// Test adding class to system
QUnit.test('a.dom.children.addClass', function(assert) {
    expect(2);

    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass');

    assert.strictEqual(document.getElementById('a.dom.testtag').className,
                'a.dom.testaddclass',
                'Test class');

    // We try a second time
    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass');
    assert.strictEqual(document.getElementById('a.dom.testid').className,
                'a.dom.testaddclass',
                'Test class');
});

// Test checking class existence
QUnit.test('a.dom.children.hasClass', function(assert) {
    expect(3);

    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass');

    assert.strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.testid'])
                .hasClass('a.dom.testaddclass'),
        true,
        'Test simple hasclass'
    );

    assert.strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.testid'])
                .hasClass('wrong'),
        false,
        'Test no hasclass'
    );

    // Mixed (has and not has) give false result
    assert.strictEqual(
        a.dom.id(['a.dom.testtag', 'a.dom.children.parenttest'])
                .hasClass('a.dom.testaddclass'),
        false,
        'Test mixed wrong hasclass'
    );
});

// Test remove class
QUnit.test('a.dom.children.removeClass', function(assert) {
    expect(2);

    a.dom.id(['a.dom.testtag', 'a.dom.testid']).addClass('a.dom.testaddclass')
                .removeClass('a.dom.testaddclass');

    assert.strictEqual(
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

    assert.strictEqual(
        document.getElementById('a.dom.testid').className,
        '',
        'Test empty classname'
    );
});

// Test toggle class
QUnit.test('a.dom.children.toggleClass', function(assert) {
    expect(4);

    // We set one class, and not the other
    a.dom.id('a.dom.testid').addClass('a.dom.toggletest');

    a.dom.id(['a.dom.testtag', 'a.dom.testid'])
        .toggleClass('a.dom.toggletest');

    assert.strictEqual(a.dom.id('a.dom.testtag').hasClass('a.dom.toggletest'),
            true, 'Test has class is true');
    assert.strictEqual(a.dom.id('a.dom.testid').hasClass('a.dom.toggletest'),
            false, 'Test has class is false');

    // We invert again
    a.dom.id(['a.dom.testtag', 'a.dom.testid'])
        .toggleClass('a.dom.toggletest');

    assert.strictEqual(a.dom.id('a.dom.testtag').hasClass('a.dom.toggletest'),
            false, 'Test has class inverted is false');
    assert.strictEqual(a.dom.id('a.dom.testid').hasClass('a.dom.toggletest'),
            true, 'Test has class inverted is true');
});

// Test click system
QUnit.asyncTest('a.dom.children.bind', function(assert) {
    expect(1);

    // Internal function to fire click event
    function eventFire(el, etype){
        if (el.fireEvent) {
            (el.fireEvent('on' + etype));
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    };

    var click = function() {
        assert.strictEqual(true, true, 'Test click has been binded');

        // Unbind and continue
        a.dom.id('a.dom.testid').unbind('click', click);
        start();
    };

    a.dom.id('a.dom.testid').bind('click', click);

    // Fake a click
    eventFire(a.dom.id('a.dom.testid').get(0), 'click');
});

// Test click system with binding
QUnit.asyncTest('a.dom.children.bindWithScope', function(assert) {
    expect(2);

    // Internal function to fire click event
    function eventFire(el, etype){
        if (el.fireEvent) {
            (el.fireEvent('on' + etype));
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    };

    var click = function() {
        assert.strictEqual(true, true, 'Test click has been binded');
        assert.strictEqual(this.something, 'great', 'Test scope binding');

        // Unbind and continue
        a.dom.id('a.dom.testid').unbind('click', click);
        start();
    };

    var scope = {
        something: 'great'
    };

    a.dom.id('a.dom.testid').bind('click', click, scope);

    // Fake a click
    eventFire(a.dom.id('a.dom.testid').get(0), 'click');
});

// Test unbinding does work
QUnit.asyncTest('a.dom.children.unbind', function(assert) {
    expect(1);

    // Internal function to fire click event
    function eventFire(el, etype){
        if (el.fireEvent) {
            (el.fireEvent('on' + etype));
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    };

    var click = function() {
        alert('If you see this message it means unbind did not unbind...');
        assert.strictEqual(true, false, 'Test click should not be fired');
    };

    a.dom.id('a.dom.testid').bind('click', click);
    a.dom.id('a.dom.testid').unbind('click', click);

    // Fake a click
    eventFire(a.dom.id('a.dom.testid').get(0), 'click');

    assert.strictEqual(true, true, 'Fake test');

    setTimeout(start, 100);
});

// Test getting sub element by tag
QUnit.test('a.dom.children.tag', function(assert) {
    expect(5);

    var sub = a.dom.id('a.dom.testtag').tag('a').getElements();

    assert.strictEqual(sub.length, 2, 'Test length');
    assert.strictEqual(sub[0].nodeName, 'A', 'Test node name');
    assert.strictEqual(sub[1].nodeName, 'A', 'Test second node name');

    // TODO: do a double tag check .tag().tag()
    var subsub = a.dom.id('a.dom.testtag').tag('span').tag('i').getElements();
    assert.strictEqual(subsub.length, 1, 'Test length');
    assert.strictEqual(a.dom.el(subsub[0]).hasClass('a.dom.testclass'), true,
                                                'Test element');
});

// Test selecting threw attribute
QUnit.test('a.dom.children.attr', function(assert) {
    expect(2);

    var attr1 = a.dom.id('a.dom.testidattr')
        .attr('data-attr-test').getElements();
    assert.strictEqual(attr1.length, 2, 'Test length');


    var attr2 = a.dom.id('a.dom.testidattr')
        .attr('data-attr-test', 'a.dom.secondtestattr').getElements();
    assert.strictEqual(attr2.length, 1, 'Test length');
});

// Test selecting attribute tag elements
QUnit.test('a.dom.children.attribute', function(assert) {
    expect(3);

    // Getter test

    // Simple element
    var single = a.dom.id('a.dom.testidattr').tag('span')
            .attribute('data-attr-test');
    assert.strictEqual(single, 'a.dom.testattr', 'Test single element');

    // Multi elements
    var multi = a.dom.id('a.dom.testidattr').children()
            .attribute('data-attr-test');
    assert.strictEqual(multi.join(','), 'a.dom.secondtestattr,a.dom.testattr',
            'Test multi element');


    // Setter test
    a.dom.id('a.dom.testidattr').tag('span').attribute('data-some', 'ok');
    var set = a.dom.id('a.dom.testidattr').tag('span').attribute('data-some');
    assert.strictEqual(set, 'ok', 'Test setter');
});

// Quite the same as attribute, but with (data- used always before)
QUnit.test('a.dom.children.data', function(assert) {
    expect(3);

    // Simple element
    var single = a.dom.id('a.dom.testidattr').tag('span')
            .data('attr-test');
    assert.strictEqual(single, 'a.dom.testattr', 'Test single element');

    // Multi elements
    var multi = a.dom.id('a.dom.testidattr').children()
            .data('attr-test');
    assert.strictEqual(multi.join(','), 'a.dom.secondtestattr,a.dom.testattr',
            'Test multi element');


    // Setter test
    a.dom.id('a.dom.testidattr').tag('span').data('second', 'ok');
    var set = a.dom.id('a.dom.testidattr').tag('span').data('second');
    assert.strictEqual(set, 'ok', 'Test setter');
});

// Multi attribute check (data-'attribute', a-'attribute', 'attribute')
QUnit.test('a.dom.children.appstorm', function(assert) {
    expect(2);

    // Getter
    var getter = a.dom.id('a.dom.children.appstorm').children()
                    .appstorm('children-appstorm');
    assert.strictEqual(getter.join(','), 'system,great,super', 'Array result');

    // Setter
    a.dom.id('a.dom.children.appstorm').children()
                    .appstorm('children-appstorm', 'content');
    var getter2 = a.dom.id('a.dom.children.appstorm').children()
                    .appstorm('children-appstorm');
    // It's not an array as all values are same
    assert.strictEqual(getter2, 'content', 'Array result');
});

// Test going to parent element
QUnit.test('a.dom.children.parent', function(assert) {
    expect(4);

    // Point to same element id 'a.dom.secondtesttag'
    var elements = a.dom.id('a.dom.secondtesttag').tag('a').parent()
                    .getElements();
    assert.strictEqual(elements.length, 1, 'Test length');
    assert.strictEqual(elements[0].id, 'a.dom.secondtesttag', 'Test element result');

    // Two children 'a.dom.children.parent' and same parent give back
    // only one parent
    var sub = a.dom.cls('a.dom.children.parent').parent().getElements();
    assert.strictEqual(sub.length, 1, 'Test only one parent is selected');

    assert.strictEqual(sub[0].id, 'a.dom.children.parenttest', 'Test element');
});

// Test selecting direct children
QUnit.test('a.dom.children.children', function(assert) {
    expect(9);

    // First 'easy' test
    var first = a.dom.id('a.dom.testtag').tag('span')
                        .children().getElements();

    assert.strictEqual(first.length, 3, 'Test length');
    assert.strictEqual(first[0].nodeName, 'I', 'Test I tag');
    assert.strictEqual(first[1].nodeName, 'A', 'Test A tag');
    assert.strictEqual(first[2].nodeName, 'B', 'Test B tag');

    // Second 'hard' test
    var second = a.dom.id(['a.dom.testidattr', 'a.dom.children.parenttest'])
                        .children().getElements();
    assert.strictEqual(second.length, 4, 'Test length');
    assert.strictEqual(second[0].nodeName, 'SPAN', 'Test SPAN tag');
    assert.strictEqual(second[1].nodeName, 'I', 'Test I tag');
    assert.strictEqual(second[2].nodeName, 'A', 'Test A tag 1');
    assert.strictEqual(second[3].nodeName, 'A', 'Test A tag 2');
});

// Testing selecting all sub children
QUnit.test('a.dom.children.all', function(assert) {
    expect(7);

    var all = a.dom.id('a.dom.testtag').all().getElements();

    assert.strictEqual(all.length, 5, 'Test length');
    assert.strictEqual(all[0].nodeName, 'A', 'Test A tag');
    assert.strictEqual(all[1].nodeName, 'SPAN', 'Test SPAN tag');
    assert.strictEqual(all[2].nodeName, 'I', 'Test I tag');
    assert.strictEqual(all[3].nodeName, 'A', 'Test A tag');
    assert.strictEqual(all[4].nodeName, 'B', 'Test B tag');

    var duplicate = a.dom.id(['a.dom.testtag', 'a.dom.testtag'])
            .all().getElements();
    assert.strictEqual(duplicate.length, 5, 'Test duplicate length');
});

// Test insertBefore elements
QUnit.test('a.dom.children.insertBefore', function(assert) {
    expect(3);

    var div = document.createElement('div');
    div.id  = 'a.dom.children.insertBefore';
    var append = a.dom.el(div);

    a.dom.id('a.dom.children.insert').insertBefore(append);

    // Getting inserted element
    var elements = a.dom.id('a.dom.children.insert').parent().children()
                        .getElements();
    assert.strictEqual(elements.length, 2, 'Test length');
    assert.strictEqual(elements[0].id, 'a.dom.children.insertBefore', 'Test first');
    assert.strictEqual(elements[1].id, 'a.dom.children.insert', 'Test second');

    // Clearing
    a.dom.id('a.dom.children.insert').parent().remove(append);
});

// Test insertAfter elements
QUnit.test('a.dom.children.insertAfter', function(assert) {
    expect(3);

    var div = document.createElement('div');
    div.id  = 'a.dom.children.insertAfter';
    var append = a.dom.el(div);

    a.dom.id('a.dom.children.insert').insertAfter(append);

    // Getting inserted element
    var elements = a.dom.id('a.dom.children.insert').parent().children()
                        .getElements();
    assert.strictEqual(elements.length, 2, 'Test length');
    assert.strictEqual(elements[0].id, 'a.dom.children.insert', 'Test first');
    assert.strictEqual(elements[1].id, 'a.dom.children.insertAfter', 'Test second');

    // Clearing
    a.dom.id('a.dom.children.insert').parent().remove(append);
});

// Test clearing content
QUnit.test('a.dom.children.empty', function(assert) {
    expect(1);

    var clear = a.dom.id('a.dom.children.empty').empty()
        .children().getElements();
    assert.strictEqual(clear.length, 0, 'Test empty result');
});

// Testing remove element
QUnit.test('a.dom.children.remove', function(assert) {
    expect(2);

    var append  = document.createElement('div');
    append.id   = 'a.dom.children.insert2';

    a.dom.id('a.dom.children.insert').insertBefore(append);

    // Test remove only remove one element
    var elements = a.dom.id('a.dom.children.insert').parent()
                    .remove(document.getElementById('a.dom.children.insert'))
                    .children().getElements();
    assert.strictEqual(elements.length, 1, 'Test length');
    assert.strictEqual(elements[0].id, 'a.dom.children.insert2', 'Test id');

    // Re-creating first elements
    var div = document.createElement('div');
    div.id = 'a.dom.children.insert';
    a.dom.id('a.dom.children.insert2').insertBefore(div).parent()
            .remove(a.dom.id('a.dom.children.insert2'));
});

// Test appending element
QUnit.test('a.dom.children.append', function(assert) {
    expect(2);

    var div = document.createElement('div');
    div.id  = 'a.dom.children.append';
    a.dom.id('a.dom.children.insert').parent().append(div);

    // Checking included as expected
    var elements = a.dom.id('a.dom.children.insert')
                    .parent().children().getElements();
    assert.strictEqual(elements.length, 2, 'Test length');
    assert.strictEqual(elements[1].id, 'a.dom.children.append');

    // We remove (rollback to default data)
    a.dom.id('a.dom.children.insert').parent().remove(div);
});

// Testing replace method
QUnit.test('a.dom.children.replace', function(assert) {
    expect(2);

    var div = document.createElement('div');
    div.id  = 'a.dom.children.replace';
    a.dom.id('a.dom.children.insert').parent().replace(div);

    // Checking included as expected
    var elements = a.dom.id('a.dom.children.replace')
                    .parent().children().getElements();
    assert.strictEqual(elements.length, 1, 'Test length');
    assert.strictEqual(elements[0].id, 'a.dom.children.replace');

    // We remove (rollback to default data)
    var old = document.createElement('div');
    old.id  = 'a.dom.children.insert';
    a.dom.id('a.dom.children.replace').parent()
        .replace(old);
});

// Test data each
QUnit.asyncTest('a.dom.children.each', function(assert) {
    expect(8);

    // Test parameters
    a.dom.id([
            'a.dom.secondtesttag',
            'a.dom.children.parenttest'
    ]).each(function(a, b, c) {
        if(this.id == 'a.dom.secondtesttag') {
            assert.strictEqual(this.id, 'a.dom.secondtesttag', 'Test id');
        } else {
            assert.strictEqual(this.id, 'a.dom.children.parenttest', 'Test id');
        }
        assert.strictEqual(a, 1, 'Test first parameter');
        assert.strictEqual(b, 2, 'Test second parameter');
        assert.strictEqual(c, 'test', 'Test third parameter');
    }, 1, 2, 'test');

    setTimeout(start, 50);
});

// Test event binding and prevent-default
QUnit.asyncTest('a.dom.event-prevent', function(assert) {
    expect(1);

    // Internal function to fire click event
    function eventFire(el, etype){
        if (el.fireEvent) {
            (el.fireEvent('on' + etype));
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    };

    var click = function(e) {
        assert.strictEqual(e.target.id, 'a.dom.testid', 'Test click has been binded');
        e.preventDefault();
    };

    a.dom.id('a.dom.testid').bind('click', click);

    // Fake a click
    eventFire(a.dom.id('a.dom.testid').get(0), 'click');

    // Timeout to release test
    setTimeout(function() {
        a.dom.id('a.dom.testid').unbind('click', click);
        start();
    }, 200);
});