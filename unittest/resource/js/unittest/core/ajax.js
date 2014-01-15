// Unit test for a.ajax

module('core/ajax.js');

/*
---------------------------------
  HEADER RELATED
---------------------------------
*/
// Test sending header and getting reply (may fail on some server due to PHP side limit)
test('a.ajax.header', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/header.php',
        type : 'raw',
        cache : true,
        header : {
            unittest : 'youpi'
        }
    }, function(res){
        se(res, 'youpi', 'Testing header passed threw request');
        st();
    });

    // Starting and waiting reply
    ajx.send();
});

/*
---------------------------------
  ABORT RELATED
---------------------------------
*/
test('a.ajax.abort', function() {
    stop();
    expect(1);


    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/abort.php',
        type : 'raw',
        cache : true
    }, function(){
        se(false, true, 'The abort has not been used');
        st();
    }, function() {
        se(true, true, 'abort works');
        st();
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
test('a.ajax.defaultOptions', function() {
    stop();
    expect(2);

    // We setup same request as header one, but with defaultOptions
    a.setDefaultAjaxOptions({
        url : './resource/data/ajax/header.php',
        type : 'raw',
        cache : true,
        header : {
            unittest : 'youpi'
        }
    });

    // Prevent scope change
    var se = strictEqual,
        st = start;

    // Test url
    strictEqual(a.getDefaultAjaxOptions().url, './resource/data/ajax/header.php', 'Test default options stored');

    var ajx = new a.ajax({}, function(res){
        se(res, 'youpi', 'Testing header passed threw request');
        // Now test is done => clear
        a.setDefaultAjaxOptions({});
        st();
    });

    // Starting and waiting reply
    ajx.send();
});

test('a.ajax.defaultOptions-mixed', function() {
    stop();
    expect(2);

    // We setup same request as header one, but with defaultOptions
    a.setDefaultAjaxOptions({
        url : './resource/data/ajax/data.php',
        type : 'raw',
        cache : true,
        data : {
            unittest : 'great'
        }
    });

    // Prevent scope change
    var se = strictEqual,
        st = start;

    // Test url
    strictEqual(a.getDefaultAjaxOptions().url, './resource/data/ajax/data.php', 'Test default options stored');

    var ajx = new a.ajax({
        data : {
            second : 'great'
        }
    }, function(res){
        se(res, 'get=unittest|greatsecond|great', 'Testing data passed threw request (mixed between default and options)');
        // Now test is done => clear
        a.setDefaultAjaxOptions({});
        st();
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
test('a.ajax.json', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/test.json',
        type : 'json',
        cache : true
    }, function(res){
        se(res.note.body, 'Content', 'Testing JSON loading');
        st();
    });

    // Starting and waiting reply
    ajx.send();
});

// test XML support
test('a.ajax.xml', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/test.xml',
        type : 'xml',
        cache : true
    }, function(res){
        se(res.getElementsByTagName('bodyt')[0].childNodes[0].nodeValue, 'Content', 'Testing XML loading');
        st();
    });
    ajx.send();
});

// Test raw data (all other) support
test('a.ajax.raw', function() {
    stop();
    expect(2);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/test.raw',
        cache : true
    }, function(res){
        // Checking no parsing has been done (XML, then JSON)
        se(typeof(res.getElementsByTagName), 'undefined', 'Testing raw data');
        se(typeof(res.note), 'undefined', 'Testing raw data');
        st();
    });
    ajx.send();
});


/*
---------------------------------
  ASYNC/SYNC RELATED
---------------------------------
*/
// Test synchronized request
test('a.ajax.synchronous', function() {
    var ajx = new a.ajax({
        url : './resource/data/ajax/index.php',
        method : 'POST',
        async : false,
        data : {
            'trypost' : 1
        }
    });
    var res = ajx.send();
    strictEqual(res, 'post', 'Testing synchronous POST');
});

// Test async request
test('a.ajax.asynchronous', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/index.php',
        method : 'POST',
        data : {
            'trypost' : 1
        }
    }, function(res){
        se(res, 'post', 'Testing asynchronous POST');
        st();
    });
    ajx.send();
});

// Test async request error response while accessing result in sync mode
test('a.ajax.asynchronous-problem', function() {
    var ajx = new a.ajax({
        url : './resource/data/ajax/index.php',
        method : 'POST',
        data : {
            'trypost' : 1
        }
    });
    var res = ajx.send();

    strictEqual(res, 'No return in async mode', 'Testing asynchronous used as synchrnous one give bad results');
});



/*
---------------------------------
  CACHE/NOCACHE RELATED
---------------------------------
*/
// Test cache
test('a.ajax.get-cache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php'
    }, function(res){
        // All parameters are printed to output, here cachedisable should appears
        se(res, 'get=cachedisable', 'Testing get cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.get-nocache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true
    }, function(res){
        // All parameters are printed to output, empty string means no parameters where passed...
        se(res, 'get=', 'Testing get no cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.post-cache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'POST'
    }, function(res){
        // All parameters are printed to output, here cachedisable should appears
        se(res, 'post=cachedisable', 'Testing post cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.post-nocache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'POST',
        // Bug : on IE, sending a POST without data is sended as GET...
        data : {
            ok : 'ok'
        }
    }, function(res){
        // All parameters are printed to output, empty string means no parameters where passed...
        se(res, 'post=ok', 'Testing post no cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.put-cache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'PUT'
    }, function(res){
        // All parameters are printed to output, here cachedisable should appears
        se(res, 'put=cachedisable', 'Testing put cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.put-nocache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'PUT'
    }, function(res){
        // All parameters are printed to output, empty string means no parameters where passed...
        se(res, 'put=', 'Testing put no cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.delete-cache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'DELETE'
    }, function(res){
        // All parameters are printed to output, here cachedisable should appears
        se(res, 'delete=cachedisable', 'Testing delete cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.delete-nocache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'DELETE'
    }, function(res){
        // All parameters are printed to output, empty string means no parameters where passed...
        se(res, 'delete=', 'Testing delete no cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.options-cache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        method : 'OPTIONS'
    }, function(res){
        // All parameters are printed to output, here cachedisable should appears
        se(res, 'options=cachedisable', 'Testing options cache');
        st();
    });
    ajx.send();
});

// Test cache
test('a.ajax.options-nocache', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/input.php',
        cache : true,
        method : 'OPTIONS'
    }, function(res){
        // All parameters are printed to output, empty string means no parameters where passed...
        se(res, 'options=', 'Testing options no cache');
        st();
    });
    ajx.send();
});


/*
---------------------------------
  HTTP VERB (GET, POST, ...) RELATED
---------------------------------
*/
// Test HTTP mode
test('a.ajax.get-single', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        se(res, 'get=gettest|ok', 'Testing get parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.get-multiple', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        se(res, 'get=gettest|oksecondtest|oktoo', 'Testing get parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.post-single', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'POST',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        se(res, 'post=gettest|ok', 'Testing post parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.post-multiple', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'POST',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        se(res, 'post=gettest|oksecondtest|oktoo', 'Testing post parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.put-single', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'PUT',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        se(res, 'put=gettest|ok', 'Testing put parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.put-multiple', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'PUT',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        se(res, 'put=gettest|oksecondtest|oktoo', 'Testing put parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.delete-single', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'DELETE',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        se(res, 'delete=gettest|ok', 'Testing delete parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.delete-multiple', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'DELETE',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        se(res, 'delete=gettest|oksecondtest|oktoo', 'Testing delete parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.options-single', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'OPTIONS',
        cache : true,
        data : {
            'gettest' : 'ok'
        }
    }, function(res){
        se(res, 'options=gettest|ok', 'Testing options parameter');
        st();
    });
    ajx.send();
});

// Test HTTP mode
test('a.ajax.options-multiple', function() {
    stop();
    expect(1);

    // Prevent scope change
    var se = strictEqual,
        st = start;

    var ajx = new a.ajax({
        url : './resource/data/ajax/data.php',
        method : 'OPTIONS',
        cache : true,
        data : {
            'gettest' : 'ok',
            'secondtest' : 'oktoo'
        }
    }, function(res){
        se(res, 'options=gettest|oksecondtest|oktoo', 'Testing options parameter');
        st();
    });
    ajx.send();
});
