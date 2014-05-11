// Unit test for a.page (plugin)

module('plugin/template.js');


// Test template system, including translate one
asyncTest('a.template.get-working', function() {
    expect(1);

    a.template.get('./resource/data/page.template/tmpl1.html', {},
        function(content) {
            strictEqual(content, '<a>ok</a>', 'Test basic template loading');
            start();
    });
});

// Test non-XHTML compatible is refused (for now)
asyncTest('a.template.get-notworking', function() {
    expect(1);

    var data = {};

    // On IE : an exception will be raised
    var time = setTimeout(function() {
        strictEqual(true, true);
        start();
    }, 500);

    a.template.get('./resource/data/page.template/tmpl-notxhtml.html', {},
        function(content) {
            // Depends on system, it may be null or undefined
            strictEqual(content, '<a>ok<a>',
                    'Test basic template not compatible XHTML is refused');
            clearTimeout(time);
            start();
    });
});

// Test translation system is parsing content as expected BEFORE loading html
asyncTest('a.template.get-translation', function() {
    expect(2);

    var userLanguage = a.translate.getLanguage();

    // Add translate, put good language
    a.translate.add('unittest', 'welcome',
            'The welcome page', false);
    a.translate.setLanguage('unittest', false);

    a.template.get('./resource/data/page.template/tmpl-translation.html', {},
        function(content) {
            strictEqual(content, '<div id="unittest-tmpl-translation" ' +
                        'style="display:none"><a data-tr="welcome"></a></div>',
                        'Test content loaded');

            a.template.append(document.body, content);
            strictEqual(document.getElementById('unittest-tmpl-translation')
                .getElementsByTagName('a')[0].childNodes[0].nodeValue,
                'The welcome page', 'Test basic template loading');

            // Going back to default
            a.translate.setLanguage(userLanguage);

            start();
    });
});

// Test using HTML data to change content (Mustache.JS test)
asyncTest('a.template.get-data', function() {
    expect(1);

    var data = {
        name : 'Charles',
        project : 'AppStorm.JS'
    };

    a.template.get('./resource/data/page.template/tmpl-data.html', data,
        function(content) {
            a.template.append(document.body, content);
            strictEqual(document.getElementById('unittest-tmpl-data')
                .getElementsByTagName('a')[0].childNodes[0].nodeValue,
                'The project AppStorm.JS has been created by Charles',
                'Test basic template loading');
            start();
    });
});

// Test using both data and translate, on a complex system
asyncTest('a.template.get-complex', function() {
    expect(4);

    var data = {
        'stooges': [
            { 'name': 'Moe' },
            { 'name': 'Larry' },
            { 'name': 'Curly' }
        ]
    };

    var userLanguage = a.translate.getLanguage();

    // Add translate, put good language
    a.translate.add('unittest1', 'stooges',
        'One of the member was {{name}}', false);
    a.translate.add('unittest2', 'stooges',
        'Other language said it was {{name}}', false);
    a.translate.setLanguage('unittest1', false);

    a.template.get('./resource/data/page.template/tmpl-complex.html', data,
        function(content) {
            a.template.append(document.body, content);

            content = document.getElementById('unittest-tmp-complex');
            strictEqual(content.getElementsByTagName('a')[0].childNodes[0]
                .nodeValue,
                'One of the member was Moe', 'Test basic template loading');
            strictEqual(content.getElementsByTagName('a')[1].childNodes[0]
                .nodeValue,
                'One of the member was Larry', 'Test basic template loading');

            a.translate.setLanguage('unittest2', false);
            // Manually translate because element is not existing in DOM,
            // only in memory
            a.translate.translate(content);

            strictEqual(content.getElementsByTagName('a')[0].childNodes[0]
                .nodeValue,
              'Other language said it was Moe', 'Test basic template loading');
            strictEqual(content.getElementsByTagName('a')[1].childNodes[0]
                .nodeValue,
            'Other language said it was Larry', 'Test basic template loading');

            // Going back to default
            a.translate.setLanguage(userLanguage);

            start();
    });
});

// Test template system, including translate one
asyncTest('a.template.replace-working', function() {
    expect(1);

    var id = 'a.template.replace-working';

    // First we create an element into DOM
    var el = document.createElement('div');
    el.id = id;
    el.style.display = 'none';
    document.body.appendChild(el);

    var result = document.getElementById(id);

    // Now we load resource
    a.template.get('./resource/data/page.template/tmpl1.html', {},
        function(content) {
            a.template.replace(result, content, function() {
                strictEqual(result.getElementsByTagName('a')[0].innerHTML,
                    'ok', 'Test content replaced');
                start();
            });
    });
});

// Test replace with translate before replace, and also after replace to DOM
asyncTest('a.template.replace-translation', function() {
    expect(1);

    var id = 'a.template.replace-translation';

    // First we create an element into DOM
    var el = document.createElement('div');
    el.id = id;
    el.style.display = 'none';
    document.body.appendChild(el);

    var userLanguage = a.translate.getLanguage(),
        result = document.getElementById(id);

    // Add translate, put good language
    a.translate.add('unittest', 'welcome', 'The welcome page',
            false);
    a.translate.setLanguage('unittest', false);

    a.template.get('./resource/data/page.template/tmpl-translation.html', {},
        function(content) {
            a.template.replace(result, content, function() {
                strictEqual(result.getElementsByTagName('a')[0].childNodes[0]
                    .nodeValue,
                    'The welcome page', 'Test basic template loading');
                // Going back to default
                a.translate.setLanguage(userLanguage);

                start();
            });
    });
});

// Test a complex system (with translate, list & co)
asyncTest('a.template.replace-complex', function() {
    expect(4);

    var id = 'a.template.replace-complex';
    var data = {
        'stooges': [
            { 'name': 'Moe' },
            { 'name': 'Larry' },
            { 'name': 'Curly' }
        ]
    };

    // First we create an element into DOM
    var el = document.createElement('div');
    el.id = id;
    el.style.display = 'none';
    document.body.appendChild(el);

    var userLanguage = a.translate.getLanguage();

    // Add translate, put good language
    a.translate.add('unittest1', 'stooges',
        'One of the member was {{name}}', false);
    a.translate.add('unittest2', 'stooges',
        'Other language said it was {{name}}', false);
    a.translate.setLanguage('unittest1', false);

    var result = document.getElementById(id);

    a.template.get('./resource/data/page.template/tmpl-complex.html', data,
        function(content) {
            a.template.replace(result, content, function() {
                strictEqual(result.getElementsByTagName('a')[0].childNodes[0]
                    .nodeValue,
                'One of the member was Moe', 'Test basic template loading');
                strictEqual(result.getElementsByTagName('a')[1].childNodes[0]
                    .nodeValue,
                'One of the member was Larry', 'Test basic template loading');

                a.translate.setLanguage('unittest2', false);
                // Manually translate because element is not existing in DOM,
                // only in memory
                a.translate.translate();

                strictEqual(result.getElementsByTagName('a')[0].childNodes[0]
                    .nodeValue,
                    'Other language said it was Moe',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('a')[1].childNodes[0]
                    .nodeValue,
                    'Other language said it was Larry',
                    'Test basic template loading');

                // Going back to default
                a.translate.setLanguage(userLanguage);
                start();
            });
    });
});



// Test template system, append two template to same id
// (we reuse replace-working)
asyncTest('a.template.append-working', function() {
    expect(2);

    // We reuse item created previously
    var id = 'a.template.replace-working';
    var result = document.getElementById(id);

    a.template.get('./resource/data/page.template/tmpl-append.html', {},
        function(content) {
            a.template.append(result, content, function() {
                // Test from working
                strictEqual(result.getElementsByTagName('a')[0].innerHTML,
                    'ok', 'Test content append');
                // New test
                strictEqual(result.getElementsByTagName('span')[0].innerHTML,
                    'append', 'Test content append');
                start();
            });
    });
});

// Test translation system, append two template on same id
// (we reuse replace-translate)
asyncTest('a.template.append-translation', function() {
    expect(2);

    var id = 'a.template.replace-translation';
    var data = {};

    var userLanguage = a.translate.getLanguage();
    var result = document.getElementById(id);

    // Add translate, put good language
    a.translate.add('unittest', 'welcome',
        'The welcome page', false);
    a.translate.setLanguage('unittest');

    a.template.get('./resource/data/page.template/tmpl-append.html', {},
        function(content) {
            a.template.append(result, content, function() {
                // Test from translation
                strictEqual(result.getElementsByTagName('a')[0].childNodes[0]
                    .nodeValue,
                    'The welcome page', 'Test basic template loading');
                // New test
                // (no need to change : the data is not translated here)
                strictEqual(result.getElementsByTagName('span')[0].innerHTML,
                    'append', 'Test content append');

                // Going back to default
                a.translate.setLanguage(userLanguage);

                start();
            });
    });
});

// Test appending to a complex system, another complex system, works.
asyncTest('a.template.append-complex', function() {
    expect(8);

    var id = 'a.template.replace-complex';
    var data = {
        'section': [
            { 'label': 'Physics' },
            { 'label': 'Math' }
        ]
    };

    var userLanguage = a.translate.getLanguage();

    // Add translate, put good language
    a.translate.add('unittest1', 'stooges',
        'One of the member was {{name}}', false);
    a.translate.add('unittest1', 'woot',
        'He study in {{label}}', false);
    a.translate.add('unittest2', 'stooges',
        'Other language said it was {{name}}', false);
    a.translate.add('unittest2', 'woot',
        'Another stydy in {{label}}', false);
    a.translate.setLanguage('unittest1');

    var result = document.getElementById(id);

    a.template.get('./resource/data/page.template/tmpl-append-complex.html',
        data, function(content) {
            a.template.append(result, content, function() {
                strictEqual(result.getElementsByTagName('a')[0].childNodes[0]
                    .nodeValue,
                    'One of the member was Moe',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('a')[1].childNodes[0]
                    .nodeValue,
                    'One of the member was Larry',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('span')[0]
                    .childNodes[0].nodeValue, 'He study in Physics',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('span')[1]
                    .childNodes[0].nodeValue, 'He study in Math',
                    'Test basic template loading');

                a.translate.setLanguage('unittest2');
                // Manually translate because element is not existing in DOM,
                // only in memory
                a.translate.translate();

                strictEqual(result.getElementsByTagName('a')[0].childNodes[0]
                    .nodeValue,
                    'Other language said it was Moe',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('a')[1].childNodes[0]
                    .nodeValue,
                    'Other language said it was Larry',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('span')[0]
                    .childNodes[0].nodeValue, 'Another stydy in Physics',
                    'Test basic template loading');
                strictEqual(result.getElementsByTagName('span')[1]
                    .childNodes[0].nodeValue, 'Another stydy in Math',
                    'Test basic template loading');

                // Going back to default
                a.translate.setLanguage(userLanguage);

                start();
            });
    });
});


// Test loading partial template
asyncTest('a.template.partial', function() {
    expect(3);

    a.template.partial(
        'testpartial',
        './resource/data/page.template/tmpl-partial.html',
        function(name, uri) {
            strictEqual(name, 'testpartial', 'Test template name');
            strictEqual(uri, "<a id='test-partial'>hello</a>",
                'test template content');

            // Now we load the template and check everything is working
            a.template.get(
                './resource/data/page.template/tmpl-partial-container.html',
                null,
                function(content) {
                    strictEqual(content, "<a id='test-partial'>hello</a>",
                                                    'Test result');
                    start();
            });
    });
});

// Test multiple partials loading (many times)
// Prevent a bug appearing (callback not called in some cases)
asyncTest('a.template.partial-multiple', function() {
    expect(6);


    a.template.partial(
        'testpartial',
        './resource/data/page.template/tmpl-partial.html',
        function(name, uri) {
            strictEqual(name, 'testpartial', 'Test template name');
            strictEqual(uri, "<a id='test-partial'>hello</a>",
                'test template content');

            a.template.partial(
                'testpartial',
                './resource/data/page.template/tmpl-partial.html',
                function(name, uri) {
                    strictEqual(name, 'testpartial', 'Test template name');
                    strictEqual(uri, "<a id='test-partial'>hello</a>",
                        'test template content');

                    a.template.partial(
                        'testpartial',
                        './resource/data/page.template/tmpl-partial.html',
                        function(name, uri) {
                            strictEqual(name, 'testpartial', 'Test template name');
                            strictEqual(uri, "<a id='test-partial'>hello</a>",
                                'test template content');
                            start();
                    });
            });
    });
});


// Bug : using innerHTML remove onclick on sibbling children
// We do a workaround for that, but we have to be sure it will never come back
// Here is a test for.
asyncTest('a.template.children-sibling', function() {
    expect(4);

    // First : we create a dom element and add it to DOM
    var d = document.createElement('div');
    d.style.display = 'none';
    document.body.appendChild(d);

    // Second : register two elements, with two onclick linked to
    var el1 = '<a id="sibling1"></a>',
        el2 = '<a id="sibling2"></a>';

    a.template.append(d, el1);
    document.getElementById('sibling1').onclick = function() {
        strictEqual(true, true, 'test el1');
    };
    document.getElementById('sibling1').click();

    a.template.append(d, el2);
    document.getElementById('sibling2').onclick = function() {
        strictEqual(true, true, 'test el2');
    };
    document.getElementById('sibling2').click();

    document.getElementById('sibling1').click();
    document.getElementById('sibling2').click();

    start();
});