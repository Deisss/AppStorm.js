// Unit test for a.translate (plugin)

QUnit.module('plugin/translate.js', {
    teardown: function() {
        a.console.clear();
        a.translate.clear();
    }
});




/*
---------------------------------
  CURRENT LANGUAGE RELATED
---------------------------------
*/
(function() {
    // First : we keep data setted by user, the system may be already in use...
    var userCurrent = a.translate.getLanguage();

    // Test in general case, the setLanguage works,
    // try to create some translate test from that
    QUnit.test('a.translate.current-working', function(assert) {
        assert.expect(2);

        a.translate.add('en', 'somehash',
                                                'This is working', false);
        a.translate.add('de', 'somehash',
                                                'dies funktioniert', false);

        a.translate.setLanguage('en', false);

        assert.strictEqual(a.translate.get('somehash'),
                            'This is working', 'Test english translate');

        a.translate.setLanguage('de', false);

        assert.strictEqual(a.translate.get('somehash'),
                            'dies funktioniert', 'Test deutch translate');
    });

    // Test sending not string, or empty string, is refused
    QUnit.test('a.translate.current-non-string', function(assert) {
        assert.expect(2);

        // Setting an array as default translate raise an error
        a.translate.setLanguage([], false);

        var trace = a.console.trace();
        var error = trace['error'].pop();

        assert.strictEqual(error, 'a.translate.setLanguage: setting a non-string ' +
                            'lang, or empty string, as default translate: ',
                            'Test non-string value is refused');

        a.console.clear();

        a.translate.setLanguage('', false);

        trace = a.console.trace();
        error = trace['error'].pop();

        assert.strictEqual(error, 'a.translate.setLanguage: setting a non-string ' +
                            'lang, or empty string, as default translate: ',
                            'Test non-string value is refused');
    });

    // Test sending a valid, but not existing translate
    // inside 'allowed', will raise a warning, but works
    QUnit.test('a.translate.current-non-existing', function(assert) {
        assert.expect(2);

        a.translate.setLanguage('some-undefined', false);

        var trace = a.console.trace();
        var warn = trace['warn'].pop();

        assert.strictEqual(a.translate.getLanguage(), 'some-undefined',
                                                'Test translate set');
        assert.deepEqual(a.translate.getDictionnary('some-undefined'), {},
                                'Test translate created on dictionnary');
    });

    // This test is not always valid (depends if user storage is OK or not)
    if(!a.storage.persistent.support) {
        QUnit.testSkip('a.translate.current.storage (STORAGE NOT SUPPORTED)');
    } else {
        QUnit.test('a.translate.current.storage', function(assert) {
            assert.expect(2);

            a.translate.setLanguage('unittest-storage', false);
            var storageCurrent = a.storage.persistent.get('app.language');

            // Test system does not already contains unit test
            assert.strictEqual(storageCurrent, 'unittest-storage',
                                            'Test unit test setted');

            a.translate.setLanguage('unittest-storage2', false);

            // Now we compare again
            var afterStorage = a.storage.persistent.get('app.language');

            assert.strictEqual(afterStorage, 'unittest-storage2',
                'Test the latest translate has been taken in consideration');
        });
    }

    // We go back to previous situation
    a.translate.setLanguage(userCurrent, false);
})();




/*
---------------------------------
  SINGLE TRANSLATE RELATED
---------------------------------
*/
// We do some basic test with addSingle, getSingle...
QUnit.test('a.translate.single-working', function(assert) {
    assert.expect(5);

    // We set two times the same translate, to be sure system override
    // correctly
    a.translate.add('unittest-lang1', 'hash1',
                                            'The wrong translate', false);
    a.translate.add('unittest-lang1', 'hash1',
                                            'The first translate', false);

    // We check console to check translate is not defined
    var cs = a.console.trace();
    var warn = cs['warn'].pop();

    a.translate.add('unittest-lang2', 'hash1',
                                            'The second translate', false);
    a.translate.add('unittest-lang3', 'hash1',
                                            'The thrid translate', false);

    a.translate.add('unittest-lang1', 'hash2',
                                        'Another first translate', false);
    a.translate.add('unittest-lang2', 'hash2',
                                        'Another second translate', false);
    a.translate.add('unittest-lang3', 'hash2',
                                        'Another thrid translate', false);

    a.translate.setLanguage('unittest-lang1');

    assert.strictEqual(a.translate.get('hash1'),
                        'The first translate', 'Test translate translation');
    assert.strictEqual(a.translate.get('hash2'),
                    'Another first translate', 'Test translate translation');

    a.translate.setLanguage('unittest-lang3');

    assert.strictEqual(a.translate.get('hash1'),
                        'The thrid translate', 'Test translate translation');
    assert.strictEqual(a.translate.get('hash2'),
                    'Another thrid translate', 'Test translate translation');

    // Test null hash value return the hash
    assert.strictEqual(a.translate.get('unusedhash'), 'unusedhash',
                                                'Test not hash translation');
});

// Test setting a complex key and see the result
QUnit.test('a.translate.single-complex', function(assert) {
    assert.expect(1);

    var complexKey = 'I\'m a teapot; and I should not be refused';
    var value = 'ok';

    a.translate.add('unittest-complex1', complexKey, value,
                                                                false);
    a.translate.setLanguage('unittest-complex1');

    assert.strictEqual(a.translate.get(complexKey), value,
                                                'Test complex key passes');
});

// Test data binding inside translate system
QUnit.test('a.translate.single-variable', function(assert) {
    assert.expect(4);

    a.translate.add('unittest-lang1', 'hash1',
                'The first {{name}} translate for {{user}} directory', false);
    a.translate.add('unittest-lang2', 'hash1',
                'The second {{name}} translate for {{user}} directory', false);

    var fullVar = {
        name : 'system',
        user : 'Roger'
    };
    var emptyVar = {};

    var fullArrVar = ['system', 'Roger'],
        emptyArrVar = [];

    a.translate.setLanguage('unittest-lang1');

    // Performing some test on variable system (working as expected)
    assert.strictEqual(a.translate.get('hash1', emptyVar),
                                'The first  translate for  directory',
                                'Test empty var remove var code from string');
    assert.strictEqual(a.translate.get('hash1', fullVar),
                            'The first system translate for Roger directory',
                            'Test full var replace as expected inside string');

    a.translate.setLanguage('unittest-lang2');

    // Performing some test on variable system (working as expected)
    assert.strictEqual(a.translate.get('hash1', emptyVar),
                            'The second  translate for  directory',
                            'Test empty var remove var code from string');
    assert.strictEqual(a.translate.get('hash1', fullVar),
                            'The second system translate for Roger directory',
                            'Test full var replace as expected inside string');
});


/*
---------------------------------
  TRANSLATE RELATED
---------------------------------
*/
// We try to set translate directly in a single function call
QUnit.test('a.translate.translation', function(assert) {
    assert.expect(12);

    var dictEnglish = {
        hash1 : 'the hash1 english version',
        hash2 : 'the hash2 english version',
        hash3 : 'the hash3 english version'
    };
    var dictFrench = {
        hash1 : 'la version francaise de hash1',
        hash5 : 'la version francaise de hash5',
        hash3 : 'la version francaise de hash3'
    };

    a.translate.add('en', dictEnglish, false);
    a.translate.add('fr', dictFrench, false);

    // We test translate get
    var resultEnglish = a.translate.getDictionnary('en');
    var resultFrench = a.translate.getDictionnary('fr');

    assert.deepEqual(dictEnglish, resultEnglish, 'Test english translate setted');
    assert.deepEqual(dictFrench, resultFrench, 'Test french translate setted');

    // We test global get
    var result = a.translate.getDictionnary();

    assert.deepEqual(result['en'], dictEnglish, 'Test global translate');
    assert.deepEqual(result['fr'], dictFrench, 'Test global translate');

    // Test translate
    a.translate.setLanguage('en', false);
    assert.strictEqual(a.translate.get('hash1'),
                        'the hash1 english version', 'Test translate apply');
    assert.strictEqual(a.translate.get('hash2'),
                        'the hash2 english version', 'Test translate apply');
    assert.strictEqual(a.translate.get('hash3'),
                        'the hash3 english version', 'Test translate apply');
    assert.strictEqual(a.translate.get('hash5'),
                        'hash5', 'Test translate apply');

    a.translate.setLanguage('fr', false);
    assert.strictEqual(a.translate.get('hash1'),
                    'la version francaise de hash1', 'Test translate apply');
    assert.strictEqual(a.translate.get('hash2'),
                    'hash2', 'Test translate apply');
    assert.strictEqual(a.translate.get('hash3'),
                    'la version francaise de hash3', 'Test translate apply');
    assert.strictEqual(a.translate.get('hash5'),
                    'la version francaise de hash5', 'Test translate apply');
});


// In the translate test we apply translate to two types of elements :
// a createElement one, and an existing page elements
QUnit.test('a.translate.translate-working', function(assert) {
    assert.expect(4);

    var id = 'unittest-translate-working';

    // First we setup environment
    a.translate.add('en', 'home', 'Home', false);
    a.translate.add('de', 'home', 'Zuhause', false);

    // We create element
    var el = document.createElement('a');
    el.id = id;
    el.style.display = 'none';
    el.setAttribute('data-tr', 'home');
    document.body.appendChild(el);

    // We create an element, but we DONT add it to html page,
    // we ask for translate manually
    var notIncluded = document.createElement('a');
    notIncluded.setAttribute('data-tr', 'home');

    // We apply translate, and ask for system refresh
    // (by not setting noUpdate to false)
    a.translate.setLanguage('en');
    a.translate.translate(notIncluded);
    assert.strictEqual(document.getElementById(id).innerHTML, 'Home',
                                            'Test auto apply value');
    assert.strictEqual(notIncluded.innerHTML, 'Home', 'Test auto apply value');

    a.translate.setLanguage('de');
    a.translate.translate(notIncluded);
    assert.strictEqual(document.getElementById(id).innerHTML, 'Zuhause',
                                            'Test auto apply value');
    assert.strictEqual(notIncluded.innerHTML, 'Zuhause', 'Test auto apply value');
});


// In this test we try to translate with variable included inside dom
QUnit.test('a.translate.translate-variable', function(assert) {
    assert.expect(2);

    a.translate.clear();

    var id = 'unittest-translate-variable';

    // First we setup environment
    a.translate.add('en', 'welc', 'Welcome {{name}}', false);
    a.translate.add('de', 'welc', 'Willkommen {{name}}',
                                                                    false);

    var el = document.createElement('a');
    el.id = id;
    el.style.display = 'none';
    el.setAttribute('data-tr', 'welc');
    // We add a variable to this one
    el.setAttribute('data-tr-name', 'Remi');
    document.body.appendChild(el);

    a.translate.setLanguage('en');
    assert.strictEqual(document.getElementById(id).innerHTML, 'Welcome Remi',
                                                    'Test auto apply value');

    a.translate.setLanguage('de');
    assert.strictEqual(document.getElementById(id).innerHTML, 'Willkommen Remi',
                                                    'Test auto apply value');
});


// Test global variable support
QUnit.test('a.translate.global-variable', function(assert) {
    assert.expect(6);

    a.translate.clear();

    a.translate.add('en', 'welcome', 'Welcome {{name}}',
                                                                    false);
    a.translate.add('en', 'welcome2',
                                        'Welcome {{name-store}}', false);

    // We try to translate from store or not
    a.translate.setLanguage('en');

    // Test with nothing
    assert.strictEqual(a.translate.get('welcome'), 'Welcome ',
                                                    'Test without variable');
    assert.strictEqual(a.translate.get('welcome2'), 'Welcome ',
                                                    'Test without variable');

    // Test with store setted
    a.translate.setGlobalVariable('name-store', 'from store');
    assert.strictEqual(a.translate.get('welcome'), 'Welcome ',
                                                'Test with global variable');
    assert.strictEqual(a.translate.get('welcome2'),
                            'Welcome from store', 'Test with global variable');

    // Test override with local variable
    assert.strictEqual(a.translate.get('welcome',
                            {'name' : 'no store'}), 'Welcome no store',
                            'Test with global variable');
    assert.strictEqual(a.translate.get('welcome2',
                            {'name-store' : 'no store'}), 'Welcome no store',
                            'Test with global variable');
});


// Check if we change the translate for a cutom element tag,
// the system apply it as expected
QUnit.test('a.translate.translate-attr', function(assert) {
    assert.expect(1);

    a.translate.clear();

    var id = 'unittest-translate-attr';

    a.translate.add('en', 'welcome',
                                'This is title populated', false);
    a.translate.setLanguage('en');

    var el = document.createElement('a');
    el.id = id;
    el.style.display = 'none';
    el.setAttribute('data-tr', 'welcome');
    el.setAttribute('data-custom-tr', 'title');
    document.body.appendChild(el);

    a.translate.setLanguage('en');
    assert.strictEqual(document.getElementById(id).title,
                        'This is title populated', 'Test title value');
});


/*
---------------------------------
  BEHAVIOR RELATED
---------------------------------
*/
// In the translate process, a sub element with a parent translated,
// will not be altered...
QUnit.test('a.translate.translate-subelement', function(assert) {
    assert.expect(4);

    var id = 'unittest-translate-subelement';

    // First we setup environment
    a.translate.add('en', 'subelement', 'subelementcontent',
                                                                        false);
    a.translate.add('fr', 'subelement', 'translatedsub',
                                                                        false);

    var el = document.createElement('p');
    el.id = id;
    el.style.display = 'none';
    el.setAttribute('data-tr', 'subelement');

    var text = document.createTextNode('previous-translated');
    el.appendChild(text);

    var subelement = document.createElement('a');
    subelement.id = id + 'aa';
    subelement.appendChild(document.createTextNode('not translated'));
    el.appendChild(subelement);

    document.body.appendChild(el);

    function __extractDirectText(el) {
        var child = el.childNodes,
            res = '';
        for(var i=0, l=child.length; i<l; ++i) {
            if(child[i].nodeType === 3) {
                res += child[i].nodeValue;
            }
        }
        return res;
    };

    a.translate.setLanguage('fr');
    assert.strictEqual(document.getElementById(id + 'aa').innerHTML,
                    'not translated',
                    'test sub elements does still exist and are not affected');
    assert.strictEqual(__extractDirectText(document.getElementById(id)),
                    'translatedsub', 'test root element is translated');

    a.translate.setLanguage('en');
    assert.strictEqual(document.getElementById(id + 'aa').innerHTML,
                    'not translated',
                    'test sub elements does still exist and are not affected');
    assert.strictEqual(__extractDirectText(document.getElementById(id)),
                    'subelementcontent', 'test root element is translated');
});



/*
---------------------------------
  BEHAVIOR RELATED
---------------------------------
*/


// Simple easy tag tag elements translation
QUnit.test('a.translate.tag-element', function(assert) {
    assert.expect(1);

    // We generate a new translate with <tag> inside
    a.translate.add('en', 'testtag',
                    'superb text <tag> split with many <tag> tags');

    var doc = document.createElement('a');
    doc.setAttribute('data-tr', 'testtag');

    var inside1 = document.createElement('a');
    inside1.innerHTML = 'inside1';
    doc.appendChild(inside1);

    var inside2 = document.createElement('a');
    inside2.innerHTML = 'inside2';
    doc.appendChild(inside2);

    a.translate.setLanguage('en', false);
    a.translate.translate(doc);

    assert.strictEqual(doc.textContent,
        'superb text inside1 split with many inside2 tags',
        'Test auto apply value');
});

// Test when there is more <tag> elements than found into dom
QUnit.test('a.translate.tag-element-too-much', function(assert) {
    assert.expect(1);

    // We generate a new translate with <tag> inside
    a.translate.add('en', 'testtag',
                    'superb text <tag> split with <tag> many <tag> tags');

    var doc = document.createElement('a');
    doc.setAttribute('data-tr', 'testtag');

    var inside1 = document.createElement('a');
    inside1.innerHTML = 'inside1';
    doc.appendChild(inside1);

    var inside2 = document.createElement('a');
    inside2.innerHTML = 'inside2';
    doc.appendChild(inside2);

    a.translate.setLanguage('en', false);
    a.translate.translate(doc);

    assert.strictEqual(doc.textContent,
        'superb text inside1 split with inside2 many  tags',
        'Test auto apply value');
});

// Test when there is less <tag> elements than found into dom
QUnit.test('a.translate-tag-element-not-enough', function(assert) {
    assert.expect(1);

    // We generate a new translate with <tag> inside
    a.translate.add('en', 'testtag',
                    'superb text <tag> split with many tags ');

    var doc = document.createElement('a');
    doc.setAttribute('data-tr', 'testtag');

    var inside1 = document.createElement('a');
    inside1.innerHTML = 'inside1';
    doc.appendChild(inside1);

    var inside2 = document.createElement('a');
    inside2.innerHTML = 'inside2';
    doc.appendChild(inside2);

    var inside3 = document.createElement('a');
    inside3.innerHTML = 'inside3';
    doc.appendChild(inside3);

    a.translate.setLanguage('en', false);
    a.translate.translate(doc);

    assert.strictEqual(doc.textContent,
        'superb text inside1 split with many tags inside2inside3',
        'Test auto apply value');
});