// Unit test for a.loader

module('core/loader.js');

// Testing loading js file threw 'script' tag
asyncTest('a.loader.js', function() {
    expect(1);

    /*
     * We load a JS file, on this file there is a function not registrated right now
     * Inside this function, it will call strictEqual needed to validate this test
    */

    var success = function() {
        strictEqual(true, true, 'JS file loading success');
        start();
    };

    // Loading file
    a.loader.js('./resource/data/loader/test.js', function() {
        unittest_load_js(success);
    });
});

// Testing loading jsonp file threw 'script' tag
asyncTest('a.loader.jsonp', function() {
    expect(1);

    /*
     * JSONP is almost the same as JS, 
     * except success method has to be moved to 
     * window scope (because it will be called from script directly)
    */
    window.unittest_load_jsonp = function(content) {
        strictEqual(content.result, 'ok', 'JSONP file loading success');
        start();
    };

    // Loading file
    a.loader.jsonp('./resource/data/loader/test.jsonp');
});

// Testing loading json file threw ajax mode
asyncTest('a.loader.json', function() {
    expect(1);

    // Loading file
    a.loader.json('./resource/data/loader/test.json',
    function(content, status) {
        strictEqual(content.data, 'nice', 'JSON file loading success');
        start();
    });
});

// Testing loading json file threw ajax mode
asyncTest('a.loader.xml', function() {
    expect(1);

    // Loading file
    a.loader.xml('./resource/data/loader/test.xml', function(content, status) {
        strictEqual(content.getElementsByTagName('bodyt')[0].childNodes[0]
                            .nodeValue, 'Content', 'Testing XML loading');
        start();
    });
});

// Testing loading CSS files threw 'link' tag
asyncTest('a.loader.css', function() {
    expect(1);

    // We create a dummy HTML tag, we load a specific CSS files
    // Then we check style apply correctly (the style comes from CSS files)

    var div = document.createElement('div');
    div.style.display = 'none';
    div.id = 'unittest_load_css';

    if(document.body) {
        document.body.appendChild(div);
    } else {
        document.getElementsByTagName('body')[0].appendChild(div);
    }

    // Loading file
    a.loader.css('./resource/data/loader/test.css', function() {
        var el = document.getElementById('unittest_load_css'),
            height = '';

        // We wait a little to be sure CSS is parsed by system
        setTimeout(function() {
            if (el.currentStyle) {
                height = el.currentStyle['height'];
            } else if (window.getComputedStyle) {
                height = document.defaultView.getComputedStyle(el,null)
                                        .getPropertyValue('height');
            }

            strictEqual(height, '20px', 'Test CSS applies correctly');
            start();
        }, 200);
    });
});

// Testing loading html files
asyncTest('a.loader.html', function() {
    expect(1);

    // Loading file
    a.loader.html('./resource/data/loader/test.html', function(content) {
        strictEqual(content, '<a>ok</a>', 'Test HTML applies correctly');
        start();
    });
});

// Testing loading JavaFX files
/*asyncTest('a.loader.javafx', function() {
    expect(1);

    // Loading file
    a.loader.javafx(a.url + 'vendor/storage/javafx/JavaFXStorage.jar',
    function() {
        var t = document.getElementById('javafxstorage');
        strictEqual(t.Packages.javafxstorage.localStorage.testData(),
                                true, 'Test system is loaded');
        start();
    }, {
        code : 'javafxstorage.Main',
        id : 'javafxstorage'
    });
});*/


// Testing loading Flash files
asyncTest('a.loader.flash', function() {
    expect(1);

    // Append to root a div for recieving flash
    var root = document.createElement('div');
    root.id = 'swtstoragecontent';
    document.body.appendChild(root);

    var data = {
        id : 'swfstorage',
        rootId : 'swtstoragecontent',

        flashvars : {},
        params : {
            wmode: 'transparent',
            menu: 'false',
            scale: 'noScale',
            allowFullscreen: 'true',
            allowScriptAccess: 'always'
        }
    };

    // Loading file
    a.loader.flash(a.url + 'vendor/storage/flash/localStorage.swf',
    function(e) {
        var el = document.getElementById(data.id);
        strictEqual(el.testData(), true, 'Test system is loaded');
        start();
    }, data);
});


// Testing loading Silverlight files
asyncTest('a.loader.silverlight', function() {
    expect(1);

    // Append to root a div for recieving silverlight
    var root = document.createElement('div');
    root.id = 'xapstoragecontent';
    document.body.appendChild(root);

    var data = {
        id : 'xapstorage',
        rootId : 'xapstoragecontent',

        params : [{
            name : 'minRuntimeVersion',
            value : '2.0.31005.0'
        },{
            name : 'autoUpgrade',
            value : 'true'
        }]
    };

    // Loading file
    a.loader.silverlight(a.url +
        'vendor/storage/silverlight/silverlightStorage.xap', function(e) {
        var el = document.getElementById(data.id);
        strictEqual(el.Content.store.testData(), true,'Test system is loaded');
        start();
    }, data);
});