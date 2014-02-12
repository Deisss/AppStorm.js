// Unit test for a.dom.*

module('core/dom.js');


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

// Test click system
test('a.dom.children.bind', function() {
    stop();
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

    var se = strictEqual,
        st = start;

    var click = function() {
        se(true, true, 'Test click has been binded');

        // Unbind and continue
        a.dom.id('a.dom.testid').unbind('click', click);
        st();
    };

    a.dom.id('a.dom.testid').bind('click', click);

    // Fake a click
    eventFire(a.dom.id('a.dom.testid').get(0), 'click');
});

// Test unbinding does work
test('a.dom.children.unbind', function() {
    stop();
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

    var se = strictEqual,
        st = start;

    var click = function() {
        alert('If you see this message it means unbind did not unbind...');
        se(true, false, 'Test click should not be fired');
    };

    a.dom.id('a.dom.testid').bind('click', click);
    a.dom.id('a.dom.testid').unbind('click', click);

    // Fake a click
    eventFire(a.dom.id('a.dom.testid').get(0), 'click');

    strictEqual(true, true, 'Fake test');

    a.timer.once(function() {
        st();
    }, null, 100);
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

// Test selecting attribute tag elements
test('a.dom.children.attribute', function() {
    // Getter test

    // Simple element
    var single = a.dom.id('a.dom.testidattr').tag('span')
            .attribute('data-attr-test');
    strictEqual(single, 'a.dom.testattr', 'Test single element');

    // Multi elements
    var multi = a.dom.id('a.dom.testidattr').children()
            .attribute('data-attr-test');
    strictEqual(multi.join(','), 'a.dom.secondtestattr,a.dom.testattr',
            'Test multi element');


    // Setter test
    a.dom.id('a.dom.testidattr').tag('span').attribute('data-some', 'ok');
    var set = a.dom.id('a.dom.testidattr').tag('span').attribute('data-some');
    strictEqual(set, 'ok', 'Test setter');
});

// Quite the same as attribute, but with (data- used always before)
test('a.dom.children.data', function() {
    // Getter

    // Simple element
    var single = a.dom.id('a.dom.testidattr').tag('span')
            .data('attr-test');
    strictEqual(single, 'a.dom.testattr', 'Test single element');

    // Multi elements
    var multi = a.dom.id('a.dom.testidattr').children()
            .data('attr-test');
    strictEqual(multi.join(','), 'a.dom.secondtestattr,a.dom.testattr',
            'Test multi element');


    // Setter test
    a.dom.id('a.dom.testidattr').tag('span').data('second', 'ok');
    var set = a.dom.id('a.dom.testidattr').tag('span').data('second');
    strictEqual(set, 'ok', 'Test setter');
});

// Multi attribute check (data-'attribute', a-'attribute', 'attribute')
test('a.dom.children.appstorm', function() {
    // Getter
    var getter = a.dom.id('a.dom.children.appstorm').children()
                    .appstorm('children-appstorm');
    strictEqual(getter.join(','), 'system,great,super', 'Array result');

    // Setter
    a.dom.id('a.dom.children.appstorm').children()
                    .appstorm('children-appstorm', 'content');
    var getter2 = a.dom.id('a.dom.children.appstorm').children()
                    .appstorm('children-appstorm');
    // It's not an array as all values are same
    strictEqual(getter2, 'content', 'Array result');
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

// Test selecting direct children
test('a.dom.children.children', function() {
    // First 'easy' test
    var first = a.dom.id('a.dom.testtag').tag('span')
                        .children().getElements();

    strictEqual(first.length, 3, 'Test length');
    strictEqual(first[0].nodeName, 'I', 'Test I tag');
    strictEqual(first[1].nodeName, 'A', 'Test A tag');
    strictEqual(first[2].nodeName, 'B', 'Test B tag');

    // Second 'hard' test
    var second = a.dom.id(['a.dom.testidattr', 'a.dom.children.parenttest'])
                        .children().getElements();
    strictEqual(second.length, 4, 'Test length');
    strictEqual(second[0].nodeName, 'SPAN', 'Test SPAN tag');
    strictEqual(second[1].nodeName, 'I', 'Test I tag');
    strictEqual(second[2].nodeName, 'A', 'Test A tag 1');
    strictEqual(second[3].nodeName, 'A', 'Test A tag 2');
});

// Testing selecting all sub children
test('a.dom.children.all', function() {
    var all = a.dom.id('a.dom.testtag').all().getElements();

    strictEqual(all.length, 5, 'Test length');
    strictEqual(all[0].nodeName, 'A', 'Test A tag');
    strictEqual(all[1].nodeName, 'SPAN', 'Test SPAN tag');
    strictEqual(all[2].nodeName, 'I', 'Test I tag');
    strictEqual(all[3].nodeName, 'A', 'Test A tag');
    strictEqual(all[4].nodeName, 'B', 'Test B tag');

    var duplicate = a.dom.id(['a.dom.testtag', 'a.dom.testtag'])
            .all().getElements();
    strictEqual(duplicate.length, 5, 'Test duplicate length');
});

// Test insertBefore elements
test('a.dom.children.insertBefore', function() {
    var div = document.createElement('div');
    div.id  = 'a.dom.children.insertBefore';
    var append = a.dom.el(div);

    a.dom.id('a.dom.children.insert').insertBefore(append);

    // Getting inserted element
    var elements = a.dom.id('a.dom.children.insert').parent().children()
                        .getElements();
    strictEqual(elements.length, 2, 'Test length');
    strictEqual(elements[0].id, 'a.dom.children.insertBefore', 'Test first');
    strictEqual(elements[1].id, 'a.dom.children.insert', 'Test second');

    // Clearing
    a.dom.id('a.dom.children.insert').parent().remove(append);
});

// Test insertAfter elements
test('a.dom.children.insertAfter', function() {
    var div = document.createElement('div');
    div.id  = 'a.dom.children.insertAfter';
    var append = a.dom.el(div);

    a.dom.id('a.dom.children.insert').insertAfter(append);

    // Getting inserted element
    var elements = a.dom.id('a.dom.children.insert').parent().children()
                        .getElements();
    strictEqual(elements.length, 2, 'Test length');
    strictEqual(elements[0].id, 'a.dom.children.insert', 'Test first');
    strictEqual(elements[1].id, 'a.dom.children.insertAfter', 'Test second');

    // Clearing
    a.dom.id('a.dom.children.insert').parent().remove(append);
});

// Test clearing content
test('a.dom.children.empty', function() {
    var clear = a.dom.id('a.dom.children.empty').empty()
        .children().getElements();
    strictEqual(clear.length, 0, 'Test empty result');
});

// Testing remove element
test('a.dom.children.remove', function() {
    var append  = document.createElement('div');
    append.id   = 'a.dom.children.insert2';

    a.dom.id('a.dom.children.insert').insertBefore(append);

    // Test remove only remove one element
    var elements = a.dom.id('a.dom.children.insert').parent()
                    .remove(document.getElementById('a.dom.children.insert'))
                    .children().getElements();
    strictEqual(elements.length, 1, 'Test length');
    strictEqual(elements[0].id, 'a.dom.children.insert2', 'Test id');

    // Re-creating first elements
    var div = document.createElement('div');
    div.id = 'a.dom.children.insert';
    a.dom.id('a.dom.children.insert2').insertBefore(div).parent()
            .remove(a.dom.id('a.dom.children.insert2'));
});

// Test appending element
test('a.dom.children.append', function() {
    var div = document.createElement('div');
    div.id  = 'a.dom.children.append';
    a.dom.id('a.dom.children.insert').parent().append(div);

    // Checking included as expected
    var elements = a.dom.id('a.dom.children.insert')
                    .parent().children().getElements();
    strictEqual(elements.length, 2, 'Test length');
    strictEqual(elements[1].id, 'a.dom.children.append');

    // We remove (rollback to default data)
    a.dom.id('a.dom.children.insert').parent().remove(div);
});

// Testing replace method
test('a.dom.children.replace', function() {
    var div = document.createElement('div');
    div.id  = 'a.dom.children.replace';
    a.dom.id('a.dom.children.insert').parent().replace(div);

    // Checking included as expected
    var elements = a.dom.id('a.dom.children.replace')
                    .parent().children().getElements();
    strictEqual(elements.length, 1, 'Test length');
    strictEqual(elements[0].id, 'a.dom.children.replace');

    // We remove (rollback to default data)
    var old = document.createElement('div');
    old.id  = 'a.dom.children.insert';
    a.dom.id('a.dom.children.replace').parent()
        .replace(old);
});

// Test data each
test('a.dom.children.each', function() {
    stop();
    expect(8);

    var se = strictEqual,
        st = start;

    // Test parameters
    a.dom.id([
            'a.dom.secondtesttag',
            'a.dom.children.parenttest'
    ]).each(function(a, b, c) {
        if(this.id == 'a.dom.secondtesttag') {
            se(this.id, 'a.dom.secondtesttag', 'Test id');
        } else {
            se(this.id, 'a.dom.children.parenttest', 'Test id');
        }
        se(a, 1, 'Test first parameter');
        se(b, 2, 'Test second parameter');
        se(c, 'test', 'Test third parameter');
    }, 1, 2, 'test');

    a.timer.once(function() {
        st();
    }, null, 50);
});