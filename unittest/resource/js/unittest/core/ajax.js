// Unit test for a.ajax

QUnit.module('core/ajax.js');

/*
---------------------------------
  HEADER RELATED
---------------------------------
*/
// Test sending header and getting reply (may fail on some server due to PHP side limit)
QUnit.asyncTest('a.ajax.header', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/header.php',
        type : 'raw',
        cache : true,
        header : {
            unittest : 'youpi'
        }
    }, function(res){
        assert.strictEqual(res, 'youpi', 'Testing header passed threw request');
        start();
    });

    // Starting and waiting reply
    ajx.send();
});

/*
---------------------------------
  ABORT RELATED
---------------------------------
*/
QUnit.asyncTest('a.ajax.abort', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/abort.php',
        type : 'raw',
        cache : true
    }, function(){
        assert.strictEqual(false, true, 'The abort has not been used');
        start();
    }, function() {
        assert.strictEqual(true, true, 'abort works');
        start();
    });

    // Starting and waiting reply
    ajx.send();
    // Aborting request, and check fail
    ajx.abort();
});

/*
---------------------------------
  DEFAULT OPTIONS RELATED
---------------------------------
*/
// Usage of defaultOptions
QUnit.asyncTest('a.ajax.defaultOptions', function(assert) {
    assert.expect(2);

    // We setup same request as header one, but with defaultOptions
    a.setDefaultAjaxOptions({
        url : './resource/data/ajax/header.php',
        type : 'raw',
        cache : true,
        header : {
            unittest : 'youpi'
        }
    });

    // Test url
    assert.strictEqual(a.getDefaultAjaxOptions().url,
            './resource/data/ajax/header.php', 'Test default options stored');

    var ajx = new a.ajax({}, function(res){
        assert.strictEqual(res, 'youpi', 'Testing header passed threw request');
        // Now test is done => clear
        a.setDefaultAjaxOptions({});
        start();
    });

    // Starting and waiting reply
    ajx.send();
});

QUnit.asyncTest('a.ajax.defaultOptions-mixed', function(assert) {
    assert.expect(2);

    // We setup same request as header one, but with defaultOptions
    a.setDefaultAjaxOptions({
        url : './resource/data/ajax/data.php',
        type : 'raw',
        cache : true,
        data : {
            unittest : 'great'
        }
    });

    // Test url
    assert.strictEqual(a.getDefaultAjaxOptions().url,
            './resource/data/ajax/data.php', 'Test default options stored');

    var ajx = new a.ajax({
        data : {
            second : 'great'
        }
    }, function(res){
        assert.strictEqual(res, 'get=unittest|greatsecond|great',
    'Testing data passed threw request (mixed between default and options)');
        // Now test is done => clear
        a.setDefaultAjaxOptions({});
        start();
    });

    // Starting and waiting reply
    ajx.send();
});


/*
---------------------------------
  TEMPLATE RELATED
---------------------------------
*/
QUnit.asyncTest('a.ajax.template', function(assert) {
    assert.expect(2);

    a.setTemplateAjaxOptions('easy', {
        url : './resource/data/ajax/data.php',
        type : 'raw',
        cache : true,
        data : {
            unittest : 'great'
        }
    });

    // Test url
    assert.strictEqual(a.getTemplateAjaxOptions('easy').url,
            './resource/data/ajax/data.php', 'Test default options stored');

    var ajx = new a.ajax({
        template: 'easy',
        data : {
            second : 'great'
        }
    }, function(res){
        assert.strictEqual(res, 'get=unittest|greatsecond|great',
    'Testing data passed threw request (mixed between default and options)');
        // Now test is done => clear
        a.setTemplateAjaxOptions('easy', {});
        start();
    });

    // Starting and waiting reply
    ajx.send();
});

QUnit.asyncTest('a.ajax.template-mixed', function(assert) {
    assert.expect(3);

    a.setTemplateAjaxOptions('easy2', {
        url : './resource/data/ajax/data.php',
        type : 'raw',
        cache : true,
        data : {
            unittest : 'great'
        }
    });

    a.setTemplateAjaxOptions('easy3', {
        data: {
            unittest2:'great2',
            // Override
            second: 'awesome'
        }
    });

    // Test url
    assert.strictEqual(a.getTemplateAjaxOptions('easy2').url,
            './resource/data/ajax/data.php', 'Test easy2 url stored');
    assert.strictEqual(a.getTemplateAjaxOptions('easy3').data.second,
            'awesome', 'Test easy3 data stored');

    var ajx = new a.ajax({
        template: ['easy2', 'easy3'],
        data : {
            second : 'great'
        }
    }, function(res){
        assert.strictEqual(res, 'get=unittest|greatunittest2|great2second|great',
    'Testing data passed threw request (mixed between default and options)');
        // Now test is done => clear
        a.setTemplateAjaxOptions('easy2', {});
        a.setTemplateAjaxOptions('easy3', {});
        start();
    });

    // Starting and waiting reply
    ajx.send();
});


/*
---------------------------------
  TYPE RELATED (JSON, XML, ...)
---------------------------------
*/
// Test JSON support
QUnit.asyncTest('a.ajax.json', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/test.json',
        type : 'json',
        cache : true
    }, function(res){
        assert.strictEqual(res.note.body, 'Content', 'Testing JSON loading');
        start();
    });

    // Starting and waiting reply
    ajx.send();
});

// test XML support
QUnit.asyncTest('a.ajax.xml', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/test.xml',
        type : 'xml',
        cache : true
    }, function(res){
        assert.strictEqual(res.getElementsByTagName('bodyt')[0].childNodes[0]
                        .nodeValue, 'Content', 'Testing XML loading');
        start();
    });

    ajx.send();
});

// Test raw data (all other) support
QUnit.asyncTest('a.ajax.raw', function(assert) {
    assert.expect(2);

    var ajx = new a.ajax({
        url : './resource/data/ajax/test.raw',
        cache : true
    }, function(res){
        // Checking no parsing has been done (XML, then JSON)
        assert.strictEqual(typeof(res.getElementsByTagName), 
                                        'undefined', 'Testing raw data');
        assert.strictEqual(typeof(res.note), 'undefined', 'Testing raw data');
        start();
    });
    ajx.send();
});


/*
---------------------------------
  ASYNC/SYNC RELATED
---------------------------------
*/
// Test synchronized request
QUnit.test('a.ajax.synchronous', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/index.php',
        method : 'POST',
        async : false,
        data : {
            'trypost' : 1
        }
    });
    var res = ajx.send();
    assert.strictEqual(res, 'post', 'Testing synchronous POST');
});

// Test async request
QUnit.asyncTest('a.ajax.asynchronous', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/index.php',
        method : 'POST',
        data : {
            'trypost' : 1
        }
    }, function(res){
        assert.strictEqual(res, 'post', 'Testing asynchronous POST');
        start();
    });

    ajx.send();
});

// Test async request error response while accessing result in sync mode
QUnit.test('a.ajax.asynchronous-problem', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/index.php',
        method : 'POST',
        data : {
            'trypost' : 1
        }
    });
    var res = ajx.send();

    assert.strictEqual(res, 'No return in async mode',
            'Testing asynchronous used as synchrnous one give bad results');
});



/*
---------------------------------
  CACHE/NOCACHE RELATED
---------------------------------
*/
// Test cache
QUnit.asyncTest('a.ajax.get-cache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php'
    }, function(res){
        // All parameters are printed to output,
        // here cachedisable should appears
        assert.strictEqual(res, 'get=cachedisable', 'Testing get cache');
        start();
    });

    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.get-nocache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true
    }, function(res){
        // All parameters are printed to output,
        // empty string means no parameters where passed...
        assert.strictEqual(res, 'get=', 'Testing get no cache');
        start();
    });
    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.post-cache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'POST'
    }, function(res){
        // All parameters are printed to output,
        // here cachedisable should appears
        assert.strictEqual(res, 'post=cachedisable', 'Testing post cache');
        start();
    });
    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.post-nocache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'POST',
        // Bug : on IE, sending a POST without data is sended as GET...
        data : {
            ok : 'ok'
        }
    }, function(res){
        // All parameters are printed to output,
        // empty string means no parameters where passed...
        assert.strictEqual(res, 'post=ok', 'Testing post no cache');
        start();
    });

    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.put-cache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'PUT'
    }, function(res){
        // All parameters are printed to output,
        // here cachedisable should appears
        assert.strictEqual(res, 'put=cachedisable', 'Testing put cache');
        start();
    });
    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.put-nocache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'PUT'
    }, function(res){
        // All parameters are printed to output,
        // empty string means no parameters where passed...
        assert.strictEqual(res, 'put=', 'Testing put no cache');
        start();
    });

    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.delete-cache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'DELETE'
    }, function(res){
        // All parameters are printed to output,
        // here cachedisable should appears
        assert.strictEqual(res, 'delete=cachedisable', 'Testing delete cache');
        start();
    });

    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.delete-nocache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'DELETE'
    }, function(res){
        // All parameters are printed to output,
        // empty string means no parameters where passed...
        assert.strictEqual(res, 'delete=', 'Testing delete no cache');
        start();
    });
    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.options-cache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'OPTIONS'
    }, function(res){
        // All parameters are printed to output,
        // here cachedisable should appears
        assert.strictEqual(res, 'options=cachedisable', 'Testing options cache');
        start();
    });
    ajx.send();
});

// Test cache
QUnit.asyncTest('a.ajax.options-nocache', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'OPTIONS'
    }, function(res){
        // All parameters are printed to output,
        // empty string means no parameters where passed...
        assert.strictEqual(res, 'options=', 'Testing options no cache');
        start();
    });

    ajx.send();
});


/*
---------------------------------
  HTTP VERB (GET, POST, ...) RELATED
---------------------------------
*/
// Test HTTP mode
QUnit.asyncTest('a.ajax.get-single', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        assert.strictEqual(res, 'get=gettest|ok', 'Testing get parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.get-multiple', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        assert.strictEqual(res, 'get=gettest|oksecondtest|oktoo',
                                    'Testing get parameter');
        start();
    });
    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.post-single', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'POST',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        assert.strictEqual(res, 'post=gettest|ok', 'Testing post parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.post-multiple', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'POST',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        assert.strictEqual(res, 'post=gettest|oksecondtest|oktoo',
                                    'Testing post parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.put-single', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'PUT',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        assert.strictEqual(res, 'put=gettest|ok', 'Testing put parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.put-multiple', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'PUT',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        assert.strictEqual(res, 'put=gettest|oksecondtest|oktoo',
                                        'Testing put parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.delete-single', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'DELETE',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        assert.strictEqual(res, 'delete=gettest|ok', 'Testing delete parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.delete-multiple', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'DELETE',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        assert.strictEqual(res, 'delete=gettest|oksecondtest|oktoo',
                                            'Testing delete parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.options-single', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'OPTIONS',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        assert.strictEqual(res, 'options=gettest|ok', 'Testing options parameter');
        start();
    });

    ajx.send();
});

// Test HTTP mode
QUnit.asyncTest('a.ajax.options-multiple', function(assert) {
    assert.expect(1);

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'OPTIONS',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        assert.strictEqual(res, 'options=gettest|oksecondtest|oktoo',
                                        'Testing options parameter');
        start();
    });

    ajx.send();
});
