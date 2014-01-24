// Unit test for a.storage (plugin)

module('plugin/storage.js');

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
        testSkip('a.storage.type.cookie (STORAGE NOT SUPPORTED)');
    } else {
        test('a.storage.type.cookie', function() {
            // Test similar result
            strictEqual(co.support, a.storage.type.cookie.support, 
                                                    'Test object binding');

            // We test : object, array, string and integer
            co.set('unittest_storage_object', obj);
            co.set('unittest_storage_array', arr);
            co.set('unittest_storage_string', str);
            co.set('unittest_storage_integer', integ);

            // Set items
            deepEqual(co.get('unittest_storage_object'), obj,
                                                'Test cookie object storage');
            deepEqual(co.get('unittest_storage_array'), arr,
                                                'Test cookie array storage');
            strictEqual(co.get('unittest_storage_string'), str,
                                                'Test cookie string storage');
            strictEqual(co.get('unittest_storage_integer'), integ,
                                                'Test cookie integer storage');

            // Remove item
            co.remove('unittest_storage_object');
            co.remove('unittest_storage_array');
            co.remove('unittest_storage_string');
            co.remove('unittest_storage_integer');

            // Test removed
            strictEqual(co.get('unittest_storage_object'), null,
                                        'Test cookie removed object storage');
            strictEqual(co.get('unittest_storage_array'), null,
                                        'Test cookie removed array storage');
            strictEqual(co.get('unittest_storage_string'), null,
                                        'Test cookie removed string storage');
            strictEqual(co.get('unittest_storage_integer'), null,
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
        testSkip('a.storage.type.localStorage (STORAGE NOT SUPPORTED)');
    } else {
        test('a.storage.type.localStorage', function() {
            // We test : object, array, string and integer
            lo.set('unittest_storage_object', obj);
            lo.set('unittest_storage_array', arr);
            lo.set('unittest_storage_string', str);
            lo.set('unittest_storage_integer', integ);

            // Set items
            deepEqual(lo.get('unittest_storage_object'), obj,
                                        'Test localStorage object storage');
            deepEqual(lo.get('unittest_storage_array'), arr,
                                        'Test localStorage array storage');
            strictEqual(lo.get('unittest_storage_string'), str,
                                        'Test localStorage string storage');
            strictEqual(lo.get('unittest_storage_integer'), integ,
                                        'Test localStorage integer storage');

            // Remove item
            lo.remove('unittest_storage_object');
            lo.remove('unittest_storage_array');
            lo.remove('unittest_storage_string');
            lo.remove('unittest_storage_integer');

            // Test removed
            strictEqual(lo.get('unittest_storage_object'), null,
                                'Test localStorage removed object storage');
            strictEqual(lo.get('unittest_storage_array'), null,
                                'Test localStorage removed array storage');
            strictEqual(lo.get('unittest_storage_string'), null,
                                'Test localStorage removed string storage');
            strictEqual(lo.get('unittest_storage_integer'), null,
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
        testSkip('a.storage.type.globalStorage (STORAGE NOT SUPPORTED)');
    } else {
        test('a.storage.type.globalStorage', function() {
            // We test : object, array, string and integer
            gl.set('unittest_storage_object', obj);
            gl.set('unittest_storage_array', arr);
            gl.set('unittest_storage_string', str);
            gl.set('unittest_storage_integer', integ);

            // Set items
            deepEqual(gl.get('unittest_storage_object'), obj,
                                    'Test globalStorage object storage');
            deepEqual(gl.get('unittest_storage_array'), arr,
                                    'Test globalStorage array storage');
            strictEqual(gl.get('unittest_storage_string'), str,
                                    'Test globalStorage string storage');
            strictEqual(gl.get('unittest_storage_integer'), integ,
                                    'Test globalStorage integer storage');

            // Remove item
            gl.remove('unittest_storage_object');
            gl.remove('unittest_storage_array');
            gl.remove('unittest_storage_string');
            gl.remove('unittest_storage_integer');

            // Test removed
            strictEqual(gl.get('unittest_storage_object'), null,
                                'Test globalStorage removed object storage');
            strictEqual(gl.get('unittest_storage_array'), null,
                                'Test globalStorage removed array storage');
            strictEqual(gl.get('unittest_storage_string'), null,
                                'Test globalStorage removed string storage');
            strictEqual(gl.get('unittest_storage_integer'), null,
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

    test('a.storage.type.memory', function() {
        strictEqual(mem.support, true,
                            'Test support is always ok on memory store');

        // We test : object, array, string and integer
        mem.set('unittest_storage_object', obj);
        mem.set('unittest_storage_array', arr);
        mem.set('unittest_storage_string', str);
        mem.set('unittest_storage_integer', integ);

        // Set items
        deepEqual(mem.get('unittest_storage_object'), obj,
                                                'Test memory object storage');
        deepEqual(mem.get('unittest_storage_array'), arr,
                                                'Test memory array storage');
        strictEqual(mem.get('unittest_storage_string'), str,
                                                'Test memory string storage');
        strictEqual(mem.get('unittest_storage_integer'), integ,
                                                'Test memory integer storage');

        // Remove item
        mem.remove('unittest_storage_object');
        mem.remove('unittest_storage_array');
        mem.remove('unittest_storage_string');
        mem.remove('unittest_storage_integer');

        // Test removed
        strictEqual(mem.get('unittest_storage_object'), null,
                                        'Test memory removed object storage');
        strictEqual(mem.get('unittest_storage_array'), null,
                                        'Test memory removed array storage');
        strictEqual(mem.get('unittest_storage_string'), null,
                                        'Test memory removed string storage');
        strictEqual(mem.get('unittest_storage_integer'), null,
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
        testSkip('a.storage.type.sessionStorage (STORAGE NOT SUPPORTED)');
    } else {
        test('a.storage.type.sessionStorage', function() {
            // We test : object, array, string and integer
            se.set('unittest_storage_object', obj);
            se.set('unittest_storage_array', arr);
            se.set('unittest_storage_string', str);
            se.set('unittest_storage_integer', integ);

            // Set items
            deepEqual(se.get('unittest_storage_object'), obj,
                                        'Test sessionStorage object storage');
            deepEqual(se.get('unittest_storage_array'), arr,
                                        'Test sessionStorage array storage');
            strictEqual(se.get('unittest_storage_string'), str,
                                        'Test sessionStorage string storage');
            strictEqual(se.get('unittest_storage_integer'), integ,
                                        'Test sessionStorage integer storage');

            // Remove item
            se.remove('unittest_storage_object');
            se.remove('unittest_storage_array');
            se.remove('unittest_storage_string');
            se.remove('unittest_storage_integer');

            // Test removed
            strictEqual(se.get('unittest_storage_object'), null,
                                'Test sessionStorage removed object storage');
            strictEqual(se.get('unittest_storage_array'), null,
                                'Test sessionStorage removed array storage');
            strictEqual(se.get('unittest_storage_string'), null,
                                'Test sessionStorage removed string storage');
            strictEqual(se.get('unittest_storage_integer'), null,
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
        testSkip('a.storage.type.userData (STORAGE NOT SUPPORTED)');
    } else {
        test('a.storage.type.userData', function() {
            // We test : object, array, string and integer
            ud.set('unittest_storage_object', obj);
            ud.set('unittest_storage_array', arr);
            ud.set('unittest_storage_string', str);
            ud.set('unittest_storage_integer', integ);

            // Set items
            deepEqual(ud.get('unittest_storage_object'), obj,
                                            'Test userData object storage');
            deepEqual(ud.get('unittest_storage_array'), arr,
                                            'Test userData array storage');
            strictEqual(ud.get('unittest_storage_string'), str,
                                            'Test userData string storage');
            strictEqual(ud.get('unittest_storage_integer'), integ,
                                            'Test userData integer storage');

            // Remove item
            ud.remove('unittest_storage_object');
            ud.remove('unittest_storage_array');
            ud.remove('unittest_storage_string');
            ud.remove('unittest_storage_integer');

            // Test removed
            strictEqual(ud.get('unittest_storage_object'), null,
                                    'Test userData removed object storage');
            strictEqual(ud.get('unittest_storage_array'), null,
                                    'Test userData removed array storage');
            strictEqual(ud.get('unittest_storage_string'), null,
                                    'Test userData removed string storage');
            strictEqual(ud.get('unittest_storage_integer'), null,
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

    test('a.storage.type.flash', function() {
        stop();
        expect(8);

        var qse = QUnit.strictEqual,
            qde = QUnit.deepEqual,
            qst = QUnit.start;

        fl.start(function() {
            // We test : object, array, string and integer
            fl.set('unittest_storage_object', obj);
            fl.set('unittest_storage_array', arr);
            fl.set('unittest_storage_string', str);
            fl.set('unittest_storage_integer', integ);

            // Set items
            qde(fl.get('unittest_storage_object'), obj,
                                                'Test flash object storage');
            qde(fl.get('unittest_storage_array'), arr,
                                                'Test flash array storage');
            qse(fl.get('unittest_storage_string'), str,
                                                'Test flash string storage');
            qse(fl.get('unittest_storage_integer'), integ,
                                                'Test flash integer storage');

            // Remove item
            fl.remove('unittest_storage_object');
            fl.remove('unittest_storage_array');
            fl.remove('unittest_storage_string');
            fl.remove('unittest_storage_integer');

            // Test removed
            qse(fl.get('unittest_storage_object'), null,
                                        'Test flash removed object storage');
            qse(fl.get('unittest_storage_array'), null,
                                        'Test flash removed array storage');
            qse(fl.get('unittest_storage_string'), null,
                                        'Test flash removed string storage');
            qse(fl.get('unittest_storage_integer'), null,
                                        'Test flash removed integer storage');

            qst();
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

    test('a.storage.type.silverlight', function() {
        stop();
        expect(8);

        var qse = QUnit.strictEqual,
            qde = QUnit.deepEqual,
            qst = QUnit.start;

        sl.start(function() {
            // We test : object, array, string and integer
            sl.set('unittest_storage_object', obj);
            sl.set('unittest_storage_array', arr);
            sl.set('unittest_storage_string', str);
            sl.set('unittest_storage_integer', integ);

            // Set items
            qde(sl.get('unittest_storage_object'), obj,
                                        'Test silverlight object storage');
            qde(sl.get('unittest_storage_array'), arr,
                                        'Test silverlight array storage');
            qse(sl.get('unittest_storage_string'), str,
                                        'Test silverlight string storage');
            qse(sl.get('unittest_storage_integer'), integ,
                                        'Test silverlight integer storage');

            // Remove item
            sl.remove('unittest_storage_object');
            sl.remove('unittest_storage_array');
            sl.remove('unittest_storage_string');
            sl.remove('unittest_storage_integer');

            // Test removed
            qse(sl.get('unittest_storage_object'), null,
                                'Test silverlight removed object storage');
            qse(sl.get('unittest_storage_array'), null,
                                'Test silverlight removed array storage');
            qse(sl.get('unittest_storage_string'), null,
                                'Test silverlight removed string storage');
            qse(sl.get('unittest_storage_integer'), null,
                                'Test silverlight removed integer storage');

            qst();
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
    test('a.storage.temporary', function() {
        strictEqual(temp.support, true, 'Temporary storage is supported');

        // We test : object, array, string and integer
        temp.set('unittest_storage_object', obj);
        temp.set('unittest_storage_array', arr);
        temp.set('unittest_storage_string', str);
        temp.set('unittest_storage_integer', integ);

        // Set items
        deepEqual(temp.get('unittest_storage_object'), obj,
                                            'Test temporary object storage');
        deepEqual(temp.get('unittest_storage_array'), arr,
                                            'Test temporary array storage');
        strictEqual(temp.get('unittest_storage_string'), str,
                                            'Test temporary string storage');
        strictEqual(temp.get('unittest_storage_integer'), integ,
                                            'Test temporary integer storage');

        // Remove item
        temp.remove('unittest_storage_object');
        temp.remove('unittest_storage_array');
        temp.remove('unittest_storage_string');
        temp.remove('unittest_storage_integer');

        // Test removed
        strictEqual(temp.get('unittest_storage_object'), null,
                                    'Test temporary removed object storage');
        strictEqual(temp.get('unittest_storage_array'), null,
                                    'Test temporary removed array storage');
        strictEqual(temp.get('unittest_storage_string'), null,
                                    'Test temporary removed string storage');
        strictEqual(temp.get('unittest_storage_integer'), null,
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
        testSkip('a.storage.persistent (NO PERSISTENT STORAGE FOUND)');
    } else {
        test('a.storage.persistent', function() {
            // We test : object, array, string and integer
            pe.set('unittest_storage_object', obj);
            pe.set('unittest_storage_array', arr);
            pe.set('unittest_storage_string', str);
            pe.set('unittest_storage_integer', integ);

            // Set items
            deepEqual(pe.get('unittest_storage_object'), obj,
                                        'Test persistent object storage');
            deepEqual(pe.get('unittest_storage_array'), arr,
                                        'Test persistent array storage');
            strictEqual(pe.get('unittest_storage_string'), str,
                                        'Test persistent string storage');
            strictEqual(pe.get('unittest_storage_integer'), integ,
                                        'Test persistent integer storage');

            // Remove item
            pe.remove('unittest_storage_object');
            pe.remove('unittest_storage_array');
            pe.remove('unittest_storage_string');
            pe.remove('unittest_storage_integer');

            // Test removed
            strictEqual(pe.get('unittest_storage_object'), null,
                                    'Test persistent removed object storage');
            strictEqual(pe.get('unittest_storage_array'), null,
                                    'Test persistent removed array storage');
            strictEqual(pe.get('unittest_storage_string'), null,
                                    'Test persistent removed string storage');
            strictEqual(pe.get('unittest_storage_integer'), null,
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

    test('a.storage.external', function() {
        stop();
        expect(8);

        var qse = QUnit.strictEqual,
            qde = QUnit.deepEqual,
            qst = QUnit.start;

        ex.start(function() {
            // We test : object, array, string and integer
            ex.set('unittest_storage_object', obj);
            ex.set('unittest_storage_array', arr);
            ex.set('unittest_storage_string', str);
            ex.set('unittest_storage_integer', integ);

            // Set items
            qde(ex.get('unittest_storage_object'), obj,
                                        'Test silverlight object storage');
            qde(ex.get('unittest_storage_array'), arr,
                                        'Test silverlight array storage');
            qse(ex.get('unittest_storage_string'), str,
                                        'Test silverlight string storage');
            qse(ex.get('unittest_storage_integer'), integ,
                                        'Test silverlight integer storage');

            // Remove item
            ex.remove('unittest_storage_object');
            ex.remove('unittest_storage_array');
            ex.remove('unittest_storage_string');
            ex.remove('unittest_storage_integer');

            // Test removed
            qse(ex.get('unittest_storage_object'), null,
                                'Test silverlight removed object storage');
            qse(ex.get('unittest_storage_array'), null,
                                'Test silverlight removed array storage');
            qse(ex.get('unittest_storage_string'), null,
                                'Test silverlight removed string storage');
            qse(ex.get('unittest_storage_integer'), null,
                                'Test silverlight removed integer storage');

            qst();
        });
    });
})();