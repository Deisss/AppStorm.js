// Unit test for a.state (plugin)
// We separate from state because this one is too much important + heavy ...

// TODO: test load/unload

module('plugin/state.js');

// Start to check a single check hash change
test('a.state.hash-single-state', function() {
    stop();
    expect(2);
    a.state.clear();

    var se = strictEqual,
        st = start;

    var main1 = {
        hash : "astatemanager1",
        load : function(chain) {
            se(1, 1, "Loading basic 1 succeed");
            chain.next();
        }
    };
    var main2 = {
        hash : "astatemanager2",
        load : function(chain) {
            se(1, 1, "Loading basic 2 succeed");
            chain.next();
        }
    };

    a.state.add(main1);
    a.state.add(main2);

    // Now starting to proceed loader
    setTimeout(function() {
        window.location.href = "#astatemanager1";
    }, 200);

    // Old browser will need a little wait...
    setTimeout(function() {
        window.location.href = "#astatemanager2";
    }, 600);

    // Restore sync state when ready
    setTimeout(function() {
        window.location.href = "#";
        a.state.clear();
        st();
    }, 1000);
});

test('a.state.hashExists', function() {

});

test('a.state.clear', function() {

});

test('a.state.get', function() {

});

test('a.state.remove', function() {

});

test('a.state.add', function() {

});