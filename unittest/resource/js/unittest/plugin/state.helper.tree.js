// Unit test for a.state (plugin)

module("PLUGIN/state");

// Concern state default create/clone object
(function(q) {
	// Test cloning object
	q.test("a.clone", function() {
		var toClone1 = {
			ok : {
				hello : "word"
			}
		};
		var toClone2 = new Array({
			hello : "word"
		});
		var toClone3 = new Array("1", "2", "3", "4");
		var toClone4 = new function() {
			this.test = "ok";
		};

		var cloned1 = a.clone(toClone1);
		var cloned2 = a.clone(toClone2);
		var cloned3 = a.clone(toClone3);
		var cloned4 = a.clone(toClone4);

		// Now we change some property (in both cloned and original), we check clone difference appearing
		cloned1.ok.hello = "none";
		toClone1.ok.hello = "word2";

		cloned2.push({hello : "word"});
		toClone2[0].hello = "word2";

		cloned3.push("5");
		toClone3[1] = "2.1";

		cloned4.test = "yatta";
		toClone4.test = "notyatta";

		notDeepEqual(toClone1, cloned1, "Test deep clone object");
		notDeepEqual(toClone2, cloned2, "Test deep clone array and object");
		notDeepEqual(toClone3, cloned3, "Test deep clone array");
		notDeepEqual(toClone4, cloned4, "Test deep clone object");
	});
})(QUnit);









// Concern helper state only !
(function(q) {
	/*
	----------------------
	 - Test Object
	----------------------
	*/

	var test = [
		{
			id : 1,
			hash : null,
			children : [
				{
					id : 5,
					hash : "tag5",
					children : []
				},
				{
					id : 7,
					hash : null,
					children : [
						{
							id : 8,
							hash : "tag2",
							children : []
						}
					]
				},
				{
					id : 9,
					hash : "*",
					children : []
				}
			]
		},
		{
			id : 2,
			hash : "tag2",
			children : [{
				id : 6,
				hash : "tag5",
				children : []
			}]
		},
		{
			id : 3,
			hash : "tag3",
			children : []
		},
		{
			id : 4,
			hash : null,
			children : [
				{
					id : 10,
					hash : "tag3",
					children : [
						// Test a tag3 children inside a tag3 is also taken...
						{
							id : 13,
							hash : "tag3",
							children : []
						}
					]
				},
				{
					id : 11,
					hash : "tag2",
					children : []
				},
				{
					id : 12,
					hash : "tag3",
					children : []
				}
			]
		}
	];

	var flatFiller = function(item) {
		if(typeof(item) === "object" && item !== null && (item.children instanceof Array)) {
			return item.children;
		}
		return [];
	};

	var flatConverter = function(item) {
		if(typeof(item) === "object" && item !== null) {
			return item.id;
		}
		return item;
	}

	// We use a generator to dynamically change id
	function generateItemTester(id) {
		return function(item) {
			if(typeof(item) === "object" && item !== null && item.id === id) {
				return true;
			}
			return false;
		};
	};

	/*
	----------------------
	 - Test Flat function
	----------------------
	*/
	// Test the flat function
	q.test("a.state.helper.tree.flat", function() {
		var flatResult = a.state.helper.tree.flat(test, flatFiller, flatConverter);

		// The result we should get
		var attendedFlatResult = [1, 5, 7, 8, 9, 2, 6, 3, 4, 10, 13, 11, 12];

		deepEqual(flatResult, attendedFlatResult, "Test flat tree");
	});

	/*
	----------------------
	 - Test GetItem function
	----------------------
	*/
	// Test getItem function, in many cases
	q.test("a.state.helper.tree.getItem", function() {
		// This is same function...
		var getItemFiller = flatFiller;

		// We search one of the root item
		var getItemResult1 = a.state.helper.tree.getItem(test, getItemFiller, generateItemTester(2));
		// This test we search a deep item
		var getItemResult2 = a.state.helper.tree.getItem(test, getItemFiller, generateItemTester(8));
		// This test we search in part of existing, the root item
		var getItemResult3 = a.state.helper.tree.getItem(test[1].children, getItemFiller, generateItemTester(6));
		// This test we search in part of existing, a deep item
		var getItemResult4 = a.state.helper.tree.getItem(test[3].children, getItemFiller, generateItemTester(11));
		// An error
		var getItemResult5 = a.state.helper.tree.getItem(test[3].children, getItemFiller, generateItemTester(2));

		strictEqual(getItemResult1.id, 2, "Test item found (or not) result");
		strictEqual(getItemResult2.id, 8, "Test item found (or not) result");
		strictEqual(getItemResult3.id, 6, "Test item found (or not) result");
		strictEqual(getItemResult4.id, 11, "Test item found (or not) result");
		strictEqual(getItemResult5, null, "Test item found (or not) result");
	});


	/*
	----------------------
	 - Test isInBranch function
	----------------------
	*/
	// Test to find if something is currently in the given branch
	q.test("a.state.helper.tree.isInBranch", function() {
		//Almost quite the same function again
		var generateIsInBranchTester = generateItemTester;
		var isInBranchFiller = flatFiller;

		// Almost same test as the getItem
		var isInBranchResult1 = a.state.helper.tree.isInBranch(test, isInBranchFiller, generateIsInBranchTester(2));
		var isInBranchResult2 = a.state.helper.tree.isInBranch(test, isInBranchFiller, generateIsInBranchTester(8));
		var isInBranchResult3 = a.state.helper.tree.isInBranch(test[1].children, isInBranchFiller, generateIsInBranchTester(6));
		var isInBranchResult4 = a.state.helper.tree.isInBranch(test[3].children, isInBranchFiller, generateIsInBranchTester(11));
		var isInBranchResult5 = a.state.helper.tree.isInBranch(test[3].children, isInBranchFiller, generateIsInBranchTester(2));

		strictEqual(isInBranchResult1, true, "Test the given item is in branch");
		strictEqual(isInBranchResult2, true, "Test the given item is in branch");
		strictEqual(isInBranchResult3, true, "Test the given item is in branch");
		strictEqual(isInBranchResult4, true, "Test the given item is in branch");
		strictEqual(isInBranchResult5, false, "Test the given item is in branch");
	});


	/*
	----------------------
	 - Test selectBranch function
	----------------------
	*/
	// Test the select branch system
	q.test("a.state.helper.tree.selectBranch", function() {
		var selectBranchFiller = flatFiller;
		function generateSelectBranchTester(hash) {
			return function(item) {
				// This test also include wildcard test
				if(typeof(item) === "object" && item !== null && (item.hash === hash || item.hash === "*")) {
					return true;
				}
				return false;
			};
		};

		// First test : on full array
		var selectBranchTest1 = a.clone(test);
		a.state.helper.tree.selectBranch(selectBranchTest1, selectBranchFiller, generateSelectBranchTester("tag2"));
		var flatSelectBranchResult1 = a.state.helper.tree.flat(selectBranchTest1, flatFiller, flatConverter);
		var attendedSelectedBranchResult1 = [1, 7, 8, 9, 2, 4, 11];


		// Second test : on full array
		var selectBranchTest2 = a.clone(test);
		a.state.helper.tree.selectBranch(selectBranchTest2, selectBranchFiller, generateSelectBranchTester("tag3"));
		var flatSelectBranchResult2 = a.state.helper.tree.flat(selectBranchTest2, flatFiller, flatConverter);
		var attendedSelectedBranchResult2 = [1, 9, 3, 4, 10, 13, 12];

		// Third test : on subpart (good)
		var selectBranchTest3 = new Array(a.clone(test[0]));
		a.state.helper.tree.selectBranch(selectBranchTest3, selectBranchFiller, generateSelectBranchTester("tag5"));
		var flatSelectBranchResult3 = a.state.helper.tree.flat(selectBranchTest3, flatFiller, flatConverter);
		var attendedSelectedBranchResult3 = [1, 5, 9];

		// 4th test : on subpart (nothing)
		var selectBranchTest4 = new Array(a.clone(test[2]));
		a.state.helper.tree.selectBranch(selectBranchTest4, selectBranchFiller, generateSelectBranchTester("tag2"));
		var flatSelectBranchResult4 = a.state.helper.tree.flat(selectBranchTest4, flatFiller, flatConverter);
		// No result to show
		var attendedSelectedBranchResult4 = [];

		deepEqual(flatSelectBranchResult1, attendedSelectedBranchResult1, "Test the selectBranch system");
		deepEqual(flatSelectBranchResult2, attendedSelectedBranchResult2, "Test the selectBranch system");
		deepEqual(flatSelectBranchResult3, attendedSelectedBranchResult3, "Test the selectBranch system");
		deepEqual(flatSelectBranchResult4, attendedSelectedBranchResult4, "Test the selectBranch system");
	});

	/*
	----------------------
	 - Test selectLevel function
	----------------------
	*/
	// Test the select level system
	q.test("a.state.helper.tree.selectLevel", function() {
		var selectLevelFiller = flatFiller;

		var selectLevelTest1 = a.clone(test);
		var selectLevelResult1 = a.state.helper.tree.selectLevel(selectLevelTest1, selectLevelFiller, 0);
		var flatSelectLevelResult1 = a.state.helper.tree.flat(selectLevelResult1, flatFiller, flatConverter);
		var attendedSelectedLevelResult1 = [1, 5, 7, 8, 9, 2, 6, 3, 4, 10, 13, 11, 12];

		var selectLevelTest2 = a.clone(test);
		var selectLevelResult2 = a.state.helper.tree.selectLevel(selectLevelTest2, selectLevelFiller, 2);
		var flatSelectLevelResult2 = a.state.helper.tree.flat(selectLevelResult2, flatFiller, flatConverter);
		var attendedSelectedLevelResult2 = [13, 8];

		var selectLevelTest3 = a.clone(test);
		var selectLevelResult3 = a.state.helper.tree.selectLevel(selectLevelTest3, selectLevelFiller, 1);
		var flatSelectLevelResult3 = a.state.helper.tree.flat(selectLevelResult3, flatFiller, flatConverter);
		var attendedSelectedLevelResult3 = [10, 13, 11, 12, 6, 5, 7, 8, 9];

		var selectLevelTest4 = a.clone(test);
		var selectLevelResult4 = a.state.helper.tree.selectLevel(selectLevelTest4[1].children, selectLevelFiller, 0);
		var flatSelectLevelResult4 = a.state.helper.tree.flat(selectLevelResult4, flatFiller, flatConverter);
		var attendedSelectedLevelResult4 = [6];

		// Negative result give back 0...
		var selectLevelTest5 = a.clone(test);
		var selectLevelResult5 = a.state.helper.tree.selectLevel(selectLevelTest5, selectLevelFiller, -1);
		var flatSelectLevelResult5 = a.state.helper.tree.flat(selectLevelResult5, flatFiller, flatConverter);
		var attendedSelectedLevelResult5 = [1, 5, 7, 8, 9, 2, 6, 3, 4, 10, 13, 11, 12];

		deepEqual(flatSelectLevelResult1, attendedSelectedLevelResult1, "Test the selectLevel system");
		deepEqual(flatSelectLevelResult2, attendedSelectedLevelResult2, "Test the selectLevel system");
		deepEqual(flatSelectLevelResult3, attendedSelectedLevelResult3, "Test the selectLevel system");
		deepEqual(flatSelectLevelResult4, attendedSelectedLevelResult4, "Test the selectLevel system");
		deepEqual(flatSelectLevelResult5, attendedSelectedLevelResult5, "Test the selectLevel system");
	});
})(QUnit);
