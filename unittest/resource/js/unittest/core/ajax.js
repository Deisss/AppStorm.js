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


/*
---------------------------------
  CACHE RELATED
---------------------------------
*/

// Test the caching feature to avoid to get twice a request
QUnit.asyncTest('a.ajaxCache', function(assert) {
    assert.expect(1);

    var s1 = null,
        s2 = null;

    var request = new a.ajax({
            url: './resource/data/ajax/cache.php',
            method: 'GET',
            store: '3s',
            template: ['json']
    }, function(data, status) {
        s1 = data;
    }, function(url, status) {
        s1 = -20;
    });
    
    request.send();

    // Second request which should skip ajax
    setTimeout(function() {
        var request2 = new a.ajax({
                url: './resource/data/ajax/cache.php',
                method: 'GET',
                template: ['json']
        }, function(data, status) {
            s2 = data;

            assert.strictEqual(s1, s2, 'Test dual result');
            QUnit.start();

        }, function(url, status) {
        });
        
        request2.send();
    }, 1000);
});




/*
---------------------------------
  MODELS RELATED
---------------------------------
*/
// Test auto-convert into single model
QUnit.asyncTest('a.ajax.model-single', function(assert) {
    assert.expect(4);

    // We add a model
    a.model('unittest-ajax-blog', {
        id: {
            nullable: true
        },
        name: {
            nullable: true,
            type: 'string'
        },
        text: {
            nullable: true,
            type: 'string'
        }
    });

    var request = new a.ajax({
            url: './resource/data/ajax/model.json',
            template: ['GET', 'json', 'model:unittest-ajax-blog']
    }, function(data, status) {
        assert.ok(data instanceof a.modelInstance, 'Test data type');
        assert.strictEqual(data.get('id'), 20, 'Test id');
        assert.strictEqual(data.get('name'), 'hello', 'Test name');
        assert.strictEqual(data.get('text'), 'something long', 'Test text');

        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();
        
    }, function(url, status) {
        assert.strictEqual(true, false, 'Wrong, should not fail');
    });
    
    request.send();
});



// Try to get a model which does not exist, the system should not parse anything
QUnit.asyncTest('a.ajax.model-undefined', function(assert) {
    assert.expect(2);

    var request = new a.ajax({
            url: './resource/data/ajax/model.json',
            template: ['GET', 'json', 'model:undefined-model']
    }, function(data, status) {
        assert.ok(!(data instanceof a.modelInstance), 'Test instanceof');
        assert.strictEqual(data.id, 20, 'Test id');

        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();
        
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});


// Trying to get a parsing of a model which is not related to data
QUnit.asyncTest('a.ajax.model-wrong', function(assert) {
    assert.expect(2);

    a.model('unittest-ajax-wrong', {
        // Property name
        name: {
            // Remember every property are optionals
            init: 'hello'
        }
    });

    var request = new a.ajax({
            url: './resource/data/ajax/empty.json',
            template: ['GET', 'json', 'model:unittest-ajax-wrong']
    }, function(data, status) {
        assert.ok(data instanceof a.modelInstance, 'Test data instance');
        assert.strictEqual(data.get('name'), 'hello');

        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();
        
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});


// Check the system is able to share model threw primary key
QUnit.asyncTest('a.ajax.model-shared', function(assert) {
    assert.expect(4);

    var unitModel = a.model('unittest-ajax-shared', {
        id: {
            nullable: true,
            primary: true
        },
        name: {
            nullable: true,
            type: 'string'
        },
        text: {
            nullable: true,
            type: 'string'
        }
    });

    // This element should match the name and text after request
    var first = new unitModel();
    first.set('id', 20);

    var request = new a.ajax({
            url: './resource/data/ajax/model.json',
            template: ['GET', 'json', 'model:unittest-ajax-shared']
    }, function(data, status) {
        assert.strictEqual(data.get('id'), 20, 'Test id');
        assert.strictEqual(first.get('id'), 20, 'Test original id');
        assert.strictEqual(first.get('name'), 'hello', 'Test name');
        assert.strictEqual(first.get('text'), 'something long', 'Test text');
        
        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});



// Check the system is able to share model threw primary key, in a list way
QUnit.asyncTest('a.ajax.model-list-shared', function(assert) {
    assert.expect(15);

    var unitModel = a.model('unittest-ajax-list-shared', {
        id: {
            nullable: true,
            primary: true
        },
        name: {
            nullable: true,
            primary: true,
            type: 'string'
        },
        text: {
            nullable: true,
            type: 'string'
        }
    });

    // This element should match the name and text after request
    var first = new unitModel();
    first.set('id', 20);
    first.set('name', 'hello');

    var request = new a.ajax({
            url: './resource/data/ajax/models.json',
            template: ['json', 'many', 'model:unittest-ajax-list-shared']
    }, function(data, status) {
        assert.ok(data[0] instanceof a.modelInstance, 'Test instance 1');
        assert.ok(data[1] instanceof a.modelInstance, 'Test instance 2');
        assert.ok(data[2] instanceof a.modelInstance, 'Test instance 3');

        assert.strictEqual(data[0].get('id'), 20, 'Test id 1');
        assert.strictEqual(data[1].get('id'), 21, 'Test id 2');
        assert.strictEqual(data[2].get('id'), 22, 'Test id 3');
        assert.strictEqual(first.get('id'), 20, 'Test id first');

        assert.strictEqual(data[0].get('name'), 'hello', 'Test name 0');
        assert.strictEqual(first.get('name'), 'hello', 'Test name first');
        assert.strictEqual(data[1].get('name'), 'hello2', 'Test name 2');
        assert.strictEqual(data[2].get('name'), 'hello3', 'Test name 3');

        assert.strictEqual(data[0].get('text'), 'something long',
                                                            'test text 1');
        assert.strictEqual(first.get('text'), 'something long',
                                                            'test text first');
        assert.strictEqual(data[1].get('text'), 'something long2',
                                                            'test text 2');
        assert.strictEqual(data[2].get('text'), 'something long3',
                                                            'test text 3');

        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});


// Test auto-convert into list of models 
QUnit.asyncTest('a.ajax.model-list', function(assert) {
    assert.expect(12);

    a.model('unittest-ajax-blogs', {
        id: {
            nullable: true
        },
        name: {
            nullable: true,
            type: 'string'
        },
        text: {
            nullable: true,
            type: 'string'
        }
    });

    var request = new a.ajax({
            url: './resource/data/ajax/models.json',
            template: ['GET', 'json', 'many', 'model:unittest-ajax-blogs']
    }, function(data, status) {
        // Testing 3 elements type
        assert.ok(data[0] instanceof a.modelInstance, 'Test data1 type');
        assert.ok(data[1] instanceof a.modelInstance, 'Test data2 type');
        assert.ok(data[2] instanceof a.modelInstance, 'Test data3 type');

        // Testing element 1
        assert.strictEqual(data[0].get('id'), 20, 'Test id 1');
        assert.strictEqual(data[0].get('name'), 'hello', 'Test name 1');
        assert.strictEqual(data[0].get('text'), 'something long',
                                                            'Test text 1');

        // Testing element 2
        assert.strictEqual(data[1].get('id'), 21, 'Test id 2');
        assert.strictEqual(data[1].get('name'), 'hello2', 'Test name 2');
        assert.strictEqual(data[1].get('text'), 'something long2',
                                                            'Test text 2');

        // Testing element 3
        assert.strictEqual(data[2].get('id'), 22, 'Test id 3');
        assert.strictEqual(data[2].get('name'), 'hello3', 'Test name 3');
        assert.strictEqual(data[2].get('text'), 'something long3',
                                                            'Test text 3');

        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();
        
    }, function(url, status) {
        assert.strictEqual(true, false, 'Wrong, should not fail');
    });
    
    request.send();
});


// Test to grab a list, with some element valid, some invalid
QUnit.asyncTest('a.ajax.model-list-undefined', function(assert) {
    assert.expect(6);

    a.model('unittest-ajax-invalid', {
        // Property name
        name: {
            // Remember every property are optionals
            init: 'hello24'
        }
    });

    var request = new a.ajax({
            url: './resource/data/ajax/models-not-valid.json',
            template: ['GET', 'json', 'many', 'model:unittest-ajax-invalid']
    }, function(data, status) {
        // Testing 3 elements type
        assert.ok(data[0] instanceof a.modelInstance, 'Test data1 type');
        assert.ok(data[1] instanceof a.modelInstance, 'Test data2 type');
        assert.ok(data[2] instanceof a.modelInstance, 'Test data3 type');

        // Testing element 1
        assert.strictEqual(data[0].get('name'), 'hello', 'Test name 1');

        // Testing element 2
        assert.strictEqual(data[1].get('name'), 'hello24', 'Test name 2');

        // Testing element 3
        assert.strictEqual(data[2].get('name'), 'hello24', 'Test name 3');

        // We clear
        a.modelManager.clear();
        a.modelPooler.clear();

        QUnit.start();

    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});





/*
---------------------------------
    BEFORE/AFTER RELATED
---------------------------------
*/
// Test ajax before
QUnit.asyncTest('a.ajax.before', function(assert) {
    assert.expect(1);

    // First modifier
    a.setAjaxBefore('unittest-before-1', function(params) {
        params.url = './resource/data/ajax/test.json';
        return params;
    });

    var request = new a.ajax({
            url: './resource/data/ajax/model.json',
            before: ['unittest-before-1'],
            template: ['GET', 'json']
    }, function(data, status) {
        // If those tests works, it means the url has been changed
        // by the before as expected
        assert.strictEqual(data.note.to, 'me', 'Test url content is OK');

        QUnit.start();
        
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});

// Test ajax before multiple
QUnit.asyncTest('a.ajax.before-multiple', function(assert) {
    assert.expect(1);

    // First modifier
    a.setAjaxBefore('unittest-before-2', function(params) {
        params.url = './resource/data/ajax/test';
        return params;
    });
    a.setAjaxBefore('unittest-before-3', function(params) {
        params.url += '.json';
        return params;
    });

    // Adding template
    a.setTemplateAjaxOptions('unittest-bef2', {
        before: ['unittest-before-2']
    });
    a.setTemplateAjaxOptions('unittest-bef3', {
        before: ['unittest-before-3']
    });

    var request = new a.ajax({
            url: './resource/data/ajax/model.json',
            template: ['GET', 'json', 'unittest-bef2', 'unittest-bef3']
    }, function(data, status) {
        // If those tests works, it means the url has been changed
        // by the before as expected
        assert.strictEqual(data.note.to, 'me', 'Test url content is OK');

        QUnit.start();
        
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });
    
    request.send();
});

// Test ajax after request
QUnit.asyncTest('a.ajax.after', function(assert) {
    assert.expect(1);

    a.setAjaxAfter('unittest-after-1', function(params, result) {
        return {"ok": "ok"};
    });

    var request = new a.ajax({
            url: './resource/data/ajax/model.json',
            after: ['unittest-after-1'],
            template: ['GET', 'json']
    }, function(data, status) {
        assert.strictEqual(data.ok, 'ok', 'Test replace');
        QUnit.start();
    }, function(url, status) {
        assert.strictEqual(true, false, 'Should not fail');
    });

    request.send();
});