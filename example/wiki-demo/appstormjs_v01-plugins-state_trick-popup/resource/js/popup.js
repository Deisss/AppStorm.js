// Popup plugin
var popup = (function() {
	/**
	 * Create an element
	 *
	 * @param type {String} The element type
	 * @param id {String | null} The id
	 * @param html {String} The content
	*/
	function _ce(type, id, html) {
		var e = document.createElement(type);
		if(id) {
			e.id = id;
		}
		e.innerHTML = (html) ? html : "";
		return e;
	};

	/**
	 * Get the foreground container
	 *
	 * @param id {String} The id to search
	 * @return {DOMElement | undefined} The dom element found or undefined if nothing is found
	*/
	function _el(id) {
		return document.getElementById(id);
	};

	/**
	 * Generate a new, and unique id regarding base
	 *
	 * @param base {String} The id base to use
	 * @param withBase {Boolean} Include the base into result or not
	 * @return {String} The generated id
	*/
	function _id(base, withBase) {
		var t = Math.floor((Math.random()*10000)+1);
		while(_el(base + t)) {
			t = Math.floor((Math.random()*10000)+1);
		}
		return (withBase) ? base + t : t;
	};

	/**
	 * Start a callback
	 *
	 * @param c {Function | null} The callback
	 * @param o {Object} The options sended to callback
	*/
	function _call(c, o) {
		if(a.isFunction(c)) {
			c(o);
		}
	};

	/**
	 * Create a button
	 *
	 * @param msg {String} The message to be setted as button content
	 * @param cls {String} The classname to add to default classname
	 * @param cb {Function} The callback associated
	 * @return {DOMElement} The dom created element
	*/
	function _btn(type, msg, cls, cb) {
		msg = (a.isObject(a.language)) ? a.language.getSingleTranslation(msg) : msg;
		var b = _ce("button", null, msg);
		if(a.isString(cls) && cls.length > 0) {
			b.className = "popup-button " + cls;
		}
		if(a.isFunction(cb)) {
			b.onclick = cb;
		}
		return b;
	};

	/**
	 * Generate list of buttons with their content
	 *
	 * @param o {Object} The list of button to create
	 * @param el {DOMElement} The container to put button inside
	 * @param cb {Function} The callback function to call on any button click
	*/
	function _gen(o, el, cb) {
		var lst = {};

		// Create object first
		for(var i in o) {
			lst[o[i].id] = false;
		}

		for(var i in o) {
			(function(id, r) {
				var z = o[id];
				z.value = (a.isObject(a.language)) ? a.language.getSingleTranslation(z.value) : z.value;
				var b = _btn(z.id, z.value, z.id, function() {
					var c = a.clone(lst);
					c[z.id] = true;
					_call(cb, c);
					_el(r).parentNode.removeChild(_el(r));
				});
				el.appendChild(b);
				if(z.focus) {
					b.focus();
				}
			})(i, bgId);
		}
	};

	/**
	 * Center the message into the dom
	 *
	 * @parma el {DOMElement} The message to center
	*/
	function __place(o) {
		try {
			o.style.marginLeft = "-" + Math.round(o.offsetWidth / 2) + "px";
		} catch(e) {}
	};

	// Creating background and default foreground
	var bg = _ce("div", "pbg-tmpl", '<div id="pbg" class="popup-root"><div class="popup-background"></div></div>'),
		fg = _ce("div", "pfg-tmpl", '<form onsubmit="return false;" id="pfg" class="popup-foreground"><div id="pct" class="popup-content"></div><div id="pbc" class="popup-button-container"></div></form>');

	bg.style.display = fg.style.display = "none";

	document.body.appendChild(bg);
	document.body.appendChild(fg);

	var rId = 0, bgId = "", fgId = "", coId = "", buId = "";

	// The usage of rId could be easily avoid (but in this case not compatible IE6)

	// This tree represent default structure with base content
	// For most of popup system
	var tree = {
		id : "popup-background",
		include : {
			html : "pbg-tmpl"
		},
		load : function(html) {
			rId = _id("popup-background-", false);
			bgId = "popup-background-" + rId;
			// Internet explorer get trouble by parsing content without '"'
			if(document.all) {
				html = html.replace("d=pbg", "d=" + bgId);
			}
			html = html.replace('d="pbg"', 'd="' + bgId + '"');
			a.page.template.append(document.body, html);
		},
		children : {
			id : "popup-foreground",
			load : function(html) {
				fgId = "pfg-" + rId;
				coId = "pct-" + rId;
				buId = "pbc-" + rId;
				if(document.all) {
					// Internet explorer get trouble by parsing content without '"'
					html = html.replace('d=pfg', 'd=' + fgId).replace('d=pct', 'd=' + coId).replace('d=pbc', 'd=' + buId);
				}
				html = html.replace('d="pfg"', 'd="' + fgId + '"').replace('d="pct"', 'd="' + coId + '"').replace('d="pbc"', 'd="' + buId + '"');
				a.page.template.append(_el(bgId), html);

				// Change id to new unique one
				var el = _el(fgId);
				el.onclick = function(e) {
					if(e.stopPropagation) {
					  e.stopPropagation();
					}
					e.cancelBubble = true;
				};
			},
			include : {
				html : "pfg-tmpl"
			}
		}
	};

	a.state.add(tree);

	return {
		// Center an element into the DOM
		place : __place,
		// Show a message
		show : function(msg, callback) {
			a.state.loadById('popup-foreground', null, function() {
				_el(coId).innerHTML = (a.isObject(a.language)) ? a.language.getSingleTranslation(msg) : msg;
				_call(callback, fgId);
				__place(_el(fgId));
			});
		},
		// Show a signal message
		signal : function(msg, callback) {
			this.show(msg, function(id) {
				_el(id).parentNode.onclick = function() {
					this.parentNode.removeChild(this);
				};
			});
		},
		// Show an alert
		alert : function(msg, callback) {
			this.show(msg, function() {
				_gen([{
					id : "ok",
					value : "ok",
					focus : true
				}], _el(buId), callback);
			});
		},
		// Show confirm dialog
		confirm : function(msg, callback) {
			this.show(msg, function() {
				var lst = [{
					id : "ok",
					value : "ok",
					focus : true
				},
				{
					id : "cancel",
					value : "cancel"
				}];
				_gen(lst, _el(buId), callback);
			});
		},
		// Show prompt dialog
		prompt : function(msg, content, callback) {
			msg = (a.isObject(a.language)) ? a.language.getSingleTranslation(msg) : msg;

			// First of all we override message to add input, and callback to retrieve input
			var id = _id("popup-input-", true),
				d = '<div class="popup-input"><input type="text" id="' + id + "\" value=\"" + content.replace("\"", "&quot;") + "\" /></div>";

			this.confirm(msg + d, function(result) {
				result.value = _el(id).value;
				_call(callback, result);
			});
		},
		// Show a custom dialog
		custom : function(msg, btnList, callback) {
			this.show(msg, function() {
				_gen(btnList, _el(buId), callback);
			});
		}
	};
})();