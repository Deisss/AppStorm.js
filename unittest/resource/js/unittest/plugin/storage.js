// Unit test for a.storage (plugin)

QUnit.module('plugin/storage.js');

/*
---------------------------------
  COOKIE RELATED
---------------------------------
*/
(function() {
    var co = a.storage.cookie;
    var support = co.support;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    if(!support) {
        QUnit.testSkip('a.storage.type.cookie (STORAGE NOT SUPPORTED)');
    } else {
        QUnit.test('a.storage.type.cookie', function(assert) {
            assert.expect(9);

            // Test similar result
            assert.strictEqual(co.support, a.storage.type.cookie.support, 
                                                    'Test object binding');

            // We test : object, array, string and integer
            co.set('unittest_storage_object', obj);
            co.set('unittest_storage_array', arr);
            co.set('unittest_storage_string', str);
            co.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(co.get('unittest_storage_object'), obj,
                                                'Test cookie object storage');
            assert.deepEqual(co.get('unittest_storage_array'), arr,
                                                'Test cookie array storage');
            assert.strictEqual(co.get('unittest_storage_string'), str,
                                                'Test cookie string storage');
            assert.strictEqual(co.get('unittest_storage_integer'), integ,
                                                'Test cookie integer storage');

            // Remove item
            co.remove('unittest_storage_object');
            co.remove('unittest_storage_array');
            co.remove('unittest_storage_string');
            co.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(co.get('unittest_storage_object'), null,
                                        'Test cookie removed object storage');
            assert.strictEqual(co.get('unittest_storage_array'), null,
                                        'Test cookie removed array storage');
            assert.strictEqual(co.get('unittest_storage_string'), null,
                                        'Test cookie removed string storage');
            assert.strictEqual(co.get('unittest_storage_integer'), null,
                                        'Test cookie removed integer storage');
        });
    }
})();



/*
---------------------------------
  LOCALSTORAGE RELATED
---------------------------------
*/
(function() {
    var lo = a.storage.type.localStorage;
    var support = lo.support;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    if(!support) {
        QUnit.testSkip('a.storage.type.localStorage (STORAGE NOT SUPPORTED)');
    } else {
        QUnit.test('a.storage.type.localStorage', function(assert) {
            assert.expect(8);

            // We test : object, array, string and integer
            lo.set('unittest_storage_object', obj);
            lo.set('unittest_storage_array', arr);
            lo.set('unittest_storage_string', str);
            lo.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(lo.get('unittest_storage_object'), obj,
                                        'Test localStorage object storage');
            assert.deepEqual(lo.get('unittest_storage_array'), arr,
                                        'Test localStorage array storage');
            assert.strictEqual(lo.get('unittest_storage_string'), str,
                                        'Test localStorage string storage');
            assert.strictEqual(lo.get('unittest_storage_integer'), integ,
                                        'Test localStorage integer storage');

            // Remove item
            lo.remove('unittest_storage_object');
            lo.remove('unittest_storage_array');
            lo.remove('unittest_storage_string');
            lo.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(lo.get('unittest_storage_object'), null,
                                'Test localStorage removed object storage');
            assert.strictEqual(lo.get('unittest_storage_array'), null,
                                'Test localStorage removed array storage');
            assert.strictEqual(lo.get('unittest_storage_string'), null,
                                'Test localStorage removed string storage');
            assert.strictEqual(lo.get('unittest_storage_integer'), null,
                                'Test localStorage removed integer storage');
        });
    }
})();



/*
---------------------------------
  GLOBALSTORAGE RELATED
---------------------------------
*/
(function() {
    var gl = a.storage.type.globalStorage;
    var support = gl.support;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    if(!support) {
        QUnit.testSkip('a.storage.type.globalStorage (STORAGE NOT SUPPORTED)');
    } else {
        QUnit.test('a.storage.type.globalStorage', function(assert) {
            assert.expect(8);

            // We test : object, array, string and integer
            gl.set('unittest_storage_object', obj);
            gl.set('unittest_storage_array', arr);
            gl.set('unittest_storage_string', str);
            gl.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(gl.get('unittest_storage_object'), obj,
                                    'Test globalStorage object storage');
            assert.deepEqual(gl.get('unittest_storage_array'), arr,
                                    'Test globalStorage array storage');
            assert.strictEqual(gl.get('unittest_storage_string'), str,
                                    'Test globalStorage string storage');
            assert.strictEqual(gl.get('unittest_storage_integer'), integ,
                                    'Test globalStorage integer storage');

            // Remove item
            gl.remove('unittest_storage_object');
            gl.remove('unittest_storage_array');
            gl.remove('unittest_storage_string');
            gl.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(gl.get('unittest_storage_object'), null,
                                'Test globalStorage removed object storage');
            assert.strictEqual(gl.get('unittest_storage_array'), null,
                                'Test globalStorage removed array storage');
            assert.strictEqual(gl.get('unittest_storage_string'), null,
                                'Test globalStorage removed string storage');
            assert.strictEqual(gl.get('unittest_storage_integer'), null,
                                'Test globalStorage removed integer storage');
        });
    }
})();



/*
---------------------------------
  MEMORY STORE RELATED
---------------------------------
*/
(function() {
    var mem = a.storage.type.memory;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    QUnit.test('a.storage.type.memory', function(assert) {
        assert.expect(9);

        assert.strictEqual(mem.support, true,
                            'Test support is always ok on memory store');

        // We test : object, array, string and integer
        mem.set('unittest_storage_object', obj);
        mem.set('unittest_storage_array', arr);
        mem.set('unittest_storage_string', str);
        mem.set('unittest_storage_integer', integ);

        // Set items
        assert.deepEqual(mem.get('unittest_storage_object'), obj,
                                                'Test memory object storage');
        assert.deepEqual(mem.get('unittest_storage_array'), arr,
                                                'Test memory array storage');
        assert.strictEqual(mem.get('unittest_storage_string'), str,
                                                'Test memory string storage');
        assert.strictEqual(mem.get('unittest_storage_integer'), integ,
                                                'Test memory integer storage');

        // Remove item
        mem.remove('unittest_storage_object');
        mem.remove('unittest_storage_array');
        mem.remove('unittest_storage_string');
        mem.remove('unittest_storage_integer');

        // Test removed
        assert.strictEqual(mem.get('unittest_storage_object'), null,
                                        'Test memory removed object storage');
        assert.strictEqual(mem.get('unittest_storage_array'), null,
                                        'Test memory removed array storage');
        assert.strictEqual(mem.get('unittest_storage_string'), null,
                                        'Test memory removed string storage');
        assert.strictEqual(mem.get('unittest_storage_integer'), null,
                                        'Test memory removed integer storage');
    });
})();



/*
---------------------------------
  SESSIONSTORAGE RELATED
---------------------------------
*/
(function() {
    var se = a.storage.type.sessionStorage;
    var support = se.support;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    if(!support) {
        QUnit.testSkip('a.storage.type.sessionStorage (STORAGE NOT SUPPORTED)');
    } else {
        QUnit.test('a.storage.type.sessionStorage', function(assert) {
            assert.expect(8);

            // We test : object, array, string and integer
            se.set('unittest_storage_object', obj);
            se.set('unittest_storage_array', arr);
            se.set('unittest_storage_string', str);
            se.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(se.get('unittest_storage_object'), obj,
                                        'Test sessionStorage object storage');
            assert.deepEqual(se.get('unittest_storage_array'), arr,
                                        'Test sessionStorage array storage');
            assert.strictEqual(se.get('unittest_storage_string'), str,
                                        'Test sessionStorage string storage');
            assert.strictEqual(se.get('unittest_storage_integer'), integ,
                                        'Test sessionStorage integer storage');

            // Remove item
            se.remove('unittest_storage_object');
            se.remove('unittest_storage_array');
            se.remove('unittest_storage_string');
            se.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(se.get('unittest_storage_object'), null,
                                'Test sessionStorage removed object storage');
            assert.strictEqual(se.get('unittest_storage_array'), null,
                                'Test sessionStorage removed array storage');
            assert.strictEqual(se.get('unittest_storage_string'), null,
                                'Test sessionStorage removed string storage');
            assert.strictEqual(se.get('unittest_storage_integer'), null,
                                'Test sessionStorage removed integer storage');
        });
    }
})();



/*
---------------------------------
  USERDATA (IE ONLY) RELATED
---------------------------------
*/
(function() {
    var ud = a.storage.type.userData;
    var support = ud.support;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    if(!support) {
        QUnit.testSkip('a.storage.type.userData (STORAGE NOT SUPPORTED)');
    } else {
        QUnit.test('a.storage.type.userData', function(assert) {
            assert.expect(8);

            // We test : object, array, string and integer
            ud.set('unittest_storage_object', obj);
            ud.set('unittest_storage_array', arr);
            ud.set('unittest_storage_string', str);
            ud.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(ud.get('unittest_storage_object'), obj,
                                            'Test userData object storage');
            assert.deepEqual(ud.get('unittest_storage_array'), arr,
                                            'Test userData array storage');
            assert.strictEqual(ud.get('unittest_storage_string'), str,
                                            'Test userData string storage');
            assert.strictEqual(ud.get('unittest_storage_integer'), integ,
                                            'Test userData integer storage');

            // Remove item
            ud.remove('unittest_storage_object');
            ud.remove('unittest_storage_array');
            ud.remove('unittest_storage_string');
            ud.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(ud.get('unittest_storage_object'), null,
                                    'Test userData removed object storage');
            assert.strictEqual(ud.get('unittest_storage_array'), null,
                                    'Test userData removed array storage');
            assert.strictEqual(ud.get('unittest_storage_string'), null,
                                    'Test userData removed string storage');
            assert.strictEqual(ud.get('unittest_storage_integer'), null,
                                    'Test userData removed integer storage');
        });
    }
})();



/*
---------------------------------
  FLASH RELATED
---------------------------------
*/
(function() {
    var fl = a.storage.type.flash;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    QUnit.asyncTest('a.storage.type.flash', function(assert) {
        assert.expect(8);

        fl.start(function() {
            // We test : object, array, string and integer
            fl.set('unittest_storage_object', obj);
            fl.set('unittest_storage_array', arr);
            fl.set('unittest_storage_string', str);
            fl.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(fl.get('unittest_storage_object'), obj,
                                                'Test flash object storage');
            assert.deepEqual(fl.get('unittest_storage_array'), arr,
                                                'Test flash array storage');
            assert.strictEqual(fl.get('unittest_storage_string'), str,
                                                'Test flash string storage');
            assert.strictEqual(fl.get('unittest_storage_integer'), integ,
                                                'Test flash integer storage');

            // Remove item
            fl.remove('unittest_storage_object');
            fl.remove('unittest_storage_array');
            fl.remove('unittest_storage_string');
            fl.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(fl.get('unittest_storage_object'), null,
                                        'Test flash removed object storage');
            assert.strictEqual(fl.get('unittest_storage_array'), null,
                                        'Test flash removed array storage');
            assert.strictEqual(fl.get('unittest_storage_string'), null,
                                        'Test flash removed string storage');
            assert.strictEqual(fl.get('unittest_storage_integer'), null,
                                        'Test flash removed integer storage');

            QUnit.start();
        });
    });
})();



/*
---------------------------------
  SILVERLIGHT RELATED
---------------------------------
*/
(function() {
    var sl = a.storage.type.silverlight;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    QUnit.asyncTest('a.storage.type.silverlight', function(assert) {
        assert.expect(8);

        sl.start(function() {
            // We test : object, array, string and integer
            sl.set('unittest_storage_object', obj);
            sl.set('unittest_storage_array', arr);
            sl.set('unittest_storage_string', str);
            sl.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(sl.get('unittest_storage_object'), obj,
                                        'Test silverlight object storage');
            assert.deepEqual(sl.get('unittest_storage_array'), arr,
                                        'Test silverlight array storage');
            assert.strictEqual(sl.get('unittest_storage_string'), str,
                                        'Test silverlight string storage');
            assert.strictEqual(sl.get('unittest_storage_integer'), integ,
                                        'Test silverlight integer storage');

            // Remove item
            sl.remove('unittest_storage_object');
            sl.remove('unittest_storage_array');
            sl.remove('unittest_storage_string');
            sl.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(sl.get('unittest_storage_object'), null,
                                'Test silverlight removed object storage');
            assert.strictEqual(sl.get('unittest_storage_array'), null,
                                'Test silverlight removed array storage');
            assert.strictEqual(sl.get('unittest_storage_string'), null,
                                'Test silverlight removed string storage');
            assert.strictEqual(sl.get('unittest_storage_integer'), null,
                                'Test silverlight removed integer storage');

            QUnit.start();
        });
    });
})();



/*
---------------------------------
  JAVAFX RELATED (Note : cancelled due to javaFX 'install now'
  deleting the unit-test content...)
---------------------------------
*/
/*(function() {

})();*/




/*
---------------------------------
  TEMPORARY STORAGE RELATED
---------------------------------
*/
(function() {
    var temp = a.storage.temporary;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    // Support is always true on temp because memory storage always exist
    QUnit.test('a.storage.temporary', function(assert) {
        assert.expect(9);

        assert.strictEqual(temp.support, true, 'Temporary storage is supported');

        // We test : object, array, string and integer
        temp.set('unittest_storage_object', obj);
        temp.set('unittest_storage_array', arr);
        temp.set('unittest_storage_string', str);
        temp.set('unittest_storage_integer', integ);

        // Set items
        assert.deepEqual(temp.get('unittest_storage_object'), obj,
                                            'Test temporary object storage');
        assert.deepEqual(temp.get('unittest_storage_array'), arr,
                                            'Test temporary array storage');
        assert.strictEqual(temp.get('unittest_storage_string'), str,
                                            'Test temporary string storage');
        assert.strictEqual(temp.get('unittest_storage_integer'), integ,
                                            'Test temporary integer storage');

        // Remove item
        temp.remove('unittest_storage_object');
        temp.remove('unittest_storage_array');
        temp.remove('unittest_storage_string');
        temp.remove('unittest_storage_integer');

        // Test removed
        assert.strictEqual(temp.get('unittest_storage_object'), null,
                                    'Test temporary removed object storage');
        assert.strictEqual(temp.get('unittest_storage_array'), null,
                                    'Test temporary removed array storage');
        assert.strictEqual(temp.get('unittest_storage_string'), null,
                                    'Test temporary removed string storage');
        assert.strictEqual(temp.get('unittest_storage_integer'), null,
                                    'Test temporary removed integer storage');
    });
})();




/*
---------------------------------
  PERSISTENT STORAGE RELATED
---------------------------------
*/
(function() {
    var pe = a.storage.persistent;
    var support = pe.support;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    if(!support) {
        QUnit.testSkip('a.storage.persistent (NO PERSISTENT STORAGE FOUND)');
    } else {
        QUnit.test('a.storage.persistent', function(assert) {
            assert.expect(8);

            // We test : object, array, string and integer
            pe.set('unittest_storage_object', obj);
            pe.set('unittest_storage_array', arr);
            pe.set('unittest_storage_string', str);
            pe.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(pe.get('unittest_storage_object'), obj,
                                        'Test persistent object storage');
            assert.deepEqual(pe.get('unittest_storage_array'), arr,
                                        'Test persistent array storage');
            assert.strictEqual(pe.get('unittest_storage_string'), str,
                                        'Test persistent string storage');
            assert.strictEqual(pe.get('unittest_storage_integer'), integ,
                                        'Test persistent integer storage');

            // Remove item
            pe.remove('unittest_storage_object');
            pe.remove('unittest_storage_array');
            pe.remove('unittest_storage_string');
            pe.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(pe.get('unittest_storage_object'), null,
                                    'Test persistent removed object storage');
            assert.strictEqual(pe.get('unittest_storage_array'), null,
                                    'Test persistent removed array storage');
            assert.strictEqual(pe.get('unittest_storage_string'), null,
                                    'Test persistent removed string storage');
            assert.strictEqual(pe.get('unittest_storage_integer'), null,
                                    'Test persistent removed integer storage');
        });
    }
})();




/*
---------------------------------
  EXTERNAL STORAGE RELATED
---------------------------------
*/
(function() {
    var ex = a.storage.external;

    var obj = {ok : 'ok', test : 'something', sec : {o : 'ok'}},
        arr = ['yeah', 'nope'],
        str = 'some string',
        integ = 20;

    QUnit.asyncTest('a.storage.external', function(assert) {
        assert.expect(8);

        ex.start(function() {
            // We test : object, array, string and integer
            ex.set('unittest_storage_object', obj);
            ex.set('unittest_storage_array', arr);
            ex.set('unittest_storage_string', str);
            ex.set('unittest_storage_integer', integ);

            // Set items
            assert.deepEqual(ex.get('unittest_storage_object'), obj,
                                        'Test silverlight object storage');
            assert.deepEqual(ex.get('unittest_storage_array'), arr,
                                        'Test silverlight array storage');
            assert.strictEqual(ex.get('unittest_storage_string'), str,
                                        'Test silverlight string storage');
            assert.strictEqual(ex.get('unittest_storage_integer'), integ,
                                        'Test silverlight integer storage');

            // Remove item
            ex.remove('unittest_storage_object');
            ex.remove('unittest_storage_array');
            ex.remove('unittest_storage_string');
            ex.remove('unittest_storage_integer');

            // Test removed
            assert.strictEqual(ex.get('unittest_storage_object'), null,
                                'Test silverlight removed object storage');
            assert.strictEqual(ex.get('unittest_storage_array'), null,
                                'Test silverlight removed array storage');
            assert.strictEqual(ex.get('unittest_storage_string'), null,
                                'Test silverlight removed string storage');
            assert.strictEqual(ex.get('unittest_storage_integer'), null,
                                'Test silverlight removed integer storage');

            QUnit.start();
        });
    });
})();