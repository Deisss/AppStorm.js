// Unit test for a.form (plugin)

module('plugin/form.js');

/*
---------------------------------
  GET TEST
---------------------------------
*/
// Test default behavior
test('a.form.get-default-test', function() {
    var id = 'a.form.get-default-test';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // We create some basic element: input, selectbox and submit button
    var input = document.createElement('input');
    input.name = id + '-input';
    input.value = 'input-ok';
    f.appendChild(input);

    // Select box
    var select = document.createElement('select');
    select.name = id + '-select';
    // Sub child
    var o1 = document.createElement('option');
    o1.value = 'select-choice1';
    select.appendChild(o1);
    var o2 = document.createElement('option');
    o2.value = 'select-choice2';
    select.appendChild(o2);
    f.appendChild(select);

    // Submit
    var submit = document.createElement('submit');
    submit.name = id + '-submit';
    submit.value = 'send';
    f.appendChild(submit);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    strictEqual(test[id + '-input'], 'input-ok', 'Test input');
    strictEqual(test[id + '-select'], 'select-choice1', 'Test select');
});


// Test checkbox
test('a.form.get-checkbox-test', function() {
    var id = 'a.form.get-checkbox-test';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // First checkbox button
    var c1 = document.createElement('input');
    c1.type = 'checkbox';
    c1.name = id + '-c1';
    c1.checked = true;
    f.appendChild(c1);

    // Second checkbox button
    var c2 = document.createElement('input');
    c2.type = 'checkbox';
    c2.name = id + '-c2';
    c2.checked = false;
    f.appendChild(c2);

    // Register element on dom
    document.body.appendChild(f);

    // Get elements
    var test = a.form.get(document.getElementById(id));

    strictEqual(test[id + '-c1'], true, 'Test first checkbox');
    strictEqual(test[id + '-c2'], false, 'Test second checkbox');
});


// Test radio button group
test('a.form.get-radio-test', function() {
    var id = 'a.form.get-radio-test';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // First radio button
    var r1 = document.createElement('input');
    r1.type = 'radio';
    r1.name = id + '-content';
    r1.value = 'r1';
    f.appendChild(r1);

    // Second radio button
    var r2 = document.createElement('input');
    r2.type = 'radio';
    r2.name = id + '-content';
    r2.value = 'r2';
    f.appendChild(r2);

    // Register element on dom
    document.body.appendChild(f);

    // Get first radio button check
    r1.checked = true;
    r2.checked = false;
    var test1 = a.form.get(document.getElementById(id));
    strictEqual(test1[id + '-content'], 'r1',
                        'Test first radio is found as checked');

    r1.checked = false;
    r2.checked = true;
    var test2 = a.form.get(document.getElementById(id));
    strictEqual(test2[id + '-content'], 'r2',
                        'Test second radio is found as checked');
});


// Test select, with or without option inside
test('a.form.select-empty', function() {
    var id = 'a.form.select-empty';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // Select element
    var sel = document.createElement('select');
    sel.name = id + '-content';
    f.appendChild(sel);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    // Test the system is not hang by not existing options
    strictEqual(test[id + '-content'], null, 'Test empty select');
});


test('a.form.select-single', function() {
    var id = 'a.form.select-single';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // Select element
    var sel = document.createElement('select');
    sel.name = id + '-content';
    f.appendChild(sel);

    var opt = document.createElement('option');
    opt.value = 'yatta';
    sel.appendChild(opt);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    // Test the system is not hang by not existing options
    strictEqual(test[id + '-content'], 'yatta', 'Test empty select');
});


test('a.form.select-full', function() {
    var id = 'a.form.select-full';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // Select element
    var sel = document.createElement('select');
    sel.name = id + '-content';
    f.appendChild(sel);

    var opt1 = document.createElement('option');
    opt1.value = 'yatta';
    sel.appendChild(opt1);

    var opt2 = document.createElement('option');
    opt2.value = 'ok';
    sel.appendChild(opt2);
    opt2.selectedIndex = 1;

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    // Test the system is not hang by not existing options
    strictEqual(test[id + '-content'], 'yatta', 'Test empty select');
});

// Test a simple blank input
test('a.form.get-blank', function() {
    var id = 'a.form.get-blank';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // input element
    var i = document.createElement('input');
    i.name = id + '-content';
    i.type = 'text';
    f.appendChild(i);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    strictEqual(test[id + '-content'], null, 'Test empty content gives blank');
});

// Testing that input with a name using [] is treated as an array not
// a single value
test('a.form.get-input-array', function() {
    var id = 'a.form.get-input-array';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // input element
    var first = document.createElement('input');
    first.name = id + '-content[]';
    first.type = 'text';
    first.value = 'first';
    f.appendChild(first);

    // input element
    var second = document.createElement('input');
    second.name = id + '-content[]';
    second.type = 'text';
    second.value = 'second';
    f.appendChild(second);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    strictEqual(a.isArray(test[id + '-content[]']), true);
    strictEqual(test[id + '-content[]'][0], 'first');
    strictEqual(test[id + '-content[]'][1], 'second');
});

// Testing the custom tag attribute data-name to override the a.form way of
// finding field name
test('a.form.custom-attribute', function() {
    var id = 'a.form.custom-attribute';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // input element
    var i = document.createElement('input');
    i.name = id + '-content';
    i.type = 'text';
    i.value = 'something';
    i.setAttribute('data-name', id + '-custom-data');
    f.appendChild(i);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.get(document.getElementById(id));

    strictEqual(test[id + '-custom-data'], 'something', 'Test custom tag');
});

/*
---------------------------------
  VALIDATE TEST
---------------------------------
*/
// Test a basic validate is working as expected
test('a.form.validate-default-test', function() {
    var id = 'a.form.validate-default-test';

    // Main element
    var f = document.createElement('form');
    f.id = id;
    f.style.display = 'none';
    f.onsubmit=function(){return false;}

    // Create few elements with validate needed
    var i1 = document.createElement('input');
    i1.id = id + '-i1';
    i1.type = 'email';
    f.appendChild(i1);

    var i2 = document.createElement('input');
    i2.id = id + '-i2';
    i2.pattern = '^[a-zA-Z]+$';
    f.appendChild(i2);

    // Register element on dom
    document.body.appendChild(f);

    var test = a.form.validate(document.getElementById(id));

    if(test[0].id == id + '-i1') {
        strictEqual(test[0].id, id + '-i1',
                            'Test second id has been setted as not valid');
        strictEqual(test[1].id, id + '-i2',
                            'Test second id has been setted as not valid');
    } else {
        strictEqual(test[1].id, id + '-i1',
                            'Test second id has been setted as not valid');
        strictEqual(test[0].id, id + '-i2',
                            'Test second id has been setted as not valid');
    }
});