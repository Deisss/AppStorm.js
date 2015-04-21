/**
 * @license
 * lodash 3.7.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern -o ./lodash.js`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '3.7.0';

  /** Used to compose bitmasks for wrapper metadata. */
  var BIND_FLAG = 1,
      BIND_KEY_FLAG = 2,
      CURRY_BOUND_FLAG = 4,
      CURRY_FLAG = 8,
      CURRY_RIGHT_FLAG = 16,
      PARTIAL_FLAG = 32,
      PARTIAL_RIGHT_FLAG = 64,
      ARY_FLAG = 128,
      REARG_FLAG = 256;

  /** Used as default options for `_.trunc`. */
  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';

  /** Used to detect when a function becomes hot. */
  var HOT_COUNT = 150,
      HOT_SPAN = 16;

  /** Used to indicate the type of lazy iteratees. */
  var LAZY_DROP_WHILE_FLAG = 0,
      LAZY_FILTER_FLAG = 1,
      LAZY_MAP_FLAG = 2;

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities and HTML characters. */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
      reUnescapedHtml = /[&<>"'`]/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source),
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g,
      reEvaluate = /<%([\s\S]+?)%>/g,
      reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]+|(["'])(?:(?!\1)[^\n\\]|\\.)*?)\1\]/,
      reIsPlainProp = /^\w*$/,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

  /**
   * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).
   * In addition to special characters the forward slash is escaped to allow for
   * easier `eval` use and `Function` compilation.
   */
  var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
      reHasRegExpChars = RegExp(reRegExpChars.source);

  /** Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks). */
  var reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /** Used to match [ES template delimiters](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-template-literal-lexical-components). */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect hexadecimal string values. */
  var reHasHexPrefix = /^0[xX]/;

  /** Used to detect host constructors (Safari > 5). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to match latin-1 supplementary letters (excluding mathematical operators). */
  var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used to match words to create compound words. */
  var reWords = (function() {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
        lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';

    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
  }());

  /** Used to detect and test for whitespace. */
  var whitespace = (
    // Basic whitespace characters.
    ' \t\x0b\f\xa0\ufeff' +

    // Line terminators.
    '\n\r\u2028\u2029' +

    // Unicode category "Zs" space separators.
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to assign default `context` object properties. */
  var contextProps = [
    'Array', 'ArrayBuffer', 'Date', 'Error', 'Float32Array', 'Float64Array',
    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Math', 'Number',
    'Object', 'RegExp', 'Set', 'String', '_', 'clearTimeout', 'document',
    'isFinite', 'parseInt', 'setTimeout', 'TypeError', 'Uint8Array',
    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
    'window'
  ];

  /** Used to make template sourceURLs easier to identify. */
  var templateCounter = -1;

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[stringTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[mapTag] = cloneableTags[setTag] =
  cloneableTags[weakMapTag] = false;

  /** Used as an internal `_.debounce` options object by `_.throttle`. */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used to map latin-1 supplementary letters to basic latin letters. */
  var deburredLetters = {
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss'
  };

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };

  /** Used to map HTML entities to characters. */
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#96;': '`'
  };

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;

  /** Detect free variable `self`. */
  var freeSelf = objectTypes[typeof self] && self && self.Object && self;

  /** Detect free variable `window`. */
  var freeWindow = objectTypes[typeof window] && window && window.Object && window;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it is the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `compareAscending` which compares values and
   * sorts them in ascending order without guaranteeing a stable sort.
   *
   * @private
   * @param {*} value The value to compare to `other`.
   * @param {*} other The value to compare to `value`.
   * @returns {number} Returns the sort order indicator for `value`.
   */
  function baseCompareAscending(value, other) {
    if (value !== other) {
      var valIsReflexive = value === value,
          othIsReflexive = other === other;

      if (value > other || !valIsReflexive || (value === undefined && othIsReflexive)) {
        return 1;
      }
      if (value < other || !othIsReflexive || (other === undefined && valIsReflexive)) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for callback shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Function} predicate The function invoked per iteration.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseFindIndex(array, predicate, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.indexOf` without support for binary searches.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.isFunction` without support for environments
   * with incorrect `typeof` results.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   */
  function baseIsFunction(value) {
    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
    return typeof value == 'function' || false;
  }

  /**
   * Converts `value` to a string if it is not one. An empty string is returned
   * for `null` or `undefined` values.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    if (typeof value == 'string') {
      return value;
    }
    return value == null ? '' : (value + '');
  }

  /**
   * Used by `_.max` and `_.min` as the default callback for string values.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the code unit of the first character of the string.
   */
  function charAtCallback(string) {
    return string.charCodeAt(0);
  }

  /**
   * Used by `_.trim` and `_.trimLeft` to get the index of the first character
   * of `string` that is not found in `chars`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @param {string} chars The characters to find.
   * @returns {number} Returns the index of the first character not found in `chars`.
   */
  function charsLeftIndex(string, chars) {
    var index = -1,
        length = string.length;

    while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimRight` to get the index of the last character
   * of `string` that is not found in `chars`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @param {string} chars The characters to find.
   * @returns {number} Returns the index of the last character not found in `chars`.
   */
  function charsRightIndex(string, chars) {
    var index = string.length;

    while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
    return index;
  }

  /**
   * Used by `_.sortBy` to compare transformed elements of a collection and stable
   * sort them in ascending order.
   *
   * @private
   * @param {Object} object The object to compare to `other`.
   * @param {Object} other The object to compare to `object`.
   * @returns {number} Returns the sort order indicator for `object`.
   */
  function compareAscending(object, other) {
    return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
  }

  /**
   * Used by `_.sortByOrder` to compare multiple properties of each element
   * in a collection and stable sort them in the following order:
   *
   * If `orders` is unspecified, sort in ascending order for all properties.
   * Otherwise, for each property, sort in ascending order if its corresponding value in
   * orders is true, and descending order if false.
   *
   * @private
   * @param {Object} object The object to compare to `other`.
   * @param {Object} other The object to compare to `object`.
   * @param {boolean[]} orders The order to sort by for each property.
   * @returns {number} Returns the sort order indicator for `object`.
   */
  function compareMultiple(object, other, orders) {
    var index = -1,
        objCriteria = object.criteria,
        othCriteria = other.criteria,
        length = objCriteria.length,
        ordersLength = orders.length;

    while (++index < length) {
      var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        return result * (orders[index] ? 1 : -1);
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to provide the same value for
    // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
    // for more details.
    //
    // This also ensures a stable sort in V8 and other engines.
    // See https://code.google.com/p/v8/issues/detail?id=90 for more details.
    return object.index - other.index;
  }

  /**
   * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.
   *
   * @private
   * @param {string} letter The matched letter to deburr.
   * @returns {string} Returns the deburred letter.
   */
  function deburrLetter(letter) {
    return deburredLetters[letter];
  }

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeHtmlChar(chr) {
    return htmlEscapes[chr];
  }

  /**
   * Used by `_.template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /**
   * Gets the index at which the first occurrence of `NaN` is found in `array`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched `NaN`, else `-1`.
   */
  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Checks if `value` is object-like.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a
   * character code is whitespace.
   *
   * @private
   * @param {number} charCode The character code to inspect.
   * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.
   */
  function isSpace(charCode) {
    return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||
      (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));
  }

  /**
   * Replaces all `placeholder` elements in `array` with an internal placeholder
   * and returns an array of their indexes.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {*} placeholder The placeholder to replace.
   * @returns {Array} Returns the new array of placeholder indexes.
   */
  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      if (array[index] === placeholder) {
        array[index] = PLACEHOLDER;
        result[++resIndex] = index;
      }
    }
    return result;
  }

  /**
   * An implementation of `_.uniq` optimized for sorted arrays without support
   * for callback shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} [iteratee] The function invoked per iteration.
   * @returns {Array} Returns the new duplicate-value-free array.
   */
  function sortedUniq(array, iteratee) {
    var seen,
        index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value, index, array) : value;

      if (!index || seen !== computed) {
        seen = computed;
        result[++resIndex] = value;
      }
    }
    return result;
  }

  /**
   * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the first non-whitespace character.
   */
  function trimmedLeftIndex(string) {
    var index = -1,
        length = string.length;

    while (++index < length && isSpace(string.charCodeAt(index))) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedRightIndex(string) {
    var index = string.length;

    while (index-- && isSpace(string.charCodeAt(index))) {}
    return index;
  }

  /**
   * Used by `_.unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {string} chr The matched character to unescape.
   * @returns {string} Returns the unescaped character.
   */
  function unescapeHtmlChar(chr) {
    return htmlUnescapes[chr];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new pristine `lodash` function using the given `context` object.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns a new `lodash` function.
   * @example
   *
   * _.mixin({ 'foo': _.constant('foo') });
   *
   * var lodash = _.runInContext();
   * lodash.mixin({ 'bar': lodash.constant('bar') });
   *
   * _.isFunction(_.foo);
   * // => true
   * _.isFunction(_.bar);
   * // => false
   *
   * lodash.isFunction(lodash.foo);
   * // => false
   * lodash.isFunction(lodash.bar);
   * // => true
   *
   * // using `context` to mock `Date#getTime` use in `_.now`
   * var mock = _.runInContext({
   *   'Date': function() {
   *     return { 'getTime': getTimeMock };
   *   }
   * });
   *
   * // or creating a suped-up `defer` in Node.js
   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See https://es5.github.io/#x11.1.5 for more details.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references. */
    var Array = context.Array,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /** Used for native method references. */
    var arrayProto = Array.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype;

    /** Used to detect DOM support. */
    var document = (document = context.window) && document.document;

    /** Used to resolve the decompiled source of functions. */
    var fnToString = Function.prototype.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to generate unique IDs. */
    var idCounter = 0;

    /**
     * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
     * of values.
     */
    var objToString = objectProto.toString;

    /** Used to restore the original `_` reference in `_.noConflict`. */
    var oldDash = context._;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      escapeRegExp(objToString)
      .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Native method references. */
    var ArrayBuffer = isNative(ArrayBuffer = context.ArrayBuffer) && ArrayBuffer,
        bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice,
        ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        getOwnPropertySymbols = isNative(getOwnPropertySymbols = Object.getOwnPropertySymbols) && getOwnPropertySymbols,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        push = arrayProto.push,
        preventExtensions = isNative(Object.preventExtensions = Object.preventExtensions) && preventExtensions,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        Set = isNative(Set = context.Set) && Set,
        setTimeout = context.setTimeout,
        splice = arrayProto.splice,
        Uint8Array = isNative(Uint8Array = context.Uint8Array) && Uint8Array,
        WeakMap = isNative(WeakMap = context.WeakMap) && WeakMap;

    /** Used to clone array buffers. */
    var Float64Array = (function() {
      // Safari 5 errors when using an array buffer to initialize a typed array
      // where the array buffer's `byteLength` is not a multiple of the typed
      // array's `BYTES_PER_ELEMENT`.
      try {
        var func = isNative(func = context.Float64Array) && func,
            result = new func(new ArrayBuffer(10), 0, 1) && func;
      } catch(e) {}
      return result;
    }());

    /** Used as `baseAssign`. */
    var nativeAssign = (function() {
      // Avoid `Object.assign` in Firefox 34-37 which have an early implementation
      // with a now defunct try/catch behavior. See https://bugzilla.mozilla.org/show_bug.cgi?id=1103344
      // for more details.
      //
      // Use `Object.preventExtensions` on a plain object instead of simply using
      // `Object('x')` because Chrome and IE fail to throw an error when attempting
      // to assign values to readonly indexes of strings in strict mode.
      var object = { '1': 0 },
          func = preventExtensions && isNative(func = Object.assign) && func;

      try { func(preventExtensions(object), 'xo'); } catch(e) {}
      return !object[1] && func;
    }());

    /* Native method references for those with the same name as other `lodash` methods. */
    var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsFinite = context.isFinite,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeNow = isNative(nativeNow = Date.now) && nativeNow,
        nativeNumIsFinite = isNative(nativeNumIsFinite = Number.isFinite) && nativeNumIsFinite,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used as references for `-Infinity` and `Infinity`. */
    var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
        POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

    /** Used as references for the maximum length and index of an array. */
    var MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1,
        MAX_ARRAY_INDEX =  MAX_ARRAY_LENGTH - 1,
        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

    /** Used as the size, in bytes, of each `Float64Array` element. */
    var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;

    /**
     * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
     * of an array-like value.
     */
    var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

    /** Used to store function metadata. */
    var metaMap = WeakMap && new WeakMap;

    /** Used to lookup unminified function names. */
    var realNames = {};

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps `value` to enable implicit chaining.
     * Methods that operate on and return arrays, collections, and functions can
     * be chained together. Methods that return a boolean or single value will
     * automatically end the chain returning the unwrapped value. Explicit chaining
     * may be enabled using `_.chain`. The execution of chained methods is lazy,
     * that is, execution is deferred until `_#value` is implicitly or explicitly
     * called.
     *
     * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
     * fusion is an optimization that merges iteratees to avoid creating intermediate
     * arrays and reduce the number of iteratee executions.
     *
     * Chaining is supported in custom builds as long as the `_#value` method is
     * directly or indirectly included in the build.
     *
     * In addition to lodash methods, wrappers have `Array` and `String` methods.
     *
     * The wrapper `Array` methods are:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
     * `splice`, and `unshift`
     *
     * The wrapper `String` methods are:
     * `replace` and `split`
     *
     * The wrapper methods that support shortcut fusion are:
     * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
     * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
     * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
     * and `where`
     *
     * The chainable wrapper methods are:
     * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
     * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
     * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defer`, `delay`,
     * `difference`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `fill`,
     * `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`, `forEach`,
     * `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `functions`,
     * `groupBy`, `indexBy`, `initial`, `intersection`, `invert`, `invoke`, `keys`,
     * `keysIn`, `map`, `mapValues`, `matches`, `matchesProperty`, `memoize`,
     * `merge`, `mixin`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
     * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
     * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `reverse`,
     * `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`, `sortByOrder`, `splice`,
     * `spread`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `tap`,
     * `throttle`, `thru`, `times`, `toArray`, `toPlainObject`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `valuesIn`, `where`,
     * `without`, `wrap`, `xor`, `zip`, and `zipObject`
     *
     * The wrapper methods that are **not** chainable by default are:
     * `add`, `attempt`, `camelCase`, `capitalize`, `clone`, `cloneDeep`, `deburr`,
     * `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`,
     * `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`, `has`,
     * `identity`, `includes`, `indexOf`, `inRange`, `isArguments`, `isArray`,
     * `isBoolean`, `isDate`, `isElement`, `isEmpty`, `isEqual`, `isError`, `isFinite`
     * `isFunction`, `isMatch`, `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`,
     * `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `isTypedArray`,
     * `join`, `kebabCase`, `last`, `lastIndexOf`, `max`, `min`, `noConflict`,
     * `noop`, `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`,
     * `reduce`, `reduceRight`, `repeat`, `result`, `runInContext`, `shift`, `size`,
     * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`, `startsWith`,
     * `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`, `unescape`,
     * `uniqueId`, `value`, and `words`
     *
     * The wrapper method `sample` will return a wrapped value when `n` is provided,
     * otherwise an unwrapped value is returned.
     *
     * @name _
     * @constructor
     * @category Chain
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(total, n) {
     *   return total + n;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(n) {
     *   return n * n;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
        if (value instanceof LodashWrapper) {
          return value;
        }
        if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
          return wrapperClone(value);
        }
      }
      return new LodashWrapper(value);
    }

    /**
     * The function whose prototype all chaining wrappers inherit from.
     *
     * @private
     */
    function baseLodash() {
      // No operation performed.
    }

    /**
     * The base constructor for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap.
     * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
     * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
     */
    function LodashWrapper(value, chainAll, actions) {
      this.__wrapped__ = value;
      this.__actions__ = actions || [];
      this.__chain__ = !!chainAll;
    }

    /**
     * An object environment feature flags.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    (function(x) {
      var Ctor = function() { this.x = x; },
          object = { '0': x, 'length': x },
          props = [];

      Ctor.prototype = { 'valueOf': x, 'y': x };
      for (var key in new Ctor) { props.push(key); }

      /**
       * Detect if functions can be decompiled by `Function#toString`
       * (all but Firefox OS certified apps, older Opera mobile browsers, and
       * the PlayStation 3; forced `false` for Windows 8 apps).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.funcDecomp = /\bthis\b/.test(function() { return this; });

      /**
       * Detect if `Function#name` is supported (all but IE).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.funcNames = typeof Function.name == 'string';

      /**
       * Detect if the DOM is supported.
       *
       * @memberOf _.support
       * @type boolean
       */
      try {
        support.dom = document.createDocumentFragment().nodeType === 11;
      } catch(e) {
        support.dom = false;
      }

      /**
       * Detect if `arguments` object indexes are non-enumerable.
       *
       * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
       * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
       * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
       * checks for indexes that exceed the number of function parameters and
       * whose associated argument values are `0`.
       *
       * @memberOf _.support
       * @type boolean
       */
      try {
        support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
      } catch(e) {
        support.nonEnumArgs = true;
      }
    }(1, 0));

    /**
     * By default, the template delimiters used by lodash are like those in
     * embedded Ruby (ERB). Change the following template settings to use
     * alternative delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': reEscape,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': reEvaluate,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*------------------------------------------------------------------------*/

    /**
     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
     *
     * @private
     * @param {*} value The value to wrap.
     */
    function LazyWrapper(value) {
      this.__wrapped__ = value;
      this.__actions__ = null;
      this.__dir__ = 1;
      this.__dropCount__ = 0;
      this.__filtered__ = false;
      this.__iteratees__ = null;
      this.__takeCount__ = POSITIVE_INFINITY;
      this.__views__ = null;
    }

    /**
     * Creates a clone of the lazy wrapper object.
     *
     * @private
     * @name clone
     * @memberOf LazyWrapper
     * @returns {Object} Returns the cloned `LazyWrapper` object.
     */
    function lazyClone() {
      var actions = this.__actions__,
          iteratees = this.__iteratees__,
          views = this.__views__,
          result = new LazyWrapper(this.__wrapped__);

      result.__actions__ = actions ? arrayCopy(actions) : null;
      result.__dir__ = this.__dir__;
      result.__filtered__ = this.__filtered__;
      result.__iteratees__ = iteratees ? arrayCopy(iteratees) : null;
      result.__takeCount__ = this.__takeCount__;
      result.__views__ = views ? arrayCopy(views) : null;
      return result;
    }

    /**
     * Reverses the direction of lazy iteration.
     *
     * @private
     * @name reverse
     * @memberOf LazyWrapper
     * @returns {Object} Returns the new reversed `LazyWrapper` object.
     */
    function lazyReverse() {
      if (this.__filtered__) {
        var result = new LazyWrapper(this);
        result.__dir__ = -1;
        result.__filtered__ = true;
      } else {
        result = this.clone();
        result.__dir__ *= -1;
      }
      return result;
    }

    /**
     * Extracts the unwrapped value from its lazy wrapper.
     *
     * @private
     * @name value
     * @memberOf LazyWrapper
     * @returns {*} Returns the unwrapped value.
     */
    function lazyValue() {
      var array = this.__wrapped__.value();
      if (!isArray(array)) {
        return baseWrapperValue(array, this.__actions__);
      }
      var dir = this.__dir__,
          isRight = dir < 0,
          view = getView(0, array.length, this.__views__),
          start = view.start,
          end = view.end,
          length = end - start,
          index = isRight ? end : (start - 1),
          takeCount = nativeMin(length, this.__takeCount__),
          iteratees = this.__iteratees__,
          iterLength = iteratees ? iteratees.length : 0,
          resIndex = 0,
          result = [];

      outer:
      while (length-- && resIndex < takeCount) {
        index += dir;

        var iterIndex = -1,
            value = array[index];

        while (++iterIndex < iterLength) {
          var data = iteratees[iterIndex],
              iteratee = data.iteratee,
              type = data.type;

          if (type == LAZY_DROP_WHILE_FLAG) {
            if (data.done && (isRight ? (index > data.index) : (index < data.index))) {
              data.count = 0;
              data.done = false;
            }
            data.index = index;
            if (!data.done) {
              var limit = data.limit;
              if (!(data.done = limit > -1 ? (data.count++ >= limit) : !iteratee(value))) {
                continue outer;
              }
            }
          } else {
            var computed = iteratee(value);
            if (type == LAZY_MAP_FLAG) {
              value = computed;
            } else if (!computed) {
              if (type == LAZY_FILTER_FLAG) {
                continue outer;
              } else {
                break outer;
              }
            }
          }
        }
        result[resIndex++] = value;
      }
      return result;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates a cache object to store key/value pairs.
     *
     * @private
     * @static
     * @name Cache
     * @memberOf _.memoize
     */
    function MapCache() {
      this.__data__ = {};
    }

    /**
     * Removes `key` and its value from the cache.
     *
     * @private
     * @name delete
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed successfully, else `false`.
     */
    function mapDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /**
     * Gets the cached value for `key`.
     *
     * @private
     * @name get
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the cached value.
     */
    function mapGet(key) {
      return key == '__proto__' ? undefined : this.__data__[key];
    }

    /**
     * Checks if a cached value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapHas(key) {
      return key != '__proto__' && hasOwnProperty.call(this.__data__, key);
    }

    /**
     * Sets `value` to `key` of the cache.
     *
     * @private
     * @name set
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the value to cache.
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache object.
     */
    function mapSet(key, value) {
      if (key != '__proto__') {
        this.__data__[key] = value;
      }
      return this;
    }

    /*------------------------------------------------------------------------*/

    /**
     *
     * Creates a cache object to store unique values.
     *
     * @private
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var length = values ? values.length : 0;

      this.data = { 'hash': nativeCreate(null), 'set': new Set };
      while (length--) {
        this.push(values[length]);
      }
    }

    /**
     * Checks if `value` is in `cache` mimicking the return signature of
     * `_.indexOf` by returning `0` if the value is found, else `-1`.
     *
     * @private
     * @param {Object} cache The cache to search.
     * @param {*} value The value to search for.
     * @returns {number} Returns `0` if `value` is found, else `-1`.
     */
    function cacheIndexOf(cache, value) {
      var data = cache.data,
          result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

      return result ? 0 : -1;
    }

    /**
     * Adds `value` to the cache.
     *
     * @private
     * @name push
     * @memberOf SetCache
     * @param {*} value The value to cache.
     */
    function cachePush(value) {
      var data = this.data;
      if (typeof value == 'string' || isObject(value)) {
        data.set.add(value);
      } else {
        data.hash[value] = true;
      }
    }

    /*------------------------------------------------------------------------*/

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function arrayCopy(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * A specialized version of `_.forEachRight` for arrays without support for
     * callback shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEachRight(array, iteratee) {
      var length = array.length;

      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * A specialized version of `_.every` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     */
    function arrayEvery(array, predicate) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }
      return true;
    }

    /**
     * A specialized version of `_.filter` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array.length,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[++resIndex] = value;
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.map` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /**
     * A specialized version of `_.max` for arrays without support for iteratees.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @returns {*} Returns the maximum value.
     */
    function arrayMax(array) {
      var index = -1,
          length = array.length,
          result = NEGATIVE_INFINITY;

      while (++index < length) {
        var value = array[index];
        if (value > result) {
          result = value;
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.min` for arrays without support for iteratees.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @returns {*} Returns the minimum value.
     */
    function arrayMin(array) {
      var index = -1,
          length = array.length,
          result = POSITIVE_INFINITY;

      while (++index < length) {
        var value = array[index];
        if (value < result) {
          result = value;
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.reduce` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initFromArray] Specify using the first element of `array`
     *  as the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduce(array, iteratee, accumulator, initFromArray) {
      var index = -1,
          length = array.length;

      if (initFromArray && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.reduceRight` for arrays without support for
     * callback shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initFromArray] Specify using the last element of `array`
     *  as the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
      var length = array.length;
      if (initFromArray && length) {
        accumulator = array[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.some` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * A specialized version of `_.sum` for arrays without support for iteratees.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @returns {number} Returns the sum.
     */
    function arraySum(array) {
      var length = array.length,
          result = 0;

      while (length--) {
        result += +array[length] || 0;
      }
      return result;
    }

    /**
     * Used by `_.defaults` to customize its `_.assign` use.
     *
     * @private
     * @param {*} objectValue The destination object property value.
     * @param {*} sourceValue The source object property value.
     * @returns {*} Returns the value to assign to the destination object.
     */
    function assignDefaults(objectValue, sourceValue) {
      return objectValue === undefined ? sourceValue : objectValue;
    }

    /**
     * Used by `_.template` to customize its `_.assign` use.
     *
     * **Note:** This function is like `assignDefaults` except that it ignores
     * inherited property values when checking if a property is `undefined`.
     *
     * @private
     * @param {*} objectValue The destination object property value.
     * @param {*} sourceValue The source object property value.
     * @param {string} key The key associated with the object and source values.
     * @param {Object} object The destination object.
     * @returns {*} Returns the value to assign to the destination object.
     */
    function assignOwnDefaults(objectValue, sourceValue, key, object) {
      return (objectValue === undefined || !hasOwnProperty.call(object, key))
        ? sourceValue
        : objectValue;
    }

    /**
     * A specialized version of `_.assign` for customizing assigned values without
     * support for argument juggling, multiple sources, and `this` binding `customizer`
     * functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} customizer The function to customize assigned values.
     * @returns {Object} Returns `object`.
     */
    function assignWith(object, source, customizer) {
      var props = keys(source);
      push.apply(props, getSymbols(source));

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index],
            value = object[key],
            result = customizer(value, source[key], key, object, source);

        if ((result === result ? (result !== value) : (value === value)) ||
            (value === undefined && !(key in object))) {
          object[key] = result;
        }
      }
      return object;
    }

    /**
     * The base implementation of `_.assign` without support for argument juggling,
     * multiple sources, and `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    var baseAssign = nativeAssign || function(object, source) {
      return source == null
        ? object
        : baseCopy(source, getSymbols(source), baseCopy(source, keys(source), object));
    };

    /**
     * The base implementation of `_.at` without support for string collections
     * and individual key arguments.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {number[]|string[]} props The property names or indexes of elements to pick.
     * @returns {Array} Returns the new array of picked elements.
     */
    function baseAt(collection, props) {
      var index = -1,
          length = collection.length,
          isArr = isLength(length),
          propsLength = props.length,
          result = Array(propsLength);

      while(++index < propsLength) {
        var key = props[index];
        if (isArr) {
          result[index] = isIndex(key, length) ? collection[key] : undefined;
        } else {
          result[index] = collection[key];
        }
      }
      return result;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property names to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @returns {Object} Returns `object`.
     */
    function baseCopy(source, props, object) {
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];
        object[key] = source[key];
      }
      return object;
    }

    /**
     * The base implementation of `_.callback` which supports specifying the
     * number of arguments to provide to `func`.
     *
     * @private
     * @param {*} [func=_.identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [argCount] The number of arguments to provide to `func`.
     * @returns {Function} Returns the callback.
     */
    function baseCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (type == 'function') {
        return thisArg === undefined
          ? func
          : bindCallback(func, thisArg, argCount);
      }
      if (func == null) {
        return identity;
      }
      if (type == 'object') {
        return baseMatches(func);
      }
      return thisArg === undefined
        ? property(func)
        : baseMatchesProperty(func, thisArg);
    }

    /**
     * The base implementation of `_.clone` without support for argument juggling
     * and `this` binding `customizer` functions.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {Function} [customizer] The function to customize cloning values.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The object `value` belongs to.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
      var result;
      if (customizer) {
        result = object ? customizer(value, key, object) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return arrayCopy(value, result);
        }
      } else {
        var tag = objToString.call(value),
            isFunc = tag == funcTag;

        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          result = initCloneObject(isFunc ? {} : value);
          if (!isDeep) {
            return baseAssign(result, value);
          }
        } else {
          return cloneableTags[tag]
            ? initCloneByTag(value, tag, isDeep)
            : (object ? value : {});
        }
      }
      // Check for circular references and return corresponding clone.
      stackA || (stackA = []);
      stackB || (stackB = []);

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == value) {
          return stackB[length];
        }
      }
      // Add the source value to the stack of traversed objects and associate it with its clone.
      stackA.push(value);
      stackB.push(result);

      // Recursively populate clone (susceptible to call stack limits).
      (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
        result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
      });
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || context.Object();
      };
    }());

    /**
     * The base implementation of `_.delay` and `_.defer` which accepts an index
     * of where to slice the arguments to provide to `func`.
     *
     * @private
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {Object} args The arguments provide to `func`.
     * @returns {number} Returns the timer id.
     */
    function baseDelay(func, wait, args) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * The base implementation of `_.difference` which accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Array} values The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     */
    function baseDifference(array, values) {
      var length = array ? array.length : 0,
          result = [];

      if (!length) {
        return result;
      }
      var index = -1,
          indexOf = getIndexOf(),
          isCommon = indexOf == baseIndexOf,
          cache = (isCommon && values.length >= 200) ? createCache(values) : null,
          valuesLength = values.length;

      if (cache) {
        indexOf = cacheIndexOf;
        isCommon = false;
        values = cache;
      }
      outer:
      while (++index < length) {
        var value = array[index];

        if (isCommon && value === value) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === value) {
              continue outer;
            }
          }
          result.push(value);
        }
        else if (indexOf(values, value, 0) < 0) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.forEach` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object|string} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * The base implementation of `_.forEachRight` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object|string} Returns `collection`.
     */
    var baseEachRight = createBaseEach(baseForOwnRight, true);

    /**
     * The base implementation of `_.every` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`
     */
    function baseEvery(collection, predicate) {
      var result = true;
      baseEach(collection, function(value, index, collection) {
        result = !!predicate(value, index, collection);
        return result;
      });
      return result;
    }

    /**
     * The base implementation of `_.fill` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     */
    function baseFill(array, value, start, end) {
      var length = array.length;

      start = start == null ? 0 : (+start || 0);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined || end > length) ? length : (+end || 0);
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : (end >>> 0);
      start >>>= 0;

      while (start < length) {
        array[start++] = value;
      }
      return array;
    }

    /**
     * The base implementation of `_.filter` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
     * without support for callback shorthands and `this` binding, which iterates
     * over `collection` using the provided `eachFunc`.
     *
     * @private
     * @param {Array|Object|string} collection The collection to search.
     * @param {Function} predicate The function invoked per iteration.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @param {boolean} [retKey] Specify returning the key of the found element
     *  instead of the element itself.
     * @returns {*} Returns the found element or its key, else `undefined`.
     */
    function baseFind(collection, predicate, eachFunc, retKey) {
      var result;
      eachFunc(collection, function(value, key, collection) {
        if (predicate(value, key, collection)) {
          result = retKey ? key : value;
          return false;
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.flatten` with added support for restricting
     * flattening and specifying the start index.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} isDeep Specify a deep flatten.
     * @param {boolean} isStrict Restrict flattening to arrays and `arguments` objects.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, isDeep, isStrict) {
      var index = -1,
          length = array.length,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (isObjectLike(value) && isLength(value.length) && (isArray(value) || isArguments(value))) {
          if (isDeep) {
            // Recursively flatten arrays (susceptible to call stack limits).
            value = baseFlatten(value, isDeep, isStrict);
          }
          var valIndex = -1,
              valLength = value.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[++resIndex] = value[valIndex];
          }
        } else if (!isStrict) {
          result[++resIndex] = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `baseForIn` and `baseForOwn` which iterates
     * over `object` properties returned by `keysFunc` invoking `iteratee` for
     * each property. Iteratee functions may exit iteration early by explicitly
     * returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * This function is like `baseFor` except that it iterates over properties
     * in the opposite order.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseForRight = createBaseFor(true);

    /**
     * The base implementation of `_.forIn` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForIn(object, iteratee) {
      return baseFor(object, iteratee, keysIn);
    }

    /**
     * The base implementation of `_.forOwn` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return baseFor(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.forOwnRight` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwnRight(object, iteratee) {
      return baseForRight(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.functions` which creates an array of
     * `object` function property names filtered from those provided.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} props The property names to filter.
     * @returns {Array} Returns the new array of filtered property names.
     */
    function baseFunctions(object, props) {
      var index = -1,
          length = props.length,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var key = props[index];
        if (isFunction(object[key])) {
          result[++resIndex] = key;
        }
      }
      return result;
    }

    /**
     * The base implementation of `get` without support for string paths
     * and default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} path The path of the property to get.
     * @param {string} [pathKey] The key representation of path.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path, pathKey) {
      if (object == null) {
        return;
      }
      if (pathKey !== undefined && pathKey in toObject(object)) {
        path = [pathKey];
      }
      var index = -1,
          length = path.length;

      while (object != null && ++index < length) {
        var result = object = object[path[index]];
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual` without support for `this` binding
     * `customizer` functions.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparing values.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA] Tracks traversed `value` objects.
     * @param {Array} [stackB] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
      // Exit early for identical values.
      if (value === other) {
        // Treat `+0` vs. `-0` as not equal.
        return value !== 0 || (1 / value == 1 / other);
      }
      var valType = typeof value,
          othType = typeof other;

      // Exit early for unlike primitive values.
      if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||
          value == null || other == null) {
        // Return `false` unless both values are `NaN`.
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
    }

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparing objects.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `value` objects.
     * @param {Array} [stackB=[]] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = arrayTag,
          othTag = arrayTag;

      if (!objIsArr) {
        objTag = objToString.call(object);
        if (objTag == argsTag) {
          objTag = objectTag;
        } else if (objTag != objectTag) {
          objIsArr = isTypedArray(object);
        }
      }
      if (!othIsArr) {
        othTag = objToString.call(other);
        if (othTag == argsTag) {
          othTag = objectTag;
        } else if (othTag != objectTag) {
          othIsArr = isTypedArray(other);
        }
      }
      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && !(objIsArr || objIsObj)) {
        return equalByTag(object, other, objTag);
      }
      if (!isLoose) {
        var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (valWrapped || othWrapped) {
          return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
        }
      }
      if (!isSameTag) {
        return false;
      }
      // Assume cyclic values are equal.
      // For more information on detecting circular references see https://es5.github.io/#JO.
      stackA || (stackA = []);
      stackB || (stackB = []);

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == object) {
          return stackB[length] == other;
        }
      }
      // Add `object` and `other` to the stack of traversed objects.
      stackA.push(object);
      stackB.push(other);

      var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

      stackA.pop();
      stackB.pop();

      return result;
    }

    /**
     * The base implementation of `_.isMatch` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} props The source property names to match.
     * @param {Array} values The source values to match.
     * @param {Array} strictCompareFlags Strict comparison flags for source values.
     * @param {Function} [customizer] The function to customize comparing objects.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
      var index = -1,
          length = props.length,
          noCustomizer = !customizer;

      while (++index < length) {
        if ((noCustomizer && strictCompareFlags[index])
              ? values[index] !== object[props[index]]
              : !(props[index] in object)
            ) {
          return false;
        }
      }
      index = -1;
      while (++index < length) {
        var key = props[index],
            objValue = object[key],
            srcValue = values[index];

        if (noCustomizer && strictCompareFlags[index]) {
          var result = objValue !== undefined || (key in object);
        } else {
          result = customizer ? customizer(objValue, srcValue, key) : undefined;
          if (result === undefined) {
            result = baseIsEqual(srcValue, objValue, customizer, true);
          }
        }
        if (!result) {
          return false;
        }
      }
      return true;
    }

    /**
     * The base implementation of `_.map` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          length = getLength(collection),
          result = isLength(length) ? Array(length) : [];

      baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    /**
     * The base implementation of `_.matches` which does not clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new function.
     */
    function baseMatches(source) {
      var props = keys(source),
          length = props.length;

      if (!length) {
        return constant(true);
      }
      if (length == 1) {
        var key = props[0],
            value = source[key];

        if (isStrictComparable(value)) {
          return function(object) {
            if (object == null) {
              return false;
            }
            return object[key] === value && (value !== undefined || (key in toObject(object)));
          };
        }
      }
      var values = Array(length),
          strictCompareFlags = Array(length);

      while (length--) {
        value = source[props[length]];
        values[length] = value;
        strictCompareFlags[length] = isStrictComparable(value);
      }
      return function(object) {
        return object != null && baseIsMatch(toObject(object), props, values, strictCompareFlags);
      };
    }

    /**
     * The base implementation of `_.matchesProperty` which does not which does
     * not clone `value`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} value The value to compare.
     * @returns {Function} Returns the new function.
     */
    function baseMatchesProperty(path, value) {
      var isArr = isArray(path),
          isCommon = isKey(path) && isStrictComparable(value),
          pathKey = (path + '');

      path = toPath(path);
      return function(object) {
        if (object == null) {
          return false;
        }
        var key = pathKey;
        object = toObject(object);
        if ((isArr || !isCommon) && !(key in object)) {
          object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
          if (object == null) {
            return false;
          }
          key = last(path);
          object = toObject(object);
        }
        return object[key] === value
          ? (value !== undefined || (key in object))
          : baseIsEqual(value, object[key], null, true);
      };
    }

    /**
     * The base implementation of `_.merge` without support for argument juggling,
     * multiple sources, and `this` binding `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [customizer] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     * @returns {Object} Returns `object`.
     */
    function baseMerge(object, source, customizer, stackA, stackB) {
      if (!isObject(object)) {
        return object;
      }
      var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
      if (!isSrcArr) {
        var props = keys(source);
        push.apply(props, getSymbols(source));
      }
      arrayEach(props || source, function(srcValue, key) {
        if (props) {
          key = srcValue;
          srcValue = source[key];
        }
        if (isObjectLike(srcValue)) {
          stackA || (stackA = []);
          stackB || (stackB = []);
          baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
        }
        else {
          var value = object[key],
              result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
              isCommon = result === undefined;

          if (isCommon) {
            result = srcValue;
          }
          if ((isSrcArr || result !== undefined) &&
              (isCommon || (result === result ? (result !== value) : (value === value)))) {
            object[key] = result;
          }
        }
      });
      return object;
    }

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
      var length = stackA.length,
          srcValue = source[key];

      while (length--) {
        if (stackA[length] == srcValue) {
          object[key] = stackB[length];
          return;
        }
      }
      var value = object[key],
          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
          isCommon = result === undefined;

      if (isCommon) {
        result = srcValue;
        if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
          result = isArray(value)
            ? value
            : (getLength(value) ? arrayCopy(value) : []);
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          result = isArguments(value)
            ? toPlainObject(value)
            : (isPlainObject(value) ? value : {});
        }
        else {
          isCommon = false;
        }
      }
      // Add the source value to the stack of traversed objects and associate
      // it with its merged value.
      stackA.push(srcValue);
      stackB.push(result);

      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
      } else if (result === result ? (result !== value) : (value === value)) {
        object[key] = result;
      }
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new function.
     */
    function basePropertyDeep(path) {
      var pathKey = (path + '');
      path = toPath(path);
      return function(object) {
        return baseGet(object, path, pathKey);
      };
    }

    /**
     * The base implementation of `_.pullAt` without support for individual
     * index arguments and capturing the removed elements.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {number[]} indexes The indexes of elements to remove.
     * @returns {Array} Returns `array`.
     */
    function basePullAt(array, indexes) {
      var length = indexes.length;
      while (length--) {
        var index = parseFloat(indexes[length]);
        if (index != previous && isIndex(index)) {
          var previous = index;
          splice.call(array, index, 1);
        }
      }
      return array;
    }

    /**
     * The base implementation of `_.random` without support for argument juggling
     * and returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns the random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.reduce` and `_.reduceRight` without support
     * for callback shorthands and `this` binding, which iterates over `collection`
     * using the provided `eachFunc`.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} accumulator The initial value.
     * @param {boolean} initFromCollection Specify using the first or last element
     *  of `collection` as the initial value.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @returns {*} Returns the accumulated value.
     */
    function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
      eachFunc(collection, function(value, index, collection) {
        accumulator = initFromCollection
          ? (initFromCollection = false, value)
          : iteratee(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The base implementation of `setData` without support for hot loop detection.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var baseSetData = !metaMap ? identity : function(func, data) {
      metaMap.set(func, data);
      return func;
    };

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      start = start == null ? 0 : (+start || 0);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined || end > length) ? length : (+end || 0);
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    /**
     * The base implementation of `_.some` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function baseSome(collection, predicate) {
      var result;

      baseEach(collection, function(value, index, collection) {
        result = predicate(value, index, collection);
        return !result;
      });
      return !!result;
    }

    /**
     * The base implementation of `_.sortBy` which uses `comparer` to define
     * the sort order of `array` and replaces criteria objects with their
     * corresponding values.
     *
     * @private
     * @param {Array} array The array to sort.
     * @param {Function} comparer The function to define sort order.
     * @returns {Array} Returns `array`.
     */
    function baseSortBy(array, comparer) {
      var length = array.length;

      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }

    /**
     * The base implementation of `_.sortByOrder` without param guards.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
     * @param {boolean[]} orders The sort orders of `iteratees`.
     * @returns {Array} Returns the new sorted array.
     */
    function baseSortByOrder(collection, iteratees, orders) {
      var callback = getCallback(),
          index = -1;

      iteratees = arrayMap(iteratees, function(iteratee) { return callback(iteratee); });

      var result = baseMap(collection, function(value) {
        var criteria = arrayMap(iteratees, function(iteratee) { return iteratee(value); });
        return { 'criteria': criteria, 'index': ++index, 'value': value };
      });

      return baseSortBy(result, function(object, other) {
        return compareMultiple(object, other, orders);
      });
    }

    /**
     * The base implementation of `_.sum` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {number} Returns the sum.
     */
    function baseSum(collection, iteratee) {
      var result = 0;
      baseEach(collection, function(value, index, collection) {
        result += +iteratee(value, index, collection) || 0;
      });
      return result;
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The function invoked per iteration.
     * @returns {Array} Returns the new duplicate-value-free array.
     */
    function baseUniq(array, iteratee) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array.length,
          isCommon = indexOf == baseIndexOf,
          isLarge = isCommon && length >= 200,
          seen = isLarge ? createCache() : null,
          result = [];

      if (seen) {
        indexOf = cacheIndexOf;
        isCommon = false;
      } else {
        isLarge = false;
        seen = iteratee ? [] : result;
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value, index, array) : value;

        if (isCommon && value === value) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        }
        else if (indexOf(seen, computed, 0) < 0) {
          if (iteratee || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      var index = -1,
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /**
     * The base implementation of `_.dropRightWhile`, `_.dropWhile`, `_.takeRightWhile`,
     * and `_.takeWhile` without support for callback shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to query.
     * @param {Function} predicate The function invoked per iteration.
     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseWhile(array, predicate, isDrop, fromRight) {
      var length = array.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
      return isDrop
        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
    }

    /**
     * The base implementation of `wrapperValue` which returns the result of
     * performing a sequence of actions on the unwrapped `value`, where each
     * successive action is supplied the return value of the previous.
     *
     * @private
     * @param {*} value The unwrapped value.
     * @param {Array} actions Actions to peform to resolve the unwrapped value.
     * @returns {*} Returns the resolved value.
     */
    function baseWrapperValue(value, actions) {
      var result = value;
      if (result instanceof LazyWrapper) {
        result = result.value();
      }
      var index = -1,
          length = actions.length;

      while (++index < length) {
        var args = [result],
            action = actions[index];

        push.apply(args, action.args);
        result = action.func.apply(action.thisArg, args);
      }
      return result;
    }

    /**
     * Performs a binary search of `array` to determine the index at which `value`
     * should be inserted into `array` in order to maintain its sort order.
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function binaryIndex(array, value, retHighest) {
      var low = 0,
          high = array ? array.length : low;

      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
        while (low < high) {
          var mid = (low + high) >>> 1,
              computed = array[mid];

          if (retHighest ? (computed <= value) : (computed < value)) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return high;
      }
      return binaryIndexBy(array, value, identity, retHighest);
    }

    /**
     * This function is like `binaryIndex` except that it invokes `iteratee` for
     * `value` and each element of `array` to compute their sort ranking. The
     * iteratee is invoked with one argument; (value).
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function binaryIndexBy(array, value, iteratee, retHighest) {
      value = iteratee(value);

      var low = 0,
          high = array ? array.length : 0,
          valIsNaN = value !== value,
          valIsUndef = value === undefined;

      while (low < high) {
        var mid = floor((low + high) / 2),
            computed = iteratee(array[mid]),
            isReflexive = computed === computed;

        if (valIsNaN) {
          var setLow = isReflexive || retHighest;
        } else if (valIsUndef) {
          setLow = isReflexive && (retHighest || computed !== undefined);
        } else {
          setLow = retHighest ? (computed <= value) : (computed < value);
        }
        if (setLow) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return nativeMin(high, MAX_ARRAY_INDEX);
    }

    /**
     * A specialized version of `baseCallback` which only supports `this` binding
     * and specifying the number of arguments to provide to `func`.
     *
     * @private
     * @param {Function} func The function to bind.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {number} [argCount] The number of arguments to provide to `func`.
     * @returns {Function} Returns the callback.
     */
    function bindCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      if (thisArg === undefined) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
        case 5: return function(value, other, key, object, source) {
          return func.call(thisArg, value, other, key, object, source);
        };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    }

    /**
     * Creates a clone of the given array buffer.
     *
     * @private
     * @param {ArrayBuffer} buffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function bufferClone(buffer) {
      return bufferSlice.call(buffer, 0);
    }
    if (!bufferSlice) {
      // PhantomJS has `ArrayBuffer` and `Uint8Array` but not `Float64Array`.
      bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function(buffer) {
        var byteLength = buffer.byteLength,
            floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0,
            offset = floatLength * FLOAT64_BYTES_PER_ELEMENT,
            result = new ArrayBuffer(byteLength);

        if (floatLength) {
          var view = new Float64Array(result, 0, floatLength);
          view.set(new Float64Array(buffer, 0, floatLength));
        }
        if (byteLength != offset) {
          view = new Uint8Array(result, offset);
          view.set(new Uint8Array(buffer, offset));
        }
        return result;
      };
    }

    /**
     * Creates an array that is the composition of partially applied arguments,
     * placeholders, and provided arguments into a single array of arguments.
     *
     * @private
     * @param {Array|Object} args The provided arguments.
     * @param {Array} partials The arguments to prepend to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgs(args, partials, holders) {
      var holdersLength = holders.length,
          argsIndex = -1,
          argsLength = nativeMax(args.length - holdersLength, 0),
          leftIndex = -1,
          leftLength = partials.length,
          result = Array(argsLength + leftLength);

      while (++leftIndex < leftLength) {
        result[leftIndex] = partials[leftIndex];
      }
      while (++argsIndex < holdersLength) {
        result[holders[argsIndex]] = args[argsIndex];
      }
      while (argsLength--) {
        result[leftIndex++] = args[argsIndex++];
      }
      return result;
    }

    /**
     * This function is like `composeArgs` except that the arguments composition
     * is tailored for `_.partialRight`.
     *
     * @private
     * @param {Array|Object} args The provided arguments.
     * @param {Array} partials The arguments to append to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgsRight(args, partials, holders) {
      var holdersIndex = -1,
          holdersLength = holders.length,
          argsIndex = -1,
          argsLength = nativeMax(args.length - holdersLength, 0),
          rightIndex = -1,
          rightLength = partials.length,
          result = Array(argsLength + rightLength);

      while (++argsIndex < argsLength) {
        result[argsIndex] = args[argsIndex];
      }
      var pad = argsIndex;
      while (++rightIndex < rightLength) {
        result[pad + rightIndex] = partials[rightIndex];
      }
      while (++holdersIndex < holdersLength) {
        result[pad + holders[holdersIndex]] = args[argsIndex++];
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an accumulator
     * object composed from the results of running each element in the collection
     * through an iteratee.
     *
     * **Note:** This function is used to create `_.countBy`, `_.groupBy`, `_.indexBy`,
     * and `_.partition`.
     *
     * @private
     * @param {Function} setter The function to set keys and values of the accumulator object.
     * @param {Function} [initializer] The function to initialize the accumulator object.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter, initializer) {
      return function(collection, iteratee, thisArg) {
        var result = initializer ? initializer() : {};
        iteratee = getCallback(iteratee, thisArg, 3);

        if (isArray(collection)) {
          var index = -1,
              length = collection.length;

          while (++index < length) {
            var value = collection[index];
            setter(result, value, iteratee(value, index, collection), collection);
          }
        } else {
          baseEach(collection, function(value, key, collection) {
            setter(result, value, iteratee(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that assigns properties of source object(s) to a given
     * destination object.
     *
     * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return restParam(function(object, sources) {
        var index = -1,
            length = object == null ? 0 : sources.length,
            customizer = length > 2 && sources[length - 2],
            guard = length > 2 && sources[2],
            thisArg = length > 1 && sources[length - 1];

        if (typeof customizer == 'function') {
          customizer = bindCallback(customizer, thisArg, 5);
          length -= 2;
        } else {
          customizer = typeof thisArg == 'function' ? thisArg : null;
          length -= (customizer ? 1 : 0);
        }
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? null : customizer;
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, customizer);
          }
        }
        return object;
      });
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        var length = collection ? getLength(collection) : 0;
        if (!isLength(length)) {
          return eachFunc(collection, iteratee);
        }
        var index = fromRight ? length : -1,
            iterable = toObject(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * Creates a base function for `_.forIn` or `_.forInRight`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var iterable = toObject(object),
            props = keysFunc(object),
            length = props.length,
            index = fromRight ? length : -1;

        while ((fromRight ? index-- : ++index < length)) {
          var key = props[index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * Creates a function that wraps `func` and invokes it with the `this`
     * binding of `thisArg`.
     *
     * @private
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @returns {Function} Returns the new bound function.
     */
    function createBindWrapper(func, thisArg) {
      var Ctor = createCtorWrapper(func);

      function wrapper() {
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(thisArg, arguments);
      }
      return wrapper;
    }

    /**
     * Creates a `Set` cache object to optimize linear searches of large arrays.
     *
     * @private
     * @param {Array} [values] The values to cache.
     * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
     */
    var createCache = !(nativeCreate && Set) ? constant(null) : function(values) {
      return new SetCache(values);
    };

    /**
     * Creates a function that produces compound words out of the words in a
     * given string.
     *
     * @private
     * @param {Function} callback The function to combine each word.
     * @returns {Function} Returns the new compounder function.
     */
    function createCompounder(callback) {
      return function(string) {
        var index = -1,
            array = words(deburr(string)),
            length = array.length,
            result = '';

        while (++index < length) {
          result = callback(result, array[index], index);
        }
        return result;
      };
    }

    /**
     * Creates a function that produces an instance of `Ctor` regardless of
     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
     *
     * @private
     * @param {Function} Ctor The constructor to wrap.
     * @returns {Function} Returns the new wrapped function.
     */
    function createCtorWrapper(Ctor) {
      return function() {
        var thisBinding = baseCreate(Ctor.prototype),
            result = Ctor.apply(thisBinding, arguments);

        // Mimic the constructor's `return` behavior.
        // See https://es5.github.io/#x13.2.2 for more details.
        return isObject(result) ? result : thisBinding;
      };
    }

    /**
     * Creates a `_.curry` or `_.curryRight` function.
     *
     * @private
     * @param {boolean} flag The curry bit flag.
     * @returns {Function} Returns the new curry function.
     */
    function createCurry(flag) {
      function curryFunc(func, arity, guard) {
        if (guard && isIterateeCall(func, arity, guard)) {
          arity = null;
        }
        var result = createWrapper(func, flag, null, null, null, null, null, arity);
        result.placeholder = curryFunc.placeholder;
        return result;
      }
      return curryFunc;
    }

    /**
     * Creates a `_.max` or `_.min` function.
     *
     * @private
     * @param {Function} arrayFunc The function to get the extremum value from an array.
     * @param {boolean} [isMin] Specify returning the minimum, instead of the maximum,
     *  extremum value.
     * @returns {Function} Returns the new extremum function.
     */
    function createExtremum(arrayFunc, isMin) {
      return function(collection, iteratee, thisArg) {
        if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
          iteratee = null;
        }
        var func = getCallback(),
            noIteratee = iteratee == null;

        if (!(func === baseCallback && noIteratee)) {
          noIteratee = false;
          iteratee = func(iteratee, thisArg, 3);
        }
        if (noIteratee) {
          var isArr = isArray(collection);
          if (!isArr && isString(collection)) {
            iteratee = charAtCallback;
          } else {
            return arrayFunc(isArr ? collection : toIterable(collection));
          }
        }
        return extremumBy(collection, iteratee, isMin);
      };
    }

    /**
     * Creates a `_.find` or `_.findLast` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new find function.
     */
    function createFind(eachFunc, fromRight) {
      return function(collection, predicate, thisArg) {
        predicate = getCallback(predicate, thisArg, 3);
        if (isArray(collection)) {
          var index = baseFindIndex(collection, predicate, fromRight);
          return index > -1 ? collection[index] : undefined;
        }
        return baseFind(collection, predicate, eachFunc);
      }
    }

    /**
     * Creates a `_.findIndex` or `_.findLastIndex` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new find function.
     */
    function createFindIndex(fromRight) {
      return function(array, predicate, thisArg) {
        if (!(array && array.length)) {
          return -1;
        }
        predicate = getCallback(predicate, thisArg, 3);
        return baseFindIndex(array, predicate, fromRight);
      };
    }

    /**
     * Creates a `_.findKey` or `_.findLastKey` function.
     *
     * @private
     * @param {Function} objectFunc The function to iterate over an object.
     * @returns {Function} Returns the new find function.
     */
    function createFindKey(objectFunc) {
      return function(object, predicate, thisArg) {
        predicate = getCallback(predicate, thisArg, 3);
        return baseFind(object, predicate, objectFunc, true);
      };
    }

    /**
     * Creates a `_.flow` or `_.flowRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new flow function.
     */
    function createFlow(fromRight) {
      return function() {
        var length = arguments.length;
        if (!length) {
          return function() { return arguments[0]; };
        }
        var wrapper,
            index = fromRight ? length : -1,
            leftIndex = 0,
            funcs = Array(length);

        while ((fromRight ? index-- : ++index < length)) {
          var func = funcs[leftIndex++] = arguments[index];
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          var funcName = wrapper ? '' : getFuncName(func);
          wrapper = funcName == 'wrapper' ? new LodashWrapper([]) : wrapper;
        }
        index = wrapper ? -1 : length;
        while (++index < length) {
          func = funcs[index];
          funcName = getFuncName(func);

          var data = funcName == 'wrapper' ? getData(func) : null;
          if (data && isLaziable(data[0])) {
            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
          } else {
            wrapper = (func.length == 1 && isLaziable(func)) ? wrapper[funcName]() : wrapper.thru(func);
          }
        }
        return function() {
          var args = arguments;
          if (wrapper && args.length == 1 && isArray(args[0])) {
            return wrapper.plant(args[0]).value();
          }
          var index = 0,
              result = funcs[index].apply(this, args);

          while (++index < length) {
            result = funcs[index].call(this, result);
          }
          return result;
        };
      };
    }

    /**
     * Creates a function for `_.forEach` or `_.forEachRight`.
     *
     * @private
     * @param {Function} arrayFunc The function to iterate over an array.
     * @param {Function} eachFunc The function to iterate over a collection.
     * @returns {Function} Returns the new each function.
     */
    function createForEach(arrayFunc, eachFunc) {
      return function(collection, iteratee, thisArg) {
        return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
          ? arrayFunc(collection, iteratee)
          : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
      };
    }

    /**
     * Creates a function for `_.forIn` or `_.forInRight`.
     *
     * @private
     * @param {Function} objectFunc The function to iterate over an object.
     * @returns {Function} Returns the new each function.
     */
    function createForIn(objectFunc) {
      return function(object, iteratee, thisArg) {
        if (typeof iteratee != 'function' || thisArg !== undefined) {
          iteratee = bindCallback(iteratee, thisArg, 3);
        }
        return objectFunc(object, iteratee, keysIn);
      };
    }

    /**
     * Creates a function for `_.forOwn` or `_.forOwnRight`.
     *
     * @private
     * @param {Function} objectFunc The function to iterate over an object.
     * @returns {Function} Returns the new each function.
     */
    function createForOwn(objectFunc) {
      return function(object, iteratee, thisArg) {
        if (typeof iteratee != 'function' || thisArg !== undefined) {
          iteratee = bindCallback(iteratee, thisArg, 3);
        }
        return objectFunc(object, iteratee);
      };
    }

    /**
     * Creates a function for `_.padLeft` or `_.padRight`.
     *
     * @private
     * @param {boolean} [fromRight] Specify padding from the right.
     * @returns {Function} Returns the new pad function.
     */
    function createPadDir(fromRight) {
      return function(string, length, chars) {
        string = baseToString(string);
        return string && ((fromRight ? string : '') + createPadding(string, length, chars) + (fromRight ? '' : string));
      };
    }

    /**
     * Creates a `_.partial` or `_.partialRight` function.
     *
     * @private
     * @param {boolean} flag The partial bit flag.
     * @returns {Function} Returns the new partial function.
     */
    function createPartial(flag) {
      var partialFunc = restParam(function(func, partials) {
        var holders = replaceHolders(partials, partialFunc.placeholder);
        return createWrapper(func, flag, null, partials, holders);
      });
      return partialFunc;
    }

    /**
     * Creates a function for `_.reduce` or `_.reduceRight`.
     *
     * @private
     * @param {Function} arrayFunc The function to iterate over an array.
     * @param {Function} eachFunc The function to iterate over a collection.
     * @returns {Function} Returns the new each function.
     */
    function createReduce(arrayFunc, eachFunc) {
      return function(collection, iteratee, accumulator, thisArg) {
        var initFromArray = arguments.length < 3;
        return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
          ? arrayFunc(collection, iteratee, accumulator, initFromArray)
          : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
      };
    }

    /**
     * Creates a function that wraps `func` and invokes it with optional `this`
     * binding of, partial application, and currying.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to prepend to those provided to the new function.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
      var isAry = bitmask & ARY_FLAG,
          isBind = bitmask & BIND_FLAG,
          isBindKey = bitmask & BIND_KEY_FLAG,
          isCurry = bitmask & CURRY_FLAG,
          isCurryBound = bitmask & CURRY_BOUND_FLAG,
          isCurryRight = bitmask & CURRY_RIGHT_FLAG;

      var Ctor = !isBindKey && createCtorWrapper(func),
          key = func;

      function wrapper() {
        // Avoid `arguments` object use disqualifying optimizations by
        // converting it to an array before providing it to other functions.
        var length = arguments.length,
            index = length,
            args = Array(length);

        while (index--) {
          args[index] = arguments[index];
        }
        if (partials) {
          args = composeArgs(args, partials, holders);
        }
        if (partialsRight) {
          args = composeArgsRight(args, partialsRight, holdersRight);
        }
        if (isCurry || isCurryRight) {
          var placeholder = wrapper.placeholder,
              argsHolders = replaceHolders(args, placeholder);

          length -= argsHolders.length;
          if (length < arity) {
            var newArgPos = argPos ? arrayCopy(argPos) : null,
                newArity = nativeMax(arity - length, 0),
                newsHolders = isCurry ? argsHolders : null,
                newHoldersRight = isCurry ? null : argsHolders,
                newPartials = isCurry ? args : null,
                newPartialsRight = isCurry ? null : args;

            bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
            bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

            if (!isCurryBound) {
              bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
            }
            var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
                result = createHybridWrapper.apply(undefined, newData);

            if (isLaziable(func)) {
              setData(result, newData);
            }
            result.placeholder = placeholder;
            return result;
          }
        }
        var thisBinding = isBind ? thisArg : this;
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (argPos) {
          args = reorder(args, argPos);
        }
        if (isAry && ary < args.length) {
          args.length = ary;
        }
        var fn = (this && this !== root && this instanceof wrapper) ? (Ctor || createCtorWrapper(func)) : func;
        return fn.apply(thisBinding, args);
      }
      return wrapper;
    }

    /**
     * Creates the padding required for `string` based on the given `length`.
     * The `chars` string is truncated if the number of characters exceeds `length`.
     *
     * @private
     * @param {string} string The string to create padding for.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the pad for `string`.
     */
    function createPadding(string, length, chars) {
      var strLength = string.length;
      length = +length;

      if (strLength >= length || !nativeIsFinite(length)) {
        return '';
      }
      var padLength = length - strLength;
      chars = chars == null ? ' ' : (chars + '');
      return repeat(chars, ceil(padLength / chars.length)).slice(0, padLength);
    }

    /**
     * Creates a function that wraps `func` and invokes it with the optional `this`
     * binding of `thisArg` and the `partials` prepended to those provided to
     * the wrapper.
     *
     * @private
     * @param {Function} func The function to partially apply arguments to.
     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} partials The arguments to prepend to those provided to the new function.
     * @returns {Function} Returns the new bound function.
     */
    function createPartialWrapper(func, bitmask, thisArg, partials) {
      var isBind = bitmask & BIND_FLAG,
          Ctor = createCtorWrapper(func);

      function wrapper() {
        // Avoid `arguments` object use disqualifying optimizations by
        // converting it to an array before providing it `func`.
        var argsIndex = -1,
            argsLength = arguments.length,
            leftIndex = -1,
            leftLength = partials.length,
            args = Array(argsLength + leftLength);

        while (++leftIndex < leftLength) {
          args[leftIndex] = partials[leftIndex];
        }
        while (argsLength--) {
          args[leftIndex++] = arguments[++argsIndex];
        }
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(isBind ? thisArg : this, args);
      }
      return wrapper;
    }

    /**
     * Creates a `_.sortedIndex` or `_.sortedLastIndex` function.
     *
     * @private
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {Function} Returns the new index function.
     */
    function createSortedIndex(retHighest) {
      return function(array, value, iteratee, thisArg) {
        var func = getCallback(iteratee);
        return (func === baseCallback && iteratee == null)
          ? binaryIndex(array, value, retHighest)
          : binaryIndexBy(array, value, func(iteratee, thisArg, 1), retHighest);
      };
    }

    /**
     * Creates a function that either curries or invokes `func` with optional
     * `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of flags.
     *  The bitmask may be composed of the following flags:
     *     1 - `_.bind`
     *     2 - `_.bindKey`
     *     4 - `_.curry` or `_.curryRight` of a bound function
     *     8 - `_.curry`
     *    16 - `_.curryRight`
     *    32 - `_.partial`
     *    64 - `_.partialRight`
     *   128 - `_.rearg`
     *   256 - `_.ary`
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to be partially applied.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
      var isBindKey = bitmask & BIND_KEY_FLAG;
      if (!isBindKey && typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var length = partials ? partials.length : 0;
      if (!length) {
        bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
        partials = holders = null;
      }
      length -= (holders ? holders.length : 0);
      if (bitmask & PARTIAL_RIGHT_FLAG) {
        var partialsRight = partials,
            holdersRight = holders;

        partials = holders = null;
      }
      var data = isBindKey ? null : getData(func),
          newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

      if (data) {
        mergeData(newData, data);
        bitmask = newData[1];
        arity = newData[9];
      }
      newData[9] = arity == null
        ? (isBindKey ? 0 : func.length)
        : (nativeMax(arity - length, 0) || 0);

      if (bitmask == BIND_FLAG) {
        var result = createBindWrapper(newData[0], newData[2]);
      } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
        result = createPartialWrapper.apply(undefined, newData);
      } else {
        result = createHybridWrapper.apply(undefined, newData);
      }
      var setter = data ? baseSetData : setData;
      return setter(result, newData);
    }

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparing arrays.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA] Tracks traversed `value` objects.
     * @param {Array} [stackB] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
      var index = -1,
          arrLength = array.length,
          othLength = other.length,
          result = true;

      if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
        return false;
      }
      // Deep compare the contents, ignoring non-numeric properties.
      while (result && ++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        result = undefined;
        if (customizer) {
          result = isLoose
            ? customizer(othValue, arrValue, index)
            : customizer(arrValue, othValue, index);
        }
        if (result === undefined) {
          // Recursively compare arrays (susceptible to call stack limits).
          if (isLoose) {
            var othIndex = othLength;
            while (othIndex--) {
              othValue = other[othIndex];
              result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
              if (result) {
                break;
              }
            }
          } else {
            result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
          }
        }
      }
      return !!result;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} value The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag) {
      switch (tag) {
        case boolTag:
        case dateTag:
          // Coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
          return +object == +other;

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case numberTag:
          // Treat `NaN` vs. `NaN` as equal.
          return (object != +object)
            ? other != +other
            // But, treat `-0` vs. `+0` as not equal.
            : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings primitives and string
          // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
          return object == (other + '');
      }
      return false;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparing values.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA] Tracks traversed `value` objects.
     * @param {Array} [stackB] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
      var objProps = keys(object),
          objLength = objProps.length,
          othProps = keys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isLoose) {
        return false;
      }
      var skipCtor = isLoose,
          index = -1;

      while (++index < objLength) {
        var key = objProps[index],
            result = isLoose ? key in other : hasOwnProperty.call(other, key);

        if (result) {
          var objValue = object[key],
              othValue = other[key];

          result = undefined;
          if (customizer) {
            result = isLoose
              ? customizer(othValue, objValue, key)
              : customizer(objValue, othValue, key);
          }
          if (result === undefined) {
            // Recursively compare objects (susceptible to call stack limits).
            result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB);
          }
        }
        if (!result) {
          return false;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (!skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Gets the extremum value of `collection` invoking `iteratee` for each value
     * in `collection` to generate the criterion by which the value is ranked.
     * The `iteratee` is invoked with three arguments: (value, index, collection).
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {boolean} [isMin] Specify returning the minimum, instead of the
     *  maximum, extremum value.
     * @returns {*} Returns the extremum value.
     */
    function extremumBy(collection, iteratee, isMin) {
      var exValue = isMin ? POSITIVE_INFINITY : NEGATIVE_INFINITY,
          computed = exValue,
          result = computed;

      baseEach(collection, function(value, index, collection) {
        var current = iteratee(value, index, collection);
        if ((isMin ? (current < computed) : (current > computed)) ||
            (current === exValue && current === result)) {
          computed = current;
          result = value;
        }
      });
      return result;
    }

    /**
     * Gets the appropriate "callback" function. If the `_.callback` method is
     * customized this function returns the custom method, otherwise it returns
     * the `baseCallback` function. If arguments are provided the chosen function
     * is invoked with them and its result is returned.
     *
     * @private
     * @returns {Function} Returns the chosen function or its result.
     */
    function getCallback(func, thisArg, argCount) {
      var result = lodash.callback || callback;
      result = result === callback ? baseCallback : result;
      return argCount ? result(func, thisArg, argCount) : result;
    }

    /**
     * Gets metadata for `func`.
     *
     * @private
     * @param {Function} func The function to query.
     * @returns {*} Returns the metadata for `func`.
     */
    var getData = !metaMap ? noop : function(func) {
      return metaMap.get(func);
    };

    /**
     * Gets the name of `func`.
     *
     * @private
     * @param {Function} func The function to query.
     * @returns {string} Returns the function name.
     */
    var getFuncName = (function() {
      if (!support.funcNames) {
        return constant('');
      }
      if (constant.name == 'constant') {
        return baseProperty('name');
      }
      return function(func) {
        var result = func.name,
            array = realNames[result],
            length = array ? array.length : 0;

        while (length--) {
          var data = array[length],
              otherFunc = data.func;

          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result;
      };
    }());

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized this function returns the custom method, otherwise it returns
     * the `baseIndexOf` function. If arguments are provided the chosen function
     * is invoked with them and its result is returned.
     *
     * @private
     * @returns {Function|number} Returns the chosen function or its result.
     */
    function getIndexOf(collection, target, fromIndex) {
      var result = lodash.indexOf || indexOf;
      result = result === indexOf ? baseIndexOf : result;
      return collection ? result(collection, target, fromIndex) : result;
    }

    /**
     * Gets the "length" property value of `object`.
     *
     * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
     * in Safari on iOS 8.1 ARM64.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {*} Returns the "length" value.
     */
    var getLength = baseProperty('length');

    /**
     * Creates an array of the own symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !getOwnPropertySymbols ? constant([]) : function(object) {
      return getOwnPropertySymbols(toObject(object));
    };

    /**
     * Gets the view, applying any `transforms` to the `start` and `end` positions.
     *
     * @private
     * @param {number} start The start of the view.
     * @param {number} end The end of the view.
     * @param {Array} [transforms] The transformations to apply to the view.
     * @returns {Object} Returns an object containing the `start` and `end`
     *  positions of the view.
     */
    function getView(start, end, transforms) {
      var index = -1,
          length = transforms ? transforms.length : 0;

      while (++index < length) {
        var data = transforms[index],
            size = data.size;

        switch (data.type) {
          case 'drop':      start += size; break;
          case 'dropRight': end -= size; break;
          case 'take':      end = nativeMin(end, start + size); break;
          case 'takeRight': start = nativeMax(start, end - size); break;
        }
      }
      return { 'start': start, 'end': end };
    }

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add array properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      var Ctor = object.constructor;
      if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
        Ctor = Object;
      }
      return new Ctor;
    }

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return bufferClone(object);

        case boolTag:
        case dateTag:
          return new Ctor(+object);

        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          var buffer = object.buffer;
          return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

        case numberTag:
        case stringTag:
          return new Ctor(object);

        case regexpTag:
          var result = new Ctor(object.source, reFlags.exec(object));
          result.lastIndex = object.lastIndex;
      }
      return result;
    }

    /**
     * Invokes the method at `path` on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the method to invoke.
     * @param {Array} args The arguments to invoke the method with.
     * @returns {*} Returns the result of the invoked method.
     */
    function invokePath(object, path, args) {
      if (object != null && !isKey(path, object)) {
        path = toPath(path);
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        path = last(path);
      }
      var func = object == null ? object : object[path];
      return func == null ? undefined : func.apply(object, args);
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      value = +value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return value > -1 && value % 1 == 0 && value < length;
    }

    /**
     * Checks if the provided arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number') {
        var length = getLength(object),
            prereq = isLength(length) && isIndex(index, length);
      } else {
        prereq = type == 'string' && index in object;
      }
      if (prereq) {
        var other = object[index];
        return value === value ? (value === other) : (other !== other);
      }
      return false;
    }

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      var type = typeof value;
      if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
        return true;
      }
      if (isArray(value)) {
        return false;
      }
      var result = !reIsDeepProp.test(value);
      return result || (object != null && value in toObject(object));
    }

    /**
     * Checks if `func` has a lazy counterpart.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
     */
    function isLaziable(func) {
      var funcName = getFuncName(func);
      return !!funcName && func === lodash[funcName] && funcName in LazyWrapper.prototype;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     */
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));
    }

    /**
     * Merges the function metadata of `source` into `data`.
     *
     * Merging metadata reduces the number of wrappers required to invoke a function.
     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
     * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
     * augment function arguments, making the order in which they are executed important,
     * preventing the merging of metadata. However, we make an exception for a safe
     * common case where curried functions have `_.ary` and or `_.rearg` applied.
     *
     * @private
     * @param {Array} data The destination metadata.
     * @param {Array} source The source metadata.
     * @returns {Array} Returns `data`.
     */
    function mergeData(data, source) {
      var bitmask = data[1],
          srcBitmask = source[1],
          newBitmask = bitmask | srcBitmask,
          isCommon = newBitmask < ARY_FLAG;

      var isCombo =
        (srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG) ||
        (srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8]) ||
        (srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG);

      // Exit early if metadata can't be merged.
      if (!(isCommon || isCombo)) {
        return data;
      }
      // Use source `thisArg` if available.
      if (srcBitmask & BIND_FLAG) {
        data[2] = source[2];
        // Set when currying a bound function.
        newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
      }
      // Compose partial arguments.
      var value = source[3];
      if (value) {
        var partials = data[3];
        data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
      }
      // Compose partial right arguments.
      value = source[5];
      if (value) {
        partials = data[5];
        data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
      }
      // Use source `argPos` if available.
      value = source[7];
      if (value) {
        data[7] = arrayCopy(value);
      }
      // Use source `ary` if it's smaller.
      if (srcBitmask & ARY_FLAG) {
        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
      }
      // Use source `arity` if one is not provided.
      if (data[9] == null) {
        data[9] = source[9];
      }
      // Use source `func` and merge bitmasks.
      data[0] = source[0];
      data[1] = newBitmask;

      return data;
    }

    /**
     * A specialized version of `_.pick` that picks `object` properties specified
     * by `props`.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} props The property names to pick.
     * @returns {Object} Returns the new object.
     */
    function pickByArray(object, props) {
      object = toObject(object);

      var index = -1,
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        if (key in object) {
          result[key] = object[key];
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.pick` that picks `object` properties `predicate`
     * returns truthy for.
     *
     * @private
     * @param {Object} object The source object.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Object} Returns the new object.
     */
    function pickByCallback(object, predicate) {
      var result = {};
      baseForIn(object, function(value, key, object) {
        if (predicate(value, key, object)) {
          result[key] = value;
        }
      });
      return result;
    }

    /**
     * Reorder `array` according to the specified indexes where the element at
     * the first index is assigned as the first element, the element at
     * the second index is assigned as the second element, and so on.
     *
     * @private
     * @param {Array} array The array to reorder.
     * @param {Array} indexes The arranged array indexes.
     * @returns {Array} Returns `array`.
     */
    function reorder(array, indexes) {
      var arrLength = array.length,
          length = nativeMin(indexes.length, arrLength),
          oldArray = arrayCopy(array);

      while (length--) {
        var index = indexes[length];
        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
      }
      return array;
    }

    /**
     * Sets metadata for `func`.
     *
     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
     * period of time, it will trip its breaker and transition to an identity function
     * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
     * for more details.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var setData = (function() {
      var count = 0,
          lastCalled = 0;

      return function(key, value) {
        var stamp = now(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return key;
          }
        } else {
          count = 0;
        }
        return baseSetData(key, value);
      };
    }());

    /**
     * A fallback implementation of `_.isPlainObject` which checks if `value`
     * is an object created by the `Object` constructor or has a `[[Prototype]]`
     * of `null`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var Ctor,
          support = lodash.support;

      // Exit early for non `Object` objects.
      if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
          (!hasOwnProperty.call(value, 'constructor') &&
            (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
        return false;
      }
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      var result;
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      baseForIn(value, function(subValue, key) {
        result = key;
      });
      return result === undefined || hasOwnProperty.call(value, result);
    }

    /**
     * A fallback implementation of `Object.keys` which creates an array of the
     * own enumerable property names of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function shimKeys(object) {
      var props = keysIn(object),
          propsLength = props.length,
          length = propsLength && object.length,
          support = lodash.support;

      var allowIndexes = length && isLength(length) &&
        (isArray(object) || (support.nonEnumArgs && isArguments(object)));

      var index = -1,
          result = [];

      while (++index < propsLength) {
        var key = props[index];
        if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Converts `value` to an array-like object if it is not one.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {Array|Object} Returns the array-like object.
     */
    function toIterable(value) {
      if (value == null) {
        return [];
      }
      if (!isLength(getLength(value))) {
        return values(value);
      }
      return isObject(value) ? value : Object(value);
    }

    /**
     * Converts `value` to an object if it is not one.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {Object} Returns the object.
     */
    function toObject(value) {
      return isObject(value) ? value : Object(value);
    }

    /**
     * Converts `value` to property path array if it is not one.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {Array} Returns the property path array.
     */
    function toPath(value) {
      if (isArray(value)) {
        return value;
      }
      var result = [];
      baseToString(value).replace(rePropName, function(match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    }

    /**
     * Creates a clone of `wrapper`.
     *
     * @private
     * @param {Object} wrapper The wrapper to clone.
     * @returns {Object} Returns the cloned wrapper.
     */
    function wrapperClone(wrapper) {
      return wrapper instanceof LazyWrapper
        ? wrapper.clone()
        : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of elements split into groups the length of `size`.
     * If `collection` can't be split evenly, the final chunk will be the remaining
     * elements.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to process.
     * @param {number} [size=1] The length of each chunk.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the new array containing chunks.
     * @example
     *
     * _.chunk(['a', 'b', 'c', 'd'], 2);
     * // => [['a', 'b'], ['c', 'd']]
     *
     * _.chunk(['a', 'b', 'c', 'd'], 3);
     * // => [['a', 'b', 'c'], ['d']]
     */
    function chunk(array, size, guard) {
      if (guard ? isIterateeCall(array, size, guard) : size == null) {
        size = 1;
      } else {
        size = nativeMax(+size || 1, 1);
      }
      var index = 0,
          length = array ? array.length : 0,
          resIndex = -1,
          result = Array(ceil(length / size));

      while (index < length) {
        result[++resIndex] = baseSlice(array, index, (index += size));
      }
      return result;
    }

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are falsey.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to compact.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[++resIndex] = value;
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using
     * `SameValueZero` for equality comparisons.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3], [4, 2]);
     * // => [1, 3]
     */
    var difference = restParam(function(array, values) {
      return (isArray(array) || isArguments(array))
        ? baseDifference(array, baseFlatten(values, false, true))
        : [];
    });

    /**
     * Creates a slice of `array` with `n` elements dropped from the beginning.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.drop([1, 2, 3]);
     * // => [2, 3]
     *
     * _.drop([1, 2, 3], 2);
     * // => [3]
     *
     * _.drop([1, 2, 3], 5);
     * // => []
     *
     * _.drop([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function drop(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      return baseSlice(array, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with `n` elements dropped from the end.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropRight([1, 2, 3]);
     * // => [1, 2]
     *
     * _.dropRight([1, 2, 3], 2);
     * // => [1]
     *
     * _.dropRight([1, 2, 3], 5);
     * // => []
     *
     * _.dropRight([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function dropRight(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      n = length - (+n || 0);
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the end.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * bound to `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that match the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropRightWhile([1, 2, 3], function(n) {
     *   return n > 1;
     * });
     * // => [1]
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.dropRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
     * // => ['barney', 'fred']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.dropRightWhile(users, 'active', false), 'user');
     * // => ['barney']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.dropRightWhile(users, 'active'), 'user');
     * // => ['barney', 'fred', 'pebbles']
     */
    function dropRightWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3), true, true)
        : [];
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the beginning.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * bound to `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropWhile([1, 2, 3], function(n) {
     *   return n < 3;
     * });
     * // => [3]
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.dropWhile(users, { 'user': 'barney', 'active': false }), 'user');
     * // => ['fred', 'pebbles']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.dropWhile(users, 'active', false), 'user');
     * // => ['pebbles']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.dropWhile(users, 'active'), 'user');
     * // => ['barney', 'fred', 'pebbles']
     */
    function dropWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3), true)
        : [];
    }

    /**
     * Fills elements of `array` with `value` from `start` up to, but not
     * including, `end`.
     *
     * **Note:** This method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _.fill(array, 'a');
     * console.log(array);
     * // => ['a', 'a', 'a']
     *
     * _.fill(Array(3), 2);
     * // => [2, 2, 2]
     *
     * _.fill([4, 6, 8], '*', 1, 2);
     * // => [4, '*', 8]
     */
    function fill(array, value, start, end) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
        start = 0;
        end = length;
      }
      return baseFill(array, value, start, end);
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.findIndex(users, function(chr) {
     *   return chr.user == 'barney';
     * });
     * // => 0
     *
     * // using the `_.matches` callback shorthand
     * _.findIndex(users, { 'user': 'fred', 'active': false });
     * // => 1
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findIndex(users, 'active', false);
     * // => 0
     *
     * // using the `_.property` callback shorthand
     * _.findIndex(users, 'active');
     * // => 2
     */
    var findIndex = createFindIndex();

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of `collection` from right to left.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.findLastIndex(users, function(chr) {
     *   return chr.user == 'pebbles';
     * });
     * // => 2
     *
     * // using the `_.matches` callback shorthand
     * _.findLastIndex(users, { 'user': 'barney', 'active': true });
     * // => 0
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findLastIndex(users, 'active', false);
     * // => 2
     *
     * // using the `_.property` callback shorthand
     * _.findLastIndex(users, 'active');
     * // => 0
     */
    var findLastIndex = createFindIndex(true);

    /**
     * Gets the first element of `array`.
     *
     * @static
     * @memberOf _
     * @alias head
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the first element of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([]);
     * // => undefined
     */
    function first(array) {
      return array ? array[0] : undefined;
    }

    /**
     * Flattens a nested array. If `isDeep` is `true` the array is recursively
     * flattened, otherwise it is only flattened a single level.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to flatten.
     * @param {boolean} [isDeep] Specify a deep flatten.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flatten([1, [2, 3, [4]]]);
     * // => [1, 2, 3, [4]]
     *
     * // using `isDeep`
     * _.flatten([1, [2, 3, [4]]], true);
     * // => [1, 2, 3, 4]
     */
    function flatten(array, isDeep, guard) {
      var length = array ? array.length : 0;
      if (guard && isIterateeCall(array, isDeep, guard)) {
        isDeep = false;
      }
      return length ? baseFlatten(array, isDeep) : [];
    }

    /**
     * Recursively flattens a nested array.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to recursively flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flattenDeep([1, [2, 3, [4]]]);
     * // => [1, 2, 3, 4]
     */
    function flattenDeep(array) {
      var length = array ? array.length : 0;
      return length ? baseFlatten(array, true) : [];
    }

    /**
     * Gets the index at which the first occurrence of `value` is found in `array`
     * using `SameValueZero` for equality comparisons. If `fromIndex` is negative,
     * it is used as the offset from the end of `array`. If `array` is sorted
     * providing `true` for `fromIndex` performs a faster binary search.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.indexOf([1, 2, 1, 2], 2);
     * // => 1
     *
     * // using `fromIndex`
     * _.indexOf([1, 2, 1, 2], 2, 2);
     * // => 3
     *
     * // performing a binary search
     * _.indexOf([1, 1, 2, 2], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      if (typeof fromIndex == 'number') {
        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
      } else if (fromIndex) {
        var index = binaryIndex(array, value),
            other = array[index];

        if (value === value ? (value === other) : (other !== other)) {
          return index;
        }
        return -1;
      }
      return baseIndexOf(array, value, fromIndex || 0);
    }

    /**
     * Gets all but the last element of `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     */
    function initial(array) {
      return dropRight(array, 1);
    }

    /**
     * Creates an array of unique values in all provided arrays using `SameValueZero`
     * for equality comparisons.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of shared values.
     * @example
     * _.intersection([1, 2], [4, 2], [2, 1]);
     * // => [2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = [],
          indexOf = getIndexOf(),
          isCommon = indexOf == baseIndexOf,
          result = [];

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push((isCommon && value.length >= 120) ? createCache(argsIndex && value) : null);
        }
      }
      argsLength = args.length;
      if (argsLength < 2) {
        return result;
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          seen = caches[0];

      outer:
      while (++index < length) {
        value = array[index];
        if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
          argsIndex = argsLength;
          while (--argsIndex) {
            var cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value, 0)) < 0) {
              continue outer;
            }
          }
          if (seen) {
            seen.push(value);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Gets the last element of `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the last element of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     */
    function last(array) {
      var length = array ? array.length : 0;
      return length ? array[length - 1] : undefined;
    }

    /**
     * This method is like `_.indexOf` except that it iterates over elements of
     * `array` from right to left.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=array.length-1] The index to search from
     *  or `true` to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 1, 2], 2);
     * // => 3
     *
     * // using `fromIndex`
     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
     * // => 1
     *
     * // performing a binary search
     * _.lastIndexOf([1, 1, 2, 2], 2, true);
     * // => 3
     */
    function lastIndexOf(array, value, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      var index = length;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;
      } else if (fromIndex) {
        index = binaryIndex(array, value, true) - 1;
        var other = array[index];
        if (value === value ? (value === other) : (other !== other)) {
          return index;
        }
        return -1;
      }
      if (value !== value) {
        return indexOfNaN(array, index, true);
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from `array` using `SameValueZero` for equality
     * comparisons.
     *
     * **Notes:**
     *  - Unlike `_.without`, this method mutates `array`
     *  - [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     *    comparisons are like strict equality comparisons, e.g. `===`, except
     *    that `NaN` matches `NaN`
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...*} [values] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     *
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull() {
      var args = arguments,
          array = args[0];

      if (!(array && array.length)) {
        return array;
      }
      var index = 0,
          indexOf = getIndexOf(),
          length = args.length;

      while (++index < length) {
        var fromIndex = 0,
            value = args[index];

        while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {
          splice.call(array, fromIndex, 1);
        }
      }
      return array;
    }

    /**
     * Removes elements from `array` corresponding to the given indexes and returns
     * an array of the removed elements. Indexes may be specified as an array of
     * indexes or as individual arguments.
     *
     * **Note:** Unlike `_.at`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...(number|number[])} [indexes] The indexes of elements to remove,
     *  specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = [5, 10, 15, 20];
     * var evens = _.pullAt(array, 1, 3);
     *
     * console.log(array);
     * // => [5, 15]
     *
     * console.log(evens);
     * // => [10, 20]
     */
    var pullAt = restParam(function(array, indexes) {
      array || (array = []);
      indexes = baseFlatten(indexes);

      var result = baseAt(array, indexes);
      basePullAt(array, indexes.sort(baseCompareAscending));
      return result;
    });

    /**
     * Removes all elements from `array` that `predicate` returns truthy for
     * and returns an array of the removed elements. The predicate is bound to
     * `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * **Note:** Unlike `_.filter`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4];
     * var evens = _.remove(array, function(n) {
     *   return n % 2 == 0;
     * });
     *
     * console.log(array);
     * // => [1, 3]
     *
     * console.log(evens);
     * // => [2, 4]
     */
    function remove(array, predicate, thisArg) {
      var result = [];
      if (!(array && array.length)) {
        return result;
      }
      var index = -1,
          indexes = [],
          length = array.length;

      predicate = getCallback(predicate, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result.push(value);
          indexes.push(index);
        }
      }
      basePullAt(array, indexes);
      return result;
    }

    /**
     * Gets all but the first element of `array`.
     *
     * @static
     * @memberOf _
     * @alias tail
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     */
    function rest(array) {
      return drop(array, 1);
    }

    /**
     * Creates a slice of `array` from `start` up to, but not including, `end`.
     *
     * **Note:** This method is used instead of `Array#slice` to support node
     * lists in IE < 9 and to ensure dense arrays are returned.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function slice(array, start, end) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
        start = 0;
        end = length;
      }
      return baseSlice(array, start, end);
    }

    /**
     * Uses a binary search to determine the lowest index at which `value` should
     * be inserted into `array` in order to maintain its sort order. If an iteratee
     * function is provided it is invoked for `value` and each element of `array`
     * to compute their sort ranking. The iteratee is bound to `thisArg` and
     * invoked with one argument; (value).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([30, 50], 40);
     * // => 1
     *
     * _.sortedIndex([4, 4, 5, 5], 5);
     * // => 2
     *
     * var dict = { 'data': { 'thirty': 30, 'forty': 40, 'fifty': 50 } };
     *
     * // using an iteratee function
     * _.sortedIndex(['thirty', 'fifty'], 'forty', function(word) {
     *   return this.data[word];
     * }, dict);
     * // => 1
     *
     * // using the `_.property` callback shorthand
     * _.sortedIndex([{ 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 1
     */
    var sortedIndex = createSortedIndex();

    /**
     * This method is like `_.sortedIndex` except that it returns the highest
     * index at which `value` should be inserted into `array` in order to
     * maintain its sort order.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedLastIndex([4, 4, 5, 5], 5);
     * // => 4
     */
    var sortedLastIndex = createSortedIndex(true);

    /**
     * Creates a slice of `array` with `n` elements taken from the beginning.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.take([1, 2, 3]);
     * // => [1]
     *
     * _.take([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.take([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.take([1, 2, 3], 0);
     * // => []
     */
    function take(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with `n` elements taken from the end.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeRight([1, 2, 3]);
     * // => [3]
     *
     * _.takeRight([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.takeRight([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.takeRight([1, 2, 3], 0);
     * // => []
     */
    function takeRight(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      n = length - (+n || 0);
      return baseSlice(array, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with elements taken from the end. Elements are
     * taken until `predicate` returns falsey. The predicate is bound to `thisArg`
     * and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeRightWhile([1, 2, 3], function(n) {
     *   return n > 1;
     * });
     * // => [2, 3]
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.takeRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
     * // => ['pebbles']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.takeRightWhile(users, 'active', false), 'user');
     * // => ['fred', 'pebbles']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.takeRightWhile(users, 'active'), 'user');
     * // => []
     */
    function takeRightWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3), false, true)
        : [];
    }

    /**
     * Creates a slice of `array` with elements taken from the beginning. Elements
     * are taken until `predicate` returns falsey. The predicate is bound to
     * `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeWhile([1, 2, 3], function(n) {
     *   return n < 3;
     * });
     * // => [1, 2]
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false},
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.takeWhile(users, { 'user': 'barney', 'active': false }), 'user');
     * // => ['barney']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.takeWhile(users, 'active', false), 'user');
     * // => ['barney', 'fred']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.takeWhile(users, 'active'), 'user');
     * // => []
     */
    function takeWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3))
        : [];
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * `SameValueZero` for equality comparisons.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * _.union([1, 2], [4, 2], [2, 1]);
     * // => [1, 2, 4]
     */
    var union = restParam(function(arrays) {
      return baseUniq(baseFlatten(arrays, false, true));
    });

    /**
     * Creates a duplicate-free version of an array, using `SameValueZero` for
     * equality comparisons, in which only the first occurence of each element
     * is kept. Providing `true` for `isSorted` performs a faster search algorithm
     * for sorted arrays. If an iteratee function is provided it is invoked for
     * each element in the array to generate the criterion by which uniqueness
     * is computed. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index, array).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {boolean} [isSorted] Specify the array is sorted.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new duplicate-value-free array.
     * @example
     *
     * _.uniq([2, 1, 2]);
     * // => [2, 1]
     *
     * // using `isSorted`
     * _.uniq([1, 1, 2], true);
     * // => [1, 2]
     *
     * // using an iteratee function
     * _.uniq([1, 2.5, 1.5, 2], function(n) {
     *   return this.floor(n);
     * }, Math);
     * // => [1, 2.5]
     *
     * // using the `_.property` callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, iteratee, thisArg) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (isSorted != null && typeof isSorted != 'boolean') {
        thisArg = iteratee;
        iteratee = isIterateeCall(array, isSorted, thisArg) ? null : isSorted;
        isSorted = false;
      }
      var func = getCallback();
      if (!(func === baseCallback && iteratee == null)) {
        iteratee = func(iteratee, thisArg, 3);
      }
      return (isSorted && getIndexOf() == baseIndexOf)
        ? sortedUniq(array, iteratee)
        : baseUniq(array, iteratee);
    }

    /**
     * This method is like `_.zip` except that it accepts an array of grouped
     * elements and creates an array regrouping the elements to their pre-`_.zip`
     * configuration.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     *
     * _.unzip(zipped);
     * // => [['fred', 'barney'], [30, 40], [true, false]]
     */
    function unzip(array) {
      var index = -1,
          length = (array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0,
          result = Array(length);

      while (++index < length) {
        result[index] = arrayMap(array, baseProperty(index));
      }
      return result;
    }

    /**
     * Creates an array excluding all provided values using `SameValueZero` for
     * equality comparisons.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to filter.
     * @param {...*} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 3], 1, 2);
     * // => [3]
     */
    var without = restParam(function(array, values) {
      return (isArray(array) || isArguments(array))
        ? baseDifference(array, values)
        : [];
    });

    /**
     * Creates an array that is the [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
     * of the provided arrays.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of values.
     * @example
     *
     * _.xor([1, 2], [4, 2]);
     * // => [1, 4]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseDifference(result, array).concat(baseDifference(array, result))
            : array;
        }
      }
      return result ? baseUniq(result) : [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second elements
     * of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    var zip = restParam(unzip);

    /**
     * The inverse of `_.pairs`; this method returns an object composed from arrays
     * of property names and values. Provide either a single two dimensional array,
     * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
     * and one of corresponding values.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Array
     * @param {Array} props The property names.
     * @param {Array} [values=[]] The property values.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.zipObject([['fred', 30], ['barney', 40]]);
     * // => { 'fred': 30, 'barney': 40 }
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(props, values) {
      var index = -1,
          length = props ? props.length : 0,
          result = {};

      if (length && !values && !isArray(props[0])) {
        values = [];
      }
      while (++index < length) {
        var key = props[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps `value` with explicit method
     * chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chain
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36 },
     *   { 'user': 'fred',    'age': 40 },
     *   { 'user': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(users)
     *   .sortBy('age')
     *   .map(function(chr) {
     *     return chr.user + ' is ' + chr.age;
     *   })
     *   .first()
     *   .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      var result = lodash(value);
      result.__chain__ = true;
      return result;
    }

    /**
     * This method invokes `interceptor` and returns `value`. The interceptor is
     * bound to `thisArg` and invoked with one argument; (value). The purpose of
     * this method is to "tap into" a method chain in order to perform operations
     * on intermediate results within the chain.
     *
     * @static
     * @memberOf _
     * @category Chain
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @param {*} [thisArg] The `this` binding of `interceptor`.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3])
     *  .tap(function(array) {
     *    array.pop();
     *  })
     *  .reverse()
     *  .value();
     * // => [2, 1]
     */
    function tap(value, interceptor, thisArg) {
      interceptor.call(thisArg, value);
      return value;
    }

    /**
     * This method is like `_.tap` except that it returns the result of `interceptor`.
     *
     * @static
     * @memberOf _
     * @category Chain
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @param {*} [thisArg] The `this` binding of `interceptor`.
     * @returns {*} Returns the result of `interceptor`.
     * @example
     *
     * _('  abc  ')
     *  .chain()
     *  .trim()
     *  .thru(function(value) {
     *    return [value];
     *  })
     *  .value();
     * // => ['abc']
     */
    function thru(value, interceptor, thisArg) {
      return interceptor.call(thisArg, value);
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(users).first();
     * // => { 'user': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(users).chain()
     *   .first()
     *   .pick('user')
     *   .value();
     * // => { 'user': 'barney' }
     */
    function wrapperChain() {
      return chain(this);
    }

    /**
     * Executes the chained sequence and returns the wrapped result.
     *
     * @name commit
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2];
     * var wrapper = _(array).push(3);
     *
     * console.log(array);
     * // => [1, 2]
     *
     * wrapper = wrapper.commit();
     * console.log(array);
     * // => [1, 2, 3]
     *
     * wrapper.last();
     * // => 3
     *
     * console.log(array);
     * // => [1, 2, 3]
     */
    function wrapperCommit() {
      return new LodashWrapper(this.value(), this.__chain__);
    }

    /**
     * Creates a clone of the chained sequence planting `value` as the wrapped value.
     *
     * @name plant
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2];
     * var wrapper = _(array).map(function(value) {
     *   return Math.pow(value, 2);
     * });
     *
     * var other = [3, 4];
     * var otherWrapper = wrapper.plant(other);
     *
     * otherWrapper.value();
     * // => [9, 16]
     *
     * wrapper.value();
     * // => [1, 4]
     */
    function wrapperPlant(value) {
      var result,
          parent = this;

      while (parent instanceof baseLodash) {
        var clone = wrapperClone(parent);
        if (result) {
          previous.__wrapped__ = clone;
        } else {
          result = clone;
        }
        var previous = clone;
        parent = parent.__wrapped__;
      }
      previous.__wrapped__ = value;
      return result;
    }

    /**
     * Reverses the wrapped array so the first element becomes the last, the
     * second element becomes the second to last, and so on.
     *
     * **Note:** This method mutates the wrapped array.
     *
     * @name reverse
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new reversed `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _(array).reverse().value()
     * // => [3, 2, 1]
     *
     * console.log(array);
     * // => [3, 2, 1]
     */
    function wrapperReverse() {
      var value = this.__wrapped__;
      if (value instanceof LazyWrapper) {
        if (this.__actions__.length) {
          value = new LazyWrapper(this);
        }
        return new LodashWrapper(value.reverse(), this.__chain__);
      }
      return this.thru(function(value) {
        return value.reverse();
      });
    }

    /**
     * Produces the result of coercing the unwrapped value to a string.
     *
     * @name toString
     * @memberOf _
     * @category Chain
     * @returns {string} Returns the coerced string value.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return (this.value() + '');
    }

    /**
     * Executes the chained sequence to extract the unwrapped value.
     *
     * @name value
     * @memberOf _
     * @alias run, toJSON, valueOf
     * @category Chain
     * @returns {*} Returns the resolved unwrapped value.
     * @example
     *
     * _([1, 2, 3]).value();
     * // => [1, 2, 3]
     */
    function wrapperValue() {
      return baseWrapperValue(this.__wrapped__, this.__actions__);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of elements corresponding to the given keys, or indexes,
     * of `collection`. Keys may be specified as individual arguments or as arrays
     * of keys.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [props] The property names
     *  or indexes of elements to pick, specified individually or in arrays.
     * @returns {Array} Returns the new array of picked elements.
     * @example
     *
     * _.at(['a', 'b', 'c'], [0, 2]);
     * // => ['a', 'c']
     *
     * _.at(['barney', 'fred', 'pebbles'], 0, 2);
     * // => ['barney', 'pebbles']
     */
    var at = restParam(function(collection, props) {
      var length = collection ? getLength(collection) : 0;
      if (isLength(length)) {
        collection = toIterable(collection);
      }
      return baseAt(collection, baseFlatten(props));
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through `iteratee`. The corresponding value
     * of each key is the number of times the key was returned by `iteratee`.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(n) {
     *   return Math.floor(n);
     * });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(n) {
     *   return this.floor(n);
     * }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      hasOwnProperty.call(result, key) ? ++result[key] : (result[key] = 1);
    });

    /**
     * Checks if `predicate` returns truthy for **all** elements of `collection`.
     * The predicate is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes'], Boolean);
     * // => false
     *
     * var users = [
     *   { 'user': 'barney', 'active': false },
     *   { 'user': 'fred',   'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.every(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.every(users, 'active', false);
     * // => true
     *
     * // using the `_.property` callback shorthand
     * _.every(users, 'active');
     * // => false
     */
    function every(collection, predicate, thisArg) {
      var func = isArray(collection) ? arrayEvery : baseEvery;
      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
        predicate = null;
      }
      if (typeof predicate != 'function' || thisArg !== undefined) {
        predicate = getCallback(predicate, thisArg, 3);
      }
      return func(collection, predicate);
    }

    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
     * invoked with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the new filtered array.
     * @example
     *
     * _.filter([4, 5, 6], function(n) {
     *   return n % 2 == 0;
     * });
     * // => [4, 6]
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
     * // => ['barney']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.filter(users, 'active', false), 'user');
     * // => ['fred']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.filter(users, 'active'), 'user');
     * // => ['barney']
     */
    function filter(collection, predicate, thisArg) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      predicate = getCallback(predicate, thisArg, 3);
      return func(collection, predicate);
    }

    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
     * invoked with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.result(_.find(users, function(chr) {
     *   return chr.age < 40;
     * }), 'user');
     * // => 'barney'
     *
     * // using the `_.matches` callback shorthand
     * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
     * // => 'pebbles'
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.result(_.find(users, 'active', false), 'user');
     * // => 'fred'
     *
     * // using the `_.property` callback shorthand
     * _.result(_.find(users, 'active'), 'user');
     * // => 'barney'
     */
    var find = createFind(baseEach);

    /**
     * This method is like `_.find` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(n) {
     *   return n % 2 == 1;
     * });
     * // => 3
     */
    var findLast = createFind(baseEachRight, true);

    /**
     * Performs a deep comparison between each element in `collection` and the
     * source object, returning the first element that has equivalent property
     * values.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. For comparing a single
     * own or inherited property value see `_.matchesProperty`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Object} source The object of property values to match.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.result(_.findWhere(users, { 'age': 36, 'active': true }), 'user');
     * // => 'barney'
     *
     * _.result(_.findWhere(users, { 'age': 40, 'active': false }), 'user');
     * // => 'fred'
     */
    function findWhere(collection, source) {
      return find(collection, baseMatches(source));
    }

    /**
     * Iterates over elements of `collection` invoking `iteratee` for each element.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection). Iteratee functions may exit iteration early
     * by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length" property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2]).forEach(function(n) {
     *   console.log(n);
     * }).value();
     * // => logs each value from left to right and returns the array
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
     *   console.log(n, key);
     * });
     * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
     */
    var forEach = createForEach(arrayEach, baseEach);

    /**
     * This method is like `_.forEach` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2]).forEachRight(function(n) {
     *   console.log(n);
     * }).value();
     * // => logs each value from right to left and returns the array
     */
    var forEachRight = createForEach(arrayEachRight, baseEachRight);

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through `iteratee`. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(n) {
     *   return Math.floor(n);
     * });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(n) {
     *   return this.floor(n);
     * }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using the `_.property` callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        result[key].push(value);
      } else {
        result[key] = [value];
      }
    });

    /**
     * Checks if `value` is in `collection` using `SameValueZero` for equality
     * comparisons. If `fromIndex` is negative, it is used as the offset from
     * the end of `collection`.
     *
     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
     * comparisons are like strict equality comparisons, e.g. `===`, except that
     * `NaN` matches `NaN`.
     *
     * @static
     * @memberOf _
     * @alias contains, include
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {*} target The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
     * @returns {boolean} Returns `true` if a matching element is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.includes('pebbles', 'eb');
     * // => true
     */
    function includes(collection, target, fromIndex, guard) {
      var length = collection ? getLength(collection) : 0;
      if (!isLength(length)) {
        collection = values(collection);
        length = collection.length;
      }
      if (!length) {
        return false;
      }
      if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
        fromIndex = 0;
      } else {
        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
      }
      return (typeof collection == 'string' || !isArray(collection) && isString(collection))
        ? (fromIndex < length && collection.indexOf(target, fromIndex) > -1)
        : (getIndexOf(collection, target, fromIndex) > -1);
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through `iteratee`. The corresponding value
     * of each key is the last element responsible for generating the key. The
     * iteratee function is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keyData = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keyData, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keyData, function(object) {
     *   return String.fromCharCode(object.code);
     * });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keyData, function(object) {
     *   return this.fromCharCode(object.code);
     * }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method at `path` on each element in `collection`, returning
     * an array of the results of each invoked method. Any additional arguments
     * are provided to each invoked method. If `methodName` is a function it is
     * invoked for, and `this` bound to, each element in `collection`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|string} path The path of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    var invoke = restParam(function(collection, path, args) {
      var index = -1,
          isFunc = typeof path == 'function',
          isProp = isKey(path),
          length = getLength(collection),
          result = isLength(length) ? Array(length) : [];

      baseEach(collection, function(value) {
        var func = isFunc ? path : (isProp && value != null && value[path]);
        result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
      });
      return result;
    });

    /**
     * Creates an array of values by running each element in `collection` through
     * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * Many lodash methods are guarded to work as interatees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`, `drop`,
     * `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`, `parseInt`,
     * `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`, `trimLeft`,
     * `trimRight`, `trunc`, `random`, `range`, `sample`, `some`, `uniq`, and `words`
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function timesThree(n) {
     *   return n * 3;
     * }
     *
     * _.map([1, 2], timesThree);
     * // => [3, 6]
     *
     * _.map({ 'a': 1, 'b': 2 }, timesThree);
     * // => [3, 6] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // using the `_.property` callback shorthand
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee, thisArg) {
      var func = isArray(collection) ? arrayMap : baseMap;
      iteratee = getCallback(iteratee, thisArg, 3);
      return func(collection, iteratee);
    }

    /**
     * Creates an array of elements split into two groups, the first of which
     * contains elements `predicate` returns truthy for, while the second of which
     * contains elements `predicate` returns falsey for. The predicate is bound
     * to `thisArg` and invoked with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the array of grouped elements.
     * @example
     *
     * _.partition([1, 2, 3], function(n) {
     *   return n % 2;
     * });
     * // => [[1, 3], [2]]
     *
     * _.partition([1.2, 2.3, 3.4], function(n) {
     *   return this.floor(n) % 2;
     * }, Math);
     * // => [[1.2, 3.4], [2.3]]
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': false },
     *   { 'user': 'fred',    'age': 40, 'active': true },
     *   { 'user': 'pebbles', 'age': 1,  'active': false }
     * ];
     *
     * var mapper = function(array) {
     *   return _.pluck(array, 'user');
     * };
     *
     * // using the `_.matches` callback shorthand
     * _.map(_.partition(users, { 'age': 1, 'active': false }), mapper);
     * // => [['pebbles'], ['barney', 'fred']]
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.map(_.partition(users, 'active', false), mapper);
     * // => [['barney', 'pebbles'], ['fred']]
     *
     * // using the `_.property` callback shorthand
     * _.map(_.partition(users, 'active'), mapper);
     * // => [['fred'], ['barney', 'pebbles']]
     */
    var partition = createAggregator(function(result, value, key) {
      result[key ? 0 : 1].push(value);
    }, function() { return [[], []]; });

    /**
     * Gets the property value of `path` from all elements in `collection`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|string} path The path of the property to pluck.
     * @returns {Array} Returns the property values.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(users, 'user');
     * // => ['barney', 'fred']
     *
     * var userIndex = _.indexBy(users, 'user');
     * _.pluck(userIndex, 'age');
     * // => [36, 40] (iteration order is not guaranteed)
     */
    function pluck(collection, path) {
      return map(collection, property(path));
    }

    /**
     * Reduces `collection` to a value which is the accumulated result of running
     * each element in `collection` through `iteratee`, where each successive
     * invocation is supplied the return value of the previous. If `accumulator`
     * is not provided the first element of `collection` is used as the initial
     * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
     * (accumulator, value, index|key, collection).
     *
     * Many lodash methods are guarded to work as interatees for methods like
     * `_.reduce`, `_.reduceRight`, and `_.transform`.
     *
     * The guarded methods are:
     * `assign`, `defaults`, `includes`, `merge`, `sortByAll`, and `sortByOrder`
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.reduce([1, 2], function(total, n) {
     *   return total + n;
     * });
     * // => 3
     *
     * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
     *   result[key] = n * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
     */
    var reduce = createReduce(arrayReduce, baseEach);

    /**
     * This method is like `_.reduce` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var array = [[0, 1], [2, 3], [4, 5]];
     *
     * _.reduceRight(array, function(flattened, other) {
     *   return flattened.concat(other);
     * }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    var reduceRight =  createReduce(arrayReduceRight, baseEachRight);

    /**
     * The opposite of `_.filter`; this method returns the elements of `collection`
     * that `predicate` does **not** return truthy for.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the new filtered array.
     * @example
     *
     * _.reject([1, 2, 3, 4], function(n) {
     *   return n % 2 == 0;
     * });
     * // => [1, 3]
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': true }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');
     * // => ['barney']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.reject(users, 'active', false), 'user');
     * // => ['fred']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.reject(users, 'active'), 'user');
     * // => ['barney']
     */
    function reject(collection, predicate, thisArg) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      predicate = getCallback(predicate, thisArg, 3);
      return func(collection, function(value, index, collection) {
        return !predicate(value, index, collection);
      });
    }

    /**
     * Gets a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {*} Returns the random sample(s).
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (guard ? isIterateeCall(collection, n, guard) : n == null) {
        collection = toIterable(collection);
        var length = collection.length;
        return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(n < 0 ? 0 : (+n || 0), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the
     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     * @example
     *
     * _.shuffle([1, 2, 3, 4]);
     * // => [4, 1, 3, 2]
     */
    function shuffle(collection) {
      collection = toIterable(collection);

      var index = -1,
          length = collection.length,
          result = Array(length);

      while (++index < length) {
        var rand = baseRandom(0, index);
        if (index != rand) {
          result[index] = result[rand];
        }
        result[rand] = collection[index];
      }
      return result;
    }

    /**
     * Gets the size of `collection` by returning its length for array-like
     * values or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns the size of `collection`.
     * @example
     *
     * _.size([1, 2, 3]);
     * // => 3
     *
     * _.size({ 'a': 1, 'b': 2 });
     * // => 2
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? getLength(collection) : 0;
      return isLength(length) ? length : keys(collection).length;
    }

    /**
     * Checks if `predicate` returns truthy for **any** element of `collection`.
     * The function returns as soon as it finds a passing value and does not iterate
     * over the entire collection. The predicate is bound to `thisArg` and invoked
     * with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var users = [
     *   { 'user': 'barney', 'active': true },
     *   { 'user': 'fred',   'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.some(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.some(users, 'active', false);
     * // => true
     *
     * // using the `_.property` callback shorthand
     * _.some(users, 'active');
     * // => true
     */
    function some(collection, predicate, thisArg) {
      var func = isArray(collection) ? arraySome : baseSome;
      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
        predicate = null;
      }
      if (typeof predicate != 'function' || thisArg !== undefined) {
        predicate = getCallback(predicate, thisArg, 3);
      }
      return func(collection, predicate);
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through `iteratee`. This method performs
     * a stable sort, that is, it preserves the original sort order of equal elements.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * _.sortBy([1, 2, 3], function(n) {
     *   return Math.sin(n);
     * });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(n) {
     *   return this.sin(n);
     * }, Math);
     * // => [3, 1, 2]
     *
     * var users = [
     *   { 'user': 'fred' },
     *   { 'user': 'pebbles' },
     *   { 'user': 'barney' }
     * ];
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.sortBy(users, 'user'), 'user');
     * // => ['barney', 'fred', 'pebbles']
     */
    function sortBy(collection, iteratee, thisArg) {
      if (collection == null) {
        return [];
      }
      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
        iteratee = null;
      }
      var index = -1;
      iteratee = getCallback(iteratee, thisArg, 3);

      var result = baseMap(collection, function(value, key, collection) {
        return { 'criteria': iteratee(value, key, collection), 'index': ++index, 'value': value };
      });
      return baseSortBy(result, compareAscending);
    }

    /**
     * This method is like `_.sortBy` except that it can sort by multiple iteratees
     * or property names.
     *
     * If a property name is provided for an iteratee the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If an object is provided for an iteratee the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(Function|Function[]|Object|Object[]|string|string[])} iteratees
     *  The iteratees to sort by, specified as individual values or arrays of values.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 42 },
     *   { 'user': 'barney', 'age': 34 }
     * ];
     *
     * _.map(_.sortByAll(users, ['user', 'age']), _.values);
     * // => [['barney', 34], ['barney', 36], ['fred', 42], ['fred', 48]]
     *
     * _.map(_.sortByAll(users, 'user', function(chr) {
     *   return Math.floor(chr.age / 10);
     * }), _.values);
     * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
     */
    var sortByAll = restParam(function(collection, iteratees) {
      if (collection == null) {
        return [];
      }
      var guard = iteratees[2];
      if (guard && isIterateeCall(iteratees[0], iteratees[1], guard)) {
        iteratees.length = 1;
      }
      return baseSortByOrder(collection, baseFlatten(iteratees), []);
    });

    /**
     * This method is like `_.sortByAll` except that it allows specifying the
     * sort orders of the iteratees to sort by. A truthy value in `orders` will
     * sort the corresponding property name in ascending order while a falsey
     * value will sort it in descending order.
     *
     * If a property name is provided for an iteratee the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If an object is provided for an iteratee the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
     * @param {boolean[]} orders The sort orders of `iteratees`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 34 },
     *   { 'user': 'fred',   'age': 42 },
     *   { 'user': 'barney', 'age': 36 }
     * ];
     *
     * // sort by `user` in ascending order and by `age` in descending order
     * _.map(_.sortByOrder(users, ['user', 'age'], [true, false]), _.values);
     * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
     */
    function sortByOrder(collection, iteratees, orders, guard) {
      if (collection == null) {
        return [];
      }
      if (guard && isIterateeCall(iteratees, orders, guard)) {
        orders = null;
      }
      if (!isArray(iteratees)) {
        iteratees = iteratees == null ? [] : [iteratees];
      }
      if (!isArray(orders)) {
        orders = orders == null ? [] : [orders];
      }
      return baseSortByOrder(collection, iteratees, orders);
    }

    /**
     * Performs a deep comparison between each element in `collection` and the
     * source object, returning an array of all elements that have equivalent
     * property values.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. For comparing a single
     * own or inherited property value see `_.matchesProperty`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Object} source The object of property values to match.
     * @returns {Array} Returns the new filtered array.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false, 'pets': ['hoppy'] },
     *   { 'user': 'fred',   'age': 40, 'active': true, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.pluck(_.where(users, { 'age': 36, 'active': false }), 'user');
     * // => ['barney']
     *
     * _.pluck(_.where(users, { 'pets': ['dino'] }), 'user');
     * // => ['fred']
     */
    function where(collection, source) {
      return filter(collection, baseMatches(source));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Date
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => logs the number of milliseconds it took for the deferred function to be invoked
     */
    var now = nativeNow || function() {
      return new Date().getTime();
    };

    /*------------------------------------------------------------------------*/

    /**
     * The opposite of `_.before`; this method creates a function that invokes
     * `func` once it is called `n` or more times.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {number} n The number of calls before `func` is invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'done saving!' after the two async saves have completed
     */
    function after(n, func) {
      if (typeof func != 'function') {
        if (typeof n == 'function') {
          var temp = n;
          n = func;
          func = temp;
        } else {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
      }
      n = nativeIsFinite(n = +n) ? n : 0;
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that accepts up to `n` arguments ignoring any
     * additional arguments.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to cap arguments for.
     * @param {number} [n=func.length] The arity cap.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the new function.
     * @example
     *
     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
     * // => [6, 8, 10]
     */
    function ary(func, n, guard) {
      if (guard && isIterateeCall(func, n, guard)) {
        n = null;
      }
      n = (func && n == null) ? func.length : nativeMax(+n || 0, 0);
      return createWrapper(func, ARY_FLAG, null, null, null, null, n);
    }

    /**
     * Creates a function that invokes `func`, with the `this` binding and arguments
     * of the created function, while it is called less than `n` times. Subsequent
     * calls to the created function return the result of the last `func` invocation.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {number} n The number of calls at which `func` is no longer invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * jQuery('#add').on('click', _.before(5, addContactToList));
     * // => allows adding up to 4 contacts to the list
     */
    function before(n, func) {
      var result;
      if (typeof func != 'function') {
        if (typeof n == 'function') {
          var temp = n;
          n = func;
          func = temp;
        } else {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
      }
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = null;
        }
        return result;
      };
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of `thisArg`
     * and prepends any additional `_.bind` arguments to those provided to the
     * bound function.
     *
     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for partially applied arguments.
     *
     * **Note:** Unlike native `Function#bind` this method does not set the "length"
     * property of bound functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to bind.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var greet = function(greeting, punctuation) {
     *   return greeting + ' ' + this.user + punctuation;
     * };
     *
     * var object = { 'user': 'fred' };
     *
     * var bound = _.bind(greet, object, 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * // using placeholders
     * var bound = _.bind(greet, object, _, '!');
     * bound('hi');
     * // => 'hi fred!'
     */
    var bind = restParam(function(func, thisArg, partials) {
      var bitmask = BIND_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, bind.placeholder);
        bitmask |= PARTIAL_FLAG;
      }
      return createWrapper(func, bitmask, thisArg, partials, holders);
    });

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all enumerable function
     * properties, own and inherited, of `object` are bound.
     *
     * **Note:** This method does not set the "length" property of bound functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...(string|string[])} [methodNames] The object method names to bind,
     *  specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() {
     *     console.log('clicked ' + this.label);
     *   }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs' when the element is clicked
     */
    var bindAll = restParam(function(object, methodNames) {
      methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);

      var index = -1,
          length = methodNames.length;

      while (++index < length) {
        var key = methodNames[index];
        object[key] = createWrapper(object[key], BIND_FLAG, object);
      }
      return object;
    });

    /**
     * Creates a function that invokes the method at `object[key]` and prepends
     * any additional `_.bindKey` arguments to those provided to the bound function.
     *
     * This method differs from `_.bind` by allowing bound functions to reference
     * methods that may be redefined or don't yet exist.
     * See [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
     * for more details.
     *
     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'user': 'fred',
     *   'greet': function(greeting, punctuation) {
     *     return greeting + ' ' + this.user + punctuation;
     *   }
     * };
     *
     * var bound = _.bindKey(object, 'greet', 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * object.greet = function(greeting, punctuation) {
     *   return greeting + 'ya ' + this.user + punctuation;
     * };
     *
     * bound('!');
     * // => 'hiya fred!'
     *
     * // using placeholders
     * var bound = _.bindKey(object, 'greet', _, '!');
     * bound('hi');
     * // => 'hiya fred!'
     */
    var bindKey = restParam(function(object, key, partials) {
      var bitmask = BIND_FLAG | BIND_KEY_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, bindKey.placeholder);
        bitmask |= PARTIAL_FLAG;
      }
      return createWrapper(key, bitmask, object, partials, holders);
    });

    /**
     * Creates a function that accepts one or more arguments of `func` that when
     * called either invokes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` may be specified
     * if `func.length` is not sufficient.
     *
     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for provided arguments.
     *
     * **Note:** This method does not set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curry(abc);
     *
     * curried(1)(2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // using placeholders
     * curried(1)(_, 3)(2);
     * // => [1, 2, 3]
     */
    var curry = createCurry(CURRY_FLAG);

    /**
     * This method is like `_.curry` except that arguments are applied to `func`
     * in the manner of `_.partialRight` instead of `_.partial`.
     *
     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for provided arguments.
     *
     * **Note:** This method does not set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curryRight(abc);
     *
     * curried(3)(2)(1);
     * // => [1, 2, 3]
     *
     * curried(2, 3)(1);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // using placeholders
     * curried(3)(1, _)(2);
     * // => [1, 2, 3]
     */
    var curryRight = createCurry(CURRY_RIGHT_FLAG);

    /**
     * Creates a function that delays invoking `func` until after `wait` milliseconds
     * have elapsed since the last time it was invoked. The created function comes
     * with a `cancel` method to cancel delayed invocations. Provide an options
     * object to indicate that `func` should be invoked on the leading and/or
     * trailing edge of the `wait` timeout. Subsequent calls to the debounced
     * function return the result of the last `func` invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify invoking on the leading
     *  edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be
     *  delayed before it is invoked.
     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
     *  edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // ensure `batchLog` is invoked once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }));
     *
     * // cancel a debounced call
     * var todoChanges = _.debounce(batchLog, 1000);
     * Object.observe(models.todo, todoChanges);
     *
     * Object.observe(models, function(changes) {
     *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
     *     todoChanges.cancel();
     *   }
     * }, ['delete']);
     *
     * // ...at some point `models.todo` is changed
     * models.todo.completed = true;
     *
     * // ...before 1 second has passed `models.todo` is deleted
     * // which cancels the debounced `todoChanges` call
     * delete models.todo;
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = wait < 0 ? 0 : (+wait || 0);
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }

      function cancel() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
      }

      function delayed() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0 || remaining > wait) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      }

      function maxDelayed() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      }

      function debounced() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0 || remaining > maxWait;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      }
      debounced.cancel = cancel;
      return debounced;
    }

    /**
     * Defers invoking the `func` until the current call stack has cleared. Any
     * additional arguments are provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to defer.
     * @param {...*} [args] The arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) {
     *   console.log(text);
     * }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    var defer = restParam(function(func, args) {
      return baseDelay(func, 1, args);
    });

    /**
     * Invokes `func` after `wait` milliseconds. Any additional arguments are
     * provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {...*} [args] The arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) {
     *   console.log(text);
     * }, 1000, 'later');
     * // => logs 'later' after one second
     */
    var delay = restParam(function(func, wait, args) {
      return baseDelay(func, wait, args);
    });

    /**
     * Creates a function that returns the result of invoking the provided
     * functions with the `this` binding of the created function, where each
     * successive invocation is supplied the return value of the previous.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {...Function} [funcs] Functions to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flow(_.add, square);
     * addSquare(1, 2);
     * // => 9
     */
    var flow = createFlow();

    /**
     * This method is like `_.flow` except that it creates a function that
     * invokes the provided functions from right to left.
     *
     * @static
     * @memberOf _
     * @alias backflow, compose
     * @category Function
     * @param {...Function} [funcs] Functions to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flowRight(square, _.add);
     * addSquare(1, 2);
     * // => 9
     */
    var flowRight = createFlow(true);

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is coerced to a string and used as the
     * cache key. The `func` is invoked with the `this` binding of the memoized
     * function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the [`Map`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-properties-of-the-map-prototype-object)
     * method interface of `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var upperCase = _.memoize(function(string) {
     *   return string.toUpperCase();
     * });
     *
     * upperCase('fred');
     * // => 'FRED'
     *
     * // modifying the result cache
     * upperCase.cache.set('fred', 'BARNEY');
     * upperCase('fred');
     * // => 'BARNEY'
     *
     * // replacing `_.memoize.Cache`
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'barney' };
     * var identity = _.memoize(_.identity);
     *
     * identity(object);
     * // => { 'user': 'fred' }
     * identity(other);
     * // => { 'user': 'fred' }
     *
     * _.memoize.Cache = WeakMap;
     * var identity = _.memoize(_.identity);
     *
     * identity(object);
     * // => { 'user': 'fred' }
     * identity(other);
     * // => { 'user': 'barney' }
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            cache = memoized.cache,
            key = resolver ? resolver.apply(this, args) : args[0];

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        cache.set(key, result);
        return result;
      };
      memoized.cache = new memoize.Cache;
      return memoized;
    }

    /**
     * Creates a function that negates the result of the predicate `func`. The
     * `func` predicate is invoked with the `this` binding and arguments of the
     * created function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} predicate The predicate to negate.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function isEven(n) {
     *   return n % 2 == 0;
     * }
     *
     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
     * // => [1, 3, 5]
     */
    function negate(predicate) {
      if (typeof predicate != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function() {
        return !predicate.apply(this, arguments);
      };
    }

    /**
     * Creates a function that is restricted to invoking `func` once. Repeat calls
     * to the function return the value of the first call. The `func` is invoked
     * with the `this` binding and arguments of the created function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` invokes `createApplication` once
     */
    function once(func) {
      return before(2, func);
    }

    /**
     * Creates a function that invokes `func` with `partial` arguments prepended
     * to those provided to the new function. This method is like `_.bind` except
     * it does **not** alter the `this` binding.
     *
     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method does not set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) {
     *   return greeting + ' ' + name;
     * };
     *
     * var sayHelloTo = _.partial(greet, 'hello');
     * sayHelloTo('fred');
     * // => 'hello fred'
     *
     * // using placeholders
     * var greetFred = _.partial(greet, _, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     */
    var partial = createPartial(PARTIAL_FLAG);

    /**
     * This method is like `_.partial` except that partially applied arguments
     * are appended to those provided to the new function.
     *
     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method does not set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) {
     *   return greeting + ' ' + name;
     * };
     *
     * var greetFred = _.partialRight(greet, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     *
     * // using placeholders
     * var sayHelloTo = _.partialRight(greet, 'hello', _);
     * sayHelloTo('fred');
     * // => 'hello fred'
     */
    var partialRight = createPartial(PARTIAL_RIGHT_FLAG);

    /**
     * Creates a function that invokes `func` with arguments arranged according
     * to the specified indexes where the argument value at the first index is
     * provided as the first argument, the argument value at the second index is
     * provided as the second argument, and so on.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to rearrange arguments for.
     * @param {...(number|number[])} indexes The arranged argument indexes,
     *  specified as individual indexes or arrays of indexes.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var rearged = _.rearg(function(a, b, c) {
     *   return [a, b, c];
     * }, 2, 0, 1);
     *
     * rearged('b', 'c', 'a')
     * // => ['a', 'b', 'c']
     *
     * var map = _.rearg(_.map, [1, 0]);
     * map(function(n) {
     *   return n * 3;
     * }, [1, 2, 3]);
     * // => [3, 6, 9]
     */
    var rearg = restParam(function(func, indexes) {
      return createWrapper(func, REARG_FLAG, null, null, null, baseFlatten(indexes));
    });

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as an array.
     *
     * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.restParam(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
     *
     * say('hello', 'fred', 'barney', 'pebbles');
     * // => 'hello fred, barney, & pebbles'
     */
    function restParam(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            rest = Array(length);

        while (++index < length) {
          rest[index] = args[start + index];
        }
        switch (start) {
          case 0: return func.call(this, rest);
          case 1: return func.call(this, args[0], rest);
          case 2: return func.call(this, args[0], args[1], rest);
        }
        var otherArgs = Array(start + 1);
        index = -1;
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = rest;
        return func.apply(this, otherArgs);
      };
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of the created
     * function and an array of arguments much like [`Function#apply`](https://es5.github.io/#x15.3.4.3).
     *
     * **Note:** This method is based on the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to spread arguments over.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.spread(function(who, what) {
     *   return who + ' says ' + what;
     * });
     *
     * say(['fred', 'hello']);
     * // => 'fred says hello'
     *
     * // with a Promise
     * var numbers = Promise.all([
     *   Promise.resolve(40),
     *   Promise.resolve(36)
     * ]);
     *
     * numbers.then(_.spread(function(x, y) {
     *   return x + y;
     * }));
     * // => a Promise of 76
     */
    function spread(func) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function(array) {
        return func.apply(this, array);
      };
    }

    /**
     * Creates a function that only invokes `func` at most once per every `wait`
     * milliseconds. The created function comes with a `cancel` method to cancel
     * delayed invocations. Provide an options object to indicate that `func`
     * should be invoked on the leading and/or trailing edge of the `wait` timeout.
     * Subsequent calls to the throttled function return the result of the last
     * `func` call.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
     * for details over the differences between `_.throttle` and `_.debounce`.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to throttle.
     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify invoking on the leading
     *  edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
     *  edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
     *
     * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     *
     * // cancel a trailing throttled call
     * jQuery(window).on('popstate', throttled.cancel);
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = +wait;
      debounceOptions.trailing = trailing;
      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Any additional arguments provided to the function are
     * appended to those provided to the wrapper function. The wrapper is invoked
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('fred, barney, & pebbles');
     * // => '<p>fred, barney, &amp; pebbles</p>'
     */
    function wrap(value, wrapper) {
      wrapper = wrapper == null ? identity : wrapper;
      return createWrapper(wrapper, PARTIAL_FLAG, null, [value], []);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
     * otherwise they are assigned by reference. If `customizer` is provided it is
     * invoked to produce the cloned values. If `customizer` returns `undefined`
     * cloning is handled by the method instead. The `customizer` is bound to
     * `thisArg` and invoked with two argument; (value [, index|key, object]).
     *
     * **Note:** This method is loosely based on the
     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
     * The enumerable properties of `arguments` objects and objects created by
     * constructors other than `Object` are cloned to plain `Object` objects. An
     * empty object is returned for uncloneable values such as functions, DOM nodes,
     * Maps, Sets, and WeakMaps.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {Function} [customizer] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * var shallow = _.clone(users);
     * shallow[0] === users[0];
     * // => true
     *
     * var deep = _.clone(users, true);
     * deep[0] === users[0];
     * // => false
     *
     * // using a customizer callback
     * var el = _.clone(document.body, function(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(false);
     *   }
     * });
     *
     * el === document.body
     * // => false
     * el.nodeName
     * // => BODY
     * el.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, customizer, thisArg) {
      if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
        isDeep = false;
      }
      else if (typeof isDeep == 'function') {
        thisArg = customizer;
        customizer = isDeep;
        isDeep = false;
      }
      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
      return baseClone(value, isDeep, customizer);
    }

    /**
     * Creates a deep clone of `value`. If `customizer` is provided it is invoked
     * to produce the cloned values. If `customizer` returns `undefined` cloning
     * is handled by the method instead. The `customizer` is bound to `thisArg`
     * and invoked with two argument; (value [, index|key, object]).
     *
     * **Note:** This method is loosely based on the
     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
     * The enumerable properties of `arguments` objects and objects created by
     * constructors other than `Object` are cloned to plain `Object` objects. An
     * empty object is returned for uncloneable values such as functions, DOM nodes,
     * Maps, Sets, and WeakMaps.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to deep clone.
     * @param {Function} [customizer] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * var deep = _.cloneDeep(users);
     * deep[0] === users[0];
     * // => false
     *
     * // using a customizer callback
     * var el = _.cloneDeep(document.body, function(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(true);
     *   }
     * });
     *
     * el === document.body
     * // => false
     * el.nodeName
     * // => BODY
     * el.childNodes.length;
     * // => 20
     */
    function cloneDeep(value, customizer, thisArg) {
      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
      return baseClone(value, true, customizer);
    }

    /**
     * Checks if `value` is classified as an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      var length = isObjectLike(value) ? value.length : undefined;
      return isLength(length) && objToString.call(value) == argsTag;
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(function() { return arguments; }());
     * // => false
     */
    var isArray = nativeIsArray || function(value) {
      return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
    };

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isBoolean(false);
     * // => true
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false || (isObjectLike(value) && objToString.call(value) == boolTag);
    }

    /**
     * Checks if `value` is classified as a `Date` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     *
     * _.isDate('Mon April 23 2012');
     * // => false
     */
    function isDate(value) {
      return isObjectLike(value) && objToString.call(value) == dateTag;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     *
     * _.isElement('<body>');
     * // => false
     */
    function isElement(value) {
      return !!value && value.nodeType === 1 && isObjectLike(value) &&
        (objToString.call(value).indexOf('Element') > -1);
    }
    // Fallback for environments without DOM support.
    if (!support.dom) {
      isElement = function(value) {
        return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
      };
    }

    /**
     * Checks if `value` is empty. A value is considered empty unless it is an
     * `arguments` object, array, string, or jQuery-like collection with a length
     * greater than `0` or an object with own enumerable properties.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty(null);
     * // => true
     *
     * _.isEmpty(true);
     * // => true
     *
     * _.isEmpty(1);
     * // => true
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({ 'a': 1 });
     * // => false
     */
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      var length = getLength(value);
      if (isLength(length) && (isArray(value) || isString(value) || isArguments(value) ||
          (isObjectLike(value) && isFunction(value.splice)))) {
        return !length;
      }
      return !keys(value).length;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent. If `customizer` is provided it is invoked to compare values.
     * If `customizer` returns `undefined` comparisons are handled by the method
     * instead. The `customizer` is bound to `thisArg` and invoked with three
     * arguments: (value, other [, index|key]).
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. Functions and DOM nodes
     * are **not** supported. Provide a customizer function to extend support
     * for comparing other values.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize value comparisons.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'fred' };
     *
     * object == other;
     * // => false
     *
     * _.isEqual(object, other);
     * // => true
     *
     * // using a customizer callback
     * var array = ['hello', 'goodbye'];
     * var other = ['hi', 'goodbye'];
     *
     * _.isEqual(array, other, function(value, other) {
     *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
     *     return true;
     *   }
     * });
     * // => true
     */
    function isEqual(value, other, customizer, thisArg) {
      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 3);
      if (!customizer && isStrictComparable(value) && isStrictComparable(other)) {
        return value === other;
      }
      var result = customizer ? customizer(value, other) : undefined;
      return result === undefined ? baseIsEqual(value, other, customizer) : !!result;
    }

    /**
     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
     * `SyntaxError`, `TypeError`, or `URIError` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
     * @example
     *
     * _.isError(new Error);
     * // => true
     *
     * _.isError(Error);
     * // => false
     */
    function isError(value) {
      return isObjectLike(value) && typeof value.message == 'string' && objToString.call(value) == errorTag;
    }

    /**
     * Checks if `value` is a finite primitive number.
     *
     * **Note:** This method is based on [`Number.isFinite`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite).
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
     * @example
     *
     * _.isFinite(10);
     * // => true
     *
     * _.isFinite('10');
     * // => false
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite(Object(10));
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    var isFinite = nativeNumIsFinite || function(value) {
      return typeof value == 'number' && nativeIsFinite(value);
    };

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in older versions of Chrome and Safari which return 'function' for regexes
      // and Safari 8 equivalents which return 'object' for typed array constructors.
      return objToString.call(value) == funcTag;
    };

    /**
     * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // Avoid a V8 JIT bug in Chrome 19-20.
      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
      var type = typeof value;
      return type == 'function' || (!!value && type == 'object');
    }

    /**
     * Performs a deep comparison between `object` and `source` to determine if
     * `object` contains equivalent property values. If `customizer` is provided
     * it is invoked to compare values. If `customizer` returns `undefined`
     * comparisons are handled by the method instead. The `customizer` is bound
     * to `thisArg` and invoked with three arguments: (value, other, index|key).
     *
     * **Note:** This method supports comparing properties of arrays, booleans,
     * `Date` objects, numbers, `Object` objects, regexes, and strings. Functions
     * and DOM nodes are **not** supported. Provide a customizer function to extend
     * support for comparing other values.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Function} [customizer] The function to customize value comparisons.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     * @example
     *
     * var object = { 'user': 'fred', 'age': 40 };
     *
     * _.isMatch(object, { 'age': 40 });
     * // => true
     *
     * _.isMatch(object, { 'age': 36 });
     * // => false
     *
     * // using a customizer callback
     * var object = { 'greeting': 'hello' };
     * var source = { 'greeting': 'hi' };
     *
     * _.isMatch(object, source, function(value, other) {
     *   return _.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/) || undefined;
     * });
     * // => true
     */
    function isMatch(object, source, customizer, thisArg) {
      var props = keys(source),
          length = props.length;

      if (!length) {
        return true;
      }
      if (object == null) {
        return false;
      }
      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 3);
      object = toObject(object);
      if (!customizer && length == 1) {
        var key = props[0],
            value = source[key];

        if (isStrictComparable(value)) {
          return value === object[key] && (value !== undefined || (key in object));
        }
      }
      var values = Array(length),
          strictCompareFlags = Array(length);

      while (length--) {
        value = values[length] = source[props[length]];
        strictCompareFlags[length] = isStrictComparable(value);
      }
      return baseIsMatch(object, props, values, strictCompareFlags, customizer);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
     * which returns `true` for `undefined` and other non-numeric values.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // An `NaN` primitive is the only value that is not equal to itself.
      // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
     * @example
     *
     * _.isNative(Array.prototype.push);
     * // => true
     *
     * _.isNative(_);
     * // => false
     */
    function isNative(value) {
      if (value == null) {
        return false;
      }
      if (objToString.call(value) == funcTag) {
        return reIsNative.test(fnToString.call(value));
      }
      return isObjectLike(value) && reIsHostCtor.test(value);
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(void 0);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
     * as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isNumber(8.4);
     * // => true
     *
     * _.isNumber(NaN);
     * // => true
     *
     * _.isNumber('8.4');
     * // => false
     */
    function isNumber(value) {
      return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
    }

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * **Note:** This method assumes objects created by the `Object` constructor
     * have no inherited enumerable properties.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && objToString.call(value) == objectTag)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is classified as a `RegExp` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isRegExp(/abc/);
     * // => true
     *
     * _.isRegExp('/abc/');
     * // => false
     */
    function isRegExp(value) {
      return (isObjectLike(value) && objToString.call(value) == regexpTag) || false;
    }

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    function isTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     *
     * _.isUndefined(null);
     * // => false
     */
    function isUndefined(value) {
      return value === undefined;
    }

    /**
     * Converts `value` to an array.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Array} Returns the converted array.
     * @example
     *
     * (function() {
     *   return _.toArray(arguments).slice(1);
     * }(1, 2, 3));
     * // => [2, 3]
     */
    function toArray(value) {
      var length = value ? getLength(value) : 0;
      if (!isLength(length)) {
        return values(value);
      }
      if (!length) {
        return [];
      }
      return arrayCopy(value);
    }

    /**
     * Converts `value` to a plain object flattening inherited enumerable
     * properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return baseCopy(value, keysIn(value));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources overwrite property assignments of previous sources.
     * If `customizer` is provided it is invoked to produce the assigned values.
     * The `customizer` is bound to `thisArg` and invoked with five arguments:
     * (objectValue, sourceValue, key, object, source).
     *
     * **Note:** This method mutates `object` and is based on
     * [`Object.assign`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign).
     *
     *
     * @static
     * @memberOf _
     * @alias extend
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
     * // => { 'user': 'fred', 'age': 40 }
     *
     * // using a customizer callback
     * var defaults = _.partialRight(_.assign, function(value, other) {
     *   return _.isUndefined(value) ? other : value;
     * });
     *
     * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
     * // => { 'user': 'barney', 'age': 36 }
     */
    var assign = createAssigner(function(object, source, customizer) {
      return customizer
        ? assignWith(object, source, customizer)
        : baseAssign(object, source);
    });

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, {
     *   'constructor': Circle
     * });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties, guard) {
      var result = baseCreate(prototype);
      if (guard && isIterateeCall(prototype, properties, guard)) {
        properties = null;
      }
      return properties ? baseAssign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional values of the same property are ignored.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
     * // => { 'user': 'barney', 'age': 36 }
     */
    var defaults = restParam(function(args) {
      var object = args[0];
      if (object == null) {
        return object;
      }
      args.push(assignDefaults);
      return assign.apply(undefined, args);
    });

    /**
     * This method is like `_.find` except that it returns the key of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findKey(users, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (iteration order is not guaranteed)
     *
     * // using the `_.matches` callback shorthand
     * _.findKey(users, { 'age': 1, 'active': true });
     * // => 'pebbles'
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findKey(users, 'active', false);
     * // => 'fred'
     *
     * // using the `_.property` callback shorthand
     * _.findKey(users, 'active');
     * // => 'barney'
     */
    var findKey = createFindKey(baseForOwn);

    /**
     * This method is like `_.findKey` except that it iterates over elements of
     * a collection in the opposite order.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findLastKey(users, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles` assuming `_.findKey` returns `barney`
     *
     * // using the `_.matches` callback shorthand
     * _.findLastKey(users, { 'age': 36, 'active': true });
     * // => 'barney'
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findLastKey(users, 'active', false);
     * // => 'fred'
     *
     * // using the `_.property` callback shorthand
     * _.findLastKey(users, 'active');
     * // => 'pebbles'
     */
    var findLastKey = createFindKey(baseForOwnRight);

    /**
     * Iterates over own and inherited enumerable properties of an object invoking
     * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked
     * with three arguments: (value, key, object). Iteratee functions may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forIn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)
     */
    var forIn = createForIn(baseFor);

    /**
     * This method is like `_.forIn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forInRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'c', 'b', and 'a' assuming `_.forIn ` logs 'a', 'b', and 'c'
     */
    var forInRight = createForIn(baseForRight);

    /**
     * Iterates over own enumerable properties of an object invoking `iteratee`
     * for each property. The `iteratee` is bound to `thisArg` and invoked with
     * three arguments: (value, key, object). Iteratee functions may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'a' and 'b' (iteration order is not guaranteed)
     */
    var forOwn = createForOwn(baseForOwn);

    /**
     * This method is like `_.forOwn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwnRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'b' and 'a' assuming `_.forOwn` logs 'a' and 'b'
     */
    var forOwnRight = createForOwn(baseForOwnRight);

    /**
     * Creates an array of function property names from all enumerable properties,
     * own and inherited, of `object`.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the new array of property names.
     * @example
     *
     * _.functions(_);
     * // => ['after', 'ary', 'assign', ...]
     */
    function functions(object) {
      return baseFunctions(object, keysIn(object));
    }

    /**
     * Gets the property value of `path` on `object`. If the resolved value is
     * `undefined` the `defaultValue` is used in its place.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, toPath(path), path + '');
      return result === undefined ? defaultValue : result;
    }

    /**
     * Checks if `path` is a direct property.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
     * @example
     *
     * var object = { 'a': { 'b': { 'c': 3 } } };
     *
     * _.has(object, 'a');
     * // => true
     *
     * _.has(object, 'a.b.c');
     * // => true
     *
     * _.has(object, ['a', 'b', 'c']);
     * // => true
     */
    function has(object, path) {
      if (object == null) {
        return false;
      }
      var result = hasOwnProperty.call(object, path);
      if (!result && !isKey(path)) {
        path = toPath(path);
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        path = last(path);
        result = object != null && hasOwnProperty.call(object, path);
      }
      return result;
    }

    /**
     * Creates an object composed of the inverted keys and values of `object`.
     * If `object` contains duplicate values, subsequent values overwrite property
     * assignments of previous values unless `multiValue` is `true`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to invert.
     * @param {boolean} [multiValue] Allow multiple values per key.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Object} Returns the new inverted object.
     * @example
     *
     * var object = { 'a': 1, 'b': 2, 'c': 1 };
     *
     * _.invert(object);
     * // => { '1': 'c', '2': 'b' }
     *
     * // with `multiValue`
     * _.invert(object, true);
     * // => { '1': ['a', 'c'], '2': ['b'] }
     */
    function invert(object, multiValue, guard) {
      if (guard && isIterateeCall(object, multiValue, guard)) {
        multiValue = null;
      }
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index],
            value = object[key];

        if (multiValue) {
          if (hasOwnProperty.call(result, value)) {
            result[value].push(key);
          } else {
            result[value] = [key];
          }
        }
        else {
          result[value] = key;
        }
      }
      return result;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
     * for more details.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (object) {
        var Ctor = object.constructor,
            length = object.length;
      }
      if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
          (typeof object != 'function' && isLength(length))) {
        return shimKeys(object);
      }
      return isObject(object) ? nativeKeys(object) : [];
    };

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      if (object == null) {
        return [];
      }
      if (!isObject(object)) {
        object = Object(object);
      }
      var length = object.length;
      length = (length && isLength(length) &&
        (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

      var Ctor = object.constructor,
          index = -1,
          isProto = typeof Ctor == 'function' && Ctor.prototype === object,
          result = Array(length),
          skipIndexes = length > 0;

      while (++index < length) {
        result[index] = (index + '');
      }
      for (var key in object) {
        if (!(skipIndexes && isIndex(key, length)) &&
            !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through `iteratee`. The
     * iteratee function is bound to `thisArg` and invoked with three arguments:
     * (value, key, object).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the new mapped object.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
     *   return n * 3;
     * });
     * // => { 'a': 3, 'b': 6 }
     *
     * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
     *
     * // using the `_.property` callback shorthand
     * _.mapValues(users, 'age');
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     */
    function mapValues(object, iteratee, thisArg) {
      var result = {};
      iteratee = getCallback(iteratee, thisArg, 3);

      baseForOwn(object, function(value, key, object) {
        result[key] = iteratee(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * overwrite property assignments of previous sources. If `customizer` is
     * provided it is invoked to produce the merged values of the destination and
     * source properties. If `customizer` returns `undefined` merging is handled
     * by the method instead. The `customizer` is bound to `thisArg` and invoked
     * with five arguments: (objectValue, sourceValue, key, object, source).
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var users = {
     *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
     * };
     *
     * var ages = {
     *   'data': [{ 'age': 36 }, { 'age': 40 }]
     * };
     *
     * _.merge(users, ages);
     * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
     *
     * // using a customizer callback
     * var object = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var other = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(object, other, function(a, b) {
     *   if (_.isArray(a)) {
     *     return a.concat(b);
     *   }
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
     */
    var merge = createAssigner(baseMerge);

    /**
     * The opposite of `_.pick`; this method creates an object composed of the
     * own and inherited enumerable properties of `object` that are not omitted.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If `predicate` is provided it is invoked for each property
     * of `object` omitting the properties `predicate` returns truthy for. The
     * predicate is bound to `thisArg` and invoked with three arguments:
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {Function|...(string|string[])} [predicate] The function invoked per
     *  iteration or property names to omit, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'user': 'fred', 'age': 40 };
     *
     * _.omit(object, 'age');
     * // => { 'user': 'fred' }
     *
     * _.omit(object, _.isNumber);
     * // => { 'user': 'fred' }
     */
    var omit = restParam(function(object, props) {
      if (object == null) {
        return {};
      }
      if (typeof props[0] != 'function') {
        var props = arrayMap(baseFlatten(props), String);
        return pickByArray(object, baseDifference(keysIn(object), props));
      }
      var predicate = bindCallback(props[0], props[1], 3);
      return pickByCallback(object, function(value, key, object) {
        return !predicate(value, key, object);
      });
    });

    /**
     * Creates a two dimensional array of the key-value pairs for `object`,
     * e.g. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates an object composed of the picked `object` properties. Property
     * names may be specified as individual arguments or as arrays of property
     * names. If `predicate` is provided it is invoked for each property of `object`
     * picking the properties `predicate` returns truthy for. The predicate is
     * bound to `thisArg` and invoked with three arguments: (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {Function|...(string|string[])} [predicate] The function invoked per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'user': 'fred', 'age': 40 };
     *
     * _.pick(object, 'user');
     * // => { 'user': 'fred' }
     *
     * _.pick(object, _.isString);
     * // => { 'user': 'fred' }
     */
    var pick = restParam(function(object, props) {
      if (object == null) {
        return {};
      }
      return typeof props[0] == 'function'
        ? pickByCallback(object, bindCallback(props[0], props[1], 3))
        : pickByArray(object, baseFlatten(props));
    });

    /**
     * This method is like `_.get` except that if the resolved value is a function
     * it is invoked with the `this` binding of its parent object and its result
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to resolve.
     * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
     *
     * _.result(object, 'a[0].b.c1');
     * // => 3
     *
     * _.result(object, 'a[0].b.c2');
     * // => 4
     *
     * _.result(object, 'a.b.c', 'default');
     * // => 'default'
     *
     * _.result(object, 'a.b.c', _.constant('default'));
     * // => 'default'
     */
    function result(object, path, defaultValue) {
      var result = object == null ? undefined : object[path];
      if (result === undefined) {
        if (object != null && !isKey(path, object)) {
          path = toPath(path);
          object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
          result = object == null ? undefined : object[last(path)];
        }
        result = result === undefined ? defaultValue : result;
      }
      return isFunction(result) ? result.call(object) : result;
    }

    /**
     * Sets the property value of `path` on `object`. If a portion of `path`
     * does not exist it is created.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to augment.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.set(object, 'a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     *
     * _.set(object, 'x[0].y.z', 5);
     * console.log(object.x[0].y.z);
     * // => 5
     */
    function set(object, path, value) {
      if (object == null) {
        return object;
      }
      var pathKey = (path + '');
      path = (object[pathKey] != null || isKey(path, object)) ? [pathKey] : toPath(path);

      var index = -1,
          length = path.length,
          endIndex = length - 1,
          nested = object;

      while (nested != null && ++index < length) {
        var key = path[index];
        if (isObject(nested)) {
          if (index == endIndex) {
            nested[key] = value;
          } else if (nested[key] == null) {
            nested[key] = isIndex(path[index + 1]) ? [] : {};
          }
        }
        nested = nested[key];
      }
      return object;
    }

    /**
     * An alternative to `_.reduce`; this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own enumerable
     * properties through `iteratee`, with each invocation potentially mutating
     * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
     * with four arguments: (accumulator, value, key, object). Iteratee functions
     * may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.transform([2, 3, 4], function(result, n) {
     *   result.push(n *= n);
     *   return n % 2 == 0;
     * });
     * // => [4, 9]
     *
     * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {
     *   result[key] = n * 3;
     * });
     * // => { 'a': 3, 'b': 6 }
     */
    function transform(object, iteratee, accumulator, thisArg) {
      var isArr = isArray(object) || isTypedArray(object);
      iteratee = getCallback(iteratee, thisArg, 4);

      if (accumulator == null) {
        if (isArr || isObject(object)) {
          var Ctor = object.constructor;
          if (isArr) {
            accumulator = isArray(object) ? new Ctor : [];
          } else {
            accumulator = baseCreate(isFunction(Ctor) && Ctor.prototype);
          }
        } else {
          accumulator = {};
        }
      }
      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
        return iteratee(accumulator, value, index, object);
      });
      return accumulator;
    }

    /**
     * Creates an array of the own enumerable property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return baseValues(object, keys(object));
    }

    /**
     * Creates an array of the own and inherited enumerable property values
     * of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.valuesIn(new Foo);
     * // => [1, 2, 3] (iteration order is not guaranteed)
     */
    function valuesIn(object) {
      return baseValues(object, keysIn(object));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Checks if `n` is between `start` and up to but not including, `end`. If
     * `end` is not specified it is set to `start` with `start` then set to `0`.
     *
     * @static
     * @memberOf _
     * @category Number
     * @param {number} n The number to check.
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @returns {boolean} Returns `true` if `n` is in the range, else `false`.
     * @example
     *
     * _.inRange(3, 2, 4);
     * // => true
     *
     * _.inRange(4, 8);
     * // => true
     *
     * _.inRange(4, 2);
     * // => false
     *
     * _.inRange(2, 2);
     * // => false
     *
     * _.inRange(1.2, 2);
     * // => true
     *
     * _.inRange(5.2, 4);
     * // => false
     */
    function inRange(value, start, end) {
      start = +start || 0;
      if (typeof end === 'undefined') {
        end = start;
        start = 0;
      } else {
        end = +end || 0;
      }
      return value >= nativeMin(start, end) && value < nativeMax(start, end);
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number is returned.
     * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
     * number is returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Number
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating] Specify returning a floating-point number.
     * @returns {number} Returns the random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      if (floating && isIterateeCall(min, max, floating)) {
        max = floating = null;
      }
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (noMax && typeof min == 'boolean') {
          floating = min;
          min = 1;
        }
        else if (typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
        noMax = false;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the camel cased string.
     * @example
     *
     * _.camelCase('Foo Bar');
     * // => 'fooBar'
     *
     * _.camelCase('--foo-bar');
     * // => 'fooBar'
     *
     * _.camelCase('__foo_bar__');
     * // => 'fooBar'
     */
    var camelCase = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? (word.charAt(0).toUpperCase() + word.slice(1)) : word);
    });

    /**
     * Capitalizes the first character of `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to capitalize.
     * @returns {string} Returns the capitalized string.
     * @example
     *
     * _.capitalize('fred');
     * // => 'Fred'
     */
    function capitalize(string) {
      string = baseToString(string);
      return string && (string.charAt(0).toUpperCase() + string.slice(1));
    }

    /**
     * Deburrs `string` by converting [latin-1 supplementary letters](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
     * to basic latin letters and removing [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to deburr.
     * @returns {string} Returns the deburred string.
     * @example
     *
     * _.deburr('déjà vu');
     * // => 'deja vu'
     */
    function deburr(string) {
      string = baseToString(string);
      return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, '');
    }

    /**
     * Checks if `string` ends with the given target string.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to search.
     * @param {string} [target] The string to search for.
     * @param {number} [position=string.length] The position to search from.
     * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.
     * @example
     *
     * _.endsWith('abc', 'c');
     * // => true
     *
     * _.endsWith('abc', 'b');
     * // => false
     *
     * _.endsWith('abc', 'b', 2);
     * // => true
     */
    function endsWith(string, target, position) {
      string = baseToString(string);
      target = (target + '');

      var length = string.length;
      position = position === undefined
        ? length
        : nativeMin(position < 0 ? 0 : (+position || 0), length);

      position -= target.length;
      return position >= 0 && string.indexOf(target, position) == position;
    }

    /**
     * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
     * their corresponding HTML entities.
     *
     * **Note:** No other characters are escaped. To escape additional characters
     * use a third-party library like [_he_](https://mths.be/he).
     *
     * Though the ">" character is escaped for symmetry, characters like
     * ">" and "/" don't require escaping in HTML and have no special meaning
     * unless they're part of a tag or unquoted attribute value.
     * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
     * (under "semi-related fun fact") for more details.
     *
     * Backticks are escaped because in Internet Explorer < 9, they can break out
     * of attribute values or HTML comments. See [#59](https://html5sec.org/#59),
     * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
     * [#133](https://html5sec.org/#133) of the [HTML5 Security Cheatsheet](https://html5sec.org/)
     * for more details.
     *
     * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)
     * to reduce XSS vectors.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    function escape(string) {
      // Reset `lastIndex` because in IE < 9 `String#replace` does not.
      string = baseToString(string);
      return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }

    /**
     * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
     * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escapeRegExp('[lodash](https://lodash.com/)');
     * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
     */
    function escapeRegExp(string) {
      string = baseToString(string);
      return (string && reHasRegExpChars.test(string))
        ? string.replace(reRegExpChars, '\\$&')
        : string;
    }

    /**
     * Converts `string` to [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the kebab cased string.
     * @example
     *
     * _.kebabCase('Foo Bar');
     * // => 'foo-bar'
     *
     * _.kebabCase('fooBar');
     * // => 'foo-bar'
     *
     * _.kebabCase('__foo_bar__');
     * // => 'foo-bar'
     */
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? '-' : '') + word.toLowerCase();
    });

    /**
     * Pads `string` on the left and right sides if it is shorter than `length`.
     * Padding characters are truncated if they can't be evenly divided by `length`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.pad('abc', 8);
     * // => '  abc   '
     *
     * _.pad('abc', 8, '_-');
     * // => '_-abc_-_'
     *
     * _.pad('abc', 3);
     * // => 'abc'
     */
    function pad(string, length, chars) {
      string = baseToString(string);
      length = +length;

      var strLength = string.length;
      if (strLength >= length || !nativeIsFinite(length)) {
        return string;
      }
      var mid = (length - strLength) / 2,
          leftLength = floor(mid),
          rightLength = ceil(mid);

      chars = createPadding('', rightLength, chars);
      return chars.slice(0, leftLength) + string + chars;
    }

    /**
     * Pads `string` on the left side if it is shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padLeft('abc', 6);
     * // => '   abc'
     *
     * _.padLeft('abc', 6, '_-');
     * // => '_-_abc'
     *
     * _.padLeft('abc', 3);
     * // => 'abc'
     */
    var padLeft = createPadDir();

    /**
     * Pads `string` on the right side if it is shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padRight('abc', 6);
     * // => 'abc   '
     *
     * _.padRight('abc', 6, '_-');
     * // => 'abc_-_'
     *
     * _.padRight('abc', 3);
     * // => 'abc'
     */
    var padRight = createPadDir(true);

    /**
     * Converts `string` to an integer of the specified radix. If `radix` is
     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a hexadecimal,
     * in which case a `radix` of `16` is used.
     *
     * **Note:** This method aligns with the [ES5 implementation](https://es5.github.io/#E)
     * of `parseInt`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} string The string to convert.
     * @param {number} [radix] The radix to interpret `value` by.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     *
     * _.map(['6', '08', '10'], _.parseInt);
     * // => [6, 8, 10]
     */
    function parseInt(string, radix, guard) {
      if (guard && isIterateeCall(string, radix, guard)) {
        radix = 0;
      }
      return nativeParseInt(string, radix);
    }
    // Fallback for environments with pre-ES5 implementations.
    if (nativeParseInt(whitespace + '08') != 8) {
      parseInt = function(string, radix, guard) {
        // Firefox < 21 and Opera < 15 follow ES3 for `parseInt`.
        // Chrome fails to trim leading <BOM> whitespace characters.
        // See https://code.google.com/p/v8/issues/detail?id=3109 for more details.
        if (guard ? isIterateeCall(string, radix, guard) : radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        string = trim(string);
        return nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
      };
    }

    /**
     * Repeats the given string `n` times.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to repeat.
     * @param {number} [n=0] The number of times to repeat the string.
     * @returns {string} Returns the repeated string.
     * @example
     *
     * _.repeat('*', 3);
     * // => '***'
     *
     * _.repeat('abc', 2);
     * // => 'abcabc'
     *
     * _.repeat('abc', 0);
     * // => ''
     */
    function repeat(string, n) {
      var result = '';
      string = baseToString(string);
      n = +n;
      if (n < 1 || !string || !nativeIsFinite(n)) {
        return result;
      }
      // Leverage the exponentiation by squaring algorithm for a faster repeat.
      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
      do {
        if (n % 2) {
          result += string;
        }
        n = floor(n / 2);
        string += string;
      } while (n);

      return result;
    }

    /**
     * Converts `string` to [snake case](https://en.wikipedia.org/wiki/Snake_case).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the snake cased string.
     * @example
     *
     * _.snakeCase('Foo Bar');
     * // => 'foo_bar'
     *
     * _.snakeCase('fooBar');
     * // => 'foo_bar'
     *
     * _.snakeCase('--foo-bar');
     * // => 'foo_bar'
     */
    var snakeCase = createCompounder(function(result, word, index) {
      return result + (index ? '_' : '') + word.toLowerCase();
    });

    /**
     * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the start cased string.
     * @example
     *
     * _.startCase('--foo-bar');
     * // => 'Foo Bar'
     *
     * _.startCase('fooBar');
     * // => 'Foo Bar'
     *
     * _.startCase('__foo_bar__');
     * // => 'Foo Bar'
     */
    var startCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));
    });

    /**
     * Checks if `string` starts with the given target string.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to search.
     * @param {string} [target] The string to search for.
     * @param {number} [position=0] The position to search from.
     * @returns {boolean} Returns `true` if `string` starts with `target`, else `false`.
     * @example
     *
     * _.startsWith('abc', 'a');
     * // => true
     *
     * _.startsWith('abc', 'b');
     * // => false
     *
     * _.startsWith('abc', 'b', 1);
     * // => true
     */
    function startsWith(string, target, position) {
      string = baseToString(string);
      position = position == null
        ? 0
        : nativeMin(position < 0 ? 0 : (+position || 0), string.length);

      return string.lastIndexOf(target, position) == position;
    }

    /**
     * Creates a compiled template function that can interpolate data properties
     * in "interpolate" delimiters, HTML-escape interpolated data properties in
     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
     * properties may be accessed as free variables in the template. If a setting
     * object is provided it takes precedence over `_.templateSettings` values.
     *
     * **Note:** In the development build `_.template` utilizes
     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
     * for easier debugging.
     *
     * For more information on precompiling templates see
     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
     *
     * For more information on Chrome extension sandboxes see
     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The template string.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The HTML "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as free variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [options.variable] The data object variable name.
     * @param- {Object} [otherOptions] Enables the legacy `options` param signature.
     * @returns {Function} Returns the compiled template function.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= user %>!');
     * compiled({ 'user': 'fred' });
     * // => 'hello fred!'
     *
     * // using the HTML "escape" delimiter to escape data property values
     * var compiled = _.template('<b><%- value %></b>');
     * compiled({ 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to execute JavaScript and generate HTML
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * var compiled = _.template('<% print("hello " + user); %>!');
     * compiled({ 'user': 'barney' });
     * // => 'hello barney!'
     *
     * // using the ES delimiter as an alternative to the default "interpolate" delimiter
     * var compiled = _.template('hello ${ user }!');
     * compiled({ 'user': 'pebbles' });
     * // => 'hello pebbles!'
     *
     * // using custom template delimiters
     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
     * var compiled = _.template('hello {{ user }}!');
     * compiled({ 'user': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using backslashes to treat delimiters as plain text
     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
     * compiled({ 'value': 'ignored' });
     * // => '<%- value %>'
     *
     * // using the `imports` option to import `jQuery` as `jq`
     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     * //   var __t, __p = '';
     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
     * //   return __p;
     * // }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(string, options, otherOptions) {
      // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)
      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
      var settings = lodash.templateSettings;

      if (otherOptions && isIterateeCall(string, options, otherOptions)) {
        options = otherOptions = null;
      }
      string = baseToString(string);
      options = assignWith(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);

      var imports = assignWith(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),
          importsKeys = keys(imports),
          importsValues = baseValues(imports, importsKeys);

      var isEscaping,
          isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // Compile the regexp to match each delimiter.
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      // Use a sourceURL for easier debugging.
      var sourceURL = '//# sourceURL=' +
        ('sourceURL' in options
          ? options.sourceURL
          : ('lodash.templateSources[' + (++templateCounter) + ']')
        ) + '\n';

      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // Escape characters that can't be included in string literals.
        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // Replace delimiters with snippets.
        if (escapeValue) {
          isEscaping = true;
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // The JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value.
        return match;
      });

      source += "';\n";

      // If `variable` is not specified wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain.
      var variable = options.variable;
      if (!variable) {
        source = 'with (obj) {\n' + source + '\n}\n';
      }
      // Cleanup code by stripping empty strings.
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // Frame code as the function body.
      source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
          ? ''
          : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
           ? ', __e = _.escape'
           : ''
        ) +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      var result = attempt(function() {
        return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);
      });

      // Provide the compiled function's source by its `toString` method or
      // the `source` property as a convenience for inlining compiled templates.
      result.source = source;
      if (isError(result)) {
        throw result;
      }
      return result;
    }

    /**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */
    function trim(string, chars, guard) {
      var value = string;
      string = baseToString(string);
      if (!string) {
        return string;
      }
      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
        return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
      }
      chars = (chars + '');
      return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
    }

    /**
     * Removes leading whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimLeft('  abc  ');
     * // => 'abc  '
     *
     * _.trimLeft('-_-abc-_-', '_-');
     * // => 'abc-_-'
     */
    function trimLeft(string, chars, guard) {
      var value = string;
      string = baseToString(string);
      if (!string) {
        return string;
      }
      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
        return string.slice(trimmedLeftIndex(string));
      }
      return string.slice(charsLeftIndex(string, (chars + '')));
    }

    /**
     * Removes trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimRight('  abc  ');
     * // => '  abc'
     *
     * _.trimRight('-_-abc-_-', '_-');
     * // => '-_-abc'
     */
    function trimRight(string, chars, guard) {
      var value = string;
      string = baseToString(string);
      if (!string) {
        return string;
      }
      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
        return string.slice(0, trimmedRightIndex(string) + 1);
      }
      return string.slice(0, charsRightIndex(string, (chars + '')) + 1);
    }

    /**
     * Truncates `string` if it is longer than the given maximum string length.
     * The last characters of the truncated string are replaced with the omission
     * string which defaults to "...".
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to truncate.
     * @param {Object|number} [options] The options object or maximum string length.
     * @param {number} [options.length=30] The maximum string length.
     * @param {string} [options.omission='...'] The string to indicate text is omitted.
     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the truncated string.
     * @example
     *
     * _.trunc('hi-diddly-ho there, neighborino');
     * // => 'hi-diddly-ho there, neighbo...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', 24);
     * // => 'hi-diddly-ho there, n...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': ' '
     * });
     * // => 'hi-diddly-ho there,...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': /,? +/
     * });
     * // => 'hi-diddly-ho there...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', {
     *   'omission': ' [...]'
     * });
     * // => 'hi-diddly-ho there, neig [...]'
     */
    function trunc(string, options, guard) {
      if (guard && isIterateeCall(string, options, guard)) {
        options = null;
      }
      var length = DEFAULT_TRUNC_LENGTH,
          omission = DEFAULT_TRUNC_OMISSION;

      if (options != null) {
        if (isObject(options)) {
          var separator = 'separator' in options ? options.separator : separator;
          length = 'length' in options ? (+options.length || 0) : length;
          omission = 'omission' in options ? baseToString(options.omission) : omission;
        } else {
          length = +options || 0;
        }
      }
      string = baseToString(string);
      if (length >= string.length) {
        return string;
      }
      var end = length - omission.length;
      if (end < 1) {
        return omission;
      }
      var result = string.slice(0, end);
      if (separator == null) {
        return result + omission;
      }
      if (isRegExp(separator)) {
        if (string.slice(end).search(separator)) {
          var match,
              newEnd,
              substring = string.slice(0, end);

          if (!separator.global) {
            separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');
          }
          separator.lastIndex = 0;
          while ((match = separator.exec(substring))) {
            newEnd = match.index;
          }
          result = result.slice(0, newEnd == null ? end : newEnd);
        }
      } else if (string.indexOf(separator, end) != end) {
        var index = result.lastIndexOf(separator);
        if (index > -1) {
          result = result.slice(0, index);
        }
      }
      return result + omission;
    }

    /**
     * The inverse of `_.escape`; this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their
     * corresponding characters.
     *
     * **Note:** No other HTML entities are unescaped. To unescape additional HTML
     * entities use a third-party library like [_he_](https://mths.be/he).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('fred, barney, &amp; pebbles');
     * // => 'fred, barney, & pebbles'
     */
    function unescape(string) {
      string = baseToString(string);
      return (string && reHasEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, unescapeHtmlChar)
        : string;
    }

    /**
     * Splits `string` into an array of its words.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {RegExp|string} [pattern] The pattern to match words.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the words of `string`.
     * @example
     *
     * _.words('fred, barney, & pebbles');
     * // => ['fred', 'barney', 'pebbles']
     *
     * _.words('fred, barney, & pebbles', /[^, ]+/g);
     * // => ['fred', 'barney', '&', 'pebbles']
     */
    function words(string, pattern, guard) {
      if (guard && isIterateeCall(string, pattern, guard)) {
        pattern = null;
      }
      string = baseToString(string);
      return string.match(pattern || reWords) || [];
    }

    /*------------------------------------------------------------------------*/

    /**
     * Attempts to invoke `func`, returning either the result or the caught error
     * object. Any additional arguments are provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Function} func The function to attempt.
     * @returns {*} Returns the `func` result or error object.
     * @example
     *
     * // avoid throwing errors for invalid selectors
     * var elements = _.attempt(function(selector) {
     *   return document.querySelectorAll(selector);
     * }, '>_>');
     *
     * if (_.isError(elements)) {
     *   elements = [];
     * }
     */
    var attempt = restParam(function(func, args) {
      try {
        return func.apply(undefined, args);
      } catch(e) {
        return isError(e) ? e : new Error(e);
      }
    });

    /**
     * Creates a function that invokes `func` with the `this` binding of `thisArg`
     * and arguments of the created function. If `func` is a property name the
     * created callback returns the property value for a given element. If `func`
     * is an object the created callback returns `true` for elements that contain
     * the equivalent object properties, otherwise it returns `false`.
     *
     * @static
     * @memberOf _
     * @alias iteratee
     * @category Utility
     * @param {*} [func=_.identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the callback.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
     *   if (!match) {
     *     return callback(func, thisArg);
     *   }
     *   return function(object) {
     *     return match[2] == 'gt'
     *       ? object[match[1]] > match[3]
     *       : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(users, 'age__gt36');
     * // => [{ 'user': 'fred', 'age': 40 }]
     */
    function callback(func, thisArg, guard) {
      if (guard && isIterateeCall(func, thisArg, guard)) {
        thisArg = null;
      }
      return baseCallback(func, thisArg);
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var getter = _.constant(object);
     *
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Creates a function which performs a deep comparison between a given object
     * and `source`, returning `true` if the given object has equivalent property
     * values, else `false`.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. For comparing a single
     * own or inherited property value see `_.matchesProperty`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, _.matches({ 'age': 40, 'active': false }));
     * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
     */
    function matches(source) {
      return baseMatches(baseClone(source, true));
    }

    /**
     * Creates a function which compares the property value of `path` on a given
     * object to `value`.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Array|string} path The path of the property to get.
     * @param {*} value The value to compare.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * _.find(users, _.matchesProperty('user', 'fred'));
     * // => { 'user': 'fred' }
     */
    function matchesProperty(path, value) {
      return baseMatchesProperty(path, baseClone(value, true));
    }

    /**
     * Creates a function which invokes the method at `path` on a given object.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Array|string} path The path of the method to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': { 'c': _.constant(2) } } },
     *   { 'a': { 'b': { 'c': _.constant(1) } } }
     * ];
     *
     * _.map(objects, _.method('a.b.c'));
     * // => [2, 1]
     *
     * _.invoke(_.sortBy(objects, _.method(['a', 'b', 'c'])), 'a.b.c');
     * // => [1, 2]
     */
    var method = restParam(function(path, args) {
      return function(object) {
        return invokePath(object, path, args);
      }
    });

    /**
     * The opposite of `_.method`; this method creates a function which invokes
     * the method at a given path on `object`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var array = _.times(3, _.constant),
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.methodOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
     * // => [2, 0]
     */
    var methodOf = restParam(function(object, args) {
      return function(path) {
        return invokePath(object, path, args);
      };
    });

    /**
     * Adds all own enumerable function properties of a source object to the
     * destination object. If `object` is a function then methods are added to
     * its prototype as well.
     *
     * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
     * avoid conflicts caused by modifying the original.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Function|Object} [object=lodash] The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added
     *  are chainable.
     * @returns {Function|Object} Returns `object`.
     * @example
     *
     * function vowels(string) {
     *   return _.filter(string, function(v) {
     *     return /[aeiou]/i.test(v);
     *   });
     * }
     *
     * // use `_.runInContext` to avoid conflicts (esp. in Node.js)
     * var _ = require('lodash').runInContext();
     *
     * _.mixin({ 'vowels': vowels });
     * _.vowels('fred');
     * // => ['e']
     *
     * _('fred').vowels().value();
     * // => ['e']
     *
     * _.mixin({ 'vowels': vowels }, { 'chain': false });
     * _('fred').vowels();
     * // => ['e']
     */
    function mixin(object, source, options) {
      if (options == null) {
        var isObj = isObject(source),
            props = isObj && keys(source),
            methodNames = props && props.length && baseFunctions(source, props);

        if (!(methodNames ? methodNames.length : isObj)) {
          methodNames = false;
          options = source;
          source = object;
          object = this;
        }
      }
      if (!methodNames) {
        methodNames = baseFunctions(source, keys(source));
      }
      var chain = true,
          index = -1,
          isFunc = isFunction(object),
          length = methodNames.length;

      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      while (++index < length) {
        var methodName = methodNames[index],
            func = source[methodName];

        object[methodName] = func;
        if (isFunc) {
          object.prototype[methodName] = (function(func) {
            return function() {
              var chainAll = this.__chain__;
              if (chain || chainAll) {
                var result = object(this.__wrapped__),
                    actions = result.__actions__ = arrayCopy(this.__actions__);

                actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
                result.__chain__ = chainAll;
                return result;
              }
              var args = [this.value()];
              push.apply(args, arguments);
              return func.apply(object, args);
            };
          }(func));
        }
      }
      return object;
    }

    /**
     * Reverts the `_` variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function which returns `undefined` regardless of the
     * arguments it receives.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // No operation performed.
    }

    /**
     * Creates a function which returns the property value at `path` on a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': { 'c': 2 } } },
     *   { 'a': { 'b': { 'c': 1 } } }
     * ];
     *
     * _.map(objects, _.property('a.b.c'));
     * // => [2, 1]
     *
     * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
    }

    /**
     * The opposite of `_.property`; this method creates a function which returns
     * the property value at a given path on `object`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var array = [0, 1, 2],
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
     * // => [2, 0]
     */
    function propertyOf(object) {
      return function(path) {
        return baseGet(object, toPath(path), path + '');
      };
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to, but not including, `end`. If `end` is not specified it is
     * set to `start` with `start` then set to `0`. If `end` is less than `start`
     * a zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the new array of numbers.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      if (step && isIterateeCall(start, end, step)) {
        end = step = null;
      }
      start = +start || 0;
      step = step == null ? 1 : (+step || 0);

      if (end == null) {
        end = start;
        start = 0;
      } else {
        end = +end || 0;
      }
      // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.
      // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.
      var index = -1,
          length = nativeMax(ceil((end - start) / (step || 1)), 0),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Invokes the iteratee function `n` times, returning an array of the results
     * of each invocation. The `iteratee` is bound to `thisArg` and invoked with
     * one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6, false));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) {
     *   mage.castSpell(n);
     * });
     * // => invokes `mage.castSpell(n)` three times with `n` of `0`, `1`, and `2`
     *
     * _.times(3, function(n) {
     *   this.cast(n);
     * }, mage);
     * // => also invokes `mage.castSpell(n)` three times
     */
    function times(n, iteratee, thisArg) {
      n = +n;

      // Exit early to avoid a JSC JIT bug in Safari 8
      // where `Array(0)` is treated as `Array(1)`.
      if (n < 1 || !nativeIsFinite(n)) {
        return [];
      }
      var index = -1,
          result = Array(nativeMin(n, MAX_ARRAY_LENGTH));

      iteratee = bindCallback(iteratee, thisArg, 1);
      while (++index < n) {
        if (index < MAX_ARRAY_LENGTH) {
          result[index] = iteratee(index);
        } else {
          iteratee(index);
        }
      }
      return result;
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID is appended to it.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return baseToString(prefix) + id;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Adds two numbers.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {number} augend The first number to add.
     * @param {number} addend The second number to add.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.add(6, 4);
     * // => 10
     */
    function add(augend, addend) {
      return (+augend || 0) + (+addend || 0);
    }

    /**
     * Gets the maximum value of `collection`. If `collection` is empty or falsey
     * `-Infinity` is returned. If an iteratee function is provided it is invoked
     * for each value in `collection` to generate the criterion by which the value
     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * _.max([]);
     * // => -Infinity
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * _.max(users, function(chr) {
     *   return chr.age;
     * });
     * // => { 'user': 'fred', 'age': 40 }
     *
     * // using the `_.property` callback shorthand
     * _.max(users, 'age');
     * // => { 'user': 'fred', 'age': 40 }
     */
    var max = createExtremum(arrayMax);

    /**
     * Gets the minimum value of `collection`. If `collection` is empty or falsey
     * `Infinity` is returned. If an iteratee function is provided it is invoked
     * for each value in `collection` to generate the criterion by which the value
     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * _.min([]);
     * // => Infinity
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * _.min(users, function(chr) {
     *   return chr.age;
     * });
     * // => { 'user': 'barney', 'age': 36 }
     *
     * // using the `_.property` callback shorthand
     * _.min(users, 'age');
     * // => { 'user': 'barney', 'age': 36 }
     */
    var min = createExtremum(arrayMin, true);

    /**
     * Gets the sum of the values in `collection`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.sum([4, 6]);
     * // => 10
     *
     * _.sum({ 'a': 4, 'b': 6 });
     * // => 10
     *
     * var objects = [
     *   { 'n': 4 },
     *   { 'n': 6 }
     * ];
     *
     * _.sum(objects, function(object) {
     *   return object.n;
     * });
     * // => 10
     *
     * // using the `_.property` callback shorthand
     * _.sum(objects, 'n');
     * // => 10
     */
    function sum(collection, iteratee, thisArg) {
      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
        iteratee = null;
      }
      var func = getCallback(),
          noIteratee = iteratee == null;

      if (!(func === baseCallback && noIteratee)) {
        noIteratee = false;
        iteratee = func(iteratee, thisArg, 3);
      }
      return noIteratee
        ? arraySum(isArray(collection) ? collection : toIterable(collection))
        : baseSum(collection, iteratee);
    }

    /*------------------------------------------------------------------------*/

    // Ensure wrappers are instances of `baseLodash`.
    lodash.prototype = baseLodash.prototype;

    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
    LodashWrapper.prototype.constructor = LodashWrapper;

    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
    LazyWrapper.prototype.constructor = LazyWrapper;

    // Add functions to the `Map` cache.
    MapCache.prototype['delete'] = mapDelete;
    MapCache.prototype.get = mapGet;
    MapCache.prototype.has = mapHas;
    MapCache.prototype.set = mapSet;

    // Add functions to the `Set` cache.
    SetCache.prototype.push = cachePush;

    // Assign cache to `_.memoize`.
    memoize.Cache = MapCache;

    // Add functions that return wrapped values when chaining.
    lodash.after = after;
    lodash.ary = ary;
    lodash.assign = assign;
    lodash.at = at;
    lodash.before = before;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.callback = callback;
    lodash.chain = chain;
    lodash.chunk = chunk;
    lodash.compact = compact;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.curry = curry;
    lodash.curryRight = curryRight;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.drop = drop;
    lodash.dropRight = dropRight;
    lodash.dropRightWhile = dropRightWhile;
    lodash.dropWhile = dropWhile;
    lodash.fill = fill;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.flattenDeep = flattenDeep;
    lodash.flow = flow;
    lodash.flowRight = flowRight;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.keysIn = keysIn;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.matches = matches;
    lodash.matchesProperty = matchesProperty;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.method = method;
    lodash.methodOf = methodOf;
    lodash.mixin = mixin;
    lodash.negate = negate;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.partition = partition;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.propertyOf = propertyOf;
    lodash.pull = pull;
    lodash.pullAt = pullAt;
    lodash.range = range;
    lodash.rearg = rearg;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.restParam = restParam;
    lodash.set = set;
    lodash.shuffle = shuffle;
    lodash.slice = slice;
    lodash.sortBy = sortBy;
    lodash.sortByAll = sortByAll;
    lodash.sortByOrder = sortByOrder;
    lodash.spread = spread;
    lodash.take = take;
    lodash.takeRight = takeRight;
    lodash.takeRightWhile = takeRightWhile;
    lodash.takeWhile = takeWhile;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.thru = thru;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.toPlainObject = toPlainObject;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.unzip = unzip;
    lodash.values = values;
    lodash.valuesIn = valuesIn;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // Add aliases.
    lodash.backflow = flowRight;
    lodash.collect = map;
    lodash.compose = flowRight;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.iteratee = callback;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;

    // Add functions to `lodash.prototype`.
    mixin(lodash, lodash);

    /*------------------------------------------------------------------------*/

    // Add functions that return unwrapped values when chaining.
    lodash.add = add;
    lodash.attempt = attempt;
    lodash.camelCase = camelCase;
    lodash.capitalize = capitalize;
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.deburr = deburr;
    lodash.endsWith = endsWith;
    lodash.escape = escape;
    lodash.escapeRegExp = escapeRegExp;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.findWhere = findWhere;
    lodash.first = first;
    lodash.get = get;
    lodash.has = has;
    lodash.identity = identity;
    lodash.includes = includes;
    lodash.indexOf = indexOf;
    lodash.inRange = inRange;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isError = isError;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isMatch = isMatch;
    lodash.isNaN = isNaN;
    lodash.isNative = isNative;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isTypedArray = isTypedArray;
    lodash.isUndefined = isUndefined;
    lodash.kebabCase = kebabCase;
    lodash.last = last;
    lodash.lastIndexOf = lastIndexOf;
    lodash.max = max;
    lodash.min = min;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.pad = pad;
    lodash.padLeft = padLeft;
    lodash.padRight = padRight;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.repeat = repeat;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.snakeCase = snakeCase;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.sortedLastIndex = sortedLastIndex;
    lodash.startCase = startCase;
    lodash.startsWith = startsWith;
    lodash.sum = sum;
    lodash.template = template;
    lodash.trim = trim;
    lodash.trimLeft = trimLeft;
    lodash.trimRight = trimRight;
    lodash.trunc = trunc;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;
    lodash.words = words;

    // Add aliases.
    lodash.all = every;
    lodash.any = some;
    lodash.contains = includes;
    lodash.detect = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.head = first;
    lodash.include = includes;
    lodash.inject = reduce;

    mixin(lodash, (function() {
      var source = {};
      baseForOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }()), false);

    /*------------------------------------------------------------------------*/

    // Add functions capable of returning wrapped and unwrapped values when chaining.
    lodash.sample = sample;

    lodash.prototype.sample = function(n) {
      if (!this.__chain__ && n == null) {
        return sample(this.value());
      }
      return this.thru(function(value) {
        return sample(value, n);
      });
    };

    /*------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = VERSION;

    // Assign default placeholders.
    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
      lodash[methodName].placeholder = lodash;
    });

    // Add `LazyWrapper` methods that accept an `iteratee` value.
    arrayEach(['dropWhile', 'filter', 'map', 'takeWhile'], function(methodName, type) {
      var isFilter = type != LAZY_MAP_FLAG,
          isDropWhile = type == LAZY_DROP_WHILE_FLAG;

      LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
        var filtered = this.__filtered__,
            result = (filtered && isDropWhile) ? new LazyWrapper(this) : this.clone(),
            iteratees = result.__iteratees__ || (result.__iteratees__ = []);

        iteratees.push({
          'done': false,
          'count': 0,
          'index': 0,
          'iteratee': getCallback(iteratee, thisArg, 1),
          'limit': -1,
          'type': type
        });

        result.__filtered__ = filtered || isFilter;
        return result;
      };
    });

    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
    arrayEach(['drop', 'take'], function(methodName, index) {
      var whileName = methodName + 'While';

      LazyWrapper.prototype[methodName] = function(n) {
        var filtered = this.__filtered__,
            result = (filtered && !index) ? this.dropWhile() : this.clone();

        n = n == null ? 1 : nativeMax(floor(n) || 0, 0);
        if (filtered) {
          if (index) {
            result.__takeCount__ = nativeMin(result.__takeCount__, n);
          } else {
            last(result.__iteratees__).limit = n;
          }
        } else {
          var views = result.__views__ || (result.__views__ = []);
          views.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });
        }
        return result;
      };

      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
        return this.reverse()[methodName](n).reverse();
      };

      LazyWrapper.prototype[methodName + 'RightWhile'] = function(predicate, thisArg) {
        return this.reverse()[whileName](predicate, thisArg).reverse();
      };
    });

    // Add `LazyWrapper` methods for `_.first` and `_.last`.
    arrayEach(['first', 'last'], function(methodName, index) {
      var takeName = 'take' + (index ? 'Right' : '');

      LazyWrapper.prototype[methodName] = function() {
        return this[takeName](1).value()[0];
      };
    });

    // Add `LazyWrapper` methods for `_.initial` and `_.rest`.
    arrayEach(['initial', 'rest'], function(methodName, index) {
      var dropName = 'drop' + (index ? '' : 'Right');

      LazyWrapper.prototype[methodName] = function() {
        return this[dropName](1);
      };
    });

    // Add `LazyWrapper` methods for `_.pluck` and `_.where`.
    arrayEach(['pluck', 'where'], function(methodName, index) {
      var operationName = index ? 'filter' : 'map',
          createCallback = index ? baseMatches : property;

      LazyWrapper.prototype[methodName] = function(value) {
        return this[operationName](createCallback(value));
      };
    });

    LazyWrapper.prototype.compact = function() {
      return this.filter(identity);
    };

    LazyWrapper.prototype.reject = function(predicate, thisArg) {
      predicate = getCallback(predicate, thisArg, 1);
      return this.filter(function(value) {
        return !predicate(value);
      });
    };

    LazyWrapper.prototype.slice = function(start, end) {
      start = start == null ? 0 : (+start || 0);
      var result = start < 0 ? this.takeRight(-start) : this.drop(start);

      if (end !== undefined) {
        end = (+end || 0);
        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
      }
      return result;
    };

    LazyWrapper.prototype.toArray = function() {
      return this.drop(0);
    };

    // Add `LazyWrapper` methods to `lodash.prototype`.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var lodashFunc = lodash[methodName];
      if (!lodashFunc) {
        return;
      }
      var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),
          retUnwrapped = /^(?:first|last)$/.test(methodName);

      lodash.prototype[methodName] = function() {
        var args = arguments,
            length = args.length,
            chainAll = this.__chain__,
            value = this.__wrapped__,
            isHybrid = !!this.__actions__.length,
            isLazy = value instanceof LazyWrapper,
            iteratee = args[0],
            useLazy = isLazy || isArray(value);

        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
          // avoid lazy use if the iteratee has a "length" value other than `1`
          isLazy = useLazy = false;
        }
        var onlyLazy = isLazy && !isHybrid;
        if (retUnwrapped && !chainAll) {
          return onlyLazy
            ? func.call(value)
            : lodashFunc.call(lodash, this.value());
        }
        var interceptor = function(value) {
          var otherArgs = [value];
          push.apply(otherArgs, args);
          return lodashFunc.apply(lodash, otherArgs);
        };
        if (useLazy) {
          var wrapper = onlyLazy ? value : new LazyWrapper(this),
              result = func.apply(wrapper, args);

          if (!retUnwrapped && (isHybrid || result.__actions__)) {
            var actions = result.__actions__ || (result.__actions__ = []);
            actions.push({ 'func': thru, 'args': [interceptor], 'thisArg': lodash });
          }
          return new LodashWrapper(result, chainAll);
        }
        return this.thru(interceptor);
      };
    });

    // Add `Array` and `String` methods to `lodash.prototype`.
    arrayEach(['concat', 'join', 'pop', 'push', 'replace', 'shift', 'sort', 'splice', 'split', 'unshift'], function(methodName) {
      var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],
          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
          retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);

      lodash.prototype[methodName] = function() {
        var args = arguments;
        if (retUnwrapped && !this.__chain__) {
          return func.apply(this.value(), args);
        }
        return this[chainName](function(value) {
          return func.apply(value, args);
        });
      };
    });

    // Map minified function names to their real names.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var lodashFunc = lodash[methodName];
      if (lodashFunc) {
        var key = lodashFunc.name,
            names = realNames[key] || (realNames[key] = []);

        names.push({ 'name': methodName, 'func': lodashFunc });
      }
    });

    realNames[createHybridWrapper(null, BIND_KEY_FLAG).name] = [{ 'name': 'wrapper', 'func': null }];

    // Add functions to the lazy wrapper.
    LazyWrapper.prototype.clone = lazyClone;
    LazyWrapper.prototype.reverse = lazyReverse;
    LazyWrapper.prototype.value = lazyValue;

    // Add chaining functions to the `lodash` wrapper.
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.commit = wrapperCommit;
    lodash.prototype.plant = wrapperPlant;
    lodash.prototype.reverse = wrapperReverse;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

    // Add function aliases to the `lodash` wrapper.
    lodash.prototype.collect = lodash.prototype.map;
    lodash.prototype.head = lodash.prototype.first;
    lodash.prototype.select = lodash.prototype.filter;
    lodash.prototype.tail = lodash.prototype.rest;

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // Export lodash.
  var _ = runInContext();

  // Some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose lodash to the global object when an AMD loader is present to avoid
    // errors in cases where lodash is loaded by a script tag and not intended
    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
    // more details.
    root._ = _;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
      return _;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for Node.js or RingoJS.
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // Export for Narwhal or Rhino -require.
    else {
      freeExports._ = _;
    }
  }
  else {
    // Export for a browser or Rhino.
    root._ = _;
  }
}.call(this));
;/*!

 handlebars v1.3.0

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
/* exported Handlebars */
var Handlebars = (function() {
// handlebars/safe-string.js
var __module4__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module3__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  /*jshint -W004 */
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr] || "&amp;";
  }

  function extend(obj, value) {
    for(var key in value) {
      if(Object.prototype.hasOwnProperty.call(value, key)) {
        obj[key] = value[key];
      }
    }
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (!string && string !== 0) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;
  return __exports__;
})(__module4__);

// handlebars/exception.js
var __module5__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(message, node) {
    var line;
    if (node && node.firstLine) {
      line = node.firstLine;

      message += ' - ' + line + ':' + node.firstColumn;
    }

    var tmp = Error.prototype.constructor.call(this, message);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }

    if (line) {
      this.lineNumber = line;
      this.column = node.firstColumn;
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module2__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "1.3.0";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 4;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '>= 1.0.0'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn, inverse) {
      if (toString.call(name) === objectType) {
        if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        if (inverse) { fn.not = inverse; }
        this.helpers[name] = fn;
      }
    },

    registerPartial: function(name, str) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = str;
      }
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(arg) {
      if(arguments.length === 2) {
        return undefined;
      } else {
        throw new Exception("Missing helper: '" + arg + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse || function() {}, fn = options.fn;

      if (isFunction(context)) { context = context.call(this); }

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        return fn(context);
      }
    });

    instance.registerHelper('each', function(context, options) {
      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0);
              data.last  = (i === (context.length-1));
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) { 
                data.key = key; 
                data.index = i;
                data.first = (i === 0);
              }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      if (!Utils.isEmpty(context)) return options.fn(context);
    });

    instance.registerHelper('log', function(context, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, context);
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, obj) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, obj);
        }
      }
    }
  };
  __exports__.logger = logger;
  function log(level, obj) { logger.log(level, obj); }

  __exports__.log = log;var createFrame = function(object) {
    var obj = {};
    Utils.extend(obj, object);
    return obj;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module3__, __module5__);

// handlebars/runtime.js
var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    if (!env) {
      throw new Exception("No environment passed to template");
    }

    // Note: Using env.VM references rather than local var references throughout this section to allow
    // for external users to override these as psuedo-supported APIs.
    var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
      var result = env.VM.invokePartial.apply(this, arguments);
      if (result != null) { return result; }

      if (env.compile) {
        var options = { helpers: helpers, partials: partials, data: data };
        partials[name] = env.compile(partial, { data: data !== undefined }, env);
        return partials[name](context, options);
      } else {
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      }
    };

    // Just add water
    var container = {
      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = {};
          Utils.extend(ret, common);
          Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: env.VM.programWithDepth,
      noop: env.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var namespace = options.partial ? options : env,
          helpers,
          partials;

      if (!options.partial) {
        helpers = options.helpers;
        partials = options.partials;
      }
      var result = templateSpec.call(
            container,
            namespace, context,
            helpers,
            partials,
            options.data);

      if (!options.partial) {
        env.VM.checkRevision(container.compilerInfo);
      }

      return result;
    };
  }

  __exports__.template = template;function programWithDepth(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var prog = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    prog.program = i;
    prog.depth = args.length;
    return prog;
  }

  __exports__.programWithDepth = programWithDepth;function program(i, fn, data) {
    var prog = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    prog.program = i;
    prog.depth = 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;
  return __exports__;
})(__module3__, __module5__, __module2__);

// handlebars.runtime.js
var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  __exports__ = Handlebars;
  return __exports__;
})(__module2__, __module4__, __module5__, __module3__, __module6__);

// handlebars/compiler/ast.js
var __module7__ = (function(__dependency1__) {
  "use strict";
  var __exports__;
  var Exception = __dependency1__;

  function LocationInfo(locInfo){
    locInfo = locInfo || {};
    this.firstLine   = locInfo.first_line;
    this.firstColumn = locInfo.first_column;
    this.lastColumn  = locInfo.last_column;
    this.lastLine    = locInfo.last_line;
  }

  var AST = {
    ProgramNode: function(statements, inverseStrip, inverse, locInfo) {
      var inverseLocationInfo, firstInverseNode;
      if (arguments.length === 3) {
        locInfo = inverse;
        inverse = null;
      } else if (arguments.length === 2) {
        locInfo = inverseStrip;
        inverseStrip = null;
      }

      LocationInfo.call(this, locInfo);
      this.type = "program";
      this.statements = statements;
      this.strip = {};

      if(inverse) {
        firstInverseNode = inverse[0];
        if (firstInverseNode) {
          inverseLocationInfo = {
            first_line: firstInverseNode.firstLine,
            last_line: firstInverseNode.lastLine,
            last_column: firstInverseNode.lastColumn,
            first_column: firstInverseNode.firstColumn
          };
          this.inverse = new AST.ProgramNode(inverse, inverseStrip, inverseLocationInfo);
        } else {
          this.inverse = new AST.ProgramNode(inverse, inverseStrip);
        }
        this.strip.right = inverseStrip.left;
      } else if (inverseStrip) {
        this.strip.left = inverseStrip.right;
      }
    },

    MustacheNode: function(rawParams, hash, open, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "mustache";
      this.strip = strip;

      // Open may be a string parsed from the parser or a passed boolean flag
      if (open != null && open.charAt) {
        // Must use charAt to support IE pre-10
        var escapeFlag = open.charAt(3) || open.charAt(2);
        this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
      } else {
        this.escaped = !!open;
      }

      if (rawParams instanceof AST.SexprNode) {
        this.sexpr = rawParams;
      } else {
        // Support old AST API
        this.sexpr = new AST.SexprNode(rawParams, hash);
      }

      this.sexpr.isRoot = true;

      // Support old AST API that stored this info in MustacheNode
      this.id = this.sexpr.id;
      this.params = this.sexpr.params;
      this.hash = this.sexpr.hash;
      this.eligibleHelper = this.sexpr.eligibleHelper;
      this.isHelper = this.sexpr.isHelper;
    },

    SexprNode: function(rawParams, hash, locInfo) {
      LocationInfo.call(this, locInfo);

      this.type = "sexpr";
      this.hash = hash;

      var id = this.id = rawParams[0];
      var params = this.params = rawParams.slice(1);

      // a mustache is an eligible helper if:
      // * its id is simple (a single part, not `this` or `..`)
      var eligibleHelper = this.eligibleHelper = id.isSimple;

      // a mustache is definitely a helper if:
      // * it is an eligible helper, and
      // * it has at least one parameter or hash segment
      this.isHelper = eligibleHelper && (params.length || hash);

      // if a mustache is an eligible helper but not a definite
      // helper, it is ambiguous, and will be resolved in a later
      // pass or at runtime.
    },

    PartialNode: function(partialName, context, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type         = "partial";
      this.partialName  = partialName;
      this.context      = context;
      this.strip = strip;
    },

    BlockNode: function(mustache, program, inverse, close, locInfo) {
      LocationInfo.call(this, locInfo);

      if(mustache.sexpr.id.original !== close.path.original) {
        throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
      }

      this.type = 'block';
      this.mustache = mustache;
      this.program  = program;
      this.inverse  = inverse;

      this.strip = {
        left: mustache.strip.left,
        right: close.strip.right
      };

      (program || inverse).strip.left = mustache.strip.right;
      (inverse || program).strip.right = close.strip.left;

      if (inverse && !program) {
        this.isInverse = true;
      }
    },

    ContentNode: function(string, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "content";
      this.string = string;
    },

    HashNode: function(pairs, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "hash";
      this.pairs = pairs;
    },

    IdNode: function(parts, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "ID";

      var original = "",
          dig = [],
          depth = 0;

      for(var i=0,l=parts.length; i<l; i++) {
        var part = parts[i].part;
        original += (parts[i].separator || '') + part;

        if (part === ".." || part === "." || part === "this") {
          if (dig.length > 0) {
            throw new Exception("Invalid path: " + original, this);
          } else if (part === "..") {
            depth++;
          } else {
            this.isScoped = true;
          }
        } else {
          dig.push(part);
        }
      }

      this.original = original;
      this.parts    = dig;
      this.string   = dig.join('.');
      this.depth    = depth;

      // an ID is simple if it only has one part, and that part is not
      // `..` or `this`.
      this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

      this.stringModeValue = this.string;
    },

    PartialNameNode: function(name, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "PARTIAL_NAME";
      this.name = name.original;
    },

    DataNode: function(id, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "DATA";
      this.id = id;
    },

    StringNode: function(string, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "STRING";
      this.original =
        this.string =
        this.stringModeValue = string;
    },

    IntegerNode: function(integer, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "INTEGER";
      this.original =
        this.integer = integer;
      this.stringModeValue = Number(integer);
    },

    BooleanNode: function(bool, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "BOOLEAN";
      this.bool = bool;
      this.stringModeValue = bool === "true";
    },

    CommentNode: function(comment, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "comment";
      this.comment = comment;
    }
  };

  // Must be exported as an object rather than the root of the module as the jison lexer
  // most modify the object to operate properly.
  __exports__ = AST;
  return __exports__;
})(__module5__);

// handlebars/compiler/parser.js
var __module9__ = (function() {
  "use strict";
  var __exports__;
  /* jshint ignore:start */
  /* Jison generated parser */
  var handlebars = (function(){
  var parser = {trace: function trace() { },
  yy: {},
  symbols_: {"error":2,"root":3,"statements":4,"EOF":5,"program":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"sexpr":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"CLOSE_UNESCAPED":24,"OPEN_PARTIAL":25,"partialName":26,"partial_option0":27,"sexpr_repetition0":28,"sexpr_option0":29,"dataName":30,"param":31,"STRING":32,"INTEGER":33,"BOOLEAN":34,"OPEN_SEXPR":35,"CLOSE_SEXPR":36,"hash":37,"hash_repetition_plus0":38,"hashSegment":39,"ID":40,"EQUALS":41,"DATA":42,"pathSegments":43,"SEP":44,"$accept":0,"$end":1},
  terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",35:"OPEN_SEXPR",36:"CLOSE_SEXPR",40:"ID",41:"EQUALS",42:"DATA",44:"SEP"},
  productions_: [0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,3],[37,1],[39,3],[26,1],[26,1],[26,1],[30,2],[21,1],[43,3],[43,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[38,1],[38,2]],
  performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

  var $0 = $$.length - 1;
  switch (yystate) {
  case 1: return new yy.ProgramNode($$[$0-1], this._$); 
  break;
  case 2: return new yy.ProgramNode([], this._$); 
  break;
  case 3:this.$ = new yy.ProgramNode([], $$[$0-1], $$[$0], this._$);
  break;
  case 4:this.$ = new yy.ProgramNode($$[$0-2], $$[$0-1], $$[$0], this._$);
  break;
  case 5:this.$ = new yy.ProgramNode($$[$0-1], $$[$0], [], this._$);
  break;
  case 6:this.$ = new yy.ProgramNode($$[$0], this._$);
  break;
  case 7:this.$ = new yy.ProgramNode([], this._$);
  break;
  case 8:this.$ = new yy.ProgramNode([], this._$);
  break;
  case 9:this.$ = [$$[$0]];
  break;
  case 10: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
  break;
  case 11:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0], this._$);
  break;
  case 12:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0], this._$);
  break;
  case 13:this.$ = $$[$0];
  break;
  case 14:this.$ = $$[$0];
  break;
  case 15:this.$ = new yy.ContentNode($$[$0], this._$);
  break;
  case 16:this.$ = new yy.CommentNode($$[$0], this._$);
  break;
  case 17:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 18:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 19:this.$ = {path: $$[$0-1], strip: stripFlags($$[$0-2], $$[$0])};
  break;
  case 20:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 21:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 22:this.$ = new yy.PartialNode($$[$0-2], $$[$0-1], stripFlags($$[$0-3], $$[$0]), this._$);
  break;
  case 23:this.$ = stripFlags($$[$0-1], $$[$0]);
  break;
  case 24:this.$ = new yy.SexprNode([$$[$0-2]].concat($$[$0-1]), $$[$0], this._$);
  break;
  case 25:this.$ = new yy.SexprNode([$$[$0]], null, this._$);
  break;
  case 26:this.$ = $$[$0];
  break;
  case 27:this.$ = new yy.StringNode($$[$0], this._$);
  break;
  case 28:this.$ = new yy.IntegerNode($$[$0], this._$);
  break;
  case 29:this.$ = new yy.BooleanNode($$[$0], this._$);
  break;
  case 30:this.$ = $$[$0];
  break;
  case 31:$$[$0-1].isHelper = true; this.$ = $$[$0-1];
  break;
  case 32:this.$ = new yy.HashNode($$[$0], this._$);
  break;
  case 33:this.$ = [$$[$0-2], $$[$0]];
  break;
  case 34:this.$ = new yy.PartialNameNode($$[$0], this._$);
  break;
  case 35:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
  break;
  case 36:this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
  break;
  case 37:this.$ = new yy.DataNode($$[$0], this._$);
  break;
  case 38:this.$ = new yy.IdNode($$[$0], this._$);
  break;
  case 39: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2]; 
  break;
  case 40:this.$ = [{part: $$[$0]}];
  break;
  case 43:this.$ = [];
  break;
  case 44:$$[$0-1].push($$[$0]);
  break;
  case 47:this.$ = [$$[$0]];
  break;
  case 48:$$[$0-1].push($$[$0]);
  break;
  }
  },
  table: [{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:29,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:30,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:31,21:24,30:25,40:[1,28],42:[1,27],43:26},{21:33,26:32,32:[1,34],33:[1,35],40:[1,28],43:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,40:[1,28],42:[1,27],43:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,43],24:[2,43],28:43,32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],40:[2,43],42:[2,43]},{18:[2,25],24:[2,25],36:[2,25]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],40:[2,38],42:[2,38],44:[1,44]},{21:45,40:[1,28],43:26},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],42:[2,40],44:[2,40]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,41],21:50,27:49,40:[1,28],43:26},{18:[2,34],40:[2,34]},{18:[2,35],40:[2,35]},{18:[2,36],40:[2,36]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,40:[1,28],43:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,45],21:56,24:[2,45],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:[1,61],36:[2,45],37:55,38:62,39:63,40:[1,64],42:[1,27],43:26},{40:[1,65]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],40:[2,37],42:[2,37]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,66]},{18:[2,42]},{18:[1,67]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24],36:[2,24]},{18:[2,44],24:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],40:[2,44],42:[2,44]},{18:[2,46],24:[2,46],36:[2,46]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],40:[2,26],42:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],40:[2,27],42:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],40:[2,28],42:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],40:[2,29],42:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],40:[2,30],42:[2,30]},{17:68,21:24,30:25,40:[1,28],42:[1,27],43:26},{18:[2,32],24:[2,32],36:[2,32],39:69,40:[1,70]},{18:[2,47],24:[2,47],36:[2,47],40:[2,47]},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],41:[1,71],42:[2,40],44:[2,40]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],40:[2,39],42:[2,39],44:[2,39]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{36:[1,72]},{18:[2,48],24:[2,48],36:[2,48],40:[2,48]},{41:[1,71]},{21:56,30:60,31:73,32:[1,57],33:[1,58],34:[1,59],35:[1,61],40:[1,28],42:[1,27],43:26},{18:[2,31],24:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],40:[2,31],42:[2,31]},{18:[2,33],24:[2,33],36:[2,33],40:[2,33]}],
  defaultActions: {3:[2,2],16:[2,1],50:[2,42]},
  parseError: function parseError(str, hash) {
      throw new Error(str);
  },
  parse: function parse(input) {
      var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
      this.lexer.setInput(input);
      this.lexer.yy = this.yy;
      this.yy.lexer = this.lexer;
      this.yy.parser = this;
      if (typeof this.lexer.yylloc == "undefined")
          this.lexer.yylloc = {};
      var yyloc = this.lexer.yylloc;
      lstack.push(yyloc);
      var ranges = this.lexer.options && this.lexer.options.ranges;
      if (typeof this.yy.parseError === "function")
          this.parseError = this.yy.parseError;
      function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
          lstack.length = lstack.length - n;
      }
      function lex() {
          var token;
          token = self.lexer.lex() || 1;
          if (typeof token !== "number") {
              token = self.symbols_[token] || token;
          }
          return token;
      }
      var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
      while (true) {
          state = stack[stack.length - 1];
          if (this.defaultActions[state]) {
              action = this.defaultActions[state];
          } else {
              if (symbol === null || typeof symbol == "undefined") {
                  symbol = lex();
              }
              action = table[state] && table[state][symbol];
          }
          if (typeof action === "undefined" || !action.length || !action[0]) {
              var errStr = "";
              if (!recovering) {
                  expected = [];
                  for (p in table[state])
                      if (this.terminals_[p] && p > 2) {
                          expected.push("'" + this.terminals_[p] + "'");
                      }
                  if (this.lexer.showPosition) {
                      errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                  } else {
                      errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                  }
                  this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
              }
          }
          if (action[0] instanceof Array && action.length > 1) {
              throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
          }
          switch (action[0]) {
          case 1:
              stack.push(symbol);
              vstack.push(this.lexer.yytext);
              lstack.push(this.lexer.yylloc);
              stack.push(action[1]);
              symbol = null;
              if (!preErrorSymbol) {
                  yyleng = this.lexer.yyleng;
                  yytext = this.lexer.yytext;
                  yylineno = this.lexer.yylineno;
                  yyloc = this.lexer.yylloc;
                  if (recovering > 0)
                      recovering--;
              } else {
                  symbol = preErrorSymbol;
                  preErrorSymbol = null;
              }
              break;
          case 2:
              len = this.productions_[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
              if (ranges) {
                  yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
              }
              r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
              if (typeof r !== "undefined") {
                  return r;
              }
              if (len) {
                  stack = stack.slice(0, -1 * len * 2);
                  vstack = vstack.slice(0, -1 * len);
                  lstack = lstack.slice(0, -1 * len);
              }
              stack.push(this.productions_[action[1]][0]);
              vstack.push(yyval.$);
              lstack.push(yyval._$);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              break;
          case 3:
              return true;
          }
      }
      return true;
  }
  };


  function stripFlags(open, close) {
    return {
      left: open.charAt(2) === '~',
      right: close.charAt(0) === '~' || close.charAt(1) === '~'
    };
  }

  /* Jison generated lexer */
  var lexer = (function(){
  var lexer = ({EOF:1,
  parseError:function parseError(str, hash) {
          if (this.yy.parser) {
              this.yy.parser.parseError(str, hash);
          } else {
              throw new Error(str);
          }
      },
  setInput:function (input) {
          this._input = input;
          this._more = this._less = this.done = false;
          this.yylineno = this.yyleng = 0;
          this.yytext = this.matched = this.match = '';
          this.conditionStack = ['INITIAL'];
          this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
          if (this.options.ranges) this.yylloc.range = [0,0];
          this.offset = 0;
          return this;
      },
  input:function () {
          var ch = this._input[0];
          this.yytext += ch;
          this.yyleng++;
          this.offset++;
          this.match += ch;
          this.matched += ch;
          var lines = ch.match(/(?:\r\n?|\n).*/g);
          if (lines) {
              this.yylineno++;
              this.yylloc.last_line++;
          } else {
              this.yylloc.last_column++;
          }
          if (this.options.ranges) this.yylloc.range[1]++;

          this._input = this._input.slice(1);
          return ch;
      },
  unput:function (ch) {
          var len = ch.length;
          var lines = ch.split(/(?:\r\n?|\n)/g);

          this._input = ch + this._input;
          this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
          //this.yyleng -= len;
          this.offset -= len;
          var oldLines = this.match.split(/(?:\r\n?|\n)/g);
          this.match = this.match.substr(0, this.match.length-1);
          this.matched = this.matched.substr(0, this.matched.length-1);

          if (lines.length-1) this.yylineno -= lines.length-1;
          var r = this.yylloc.range;

          this.yylloc = {first_line: this.yylloc.first_line,
            last_line: this.yylineno+1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
                this.yylloc.first_column - len
            };

          if (this.options.ranges) {
              this.yylloc.range = [r[0], r[0] + this.yyleng - len];
          }
          return this;
      },
  more:function () {
          this._more = true;
          return this;
      },
  less:function (n) {
          this.unput(this.match.slice(n));
      },
  pastInput:function () {
          var past = this.matched.substr(0, this.matched.length - this.match.length);
          return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
      },
  upcomingInput:function () {
          var next = this.match;
          if (next.length < 20) {
              next += this._input.substr(0, 20-next.length);
          }
          return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
      },
  showPosition:function () {
          var pre = this.pastInput();
          var c = new Array(pre.length + 1).join("-");
          return pre + this.upcomingInput() + "\n" + c+"^";
      },
  next:function () {
          if (this.done) {
              return this.EOF;
          }
          if (!this._input) this.done = true;

          var token,
              match,
              tempMatch,
              index,
              col,
              lines;
          if (!this._more) {
              this.yytext = '';
              this.match = '';
          }
          var rules = this._currentRules();
          for (var i=0;i < rules.length; i++) {
              tempMatch = this._input.match(this.rules[rules[i]]);
              if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                  match = tempMatch;
                  index = i;
                  if (!this.options.flex) break;
              }
          }
          if (match) {
              lines = match[0].match(/(?:\r\n?|\n).*/g);
              if (lines) this.yylineno += lines.length;
              this.yylloc = {first_line: this.yylloc.last_line,
                             last_line: this.yylineno+1,
                             first_column: this.yylloc.last_column,
                             last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
              this.yytext += match[0];
              this.match += match[0];
              this.matches = match;
              this.yyleng = this.yytext.length;
              if (this.options.ranges) {
                  this.yylloc.range = [this.offset, this.offset += this.yyleng];
              }
              this._more = false;
              this._input = this._input.slice(match[0].length);
              this.matched += match[0];
              token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
              if (this.done && this._input) this.done = false;
              if (token) return token;
              else return;
          }
          if (this._input === "") {
              return this.EOF;
          } else {
              return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                      {text: "", token: null, line: this.yylineno});
          }
      },
  lex:function lex() {
          var r = this.next();
          if (typeof r !== 'undefined') {
              return r;
          } else {
              return this.lex();
          }
      },
  begin:function begin(condition) {
          this.conditionStack.push(condition);
      },
  popState:function popState() {
          return this.conditionStack.pop();
      },
  _currentRules:function _currentRules() {
          return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
      },
  topState:function () {
          return this.conditionStack[this.conditionStack.length-2];
      },
  pushState:function begin(condition) {
          this.begin(condition);
      }});
  lexer.options = {};
  lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


  function strip(start, end) {
    return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
  }


  var YYSTATE=YY_START
  switch($avoiding_name_collisions) {
  case 0:
                                     if(yy_.yytext.slice(-2) === "\\\\") {
                                       strip(0,1);
                                       this.begin("mu");
                                     } else if(yy_.yytext.slice(-1) === "\\") {
                                       strip(0,1);
                                       this.begin("emu");
                                     } else {
                                       this.begin("mu");
                                     }
                                     if(yy_.yytext) return 14;
                                   
  break;
  case 1:return 14;
  break;
  case 2:
                                     this.popState();
                                     return 14;
                                   
  break;
  case 3:strip(0,4); this.popState(); return 15;
  break;
  case 4:return 35;
  break;
  case 5:return 36;
  break;
  case 6:return 25;
  break;
  case 7:return 16;
  break;
  case 8:return 20;
  break;
  case 9:return 19;
  break;
  case 10:return 19;
  break;
  case 11:return 23;
  break;
  case 12:return 22;
  break;
  case 13:this.popState(); this.begin('com');
  break;
  case 14:strip(3,5); this.popState(); return 15;
  break;
  case 15:return 22;
  break;
  case 16:return 41;
  break;
  case 17:return 40;
  break;
  case 18:return 40;
  break;
  case 19:return 44;
  break;
  case 20:// ignore whitespace
  break;
  case 21:this.popState(); return 24;
  break;
  case 22:this.popState(); return 18;
  break;
  case 23:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 32;
  break;
  case 24:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 32;
  break;
  case 25:return 42;
  break;
  case 26:return 34;
  break;
  case 27:return 34;
  break;
  case 28:return 33;
  break;
  case 29:return 40;
  break;
  case 30:yy_.yytext = strip(1,2); return 40;
  break;
  case 31:return 'INVALID';
  break;
  case 32:return 5;
  break;
  }
  };
  lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
  lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"INITIAL":{"rules":[0,1,32],"inclusive":true}};
  return lexer;})()
  parser.lexer = lexer;
  function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
  return new Parser;
  })();__exports__ = handlebars;
  /* jshint ignore:end */
  return __exports__;
})();

// handlebars/compiler/base.js
var __module8__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var parser = __dependency1__;
  var AST = __dependency2__;

  __exports__.parser = parser;

  function parse(input) {
    // Just return if an already-compile AST was passed in.
    if(input.constructor === AST.ProgramNode) { return input; }

    parser.yy = AST;
    return parser.parse(input);
  }

  __exports__.parse = parse;
  return __exports__;
})(__module9__, __module7__);

// handlebars/compiler/compiler.js
var __module10__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;

  function Compiler() {}

  __exports__.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
  // function in a context. This is necessary for mustache compatibility, which
  // requires that context functions in blocks are evaluated by blockHelperMissing,
  // and then proceed as if the resulting value was provided to blockHelperMissing.

  Compiler.prototype = {
    compiler: Compiler,

    disassemble: function() {
      var opcodes = this.opcodes, opcode, out = [], params, param;

      for (var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if (opcode.opcode === 'DECLARE') {
          out.push("DECLARE " + opcode.name + "=" + opcode.value);
        } else {
          params = [];
          for (var j=0; j<opcode.args.length; j++) {
            param = opcode.args[j];
            if (typeof param === "string") {
              param = "\"" + param.replace("\n", "\\n") + "\"";
            }
            params.push(param);
          }
          out.push(opcode.opcode + " " + params.join(" "));
        }
      }

      return out.join("\n");
    },

    equals: function(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }

      for (var i = 0; i < len; i++) {
        var opcode = this.opcodes[i],
            otherOpcode = other.opcodes[i];
        if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
          return false;
        }
        for (var j = 0; j < opcode.args.length; j++) {
          if (opcode.args[j] !== otherOpcode.args[j]) {
            return false;
          }
        }
      }

      len = this.children.length;
      if (other.children.length !== len) {
        return false;
      }
      for (i = 0; i < len; i++) {
        if (!this.children[i].equals(other.children[i])) {
          return false;
        }
      }

      return true;
    },

    guid: 0,

    compile: function(program, options) {
      this.opcodes = [];
      this.children = [];
      this.depths = {list: []};
      this.options = options;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.accept(program);
    },

    accept: function(node) {
      var strip = node.strip || {},
          ret;
      if (strip.left) {
        this.opcode('strip');
      }

      ret = this[node.type](node);

      if (strip.right) {
        this.opcode('strip');
      }

      return ret;
    },

    program: function(program) {
      var statements = program.statements;

      for(var i=0, l=statements.length; i<l; i++) {
        this.accept(statements[i]);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++, depth;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;

      if (program) {
        program = this.compileProgram(program);
      }

      if (inverse) {
        inverse = this.compileProgram(inverse);
      }

      var sexpr = mustache.sexpr;
      var type = this.classifySexpr(sexpr);

      if (type === "helper") {
        this.helperSexpr(sexpr, program, inverse);
      } else if (type === "simple") {
        this.simpleSexpr(sexpr);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('blockValue');
      } else {
        this.ambiguousSexpr(sexpr, program, inverse);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('ambiguousBlockValue');
      }

      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, pair, val;

      this.opcode('pushHash');

      for(var i=0, l=pairs.length; i<l; i++) {
        pair = pairs[i];
        val  = pair[1];

        if (this.options.stringParams) {
          if(val.depth) {
            this.addDepth(val.depth);
          }
          this.opcode('getContext', val.depth || 0);
          this.opcode('pushStringParam', val.stringModeValue, val.type);

          if (val.type === 'sexpr') {
            // Subexpressions get evaluated and passed in
            // in string params mode.
            this.sexpr(val);
          }
        } else {
          this.accept(val);
        }

        this.opcode('assignToHash', pair[0]);
      }
      this.opcode('popHash');
    },

    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'depth0');
      }

      this.opcode('invokePartial', partialName.name);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('appendContent', content.string);
    },

    mustache: function(mustache) {
      this.sexpr(mustache.sexpr);

      if(mustache.escaped && !this.options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ambiguousSexpr: function(sexpr, program, inverse) {
      var id = sexpr.id,
          name = id.parts[0],
          isBlock = program != null || inverse != null;

      this.opcode('getContext', id.depth);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      this.opcode('invokeAmbiguous', name, isBlock);
    },

    simpleSexpr: function(sexpr) {
      var id = sexpr.id;

      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        // Simplified ID for `this`
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }

      this.opcode('resolvePossibleLambda');
    },

    helperSexpr: function(sexpr, program, inverse) {
      var params = this.setupFullMustacheParams(sexpr, program, inverse),
          name = sexpr.id.parts[0];

      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
      } else {
        this.opcode('invokeHelper', params.length, name, sexpr.isRoot);
      }
    },

    sexpr: function(sexpr) {
      var type = this.classifySexpr(sexpr);

      if (type === "simple") {
        this.simpleSexpr(sexpr);
      } else if (type === "helper") {
        this.helperSexpr(sexpr);
      } else {
        this.ambiguousSexpr(sexpr);
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);

      var name = id.parts[0];
      if (!name) {
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts[0]);
      }

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    DATA: function(data) {
      this.options.data = true;
      if (data.id.isScoped || data.id.depth) {
        throw new Exception('Scoped data references are not supported: ' + data.original, data);
      }

      this.opcode('lookupData');
      var parts = data.id.parts;
      for(var i=0, l=parts.length; i<l; i++) {
        this.opcode('lookup', parts[i]);
      }
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    INTEGER: function(integer) {
      this.opcode('pushLiteral', integer.integer);
    },

    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },

    comment: function() {},

    // HELPERS
    opcode: function(name) {
      this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
    },

    declare: function(name, value) {
      this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
    },

    addDepth: function(depth) {
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    classifySexpr: function(sexpr) {
      var isHelper   = sexpr.isHelper;
      var isEligible = sexpr.eligibleHelper;
      var options    = this.options;

      // if ambiguous, we can possibly resolve the ambiguity now
      if (isEligible && !isHelper) {
        var name = sexpr.id.parts[0];

        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }

      if (isHelper) { return "helper"; }
      else if (isEligible) { return "ambiguous"; }
      else { return "simple"; }
    },

    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];

        if(this.options.stringParams) {
          if(param.depth) {
            this.addDepth(param.depth);
          }

          this.opcode('getContext', param.depth || 0);
          this.opcode('pushStringParam', param.stringModeValue, param.type);

          if (param.type === 'sexpr') {
            // Subexpressions get evaluated and passed in
            // in string params mode.
            this.sexpr(param);
          }
        } else {
          this[param.type](param);
        }
      }
    },

    setupFullMustacheParams: function(sexpr, program, inverse) {
      var params = sexpr.params;
      this.pushParams(params);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      if (sexpr.hash) {
        this.hash(sexpr.hash);
      } else {
        this.opcode('emptyHash');
      }

      return params;
    }
  };

  function precompile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }

    options = options || {};
    if (!('data' in options)) {
      options.data = true;
    }

    var ast = env.parse(input);
    var environment = new env.Compiler().compile(ast, options);
    return new env.JavaScriptCompiler().compile(environment, options);
  }

  __exports__.precompile = precompile;function compile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }

    options = options || {};

    if (!('data' in options)) {
      options.data = true;
    }

    var compiled;

    function compileInput() {
      var ast = env.parse(input);
      var environment = new env.Compiler().compile(ast, options);
      var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
      return env.template(templateSpec);
    }

    // Template is only compiled on first use and cached after that point.
    return function(context, options) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled.call(this, context, options);
    };
  }

  __exports__.compile = compile;
  return __exports__;
})(__module5__);

// handlebars/compiler/javascript-compiler.js
var __module11__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__;
  var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
  var log = __dependency1__.log;
  var Exception = __dependency2__;

  function Literal(value) {
    this.value = value;
  }

  function JavaScriptCompiler() {}

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name /* , type*/) {
      var wrap,
          ret;
      if (parent.indexOf('depth') === 0) {
        wrap = true;
      }

      if (/^[0-9]+$/.test(name)) {
        ret = parent + "[" + name + "]";
      } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        ret = parent + "." + name;
      }
      else {
        ret = parent + "['" + name + "']";
      }

      if (wrap) {
        return '(' + parent + ' && ' + ret + ')';
      } else {
        return ret;
      }
    },

    compilerInfo: function() {
      var revision = COMPILER_REVISION,
          versions = REVISION_CHANGES[revision];
      return "this.compilerInfo = ["+revision+",'"+versions+"'];\n";
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return {
          appendToBuffer: true,
          content: string,
          toString: function() { return "buffer += " + string + ";"; }
        };
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options || {};

      log('debug', this.environment.disassemble() + "\n\n");

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        environments: [],
        aliases: { }
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];
      this.registers = { list: [] };
      this.hashes = [];
      this.compileStack = [];
      this.inlineStack = [];

      this.compileChildren(environment, options);

      var opcodes = environment.opcodes, opcode;

      this.i = 0;

      for(var l=opcodes.length; this.i<l; this.i++) {
        opcode = opcodes[this.i];

        if(opcode.opcode === 'DECLARE') {
          this[opcode.name] = opcode.value;
        } else {
          this[opcode.opcode].apply(this, opcode.args);
        }

        // Reset the stripNext flag if it was not set by this operation.
        if (opcode.opcode !== this.stripNext) {
          this.stripNext = false;
        }
      }

      // Flush any trailing content that might be pending.
      this.pushSource('');

      if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
        throw new Exception('Compile completed with content left on stack');
      }

      return this.createFunctionContext(asObject);
    },

    preamble: function() {
      var out = [];

      if (!this.isChild) {
        var namespace = this.namespace;

        var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
        if (this.environment.usePartial) { copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"; }
        if (this.options.data) { copies = copies + " data = data || {};"; }
        out.push(copies);
      } else {
        out.push('');
      }

      if (!this.environment.isSimple) {
        out.push(", buffer = " + this.initializeBuffer());
      } else {
        out.push("");
      }

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = out;
    },

    createFunctionContext: function(asObject) {
      var locals = this.stackVars.concat(this.registers.list);

      if(locals.length > 0) {
        this.source[1] = this.source[1] + ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      if (!this.isChild) {
        for (var alias in this.context.aliases) {
          if (this.context.aliases.hasOwnProperty(alias)) {
            this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
          }
        }
      }

      if (this.source[1]) {
        this.source[1] = "var " + this.source[1].substring(2) + ";";
      }

      // Merge children
      if (!this.isChild) {
        this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
      }

      if (!this.environment.isSimple) {
        this.pushSource("return buffer;");
      }

      var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      // Perform a second pass over the output to merge content when possible
      var source = this.mergeSource();

      if (!this.isChild) {
        source = this.compilerInfo()+source;
      }

      if (asObject) {
        params.push(source);

        return Function.apply(this, params);
      } else {
        var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
        log('debug', functionSource + "\n\n");
        return functionSource;
      }
    },
    mergeSource: function() {
      // WARN: We are not handling the case where buffer is still populated as the source should
      // not have buffer append operations as their final action.
      var source = '',
          buffer;
      for (var i = 0, len = this.source.length; i < len; i++) {
        var line = this.source[i];
        if (line.appendToBuffer) {
          if (buffer) {
            buffer = buffer + '\n    + ' + line.content;
          } else {
            buffer = line.content;
          }
        } else {
          if (buffer) {
            source += 'buffer += ' + buffer + ';\n  ';
            buffer = undefined;
          }
          source += line + '\n  ';
        }
      }
      return source;
    },

    // [blockValue]
    //
    // On stack, before: hash, inverse, program, value
    // On stack, after: return value of blockHelperMissing
    //
    // The purpose of this opcode is to take a block of the form
    // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
    // replace it on the stack with the result of properly
    // invoking blockHelperMissing.
    blockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      this.replaceStack(function(current) {
        params.splice(1, 0, current);
        return "blockHelperMissing.call(" + params.join(", ") + ")";
      });
    },

    // [ambiguousBlockValue]
    //
    // On stack, before: hash, inverse, program, value
    // Compiler value, before: lastHelper=value of last found helper, if any
    // On stack, after, if no lastHelper: same as [blockValue]
    // On stack, after, if lastHelper: value
    ambiguousBlockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      var current = this.topStack();
      params.splice(1, 0, current);

      this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },

    // [appendContent]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Appends the string value of `content` to the current buffer
    appendContent: function(content) {
      if (this.pendingContent) {
        content = this.pendingContent + content;
      }
      if (this.stripNext) {
        content = content.replace(/^\s+/, '');
      }

      this.pendingContent = content;
    },

    // [strip]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Removes any trailing whitespace from the prior content node and flags
    // the next operation for stripping if it is a content node.
    strip: function() {
      if (this.pendingContent) {
        this.pendingContent = this.pendingContent.replace(/\s+$/, '');
      }
      this.stripNext = 'strip';
    },

    // [append]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Coerces `value` to a String and appends it to the current buffer.
    //
    // If `value` is truthy, or 0, it is coerced into a string and appended
    // Otherwise, the empty string is appended
    append: function() {
      // Force anything that is inlined onto the stack so we don't have duplication
      // when we examine local
      this.flushInline();
      var local = this.popStack();
      this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
      if (this.environment.isSimple) {
        this.pushSource("else { " + this.appendToBuffer("''") + " }");
      }
    },

    // [appendEscaped]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Escape `value` and append it to the buffer
    appendEscaped: function() {
      this.context.aliases.escapeExpression = 'this.escapeExpression';

      this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
    },

    // [getContext]
    //
    // On stack, before: ...
    // On stack, after: ...
    // Compiler value, after: lastContext=depth
    //
    // Set the value of the `lastContext` compiler value to the depth
    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;
      }
    },

    // [lookupOnContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext[name], ...
    //
    // Looks up the value of `name` on the current context and pushes
    // it onto the stack.
    lookupOnContext: function(name) {
      this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
    },

    // [pushContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext, ...
    //
    // Pushes the value of the current context onto the stack.
    pushContext: function() {
      this.pushStackLiteral('depth' + this.lastContext);
    },

    // [resolvePossibleLambda]
    //
    // On stack, before: value, ...
    // On stack, after: resolved value, ...
    //
    // If the `value` is a lambda, replace it on the stack by
    // the return value of the lambda
    resolvePossibleLambda: function() {
      this.context.aliases.functionType = '"function"';

      this.replaceStack(function(current) {
        return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
      });
    },

    // [lookup]
    //
    // On stack, before: value, ...
    // On stack, after: value[name], ...
    //
    // Replace the value on the stack with the result of looking
    // up `name` on `value`
    lookup: function(name) {
      this.replaceStack(function(current) {
        return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
      });
    },

    // [lookupData]
    //
    // On stack, before: ...
    // On stack, after: data, ...
    //
    // Push the data lookup operator
    lookupData: function() {
      this.pushStackLiteral('data');
    },

    // [pushStringParam]
    //
    // On stack, before: ...
    // On stack, after: string, currentContext, ...
    //
    // This opcode is designed for use in string mode, which
    // provides the string value of a parameter along with its
    // depth rather than resolving it immediately.
    pushStringParam: function(string, type) {
      this.pushStackLiteral('depth' + this.lastContext);

      this.pushString(type);

      // If it's a subexpression, the string result
      // will be pushed after this opcode.
      if (type !== 'sexpr') {
        if (typeof string === 'string') {
          this.pushString(string);
        } else {
          this.pushStackLiteral(string);
        }
      }
    },

    emptyHash: function() {
      this.pushStackLiteral('{}');

      if (this.options.stringParams) {
        this.push('{}'); // hashContexts
        this.push('{}'); // hashTypes
      }
    },
    pushHash: function() {
      if (this.hash) {
        this.hashes.push(this.hash);
      }
      this.hash = {values: [], types: [], contexts: []};
    },
    popHash: function() {
      var hash = this.hash;
      this.hash = this.hashes.pop();

      if (this.options.stringParams) {
        this.push('{' + hash.contexts.join(',') + '}');
        this.push('{' + hash.types.join(',') + '}');
      }

      this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
    },

    // [pushString]
    //
    // On stack, before: ...
    // On stack, after: quotedString(string), ...
    //
    // Push a quoted version of `string` onto the stack
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },

    // [push]
    //
    // On stack, before: ...
    // On stack, after: expr, ...
    //
    // Push an expression onto the stack
    push: function(expr) {
      this.inlineStack.push(expr);
      return expr;
    },

    // [pushLiteral]
    //
    // On stack, before: ...
    // On stack, after: value, ...
    //
    // Pushes a value onto the stack. This operation prevents
    // the compiler from creating a temporary variable to hold
    // it.
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },

    // [pushProgram]
    //
    // On stack, before: ...
    // On stack, after: program(guid), ...
    //
    // Push a program expression onto the stack. This takes
    // a compile-time guid and converts it into a runtime-accessible
    // expression.
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },

    // [invokeHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // Pops off the helper's parameters, invokes the helper,
    // and pushes the helper's return value onto the stack.
    //
    // If the helper is not found, `helperMissing` is called.
    invokeHelper: function(paramSize, name, isRoot) {
      this.context.aliases.helperMissing = 'helpers.helperMissing';
      this.useRegister('helper');

      var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');

      var lookup = 'helper = ' + helper.name + ' || ' + nonHelper;
      if (helper.paramsInit) {
        lookup += ',' + helper.paramsInit;
      }

      this.push(
        '('
          + lookup
          + ',helper '
            + '? helper.call(' + helper.callParams + ') '
            + ': helperMissing.call(' + helper.helperMissingParams + '))');

      // Always flush subexpressions. This is both to prevent the compounding size issue that
      // occurs when the code has to be duplicated for inlining and also to prevent errors
      // due to the incorrect options object being passed due to the shared register.
      if (!isRoot) {
        this.flushInline();
      }
    },

    // [invokeKnownHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // This operation is used when the helper is known to exist,
    // so a `helperMissing` fallback is not required.
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.push(helper.name + ".call(" + helper.callParams + ")");
    },

    // [invokeAmbiguous]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of disambiguation
    //
    // This operation is used when an expression like `{{foo}}`
    // is provided, but we don't know at compile-time whether it
    // is a helper or a path.
    //
    // This operation emits more code than the other options,
    // and can be avoided by passing the `knownHelpers` and
    // `knownHelpersOnly` flags at compile-time.
    invokeAmbiguous: function(name, helperCall) {
      this.context.aliases.functionType = '"function"';
      this.useRegister('helper');

      this.emptyHash();
      var helper = this.setupHelper(0, name, helperCall);

      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
      var nextStack = this.nextStack();

      if (helper.paramsInit) {
        this.pushSource(helper.paramsInit);
      }
      this.pushSource('if (helper = ' + helperName + ') { ' + nextStack + ' = helper.call(' + helper.callParams + '); }');
      this.pushSource('else { helper = ' + nonHelper + '; ' + nextStack + ' = typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper; }');
    },

    // [invokePartial]
    //
    // On stack, before: context, ...
    // On stack after: result of partial invocation
    //
    // This operation pops off a context, invokes a partial with that context,
    // and pushes the result of the invocation back.
    invokePartial: function(name) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      }

      this.context.aliases.self = "this";
      this.push("self.invokePartial(" + params.join(", ") + ")");
    },

    // [assignToHash]
    //
    // On stack, before: value, hash, ...
    // On stack, after: hash, ...
    //
    // Pops a value and hash off the stack, assigns `hash[key] = value`
    // and pushes the hash back onto the stack.
    assignToHash: function(key) {
      var value = this.popStack(),
          context,
          type;

      if (this.options.stringParams) {
        type = this.popStack();
        context = this.popStack();
      }

      var hash = this.hash;
      if (context) {
        hash.contexts.push("'" + key + "': " + context);
      }
      if (type) {
        hash.types.push("'" + key + "': " + type);
      }
      hash.values.push("'" + key + "': (" + value + ")");
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        var index = this.matchExistingProgram(child);

        if (index == null) {
          this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
          index = this.context.programs.length;
          child.index = index;
          child.name = 'program' + index;
          this.context.programs[index] = compiler.compile(child, options, this.context);
          this.context.environments[index] = child;
        } else {
          child.index = index;
          child.name = 'program' + index;
        }
      }
    },
    matchExistingProgram: function(child) {
      for (var i = 0, len = this.context.environments.length; i < len; i++) {
        var environment = this.context.environments[i];
        if (environment && environment.equals(child)) {
          return i;
        }
      }
    },

    programExpression: function(guid) {
      this.context.aliases.self = "this";

      if(guid == null) {
        return "self.noop";
      }

      var child = this.environment.children[guid],
          depths = child.depths.list, depth;

      var programParams = [child.index, child.name, "data"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("depth0"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
    },

    register: function(name, val) {
      this.useRegister(name);
      this.pushSource(name + " = " + val + ";");
    },

    useRegister: function(name) {
      if(!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },

    pushStackLiteral: function(item) {
      return this.push(new Literal(item));
    },

    pushSource: function(source) {
      if (this.pendingContent) {
        this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
        this.pendingContent = undefined;
      }

      if (source) {
        this.source.push(source);
      }
    },

    pushStack: function(item) {
      this.flushInline();

      var stack = this.incrStack();
      if (item) {
        this.pushSource(stack + " = " + item + ";");
      }
      this.compileStack.push(stack);
      return stack;
    },

    replaceStack: function(callback) {
      var prefix = '',
          inline = this.isInline(),
          stack,
          createdStack,
          usedLiteral;

      // If we are currently inline then we want to merge the inline statement into the
      // replacement statement via ','
      if (inline) {
        var top = this.popStack(true);

        if (top instanceof Literal) {
          // Literals do not need to be inlined
          stack = top.value;
          usedLiteral = true;
        } else {
          // Get or create the current stack name for use by the inline
          createdStack = !this.stackSlot;
          var name = !createdStack ? this.topStackName() : this.incrStack();

          prefix = '(' + this.push(name) + ' = ' + top + '),';
          stack = this.topStack();
        }
      } else {
        stack = this.topStack();
      }

      var item = callback.call(this, stack);

      if (inline) {
        if (!usedLiteral) {
          this.popStack();
        }
        if (createdStack) {
          this.stackSlot--;
        }
        this.push('(' + prefix + item + ')');
      } else {
        // Prevent modification of the context depth variable. Through replaceStack
        if (!/^stack/.test(stack)) {
          stack = this.nextStack();
        }

        this.pushSource(stack + " = (" + prefix + item + ");");
      }
      return stack;
    },

    nextStack: function() {
      return this.pushStack();
    },

    incrStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return this.topStackName();
    },
    topStackName: function() {
      return "stack" + this.stackSlot;
    },
    flushInline: function() {
      var inlineStack = this.inlineStack;
      if (inlineStack.length) {
        this.inlineStack = [];
        for (var i = 0, len = inlineStack.length; i < len; i++) {
          var entry = inlineStack[i];
          if (entry instanceof Literal) {
            this.compileStack.push(entry);
          } else {
            this.pushStack(entry);
          }
        }
      }
    },
    isInline: function() {
      return this.inlineStack.length;
    },

    popStack: function(wrapped) {
      var inline = this.isInline(),
          item = (inline ? this.inlineStack : this.compileStack).pop();

      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        if (!inline) {
          if (!this.stackSlot) {
            throw new Exception('Invalid stack pop');
          }
          this.stackSlot--;
        }
        return item;
      }
    },

    topStack: function(wrapped) {
      var stack = (this.isInline() ? this.inlineStack : this.compileStack),
          item = stack[stack.length - 1];

      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        return item;
      }
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
        .replace(/\u2029/g, '\\u2029') + '"';
    },

    setupHelper: function(paramSize, name, missingParams) {
      var params = [],
          paramsInit = this.setupParams(paramSize, params, missingParams);
      var foundHelper = this.nameLookup('helpers', name, 'helper');

      return {
        params: params,
        paramsInit: paramsInit,
        name: foundHelper,
        callParams: ["depth0"].concat(params).join(", "),
        helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
      };
    },

    setupOptions: function(paramSize, params) {
      var options = [], contexts = [], types = [], param, inverse, program;

      options.push("hash:" + this.popStack());

      if (this.options.stringParams) {
        options.push("hashTypes:" + this.popStack());
        options.push("hashContexts:" + this.popStack());
      }

      inverse = this.popStack();
      program = this.popStack();

      // Avoid setting fn and inverse if neither are set. This allows
      // helpers to do a check for `if (options.fn)`
      if (program || inverse) {
        if (!program) {
          this.context.aliases.self = "this";
          program = "self.noop";
        }

        if (!inverse) {
          this.context.aliases.self = "this";
          inverse = "self.noop";
        }

        options.push("inverse:" + inverse);
        options.push("fn:" + program);
      }

      for(var i=0; i<paramSize; i++) {
        param = this.popStack();
        params.push(param);

        if(this.options.stringParams) {
          types.push(this.popStack());
          contexts.push(this.popStack());
        }
      }

      if (this.options.stringParams) {
        options.push("contexts:[" + contexts.join(",") + "]");
        options.push("types:[" + types.join(",") + "]");
      }

      if(this.options.data) {
        options.push("data:data");
      }

      return options;
    },

    // the params and contexts arguments are passed in arrays
    // to fill in
    setupParams: function(paramSize, params, useRegister) {
      var options = '{' + this.setupOptions(paramSize, params).join(',') + '}';

      if (useRegister) {
        this.useRegister('options');
        params.push('options');
        return 'options=' + options;
      } else {
        params.push(options);
        return '';
      }
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
      return true;
    }
    return false;
  };

  __exports__ = JavaScriptCompiler;
  return __exports__;
})(__module2__, __module5__);

// handlebars.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var Handlebars = __dependency1__;

  // Compiler imports
  var AST = __dependency2__;
  var Parser = __dependency3__.parser;
  var parse = __dependency3__.parse;
  var Compiler = __dependency4__.Compiler;
  var compile = __dependency4__.compile;
  var precompile = __dependency4__.precompile;
  var JavaScriptCompiler = __dependency5__;

  var _create = Handlebars.create;
  var create = function() {
    var hb = _create();

    hb.compile = function(input, options) {
      return compile(input, options, hb);
    };
    hb.precompile = function (input, options) {
      return precompile(input, options, hb);
    };

    hb.AST = AST;
    hb.Compiler = Compiler;
    hb.JavaScriptCompiler = JavaScriptCompiler;
    hb.Parser = Parser;
    hb.parse = parse;

    return hb;
  };

  Handlebars = create();
  Handlebars.create = create;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module7__, __module8__, __module10__, __module11__);

  return __module0__;
})();
;/* mousetrap v1.5.2 craig.is/killing/mice */
(function(C,r,g){function t(a,b,h){a.addEventListener?a.addEventListener(b,h,!1):a.attachEvent("on"+b,h)}function x(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return l[a.which]?l[a.which]:p[a.which]?p[a.which]:String.fromCharCode(a.which).toLowerCase()}function D(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function u(a){return"shift"==a||"ctrl"==a||"alt"==a||
"meta"==a}function y(a,b){var h,c,e,g=[];h=a;"+"===h?h=["+"]:(h=h.replace(/\+{2}/g,"+plus"),h=h.split("+"));for(e=0;e<h.length;++e)c=h[e],z[c]&&(c=z[c]),b&&"keypress"!=b&&A[c]&&(c=A[c],g.push("shift")),u(c)&&g.push(c);h=c;e=b;if(!e){if(!k){k={};for(var m in l)95<m&&112>m||l.hasOwnProperty(m)&&(k[l[m]]=m)}e=k[h]?"keydown":"keypress"}"keypress"==e&&g.length&&(e="keydown");return{key:c,modifiers:g,action:e}}function B(a,b){return a===r?!1:a===b?!0:B(a.parentNode,b)}function c(a){function b(a){a=a||{};
var b=!1,n;for(n in q)a[n]?b=!0:q[n]=0;b||(v=!1)}function h(a,b,n,f,c,h){var g,e,l=[],m=n.type;if(!d._callbacks[a])return[];"keyup"==m&&u(a)&&(b=[a]);for(g=0;g<d._callbacks[a].length;++g)if(e=d._callbacks[a][g],(f||!e.seq||q[e.seq]==e.level)&&m==e.action){var k;(k="keypress"==m&&!n.metaKey&&!n.ctrlKey)||(k=e.modifiers,k=b.sort().join(",")===k.sort().join(","));k&&(k=f&&e.seq==f&&e.level==h,(!f&&e.combo==c||k)&&d._callbacks[a].splice(g,1),l.push(e))}return l}function g(a,b,n,f){d.stopCallback(b,b.target||
b.srcElement,n,f)||!1!==a(b,n)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=x(a);b&&("keyup"==a.type&&w===b?w=!1:d.handleKey(b,D(a),a))}function l(a,c,n,f){function e(c){return function(){v=c;++q[a];clearTimeout(k);k=setTimeout(b,1E3)}}function h(c){g(n,c,a);"keyup"!==f&&(w=x(c));setTimeout(b,10)}for(var d=q[a]=0;d<c.length;++d){var p=d+1===c.length?h:e(f||y(c[d+1]).action);
m(c[d],p,f,a,d)}}function m(a,b,c,f,e){d._directMap[a+":"+c]=b;a=a.replace(/\s+/g," ");var g=a.split(" ");1<g.length?l(a,g,b,c):(c=y(a,c),d._callbacks[c.key]=d._callbacks[c.key]||[],h(c.key,c.modifiers,{type:c.action},f,a,e),d._callbacks[c.key][f?"unshift":"push"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:e,combo:a}))}var d=this;a=a||r;if(!(d instanceof c))return new c(a);d.target=a;d._callbacks={};d._directMap={};var q={},k,w=!1,p=!1,v=!1;d._handleKey=function(a,c,e){var f=h(a,
c,e),d;c={};var k=0,l=!1;for(d=0;d<f.length;++d)f[d].seq&&(k=Math.max(k,f[d].level));for(d=0;d<f.length;++d)f[d].seq?f[d].level==k&&(l=!0,c[f[d].seq]=1,g(f[d].callback,e,f[d].combo,f[d].seq)):l||g(f[d].callback,e,f[d].combo);f="keypress"==e.type&&p;e.type!=v||u(a)||f||b(c);p=l&&"keydown"==e.type};d._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)m(a[d],b,c)};t(a,"keypress",e);t(a,"keydown",e);t(a,"keyup",e)}var l={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",
27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},p={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},A={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},z={option:"alt",command:"meta","return":"enter",escape:"esc",
plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},k;for(g=1;20>g;++g)l[111+g]="f"+g;for(g=0;9>=g;++g)l[g+96]=g;c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+":"+b])this._directMap[a+":"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};this._directMap={};return this};
c.prototype.stopCallback=function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")||B(b,this.target)?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.init=function(){var a=c(r),b;for(b in a)"_"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};c.init();C.Mousetrap=c;"undefined"!==typeof module&&module.exports&&(module.exports=c);"function"===
typeof define&&define.amd&&define(function(){return c})})(window,document);
;/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE8*, IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 * For IE8 (and other legacy browsers) WatchJS will use dirty checking  
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 */

"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.WatchJS = factory();
        window.watch = window.WatchJS.watch;
        window.unwatch = window.WatchJS.unwatch;
        window.callWatchers = window.WatchJS.callWatchers;
    }
}(function () {

    var WatchJS = {
        noMore: false,        // use WatchJS.suspend(obj) instead
        useDirtyCheck: false // use only dirty checking to track changes.
    },
    lengthsubjects = [];
    
    var dirtyChecklist = [];
    var pendingChanges = []; // used coalesce changes from defineProperty and __defineSetter__
    
    var supportDefineProperty = false;
    try {
        supportDefineProperty = Object.defineProperty && Object.defineProperty({},'x', {});
    } catch(ex) {  /* not supported */  }

    var isFunction = function (functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
    };

    var isInt = function (x) {
        return x % 1 === 0;
    };

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var isObject = function(obj) {
        return {}.toString.apply(obj) === '[object Object]';
    };
    
    var getObjDiff = function(a, b){
        var aplus = [],
        bplus = [];

        if(!(typeof a == "string") && !(typeof b == "string")){

            if (isArray(a)) {
                for (var i=0; i<a.length; i++) {
                    if (b[i] === undefined) aplus.push(i);
                }
            } else {
                for(var i in a){
                    if (a.hasOwnProperty(i)) {
                        if(b[i] === undefined) {
                            aplus.push(i);
                        }
                    }
                }
            }

            if (isArray(b)) {
                for (var j=0; j<b.length; j++) {
                    if (a[j] === undefined) bplus.push(j);
                }
            } else {
                for(var j in b){
                    if (b.hasOwnProperty(j)) {
                        if(a[j] === undefined) {
                            bplus.push(j);
                        }
                    }
                }
            }
        }

        return {
            added: aplus,
            removed: bplus
        }
    };

    var clone = function(obj){

        if (null == obj || "object" != typeof obj) {
            return obj;
        }

        var copy = obj.constructor();

        for (var attr in obj) {
            copy[attr] = obj[attr];
        }

        return copy;        

    }

    var defineGetAndSet = function (obj, propName, getter, setter) {
        try {
            Object.observe(obj, function(changes) {
                changes.forEach(function(change) {
                    if (change.name === propName) {
                        setter(change.object[change.name]);
                    }
                });
            });            
        } 
        catch(e) {
            try {
                Object.defineProperty(obj, propName, {
                    get: getter,
                    set: function(value) {        
                        setter.call(this,value,true); // coalesce changes
                    },
                    enumerable: true,
                    configurable: true
                });
            } 
            catch(e2) {
                try{
                    Object.prototype.__defineGetter__.call(obj, propName, getter);
                    Object.prototype.__defineSetter__.call(obj, propName, function(value) {
                        setter.call(this,value,true); // coalesce changes
                    });
                } 
                catch(e3) {
                    observeDirtyChanges(obj,propName,setter);
                    //throw new Error("watchJS error: browser not supported :/")
                }
            }
        }
    };

    var defineProp = function (obj, propName, value) {
        try {
            Object.defineProperty(obj, propName, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: value
            });
        } catch(error) {
            obj[propName] = value;
        }
    };

    var observeDirtyChanges = function(obj,propName,setter) {
        dirtyChecklist[dirtyChecklist.length] = {
            prop:       propName,
            object:     obj,
            orig:       clone(obj[propName]),
            callback:   setter
        }        
    }
    
    var watch = function () {

        if (isFunction(arguments[1])) {
            watchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            watchMany.apply(this, arguments);
        } else {
            watchOne.apply(this, arguments);
        }

    };


    var watchAll = function (obj, watcher, level, addNRemove) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        if(isArray(obj)) {
            defineWatcher(obj, "__watchall__", watcher, level); // watch all changes on the array
            if (level===undefined||level > 0) {
                for (var prop = 0; prop < obj.length; prop++) { // watch objects in array
                   watchAll(obj[prop],watcher,level, addNRemove);
                }
            }
        } 
        else {
            var prop,props = [];
            for (prop in obj) { //for each attribute if obj is an object
                if (prop == "$val" || (!supportDefineProperty && prop === 'watchers')) {
                    continue;
                }

                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    props.push(prop); //put in the props
                }
            }
            watchMany(obj, props, watcher, level, addNRemove); //watch all items of the props
        }


        if (addNRemove) {
            pushToLengthSubjects(obj, "$$watchlengthsubjectroot", watcher, level);
        }
    };


    var watchMany = function (obj, props, watcher, level, addNRemove) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        for (var i=0; i<props.length; i++) { //watch each property
            var prop = props[i];
            watchOne(obj, prop, watcher, level, addNRemove);
        }

    };

    var watchOne = function (obj, prop, watcher, level, addNRemove) {
        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        if(isFunction(obj[prop])) { //dont watch if it is a function
            return;
        }
        if(obj[prop] != null && (level === undefined || level > 0)){
            watchAll(obj[prop], watcher, level!==undefined? level-1 : level); //recursively watch all attributes of this
        }

        defineWatcher(obj, prop, watcher, level);

        if(addNRemove && (level === undefined || level > 0)){
            pushToLengthSubjects(obj, prop, watcher, level);
        }

    };

    var unwatch = function () {

        if (isFunction(arguments[1])) {
            unwatchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            unwatchMany.apply(this, arguments);
        } else {
            unwatchOne.apply(this, arguments);
        }

    };

    var unwatchAll = function (obj, watcher) {

        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        if (isArray(obj)) {
            var props = ['__watchall__'];
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                props.push(prop); //put in the props
            }
            unwatchMany(obj, props, watcher); //watch all itens of the props
        } else {
            var unwatchPropsInObject = function (obj2) {
                var props = [];
                for (var prop2 in obj2) { //for each attribute if obj is an object
                    if (obj2.hasOwnProperty(prop2)) {
                        if (obj2[prop2] instanceof Object) {
                            unwatchPropsInObject(obj2[prop2]); //recurs into object props
                        } else {
                            props.push(prop2); //put in the props
                        }
                    }
                }
                unwatchMany(obj2, props, watcher); //unwatch all of the props
            };
            unwatchPropsInObject(obj);
        }
    };


    var unwatchMany = function (obj, props, watcher) {

        for (var prop2 in props) { //watch each attribute of "props" if is an object
            if (props.hasOwnProperty(prop2)) {
                unwatchOne(obj, props[prop2], watcher);
            }
        }
    };

    var timeouts = [],
        timerID = null;
    function clearTimerID() {
        timerID = null;
        for(var i=0; i< timeouts.length; i++) {
            timeouts[i]();
        }
        timeouts.length = 0;
    }
    var getTimerID= function () {
        if (!timerID)  {
            timerID = setTimeout(clearTimerID);
        }
        return timerID;
    }
    var registerTimeout = function(fn) { // register function to be called on timeout
        if (timerID==null) getTimerID();
        timeouts[timeouts.length] = fn;
    }
    
    // Track changes made to an array, object or an object's property 
    // and invoke callback with a single change object containing type, value, oldvalue and array splices
    // Syntax: 
    //      trackChange(obj, callback, recursive, addNRemove)
    //      trackChange(obj, prop, callback, recursive, addNRemove)
    var trackChange = function() {
        var fn = (isFunction(arguments[2])) ? trackProperty : trackObject ;
        fn.apply(this,arguments);
    }

    // track changes made to an object and invoke callback with a single change object containing type, value and array splices
    var trackObject= function(obj, callback, recursive, addNRemove) {
        var change = null,lastTimerID = -1;
        var isArr = isArray(obj);
        var level,fn = function(prop, action, newValue, oldValue) {
            var timerID = getTimerID();
            if (lastTimerID!==timerID) { // check if timer has changed since last update
                lastTimerID = timerID;
                change = {
                    type: 'update'
                }
                change['value'] = obj;
                change['splices'] = null;
                registerTimeout(function() {
                    callback.call(this,change);
                    change = null;
                });
            }
            // create splices for array changes
            if (isArr && obj === this && change !== null)  {                
                if (action==='pop'||action==='shift') {
                    newValue = [];
                    oldValue = [oldValue];
                }
                else if (action==='push'||action==='unshift') {
                    newValue = [newValue];
                    oldValue = [];
                }
                else if (action!=='splice') { 
                    return; // return here - for reverse and sort operations we don't need to return splices. a simple update will do
                }
                if (!change.splices) change.splices = [];
                change.splices[change.splices.length] = {
                    index: prop,
                    deleteCount: oldValue ? oldValue.length : 0,
                    addedCount: newValue ? newValue.length : 0,
                    added: newValue,
                    deleted: oldValue
                };
            }

        }  
        level = (recursive==true) ? undefined : 0;        
        watchAll(obj,fn, level, addNRemove);
    }
    
    // track changes made to the property of an object and invoke callback with a single change object containing type, value, oldvalue and splices
    var trackProperty = function(obj,prop,callback,recursive, addNRemove) { 
        if (obj && prop) {
            watchOne(obj,prop,function(prop, action, newvalue, oldvalue) {
                var change = {
                    type: 'update'
                }
                change['value'] = newvalue;
                change['oldvalue'] = oldvalue;
                if (recursive && isObject(newvalue)||isArray(newvalue)) {
                    trackObject(newvalue,callback,recursive, addNRemove);
                }               
                callback.call(this,change);
            },0)
            
            if (recursive && isObject(obj[prop])||isArray(obj[prop])) {
                trackObject(obj[prop],callback,recursive, addNRemove);
            }                           
        }
    }
    
    
    var defineWatcher = function (obj, prop, watcher, level) {
        var newWatcher = false;
        var isArr = isArray(obj);
        
        if (!obj.watchers) {
            defineProp(obj, "watchers", {});
            if (isArr) {
                // watch array functions
                watchFunctions(obj, function(index,action,newValue, oldValue) {
                    addPendingChange(obj, index, action,newValue, oldValue);
                    if (level !== 0 && newValue && (isObject(newValue) || isArray(newValue))) {
                        var i,n, ln, wAll, watchList = obj.watchers[prop];
                        if ((wAll = obj.watchers['__watchall__'])) {
                            watchList = watchList ? watchList.concat(wAll) : wAll;
                        }
                        ln = watchList ?  watchList.length : 0;
                        for (i = 0; i<ln; i++) {
                            if (action!=='splice') {
                                watchAll(newValue, watchList[i], (level===undefined)?level:level-1);
                            }
                            else {
                                // watch spliced values
                                for(n=0; n < newValue.length; n++) {
                                    watchAll(newValue[n], watchList[i], (level===undefined)?level:level-1);
                                }
                            }
                        }
                    }
                });
            }
        }

        if (!obj.watchers[prop]) {
            obj.watchers[prop] = [];
            if (!isArr) newWatcher = true;
        }

        for (var i=0; i<obj.watchers[prop].length; i++) {
            if(obj.watchers[prop][i] === watcher){
                return;
            }
        }

        obj.watchers[prop].push(watcher); //add the new watcher to the watchers array

        if (newWatcher) {
            var val = obj[prop];            
            var getter = function () {
                return val;                        
            };

            var setter = function (newval, delayWatcher) {
                var oldval = val;
                val = newval;                
                if (level !== 0 
                    && obj[prop] && (isObject(obj[prop]) || isArray(obj[prop]))
                    && !obj[prop].watchers) {
                    // watch sub properties
                    var i,ln = obj.watchers[prop].length; 
                    for(i=0; i<ln; i++) {
                        watchAll(obj[prop], obj.watchers[prop][i], (level===undefined)?level:level-1);
                    }
                }

                //watchFunctions(obj, prop);
                
                if (isSuspended(obj, prop)) {
                    resume(obj, prop);
                    return;
                }

                if (!WatchJS.noMore){ // this does not work with Object.observe
                    //if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                    if (oldval !== newval) {
                        if (!delayWatcher) {
                            callWatchers(obj, prop, "set", newval, oldval);
                        }
                        else {
                            addPendingChange(obj, prop, "set", newval, oldval);
                        }
                        WatchJS.noMore = false;
                    }
                }
            };

            if (WatchJS.useDirtyCheck) {
                observeDirtyChanges(obj,prop,setter);
            }
            else {
                defineGetAndSet(obj, prop, getter, setter);
            }
        }

    };

    var callWatchers = function (obj, prop, action, newval, oldval) {
        if (prop !== undefined) {
            var ln, wl, watchList = obj.watchers[prop];
            if ((wl = obj.watchers['__watchall__'])) {
                watchList = watchList ? watchList.concat(wl) : wl;
            }
            ln = watchList ? watchList.length : 0;
            for (var wr=0; wr< ln; wr++) {
                watchList[wr].call(obj, prop, action, newval, oldval);
            }
        } else {
            for (var prop in obj) {//call all
                if (obj.hasOwnProperty(prop)) {
                    callWatchers(obj, prop, action, newval, oldval);
                }
            }
        }
    };

    var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift', 'splice'];
    var defineArrayMethodWatcher = function (obj, original, methodName, callback) {
        defineProp(obj, methodName, function () {
            var index = 0;
            var i,newValue, oldValue, response;                        
            // get values before splicing array 
            if (methodName === 'splice') {
               var start = arguments[0];
               var end = start + arguments[1];
               oldValue = obj.slice(start,end);
               newValue = [];
               for(i=2;i<arguments.length;i++) {
                   newValue[i-2] = arguments[i];
               }
               index = start;
            } 
            else {
                newValue = arguments.length > 0 ? arguments[0] : undefined;
            } 

            response = original.apply(obj, arguments);
            if (methodName !== 'slice') {
                if (methodName === 'pop') {
                    oldValue = response;
                    index = obj.length;
                }
                else if (methodName === 'push') {
                    index = obj.length-1;
                }
                else if (methodName === 'shift') {
                    oldValue = response;
                }
                else if (methodName !== 'unshift' && newValue===undefined) {
                    newValue = response;
                }
                callback.call(obj, index, methodName,newValue, oldValue)
            }
            return response;
        });
    };

    var watchFunctions = function(obj, callback) {

        if (!isFunction(callback) || !obj || (obj instanceof String) || (!isArray(obj))) {
            return;
        }

        for (var i = methodNames.length, methodName; i--;) {
            methodName = methodNames[i];
            defineArrayMethodWatcher(obj, obj[methodName], methodName, callback);
        }

    };

    var unwatchOne = function (obj, prop, watcher) {
        if (obj.watchers[prop]) {
            if (watcher===undefined) {
                delete obj.watchers[prop]; // remove all property watchers
            }
            else {
                for (var i=0; i<obj.watchers[prop].length; i++) {
                    var w = obj.watchers[prop][i];
    
                    if (w == watcher) {
                        obj.watchers[prop].splice(i, 1);
                    }
                }
            }
        }
        removeFromLengthSubjects(obj, prop, watcher);
        removeFromDirtyChecklist(obj, prop);
    };
    
    // suspend watchers until next update cycle
    var suspend = function(obj, prop) {
        if (obj.watchers) {
            var name = '__wjs_suspend__'+(prop!==undefined ? prop : '');
            obj.watchers[name] = true;
        }
    }
    
    var isSuspended = function(obj, prop) {
        return obj.watchers 
               && (obj.watchers['__wjs_suspend__'] || 
                   obj.watchers['__wjs_suspend__'+prop]);
    }
    
    // resumes preivously suspended watchers
    var resume = function(obj, prop) {
        registerTimeout(function() {
            delete obj.watchers['__wjs_suspend__'];
            delete obj.watchers['__wjs_suspend__'+prop];
        })
    }

    var pendingTimerID = null;
    var addPendingChange = function(obj,prop, mode, newval, oldval) {
        pendingChanges[pendingChanges.length] = {
            obj:obj,
            prop: prop,
            mode: mode,
            newval: newval,
            oldval: oldval
        };
        if (pendingTimerID===null) {
            pendingTimerID = setTimeout(applyPendingChanges);
        }
    };
    
    
    var applyPendingChanges = function()  {
        // apply pending changes
        var change = null;
        pendingTimerID = null;
        for(var i=0;i < pendingChanges.length;i++) {
            change = pendingChanges[i];
            callWatchers(change.obj, change.prop, change.mode, change.newval, change.oldval);
        }
        if (change) {
            pendingChanges = [];
            change = null;
        }        
    }

    var loop = function(){

        // check for new or deleted props
        for(var i=0; i<lengthsubjects.length; i++) {

            var subj = lengthsubjects[i];

            if (subj.prop === "$$watchlengthsubjectroot") {

                var difference = getObjDiff(subj.obj, subj.actual);

                if(difference.added.length || difference.removed.length){
                    if(difference.added.length){
                        watchMany(subj.obj, difference.added, subj.watcher, subj.level - 1, true);
                    }

                    subj.watcher.call(subj.obj, "root", "differentattr", difference, subj.actual);
                }
                subj.actual = clone(subj.obj);


            } else {

                var difference = getObjDiff(subj.obj[subj.prop], subj.actual);

                if(difference.added.length || difference.removed.length){
                    if(difference.added.length){
                        for (var j=0; j<subj.obj.watchers[subj.prop].length; j++) {
                            watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
                        }
                    }

                    callWatchers(subj.obj, subj.prop, "differentattr", difference, subj.actual);
                }

                subj.actual = clone(subj.obj[subj.prop]);

            }

        }
        
        // start dirty check
        var n, value;
        if (dirtyChecklist.length > 0) {
            for (var i = 0; i < dirtyChecklist.length; i++) {
                n = dirtyChecklist[i];
                value = n.object[n.prop];
                if (!compareValues(n.orig, value)) {
                    n.orig = clone(value);
                    n.callback(value);
                }
            }
        }

    };

    var compareValues =  function(a,b) {
        var i, state = true;
        if (a!==b)  {
            if (isObject(a)) {
                for(i in a) {
                    if (!supportDefineProperty && i==='watchers') continue;
                    if (a[i]!==b[i]) {
                        state = false;
                        break;
                    };
                }
            }
            else {
                state = false;
            }
        }
        return state;
    }
    
    var pushToLengthSubjects = function(obj, prop, watcher, level){

        var actual;

        if (prop === "$$watchlengthsubjectroot") {
            actual =  clone(obj);
        } else {
            actual = clone(obj[prop]);
        }

        lengthsubjects.push({
            obj: obj,
            prop: prop,
            actual: actual,
            watcher: watcher,
            level: level
        });
    };

    var removeFromLengthSubjects = function(obj, prop, watcher){

        for (var i=0; i<lengthsubjects.length; i++) {
            var subj = lengthsubjects[i];

            if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                lengthsubjects.splice(i, 1);
            }
        }

    };
    
    var removeFromDirtyChecklist = function(obj, prop){
        var notInUse;
        for (var i=0; i<dirtyChecklist.length; i++) {
            var n = dirtyChecklist[i];
            var watchers = n.object.watchers;
            notInUse = (
                n.object == obj 
                && n.prop == prop 
                && watchers
                && ( !watchers[prop] || watchers[prop].length == 0 )
            );
            if (notInUse)  {
                dirtyChecklist.splice(i, 1);
            }
        }

    };    

    setInterval(loop, 50);

    WatchJS.watch = watch;
    WatchJS.unwatch = unwatch;
    WatchJS.callWatchers = callWatchers;
    WatchJS.suspend = suspend; // suspend watchers    
    WatchJS.onChange = trackChange;  // track changes made to object or  it's property and return a single change object

    return WatchJS;

}));
;/* ************************************************************************

    License: MIT Licence

    Description:
        Main AppStorm.JS functionality, create some needed system to help plugin or user

************************************************************************ */

/*!
 * @private
*/
;


/*
 * Bind AppStorm.JS to lodash.
 * Note: in node module, we need to deep clone it (does not seems to be
 * needed for chrome/firefox/others version)
*/
window.appstorm = window.a = _.cloneDeep(_.noConflict());

/**
 * The core url (for vendor loading)
 *
 * @property url
 * @type String
*/
a.url = '';

/**
 * Change the function initial scope for given one
 *
 * @method scope
 *
 * @param fct {Function}                    The function to bind scope
 * @param scope {Object}                    The object scope to link
 * @return {Function}                       Intermediate function with scope
 *                                          binding
*/
a.scope = function(fct, scope) {
    return function() {
        return fct.apply(scope, arguments);
    };
};

/**
 * Get the existing stack trace
 *
 * @method getStackTrace
 *
 * @return {String}                         Stack trace
*/
a.getStackTrace = function() {
    var err = new Error();
    return err.stack;
};

/**
 * Test if the element is null or undefined
 *
 * @method isNone
 *
 * @param obj {Object}                      The element to test
 * @return {Boolean}                        True if element is null/undefined
 *                                          False in other cases
*/
a.isNone = function(obj) {
    return (a.isNull(obj) || a.isUndefined(obj));
};


/**
 * Test if the element is a non-null object type
 *
 * @method isTrueObject
 *
 * @param obj {Object}                      The element to test
 * @return {Boolean}                        True if it's an object, false if
 *                                          it's a null value, or not an object
*/
a.isTrueObject = function(obj) {
    return (typeof(obj) == 'object' && !a.isNone(obj));
};


/**
 * Allow trimming string value
 *
 * @method trim
 *
 * @param str {String}                      The value to trim
 * @return {String}                         The trimmed value
*/
a.trim = function(str) {
    // We allow both native and custom trim
    if (!String.prototype.trim) {
        return str.replace(/^\s+|\s+$/g, '');
    } else {
        return str.trim();
    }
};


/**
 * Make the first letter of given string, uppercase.
 *
 * @method firstLetterUpperCase
 *
 * @param str {String}                      The string to apply transformation
 * @param prefix {String}                   A prefix to apply aftre transform
 * @return {String}                         The string with first letter in
 *                                          uppercase
*/
a.firstLetterUppercase = function(str, prefix) {
    prefix = prefix || '';
    return prefix + str.charAt(0).toUpperCase() + str.slice(1);
};


/**
* Create a deep copy (used internally)
* FROM : http://www.xenoveritas.org/blog/xeno/the-correct-way-to-clone-javascript-arrays
* Credits to them ! Little bug corrected :p
*
* @method clone
*
* @param obj {Object}                       A state object
* @return {Object}                          A new state object
*/
a.deepClone = function(obj) {
    // The deep clone only take care of object, and not function
    if (a.isTrueObject(obj) && !a.isFunction(obj)) {
        // Array cloning
        if(a.isArray(obj)) {
            var l = obj.length,
                y = new Array(l);
            for(var i = 0; i < l; ++i) {
                y[i] = a.deepClone(obj[i]);
            }
            return y;

        // Object cloning
        } else {
            var r = {};
            if(a.isFunction(obj.constructor)) {
                r = new obj.constructor();
            }
            // Bug : json object does not have prototype
            if(a.isTrueObject(obj.prototype)) {
                r.prototype = obj.prototype;
            }
            for(var k in obj) {
                r[k] = a.deepClone(obj[k]);
            }
            return r;
        }
    }
    return obj;
};


/**
 * Get the difference between objects.
 *
 * @method
 *
 * @param obj1 {Object}                     The object initial to retrieve
 *                                          difference from
 * @param obj2 {Object}                     The second object to check
 *                                          difference from
 * @return {Object}                         The result-free object
*/
a.differenceObject = function(obj1, obj2) {
    var keys = a.difference(a.keys(obj1), a.keys(obj2)),
        result = {};

    a.each(keys, function(key) {
        result[key] = this[key];
    }, obj1);

    return result;
};


/**
 * Extend an object with child properties (underscore.js like)
 *
 * @method extend
 *
 * @param object {Object}                   The element to extend with other
 *                                          properties
 * @param source {Object}                   The source object to take
 *                                          properties from
 * @return {Object}                         A combined object
*/
a.extend = function(object, source, guard) {
    if (!object) {
        return object;
    }
    var args = arguments,
        argsIndex = 0,
        argsLength = args.length,
        type = typeof guard;

    if ((type == 'number' || type == 'string') && args[3] &&
            args[3][guard] === source) {
        argsLength = 2;
    }
    while (++argsIndex < argsLength) {
        source = args[argsIndex];
        if (source) {
            for (var key in source) {
                object[key] = source[key];
            }
        }
    }
    return object;
};

/**
 * Alias for Watch.JS
 *
 * @method watch
 * @see https://github.com/melanke/Watch.JS/
 *
 * @param                                   See Watch.JS documentation
*/
a.watch = function() {
    WatchJS.watch.apply(this, arguments);
};

/**
 * Alias for Watch.JS
 *
 * @method unwatch
 * @see https://github.com/melanke/Watch.JS/
 *
 * @param                                   See Watch.JS documentation
*/
a.unwatch = function() {
    WatchJS.unwatch.apply(this, arguments);
};

/**
 * Define the default ajax options to send on every request.
 * At any time, by providing good options, you can override this content
 * on a single ajax request.
 *
 * @method setDefaultAjaxOptions
 *
 * @param options {Object}                  The default options to set
*/
a.setDefaultAjaxOptions = function(options) {
    if(a.isTrueObject(options)) {
        a.mem.set('app.ajax.default', options);
    }
};

/**
 * Get the default ajax options currently stored
 * (and used by every ajax request)
 *
 * @method getDefaultAjaxOptions
 *
 * @return {Object}                         The default ajax options setted
*/
a.getDefaultAjaxOptions = function() {
    return a.mem.get('app.ajax.default') || {};
};

/**
 * Define an ajax template to use for the given request
 *
 * @method setTemplateAjaxOptions
 *
 * @param name {String}                     The template name to define
 * @param options {Object}                  The options linked to template
*/
a.setTemplateAjaxOptions = function(name, options) {
    if(name && a.isTrueObject(options)) {
        a.mem.set('app.ajax.template.' + name, options);
    }
};

/**
 * Get an existing template rearding it's name
 *
 * @method getTemplateAjaxOptions
 *
 * @param name {String}                     The template name to retrieve
 * @return {Object | null}                  The resulting object content
*/
a.getTemplateAjaxOptions = function(name) {
    return a.mem.get('app.ajax.template.' + name);
};

/**
 * Set a before action to perform on every ajax request using it
 *
 * @method setAjaxBefore
 *
 * @param name {String}                     The name to use for recall
 * @param fct {Function | null}             The linked function to use
*/
a.setAjaxBefore = function(name, fct) {
    if(name && a.isFunction(fct)) {
        a.mem.set('app.ajax.before.' + name, fct);
    }
};

/**
 * Get an existing ajax before function, or null if nothing is found
 *
 * @method getAjaxBefore
 *
 * @param name {String}                     The name previously stored using
 *                                          setAjaxBefore
 * @return {Function | null}                The function if found, null in
 *                                          other cases
*/
a.getAjaxBefore = function(name) {
    return a.mem.get('app.ajax.before.' + name) || null;
};

/**
 * Set an after action to perform on every ajax request using it
 *
 * @method setAjaxAfter
 *
 * @param name {String}                     The name to use for recall
 * @param fct {Function | null}             The linked function to use
*/
a.setAjaxAfter = function(name, fct) {
    if(name && a.isFunction(fct)) {
        a.mem.set('app.ajax.after.' + name, fct);
    }
};

/**
 * Get an existing ajax after function, or null if nothing is found
 *
 * @method getAjaxAfter
 *
 * @param name {String}                     The name previously stored using
 *                                          setAjaxAfter
 * @return {Function | null}                The function if found, null in
 *                                          other cases
*/
a.getAjaxAfter = function(name) {
    return a.mem.get('app.ajax.after.' + name) || null;
};

/*
 * Check AppStorm.JS source url
*/
(function() {
    // Detecting base url of AppStorm.JS
    var me = document.getElementById('a-core');
    if(me && !a.isNone(me.src)) {
        a.url = me.src.replace(new RegExp('/[^/]*$'), '/');
    }
}());


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // From: http://blog.teamtreehouse.com/handlebars-js-part-3-tips-and-tricks
    Handlebars.registerHelper('debug', function(optionalValue) {
        a.console.log('===== CONTEXT ======');
        a.console.log(this);
     
        if(!a.isUndefined(optionalValue)) {
            a.console.log('====== VALUE =======');
            a.console.log(optionalValue);
        }
    });

    // Try to count elements
    Handlebars.registerHelper('count', function(value) {
        a.console.log('=== DEBUG COUNT ====');
        if(a.isUndefined(value.length)) {
            a.console.log('Length is not defined for value');
            a.console.log(value);
        } else {
            a.console.log(value.length);
        }
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide easy store object, with global prefix value system on top of it

************************************************************************ */


/**
 * Provide easy store object, with global prefix value system on top of it.
 *
 * @constructor
*/
a.mem = (function() {
    var store = {};

    /**
     * Sanitize a key to generate a 'usable' key.
     *
     * @private
     *
     * @param {String} key                  The key string to sanitize
     * @return {String}                     The key sanitize
    */
    function sanitizeKey(key) {
        if(!a.isString(key)) {
            return null;
        }

        // remove all whitespace
        key = key.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
                 .replace(/\s+/g, ' ');

        // Sanitize double .. and replace by '.'
        while(key.indexOf('..') >= 0) {
            key = key.replace(/(\.\.)/g, '.');
        }

        // Remove '.' at the beginning and at the end
        if(key.charAt(0) == '.') {
            key = key.substring(1);
        }
        if(key.charAt(key.length - 1) == '.') {
            key = key.substr(0, key.length - 1);
        }
        return key;
    }

    /**
     * Get a stored element.
     *
     * @private
     *
     * @param {String} key                  The key to retrieve value from
     * @return {Object | Null}              null in case of not found, and
     *                                      the stored value if found
    */
    function getFromStore(key) {
        key = sanitizeKey(key);
        if(key) {
            var result = store[key];
            if(!a.isUndefined(result)) {
                return result;
            }
        }
        return null;
    }

    /**
     * Get the full stored elements.
     *
     * @private
     *
     * @param {String} prefix               The prefix to use as 'search from
     *                                      that point'
     * @return {Object}                     A key value object with all values
     *                                      found matching prefix
    */
    function listFromStore(prefix) {
        var key = sanitizeKey(prefix);
        if(!key) {
            return store;
        } else {
            var partialStore = {};
            a.each(store, function(value, index) {
                if(index.indexOf(key) === 0) {
                    // We remove the prefix stored
                    var parsedIndex = index.substring(key.length + 1);
                    partialStore[parsedIndex] = value;
                }
            });
            return partialStore;
        }
    }

    /**
     * Store a new element, or erase a previous element.
     *
     * @private
     *
     * @param {String} key                  The key to set value linked to
     * @param {Object} value                The value to associate to key
    */
    function setToStore(key, value) {
        key = sanitizeKey(key);
        if(key) {
            store[key] = value;
        }
    }

    /**
     * Remove an element from store.
     *
     * @private
     *
     * @param {String} key                  The key to erase from store
    */
    function removeFromStore(key) {
        key = sanitizeKey(key);
        delete store[key];
    }


    /**
     * Clear the full store.
     *
     * @private
     *
     * @param {String} prefix               The prefix to clear.
    */
    function clearStore(prefix) {
        for(var key in store) {
            if(key.indexOf(prefix) === 0) {
                delete store[key];
            }
        }
    }


    /**
     * Generic object to derivate from prefix element.
     *
     * @private
     *
     * @param {String} prefix               The prefix
    */
    var genericObject = function(prefix) {
        this.prefix = prefix;
    };

    // Create the default prototype instance
    genericObject.prototype = {
        /**
         * Get a stored element.
         *
         * @param {String} key              The key to retrieve value from
         * @return {Object | Null}          null in case of not found, and
         *                                  the stored value if found
        */
        get: function(key) {
            return getFromStore(this.prefix + '.' + key);
        },

        /**
         * Get the full currently stored elements.
         *
         * @return {Object}                  An object of all currently stored
         *                                   elements
        */
        list: function() {
            return listFromStore(this.prefix);
        },

        /**
         * Store a new element, or erase a previous element.
         *
         * @param {String} key              The key to set value linked to
         * @param {Object} value            The value to associate to key
        */
        set: function(key, value) {
            setToStore(this.prefix + '.' + key, value);
        },

        /**
         * Remove an element from store.
         *
         * @param {String} key              The key to erase from store
        */
        remove: function(key) {
            removeFromStore(this.prefix + '.' + key);
        },

        /**
         * Clear everything stored inside store.
        */
        clear: function() {
            // Must be a string not empty...
            if(this.prefix) {
                clearStore(this.prefix);
            }
        }
        /*!
         * @private
        */
    };

    var defaultInstance = new genericObject('');

    /**
     * Retrieve a custom mem object to manipulate from root prefix.
     *
     * @param {String} prefix               The prefix to use as base
     * @return {Object}                     An instance ready to use
    */
    defaultInstance.getInstance = function(prefix) {
        return new genericObject(prefix);
    };
    /*!
     * @private
    */

    // return the custom object
    return defaultInstance;
})();


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Get mem elements
    Handlebars.registerHelper('mem', function(value) {
        return new Handlebars.SafeString(a.mem.get(value));
    });
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Environment functionnality, to get access to some basic
        'main options' for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some global
 * rules for managing global environment variable. Use the a.mem object
 * for others type of variables.
*/
a.environment = a.mem.getInstance('app.environment');

// Default data

// The application state, debug/production
a.environment.set('app.debug', false);
// The console verbosity (from 1 to 3, 3 most verbose, 1 less verbose)
a.environment.set('console.verbose', 2);
// The console minimum log level (from log to error)
a.environment.set('console.minimum', 'log');
// The ajax cache system
a.environment.set('ajax.cache', false);

// The application url
if(a.isString(a.url) && a.url.length > 0) {
    a.mem.set('app.url', a.url);
}

/*!
------------------------------
  BROWSER HELPERS
------------------------------
*/
(function() {
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Chrome 1+
    var isChrome = !!window.chrome && !isOpera;
    // At least IE6
    var isIE = (document.all && !isChrome && !isOpera && !isSafari && !isFirefox) || !!document.documentMode;

    var browser = 'other';
    if (isOpera) {
        browser = 'opera';
    } else if (isFirefox) {
        browser = 'firefox';
    } else if (isSafari) {
        browser = 'safari';
    } else if (isChrome) {
        browser = 'chrome';
    } else if (isIE) {
        browser = 'ie';
    }

    a.environment.set('browser', browser);
})();

/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('environment', function(value) {
    return new Handlebars.SafeString(a.environment.get(value));
});;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Debugger functionnality including nested group system like console
        usually provide

************************************************************************ */

(function (win, a) {
    'use strict';

    /**
     * Test if browser support or not the CSS in console.
     *
     * @private
     *
     * @param {String} browser              The browser name (firefox, ...)
     * @return                              True it does support, false it
     *                                      does not support...
    */
    function testBrowserSupportCSS(browser) {
        // TODO: Maybe too simple test...
        // IE does not support it...
        return (browser === 'opera' || browser === 'firefox' ||
                browser === 'chrome');
    }

    // We can have only one element printing at a time.
    // This variable is a kind of lock for this.
    var concurrentConsoleAccess = false,
        browser = a.environment.get('browser'),
        cssSupport = testBrowserSupportCSS(browser),
        // Used only when system does not support groupCollapsed/group system
        // in console
        indent = 0;

    if (win.console) {
        if (!a.isFunction(win.console.groupCollapsed)) {
            win.console.groupCollapsed = function() {
                win.console.log(arguments);
                indent += 1;
            };
        }

        if (!a.isFunction(win.console.group)) {
            win.console.group = function() {
                win.console.log(arguments);
                indent += 1;
            };
        }

        if (!a.isFunction(win.console.groupEnd)) {
            win.console.groupEnd = function() {
                indent -= 1;
            };
        }
    }

    /*!
     * Regex used for markdown parsing.
     *
     * Strongly inspired by: https://github.com/adamschwartz/log
     * All credit goes to him !!!!!
    */
    var formats = [{
        regex: /\*\*([^\*]+)\*\*/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['font-weight: bold', ''];
         }
    }, {
        regex: /\_\_([^\_]+)\_\_/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['font-style: italic', ''];
        }
    }, {
        regex: /\`\`\`([^\`]+)\`\`\`/,
        replacer: function(m, p1) {
            return cssSupport ? '%c' + p1 + '%c' : p1;
        },
        styles: function() {
            return ['background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)', ''];
        }
    }, {
        regex: /\[c\=(?:\"|\')?((?:(?!(?:\"|\')\]).)*)(?:\"|\')?\]((?:(?!\[c\]).)*)\[c\]/,
        replacer: function(m, p1, p2) {
            return cssSupport ? '%c' + p2 + '%c' : p2;
        },
        styles: function(match) {
            return [match[1], ''];
        }
    }];


    /**
     * Detect if there is some markdown to parse...
     * @see https://github.com/adamschwartz/log
     *
     * @private
     *
     * @param {String} str                  The string to search markdown in
     * @return {Boolean}                    True, markdown exist, false not.
    */
    function hasMarkdownMatches(str) {
        var has = false;

        for (var i = 0, l = formats.length; i < l && !has; ++i) {
            if (formats[i].regex.test(str)) {
                has = true;
            }
        }

        return has;
    }

    /**
     * Get ordered matches for every markdown existing.
     * @see https://github.com/adamschwartz/log
     *
     * @private
     *
     * @param {String} str                  The string to markdown
     * @return {Array}                      The matches found
    */
    function getOrderedMarkdownMatches(str) {
        var matches = [];

        // Testing
        a.each(formats, function(format) {
            var match = str.match(format.regex);
            if (match) {
                matches.push({
                    format: format,
                    match: match
                });
            }
        });


        // Sorting
        matches = a.sortBy(matches, function(entry) {
            return entry.match.index;
        });

        return matches;
    }

    /**
     * Parse the value and replace it by correct CSS rules.
     *
     * @private
     *
     * @param {String} str                  The value to modify it's markdown
     * @return {Array}                      The value with CSS replaced as an
    */
    function markdown(str) {
        if (!a.isString(str)) {
            return [str];
        }

        var first, matches, styles;
        styles = [];
        while (hasMarkdownMatches(str)) {
            matches = getOrderedMarkdownMatches(str);
            first = matches[0];
            str = str.replace(first.format.regex, first.format.replacer);
            styles = styles.concat(first.format.styles(first.match));
        }

        // Correcting the indent if the group system
        // does not exist
        if (indent > 0) {
            for (var i = 0, l = indent.length; i < l; ++i) {
                str = '  ' + str;
            }
        }

        if (cssSupport) {
            return [str].concat(styles);
        } else {
            return [str];
        }
    }

    /**
     * Test the minimum type for a given log.
     * Like we can test the 'log' can be printed or not according
     * to current verbose parameter configured in a.environment.
     *
     * @private
     *
     * @param currentType {String}          The level to test
     * @return {Boolean}                    True the minimum level is OK for
     *                                      current test, false the minimum
     *                                      level is too high for current test.
    */
    function testMinimumType(currentType) {
        var minimumType = a.environment.get('console.minimum');
        switch (minimumType) {
        case 'error':
            if (currentType !== 'error') {
                return false;
            }
            break;
        case 'warning':
        case 'warn':
            if (currentType !== 'warn' &&
                    currentType !== 'warning' &&
                    currentType !== 'error') {
                return false;
            }
            break;
        case 'info':
            if (currentType === 'log') {
                return false;
            }
            break;
        default:
            break;
        }
        return true;
    }

    /**
     * Test the minimum allowed verbose level.
     *
     * @private
     *
     * @param currentSource {String}        The source (may change the verbose)
     * @param currentVerbose {Integer}      The verbose level to test
     * @return {Boolean}                    The verbose level is allowed for
     *                                      the current configured verbose
    */
    function testMinimumVerbose(currentSource, currentVerbose) {
        var cv = 'console.verbose',
            minimumGlobalVerbose = a.environment.get(cv),
            minimumSourceVerbose = a.environment.get(cv + '-' +
                currentSource);

        if (minimumGlobalVerbose === null && minimumSourceVerbose === null) {
            return true;
        }

        // This part can override the default verbose level.
        if (currentSource && minimumSourceVerbose !== null) {
            return currentVerbose <= minimumSourceVerbose;
        }

        return currentVerbose <= minimumGlobalVerbose;
    }

    /**
     * Print a single log on console (if console is available).
     *
     * @private
     *
     * @param entry {Object}                The log to print on console
    */
    function output(entry) {
        // We can't print anything if the console does not exist...
        if (a.isNone(win.console) || !a.isFunction(win.console.log)) {
            return;
        }

        // This does not work for printing groups
        if (entry.type === 'group') {
            return;
        }

        var cs = win.console[entry.type],
            source = entry.source;

        // Rollback to log if user is accessing something not existing
        // like 'table' may be in this category on some browser...
        if (a.isNone(cs)) {
            cs = win.console.log;
        }

        // Test if the log is allowed to be printed or not
        if (testMinimumType(entry.type) &&
                testMinimumVerbose(source, entry.verbose)) {

            // This is the most common case
            // In this particular case, we can do many things...
            if (entry.args.length === 1) {
                // We try to call the console with the markdown style...
                cs.apply(win.console, markdown(entry.args[0]));

            // In this case we can't really do something...
            } else {
                cs.apply(win.console, entry.args);
            }
        }
    }

    /**
     * Generate from the type, source and value the related storm printing.
     *
     * @private
     *
     * @param {String} type                 The type (log, warn, error,...)
     * @param {String} source               The source (the function/object
     *                                      name)
     * @param {String} value                The usual log.
     * @return {String}                     The markdown version for all
     *                                      AppStorm.JS messages
    */
    function storm(type, source, value) {
        // Content got one empty string at beginning to insert
        // %c with join at the beginning of string
        var content = '',
            white = 'color:white;',
            padding = (browser === 'firefox') ? 'padding:3px;' :
                    'padding:1px;';

        switch (type) {
        case 'log':
            content += '[c="' + padding + 'background:#2d89ef;' + white +
                    '"]   LOG   [c]';
            break;
        case 'info':
            content += '[c="' + padding + 'background:#00a300;' + white +
                    '"]  INFO.  [c]';
            break;
        case 'warn':
        case 'warning':
            content += '[c="' + padding + 'background:#ffc40d;' + white +
                    '"]  WARN.  [c]';
            break;
        case 'error':
            content += '[c="' + padding + 'background:#ee1111;' + white +
                    '"]  ERROR  [c]';
            break;
        }

        if (source) {
            content += '[c="' + padding + 'background:#666;' + white + '"]  ' +
                    source + '  [c]';
        }

        content += '[c="background:inherits;color:inherits;"] [c]' + value;

        return content;
    }

    /**
     * Register a new log.
     *=
     * @private
     *
     * @param type {String}                 The log type (log, warn, info...)
     * @param args {Object}                 The log data
    */
    function register(type, args) {
        // If nothing is set, the verbose level is consider as
        // critical - must be printed
        var verbose = 1,
            source = '';

        if (args.length > 0 && a.isTrueObject(args[0]) &&
                args[0].storm === true) {
            verbose = parseInt(args[0].verbose, 10);
            source = args[0].source;

            // In the storm case, we create specific rendering
            var textMarkdown = storm(type, source, args[0].value);

            // The first element is the log, others are CSS
            args = [textMarkdown];
        }

        // Creating the data structure
        var data = {
            type: type,
            verbose: verbose,
            source: source,
            args: args
        };

        this.logs.push(data);

        // We clear if there is too much logs
        while(this.logs.length > 2000) {
            this.logs.shift();
        }

        // On direct case we print it
        if (this.isDirect) {
            output(data);
        }
    }

    /*
     * Debugger is a wrapper around window.console to provide a more
     * structured way to access and use group system provided by console.
     *
     * @constructor
     *
     * @param {String} name                 The debugger name
     * @param {Boolean} collapsed           The collapsed state, only useful
     *                                      if isDirect is set to false
     * @param {Object | Null} parent        The parent of this debugger, can be
     *                                      null
    */
    a.debugger = function (name, collapsed, parent) {
        this.name = name;
        this.collapsed = collapsed || false;
        this.parent = parent || null;
        this.logs = [];
        this.isDirect = true;
    };

    a.debugger.prototype = {
        /**
         * Create a group inside this debugger.
         *
         * @param {String} name                 The new sub group name
         * @param {Boolean | Null} collapsed    If we should collapse or not when
         *                                      printing to console
         * @return {a.debugger}                 The debugger associated or null
         *                                      value if group is not allowed
        */
        group: function (name, collapsed) {
            // In direct mode there is no group support
            if (this.isDirect) {
                return null;
            }
            var root = new a.debugger(name, collapsed, this);
            this.logs.push({
                type: 'group',
                args: root
            });
            return root;
        },

        /**
         * Render the group and all sub groups into console.
        */
        print: function () {
            // In direct mode there is no print support
            if (this.isDirect) {
                return;
            }
            // Somebody is already using it... We have to wait a while
            if (this.parent === null && concurrentConsoleAccess === true) {
                setTimeout(this.print, 50);
                return;
            }

            var cs = win.console;

            // The root (the original one), lock the console
            // to not pollute with other eventual print
            if (this.parent === null) {
                concurrentConsoleAccess = true;
            }

            // Starting groups
            if (this.collapsed === true) {
                cs.groupCollapsed(this.name);
            } else {
                cs.group(this.name);
            }

            // Loggings
            a.each(this.logs, function(log) {
                if (log.type === 'group') {
                    var group = log.args;
                    group.print();
                }else {
                    output(log);
                }
            });

            // Ending group
            cs.groupEnd();

            if (this.parent === null) {
                concurrentConsoleAccess = false;
            }
        },

        /**
         * Print into console as a table.
         *
         * @param {Object} any              Anything to send to console
        */
        table: function() {
            register.call(this, 'table',
                    Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into console.
         *
         * @param {Object} any              Anything to send to console
        */
        log: function() {
            register.call(this, 'log', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into console.
         *
         * @param {Object} any              Anything to send to console
        */
        warn: function() {
            register.call(this, 'warn', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into info.
         *
         * @param {Object} any              Anything to send to console
        */
        info: function() {
            register.call(this, 'info', Array.prototype.slice.call(arguments));
        },

        /**
         * Log something into error.
         *
         * @param {Object} any              Anything to send to console
        */
        error: function() {
            register.call(this, 'error',
                    Array.prototype.slice.call(arguments));
        },

        /**
         * Specific AppStorm.JS debug element, allowing to print
         * nice message on the console.
         *
         * @param {String} level            The level like log, info, error...
         * @param {String} source           The object source raising this
         *                                  log
         * @param {String} log              The log message
         * @param {Integer} verbose         The verbose (1, 2, 3)
        */
        storm: function(level, source, log, verbose) {
            register.call(this, level, [{
                storm: true,
                source: source || '',
                verbose: verbose || 1,
                value: log || ''
            }]);
        },

        /**
         * Get the current trace stored into debugger.
         *
         * @param {String | Null} type      The type like log, info... If null,
         *                                  We get all trace...
         * @return {Array}                  The tracelog currently stored
        */
        trace: function(type) {
            if (a.isString(type)) {
                return a.filter(this.logs, function(el) {
                    return el.type === type;
                });
            }
            return this.logs;
        },

        /**
         * Clear the debugger.
        */
        clear: function() {
            this.logs = [];
        }
        /*!
         * @private
        */
    };
})(window, window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Console functionnality, based on debugger.js, it provides basic
        map surround normal console stuff, including markdown template

************************************************************************ */


/**
 * Wrapper for system console, allowing to use console even if there is no
 * console support on given browser.
 * Also, it does provide a trace utility in case of bug/check to recover all
 * passed log to it.
 *
 * @constructor
 *
 * @see core/debugger
*/
(function(win, a) {
    a.console = new a.debugger('console', true, null);
    a.console.isDirect = true;
})(window, window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Define one reusable object (eventEmitter)
        and create a root event system (message)
        ( @see : http://simplapi.wordpress.com/2012/09/01/custom-event-listener-in-javascript/ )

************************************************************************ */



/**
 * Simple message/event system allowing to exchange data across elements threw
 * events. **a.message is an instance of a.eventEmitter**.
 *
 * @constructor
 *
 * @param {String} base                     The event system name. Like for
 *                                          a.message it's 'a.message'
*/
a.eventEmitter = function(base) {
    this.eventList = {};
    this.eventBaseName = base;
};


a.eventEmitter.prototype = {
    /**
     * Clear the event listeners which don't have any function added.
     *
     * @private
    */
    clearEventType: function() {
        // At the end, we clear unused
        // listeners array type
        // (we must go backward for multi splice problem)
        for(var i in this.eventList) {
            if(!this.eventList[i] || this.eventList[i].length < 1) {
                delete this.eventList[i];
            }
        }
    },

    /**
     * Bind a function to an event type.
     *
     * @param {String} type                 The event type
     * @param {Function} fn                 The function to bind to event
     * @param {Object | Null} scope         The scope to bind to function
     * @param {Boolean | Null} once         If we should start it only once or
     *                                      not
     * @param {Boolean | Null} clear        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bind: function(type, fn, scope, once, clear) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var pbBind = 'The type ```' + type + '``` cannot be bind';
            a.console.storm('warn', this.eventBaseName + '.bind', pbBind, 1);
            return;
        }

        // The function is invalid (not a function)
        if(!a.isFunction(fn)) {
            var notFunc = 'unable to bind function, ```' + fn +
                    '``` is not a function';
            a.console.storm('warn', this.eventBaseName + '.bind', notFunc, 1);
            return;
        }

        if(once !== true) {
            once = false;
        }
        if(clear !== false) {
            clear = true;
        }

        // Create a new array for the given type
        if(a.isUndefined(this.eventList[type])) {
            this.eventList[type] = [];
        }

        this.eventList[type].push({
            fct:   fn,
            scope: scope || null,
            once:  once,
            clear: clear
        });

        // Dispatch event
        this.dispatch(this.eventBaseName + '.add', {
            type:  type,
            fct:   fn
        });
    },

    /**
     * Adding a listener only once.
     *
     * @param {String} type                 The event type
     * @param {Function} fn                 The function to bind to event
     * @param {Object | Null} scope         The scope to bind to function
     * @param {Boolean | Null} clear        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bindOnce: function(type, fn, scope, clear) {
        this.bind(type, fn, scope, true, clear);
    },

    /**
     * Removing a listener to a specific message type.
     *
     * @param {String} type                 The event name
     * @param {Function} fn                 The function to detach
    */
    unbind: function(type, fn) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var msg = 'The type ```' + type + '``` cannot be unbind';
            a.console.storm('warn', this.eventBaseName + '.unbind', msg, 1);
            return;
        }

        // If the event type is not listed as existing,
        // we don't need to remove anything
        var elementList = this.eventList[type];
        if(a.isNone(elementList)) {
            return;
        }

        // Multiple splice : we must go backward to prevent index error
        var i = elementList.length;
        if(a.isFunction(fn)) {
            while(i--) {
                if(elementList[i].fct === fn) {
                    elementList.splice(i, 1);
                }
            }
        }

        // Dispatch event
        this.dispatch(this.eventBaseName + '.unbind', {
            type: type,
            fct:  fn
        });

        // We clear unused list type
        this.clearEventType();
    },

    /**
     * Remove all listeners for a given type.
     *
     * @param {String} type                 The event type to remove
    */
    unbindAll: function(type) {
        if(!a.isNone(this.eventList[type])) {
            var events = this.eventList[type],
                i = events.length;

            while(i--) {
                if(events[i].clear === true) {
                    events.splice(i, 1);
                }
            }
        }

        // We clear unused list type
        this.clearEventType();
    },

    /**
     * Clear all listeners from all event type.
    */
    clear: function() {
        var c = this.eventBaseName + '.clear';

        for(var i in this.eventList) {
            if(i !== c) {
                this.unbindAll(i);
            }
        }

        // Dispatch event
        this.dispatch(c, {});
    },

    /**
     * Call an event, according to it's type.
     *
     * @param {String} type                 The event name to dispatch
     * @param {Object} data                 Anything you want to pass threw
     *                                      this event
    */
    dispatch: function(type, data) {
        var dispatcher = this.eventList[type];
        if(!a.isNone(dispatcher)) {
            for(var i=0, l=dispatcher.length; i<l; ++i) {
                // Scoping to not have trouble
                (function(fct, scope) {
                    // Binding into timeout for not waiting function to finish
                    setTimeout(function() {
                        fct.call(scope, data);
                    }, 0);
                })(dispatcher[i].fct, dispatcher[i].scope);
            }
        }
    }
};


/*
------------------------------
  MESSAGE
------------------------------
*/
/**
 * The bus system to exchange message globally between all application object.
*/
a.message = new a.eventEmitter('a.message');


/*
------------------------------
  GLOBAL
------------------------------
*/
(function() {
    var ready = false,
        tmp = [];

    /**
     * Internal function to call function regarding it's scope.
     *
     * @private
     *
     * @param {Function} func               The function to call
     * @param {Object | Null} scope         The potential scope (optional)
    */
    function internalCall(func, scope) {
        setTimeout(function() {
            if(scope) {
                func.call(scope);
            } else {
                func();
            }
        }, 0);
    }

    a.message.bind('ready', function() {
        ready = true;
        var i = tmp.length;
        while(i--) {
            internalCall(tmp[i].func, tmp[i].scope);
        }

        // Clearing tmp (not needed anymore)
        tmp = null;
    });

    /**
     * Alias mostly used for appstorm ready event.
     *
     * @param {String} name                     The event name
     * @param {Function} func                   The function to start
     * @param {Object | Null} scope             The scope to apply (optional)
    */
    a.on = function(name, func, scope) {
        var evt = name.toLowerCase();
        if(evt === 'ready' && a.isFunction(func)) {
            // Direct call, ready event already gone
            if(ready === true) {
                internalCall(func, scope);
            // Need to queue
            } else {
                tmp.push({
                    func: func,
                    scope: scope
                });
            }
        } else {
            a.message.bind(name, func, scope);
        }
    };
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide parsing/stringify functionnality for JSON and XML format

************************************************************************ */

/**
 * Provide parsing/stringify functionnality for JSON and XML format.
 *
 * @constructor
*/
a.parser = {
    /**
     * Basic JSON handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check.
     *
     * @constructor
    */
    json: {
        /**
         * Serialize a JSON into a string.
         *
         * @param {Object} value            Any data to be converted
         * @return {String}                 A JSON parsed string, or an empty
         *                                  string if the parsing fails
        */
        stringify: function() {
            try {
                return JSON.stringify.apply(null, arguments);
            } catch(e) {
                var error = 'Unable to stringify the value ```' +
                        arguments.toString() + '```. Below the stack trace.';
                a.console.storm('error', 'a.parser.json.stringify', error, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('app.debug')) {
                    a.console.error(a.getStackTrace());
                }
                return '';
            }
        },

        /**
         * Deserialize a string into JSON.
         *
         * @param {String} value            The value un-stringify
         * @return {Mixed | Null}           The converted value
        */
        parse: function(value) {
            try {
                return JSON.parse(value);
            } catch(e) {
                var error = 'Unable to parse the value ```' + value +
                        '```. Below the stack trace.';
                a.console.storm('error', 'a.parser.json.parse', error, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('app.debug')) {
                    a.console.error(a.getStackTrace());
                }
                return null;
            }
        }
    },

    /**
     * Basic XML handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check.
     *
     * @constructor
    */
    xml: {
        /**
         * Serialize a XML into a string.
         *
         * @param {Object} value            Any data to be converted
         * @return {String}                 A parsed string, or an empty
         *                                  string if the parsing fails
        */
        stringify: function(value) {
            if(!a.isNone(value) && !a.isNone(value.xml)) {
                return value.xml;
            } else if(!a.isNone(window.XMLSerializer)) {
                try {
                    var serializer = new window.XMLSerializer();
                    return serializer.serializeToString(value);
                } catch(e) {
                    var error = 'Unable to stringify the value ```' + value +
                            '```. Below the stack trace.';
                    a.console.storm('error', 'a.parser.xml.stringify',
                            error, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('app.debug')) {
                        a.console.error(a.getStackTrace());
                    }
                }
            }

            a.console.storm('error', 'a.parser.xml.stringify', 
                'Unable to find any parser for stringify xml...', 1);
            return '';
        },

        /**
         * Deserialize a string into XML.
         *
         * @param {String} value            The value un-stringify
         * @return {DOMElement | Null}      The resulting doc element, or null
         *                                  in case of problem
        */
        parse: function(value) {
            if(!a.isNone(window.ActiveXObject)) {
                var doc = null;
                // 4: we stop at MSXML 3.0
                for(var i=0; i<4; ++i) {
                    try {
                        // Name are: Msxml2.DOMDocument.6.0 to 3.0
                        var msxml = 'MSXML2.DOMDocument.' + (6 - i) + '.0';
                        doc = new ActiveXObject(msxml[i]);
                    } catch(e) {}
                }
                doc.async = false;
                doc.loadXML(value);
                if (doc.parseError.errorCode !== 0) {
                    var error = 'Unable to parse the value ```' + value +
                            '```, reason ```' + doc.parseError.reason + '```' +
                            '. Below the stack trace.';
                    a.console.storm('error', 'a.parser.xml.parse', error, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('app.debug')) {
                        a.console.error(a.getStackTrace());
                    }

                    return null;
                }
                return doc;
            } else if(!a.isNone(window.DOMParser)) {
                return (new DOMParser()).parseFromString(value, 'text/xml');
            }

            a.console.storm('error', 'a.parser.xml.parse', 
                'Unable to find any parser for parsing xml...', 1);
            return null;
        }
    }
};






/*!
 * USE OF JSON3:
 *    JSON v3.2.4
 *    http://bestiejs.github.com/json3
 *    Copyright 2012, Kit Cambridge
 *    http://kit.mit-license.org
 *
 * It seems JSON3 fully bind at all times, so we change... 
*/
/* jshint ignore:start */

// BEGIN JSON3 - only if json is not supported
if(a.isNone(JSON) && (a.isNone(JSON.parser) || a.isNone(JSON.stringify)) ) {

;(function(){var e=void 0,i=!0,k=null,l={}.toString,m,n,p="function"===typeof define&&define.c,q=!p&&"object"==typeof exports&&exports;q||p?"object"==typeof JSON&&JSON?p?q=JSON:(q.stringify=JSON.stringify,q.parse=JSON.parse):p&&(q=this.JSON={}):q=this.JSON||(this.JSON={});var r,t,u,x,z,B,C,D,E,F,G,H,I,J=new Date(-3509827334573292),K,O,P;try{J=-109252==J.getUTCFullYear()&&0===J.getUTCMonth()&&1==J.getUTCDate()&&10==J.getUTCHours()&&37==J.getUTCMinutes()&&6==J.getUTCSeconds()&&708==J.getUTCMilliseconds()}catch(Q){}
function R(b){var c,a,d,j=b=="json";if(j||b=="json-stringify"||b=="json-parse"){if(b=="json-stringify"||j){if(c=typeof q.stringify=="function"&&J){(d=function(){return 1}).toJSON=d;try{c=q.stringify(0)==="0"&&q.stringify(new Number)==="0"&&q.stringify(new String)=='""'&&q.stringify(l)===e&&q.stringify(e)===e&&q.stringify()===e&&q.stringify(d)==="1"&&q.stringify([d])=="[1]"&&q.stringify([e])=="[null]"&&q.stringify(k)=="null"&&q.stringify([e,l,k])=="[null,null,null]"&&q.stringify({A:[d,i,false,k,"\x00\u0008\n\u000c\r\t"]})==
'{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'&&q.stringify(k,d)==="1"&&q.stringify([1,2],k,1)=="[\n 1,\n 2\n]"&&q.stringify(new Date(-864E13))=='"-271821-04-20T00:00:00.000Z"'&&q.stringify(new Date(864E13))=='"+275760-09-13T00:00:00.000Z"'&&q.stringify(new Date(-621987552E5))=='"-000001-01-01T00:00:00.000Z"'&&q.stringify(new Date(-1))=='"1969-12-31T23:59:59.999Z"'}catch(f){c=false}}if(!j)return c}if(b=="json-parse"||j){if(typeof q.parse=="function")try{if(q.parse("0")===0&&!q.parse(false)){d=
q.parse('{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');if(a=d.a.length==5&&d.a[0]==1){try{a=!q.parse('"\t"')}catch(o){}if(a)try{a=q.parse("01")!=1}catch(g){}}}}catch(h){a=false}if(!j)return a}return c&&a}}
if(!R("json")){J||(K=Math.floor,O=[0,31,59,90,120,151,181,212,243,273,304,334],P=function(b,c){return O[c]+365*(b-1970)+K((b-1969+(c=+(c>1)))/4)-K((b-1901+c)/100)+K((b-1601+c)/400)});if(!(m={}.hasOwnProperty))m=function(b){var c={},a;if((c.__proto__=k,c.__proto__={toString:1},c).toString!=l)m=function(a){var b=this.__proto__,a=a in(this.__proto__=k,this);this.__proto__=b;return a};else{a=c.constructor;m=function(b){var c=(this.constructor||a).prototype;return b in this&&!(b in c&&this[b]===c[b])}}c=
k;return m.call(this,b)};n=function(b,c){var a=0,d,j,f;(d=function(){this.valueOf=0}).prototype.valueOf=0;j=new d;for(f in j)m.call(j,f)&&a++;d=j=k;if(a)a=a==2?function(a,b){var c={},d=l.call(a)=="[object Function]",f;for(f in a)!(d&&f=="prototype")&&!m.call(c,f)&&(c[f]=1)&&m.call(a,f)&&b(f)}:function(a,b){var c=l.call(a)=="[object Function]",d,f;for(d in a)!(c&&d=="prototype")&&m.call(a,d)&&!(f=d==="constructor")&&b(d);(f||m.call(a,d="constructor"))&&b(d)};else{j=["valueOf","toString","toLocaleString",
"propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];a=function(a,b){var c=l.call(a)=="[object Function]",d;for(d in a)!(c&&d=="prototype")&&m.call(a,d)&&b(d);for(c=j.length;d=j[--c];m.call(a,d)&&b(d));}}a(b,c)};R("json-stringify")||(r={"\\":"\\\\",'"':'\\"',"\u0008":"\\b","\u000c":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"},t=function(b,c){return("000000"+(c||0)).slice(-b)},u=function(b){for(var c='"',a=0,d;d=b.charAt(a);a++)c=c+('\\"\u0008\u000c\n\r\t'.indexOf(d)>-1?r[d]:r[d]=d<" "?
"\\u00"+t(2,d.charCodeAt(0).toString(16)):d);return c+'"'},x=function(b,c,a,d,j,f,o){var g=c[b],h,s,v,w,L,M,N,y,A;if(typeof g=="object"&&g){h=l.call(g);if(h=="[object Date]"&&!m.call(g,"toJSON"))if(g>-1/0&&g<1/0){if(P){v=K(g/864E5);for(h=K(v/365.2425)+1970-1;P(h+1,0)<=v;h++);for(s=K((v-P(h,0))/30.42);P(h,s+1)<=v;s++);v=1+v-P(h,s);w=(g%864E5+864E5)%864E5;L=K(w/36E5)%24;M=K(w/6E4)%60;N=K(w/1E3)%60;w=w%1E3}else{h=g.getUTCFullYear();s=g.getUTCMonth();v=g.getUTCDate();L=g.getUTCHours();M=g.getUTCMinutes();
N=g.getUTCSeconds();w=g.getUTCMilliseconds()}g=(h<=0||h>=1E4?(h<0?"-":"+")+t(6,h<0?-h:h):t(4,h))+"-"+t(2,s+1)+"-"+t(2,v)+"T"+t(2,L)+":"+t(2,M)+":"+t(2,N)+"."+t(3,w)+"Z"}else g=k;else if(typeof g.toJSON=="function"&&(h!="[object Number]"&&h!="[object String]"&&h!="[object Array]"||m.call(g,"toJSON")))g=g.toJSON(b)}a&&(g=a.call(c,b,g));if(g===k)return"null";h=l.call(g);if(h=="[object Boolean]")return""+g;if(h=="[object Number]")return g>-1/0&&g<1/0?""+g:"null";if(h=="[object String]")return u(g);if(typeof g==
"object"){for(b=o.length;b--;)if(o[b]===g)throw TypeError();o.push(g);y=[];c=f;f=f+j;if(h=="[object Array]"){s=0;for(b=g.length;s<b;A||(A=i),s++){h=x(s,g,a,d,j,f,o);y.push(h===e?"null":h)}b=A?j?"[\n"+f+y.join(",\n"+f)+"\n"+c+"]":"["+y.join(",")+"]":"[]"}else{n(d||g,function(b){var c=x(b,g,a,d,j,f,o);c!==e&&y.push(u(b)+":"+(j?" ":"")+c);A||(A=i)});b=A?j?"{\n"+f+y.join(",\n"+f)+"\n"+c+"}":"{"+y.join(",")+"}":"{}"}o.pop();return b}},q.stringify=function(b,c,a){var d,j,f,o,g,h;if(typeof c=="function"||
typeof c=="object"&&c)if(l.call(c)=="[object Function]")j=c;else if(l.call(c)=="[object Array]"){f={};o=0;for(g=c.length;o<g;h=c[o++],(l.call(h)=="[object String]"||l.call(h)=="[object Number]")&&(f[h]=1));}if(a)if(l.call(a)=="[object Number]"){if((a=a-a%1)>0){d="";for(a>10&&(a=10);d.length<a;d=d+" ");}}else l.call(a)=="[object String]"&&(d=a.length<=10?a:a.slice(0,10));return x("",(h={},h[""]=b,h),j,f,d,"",[])});R("json-parse")||(z=String.fromCharCode,B={"\\":"\\",'"':'"',"/":"/",b:"\u0008",t:"\t",
n:"\n",f:"\u000c",r:"\r"},C=function(){H=I=k;throw SyntaxError();},D=function(){for(var b=I,c=b.length,a,d,j,f,o;H<c;){a=b.charAt(H);if("\t\r\n ".indexOf(a)>-1)H++;else{if("{}[]:,".indexOf(a)>-1){H++;return a}if(a=='"'){d="@";for(H++;H<c;){a=b.charAt(H);if(a<" ")C();else if(a=="\\"){a=b.charAt(++H);if('\\"/btnfr'.indexOf(a)>-1){d=d+B[a];H++}else if(a=="u"){j=++H;for(f=H+4;H<f;H++){a=b.charAt(H);a>="0"&&a<="9"||a>="a"&&a<="f"||a>="A"&&a<="F"||C()}d=d+z("0x"+b.slice(j,H))}else C()}else{if(a=='"')break;
d=d+a;H++}}if(b.charAt(H)=='"'){H++;return d}}else{j=H;if(a=="-"){o=i;a=b.charAt(++H)}if(a>="0"&&a<="9"){for(a=="0"&&(a=b.charAt(H+1),a>="0"&&a<="9")&&C();H<c&&(a=b.charAt(H),a>="0"&&a<="9");H++);if(b.charAt(H)=="."){for(f=++H;f<c&&(a=b.charAt(f),a>="0"&&a<="9");f++);f==H&&C();H=f}a=b.charAt(H);if(a=="e"||a=="E"){a=b.charAt(++H);(a=="+"||a=="-")&&H++;for(f=H;f<c&&(a=b.charAt(f),a>="0"&&a<="9");f++);f==H&&C();H=f}return+b.slice(j,H)}o&&C();if(b.slice(H,H+4)=="true"){H=H+4;return i}if(b.slice(H,H+5)==
"false"){H=H+5;return false}if(b.slice(H,H+4)=="null"){H=H+4;return k}}C()}}return"$"},E=function(b){var c,a;b=="$"&&C();if(typeof b=="string"){if(b.charAt(0)=="@")return b.slice(1);if(b=="["){for(c=[];;a||(a=i)){b=D();if(b=="]")break;if(a)if(b==","){b=D();b=="]"&&C()}else C();b==","&&C();c.push(E(b))}return c}if(b=="{"){for(c={};;a||(a=i)){b=D();if(b=="}")break;if(a)if(b==","){b=D();b=="}"&&C()}else C();(b==","||typeof b!="string"||b.charAt(0)!="@"||D()!=":")&&C();c[b.slice(1)]=E(D())}return c}C()}return b},
G=function(b,c,a){a=F(b,c,a);a===e?delete b[c]:b[c]=a},F=function(b,c,a){var d=b[c],j;if(typeof d=="object"&&d)if(l.call(d)=="[object Array]")for(j=d.length;j--;)G(d,j,a);else n(d,function(b){G(d,b,a)});return a.call(b,c,d)},q.parse=function(b,c){var a,d;H=0;I=b;a=E(D());D()!="$"&&C();H=I=k;return c&&l.call(c)=="[object Function]"?F((d={},d[""]=a,d),"",c):a})}p&&define(function(){return q});
}());


// END JSON3
}

/* jshint ignore:end */;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Simple timer system, provide a single timer for many bindings

************************************************************************ */

/**
 * Simple timer system, provide a single timer for many bindings.
 *
 * @constructor
*/
a.timer = (function() {
    'use strict';

    // Internal data
    var delay = 50,
        store = {};

    /**
     * Proceed timer tick
     *
     * @method tick
     * @private
    */
    function tick() {
        // We dispatch a new tick
        a.message.dispatch('a.timer.tick');

        // For every stored function, we scan and apply
        for(var i in store) {
            var obj = store[i];
            obj.current += delay;

            // If it's time to tick
            if(obj.current >= obj.timeout) {
                obj.current = 0;
                if(a.isFunction(obj.fct)) {
                    // Call function on tick OK
                    obj.fct.call(obj.scope || this);
                }
            }
        }
    }

    // Auto-start timer
    setInterval(tick, delay);

    return {
        /**
         * Register a function for regular timer tick.
         *
         * @async
         *
         * @param {Function} fct            The function to bind
         * @param {Object | Null} scope     The scope to use when calling
         *                                  function
         * @param {Integer} timeout         The timeout between two call
         * @return {Integer}                A generated id used to access
         *                                  this entry
        */
        add: function(fct, scope, timeout) {
            var id = a.uniqueId();

            if(!a.isNumber(timeout) || timeout <= 0) {
                timeout = 1000;
                a.console.storm('warn', 'a.timer.add', 'The timeout has not ' +
                                    'been setted properly ' +
                                    ', timeout has been rollback to ' +
                                    '```1000ms``` value', 1);
            }

            // Store the new entry
            store[id] = {
                fct:     fct,
                scope:   scope,
                timeout: timeout,
                current: 0
            };

            // Return the unique id to manipulate it
            return id;
        },

        /**
         * Register a function for a single timer tick.
         *
         * @async
         *
         * @param {Function} fct            The function to bind
         * @param {Object | Null} scope     The scope to use when calling
         *                                  function
         * @param {Integer} timeout         The timeout when calling function
         * @return {Integer}                A generated id used to
         *                                  manipulate ticker access
        */
        once: function(fct, scope, timeout) {
            var id = this.add(
                function() {
                    if(a.isFunction(fct)) {
                        fct.call(this);
                    }
                    a.timer.remove(id);
                },
            scope, timeout);
            return id;
        },

        /**
         * Get a function registred into the timer.
         *
         * @return {Object | Null}          The object linked to id, or null
         *                                  if nothing is related to id
        */
        get: function(id) {
            var item = store[id];
            return a.isNone(item) ? null : item;
        },

        /**
         * Remove a function currently stored into the timer.
         *
         * @param id {Integer}              The id to delete
         * @return {Boolean}                The item has been delete or not
        */
        remove: function(id) {
            return delete store[id];
        },

        /**
         * Clear the current all timers.
        */
        clear: function() {
            store = {};
        }
    };
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a really basic dom manipulation plugin.
        This helps to use appstorm by itself without any jQuery or others.
        It really not the best, but it does work well, and already pretty 
        usefull!

************************************************************************ */


/*!
 * From: http://www.codecouch.com/2012/05/adding-document-queryselectorall-support-to-ie-7/
 * Adding 'uber basic' support of querySelectorAll for IE browsers
 * Only if user does not make usage of any library like jQuery
*/
/* jshint ignore:start */
if(document.all && ! ('querySelectorAll' in document) && !window.jQuery) {
    // IE7 support for querySelectorAll in 274 bytes. Supports multiple / grouped selectors and the attribute selector with a "for" attribute. http://www.codecouch.com/
    (function(d,s){d=document,s=d.createStyleSheet();d.querySelectorAll=function(r,c,i,j,a){a=d.all,c=[],r=r.replace(/\[for\b/gi,'[htmlFor').split(',');for(i=r.length;i--;){s.addRule(r[i],'k:v');for(j=a.length;j--;)a[j].currentStyle.k&&c.push(a[j]);s.removeRule(0)}return c}})()
}
/* jshint ignore:end */


/**
 * Provide a really basic dom manipulation plugin.
 * This helps to use appstorm by itself without any jQuery or others.
 * It really not the best, but it does work well, and already pretty 
 * usefull!
 *
 * @constructor
*/
a.dom = {
    /**
     * USE ONLY IF YOU HAVE JQUERY, OR DON'T CARE OLD BROWSER (IE 8 and +)
     * Use direct jquery or querySelectorAll to select items.
     *
     * @param {String} check                The string to search for
     * @param {DOMElement} dom              The dom to search inside
     * @return {a.dom.children}             A chainable object
    */
    query: function(check, dom) {
        dom = a.dom.el(dom).get(0) || document;

        if(!dom.querySelectorAll && window.jQuery) {
            return this.el(jQuery(check));
        }

        return this.el(dom.querySelectorAll(check)); 
    },

    /**
     * Embed a dom element into a.dom system.
     *
     * @param {DOMElement} element          A dom element to work with
     * @return {a.dom.children}             A chainable object
    */
    el: function(element) {
        // Detect already parsed
        if(element instanceof a.dom.children) {
            return element;
        }

        if(a.isString(element)) {
            element = a.trim(element);

            // If there is only alphanumeric, we go for id
            var reg = /^[a-zA-Z0-9 _-]+$/i;
            if(reg.test(element)) {
                return this.id(element);
            } else {
                return this.query(element);
            }
        }

        // Detect jQuery elements
        if(window.jQuery && element instanceof jQuery) {
            var domList = [],
                i       = element.size();

            while(i--) {
                domList.push(element.get(i));
            }
            // Erase and continue with
            element = domList;
        }

        // Detecting NodeList (special case)
        if(element instanceof window.NodeList) {
            element = a.toArray(element);
        }

        // Detect array elements
        if(a.isArray(element)) {
            return new this.children(element);
        }

        // Detect single DOM element
        return new this.children([element]);
    },

    /**
     * Find element by id, or a list of ids (separator: ',', or an array).
     *
     * @param {String | Array} id           The id(s) to search
     * @return {a.dom.children}             A chainable object
    */
    id: function(id) {
        return this.attr('id', id, document);
    },

    /**
     * Find elements by classname, or a list of classname
     * (separator: ',', or an array).
     *
     * @param {String | Array} clsname      The classname(s) to search
     *                                      (like 'active', 'container', ...)
     * @param {DOMElement | null} dom       The init dom to start searching
     *                                      from or null to use document
     * @return {a.dom.children}             A chainable object
    */
    cls: function(clsname, dom) {
        return this.attr('class', clsname, dom);
    },

    /**
     * Find elemnts by their tagname, or a list of tagname
     * (separator: ',', or an array).
     *
     * @param {String | Array} name         The tag(s) to search (input, a,...)
     * @param {DOMElement | Null} dom       The init dom to start searching
     *                                      from, or null to use document
     * @return {a.dom.children}             A chainable object
    */
    tag: function(name, dom) {
        // Remove string from name
        dom = (a.isTrueObject(dom)) ? dom : document;

        var tagList = a.isString(name) ? name.replace(/ /g,'').split(',') :
                name,
            domList = [],
            i       = tagList.length;

        if(i > 1) {
            while(i--) {
                var chainElement = this.tag(tagList[i], dom),
                    elements  = chainElement.getElements();

                a.each(elements, function (element) {
                    if (!a.contains(domList, element)) {
                        domList.push(element);
                    }
                });
            }

            return new a.dom.children(domList);
        }

        if(dom.querySelectorAll) {
            domList = dom.querySelectorAll(name);
        } else {
            domList = dom.getElementsByTagName(name);
        }

        return new a.dom.children(domList);
    },

    /**
     * Find elements by attribute name.
     *
     * @param {String | Array} name         The attribute name to search
     * @param {String | Null} value         The attribute value (can be empty)
     * @param {DOMElement} dom              The dom to start search from
     * @return {a.dom.children}             A chainable object
    */
    attr: function(name, value, dom) {
        /*!
         * -----------------------------------
         *   Detect parameter chain
         * -----------------------------------
        */

        // In case of null dom, it's 2 parameters or single parameter mode
        if(a.isNone(dom)) {
            // We are in single parameter mode
            if(a.isNone(value)) {
                value = document;
            }
            // We are in 2 parameters mode, with value = dom
            if(a.isTrueObject(value) && !a.isArray(value)) {
                return this.attr(name, null, value);

            // We are in 2 parameters mode, without value = dom
            } else {
                dom = document;
            }
        }

        /**
         * From a string or an array, get a string version.
         *
         * @private
         *
         * @param {String | Array} str      Separate elements
         * @return {Array}                  The split version
        */
        function stringToArray(str) {
            return a.isString(str) ? str.replace(/ /g,'').split(',') : str;
        }

        /**
         * Append elements to parentList only if there are not already
         * inside collection.
         *
         * @private
         *
         * @param {Array} parentList        The arrays to append elements to
         * @param {Array} children          The list of elements to append
        */
        function appendList(parentList, children) {
            a.each(children, function(child) {
                if(!a.contains(parentList, child)) {
                    parentList.push(child);
                }
            });
        }

        /*!
         * -----------------------------------
         *   Recursive attribute search
         * -----------------------------------
        */

        // If attribute = array, or a string with ',', we do recursive search
        if(name && (a.isArray(name) || name.indexOf(',') >= 0)) {
            var attributeList = stringToArray(name),
                i             = attributeList.length;

            // In case of multi attribute, we apply recursive search
            if(i > 1) {
                var doms = [];

                while(i--) {
                    var chains      = this.attr(attributeList[i], value, dom),
                        elements    = chains.getElements();
                    appendList(doms, elements);
                }

                // Returning element parsed
                return new a.dom.children(doms);
            }
        }

        /*!
         * -----------------------------------
         *   Recursive value search
         * -----------------------------------
        */

        // If value = array, or a string with ',', we do recursive search
        if(value && (a.isArray(value) || value.indexOf(',') > 0)) {
            var valueList = stringToArray(value),
                j         = valueList.length;

            // In case of multi value, we apply recursive search
            if(j > 1) {
                var oDom = [];

                while(j--) {
                    var oChains   = this.attr(name, valueList[j], dom),
                        oElements = oChains.getElements();
                    appendList(oDom, oElements);
                }

                // Returning element parsed
                return new a.dom.children(oDom);
            }
        }

        /*!
         * -----------------------------------
         *   Select elements regarding search
         * -----------------------------------
        */

        var isStringValue = a.isString(value),
            domList       = [];

        // We remove ' ' from value and attribute
        name  = name.replace(/ /g,'');
        if(isStringValue) {
            value = value.replace(/ /g,''); 
        }

        // Simple version, for latest browser
        if(name == 'class') {
            domList = dom.getElementsByClassName(value);

        } else if(name == 'id') {
            domList = [dom.getElementById(value)];
            // In case of 'not found', we remove
            if(a.isNull(domList[0])) {
                domList.pop();
            }

        } else if(dom.querySelectorAll) {
            // We get [class="ok"] or [class] depending on value setted or not

            var search = isStringValue ? '[' + name + '="' + value + '"]' :
                '[' + name + ']';

            domList = dom.querySelectorAll(search);

        // Complex version, for older browser
        } else {
            var allList = dom.getElementsByTagName('*'),
                k       = allList.length;

            while(k--) {
                // Select element (faster)
                var el    = allList[k],
                    // Check the attribute exist or not
                    found = el.getAttribute(name);

                // We found the attribute
                if(found) {
                    // 1) Attribute has been found, and is equal to value
                    // 2) No value setted, we just need attribute exist
                    if(
                        (isStringValue && found == value) ||
                        (!isStringValue)
                    ) {
                        // Don't keep duplicate
                        if(!a.contains(domList, el)) {
                            domList.push(el);
                        }
                    }
                }
            }
        }

        return new a.dom.children(domList);
    }
};




















/*
------------------------------
  EVENT
------------------------------
*/
/**
 * Unified event system for DOM element (to have always the same behavior
 * between all browser).
*/
a.dom.event = function(e) {
    e = e || window.event;
    this.target        = e.target || e.srcElement;
    this.currentTarget = e.currentTarget || null;
    this.type          = e.type;

    // Multiple binding to never loose original event
    this._e            = e;
    this.event         = e;
    this.originalEvent = e;
};

/*!
 * Event prototype
*/
a.dom.event.prototype = {
    /**
     * Stop event propagation.
    */
    stopPropagation: function() {
        var e = this.originalEvent;
        if(e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },

    /**
     * Prevent default behavior.
    */
    preventDefault: function() {
        var e = this.originalEvent;
        if(e.preventDefault) {
          e.preventDefault();
        }
        e.returnValue = false;
    }
};


/**
 * Generic function to use for converting event to appstorm event type.
 *
 * @param {Function} fn                     The function to encaps
 * @param {Object | Null} scope             The scope to apply if possible
 * @return {Function}                       The binded function
*/
a.dom.eventBinder = function(fn, scope) {
    return function(e) {
        if(a.isFunction(fn)) {
            if(a.isObject(scope)) {
                fn.call(scope, new a.dom.event(e));
            } else {
                fn.call(null, new a.dom.event(e));
            }
        }
    };
};


/**
 * Abstract layer for binding event with DOM.
*/
a.dom.eventListener = (function() {
    var store = [],
        bind = null,
        unbind = null;

    /**
     * Add binder between true event and function catch
     * @private
    */
    function addListener(el, type, fn, scope) {
        var binder = new a.dom.eventBinder(fn, scope || null);
        store.push({
            el:   el,
            type: type,
            fn:   fn,
            bn:   binder
        });
        return binder;
    }

    /**
     * Destroy stored binder reference
     * @private
    */
    function removeListener(el, type, fn) {
        var s = store,
            i = s.length,
            binder = null;
        while(i--) {
            var evt = s[i];
            if(evt.fn === fn && evt.el === el && evt.type === type) {
                binder = evt.bn;
                s.splice(i, 1);
                break;
            }
        }
        return binder;
    }

    // New browser
    /**
     * @private
    */
    function addEventListener(el, type, fn, scope) {
        el.addEventListener(type,    addListener(el, type, fn, scope), false);
    }
    /**
     * @private
    */
    function removeEventListener(el, type, fn) {
        el.removeEventListener(type, removeListener(el, type, fn), false);
    }

    // IE
    /**
     * @private
    */
    function attachEvent(el, type, fn, scope) {
        el.attachEvent('on' + type, addListener(el, type, fn, scope));
    }
    /**
     * @private
    */
    function detachEvent(el, type, fn) {
        el.detachEvent('on' + type, removeListener(el, type, fn));
    }

    // Old Browsers
    /**
     * @private
    */
    function rawBindEvent(el, type, fn, scope) {
        el['on' + type] = addListener(el, type, fn, scope);
    }
    /**
     * @private
    */
    function rawUnbindEvent(el, type, fn) {
        removeListener(el, type, fn);
        el['on' + type] = null;
    }

    if(a.isFunction(window.addEventListener)) {
        bind   = addEventListener;
        unbind = removeEventListener;
    } else if(a.isFunction(document.attachEvent)) {
        bind   = attachEvent;
        unbind = detachEvent;
    } else {
        bind   = rawBindEvent;
        unbind = rawUnbindEvent;
    }

    return {
        bind: bind,
        unbind: unbind
    };
})();






























/*
------------------------------
  CHILDREN
------------------------------
*/
/**
 * Handle recursive sub-search.
 *
 * @constructor
 *
 * @param {Array} elementList               The list of elements to use
*/
a.dom.children = function(elementList) {
    elementList = a.isUndefined(elementList.length) ?
                        [elementList] : elementList;

    this.elementList = elementList;
    // Copy the property length at any time
    this.length      = elementList.length;
};


a.dom.children.prototype = {
    /**
     * Perform a recursive task to select sub children using a.dom.
     *
     * The first parameter must be the a.dom to use
     * Other parameters are parameter to pass to this function
     * The last parameter should be the dom to use for search.
     *
     * @private
    */
    _perform: function() {
        var list          = [],
            elementList   = this.elementList,
            argsArray     = a.toArray(arguments),
            fct           = argsArray[0],
            args          = argsArray.slice(1),
            argsLength    = args.length,
            i             = elementList.length;

        // We add one item at the end, as it will be erased by local dom
        args.push(null);

        // We search on every currently stored elements, children
        while(i--) {
            // We add a null value at the end,
            // so argsLength is already length - 1
            // as we don't update it when pushing to args
            args[argsLength] = elementList[i];
            // We call the apply function with this as 'a.dom'
            var chainList = fct.apply(a.dom, args),
                children  = chainList.getElements(),
                j         = children.length;

            while(j--) {
                if(!a.contains(list, children[j])) {
                    list.push(children[j]);
                }
            }
        }

        // We update list and length
        this.elementList = list;
        this.length      = list.length;

        return this;
    },

    /**
     * Get a single DOM element.
     *
     * @param {Integer} index               The index to retrieve
     * @return {DOMElement | Null}          The dom element linked or null
     *                                      if not found
    */
    get: function(index) {
        return this.elementList[index] || null;
    },

    /**
     * Get the DOM elements stored.
     *
     * @return {Array}                      The element list stored
    */
    getElements: function() {
        return this.elementList;
    },

    /**
     * Select sub-id elements.
     *
     * @chainable
     *
     * @param {String} id                   The id or list of ids to search
    */
    id: function(id) {
        return this._perform(a.dom.id, id);
    },

    /**
     * Select sub-class elements.
     *
     * @chainable
     *
     * @param {String} clsname              The class or list of classes to
     *                                      search
    */
    cls: function(clsname) {
        return this._perform(a.dom.cls, clsname);
    },

    /**
     * Get or set style for given elements
     *
     * @param {String} rule                 The CSS rule we are working with
     * @param {String} value                The value to set (can be empty for
     *                                      get)
     * @return {String | Null}              The CSS value found in case of get
    */
    css: function(rule, value) {
        rule = rule || '';

        // Transform rule for a js like ruler
        if(rule.indexOf('-') >= 0) {
            var splitRule = rule.split('-');

            for(var i=1, l=splitRule.length; i<l; ++i) {
                var s = splitRule[i];
                splitRule[i] = a.firstLetterUppercase(s);
            }

            rule = splitRule.join('');
        }

        // Getter
        if(a.isUndefined(value)) {
            var cssList     = [],
                elementList = this.elementList,
                j           = elementList.length;

            while(j--) {
                var data = elementList[j].style[rule];
                if(!a.isNone(data)) {
                    cssList.push(data);
                }
            }

            if(cssList.length <= 1) {
                return cssList[0] || '';
            } else {
                return cssList;
            }
        // Setter
        } else {
            this.each(function() {
                this.style[rule] = value;
            });
        }
    },

    /**
     * Add a class to elements.
     *
     * @chainable
     *
     * @param {String} classname            The classname to append to every
     *                                      elements
    */
    addClass: function(classname) {
        var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
        this.each(function() {
            if(this.classList) {
                this.classList.add(classname);
            // We test the element don't have classname first
            } else if(!this.className.match(reg)) {
                this.className += ' ' + classname;
            }
        });
        return this;
    },

    /**
     * Test if all elements got classname or not.
     *
     * @chainable
     *
     * @param {String} classname            The classname to test on every
     *                                      elements
    */
    hasClass: function(classname) {
        var reg      = new RegExp('(\\s|^)' + classname + '(\\s|$)'),
            elements = this.elementList,
            i        = elements.length;

        while(i--) {
            if(!elements[i].className.match(reg)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Remove a class element.
     *
     * @chainable
     *
     * @param {String} classname            The classname to remove on every
     *                                      elements
    */
    removeClass: function(classname) {
        this.each(function(scope) {
            if(this.classList) {
                this.classList.remove(classname);
            // We test element has classname before remove
            } else {
                var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
                if(this.className.match(reg)) {
                    this.className.replace(reg, '');
                }
            }
        }, this);
        return this;
    },

    /**
     * toggle a class element.
     *
     * @chainable
     *
     * @param {String} classname            The classname to toggle on every
     *                                      elements
    */
    toggleClass: function(classname) {
        this.each(function(scope) {
            if(this.classList) {
                this.classList.toggle(classname);
            } else {
                var reg = new RegExp('(\\s|^)' + classname + '(\\s|$)');
                // If we have class or not, we switch
                if(this.className.match(reg)) {
                    this.className.replace(reg, '');
                } else {
                    this.className += ' ' + classname;
                }
            }
        }, this);
        return this;
    },

    /**
     * Bind element event to given function (like click, submit...).
     *
     * @chainable
     *
     * @param {String | Array} binding      The event/list to apply to
     * @param {Function} fct                The handler to receive event
     * @param {Object | Null} scope         The scope to apply
    */
    bind: function(binding, fct, scope) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] === '') {
                continue;
            }
            this.each(function(evt) {
                a.dom.eventListener.bind(this, evt, fct, scope);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Unbind element event to given function (like click, submit...).
     *
     * @chainable
     *
     * @param {String | Array} binding      The event/list to remove
     * @param {Function} fct                The handler of event
    */
    unbind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] === '') {
                continue;
            }

            this.each(function(evt) {
                a.dom.eventListener.unbind(this, evt, fct);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Select sub-tag elements.
     *
     * @chainable
     *
     * @param {String} name                 The tag or list of tags to search
    */
    tag: function(name) {
        return this._perform(a.dom.tag, name);
    },

    /**
     * Select sub-attributes elements.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute or list of
     *                                      attributes to search
     * @param {String | Null} value         The value to use, can be empty
    */
    attr: function(attribute, value) {
        return this._perform(a.dom.attr, attribute, value);
    },

    /**
     * Append or get attribute.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    attribute: function(attribute, value) {
        var attributes = 
            a.isString(attribute) ?   attribute.replace(/ /g,'').split(',')
                                  :   attribute;

        // Getter
        if(a.isUndefined(value)) {
            var values    = [],
                elements  = this.elementList,
                i         = elements.length;

            while(i--) {
                var element = elements[i];
                a.each(attributes, function(attr) {
                    try {
                        var data = element.getAttribute(attr);
                        if(!a.isNone(data) && !a.contains(values, data)) {
                            values.push(data);
                        }
                    } catch(ex) {}
                });
            }

            if(values.length < 2) {
                return values.join('');
            } else {
                return values;
            }

        // Setter
        } else {
            this.each(function() {
                a.each(attributes, function(attr) {
                    try {
                        this.setAttribute(attr, value); 
                    } catch(ex) {}
                }, this);
            });
            return this;
        }
    },

    /**
     * Same as attribute, but for data- HTML5 tag.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    data: function(attribute, value) {
        return this.attribute('data-' + attribute, value);
    },

    /**
     * Same as data or attribute, but multi tag check.
     *
     * @chainable
     *
     * @param {String} attribute            The attribute to set
     * @param {String} value                The value to get
    */
    appstorm: function(attribute, value) {
        // TODO: attribute does not handle ',' and array delimiter
        return this.attribute('data-' + attribute + ',a-'   + attribute +
                ',' + attribute, value);
    },

    /**
     * Move to the parent element for every element stored.
     *
     * @chainable
    */
    parent: function() {
        var elements = this.elementList,
            result   = [];

        a.each(elements, function(element) {
            var node = element.parentNode;
            if(!a.contains(result, node)) {
                result.push(node);
            }
        });

        this.elementList = result;
        this.length = result.length;

        return this;
    },

    /**
     * Select direct children of all stored elements.
     *
     * @chainable
     *
     * @param {Array | Null} types          The nodeTypes to keep (default: 3)
    */
    children: function(types) {
        var elementList = this.elementList,
            replaceList = [],
            i           = elementList.length;

        types = types || [1];

        while(i--) {
            replaceList.push(a.toArray(elementList[i].childNodes));
        }

        // Erasing previous list with new one
        var flatArray = a.remove(
            a.uniq(a.flatten(replaceList)),
            function(element) {
                if(!a.contains(types, element.nodeType)) {
                    return false;
                }
                return true;
            }
        );

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Select all sub elements.
     *=
     * @chainable
    */
    all: function() {
        var elementList = this.elementList,
            replaceList = [],
            i           = elementList.length;

        while(i--) {
            replaceList.push(a.toArray(
                elementList[i].getElementsByTagName('*')
            ));
        }

        // Erasing previous list with new one, remove wrong nodeType
        var flatArray = a.remove(
                a.uniq(a.flatten(replaceList)),
                function(element) {

            if(element.nodeType == 3) {
                return false;
            }
            return true;
        });

        this.elementList = flatArray;
        this.length = flatArray.length;

        return this;
    },

    /**
     * Insert before selected element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to insert
    */
    insertBefore: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.parentNode.insertBefore(element, this);
            }, this);
        });
        return this;
    },

    /**
     * Insert after selected element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to insert
    */
    insertAfter: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.parentNode.insertBefore(element, this.nextSibling);
            }, this);
        });
        return this;
    },

    /**
     * Empty all elements stored.
     *
     * @chainable
    */
    empty: function() {
        this.each(function() {
            while(this.firstChild) {
                this.removeChild(this.firstChild);
            }
        });
        return this;
    },

    /**
     * Remove element from content.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to remove
    */
    remove: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                try {
                    this.removeChild(element);
                } catch(ex) {}
            }, this);
        });
        return this;
    },

    /**
     * Append element to the existing content.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to append
    */
    append: function(element) {
        var dom = a.dom.el(element),
            elements = dom.getElements();

        this.each(function() {
            a.each(elements, function(element) {
                this.appendChild(element);
            }, this);
        });
        return this;
    },

    /**
     * Replace the existing content with given element.
     *
     * @chainable
     *
     * @param {DOMElement} element          The element to append
    */
    replace: function(element) {
        this.empty();
        return this.append(element);
    },

    /**
     * Set inside the current elements the content, or get the current html.
     *
     * @param {String | Null} content       The content to set, or nothing to
     *                                      get
     * @return {String | Null}              The current content, or null
    */
    html: function(content) {
        if(!a.isUndefined(content)) {
            this.each(function() {
                this.innerHTML = content;
            });
            return this;
        } else {
            var results = [];
            this.each(function() {
                results.push(this.innerHTML);
            });
            if(results.length === 0) {
                return '';
            } else if(results.length === 1) {
                return results[0];
            }
            return results;
        }
    },

    /**
     * Apply on each elements the given function.
     *
     * @chainable
     *
     * @param {Function} fct                The function to apply to elements
     * Other parameters are passed to every function call as arguments
    */
    each: function() {
        var list          = this.elementList,
            argumentArray = a.toArray(arguments),
            fct           = argumentArray[0],
            args          = argumentArray.slice(1);

        fct = a.isFunction(fct) ? fct : function() {};
        a.each(list, function(element) {
            // Calling element with this as element currently selected
            fct.apply(element, args);
        });
        return this;
    }
    /*!
     * @private
    */
};;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manipulate page hash, be able to retrieve also the list of hash
        previously used.

************************************************************************ */


/**
 * Manipulate page hash, be able to retrieve also the list of hash previously
 * used.
 *
 * @constructor
*/
a.hash = new function() {
    var previousHash  = null,
        traceHashList = [],
        that          = this,
        store         = a.mem.getInstance('app.hash');

    // The traceHashList is linked to store
    store.set('history', traceHashList);

    /**
     * Retrieve the current system hash.
     *
     * @private
     *
     * @return {String | Null}              The hash, or null if nothing is set
     */
    function getCurrentPageHash() {
        var h = window.location.hash;
        return h ? h.substring(1) : null;
    }


    /**
     * Store the latest event appearing into a store.
     *
     * @private
     *
      @param {String} hash                  The new hash incoming
    */
    function registerNewHash(hash) {
        store.set('current', hash);

        // Store both hash and time used
        traceHashList.push({
            hash: hash,
            time: (new Date()).getTime()
        });

        // Remove exceed hash stored
        while(traceHashList.length > 500) {
            traceHashList.shift();
        }
    }

    /**
     * Check for existing hash, call the callback if there is any change.
     *
     * @private
     */
    function checkAndComputeHashChange(evt) {
        //Extracting hash, or null if there is nothing to extract
        var currentHash = null;

        // Current hash is superseeded by the event one...
        if(evt && evt.originalEvent && evt.originalEvent.newURL) {
            var newUrl = evt.originalEvent.newURL;
            currentHash = newUrl.substring(newUrl.indexOf('#') + 1);
        } else {
            currentHash = getCurrentPageHash();
        }

        if(previousHash != currentHash) {
            registerNewHash(currentHash);
            // Dispatch event
            var eventObject = {
                value: currentHash,
                old:   previousHash
            };
            that.dispatch('change', eventObject);
            a.message.dispatch('a.hash.change', eventObject);
            previousHash = currentHash;
            store.set('previous', previousHash);
        }
    }

    // Initiate the system (when appstorm is ready !)
    a.on('ready', function() {
        checkAndComputeHashChange();
    });

    // The onhashchange exist in IE8 in compatibility mode,
    // but does not work because it is disabled like IE7
    if( ('onhashchange' in window) &&
        (document.documentMode === undefined || document.documentMode > 7)) {
        //Many browser support the onhashchange event, but not all of them
        a.dom.eventListener.bind(window, 'hashchange',
                            checkAndComputeHashChange, null);
    } else {
        //Starting manual function check, if there is no event to attach
        a.timer.add(checkAndComputeHashChange, null, 50);
    }


    /**
     * Fake the hashtag change (can be usefull sometimes), it really apply
     * hash change, but does not change the browser hashtag.
     *
     * @param {String} currentHash          The hash to fake
    */
    this.fake = function(currentHash) {
        if(previousHash != currentHash) {
            registerNewHash(currentHash);
            // Dispatch event
            var eventObject = {
                value: currentHash,
                old:   previousHash
            };
            that.dispatch('change', eventObject);
            a.message.dispatch('a.hash.change', eventObject);
        }
        previousHash = currentHash;
        store.set('previous', previousHash);
    };

    /**
     * Retrieve the current system hash.
     *
     * @return {String | Null}              The hash, or null if nothing is set
     */
    this.getHash = function() {
        return getCurrentPageHash();
    };

    /**
     * Retrieve the current system hash (getHash alias).
     *
     * @return {String | Null}              The hash, or null if nothing is set
    */
    this.get = function() {
        return getCurrentPageHash();
    };

    /**
     * Get the previous page hash (can be null).
     *
     * @return {String | Null}              The hash, or null if nothing is set
    */
    this.getPreviousHash = function() {
        return previousHash;
    };

    /**
     * Force the system to set a specific hash.
     *
     * @param {String} value                The hash to set
     */
    this.setPreviousHash = function(value) {
        previousHash = value;
        store.set('previous', previousHash);
    };

    /**
     * Get list of existing previous hash used into system.
     *
     * @return {Array}                      An array with all hash
     *                                      done since beginning
    */
    this.trace = function() {
        return traceHashList;
    };
};

// Erasing previous a.hash and add event system to it
a.hash = a.extend(a.hash, new a.eventEmitter('a.hash'));;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Send a request to server side

************************************************************************ */



(function(a) {
    /**
     * Ajax cache object, used to store cached request and retrieve it if possible.
     *
     * @private
    */
    var ajaxCache = {
        /**
         * Add a new cached ajax element.
         *
         * @private
         *
         * @param {String} method               GET/POST/PUT/DELETE/...
         * @param {String} url                  The url to catch
         * @param {Object} results              The related result
         * @param {Integer} timeout             The timeout (in ms)
        */
        add: function(method, url, results, timeout) {
            if(timeout <= 0) {
                timeout = 1000;
            }

            var id = a.uniqueId(),
                obj = {
                id: id,
                method: method.toUpperCase(),
                url: url,
                results: results
            };

            a.mem.set('app.ajax.cache.' + obj.id, obj);

            // Creating the auto-delete timeout
            setTimeout(a.scope(function() {
                a.mem.remove('app.ajax.cache.' + this.id);
            }, obj), timeout);
        },

        /**
         * Get a previously cached element.
         *
         * @private
         *
         * @param {String} method               GET/POST/PUT/DELETE/...
         * @param {String} url                  The url to catch
         * @return {Object | Null}              Return the previously stored
         *                                      element or null if nothing is
         *                                      found
        */
        get: function(method, url) {
            if(!method || !url) {
                return null;
            }
            method = method.toUpperCase();

            var mem = a.mem.getInstance('app.ajax.cache'),
                list = mem.list();

            for(var key in list) {
                var element = list[key];

                if(element.method === method && element.url === url) {
                    return element.results;
                }
            }
            return null;
        }
    };

    /**
     * Help to get a new model, or update an existing one, regarding
     * primary keys inside a model.
     *
     * @private
     *
     * @param {String} name                 The model name to search instance
     * @param {Array} primaries             List of primary key inside the
     *                                      model
     * @param {Object} content              The content of current model
     *                                      data (containing the primary
     *                                      key's data to match)
     * @return {a.modelInstance}            The new model created
    */
    function getOrCreateModel(name, primaries, content) {
        if(a.isNone(primaries) || (a.isArray(primaries) && 
            primaries.length === 0)) {
            return a.model.pooler.createInstance(name);
        } else {
            var search = {};
            // Adding primaries to search
            for(var i=0, l=primaries.length; i<l; ++i) {
                var tmp = content[primaries[i]];
                if(tmp) {
                    search[primaries[i]] = tmp;
                }
            }

            // Adding last model search
            search.modelName = name;

            var found = a.model.pooler.searchInstance(search);

            if(found.length > 0) {
                return found[0];
            } else {
                return a.model.pooler.createInstance(name);
            }
        }
    }

    /**
     * Ajax object to call server.
     *
     * @constructor
     *
     * @param {Object} options                  An option map to change
     *                                          the behaviour of component
     * @param {Function} success                The success function called
     *                                          in case of async
     * @param {Function} error                  The error function called in
     *                                          case of async
    */
    a.ajax = function(options, success, error) {
        'use strict';

        var templates = [a.getDefaultAjaxOptions()];

        // Transforming single element into array
        if(a.isString(options.template) && options.template) {
            options.template = [options.template];
        }

        // Parsing array of templates
        if(a.isArray(options.template)) {
            for(var t=0, n=options.template.length; t<n; ++t) {
                var tmpAjaxOpt = a.getTemplateAjaxOptions(options.template[t]);
                if(a.isTrueObject(tmpAjaxOpt)) {
                    templates.push(tmpAjaxOpt);
                }
            }
        }

        this.params = {
            before : [],      // Allowed type : any string function name
            url    : '',      // Allowed type : any URL
            method : 'GET',   // Allowed type : "GET", "POST"
            type   : 'raw',   // Allowed type : raw, json, xml
            async  : true,    // Allowed type : true, false
            cache  : false,   // Allowed type : true, false
            store  : '',      // Allowed type : string like 4s
            data   : {},      // Allowed type : any kind of object | key => value
            header : {},      // Allowed type : any kind of object | key => value
            many   : false,   // Allowed type : true, false
            model  : '',      // Allowed type : any model name
            after  : []       // Allowed type : any string function name
        };

        // We override the cache by the "default" value
        if(a.environment.get('ajax.cache') === true) {
            this.params.cache = true;
        }

        // Binding options
        for(var p in this.params) {
            if(p === 'data' || p === 'header') {
                continue;
            }

            // We check given options are same type (from specific request)
            for(var o=0, l=templates.length; o<l; ++o) {
                var tmpl = templates[o];
                if(p in tmpl && typeof(tmpl[p]) === typeof(this.params[p])) {
                    // Special case for array
                    if(a.isArray(tmpl[p])) {
                        this.params[p] = a.union(this.params[p], tmpl[p]);
                    } else {
                        this.params[p] = tmpl[p];
                    }
                }
            }

            // We check given options are same type (from specific request)
            if(p in options && typeof(options[p]) === typeof(this.params[p])) {
                this.params[p] = options[p];
            }
        }

        // Now we take care of special case of data and header
        for(var i=0, y=templates.length; i<y; ++i) {
            var tmpla = templates[i];

            if(a.isTrueObject(tmpla.data)) {
                for(var d in tmpla.data) {
                    this.params.data[d] = tmpla.data[d];
                }
            }

            if(a.isTrueObject(tmpla.header)) {
                for(var h in tmpla.header) {
                    this.params.header[h] = tmpla.header[h];
                }
            }
        }

        if(a.isString(options.data)) {
            this.params.data = options.data;
        } else if(a.isTrueObject(options.data)) {
            for(var dd in options.data) {
                this.params.data[dd] = options.data[dd];
            }
        }

        if(a.isTrueObject(options.header)) {
            for(var hh in options.header) {
                this.params.header[hh] = options.header[hh];
            }
        }

        // Binding result function
        this.success = (a.isFunction(success)) ? success : function(){};
        this.error   = (a.isFunction(error)) ? error : function(){};

        // Detecting browser support of ajax (including old browser support
        this.request = null;
        if(!a.isNone(window.XMLHttpRequest)) {
            this.request = new XMLHttpRequest();
        // Internet explorer specific
        } else {
            var msxml = [
                'Msxml2.XMLHTTP.6.0',
                'Msxml2.XMLHTTP.3.0',
                'Msxml2.XMLHTTP',
                'Microsoft.XMLHTTP'
            ];
            for(var w=0, q=msxml.length; w<q; ++w) {
                try {
                    this.request = new ActiveXObject(msxml[w]);
                } catch(e) {}
            }
        }
    };

    /**
     * Parse the data to return the formated object (if needed).
     *
     * @private
     *
     * @param {Object} params                   The parameter list from
     *                                          configuration ajax
     * @param {Object} http                     The xmlHttpRequest started
     * @return {Object | String}                The parsed results
    */
    a.ajax.prototype.parseResult = function(params, http) {
        // Escape on special case HTTP 204
        if(http.status === 204) {
            return '';
        }

        //We are in non async mode, so the function should reply something
        var type = params.type.toLowerCase(),
            result = (type === 'json') ? a.parser.json.parse(http.responseText):
                    (type === 'xml') ? http.responseXML:
                    http.responseText;

        // User is asking for a model convertion
        if(params.model) {
            var modelName = params.model,
                errorStr = 'Model ' + modelName +
                            ' not found, empty object recieve Model Pooler';

            // We get primary elements from model
            var primaries = a.model.pooler.getPrimary(modelName);

            // Model not found
            if(primaries === null) {
                a.console.storm('error', 'a.ajax', errorStr, 1);

            // No primaries into the model, we create new model
            } else if(params.many === true && a.isArray(result)) {
                var content = [];
                for(var i=0, l=result.length; i<l; ++i) {
                    var data = result[i],
                        model = getOrCreateModel(modelName, primaries,
                                                            data);
                    if(model !== null) {
                        model.fromObject(data);
                        content.push(model);
                    } else {
                        a.console.storm('error', 'a.ajax', errorStr, 1);
                    }
                }
                // We replace
                result = content;
            } else {
                var fmdl = getOrCreateModel(modelName, primaries, result);

                // This test is probably not neeeded, but, who knows,
                // maybe one day it will raise to power and conquer
                // the world.
                if(fmdl) {
                    fmdl.fromObject(result);
                    result = fmdl;
                } else {
                    a.console.storm('error', 'a.ajax', errorStr, 1);
                }
            }
        }

        // After to use/parse on object
        if(params.hasOwnProperty('after')) {
            for(var t=0, k=params.after.length; t<k; ++t) {
                var fct = a.getAjaxAfter(params.after[t]);
                if(a.isFunction(fct)) {
                    result = fct.call(this, params, result);
                }
            }
        }

        // We cache if needed
        if(params.hasOwnProperty('store') && params.store) {
            var store = params.store,
                multiplier = 1;

            if(store.indexOf('min') > 0) {
                multiplier = 60000;
            } else if(store.indexOf('h') > 0) {
                multiplier = 3600000;
            } else if(store.indexOf('s') > 0) {
                multiplier = 1000;
            }

            // Adding element to store
            ajaxCache.add(params.method, params.url, result, 
                multiplier * parseInt(params.store, 10));
        }

        return result;
    };

    /**
     * Manually abort the request.
    */
    a.ajax.prototype.abort = function() {
        try {
            this.request.abort();
        } catch(e) {}
    };

    /**
     * Send the ajax request.
    */
    a.ajax.prototype.send = function() {
        var method = this.params.method.toUpperCase();

        // Skip request in some case, due to mock object (first test)
        var mockResult = a.mock.get(method, this.params.url);
        if(mockResult !== null) {
            var params = this.params;

            // We send a result
            a.message.dispatch('a.ajax', {
                success : true,
                status  : 200,
                url     : params.url,
                method  : method,
                params  : params
            });

            // Directly call success function
            this.success(mockResult, 200);

            // We don't proceed request
            return;
        }

        // We search for cached element
        if(a.isArray(this.params.before)) {
            var befores = this.params.before;
            for(var i=0, l=befores.length; i<l; ++i) {
                var before = a.getAjaxBefore(befores[i]);
                if(a.isFunction(before)) {
                    this.params = before.call(this, this.params);
                }
            }
        }

        // We search for cached element
        var cached = ajaxCache.get(
                            this.params.method || 'GET', this.params.url || '');
        // Something is existing, we return it instead or performing request
        if(cached) {
            this.success(cached, 200);
            return;
        }

        //Creating a cached or not version
        if(this.params.cache === false) {
            // Generate a unique random number
            var rnd = a.uniqueId('rnd_');
            // Safari does not like this...
            try {
                this.params.data.cachedisable = rnd;
            } catch(e) {}
        }

        //Creating the url with GET
        var toSend = '';

        if(a.isString(this.params.data)) {
            toSend = this.params.data;
        } else {
            for(var d in this.params.data) {
                toSend += encodeURIComponent(d) + '=' +
                        encodeURIComponent(this.params.data[d]) + '&';
            }
            //toSend get an extra characters & at the end, removing it
            toSend = toSend.slice(0, -1);
        }

        var url = this.params.url,
            async = this.params.async;
        if(method == 'GET' && toSend) {
            url += '?' + toSend;
        }

        //Catching the state change
        if(async === true) {
            // Scope helper
            var requestScope = {
                success     : this.success,
                params      : this.params,
                error       : this.error,
                request     : this.request,
                parseResult : this.parseResult
            };

            this.request.onreadystatechange = function() {
                // In some cases, the requestScope may be invalid
                // If user cancel the ajax request, so we use this try/catch
                // To prevent this error.
                var status = -1;
                try {
                    status = requestScope.request.status;
                } catch(e) {
                    return;
                }
                // Any 200 status will be validated
                if(requestScope.request.readyState === 4) {
                    // 0: on local filesystem, a HTTP 200 is given as 0
                    var great = (status >= 200 && status < 400) || status === 0 || status === 1223;
                    // IE9 Bug as reported in jQuery.
                    if (status === 1223) {
                        status = 204;
                    }
                    if(great) {
                        // Everything went fine
                        requestScope.success(
                            requestScope.parseResult(requestScope.params,
                                                        requestScope.request),
                            status
                        );
                    } else {
                        // An error occurs
                        requestScope.error(url, status);
                    }

                    // We send a result
                    a.message.dispatch('a.ajax', {
                        success : great,
                        status  : status,
                        url     : requestScope.params.url,
                        method  : requestScope.method,
                        params  : requestScope.params
                    });
                }
            };
        }

        //Openning the url
        this.request.open(method, url, async);

        //Setting headers (if there is)
        var contentTypeDefault = ['Content-Type', 'Content-type', 'content-type'],
            contentTypeFound   = false;
        for(var header in this.params.header) {
            this.request.setRequestHeader(header, this.params.header[header]);

            // In case of POST:
            //   a specific content type (a default one) may be needed
            if(!contentTypeFound && a.contains(contentTypeDefault, header)) {
                contentTypeFound = true;
            }
        }

        // Set a default one if not already set by user
        if(!contentTypeFound && method === 'POST') {
            this.request.setRequestHeader(
                'Content-type',
                'application/x-www-form-urlencoded'
            );
        }

        // Skip request in some case, due to mock object (second test)
        mockResult = a.mock.get(method, this.params.url);
        if(mockResult !== null) {
            // We send a result
            a.message.dispatch('a.ajax', {
                success : true,
                status  : 200,
                url     : this.params.url,
                method  : method,
                params  : this.params
            });

            // Directly call success function
            this.success(mockResult, 200);

            // We don't proceed request
            return;

        // We proceed normal ajax request
        } else {
            this.request.send(toSend);
        }

        return (async === false) ?
                this.parseResult(this.params, this.request) :
                'No return in async mode';
    };


    /*
     * -------------------------------
     *   APPSTORM TEMPLATE
     * -------------------------------
    */
    // Some basic template to use
    a.setTemplateAjaxOptions('json', {
        type: 'json',
        header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    a.setTemplateAjaxOptions('xml', {
        type: 'xml',
        header: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml'
        }
    });

    // Many models
    a.setTemplateAjaxOptions('list', {many: true});
    a.setTemplateAjaxOptions('array', {many: true});
    a.setTemplateAjaxOptions('many', {many: true});

    // Cache management
    a.setTemplateAjaxOptions('cache-enable', {
        cache: true
    });
    a.setTemplateAjaxOptions('cache-disable', {
        cache: false
    });

    // Creating http verb
    var verbs = ['POST', 'PUT', 'GET', 'DELETE', 'HEAD', 'OPTIONS',
                 'CONNECT', 'TRACE', 'PATCH'];
    for(var z=0, r=verbs.length; z<r; ++z) {
        (function(verb) {
            a.setTemplateAjaxOptions(verb, {
                method: verb
            });
        })(verbs[z]);
    }

})(window.appstorm);;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Dynamic loader for many files type

************************************************************************ */


/**
 * Dynamic loader for many files type.
 *
 * @constructor
*/
a.loader = (function() {
    'use strict';

    // Store some cache here
    var internalCache = [],
        // Store the number of css files currently loading threw timer hack...
        nCSS          = 0,
        nJS           = 0,
        htmlMethods   = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

    /**
     * Check the cache, and launch callback if uri is already listed in cache.
     *
     * @private
     * @async
     *
     * @param {String} uri                  The path to access data
     * @param {Function | Null} callback    The callback to apply after loader
     * @return {Boolean}                    True if it's already inside cache,
     *                                      and false in other case
    */
    function checkInternalCache(uri, callback) {
        // Search in cache
        if(a.isNone(uri)) {
            return false;
        }

        for(var i=0, l=internalCache.length; i<l; ++i) {
            if(internalCache[i] === uri) {
                // This exist in cache, we directly call callback
                if(a.isFunction(callback)) {
                    callback();
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Insert into cache if needed the uri.
     *
     * @private
     *
     * @param {String} uri                  The path to access data
     * @param {Object} args                 The arguments to check if cache
     *                                      is specified and policy to use
    */
    function populateInternalCache(uri, args) {
        // By default, we cache
        if(!a.isNone(args) && args.cache === false) {
            return;
        }
        internalCache.push(uri);
    }

    /**
     * Append to header the given tag, used by JS and CSS loader especially.
     *
     * @private
     * @async
     *
     * @param {DOMElement} el               A createElement type result
     * @param {Object} options              HTML Options to add to link
     *                                      appended
     * @param {Function | Null} callback    The callback to apply after loader
     * @param {String} uri                  The path to access data
     * @param {Object | Null} args          The arguments to check if cache
     *                                      is specified and policy to use
     * @param {Function | Null} error       The callback to raise in case
     *                                      of problem (never used)
    */
    function appendElementToHeader(el, options, callback, uri, args, error) {
        for(var i in options) {
            el.setAttribute(i, options[i]);
        }

        if(!a.isNone(args) && args.id) {
            el.setAttribute('id', args.id);
        }

        // Handle if system already trigger or not callback

        var trigger = false;
        // The common callback for both onload and readystatechange
        var cb = function(e) {
            if(trigger) {
                return;
            }

            trigger = true;
            if(a.isFunction(callback)) {
                callback(el);
            }
            populateInternalCache(uri, args);
        };

        if(el.addEventListener) {
            el.addEventListener('load', cb, false);
        } else if(el.readyState) {
            el.onreadystatechange = function() {
                if (this.readyState == 'complete' ||
                        this.readyState == 'loaded') {
                    cb();
                }
            };
        } else {
            el.onload = cb;
        }

        // Hack for old Firefox/webkit browsers
        // (who does not have onload on link elements)
        //
        // Note : using 'onload' in document.createElement('link')
        // is not always enough
        //
        // By default, too many browser got this bug, so we always activate it
        if(options.type === 'text/css') {
            var currentCSS = document.styleSheets.length;
            nCSS++;
            var cssLoad = a.timer.add(function() {
                if (document.styleSheets.length > (currentCSS + nCSS-1)) {
                    nCSS--;
                    a.timer.remove(cssLoad);
                    cb();
                }   
            }, null, 50);
        }

        // Inserting document into header
        document.getElementsByTagName('head')[0].appendChild(el);
    }

    /**
     * load some data threw AJAX.
     *
     * @private
     * @async
     *
     * @param {String} uri                  The data path
     * @param {Function | Null} callback    The callback to apply in
     *                                      case of success
     * @param {Object | Null} args          An ajax argument object,
     *                                      not all of them are used
     *                                      (some are automatically generated
     *                                      and cannot be changed)
     * @param {Function | Null} error       The callback to apply
     *                                      in case of error
    */
    function performAjaxLoading(uri, callback, args, error) {
        var options = {
            url    : uri,   //Allowed type : any URL
            method : 'GET', //Allowed type : 'GET', 'POST'
            type   : 'raw', //Allowed type : raw, json, xml
            async  : true,  //Allowed type : true, false
            cache  : true,  //Allowed type : true, false
            data   : {},    //Allowed type : any kind of object | key => value
            header : {}     //Allowed type : any kind of object | key => value
        };

        a.console.storm('log', 'a.loader',
                'Loading resource from url ```' + uri + '```', 3);

        if(!a.isNone(args)) {
            if(a.contains(htmlMethods, args.method) ) {
                options.method = args.method;
            }
            if(!a.isNone(args.type) &&
                    (args.type == 'json' || args.type == 'xml') ) {
                options.type = args.type;
            }
            if(a.isTrueObject(args.data)) {
                options.data = args.data;
            }
            if(a.isTrueObject(args.header)) {
                options.header = args.header;
            }
            if(a.isBoolean(args.cache)) {
                options.cache = args.cache;
            }
        }

        // The real callback handling response
        var handlerCallback = function(content, status) {
            if(a.isFunction(callback)) {
                callback(content, status);
            }
            populateInternalCache(uri, args);
        };

        // Loading data
        var er = (a.isFunction(error)) ? error : function(){};
        (new a.ajax(options, handlerCallback, er)).send();
    }

    return {
        /**
         * Javascript loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        js: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            this.jsonp(uri, callback, args, error);
        },

        /**
         * JSONP loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        jsonp: function(uri, callback, args, error){
            var type = (a.isTrueObject(args) && args.type) ? args.type
                        : 'text/javascript';

            a.console.storm('log', 'a.loader',
                    'Loading resource from url ```' + uri + '```', 3);

            appendElementToHeader(document.createElement('script'), {
                    type : type,
                    src : uri
                }, callback, uri, args, error
            );
        },

        /**
         * JSON loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        json: function(uri, callback, args, error) {
            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'json';

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'application/json, text/javascript';

            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * XML loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        xml: function(uri, callback, args, error) {
            // Setting the type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'xml';

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'application/xml, text/xml';

            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * CSS loader.
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        css: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            a.console.storm('log', 'a.loader',
                    'Loading resource from url ```' + uri + '```', 3);

            appendElementToHeader(document.createElement('link'), {
                    rel  : 'stylesheet',
                    type : 'text/css',
                    href : uri
                }, callback, uri, args, error
            );
        },

        /**
         * HTML loader.
         * NOTE : only valid XHTML is accepted !
         *
         * @async
         *
         * @param {String} uri               The path to access content
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        html: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            // Setting type
            if(!a.isTrueObject(args)) {
                args = {};
            }
            args.type = 'raw';

            // In debug mode, we disallow cache
            if(a.environment.get('app.debug') === true) {
                args.cache = false;
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header.accept = 'text/html';
            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * JavaFX loader.
         *
         * @async
         *
         * @param {String} uri               The path for given jar files to
         *                                   load
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An object to set property for
         *                                   javaFX (like javascript name...),
         *                                   we need : args.code (the main to
         *                                   start), args.id (the id of
         *                                   project). args.width and height
         *                                   are optional
        */
        javafx: function (uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.code) || a.isNone(args.id)) {
                var errorStr =  'The system need args.code ';
                    errorStr += 'and args.name setted to be able to load any ';
                    errorStr += 'javafx resource... This uri will not be ';
                    errorStr += 'loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.javafx', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, callback)) {
                return;
            }

            // Load (if needed) javaFX javascript include helper
            var version = (args.version) ? args.version : '1.3';
            this.js('http://dl.javafx.com/' +version+ '/dtfx.js', function() {
                javafx({
                    archive: uri,
                    width: args.width || 1,
                    height: args.height || 1,
                    code: args.code,
                    name: args.id
                });
            });

            // There is no 'load' event, so we emulate one
            var timer = null,
                max = 2000;

            timer = a.timer.add(function() {
                // Valid when max <ait occurs or system is loaded
                if(max-- > 0 && !a.isNone(
                        document.getElementById(args.id).Packages)) {
                    a.timer.remove(timer);
                    if(a.isFunction(callback)) {
                        callback();
                    }
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Flash loader.
         *
         * @async
         *
         * @param {String} uri               The path for given swf files to
         *                                   load
         * @param {Function | Null} callback The callback to call after
         *                                   loading success
         * @param {Object} args              An object to set property for
         *                                   Flash
        */
        flash: function (uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr +='parameters: rootId and id, setted to be able ';
                    errorStr += 'to load any flash resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.flash', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, callback)) {
                return;
            }

            // Load (if needed) the swfobject.js to load flash from that
            this.js(a.url + 'vendor/storage/flash/swfobject.js', function() {
                swfobject.embedSWF(
                        uri,
                        args.rootId,
                        '100%',
                        '100%',
                        '10.0.0',
                        a.url + 'vendor/storage/flash/expressInstall.swf',
                        args.flashvars,
                        args.params,
                        {id : args.id},
                function(e) {
                    // We do make a small timeout, for a strange reason 
                    // the success event is not really ready
                    if(e.success === false && a.isFunction(error)) {
                        error(uri, 408);
                    }else if(e.success === true && a.isFunction(callback)) {
                        setTimeout(callback, 500);
                    }
                });
            });
        },

        /**
         * Silverlight loader.
         *
         * @async
         *
         * @param {String} uri               The path for given xap files to
         *                                   load
         * @param {Function | Null} callback The callback to call after
         *                                   loading success (NOTE: silverlight
         *                                   is not able to fire load event,
         *                                   so it's not true here...)
         * @param {Object} args              An object to set property for
         *                                   Silverlight
        */
        silverlight: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var errorStr =  'The system need args ';
                    errorStr += 'parameters: rootId, id, setted to be able ';
                    errorStr +='to load any silverlight resource... This uri ';
                    errorStr += 'will not be loaded ```' + uri + '```';

                a.console.storm('warn', 'a.loader.silverlight', errorStr, 2);
                return;
            }

            if(checkInternalCache(uri, callback)) {
                return;
            }

            a.console.storm('log', 'a.loader',
                    'Loading resource from url ```' + uri + '```', 3);

            var obj  = document.createElement('object');
            obj.id   = args.id;
            obj.data = 'data:application/x-silverlight-2,';
            obj.type = 'application/x-silverlight-2';

            if(!a.isArray(args.params)) {args.params = [];}

            // Adding URI to element
            args.params.push({name : 'source', value : uri});

            for(var i=0, l=args.params.length; i<l; ++i) {
                var param = document.createElement('param');
                param.name = args.params[i].name;
                param.value = args.params[i].value;
                obj.appendChild(param);
            }

            document.getElementById(args.rootId).appendChild(obj);

            // There is no 'load' event, so we emulate one
            var timer = null,
                max = 2000;

            timer = a.timer.add(function() {
                // Valid when max <ait occurs or system is loaded
                if(max-- > 0 &&
                        !a.isNone(document.getElementById(args.id).Content)) {

                    a.timer.remove(timer);
                    callback();
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Get the cache trace loaded.
         *
         * @return {Array}                  The cache trace
        */
        trace: function() {
            return internalCache;
        }
    };
}());;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manage action related to hash change.

************************************************************************ */


/**
 * Manage action related to hash change.
 *
 * @constructor
*/
a.route = new function() {
    var mem = a.mem.getInstance('app.route');

    /**
     * Parse the action parameter.
     *
     * @private
     *
     * @param {String} action               The action to filter
     * @return {String}                     'leave' or 'enter' depending on
     *                                      what is found in action parameter
    */
    function getAction(action) {
        return (action == 'leave' || action == 'leaving') ? 'leave' : 'enter';
    }

    /**
     * bind a function to a hash.
     *
     * @chainable
     *
     * @param {String} hash                 The hash to register
     * @param {Function} fct                The function to bind
     * @param {String | Null} action        The action element, if we use this
     *                                      for entering hash, or leaving hash
     *                                      (default: entering), possible val:
     *                                      'leave' or 'enter'
    */
    this.bind = function(hash, fct, action) {
        action = getAction(action) + '.hash';
        var storage = mem.get(action) || {};

        if(!storage[hash]) {
            storage[hash] = [];
        }

        storage[hash].push(fct);
        mem.set(action, storage);
        return this;
    };

    /**
     * Remove a binding with a previous hash associated.
     *
     * @chainable
     *
     * @param {String} hash                 The hash to remove function from
     * @param {Function} fct                The function to unbind
     * @param {String | Null} action        The action element, if we use this
     *                                      for entering hash, or leaving hash
     *                                      (default: entering), possible val:
     *                                      'leave' or 'enter'
    */
    this.unbind = function(hash, fct, action) {
        action = getAction(action) + '.hash';
        var storage = mem.get(action) || {};
        if(storage[hash]) {
            storage[hash] = a.without(storage[hash], fct);
            if(storage[hash].length < 1) {
                delete storage[hash];
            }
            mem.set(action, storage);
        }
        return this;
    };

    /**
     * The otherwise function is used when no function are linked to a given
     * hash.
     *
     * @chainable
     *
     * @param {Function} fct                The function to use when otherwise
     *                                      is meet
     * @param {String | Null} action        The action element, if we use this
     *                                      for entering hash, or leaving hash
     *                                      (default: entering), possible val:
     *                                      'leave' or 'enter'
    */
    this.otherwise = function(fct, action) {
        action = getAction(action) + '.otherwise';
        if(a.isNone(fct)) {
            mem.remove(action);
        } else {
            mem.set(action, fct);
        }
        return this;
    };

    /**
     * Navigate to a given hashtag.
     *
     * @param {String} hash                 The hashtag to navigate to
     * @param {Object} parameters           Any parameters to give to state
     *                                      system as temp data. This is an
     *                                      equivalent to a.state.inject func.
    */
    this.go = function(hash, parameters) {
        if(parameters) {
            a.state.inject(parameters);
        }
        if(hash) {
            //if( ('history' in window) && history.pushState ) {
            //    window.history.pushState(parameters || {}, null, '#' + hash);
            //} else {
                window.location.href = '#' + hash;
            //}
        }
    };

    // Aliases
    this.href     = this.go;
    this.ref      = this.go;
    this.hash     = this.go;
    this.hashtag  = this.go;
    this.navigate = this.go;

    /**
     * This function act like the go/href/ref/hash/hashtag/navigate function,
     * but fake it (hash in browser does not really change).
     *
     * @method fake
     *
     * @param {String} hash                 The hashtag to navigate to
     * @param {Object} parameters           Any parameters to give to state
     *                                      system as temp data. This is an
     *                                      equivalent to a.state.inject func.
    */
    this.fake = function(hash, parameters) {
        if(parameters) {
            a.state.inject(parameters);
        }
        if(hash) {
            a.hash.fake(hash);
        }
    };

    /**
     * Go back one time into history.
    */
    this.back = function() {
        window.history.back();
    };

    /**
     * Apply change to hash on enter or leave position.
     *
     * @private
     *
     * @param {String} hash                 The hash to load/unload
     * @param {String} leaveOrEnterString   The enter/leave state
    */
    function callApplyHashChange(hash, leaveOrEnterString) {
        var action  = mem.get(leaveOrEnterString + '.hash') || {},
            storage = action[hash] || [],
            i       = storage.length;
            found   = false;

        while(i--) {
            found = true;
            // We use setTimeout to switch into event type
            // To not have function locking system
            (function(index) {
                setTimeout(function() {
                    var fct = storage[index];
                    fct.call(null, hash);
                }, 0);
            })(i);
        }

        if(!found) {
            var otherwise = mem.get(leaveOrEnterString + '.otherwise');
            if(otherwise) {
                otherwise.call(null, hash);
            }
        }
    }

    // We bind the hash event system
    a.hash.bind('change', function(data) {
        callApplyHashChange(data.value, 'enter');
        callApplyHashChange(data.old,   'leave');
    }, null, false, false);
};
;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a way to manipulate, extract and replace parameters like
        {{id: [a-fA-F0-9]+}} as regular expression. This is intensly used
        by appstorm to check and manipulate parameters inside state plugin.

************************************************************************ */

/**
 * Provide a way to manipulate, extract and replace parameters like
 * {{id: [a-fA-F0-9]+}} as regular expression. This is intensly used
 * by appstorm to check and manipulate parameters inside state plugin.
 *
 * @contructor
*/
a.parameter = {
    /**
     * Store cached function to use as replacement method.
     *
     * @private
     * @property _fct
     * @type Object
     * @default {}
    */
    _fct: {},

    /**
     * From a given string, we extract parameter inside.
     *
     * @param {String} input                The string to extract param from
     * @param {RegExp | Null} customRegex   A new regex to replace current one
     * @return {Array}                      An array with every element as
     *                                      object key: name (the key name),
     *                                      regex (the linked regex),
     *                                      start (integer) as content
    */
    extract: function(input, customRegex) {
        // Example allowed : ' id : [a-fA-F0-9]+ is valid,
        // simple-te_st: [0-9]+ is valid too
        // valid : a-z and A-Z and 0-9 and -, _, [, ], +, ?, *
        // and of course () and \ and /
        // var regexParameterExtracter =
        //     /\{\{(\s*[a-zA-Z0-9-_-\-]+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi,
        var regexParameterExtracter = /\{\{(\s*[a-zA-Z0-9-\--_]+\s*:\s*[a-z0-9_\-\[\]\(\)\^.\|\+\*\?\\\/]+\s*)\}\}/gmi;

        var ex = !a.isNone(customRegex);
        if(ex) {
            regexParameterExtracter = customRegex;
        }

        // We extract all parameters
        var extractedParameters = [],
            match;

        while(match = regexParameterExtracter.exec(input)) {
            // We keep only the matching part
            var separated = null;

            if(ex) {
                // Handle default behaviour
                separated = ['hash', match[1]];
            } else {
                separated = match[1].split(':', 2);
            }

            // And now we trim to keep only content
            extractedParameters.push({
                original:  a.trim(match[0]),
                name:  a.trim(separated[0]),
                regex: a.trim(separated[1]),
                start: match.index
            });
        }

        // We return that content
        return extractedParameters;
    },

    /**
     * Replace a parameter at a specific position.
     *
     * @param {String} input                The string to use as replacement
     * @param {Object} param                An extracted parameter from
     *                                      extract function
     * @param {String | Null} custom        A custom string to add to system
     * @return {String}                     The string replaced with new
     *                                      content
    */
    replace: function(input, param, custom) {
        if(a.isNone(custom)) {
            custom = '(' + param.regex + ')';
        }
        return input.substr(0, param.start) + custom +
                    input.substr(param.start + param.original.length);
    },

    /**
     * Convert a parameter string into a regex string.
     *
     * @param {String} input                The string to convert
     * @param {RegExp | Null} customRegex   A custom regex if needed
     * @return {String}                     The converted string ready to be
     *                                      used as regex tester.
    */
    convert: function(input, customRegex) {
        var extracted = this.extract(input, customRegex),
            i = extracted.length;

        // We will replace into string the current parameter system with regex
        while(i--) {
            input = this.replace(input, extracted[i]);
        }

        return input;
    },


    /**
     * From a given list provided by extract functions, get the related
     * values and bring the new object with, for every regex, the corresponding
     * values.
     *
     * @param {String} input                The input value to extract data
     *                                      from
     * @param {String} internal             The original string regex
     * @param {Object} extract              The extracted object
     * @return {Object}                     The extracted object with values
     *                                      found
    */
    getValues: function(input, internal, extract) {
        var i = extract.length,
            working = '' + internal;

        // We create a huge -global- request matcher
        while(i--) {
            working = this.replace(working, extract[i]);
        }

        // We make a global extraction
        var regex      = new RegExp('^' + working + '$', 'gi'),
            match      = regex.exec(input);

        // Index start at 1, because 0 is the full sentence (unhelpfull here)
        for(var j=1, l=match.length; j<l; ++j) {
            extract[j-1].value = match[j];
        }

        return extract;
    },


    /**
     * Replace inside a given input, the parameters found in internal,
     * by value found in hash.
     * Example:
     *   As input
     *     The page hash (from url-hashtag) is /dashboad/39
     *     The page internal (from state) is /dashboard/{{id: [0-9]+}}
     *     The input (from state include for ex.) is http://mylink.com/{{id}}
     *   It will return
     *     http://mylink.com/39
     *   It also can manage different function loader threw addParameterType,
     *   so it can takes variable content not only from page hash...
     *
     * @param {String} input                The string to replace parameters
     *                                      inside
     * @param {String} hash                 The current string, to extract
     *                                      parameters from.
     * @param {String} internal             The hashtag stored internally
     *                                      (with parameters)
     * @param {Boolean | Null} escape       Indicate if system should escape
     *                                      content to string before sending
     *                                      back, it means if yes, the system
     *                                      will send back '[object object]'
     *                                      for an object (default: yes)
    */
    extrapolate: function(input, hash, internal, escape) {
        if(escape !== false) {
            escape = true;
        }

        // Only if there is some parameters in input
        if (a.isString(input) && input && input.indexOf('{{') >= 0 &&
                input.indexOf('}}') >= 0) {

            var emptyNameRegex = /\{\{(\s*\w+\s*)\}\}/gmi;
            // Param in input should be like this {{hash:name}} or
            // {{store:name}} so it should be same way

            var paramStr =      this.extract(input),
                paramInternal = this.extract(internal),
                extraStr =      this.extract(input, emptyNameRegex);

            // Merge default parameters, and new one
            paramStr = paramStr.concat(extraStr);

            // Now we extract chain
            var pi = paramInternal.length;
            while(pi--) {
                internal = this.replace(internal, paramInternal[pi]);
            }

            // We create regex to extract parameters
            var regex = new RegExp('^' + internal + '$', 'gi'),
            // This time the match will fully match at first time directly...
                match  = regex.exec(hash),
                result = [];

            // if we found a match, we just need to make
            // corresponding data from internal to match
            if(match) {
                var i=0,
                    l=paramInternal.length;
                for(; i<l; ++i) {
                    // match : the first item is direct string (not parsed)
                    paramInternal[i].value = match[i+1];
                }

                // We copy value from paramInternal to paramStr
                // everytime we found a name match
                for(var j=0, k=paramStr.length; j<k; ++j) {
                    for(i=0; i<l; ++i) {
                        // The paramStr is wrongly separate into
                        // hash: name (so regex is param name, and name type)
                        if(paramInternal[i].name === paramStr[j].regex &&
                                paramStr[j].name === 'hash') {
                            paramStr[j].value = paramInternal[i].value;
                        }
                    }
                }
            }

            // We perform final replace : storage replace and hashtag replace
            var ps = paramStr.length,
                pr = (escape === false) ? function(a, b, c){return c;} :
                                                                this.replace;

            while(ps--) {
                var param = paramStr[ps],
                    found = false;

                // Replacing hashtag
                if( (param.name === 'hash' || param.name === 'hashtag') &&
                        !a.isNone(param.value)) {

                    found = true;
                    input = this.replace(input, param, param.value);
                }

                if(!found) {
                    var handlers = this._fct;

                    a.each(handlers, function(handler, index) {
                        if(index == param.name) {
                            input = pr(input, param, handler(param.regex));
                        }
                    });
                }
            }
        }

        return input;
    },

    /**
     * Register a new function parameter (like {{memory: name}}).
     * Here the name will be memory, and the function: the function which will
     * be used to find corresponding name data.
     *
     * @param {String} name                 The parameter type (like 'memory')
     * @param {Function} fct                The function to apply when this
     *                                      parameter type is found
    */
    addParameterType: function(name, fct) {
        if(name && a.isString(name) && a.isFunction(fct)) {
            this._fct[name] = fct;
        }
    },

    /**
     * Unregister a function parameter (should almost never been in fact...).
     *
     * @param {String} name                 The function name to remove
    */
    removeParameterType: function(name) {
        delete this._fct[name];
    }
};



// We allow the 'mem' parameter which manipulate a.mem, and environment for
// same purpose

/*
------------------------------
  PARAMETERS TYPE ASSOCIATED
------------------------------
*/
(function() {
    a.parameter.addParameterType('mem',  a.mem.get);
    a.parameter.addParameterType('environment', a.environment.get);
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a simple ACL rules checker to create different application
        behavior regarding user role

************************************************************************ */


/**
 * Provide a simple ACL rules checker to create different application
 * behavior regarding user role.
 *
 * @constructor
*/
a.acl = a.extend(new function () {
    var mem = a.mem.getInstance('app.acl');

    /**
     * Set the current user role.
     *
     * @param {String} role                 The role to set as 'current' one
    */
    this.setCurrentRole = function (role) {
        mem.set('current', role);
        this.dispatch('change', role);
        a.message.dispatch('a.acl.change', role);
    };

    /**
     * Get the current user role stored.
     *
     * @return {String}                     The role found, or an empty
     *                                      string if nothing has been found
    */
    this.getCurrentRole = function () {
        return mem.get('current') || '';
    };

    /**
     * Set the current role list. This is used to compare the role to a list.
     *
     * SO: the list order is important! It has to go from the minimum role
     * (less privileges) to the maximum role (more privileges). Ex:
     * ['user', 'leader', 'super administrator']
     * is OK...
     * If one role is not listed here, and still used, it will be consider
     * as minimum role (less than all listed here).
     *
     * Note: this function is quite important, as it register related
     * handlebars helpers: if you create role ['admin', 'superAdmin'], it
     * will automatically create handlebars helpers 'isAdmin' and
     * 'isSuperAdmin', they will both accept a string as parameter, and work
     * as a if: {{isSuperAdmin 'superAdmin'}} will work,
     * {{isSuperAdmin 'superadmin'}} will work too (not case sensitive)
     * Note also you can't pass an object: {{isSuperAdmin user}} will not work
     * if user is not the role in string you want to check...
     *
     * @param {Array} roleList              The role list to store
    */
    this.setRoleList = function (roleList) {
        if (a.isArray(roleList)) {
            mem.set('list', roleList);

            // We create related Handlebars helpers for every role
            // Like you get a role 'adMin', it will create 'isAdMin' helper
            a.each(roleList, function (role) {
                var helper = a.firstLetterUppercase(role, 'is'),
                    lower  = role.toLowerCase();

                Handlebars.registerHelper(helper, function (value, options) {
                    if (a.trim(value.toLowerCase()) === a.trim(lower)) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });
            });
        }
    };

    /**
     * Get the current role list.
     *
     * @return {Array | Null}               The current role list stored, or
     *                                      null if nothing is found
    */
    this.getRoleList = function () {
        return mem.get('list');
    };

    /**
     * Check if current role is allowed compare to given minimum role.
     *
     * @param {String} minimumRole          The minimum role to check
     * @param {String | Null} currentRole   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The allowed (true) or refused
     *                                      (false) state
    */
    this.isAllowed = function (minimumRole, currentRole) {
        currentRole = currentRole || this.getCurrentRole();

        var positionCurrentRole = -1,
            positionMinimumRole = -1,
            roleList = this.getRoleList() || [],
            position = roleList.length;

        // Search position in current role list
        while (position--) {
            if (roleList[position]  == minimumRole) {
                positionMinimumRole = position;
            }

            if (roleList[position]  == currentRole) {
                positionCurrentRole = position;
            }

            // Stop before if possible
            if (positionMinimumRole != -1 && positionCurrentRole != -1) {
                break;
            }
        }

        return (positionCurrentRole >= positionMinimumRole);
    };

    /**
     * Check if current role is refused compare to given minimum role.
     *
     * @param {String} minimumRole          The minimum role to check
     * @param {String | null} currentRole   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The refused (true) or allowed
     *                                      (false) state
    */
    this.isRefused = function (minimumRole, currentRole) {
        return !this.isAllowed(minimumRole, currentRole);
    };

    /**
     * Clear the full ACL rules
    */
    this.clear = function () {
        mem.clear();
    };

}, new a.eventEmitter('a.acl'));



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
Handlebars.registerHelper('AclRole', function () {
    return new Handlebars.SafeString(a.acl.getCurrentRole());
});

// Allow to check role is allowed or not
Handlebars.registerHelper('AclIsAllowed', function (minimumRole, currentRole,
                                                                options) {
    // We allow 2 or 3 parameters mode !
    options = a.isString(currentRole) ? options : currentRole;
    currentRole = a.isString(currentRole) ? currentRole :
                                                a.acl.getCurrentRole();

    // We check role is allowed or not
    if (a.acl.isAllowed(minimumRole, currentRole)) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Allow to check role is refused or not
Handlebars.registerHelper('AclIsRefused', function (minimumRole, currentRole,
                                                                options) {
    // We allow 2 or 3 parameters mode !
    options = a.isString(currentRole) ? options : currentRole;
    currentRole = a.isString(currentRole) ? currentRole :
                                                a.acl.getCurrentRole();

    // We check role is allowed or not
    if (a.acl.isAllowed(minimumRole, currentRole)) {
        return options.inverse(this);
    }
    return options.fn(this);
});;/*! ***********************************************************************

    License: MIT Licence

    Description:
        The object is faking a server behavior to skip server creation during
        client creation. It provide a simple emulation of server side.

************************************************************************ */

/**
 * The object is faking a server behavior to skip server creation during
 * client creation. It provide a simple emulation of server side.
 *
 * @constructor
*/
a.mock = {
    /**
     * Store the existing mock to use with application
     *
     * @private
     * @property _mock
     * @type Array
     * @default []
    */
    _mock: [],

    /**
     * Rollback to default content (nothing).
     *
     * @method clear
    */
    clear: function() {
        a.mock._mock = [];
    },

    /**
     * Add a new mock to system
     *
     * @param {String} method               The HTTP method (GET/POST/PUT/...)
     * @param {String} url                  The url to catch
     * @param {Object | Function} result    The attempted result
     * @param {String | null} model         The model linked to the answer. Use
     *                                      's' at the end if it's a list of...
    */
    add: function(method, url, result, model) {
        var mocks = a.mock._mock;

        if(!method) {
            method = 'get';
        }

        mocks.push({
            method: method.toLowerCase(),
            url:    url,
            result: result || {},
            model:  model || null
        });
    },

    /**
     * Get an existing result from model
     *
     * @param {String} method               The HTTP method (GET/POST/PUT/...)
     * @param {String} url                  The url to catch
     * @return {Object | Null}              The result associated to mock
    */
    get: function(method, url) {
        var mocks = a.mock._mock,
            i = mocks.length;

        while(i--) {
            var mock = mocks[i];
            if(mock.method === method.toLowerCase() && mock.url === url) {
                if(a.isFunction(mock.result)) {
                    return mock.result();
                }
                return mock.result;
            }
        }
        return null;
    },

    /**
     * Get all mock related to model, and merge their content (= get a unique
     * object containing ALL properties found).
     *
     * @param {String} model                The model name to search
     * @return {Object}                     The merge realise, or an empty
     *                                      object if trouble
    */
    merge: function(model) {
        if(!model) {
            return {};
        }

        var result = {},
            mocks = a.mock._mock,
            i = mocks.length;

        // Creating a final object containings all properties found
        while(i--) {
            var mock = mocks[i],
                part = null;

            if(mock.model) {
                // Single model
                if(mock.model === model) {
                    part = a.isFunction(mock.result) ? mock.result() :
                                                                mock.result;
                    result = a.assign(result, part);

                // Multiple model
                } else if(mock.model === model + 's') {
                    part = a.isFunction(mock.result) ? mock.result() :
                                                                mock.result,
                        j = part.length;
                    while(j--) {
                        result = a.assign(result, part[j]);
                    }
                }
            }
        }

        // Try to (ONLY TRY) to find properties type
        // ONLY Try because it can easily fail by overwriting properties
        // can skip some type for given elements
        for(var j in result) {
            var property = result[j];

            if(a.isString(property)) {
                result[j] = 'string';
            } else if(a.isBoolean(property)) {
                result[j] = 'boolean';
            } else if(a.isNumber(property) && !a.isNaN(property)) {
                result[j] = 'number';
            } else if(a.isArray(property)) {
                result[j] = 'array';
            } else if(a.isTrueObject(property)) {
                result[j] = 'object';
            } else {
                result[j] = 'UNKNOW';
            }
        }

        return result;
    },

    /**
     * Generate a simple map of all urls/method couple you are currently using.
     * It is sorted by model type... If the model type is using a 's', for
     * now it still linked like this, as it was with a 's', we keep that for
     * saying 'those url returns array'.
     *
     * @return {Object}                     A related object
    */
    map: function() {
        var result = {},
            mocks = a.mock._mock,
            i = mocks.length;

        while(i--) {
            var mock = mocks[i];
            // Check model
            if(mock.model) {
                var model = mock.model,
                    method = mock.method;

                if(!result[model]) {
                    result[model] = {};
                }

                if(!result[model][method]) {
                    result[model][method] = [];
                }

                result[model][method].push(mock.url);

            // We are in 'unknow' mode
            } else {
                var unknow = 'unknow';
                if(!result[unknow]) {
                    result[unknow] = {};
                }

                if(!result[unknow][method]) {
                    result[unknow][method] = [];
                }

                result[unknow][method].push(mock.url);
            }
        }

        return result;
    }
};;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Simple wrapper for Mousetrap to have unified interface with
        AppStorm.JS system: it does provide multi binding for one key
        (compare to MouseTrap which only allow one key = one function)

************************************************************************ */

/**
 * Simple wrapper for Mousetrap to have unified interface with other part
 * of AppStorm.JS.
 *
 * @constructor
*/
a.keyboard = (function(mt) {
    'use strict';

    var mem = a.mem.getInstance('app.accelerator');

    /**
     * Remove all existing event binded to keyboard.
     *
     * @private
    */
    function clearAllKeyboardEvents() {
        mem.clear();
        mt.reset();
    }

    /**
     * Start to watch a key.
     *
     * @private
     *
     * @param {String} key              The key to bind (with type)
     * @return {Function}               A function to catch key event and
     *                                  dispatch
    */
    function generateKeyBinding(key) {
        return function globalKeyboardBinding(e) {
            var bindArray = mem.get(key) || [],
                i = bindArray.length,
                evtObject = {
                    stopPropagation: function() {
                        if(e.stopPropagation) {
                            e.stopPropagation();
                        } else {
                            e.cancelBubble = true;
                        }
                    },
                    preventDefault: function() {
                        if(e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    },
                    _e: e,
                    event: e,
                    originalEvent: e
                };

            var result = true;
            while(i--) {
                var fn  = bindArray[i].fct,
                    scp = bindArray[i].scope;

                // We don't apply a timeout here to catch return value
                var tmp = fn.call(scp, evtObject);
                if(tmp === false) {
                    result = false;
                }
            }

            return result;
        };
    }

    // No mousetrap support, create dummy empty object
    if(a.isNone(mt)) {
        a.console.storm('error', 'a.keyboard', 'Mousetrap is undefined!', 1);
        var nullFunction = function() {};
        return {
            bind: nullFunction,
            unbind: nullFunction,
            reset: nullFunction,
            clear: nullFunction
        };

    // Create a simple binding between Mousetrap implementation
    // and AppStorm.JS implementation
    } else {
        return {
            /**
             * Register a function for a given keypress command.
             *
             * @param {String} key           The key/keylist to bind
             * @param {Function} fn          The function to bind
             * @param {Object | Null} scope  The scope to apply when binding
             * @param {String | Null} type   The type like 'keydown', 'keyup'..
             *                               default: keypress
            */
            bind: function(key, fn, scope, type) {
                if(!key || !a.isFunction(fn)) {
                    return;
                }

                // Selecting the right type
                type = (a.isString(type) && type) ? type: 'keypress';

                var finalKey = type + '.' + key,
                    bindArray = mem.get(finalKey) || [];

                bindArray.push({
                    fct: fn,
                    scope: scope || mt
                });

                mem.set(finalKey, bindArray);

                // This is the first entry, start to watch the key binding
                if(bindArray.length === 1) {
                    var globalCatcher = generateKeyBinding(finalKey);
                    mt.bind(key, globalCatcher, type);
                }
            },

            /**
             * Remove a binding for a given key.
             *
             * @param {String} key          The key/keylist to unbind
             * @param {Function} fn         The function to unbind
             * @param {String | Null} type  The type like 'keydown', 'keyup'..
             *                              default: keypress
            */
            unbind: function(key, fn, type) {
                if(!a.isFunction(fn)) {
                    return;
                }

                // Selecting the right type
                type = (a.isString(type) && type) ? type: 'keypress';

                var finalKey = type + '.' + key,
                    bindArray = mem.get(finalKey) || [];

                if(bindArray) {
                    var i = bindArray.length;
                    while(i--) {
                        if(bindArray[i].fct === fn) {
                            bindArray.splice(i, 1);
                        }
                    }

                    // There is no binding anymore, we stop binding
                    if(bindArray.length === 0) {
                        mem.remove(finalKey);
                        mt.unbind(key, type);
                    }
                }
            },

            /**
             * Fake a keyboard key press.
             *
             * @param {String | Array} keys The list of keys/single key to
             *                              trigger
             * @param {String} action       The action (like keypress, keyup)
            */
            trigger: function(keys, action) {
                mt.trigger(keys, action || 'keypress');
            },

            /**
             * Reset all bindings.
            */
            reset: clearAllKeyboardEvents,

            /**
             * Reset all bindings.
            */
            clear: clearAllKeyboardEvents
        };
    }
}(window.Mousetrap));;/* ************************************************************************

    License: MIT Licence

    Description:
        Simple synchronizer/chainer for callback list of functions
        synchronizer : Load many functions at same time, when they all finish
                       raise the final callback
        chainer : Load many functions one by one, when last one finish raise
                  the final callback

************************************************************************ */

//Simple synchronizer/chainer for Array of functions
a.callback = {};


/**
 * Load many functions at same time,
 * when they all finish raise the final callback
 *
 * @class synchronizer
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.synchronizer = function(callbacks, success, error) {
    return a.extend(
            new a.callback.synchronizerInstance(
                callbacks,
                success,
                error
            ),
            new a.eventEmitter('a.callback.synchronizer')
        );
};


/**
 * synchronizerInstance, NEVER use like this,
 * use a.callback.synchronizer instead.
 *
 * @class synchronizerInstance
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.synchronizerInstance = function(callbacks, success, error) {
    this.callbacks       = callbacks || [];
    this.successFunction = success;
    this.errorFunction   = error;
    this.data            = {};
    this.resultScope     = null;
    this.scope           = null;
    this.parrallelCount  = 0;
    this.running         = false;
};

a.callback.synchronizerInstance.prototype = {
    /**
     * Add callback to existing callback list.
     * If the system is started, also append this callback to waiting queue.
     *
     * @method addCallback
     *
     * @param {Array}                       Any number of functions to chain
     *                                      The first function will be executed
     *                                      at first, and the last at last, in
     *                                      the order you give to that fct.
    */
    addCallback: function() {
        var args = a.toArray(arguments);

        this.callbacks = this.callbacks.concat(args);

        if(this.isRunning()) {
            var scope = this.scope || this,
                result = this.getResultObject();

            a.each(args, function(callback) {
                callback.call(scope, result);
            });
        }
    },

    /**
     * Remove callback from existing callback list.
     *
     * @method removeCallback
     *
     * @param fct {Function}                The function to remove from list
    */
    removeCallback: function(fct) {
        this.callbacks = a.without(this.callbacks, fct);
    },

    /**
     * Apply this scope to all callback function
     *
     * @method setScope
     *
     * @param scope {Object}                The scope to apply to callbacks
    */
    setScope: function(scope) {
        if(a.isTrueObject(scope)) {
            this.scope = scope;
        }
    },

    /**
     * Get a currently stored data.
     *
     * @method getData
     *
     * @param key {String}                  The key linked to value to get data
     * @return {Object | null}              The value previously stored and
     *                                      content
    */
    getData: function(key) {
        return this.data[key] || null;
    },

    /**
     * Set a new data stored into container
     *
     * @method setData
     *
     * @param key {String}                  The key to retrieve value later
     * @param value {Object}                Any value to store, a null or
     *                                      undefined element will erase key
     *                                      from store
    */
    setData: function(key, value) {
        if(a.isNone(value)) {
            delete this.data[key];
        } else {
            this.data[key] = value;
        }
    },

    /**
     * Get the main callback object to manipulate chain from it.
     *
     * @method getResultObject
     *
     * @return {Object}                     An object ready to use for
     *                                      controlling chain process
    */
    getResultObject: function() {
        var n = a.scope(this.next, this),
            s = a.scope(this.stop, this);
        return {
            next: n, done: n, success: n,
            fail: s, error: s, stop: s,
            setData: a.scope(this.setData, this),
            getData: a.scope(this.getData, this)
        };
    },

    /**
     * This function keeps chain to release success/error function when all
     * functions will finish their job.
     *
     * @method next
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to next callback
     *                                      as parameters
    */
    next: function() {
        this.parrallelCount--;

        // We have to raise final callback (success or error)
        // The error function is managed by stop function
        if(this.parrallelCount === 0 && this.running) {
            this.running = false;
            this.dispatch('success');

            // We raise final success function
            if(a.isFunction(this.successFunction)) {
                var scope = this.resultScope || this.scope || this;
                this.successFunction.call(scope, this.getResultObject());
            }
        }
    },

    /**
     * Stop the callback chain.
     *
     * @method stop
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to error callback
     *                                      as parameters
    */
    stop: function() {
        this.parrallelCount = 0;
        var wasRunning      = this.running;
        this.running        = false;

        var scope  = this.resultScope || this.scope || this,
            args   = a.toArray(arguments);

        this.dispatch('error');
        if(wasRunning && a.isFunction(this.errorFunction)) {
            args.push(this.getResultObject());
            this.errorFunction.apply(scope, args);
        }
    },

    /**
     * Start chainer queue.
     *
     * @method start
     *
     * @method 
    */
    start: function() {
        this.parrallelCount = this.callbacks.length;
        this.running = true;

        this.dispatch('start');

        // There is no callback, we directly jump on success
        if(this.parrallelCount <= 0) {
            // We fake parallel count to let next think it's a function
            // ending (normal process ending)
            this.parrallelCount = 1;
            this.next();
            return;
        }

        // For every callbacks existing, we start it
        var scope = this.scope || this,
            args  = a.toArray(arguments);

        args.push(this.getResultObject());

        for(var i=0, l=this.callbacks.length; i<l; ++i) {
            var callback = this.callbacks[i];
            callback.apply(scope, args);
        }
    },

    /**
     * Get if the chain system is currently running or not
     *
     * @method isRunning
     *
     * @return {Boolean}                    True: currently running
     *                                      False: currently stopped
    */
    isRunning: function() {
        return this.running;
    }
};

// Alias
a.callback.synchronizerInstance.prototype.success =
        a.callback.synchronizerInstance.prototype.next;
a.callback.synchronizerInstance.prototype.done    =
        a.callback.synchronizerInstance.prototype.next;
a.callback.synchronizerInstance.prototype.fail    =
        a.callback.synchronizerInstance.prototype.stop;
a.callback.synchronizerInstance.prototype.error   =
        a.callback.synchronizerInstance.prototype.stop;


/**
 * Load many functions one by one, when last one finish raise the final
 * callback
 *
 * @class chainer
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.chainer = function(callbacks, success, error) {
    return a.extend(
        new a.callback.chainerInstance(
            callbacks,
            success,
            error
        ),
        new a.eventEmitter('a.callback.chainer')
    );
};


/**
 * chainerInstance, NEVER use like this, use a.callback.chainer instead.
 *
 * @class chainerInstance
 * @namespace a.callback
 * @constructor
 * @async
*/
a.callback.chainerInstance = function(callbacks, success, error) {
    this.callbacks       = callbacks || [];
    this.queue           = [];
    this.successFunction = success;
    this.errorFunction   = error;
    this.data            = {};
    this.resultScope     = null;
    this.scope           = null;
};


a.callback.chainerInstance.prototype = {
    /**
     * Add callback to existing callback list.
     * If the system is started, also append this callback to waiting queue.
     *
     * @method addCallback
     *
     * @param {Array}                       Any number of functions to chain
     *                                      The first function will be executed
     *                                      at first, and the last at last, in
     *                                      the order you give to that fct.
    */
    addCallback: function() {
        var args = a.toArray(arguments);

        this.callbacks = this.callbacks.concat(args);

        if(this.isRunning()) {
            this.queue = this.queue.concat(args);
        }
    },

    /**
     * Remove callback from existing callback list.
     *
     * @method removeCallback
     *
     * @param fct {Function}                The function to remove from list
    */
    removeCallback: function(fct) {
        this.callbacks = a.without(this.callbacks, fct);
        this.queue     = a.without(this.without, fct);
    },

    /**
     * Apply this scope to all callback function
     *
     * @method setScope
     *
     * @param scope {Object}                The scope to apply to callbacks
    */
    setScope: function(scope) {
        if(a.isTrueObject(scope)) {
            this.scope = scope;
        }
    },

    /**
     * Get a currently stored data.
     *
     * @method getData
     *
     * @param key {String}                  The key linked to value to get data
     * @return {Object | null}              The value previously stored and
     *                                      content
    */
    getData: function(key) {
        return this.data[key] || null;
    },

    /**
     * Set a new data stored into container
     *
     * @method setData
     *
     * @param key {String}                  The key to retrieve value later
     * @param value {Object}                Any value to store, a null or
     *                                      undefined element will erase key
     *                                      from store
    */
    setData: function(key, value) {
        if(a.isNone(value)) {
            delete this.data[key];
        } else {
            this.data[key] = value;
        }
    },

    /**
     * Get the main callback object to manipulate chain from it.
     *
     * @method getResultObject
     *
     * @return {Object}                     An object ready to use for
     *                                      controlling chain process
    */
    getResultObject: function() {
        return {
            next:    a.scope(this.next, this),
            done:    a.scope(this.next, this),
            success: a.scope(this.next, this),
            fail:    a.scope(this.stop, this),
            error:   a.scope(this.stop, this),
            stop:    a.scope(this.stop, this),
            setData: a.scope(this.setData, this),
            getData: a.scope(this.getData, this)
        };
    },

    /**
     * Go to the next function in callback chain.
     *
     * @method next
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to next callback
     *                                      as parameters
    */
    next: function() {
        var args = a.toArray(arguments),
            scope = this.scope || this;


        // We add at the end the chain/result object
        var that = this;
        args.push(this.getResultObject());

        // We stop if queue is ended
        if(!this.queue.length) {
            this.dispatch('success');

            // Success is now launched
            if(a.isFunction(this.successFunction)) {
                scope = this.resultScope || scope;
                this.successFunction.apply(scope, args);
            }
            return;
        }

        // Getting the callback
        var callback = this.queue.shift();
        if(a.isFunction(callback)) {
            // We transfert arguments from next to next callback
            callback.apply(scope, args);
        }
    },

    /**
     * Stop the callback chain.
     *
     * @method stop
     *
     * @param {Array}                       Any arguments given to that one
     *                                      will be transfert to error callback
     *                                      as parameters
    */
    stop: function() {
        this.queue = [];
        var scope  = this.scope || this,
            args   = a.toArray(arguments);

        this.dispatch('stop');
        if(a.isFunction(this.errorFunction)) {
            args.push(this.getResultObject());
            this.errorFunction.apply(scope, args);
        }
    },

    /**
     * Start chainer queue.
     *
     * @method start
    */
    start: function() {
        if(this.queue.length) {
            return;
        }

        // Preparing queue
        this.queue = a.deepClone(this.callbacks);
        this.dispatch('start');

        // Starting queue
        this.next();
    },

    /**
     * Get if the chain system is currently running or not
     *
     * @method isRunning
     *
     * @return {Boolean}                    True: currently running
     *                                      False: currently stopped
    */
    isRunning: function() {
        return this.queue.length ? true : false;
    }
};

// Alias
a.callback.chainerInstance.prototype.success =
        a.callback.chainerInstance.prototype.next;
a.callback.chainerInstance.prototype.done    =
        a.callback.chainerInstance.prototype.next;
a.callback.chainerInstance.prototype.fail    =
        a.callback.chainerInstance.prototype.stop;
a.callback.chainerInstance.prototype.error   =
        a.callback.chainerInstance.prototype.stop;
;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Storage capacities, allow to manage many storage to get quick access
        to everything

        cookie : Cookie functionnality, manipulate cookie with a simplified
                 interface
        temporary : Use the "most powerfull" system in the whole list of
                    temporary store available

************************************************************************ */
/**
 * Storage capacities, allow to manage many storage to get quick
 * access to everything.
 *
 * @constructor
*/
a.storage = {
    /**
     * Debug on console the get item action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
     * @param {Mixed} value                 The value to dump
    */
    debugGet: function(element, key, value) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.get',
                    'Get the element ```' + key + '``` with value ```' + value+
                    '```', 3);
        }
    },

    /**
     * Debug on console the get item error action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
    */
    printError: function(element, key) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.get',
                    'Unable to find the key ```' + key + '``` in store...', 3);
        }
    },

    /**
     * Debug on console the set item action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
     * @param {Mixed} value                 The value to dump
    */
    debugSet: function(element, key, value) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.set',
                    'Add the element key ```' + key + '``` with value ```' +
                    value + '```', 3);
        }
    },

    /**
     * Debug on console the remove item action.
     *
     * @private
     *
     * @param {String} element              The element (like cookie,
     *                                      localStorage, ...)
     * @param {String} key                  The key to debug
    */
    debugRemove: function(element, key) {
        if(key !== '_support_t') {
            a.console.storm('log', 'a.storage.type.' + element + '.remove',
                    'Remove the element ```' + key + '```', 3);
        }
    },

    // Access to individual storage
    type: {}
};


/*
------------------------------
  COOKIE
------------------------------
*/
/**
 * Cookie functionnality, manipulate cookie with a simplified interface.
 *
 * @constructor
*/
a.storage.type.cookie = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default cookie
     * @final
    */
    engine: 'cookie',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        // Cookie
        // Testing the current
        var test = '_support_t';
        this.set(test, 'o');

        // Test system is working
        if(this.get(test) == 'o') {
            this.remove(test);
            return true;
        }
        return false;
    },

    /**
     * Set a new cookie, or delete a cookie using a too old expires.
     *
     * @param {String} name                 The key to use
     * @param {Mixed} value                 The value to store
     * @param {Integer} days                Number of days before expires
    */
    set: function(name, value, days) {
        var expires = '';
        a.storage.debugSet('cookie', name, value);
        if(days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = '; expires=' + date.toGMTString();
        }

        var cookieSet =  name + '=' + escape(a.parser.json.stringify(value));
            cookieSet += expires + '; path=/';
        document.cookie = cookieSet;
    },

    /**
     * Get the stored cookie, return null if something went wrong.
     *
     * @param {String} name                 The cookie name stored
     * @return {Mixed | Null}               Any data stored inside cookie
    */
    get: function(name) {
        if (document.cookie.length > 0) {
            var start = document.cookie.indexOf(name + '=');
            if (start != -1) {
                start = start + name.length + 1;
                var end = document.cookie.indexOf(';', start);
                if (end == -1) {
                    end = document.cookie.length;
                }
                var result = a.parser.json.parse(
                            unescape(document.cookie.substring(start, end)));
                a.storage.debugGet('cookie', name, result);
                return result;
            }
        }
        a.storage.printError('cookie', name);
        return null;
    },

    /**
     * Remove a previously stored cookie.
     *
     * @param {String} name                 The cookie name to delete
    */
    remove: function(name) {
        a.storage.debugRemove('cookie', name);
        this.set(name, '', -1);
    }
};


/**
 * Cookie functionnality, manipulate cookie with a simplified interface.
 *
 * @constructor
*/
a.storage.cookie = a.storage.type.cookie;




/*
------------------------------
  LOCAL STORAGE
------------------------------
*/
/**
 * LocalStorage HTML5 support.
 *
 * @constructor
*/
a.storage.type.localStorage = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default localStorage
     * @final
    */
    engine: 'localStorage',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var obj     = a.storage.type.localStorage,
            idTest  = '_support_t';

        // Test support (if you use localStorageShim
        // this should work for most of browsers (including old IE) !)
        if('localStorage' in window && window.localStorage !== null) {
            // localStorage may have no space left, making everything crash
            try {
                // Testing database work or not
                window.localStorage.setItem(idTest, 'o');

                // Test system is working
                if(window.localStorage.getItem(idTest) === 'o') {
                    window.localStorage.removeItem(idTest);
                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(this.support) {
            var item = window.localStorage.getItem(key);
            if(a.isNone(item)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(this.support) {
            a.storage.debugSet(this.engine, key, value);
            window.localStorage.setItem(key, a.parser.json.stringify(value));
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(this.support) {
            a.storage.debugRemove(this.engine, key);
            window.localStorage.removeItem(key);
        }
    }
};



/*
------------------------------
  GLOBAL STORAGE
------------------------------
*/
/**
 * globalStorage HTML5 support (old).
 *
 * @constructor
*/
a.storage.type.globalStorage = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default globalStorage
     * @final
    */
    engine: 'globalStorage',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var idTest   = '_support_t',
            hostname = window.location.hostname;

        if(!a.isNone(window.globalStorage)) {
            // In case of space not left, we can have crash
            try {
                window.globalStorage[hostname].setItem(idTest, 'o');

                // Test system is working
                if(window.globalStorage[hostname].getItem(idTest) == 'o') {
                    window.globalStorage[hostname].removeItem(idTest);
                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(this.support) {
            var item = window.globalStorage[hostname].getItem(key),
                value = null;
            // On some system, item will be an object with
            // "value" and "secure" property
            if(a.isTrueObject(item) && !a.isNone(item.value)) {
                value = a.parser.json.parse(item.value);
                a.storage.debugGet(this.engine, key, value);
                return value;
            } else if(!a.isNone(item)) {
                value = a.parser.json.parse(item);
                a.storage.debugGet(this.engine, key, value);
                return value;
            } else {
                a.storage.printError(this.engine, key);
                return null;
            }
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(this.support) {
            a.storage.debugSet(this.engine, key, value);
            window.globalStorage[hostname].setItem(key,
                                        a.parser.json.stringify(value));
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(this.support) {
            a.storage.debugRemove(this.engine, key);
            window.globalStorage[hostname].removeItem(key);
        }
    }
};


/*
------------------------------
  MEMORY STORE
------------------------------
*/
/**
 * memory object (so if page close, everything is lost).
 *
 * @constructor
*/
a.storage.type.memory = {
    /**
     * @property _store
     * @private
     * @type a.mem
    */
    _store: a.mem.getInstance('app.storage'),

    /**
     * @property support
     * @type Boolean
     * @default true
    */
    support: true,

    /**
     * @property engine
     * @type String
     * @default memory
     * @final
    */
    engine: 'memory',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        return true;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function() {
        return this._store.get.apply(this._store, arguments);
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function() {
        return this._store.set.apply(this._store, arguments);
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function() {
        return this._store.remove.apply(this._store, arguments);
    }
};


/**
 * Memory store functionnality, manipulate memory storage class with a
 * simplified interface.
 *
 * @constructor
*/
a.storage.memory = a.storage.type.memory;




/*
------------------------------
  SESSION STORAGE
------------------------------
*/
/**
 * sessionStorage HTML5 support.
 *
 * @constructor
*/
a.storage.type.sessionStorage = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default sessionStorage
     * @final
    */
    engine: 'sessionStorage',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var idTest  = '_support_t',
            ss      = 'sessionStorage';


        // Test support
        if(ss in window && !a.isNone(window[ss])) {
            try {
                // Testing database work or not
                window.sessionStorage.setItem(idTest, 'o');

                // Test system is working
                if(window.sessionStorage.getItem(idTest) == 'o') {
                    window.sessionStorage.removeItem(idTest);
                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(this.support) {
            var item = window.sessionStorage.getItem(key);
            if(a.isNone(item)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(this.support) {
            a.storage.debugSet(this.engine, key, value);
            window.sessionStorage.setItem(key, a.parser.json.stringify(value));
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(this.support) {
            a.storage.debugRemove(this.engine, key);
            window.sessionStorage.removeItem(key);
        }
    }
};



/*
------------------------------
  USER DATA (Internet Explorer)
------------------------------
*/
/**
 * userData IE support (old).
 *
 * @constructor
*/
a.storage.type.userData = {
    /**
     * @property support
     * @type Boolean
     * @default false
    */
    support: false,

    /**
     * @property engine
     * @type String
     * @default userData
     * @final
    */
    engine: 'userData',

    /**
     * Test the engine support.
     *
     * @return {Boolean}                    True, the engine pass the test,
     *                                      false, something went wrong
    */
    test: function() {
        var idTest  = '_support_t',
            uid     = 'a_storage',
            dbName  = 'aUserDataStorage';

        // Store for internet explorer

        // Test support
        if(document.all) {
            // On some IE, db.load and db.save may be disabled
            // (binary behavior disable)...
            try {
                // Creating userData storage
                document.write(
                    '<input type="hidden" id="' + uid +
                    '" style="display:none;behavior:url(\'#default#userData\')" />'
                );

                var db = document.getElementById(uid);
                db.load(dbName);

                // Testing work before setting as default
                db.setAttribute(idTest, 'o');
                db.save(dbName);

                // Test system is working
                if(db.getAttribute(idTest) == 'o') {
                    // Deleting test
                    db.removeAttribute(idTest);
                    db.save(dbName);

                    return true;
                }
            } catch(e) {
                return false;
            }
        }
        return false;
    },

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    get: function(key) {
        if(support) {
            var value = a.parser.json.parse(db.getAttribute(key));
            if(a.isNone(value)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    },

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    set: function(key, value) {
        if(support) {
            a.storage.debugSet(this.engine, key, value);
            db.setAttribute(key, a.parser.json.stringify(value));
            db.save(dbName);
        }
    },

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    remove: function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            db.removeAttribute(key);
            db.save(dbName);
        }
    }
};


/*
------------------------------
  FLASH
------------------------------
*/
/**
 * flash external storage.
 *
 * @constructor
*/
a.storage.type.flash = new function() {
    var support = false,
        ready   = false,
        id      = 'flashstorage';

    /**
     * Start flash and check availability.
     *
     * @private
     * @async
     *
     * @param {Function | Null} callback    The callback function to call
     *                                      after loading
    */
    function includeFlash(callback) {
        if(support === false && ready === false) {
            // Append to root an object for recieving flash
            var root = document.createElement('div');
            root.id = 'flashstoragecontent';
            document.body.appendChild(root);

            var data = {
                id : id,
                rootId : root.id,

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
                ready = true;

                var el = document.getElementById(data.id);

                if(el.testData() === true) {
                    support = true;
                    el.setDatabase('a_flashStorage');
                }
                if(support === true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support === true && a.isFunction(callback)) {
            callback(support);
        }
    }

    /**
     * Get the support state of flash.
     * Note: it may arrive little bit after using start function...
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};

    /**
     * Get the ready state of flash object.
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;};

    /**
     * @property engine
     * @type String
     * @default flash
     * @final
    */
    this.engine = 'flash';

    /**
     * Start (include and prepare) flash object
     * Note: automatically done by system you don't need to...
     *
     * @async
     *
     * @param {Function} callback           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeFlash(callback);
    };

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support === true) {
            var item = document.getElementById(id).getData(key);
            if(a.isNone(item)) {
                a.storage.printError(this.engine, key);
                return null;
            }
            a.storage.debugGet(this.engine, key, item);
            return item;
        }
        return null;
    };

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support === true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).setData(key, value);
        }
    };

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support === true) {
            a.storage.debugRemove(this.engine, key);
            return document.getElementById(id).removeData(key);
        }
    };
};


/*
------------------------------
  SILVERLIGHT
------------------------------
*/
/**
 * silverlight external storage.
 *
 * @constructor
*/
a.storage.type.silverlight = new function() {
    var support = false,
        ready   = false,
        id      = 'silverlightstorage';

    /**
     * Start silverlight and check availability.
     *
     * @private
     * @async
     *
     * @param {Function | Null} callback    The callback function to
     *                                      call after loading
    */
    function includeSilverlight(callback) {
        if(support === false && ready === false) {
            // Append to root an object for recieving flash
            var root = document.createElement('div');
            root.id = '_silverlightstorage';
            document.body.appendChild(root);

            var data = {
                id : id,
                rootId : root.id,

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
                'vendor/storage/silverlight/silverlightStorage.xap',
            function(e) {
                ready = true;

                var el = document.getElementById(data.id);
                if(el.Content.store.testData() === true) {
                    support = true;
                }
                if(support === true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support === true && a.isFunction(callback)) {
            callback(support);
        }
    }


    /**
     * Get the support state of silverlight.
     * Note: it may arrive little bit after using start function...
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};

    /**
     * Get the ready state of silverlight object
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;};

    /**
     * @property engine
     * @type String
     * @default silverlight
     * @final
    */
    this.engine = 'silverlight';

    /**
     * Start (include and prepare) silverlight object
     * Note: automatically done by system you don't need to...
     *
     * @async
     *
     * @param {Function} callback           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeSilverlight(callback);
    };

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support === true) {
            var item = document.getElementById(id).Content.store.loadData(key);
            if(a.isNone(item) || item === 'false') {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    };

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support === true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).Content.store.saveData(
                                key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support === true) {
            a.storage.debugRemove(this.engine, key);
            document.getElementById(id).Content.store.removeData(key);
        }
    };
};


/*
------------------------------
  JAVAFX
------------------------------
*/
/**
 * javafx external storage.
 *
 * @constructor
*/
a.storage.type.javafx = new function() {
    var support = false,
        ready   = false,
        id      = 'javafxstorage';

    /**
     * Start javaFX and check availability
     *
     * @private
     * @async
     *
     * @param {Function | Null} callback    The callback function to
     *                                      call after loading
    */
    function includeJavaFX(callback) {
        if(support === false && ready === false) {
            var data = {
                code : 'javafxstorage.Main',
                id : id
            };

            // Loading file
            a.loader.javafx(a.url +
                'vendor/storage/javafx/JavaFXStorage.jar',
            function() {
                ready = true;
                var t = document.getElementById(id);

                if(t.Packages.javafxstorage.localStorage.testData() === true) {
                    support = true;
                    el.setDatabase('a_javafxStorage');
                }
                
                if(support === true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support === true && a.isFunction(callback)) {
            callback(support);
        }
    }

    /**
     * Get the support state of javafx.
     * Note: it may arrive little bit after using start function...
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};
    /**
     * Get the ready state of javafx object.
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;};
    /**
     * @property engine
     * @type String
     * @default javafx
     * @final
    */
    this.engine = 'javafx';

    /**
     * Start (include and prepare) javafx object
     * Note: automatically done by system you don't need to...
     *
     * @async
     *
     * @param {Function} callback           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeJavaFX(callback);
    };

    /**
     * Get the stored key.
     *
     * @param {String} key                  The key to retrieve
     * @return {Mixed | Null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support === true) {
            var item = document.getElementById(id).Packages.
                                javafxstorage.localStorage.loadData(key);
            if(a.isNone(item) || item === 'false') {
                a.storage.printError(this.engine, key);
                return null;
            }
            var value = a.parser.json.parse(item);
            a.storage.debugGet(this.engine, key, value);
            return value;
        }
        return null;
    };

    /**
     * Store a new key/value pair.
     *
     * @param {String} key                  The key to set
     * @param {Mixed} value                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support === true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).Packages.javafxstorage.
                    localStorage.saveData(key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store.
     *
     * @param {String} key                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support === true) {
            a.storage.debugRemove(this.engine, key);
            document.getElementById(id).Packages.
                        javafxstorage.localStorage.removeData(key);
        }
    };
};



/*! ************************
  POPULATING SUPPORT
************************* */
(function() {
    var engines = [a.storage.type.cookie, a.storage.type.localStorage,
        a.storage.type.globalStorage, a.storage.type.sessionStorage,
        a.storage.type.userData];

    for (var i = 0, l = engines.length; i < l; ++i) {
        engines[i].support = engines[i].test();
    }
})();


/*! ************************
  POPULATING DATA FOR TEMPORARY AND PERSIST
************************* */
/*
------------------------------
  TEMPORARY ALIAS
------------------------------
*/
/**
 * Select the best temp storage available.
 *
 * @constructor
*/
a.storage.temporary = (function() {
    'use strict';

    var store = ['sessionStorage', 'cookie', 'memory'];
    for(var i=0, l=store.length; i<l; ++i) {
        var temp = store[i];
        if(a.storage.type[temp].support) {
            a.console.storm('info', 'a.storage.temporary', 'Choosing the ' +
                    'storage ```' + a.storage.type[temp].engine + '```', 3);
            a.message.dispatch('a.storage.temporary.change', 
                            { engine : temp });
            return a.storage.type[temp];
        }
    }

    // Memory store should be always OK, so this should never arrive
    return null;
})();


/*
------------------------------
  EXTERNAL ALIAS
------------------------------
*/
/**
 * Select the best external storage available.
 *
 * @constructor
*/
a.storage.external = (function() {
    'use strict';

    var started = false;

    /**
     * Start the callback function if possible.
     *
     * @private
     * @async
     *
     * @param {Object} type                 The object to use for external
     * @param {Function | Null} callback    The function to launch if a
     *                                      store has been found
    */
    function startCallback(type, callback) {
        a.storage.external.ready   = type.ready;
        a.storage.external.support = type.support;
        a.storage.external.engine  = type.engine;
        a.storage.external.get     = type.get;
        a.storage.external.set     = type.set;
        a.storage.external.remove  = type.remove;

        if(a.isFunction(callback)) {
            callback();
        }
    }

    return {
        /**
         * Start the external tool, try to find an available store.
         *
         * @async
         *
         * @param {Function | Null} callback    The function to launch if
         *                                      a store has been found
        */
        start : function(callback) {
            var silvt = a.storage.type.silverlight,
                flash = a.storage.type.flash,
                javax = a.storage.type.javafx,
                source= 'a.storage.external',
                cs    = 'Choosing the storage ';

            // Loading silverlight
            silvt.start(function(svtSupport) {
                if(svtSupport) {
                    a.console.storm('info', source, cs + 'silverlight', 3);
                    startCallback(silvt, callback);
                } else {
                    // Loading flash
                    flash.start(function(flashSupport) {
                        if(flashSupport) {
                            a.console.storm('info', source, cs + 'flash', 3);
                            startCallback(flash, callback);
                        } else {
                            javax.start(function(javaxSupport) {
                                if(javaxSupport) {
                                    a.console.storm('info', source, cs +
                                            'javafx', 3);
                                    startCallback(javax, callback);
                                } else {
                                    a.console.storm('info', source, cs +
                                            'NONE AVAILABLE', 3);
                                }
                            });
                        }
                    });
                }
            });
        }
    };
}());


/*
------------------------------
  PERSISTENT ALIAS
------------------------------
*/
/**
 * Select the best long term storage available.
 *
 * @constructor
*/
a.storage.persistent = (function() {
    'use strict';

    var store = ['localStorage', 'globalStorage', 'userData', 'cookie'];
    for(var i=0, l=store.length; i<l; ++i) {
        var temp = store[i];
        if(a.storage.type[temp].support) {
            a.console.storm('info', 'a.storage.persistent', 'Choosing the ' +
                'storage ```' + a.storage.type[temp].engine + '```', 3);
            a.message.dispatch('a.storage.persistent.change', 
                                    { engine : temp });
            return a.storage.type[temp];
        }
    }

    // This one may append
    return null;
})();

if(a.storage.persistent === null) {
    a.storage.persistent = {};
    a.storage.persistent.support = false;
    a.storage.persistent.engine  = function(){return 'none';};
    a.storage.persistent.get     = function(){return null;};
    a.storage.persistent.set     = function(){};
    a.storage.persistent.remove  = function(){};
}

// Now storage himself got same as persistent
a.storage.support = a.storage.persistent.support;
a.storage.engine  = a.storage.persistent.engine;
a.storage.get     = a.storage.persistent.get;
a.storage.set     = a.storage.persistent.set;
a.storage.remove  = a.storage.persistent.remove;














/*
------------------------------
  PARAMETERS HELPERS
------------------------------
*/
(function() {
    // Default 'store' behavior
    function getGlobalStore(name) {
        var temp = a.storage.temporary.get(name);
        if(a.isNone(temp)) {
            temp = a.storage.persistent.get(name);
        }
        return temp;
    }

    a.parameter.addParameterType('storage', getGlobalStore);
    a.parameter.addParameterType('store', getGlobalStore);

    // Parameters type
    a.parameter.addParameterType('temporary',  a.storage.temporary.get);
    a.parameter.addParameterType('memory',     a.storage.memory.get);
    a.parameter.addParameterType('persistent', a.storage.persistent.get);
    a.parameter.addParameterType('cookie',     a.storage.cookie.get);
})();

/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Handlebars type
    Handlebars.registerHelper('temporary', function(value) {
        return new Handlebars.SafeString(a.storage.temporary.get(value));
    });
    Handlebars.registerHelper('memory', function(value) {
        return new Handlebars.SafeString(a.storage.memory.get(value));
    });
    Handlebars.registerHelper('persistent', function(value) {
        return new Handlebars.SafeString(a.storage.persistent.get(value));
    });
    Handlebars.registerHelper('cookie', function(value) {
        return new Handlebars.SafeString(a.storage.cookie.get(value));
    });

    // Default 'store' behavior, encaps into Handlebars SafeString
    function getHandlebarsStore(name) {
        var temp = a.storage.temporary.get(name);
        if(a.isNone(temp)) {
            temp = a.storage.persistent.get(name);
        }
        return new Handlebars.SafeString(temp);
    }

    Handlebars.registerHelper('storage', getHandlebarsStore);
    Handlebars.registerHelper('store', getHandlebarsStore);
})();;/*! ***********************************************************************

    License: MIT Licence

    Description:
        Manage translation

************************************************************************ */

/**
 * A translation system, used to get multi languages support to your app.
 *
 * @constructor
*/
a.translate = a.i18n = (function() {
    'use strict';

    // Internal variable
    var language         = 'en-US',
        dictionnary      = {},
        globalVariable   = {},
        defaultAttribute = 'tr',
        customAttribute  = 'custom-tr',
        eraseAttribute   = 'erase-tr',
        regexVariable    = /\{\{[a-z0-9\-_]+\}\}/gi;

    var storageSupported = (a.storage && a.storage.persistent.support);

    /**
     * Get attribute stored into given element.
     *
     * @private
     *
     * @param {DOMElement} element          The dom object to get
    *                                       attribute from
     * @param {String} search               The attribute name searched
     * @return {String}                     The founded attribute
     *                                      content or empty string
    */
    function getAttr(element, search) {
        return  element.getAttribute(search) || 
                element.getAttribute('a-' + search) ||
                element.getAttribute('data-' + search) ||  '';
    }

    /**
     * Apply to a given element the given translation.
     *
     * @private
     *
     * @param {DOMElement} node             The element to apply
     * @param {String} translation          The translation to apply
    */
    function applyTranslationToElement(node, translation) {
        var customTagAttribute = getAttr(node, customAttribute);

        if(customTagAttribute && customTagAttribute !== '') {
            try {
                node[customTagAttribute] = translation;
            } catch(e) {}
            return;
        }

        // We are on a submit/reset button
        if(node.nodeName == 'INPUT') {
            var type = node.type;
            if(type === 'submit' || type === 'reset' || type === 'button') {
                node.value = translation;
            } else {
                try {
                    node.placeholder = translation;
                } catch(e) {}
            }

        // On fieldset we apply title
        } else if(node.nodeName === 'FIELDSET') {
            node.title = translation;

        // XML translate (only for IE)
        //} else if(!a.isNone(node.text) && document.all ) {
        //    node.text = translation;

        // We are in erase mode, so we erase everything
        } else if(getAttr(node, eraseAttribute) !== '') {
            a.dom.el(node).empty().append(
                document.createTextNode(translation)
            );

        // We do translation system
        } else {
            // We separate textnode and other elements using <tag> element
            var splittedTranslation = translation.split('<tag>'),
                i = 0,
                l = node.childNodes.length,
                m = splittedTranslation.length;

            // 1) We remove text node elements
            for(; i<l; ++i) {
                var el = node.childNodes[i];
                if(el && el.nodeType == 3) {
                    el.parentNode.removeChild(el);
                }
            }

            i = 0;
            a.dom.el(node).children().each(function() {
                var tr   = splittedTranslation[i] || '',
                    text = document.createTextNode(tr);
                i++;

                this.parentNode.insertBefore(text, this);
            });

            // We add latests elements to end
            if(m > i) {
                for(var j=0, k=(m-i); j<k; ++j) {
                    node.appendChild(
                        document.createTextNode(splittedTranslation[i + j])
                    );
                }
            }
        }
    }

    /**
     * Apply translation to a given document/sub-document.
     *
     * @param {DOMElement | Null} root      The root element to 
     *                                      start translate from
    */
    function i18n(root) {
        root = root || document;

        // Selecting elements
        var el   = a.dom.el(root),
            // We search 'tr' and 'data-tr' tag on elements
            srch = defaultAttribute + ',a-' + defaultAttribute + ',data-' +
                    defaultAttribute;

        var currentDictionnary = dictionnary[language] || {};

        var elements = el.attr(srch).getElements();

        // Elements may have also the initial element itself
       if(root.getAttribute && 
            (
                root.getAttribute(defaultAttribute) ||
                root.getAttribute('a-' + defaultAttribute) ||
                root.getAttribute('data-' + defaultAttribute)
            )) {
            elements.push(root);
        }

        // Selecting only elements with tr/a-tr/data-tr html tag setted
        a.dom.el(elements).each(function() {
            // Getting the searched key translate
            var key       = getAttr(this, defaultAttribute),
                attribute = currentDictionnary[key] || '';

            // In case of trouble, we rollback on key elements
            if(attribute === '') {
                attribute = key;
            }

            // use regexVariable to extract variable from string
            var foundVariables = attribute.match(regexVariable);
            // We got something like ['{{a}}', '{{b}}']

            // We remove '{{' and '}}'
            var matches = a.map(foundVariables, function(value) {
                return value.replace('{{', '').replace('}}', '');
            });

            // We create final variables object
            var variables = {},
                i=matches.length;
            while(i--) {
                var variable = matches[i],
                    searchedVariable = defaultAttribute + '-' + variable,
                    value = getAttr(this, searchedVariable);
                if(value) {
                    variables[variable] = value;
                }
            }

            // Now we extract variable, we need to translate
            var translate = get(key, variables, true);

            // Finally we can apply translation
            applyTranslationToElement(this, translate);
        });
    }

    /**
     * Get the current used language.
     *
     * @return {String}                     The language setted by
     *                                      user/system (default is 'en-US')
    */
    function getLanguage() {
        return language;
    }

    /**
     * Set the current used language.
     * Auto-translate current document except if update is set to false.
     *
     * @param {String} lang                 The new language to apply
     * @param {Boolean | Null} update       If we should translate
     *                                      current (default: yes)
    */
    function setLanguage(lang, update) {
        if(!a.isString(lang) || !lang) {
            a.console.storm('error', 'a.translate.setLanguage', 'Setting a ' +
                    'non-string lang, or empty string, as default translate: ',
                            '```' + lang + '```. Cannot proceed', 1);
            a.console.error(lang);
        } else {
            language = lang;

            if(storageSupported) {
                a.storage.persistent.set('app.language', language);
            }

            if(update !== false) {
                i18n();
            }
        }
    }

    /**
     * Get any global variable setted.
     *
     * @param {String} key                  The variable key to search
     * @return {String}                     The variable value or
     *                                      an empty string if not found
    */
    function getGlobalVariable(key) {
        return globalVariable[key] || '';
    }

    /**
     * Set a global variable to be used if possible when translating.
     *
     * @param {String} key                  The variable key to register
     * @param {String} value                The linked value
    */
    function setGlobalVariable(key, value) {
        globalVariable[key] = value;
    }

    /**
     * Register a new translation for given language.
     * After register is done, you can now use data-tr='{{hash}}' inside
     * HTML page to have corresponding translation.
     * Note: you can use a quicker version add(lang, object, update)
     * Where the object will be a key/value translate list for lang.
     *
     * @private
     *
     * @param {String} lang                 The language to
     *                                      register hash/value pair
     * @param {String} hash                 The refered hash to
     *                                      use for translation
     * @param {String} value                The linked translation
     *                                      for given language
     * @param {Boolean | Null} update       If we should fully
     *                                      update or not document
    */
    function add(lang, hash, value, update) {
        if(a.isTrueObject(hash)) {
            a.each(hash, function(val, index) {
                add(lang, index, val, update);
            });
            return;
        }
        if(!dictionnary[lang]) {
            dictionnary[lang] = {};
        }

        dictionnary[lang][hash] = value;

        if(update !== false) {
            i18n();
        }
    }

    /**
     * Set a new translation set for a given language.
     * If dict is set to null, it will erase language.
     *
     * @param {String} lang                 The language to register dict
     * @param {Object} dict                 A key/value pair object for
     *                                      registrating many translation
     *                                      at once
     * @param {Boolean | Null} update       If we should fully
     *                                      update or not document
    */
    function set(lang, dict, update) {
        if(dict === null) {
            delete dictionnary[lang];
        } else {
            for(var i in dict) {
                add(lang, i, dict[i], false);
            }
        }

        if(update !== false) {
            i18n();
        }
    }

    /**
     * Get an existing translation stored.
     *
     * @param {String | Null} key           The searched translation key
     * @param {Object | Null} variables     Any key/value pair variable to pass
     * @param {Boolean | Null} translate    If we should or not translate
     *                                      (including variable) or simply
     *                                      send back entry (default: true)
     *
     * @return {String}                     The translated key or an empty
     *                                      string in case of problem
    */
    function get(key, variables, translate) {
        if(!dictionnary[language]) {
            return key;
        }
        var tr = dictionnary[language][key] || null;

        if(a.isNull(tr)) {
            return key;
        }

        if(translate === false) {
            return tr;
        }

        /**
         * From a hash, try to find the good variable content.
         *
         * @private
         *
         * @param {String} hash             The hash to find in variable list
         * @return {String}                 The variable content or empty
         *                                  string in case of not found
        */
        function hashToVariable(hash) {
            var lvar = variables,
                gvar = globalVariable,
                // First local var, and second global var check
                avar = [lvar, gvar];

            for(var i=0; i<2; ++i) {
                for(var j in avar[i]) {
                    if(hash === '{{' + j + '}}') {
                        return avar[i][j];
                    }
                }
            }

            // Nothing found
            return '';
        }

        var trVariables = tr.match(regexVariable) || [];

        for(var i=0, l=trVariables.length; i<l; ++i) {
            var el = trVariables[i];
            tr = tr.replace(el, hashToVariable(el));
        }

        // If it has still some unknow variable, we remove them...
        return tr.replace(regexVariable, '');
    }

    /**
     * Get the full stored dictionnary.
     *
     * @param {String | Null} lang          If lang is setted, retrieve only
     *                                      the given language. In other cases
     *                                      retrieve all dictionnaries.
    */
    function getDictionnary(lang) {
        if(lang) {
            return dictionnary[lang] || {};
        }
        return dictionnary;
    }


    /**
     * Erase dictionnary.
     *
     * @private
    */
    function clearDictionnary() {
        dictionnary = {};
    }



    // If storage is enabled, we try to get the stored language in the store
    if(storageSupported) {
        var storedLanguage = a.storage.persistent.get('app.language');

        // If language do exist and is setted
        if(a.isString(storedLanguage) && storedLanguage.length > 0) {
            language = storedLanguage;
            i18n();
        }
    }



    // Final object
    return {
        getLanguage: getLanguage,

        /**
         * Alias getLanguage.
         *
         * @see getLanguage
        */
        getCurrent:  getLanguage,

        setLanguage: setLanguage,

        /**
         * Alias setLanguage.
         *
         * @see setLanguage
        */
        setCurrent:  setLanguage,

        /**
         * Alias i18n.
         *
         * @see i18n
        */
        translate:   i18n,
        i18n:        i18n,

        getDictionnary:    getDictionnary,

        getGlobalVariable: getGlobalVariable,
        setGlobalVariable: setGlobalVariable,

        /**
         * Alias setGlobalVariable.
         *
         * @see setGlobalVariable
        */
        addGlobalVariable: setGlobalVariable,

        add:            add,

        /**
         * Alias add.
         *
         * @see add
        */
        addTranslation: add,

        get:            get,

        /**
         * Alias get.
         *
         * @see get
        */
        getTranslation: get,

        set:            set,

        /**
         * Alias set.
         *
         * @see set
        */
        setTranslation: set,

        /**
         * Erase dictionnary.
        */
        clear: clearDictionnary
    };
})();



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    Handlebars.registerHelper('tr', function() {
        return new Handlebars.SafeString(
                a.translate.get.apply(null, arguments));
    });
    Handlebars.registerHelper('translate', function(value) {
        return new Handlebars.SafeString(
                a.translate.get.apply(null, arguments));
    });
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        Manipulate HTML form by with a simple system.

************************************************************************ */

/**
 * Manipulate HTML form by with a simple system.
 *
 * @class form
 * @static
 * @namespace a
*/
a.form = (function() {
    'use strict';

    // HTML/HTML5 input type allowed 
    var typePatternList  = ['text', 'search', 'url',
                                    'tel', 'email', 'password'],
        minMaxStepList   = ['number', 'range', 'date',
                                    'datetime', 'datetime-local',
                                    'month', 'time', 'week'],
        typeRequiredList = typePatternList.concat(minMaxStepList,
                                    ['number', 'checkbox', 'radio', 'file']),
        typeMultipleList = ['email', 'file'],
        typeList = minMaxStepList.concat(typePatternList,
                                    ['color', 'checkbox', 'file',
                                    'hidden', 'radio']);

    /**
     * Get the field key from given input.
     *
     * @method getFieldKey
     * @private
     *
     * @param e {DOMElement}                The element o search value inside
     * @return {String}                     The value found
    */
    function getFieldKey(e) {
        var el   = a.dom.el(e),
            name = el.data('name');

        if(a.isNone(name) || name === '') {
            name = el.attribute('name');

            // Search the good attribute in case of problem
            if(a.isNone(name) || name === '') {
                name = el.attribute('id');

                // Should never appear... But we provide it in case of trouble
                if(a.isNone(name) || name === '') {
                    name = el.attribute('class');
                }
            }
        }

        return name;
    }

    /**
     * Get the field value for given input.
     *
     * @method getFieldValue
     * @private
     *
     * @param e {DOMElement}                The element to search value inside
     * @return {String}                     The value found
    */
    function getFieldValue(e) {
        var type    = e.type || '',
            tagName = e.tagName.toLowerCase();

        if(tagName === 'input' || tagName === 'textarea') {
            return (type === 'checkbox') ? e.checked : e.value;
        } else if(tagName === 'select') {
            if(e.options[e.selectedIndex]) {
                return e.options[e.selectedIndex].value;
            }
            return null;
        }
    }

    /**
     * From a given dom, get the list of revelant elements inside.
     *
     * @method getFieldList
     * @private
     *
     * @param dom {a.dom}                   The dom element to search inside
     * @return {Array}                      The element list inside DOM
    */
    function getFieldList(dom) {
        // dom must be a a.dom element
        var elements = dom.tag(['input', 'textarea', 'select']).getElements();

        // We remove input who are not listed in typeList
        // LIKE: submit/reset should not appear in this list
        var i = elements.length;
        while(i--) {
            var el = elements[i];
            if(el.type &&
                    (   el.type == 'submit' ||
                        el.type == 'button' ||
                        el.type == 'reset' ||
                        el.type == 'image'
                    ) ) {
                elements.splice(i, 1);
            }
        }

        // Now filtering is done, we can send back all elements
        return elements;
    }

    /**
     * Raise an error on input.
     *
     * @method validateError
     * @private
     *
     * @param el {DOMElement}               The element where comes from error
     * @param id {String}                   The element id/name/class
     * @param name {String | null}          The name (like min, pattern, ...)
     *                                      which is not valid, can be null
     * @param value {String | null}         The current input value
     *                                      (can be used as parameter)
     * @return {Object}                     A validate object with everything
     *                                      inside if possible
    */
    function validateError(el, id, name, value) {
        // First : we need to get error element and translate if possible
        var error = '';

        // Retrieve error tag
        if(!a.isNone(name) && name !== '') {
            error = el['data-error-' + name] || null;
        }
        if(a.isNone(error) || error === '') {
            error = el['data-error'] || null;
        }

        if(a.isNone(error) || error === '') {
            var errorMessage  = 'A data-error tag has not been setted for id ';
                errorMessage += '```' + id + '``` with value ```' +value+'```';
                errorMessage += '.Cannot proceed error message...';
            a.console.storm('warn', 'a.form', errorMessage, 3);
        }

        // Translate error if possible
        error = a.translate.get(error, {
            name:  name,
            value: value
        });

        // Returning an object with all needed data inside
        return {
            el:    el,
            id:    id,
            error: error
        };
    }


    /**
     * We try to grab the model instance, or a new model instance if it's not
     * an existing model instance.
     *
     * @method getModel
     * @private
     *
     * @param idOrModelName {String}            From HTML side, the id or the model
     *                                          name to use for this form.
     * @return {a.modelInstance}                A new or existing instance
    */
    function getModel(idOrModelName) {
        var model = a.model.manager.get(idOrModelName);
        if(model) {
            return model;
        } else {
            return a.model.pooler.createTemporaryInstance(idOrModelName);
        }
    }

    /**
     * Apply model content to form, automatically
     *
     * @method applymodelToForm
     * @private
     *
     * @param form {DOMElement}             The form to apply model into
     * @param model {a.modelInstance}       The instance to take elements from
     * @param constraints {Object}          List of constraint to use for
     *                                      rendering the form. 
    */
    function applyModelToForm(form, model, constraints) {
        // Get model properties
        var propertiesName = model.list(),
            // Rendered elements
            propertiesRendering = {};
        form = a.dom.el(form);

        /*
        ------------------------------------
          CHECK ALLOWED & REFUSED CONSTRAINT
        ------------------------------------
        */
        var allowed = constraints.allowed,
            refused = constraints.refused;

        // Uniform data before using
        // TODO: this should be done when adding forms to model
        // not here
        if(a.isString(allowed) && allowed) {
            allowed = [allowed];
        }
        if(a.isString(refused) && refused) {
            refused = [refused];
        }

        // Remove properties which are not allowed or are refused to be here
        var isArrayAllowed = a.isArray(allowed),
            isArrayRefused = a.isArray(refused);

        if(isArrayAllowed || isArrayRefused) {
            var i = propertiesName.length;
            while(i--) {
                if(isArrayRefused && a.contains(refused, propertiesName[i])) {
                    propertiesName.splice(i, 1);
                } else if(isArrayAllowed &&
                        !a.contains(allowed, propertiesName[i])) {
                    propertiesName.splice(i, 1);
                }
            }
        }


        /*
        ------------------------------------
          GENERATING PROPERTIES
        ------------------------------------
        */
        // For every property, we create corresponding element
        var custom = constraints.customize || constraints.custom || null;
        a.each(propertiesName, function(property) {
            var type = model.type(property),
                tag = null,
                value = model.get(property),
                el = null;

            // TODO: déporter la création de l'élément pour plus de claretée
            switch(type) {
                case 'radio':
                    // hardcoreeee
                    break;
                case 'checkbox':
                    tag = 'input';
                    el = document.createElement('input');
                    el.type = 'checkbox';
                    break;
                default:
                    tag = 'input';
                    el = document.createElement('input');
                    el.type = 'text';
                    if(value !== null) {
                        el.value = value;
                    }
                    break;
            }

            // TODO: do automatic translation using the model name and property name
            // Like define Placeholder.ModelName.PropertyName

            // Applying customize constraint
            if(custom) {
                var fct = null,
                    result = null;

                if(custom[property]) {
                    fct = custom.property;
                    result = fct.call(null, el, property);

                    if(a.isTrueObject(result)) {
                        el = result;
                    }
                }
                if(custom[tag]) {
                    fct = custom[tag];
                    result = fct.call(null, el, property);

                    if(a.isTrueObject(result)) {
                        el = result;
                    }
                }
                if(custom[type]) {
                    fct = custom[type];
                    result = fct.call(null, el, property);

                    if(a.isTrueObject(result)) {
                        el = result;
                    }
                }
            }

            // Store elements
            propertiesRendering[property] = el;
        });

        // TODO: if label, create label related to every properties
        if(constraints.label || constraints.showLabel) {

        }


        /*
        ------------------------------------
          RENDERING
        ------------------------------------
        */
        // TODO: find a way to place beforeRendering, rendering, afterRendering
        var placement = constraints.placement;

        if(a.isArray(placement)) {
            // TODO: apply algorithm to place properties at the right order
        } else {
            // TODO: apply block creation...
            a.each(propertiesRendering, function(element) {
                form.append(element);
            });
        }
    }

    return {
        /**
         * Allow to skip HTML5 form-novalidate tag or not (boolean)
         *
         * @property skipNoValidate
         * @type Boolean
         * @default false
        */
        skipNoValidate: false,

        /**
         * Get the list of element stored into given form.
         *
         * @method get
         *
         * @param dom {Object}              The dom element to search inside
         *                                  - It has to be a valid a.dom.el
         *                                  input
         * @return {Object}                 The list of input tags existing
        */
        get: function(dom) {
            dom = a.dom.el(dom);
            var inputList  = getFieldList(dom),
                outputList = {};

            var i = inputList.length;
            while(i--) {
                var input = inputList[i];

                var name  = a.trim(getFieldKey(input)),
                    value = getFieldValue(input);

                // We don't continue if we don't find any data on element
                if(a.isNone(name) || !name) {
                    continue;
                }

                var parse = false;

                // We got a special case with input radio type
                if(!a.isNone(input) && input.type === 'radio') {
                    // Only checked one are validated
                    if(input.checked) {
                        parse = true;
                    }
                } else if(!a.isNone(input) && input.type === 'checkbox') {
                    parse = false;
                    outputList[name] = (input.checked) ? true: false;
                } else {
                    parse = true;
                }

                if(parse) {
                    // Name is a multiple value one (using [] at the end)
                    if(name.substr(name.length - 2) === '[]') {
                        if(!a.isArray(outputList[name])) {
                            outputList[name] = [];
                        }
                        value = (value) ? value: null;
                        outputList[name].push(value);
                    } else {
                       outputList[name] = (value) ? value: null;
                   }
                }
            }

            return outputList;
        },

        /**
         * Validate a form
         * Note : multiple tester (email, file) is not supported
         * Note : date field (date, datetime, datetime-local,
         * month, time, week) are not supported
         * Note : tel/file field are not supported
         *
         * @method validate
         *
         * @param dom {Object}              The dom element to search inside
         *                                  - It has to be a valid a.dom.el
         *                                  input
         * @return {Array}                  An array with all errors listed
         *                                  inside, an empty array if there
         *                                  is no error to show
        */
        validate: function(dom) {
            dom = a.dom.el(dom);
            // On form tag, the "novalidate" allow to not validate a form
            if(this.skipNoValidate === false &&
                    !a.isNone(dom.get(0).novalidate)) {
                return [];
            }

            var inputList    = getFieldList(dom),
                // Store all errors appearing
                errorList    = [],
                allowedTypes = ['number', 'range', 'text', 'search',
                                        'url', 'email', 'password',
                                        'color', 'checkbox',
                                        'hidden', 'radio'],
                // Pretty basic url tester
                urlTester    = new RegExp(
                    '^[a-z]{2,}:\\/\\/([a-z0-9\\/\\.\\-_~+;:&=]{2,})$', 'gi'),
                // Pretty basic email tester
                emailTester  = new RegExp('^.{2,}@.*\\.[a-z0-9]{2,}$', 'gi'),
                colorTester  = new RegExp('^#([a-f]{3}|[a-f]{6})$', 'gi');

            // required : at least one char
            //    (text, search, url, tel, email, password, date, datetime,
            //    datetime-local, month, time, week, number, checkbox,
            //    radio, file)
            // pattern : a regex to test (Use title like a helper),
            //    (text, search, url, tel, email, password)
            //    multiple : the user is allowed to enter more than one element
            //    (only for email, file)
            // min/max : min/max value
            //    (number, range, date, datetime, datetime-local,
            //    month, time, week)
            // step : multiplier
            //    (number, range, date, datetime, datetime-local,
            //    month, time, week)
            var i = inputList.length;
            while(i--) {
                // Does only work for input tags
                var el      = inputList[i],
                    tagName = el.tagName.toLowerCase();

                // form novalidate : we must not validate
                // this element (including all select)
                if(tagName == 'select' || !a.isNone(el.novalidate)) {
                    continue;
                }

                var type     = el.type,
                    name    = getFieldKey(el),
                    value    = el.value,

                    required = el.required,
                    pattern  = el.pattern,
                    multiple = el.multiple,
                    min      = el.min,
                    max      = el.max,
                    step     = el.step;

                // Double check float data
                min  = (a.isNone(min) || min === '')   ? null :
                        parseFloat(min);
                max  = (a.isNone(max) || max === '')   ? null :
                        parseFloat(max);
                step = (a.isNone(step) || step === '') ? null :
                        parseFloat(step);

                // Check input type does existing in allowed type list
                if(tagName == 'input' && !a.contains(allowedTypes, type) &&
                        !a.isNone(type)) {
                    var errorSupport =  'Type ```' + type;
                        errorSupport += '``` for input ```' + name + '```';
                        errorSupport += 'is not recognized and/or supported';
                    a.console.storm('warn', 'a.form.validate', errorSupport,3);
                    continue;
                }

                // Now checking type
                if( (type == 'number' || type == 'range') &&
                        !a.isNumber(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }
                if(type == 'url' && !urlTester.test(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }
                if(type == 'email' && !emailTester.test(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }
                if(type == 'color' && !colorTester.test(value) ) {
                    errorList.push(validateError(el, name, null, value));
                    continue;
                }

                // Required test
                if( required !== null && a.contains(typeRequiredList, type) &&
                        (value === '' || a.isNone(value)) ) {
                    errorList.push(validateError(el, name, 'required', value));
                    continue;
                }

                // Pattern test
                if( pattern !== null && (tagName === "textarea" || 
                        (a.contains(typePatternList, type)) || a.isNone(type))
                ) {
                    var reg = new RegExp(pattern);
                    if(!reg.test(value)) {
                        errorList.push(validateError(
                                            el, name, 'pattern', value));
                        continue;
                    }
                }

                // Min/max/step test
                if( (min !== null || max !== null || step !== null) &&
                        a.contains(minMaxStepList, type) ) {

                    var pval = parseFloat(value);
                    if( min !== null && pval < min ) {
                        errorList.push(validateError(el, name, 'min', value));
                        continue;
                    }
                    if( max !== null && pval > max ) {
                        errorList.push(validateError(el, name, 'max', value));
                        continue;
                    }
                    if( step !== null && pval % step !== 0 ) {
                        errorList.push(validateError(el, name, 'step', value));
                        continue;
                    }
                }
            }

            return errorList;
        },

        /**
         * Validate and get the form content.
         *
         * @method validateAndGet
         *
         * @param dom {Object}              The dom element to search inside
         *                                  - It has to be a valid a.dom.el
         *                                  input
         * @return {Object}                 An object with error (boolean),
         *                                  errorList (Array)
         *                                  and contentList (Array)
        */
        validateAndGet: function(dom) {
            var obj = {
                errorList   : this.validate(dom),
                error       : false,
                contentList : this.get(dom)
            };
            if(obj.errorList.length > 0) {
                obj.error = true;
            }
            return obj;
        },

        /**
         * Insert model content into form regarding the given data-model
         * submitted.
         * Note: you should avoid as much as possible to use this function
         * and let appstorm do it for you threw state...
         *
         * @method model
         *
         * @param dom {Object}              The dom element to search inside.
         *                                  You should submit a list of 'form'
         *                                  elements which may have data-model
         *                                  tag.
        */
        model: function(dom) {
            dom = a.dom.el(dom);

            // Searching for data-model tag
            dom.each(function() {
                var el = a.dom.el(this),
                    // May contains: modelname or modeluid
                    // Use the {{model variable}} to insert it properly
                    modelIdOrName = el.data('model'),
                    requestName = el.data('method'),
                    formName = el.data('form');

                // We found elements using data-model tag
                if(modelIdOrName && requestName) {
                    // Will get existing model, or bring a new one...
                    var model = getModel(modelIdOrName),
                        request = model.request(requestName),
                        form = model.form(formName);

                    // Now we use model to populate form inside
                    applyModelToForm(el, model, form);
                }
            });
        }
    };

})();;/* ************************************************************************

    License: MIT Licence

    Description:
        State main manager.

************************************************************************ */

// dependencies: a.parameter, a.acl, a.hash

a.state = new function() {
    var tree   = {},
        loaded = [];

    /*
        Algorithm :
            1) We get id list to add, id list to delete, by selecting branch
            corresponding to hashtag searched.
            We include the loadAfter system to sub-select needed elements
            
            2) From thoose 2 arrays, we remove duplicate
            (because it means we will unload to reload just after)

            => This tab contains all id (from delete or add), which should
               be manage by system.
            => The 2 object contains add list, or delete list, used with
               array you can found what you should add, what you should delete

            3) We start by deleting, in this case we must take the "highest"
               level, it means latest added children.
            So we start by searching maximum children level, and we delete
            from that level, to root

            4) We build exactly the opposite : we need root setup
               before adding a children to it.
            So we start from base level, and go up until latest children

            => Now system unbuild delete, and rebuild add, and takes care
               to not unbuild something which don't need to.
            Also, The system is hanble to run synchronously for going
            faster (unloading/loading item list of same level is done
            synchronously)
    */

    /**
     * Get the error associated to a given status error and state
     *
     * @method getError
     * @private
     *
     * @param state {Object}                The state related
     * @param status {Integer}              The status error code to retrieve
     * @return {Mixed}                      Any revelant data...
    */
    function getError(state, status) {
        if(!state) {
            a.console.storm('error', 'An error has occurs, with no ' +
                    'state linked to it... Below the stack trace', 1);
            a.console.error(a.getStackTrace());
        }
        var id = (state) ? state.id: null;
        // Convert to str
        status = '_' + status;

        // Handle all request check (we can specify _404, _40x,
        // _4xx, generic...)
        var possibleErrorsMarker = [
            status,
            status.substring(0, status.length - 1) + 'x',
            status.substring(0, status.length - 2) + 'xx',
            'generic',
            '_generic'
        ];


        // We search the good marker to use
        for(var i=0, l=possibleErrorsMarker.length; i<l; ++i) {
            // Search allow to get the parent and so one
            var search = state,
            // Marker is the current searched marker
                marker = possibleErrorsMarker[i];

            // While we found parent, we try
            while(!a.isNull(search)) {
                // We found the error we were searching for...
                if(!a.isNone(search.error)
                    && !a.isNone(search.error[marker])){
                    return search.error[marker];

                // We don't find, we get the parent
                } else {
                    search = search.parent || null;
                }
            }
        }

        // Nothing found
        return null;
    };

    /**
     * Handle errors reporting during state load/unload.
     *
     * @method raiseError
     * @private
     *
     * @param resource {String}             The uri which fail to load
     * @param status {String}               The error status (like 404)
    */
    function raiseError(resource, status) {
        var report = {},
            state  = a.state._errorState,
            id = (state) ? state.id : null;

        if(!a.isNone(resource)) {
            report.resource = resource;
        }
        if(!a.isNone(status)) {
            report.status = status;
        }

        // Get the error
        var raiseError   = getError(state, status),
            messageError = 'An error occurs, but ' +
                           'no error function/hash inside the state '+
                           'can handle it. Please ' +
                           'check your error handler for the state ```' + id +
                           '```, HTTP status code ```' + status + '```, and ' +
                           'resource ```' + resource + '```';

        // Raising global message
        // TODO: make state able to send requests, and make THIS as state
        // this.dispatch('error', report);
        a.message.dispatch('a.state.error', report);

        if(raiseError) {
            if(a.isString(raiseError)) {
                window.location.href = '#' + raiseError;

            } else if(a.isFunction(raiseError)) {
                raiseError(id, resource, status);

            // No handler to catch error, we raise an error on console
            } else {
                a.console.storm('error', 'a.state', messageError, 1);
            }

        // Nothing exist, we alert user
        } else {
            a.console.storm('error', 'a.state', messageError, 1);
        }
    };



    /**
     * Load/unload a single state.
     *
     * @param performSingleState
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param state {Object}                The state to load
     * @param success {Function}            The function to continue after
     * @param error {Function}              The function to stop after
     * @param scope {Object}                The scope to use for success or
     *                                      error function ONLY
    */
    function performSingleState(loadOrUnload, state, success, error, scope) {
        var callbacks = a.state.chain.getWithTest(loadOrUnload, state),
            chain     = a.callback.chainer(callbacks, success, error);

        chain.scope = state;
        chain.resultScope = scope;
        chain.start();
    };

    /**
     * Load/unload a full state level.
     *
     * @method performLevelState
     * @private
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param states {Array}                The state list to load/unload
     * @param success {Function}            The function to continue after
     * @param error {Function}              The function to stop after
     * @param scope {Object}                The scope to use for success or
     *                                      error function ONLY
    */
    function performLevelState(loadOrUnload, states, success, error, scope) {
        var sync = a.callback.synchronizer(null, success, error);

        a.each(states, function(state) {
            sync.addCallback(function() {
                // We bind to this the scope of next and error to not have
                // Scope change as the sync allow that...
                performSingleState(loadOrUnload, state,
                    a.scope(this.next, this), a.scope(this.error, this), sync);
            });
        });

        sync.resultScope = scope;
        sync.start();
    };













    /**
     * Test if the full state list can be accepted or refused
     *
     * @method testAcl
     * @private
     *
     * @param states {Array}                The list of states to try
     * @return {Boolean}                    True if everything went fine,
     *                                      False in other cases
    */
    function testAcl(states) {
        // (as test is inverted from normal usage)
        var i = states.length;

        while(i--) {
            if(states[i]._storm.acl === false) {
                return false;
            }
        }

        return true;
    };

    /**
     * We get all parents from given state, including state (so it retrieve
     * the state and all parents for this state).
     *
     * @method foundParentState
     *
     * @param state {Object}                The state to get parents from
     * @return {Array}                      The array composed of state
     *                                      (first), and all sub-parents,
     *                                      in this order
    */
    function foundParentState(state) {
        var ancestor = [state];

        while(state.parent) {
            ancestor.push(state.parent);
            state = state.parent;
        }

        return ancestor;
    };

    /**
     * Found state linked to hash (including parents).
     *
     * @method foundHashState
     *
     * @param hash {String}                 The hash to search for
     * @return {Array}                      The states found (including
     *                                      parents)
    */
    function foundHashState(hash) {
        var result = [];

        for(var i in tree) {
            var state = tree[i];

            if(state._storm.hash && a.isArray(state._storm.hash)) {
                var parents = [];
                for(var j=0, l=state._storm.hash.length; j<l; ++j) {
                    var store = state._storm.hash[j];

                    if(store.isRegexHash) {
                        store.regex.lastIndex=0;
                        if(store.regex.test(hash)) {
                            parents = foundParentState(state);
                            // We stop, we found match
                            break;
                        }
                    // We are in non-regex mode
                    // Note: DO NOT PUT ELSE IF here
                    } else {
                        if(store.hash == hash) {
                            parents = foundParentState(state);
                            // We stop, we found match
                            break;
                        }
                    }
                }

                // Test ACL at the end
                if(testAcl(parents)) {
                    result.push(parents); 
                } else {
                    a.console.storm('log', 'a.state.foundHashState', 
                            'Acl have been refused for state ```' + state.id +
                            '```', 3);
                }
            }
        }

        return result;
    };


    /**
     * Unload previous state which should not stay alive.
     *
     * @method performUnloadChanges
     * @private
     *
     * @param states {Array}                The state list to unload
     * @param callback {Function}           The callback to apply after
     *                                      unloading
    */
    function performUnloadChanges(states, callback) {
        // We need the reversed order... So we apply negative sort
        var statesLevel = a.groupBy(states, function(state) {
                return -state._storm.level;
            }),
            chain = a.callback.chainer(null, callback, raiseError);

        a.each(statesLevel, function(level) {
            chain.addCallback(function() {
                performLevelState('unload', level, this.next, this.error,
                                                                    chain);
            });
        });

        chain.start();
    };

    /**
     * Load new state entering in the 'loaded' area.
     *
     * @method performLoadChanges
     * @private
     *
     * @param states {Array}                The state list to load
     * @param callback {Function}           The callback to apply after loading
    */
    function performLoadChanges(states, callback) {
        // We are in normal sort level
        var statesLevel = a.groupBy(states, function(state) {
                return state._storm.level;
            }),
            chain = a.callback.chainer(null, callback, raiseError);
        a.each(statesLevel, function(level) {
            chain.addCallback(function() {
                performLevelState('load', level, this.next, this.error, chain);
            });
        });

        chain.start();
    };


    /**
     * Remove persistent state from unloading chain
     *
     * @method removePersistentState
     * @private
     *
     * @param states {Array}                Array of elements to filter
     * @return {Array}                      The persistent states removed
    */
    function removePersistentState(states) {
        var i = states.length;
        while(i--) {
            var state = states[i];
            if(
                ('persistent' in state && state.persistent === true)
                ||
                ('persist' in state && state.persist === true)
            ) {
                states.splice(i, 1);
            }
        }
        return states;
    };


    /**
     * Main function to respond to hash change.
     *
     * @method performHashChange
     * @private
     *
     * @param data {Object}                 The event data object, with value
     *                                      as current hash, and old as
     *                                      previous hash
    */
    function performHashChange(data) {
        // TODO: bind eventEmitter from this instead
        a.message.dispatch('a.state.begin', data);

        // Remove error state
        a.state._errorState = null;

        // Using a.uniq will remove all double states found
        var currentHash  = data.value,
            previousHash = data.old,
            foundState   = foundHashState(currentHash),
            loading      = a.uniq(a.flatten(foundState)),
            unloading    = loaded,
        // Only keep difference between (= state allowed to load/unload)
            loadingIntersection   = a.difference(loading, unloading),
            unloadingIntersection = a.difference(unloading, loading);

        // Now we need to extract from foundState the top state:
        // The states who need to be refresh no matter what changes has
        // been done
        var topState = [];

        a.each(foundState, function(arrayState) {
            // For every top state, if they are appearing into loaded/unloading
            // But not into unloadingIntersection, we apply them
            if(arrayState.length > 0) {
                var top = a.first(arrayState);

                if(a.contains(unloading, top) &&
                    !a.contains(unloadingIntersection, top)) {
                    topState.push(arrayState[0]);
                }
            }
        });

        // Now we got the topState populated, we can add it:
        unloadingIntersection = a.union(unloadingIntersection, topState);
        loadingIntersection   = a.union(loadingIntersection,   topState);

        // We remove unloaded elements and add new elements
        // We do it right now to prevent some unwanted loading
        loaded = a.difference(loaded, unloadingIntersection)
                                    .concat(loadingIntersection);

        // Removing persistent states from unloading chain
        unloadingIntersection = removePersistentState(unloadingIntersection);
        // Perform the unload/load process
        setTimeout(function() {
            performUnloadChanges(unloadingIntersection, function() {
                setTimeout(function() {
                    performLoadChanges(loadingIntersection, function() {
                        // We clear inject, and raise event
                        a.state._inject = {};
                        a.message.dispatch('a.state.end', data);
                    });
                }, 0);
            });
        }, 0);
    };









    /**
     * Perform a single ACL test on a state, with a given role.
     *
     * @method performSingleAclTest
     * @private
     *
     * @param state {Object}                The state to check
     * @param role {String}                 The acl role to test
     * @return {Boolean}                    True if role is null/not defined
     *                                      or state is ok regarding role,
     *                                      False if the state is not ok for
     *                                      the given role.
    */
    function performSingleAclTest(state, role) {
        // On an empty/erase role, we allow everything
        if(!role || a.isNone(role)) {
            return true;
        }

        var acl = state.acl || {};

        // Test minimum & maximum
        if(
            (a.isString(acl.minimum) && a.acl.isRefused(acl.minimum, role)) ||
            (a.isString(acl.maximum) && a.acl.isRefused(role, acl.maximum))
        ) {
            return false;
        }

        // Test allowed
        if(
            (a.isString(acl.allowed) && acl.allowed !== role) ||
            (a.isArray(acl.allowed) && !a.contains(acl.allowed, role))
        ) {
            return false;
        }

        // Test refused
        if(
            (a.isString(acl.refused) && acl.refused === role) ||
            (a.isArray(acl.refused) && a.contains(acl.refused, role))
        ) {
            return false;
        }

        return true;
    };

    /**
     * As ACL is put in cache, when the role change, state need to fully
     * update it's internal data.
     *
     * @method performAclChange
     * @private
     *
     * @param role {String}                 The new role to apply
    */
    function performAclChange(role) {
        a.each(tree, function(state) {
            state._storm.acl = performSingleAclTest(state, role);
        });
    };


    // Bind events from other elements
    a.hash.bind('change', performHashChange, null, false, false);
    a.acl.bind('change', function(role) {
        performAclChange(role);
        // For a unknow reason
        // this helps to refresh hash path finding...
        // (prevent a bug)
        // Seems to be resolved...
        /*performHashChange({
            value: a.hash.getHash(),
            old: a.hash.getPreviousHash()
        });*/
    }, null, false, false);









    /**
     * Add a state to the existing state tree
     *
     * @method add
     *
     * @param state {Object}                A state to add to system
    */
    this.add = function(state) {
        // Only for existing state
        if(a.isArray(state)) {
            a.each(state, function(element) {
                this.add(element);
            }, this);
            return;
        }

        // If the id is already defined, we create unique id
        if(!state.id || this.get(state.id) !== null) {
            state.id = a.uniqueId('state_');
        }

        // Applying children
        var children = state.children || null;
        state.children = null;

        // We are storing every needed stuff for appstorm here
        state._storm = {
            parent: state.parent || null,
            options: state.options || null,
            data: state.data || {},
            flash: state.flash || null,
            level: 0,
            acl: null
        };

        // We create the flash element (if it's not already a function)
        state.flash = a.scope(function(message) {
            // We go for an inside flash
            if(a.isString(this._storm.flash) && this._storm.flash) {
                var entry = this.entry || this.target || this.el || this.dom ||
                        null;

                if(a.isFunction(entry)) {
                    entry = entry.call(this);
                }

                if(entry && a.isString(entry)) {
                    a.dom.query(this._storm.flash, entry).html(message);
                } else {
                    a.dom.query(this._storm.flash).html(message);
                }

            // User want a deeper control
            } else if(a.isFunction(this._storm.flash)) {
                this._storm.flash.apply(this, arguments);

            // We go up one level to parent
            } else if(this.parent && a.isFunction(this.parent.flash)) {
                this.parent.flash(message);

            // No way to handle it
            } else {
                a.console.storm('error', 'a.state', 'The state ```' + this.id +
                        '``` was unable to proceed flash message ```' +
                        this._storm.flash + '```', 1);
            }
        }, state);

        // If there is parent linked to it
        if(state.parent &&
                (a.isString(state.parent) || a.isNumber(state.parent)) ) {

            var parent = this.get(state.parent);
            if(parent) {
                state.parent = parent;
                // We store level
                state._storm.level = parent._storm.level + 1;
                // We store child into parent
                if(!parent.children || !a.isArray(parent.children)) {
                    parent.children = [];
                }
                parent.children.push(state);
            } else {
                a.console.storm('error', 'a.state.add', 'Unable to find ' +
                        'the parent ```' + state.parent + '``` for state ```' +
                        state.id + '```', 1);
            }
        } else {
            state.parent = null;
        }

        // We convert into array of values
        if(state.hash && a.isString(state.hash)) {
            state.hash = [state.hash];
        }

        // Every hash are parsed and checked
        if(state.hash && a.isArray(state.hash)) {
            state._storm.hash = [];
            for(var i=0, l=state.hash.length; i<l; ++i) {
                var hash = state.hash[i];
                // First of all: we get the protocol loader
                var protocol = a.state.protocol.tester(hash);

                // The protocol exist, we can parse it
                if(protocol) {
                    // We get the related function extracter
                    var type = a.state.protocol.get(protocol);
                    // The system exist, we can apply transformation
                    if(a.isTrueObject(type)) {
                        // We apply converter to get the final good hash
                        hash = type.fn(state, i);
                    }
                }

                var store = {
                    isRegexHash: false,
                    regex: null,
                    hash: a.parameter.convert(hash)
                };

                if(hash.indexOf('{{') >= 0 && hash.indexOf('}}') >= 0) {
                    store.isRegexHash = true;
                }

                // Making it strict catch for regex one
                if(store.isRegexHash) {
                    store.hash = '^' + store.hash + '$';
                    store.regex = new RegExp(store.hash, 'g');
                }

                state._storm.hash.push(store);
            }
        }

        // Applying acl
        state._storm.acl = performSingleAclTest(state, a.acl.getCurrentRole());

        // We delete place as we will use it
        state.data    = {};
        state.options = null;

        tree[state.id] = state;

        // For every children, we add
        if(a.isArray(children)) {
            a.each(children, function(child) {
                child.parent = state.id;
                this.add(child);
            }, this);
        } else if(a.isTrueObject(children)) {
            children.parent = state.id;
            this.add(children);
        }
    };

    /**
     * From an existing state (found by id), create a free-clone copy of it,
     * and replace all elements inside found in extendedState.
     * This allow to quickly duplicate a state-base element.
     *
     * @method use
     *
     * @param id {String}                   The id to get the base to duplicate
     * @param extendState {Object}          The state to replace data from
     *                                      original and create new state from.
    */
    this.use = function(id, extendState) {
        var state = this.get(id);

        // We create a clone of initial state (to not alter the original copy)
        // and replace all elements found in extendState into the state copy,
        // exactly what we want !
        if(state) {
            this.add(a.extend(a.deepClone(state), extendState));
        }
    };

    // Alias
    this.extend = this.use;

    /**
     * Remove a state from existing state.
     *
     * @method remove
     *
     * @param id {String}                   The state id to delete
    */
    this.remove = function(id) {
        var hash = this.get(id);

        if(hash && a.isArray(hash.children)) {
            a.each(hash.children, function(child) {
                this.remove(child);
            }, this);
        }

        // We remove
        delete tree[id];
    };

    /**
     * Clear all elements currently stored
     *
     * @method clear
    */
    this.clear = function() {
        tree = {};
        loaded = [];
        this._errorState = null;
        this._inject = {};
    };

    /**
     * Get a state from it's id.
     *
     * @method get
     *
     * @param id {String}                   The state id to found
     * @return {Object | null}              The state found, or null
    */
    this.get = function(id) {
        return tree[id] || null;
    };

    /**
     * Get the full state list.
     *
     * @method tree
     *
     * @return {Array}                      The inner tree stored
    */
    this.tree = function() {
        return tree;
    };

    /**
     * Load a state and needed parents from state id.
     *
     * @method load
     *
     * @param id {String}                   The state id to load
    */
    this.load = function(id) {
        var state = this.get(id);

        if(state) {
            // We search all parents related
            var states     = foundParentState(state),
                // From currently setted state, we remove elements
                // who don't need to load
                difference = a.difference(states, loaded);

            // As the load allow to multi-load existing state
            // If difference is empty, we still load the uppest state
            if(difference.length <= 0) {
                difference = [state];
            }

            loaded = loaded.concat(difference);

            // Difference
            setTimeout(function() {
                performLoadChanges(difference);
            }, 0);
        }
    };

    /**
     * Reload a state
     *
     * @method reload
     *
     * @param id {String}                   The state id to reload
    */
    this.reload = function(id) {
        var state = this.get(id);

        if(state) {
            // We search all parents related
            var states     = foundParentState(state),
                // From currently setted state, we remove elements
                // who don't need to load
                difference = a.difference(states, loaded);

            // As the load allow to multi-load existing state
            // If difference is empty, we still load the uppest state
            if(difference.length <= 0) {
                difference = [state];
            }

            loaded = loaded.concat(difference);

            // Difference
        // Perform the unload/load process
            setTimeout(function() {
                performUnloadChanges(difference, function() {
                    setTimeout(function() {
                        performLoadChanges(difference);
                    }, 0);
                });
            }, 0);

        }
    };

    /**
     * Unload a state and needed parents from state id.
     *
     * @method unload
     *
     * @param id {String}                   The state id to unload
    */
    this.unload = function(id) {
        var state = this.get(id);

        if(state) {
            // We search all parents related
            var states = foundParentState(state);

            // TODO: we need to stop unloading where another child is
            // still loaded to it

            performUnloadChanges(states);
            // TODO: update loaded elements with removed
        }
    };

    /**
     * Mostly for testing purpose, but this return the currently
     * loaded states (all of them).
     * NOTE: you should avoid using it in production site, may be changed
     * without any notice
     *
     * @return The array with all loaded states.
    */
    this.__loaded = function() {
        return loaded;
    };

    /**
     * Test a hash is existing into states.
     *
     * @param hashExists
     *
     * @param hash {String}                 The hash to try
    */
    this.hashExists = function(hash) {
        // The foundHashState return array of array, so we flat it
        var states = a.flatten(foundHashState(hash));
        return (states.length > 0);
    };

    /**
     * Inject an object for next state.
     *
     * @method inject
     *
     * @param obj {Object}                  The object key/value to add to
     *                                      existing base
    */
    this.inject = function(obj) {
        if(a.isNull(this._inject)) {
            this._inject = {};
        }

        // Now we extend inject with new elements
        if(a.isTrueObject(obj)) {
            this._inject = a.assign(this._inject, obj);
        }
    };

    /**
     * Store the latest failing state
     * @property _errorState
     * @type Object
     * @default null
    */
    this._errorState = null;

    /**
     * Injected elements for next state
     * @property _inject
     * @type Object
     * @default null
    */
    this._inject     = {};
};








/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Get injected elements
    Handlebars.registerHelper('inject', function(key) {
        return new Handlebars.SafeString(a.state._inject[key] || null);
    });

    a.parameter.addParameterType('inject',  function(key) {
        return a.state._inject[key] || null;
    });
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        State loading/unloading sequence manager.

************************************************************************ */

/**
 * State loading/unloading sequence manager.
 *
 * @class chain
 * @static
 * @namespace a.state
*/
a.state.chain = new function() {
    var loadingChain   = [],
        unloadingChain = [];

    /**
     * Get the store related to current chain (loading or unloading)
     *
     * @method getStore
     * @private
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @return {Array}                      The current chain list
    */
    function getStore(loadOrUnload) {
        return (loadOrUnload == true || loadOrUnload == 1
                || loadOrUnload == 'loading' || loadOrUnload == 'load') ?
                    loadingChain : unloadingChain;
    };

    /**
     * Add a function to the chain
     *
     * @method add
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param name {String}                 The function name (to identify it)
     * @param test {Function}               A function to call and try if
     *                                      the given state should use this
     *                                      chain or not (things to go faster,
     *                                      if you dont know, just create
     *                                      blank function which always return
     *                                      true)
     * @param fct {Function}                The function to call
     * @param option {Object}               An option tool to place this in the
     *                                      chain. It can be 'after:string'
     *                                      where string is the function name
     *                                      to plug after, or 'before', the
     *                                      same as after for inserting before.
     *                                      Or position to specify integer to
     *                                      to place at the defined position
    */
    this.add = function(loadOrUnload, name, test, fct, option) {
        option = option || {};

        var store = getStore(loadOrUnload),
            storedObject = {
                name:  name,
                test:  test,
                fct:   fct,
                scope: option.scope || null
            };

        var flat = a.pluck(store, 'name'),
            pos  = flat.length;


        if(option.after && a.contains(flat, option.after)) {
            pos = a.indexOf(flat, option.after) + 1;
        } else if(option.before && a.contains(flat, option.before)) {
            pos = a.indexOf(flat, option.before);
        } else if(option.position <= flat.length) {
            pos = option.position;
        }

        if(pos < 0) {
            pos = 0;
        }

        // We place function in the chain
        if(pos >= flat.length) {
            store.push(storedObject);
        } else {
            store = store.splice(pos, 0, storedObject);
        }
    };

    /**
     * Remove a function from the chain
     *
     * @method remove
     *
     * @param loadOrUnload {Boolean}        The current chain you try to access
     *                                      True, 1, 'loading' or 'load' will
     *                                      give the loading chain. Anything
     *                                      else will give the unloading chain
     * @param name {String}                 The name given to 'add' to remove
    */
    this.remove = function(loadOrUnload, name) {
        var store = getStore(loadOrUnload),
            i = store.length;

        while(i--) {
            if(store[i].name == name) {
                store.splice(i, 1);
            }
        }
    };

    /**
     * Get the loading or unloading chain
     *
     * @method get
     *
     * @param loadOrUnload {Boolean}        True to get the load chain, false
     *                                      to get the unloading chain
    */
    this.get = function(loadOrUnload) {
        return getStore(loadOrUnload);
    };

    /**
     * Get the loading or unloading chain. Same as get function, but remove
     * un-needed toolchain function, better to use this one.
     *
     * @method getWithTest
     *
     * @param loadOrUnload {Boolean}        True to get the load chain, false
     *                                      to get the unloading chain
     * @param state {Object}                The state to test
    */
    this.getWithTest = function(loadOrUnload, state) {
        var get = getStore(loadOrUnload),
            toolchain = [];

        for(var i=0, l=get.length; i<l; ++i) {
            var tmp = get[i],
                test = tmp.test;

            if(test) {
                if(test.call(state, state) === true) {
                    toolchain.push(tmp.fct);
                }
            }
        }

        return toolchain;
    }
};





(function() {
    /*
    ----------------------------------
      DEFAULT LOADING CHAIN
    ----------------------------------
    */


    /**
     * Go to next step
     *
     * @method goToNextStep
     * @private
     *
     * @param {Array}                       The arguments to pass threw
    */
    function goToNextStep() {
        var args  = a.toArray(arguments),
            chain = a.last(args),
            other = a.initial(args);

        chain.next.apply(this, other);
    };

    /**
     * Get the related state entry
     * Note: angular plugin also use this function, so apply change to it also
     *
     * @method getEntry
     * @private
     *
     * @return {String}                     The dom found
    */
    function getEntry() {
        var el = this.entry || this.target || this.el || this.dom || null;

        if(a.isFunction(el)) {
            return el.call(this);
        }

        // Regular string
        return el;
    };

    /**
     * Test if the given function should be run in async mode or not.
     *
     * @method testAsync
     * @private
     *
     * @param async {Mixed}                 The value to test
     * @param name {String}                 The chain name to test
     * @return {Boolean}                    True if it should be run in async
     *                                      mode, false in other cases
    */
    function testAsync(async, name) {
        return (async === true || async === name || (
            a.isArray(async) && a.contains(async, name)
        ));
    };

    /**
     * Convert string to array element.
     *
     * @method stringToArray
     * @private
     *
     * @param element {Mixed}               Element to convert or keep
     * @return {Array}                      The converted array
    */
    function stringToArray(element) {
        if(a.isString(element)) {
            return [element];
        } else if(a.isArray(element)) {
            return element;
        }
        return [];
    };

    /**
     * Create a callback function for loader system.
     *
     * @method generateDefaultLoader
     * @private
     *
     * @param fct {Function}                The loader function used
     * @param uri {String}                  The uri to load
     * @param extra {Function | null}       The extra parsing function
     *                                      (may be needed)
    */
    function generateDefaultLoader(fct, uri, extra) {
        return function(chain) {
            a.loader[fct](uri, function(data) {
                if(a.isFunction(extra)) {
                    extra(data);
                }
                chain.next();
            }, a.scope(chain.error, this));
        };
    };

    /**
     * Extract from data parameters to bind
     *
     * @method parseDataOption
     * @private
     *
     * @param options {Object}              The object data to use
     * @param hash {String}                 The hash to extract content from
     * @param internal {Object}             Internal content to use for binding
    */
    function parseDataOption(options, hash, internal) {
        a.each(options, function(option, key) {
            if(a.isTrueObject(option)) {
                parseDataOption(option, hash, internal);
            } else {
                options[key] = a.parameter.extrapolate(option, hash, internal);
            }
        })
    };

    /**
     * Get the data from url or store
     *
     * @method generateDataLoader
     * @private
     *
     * @param state {Object}                The state who need thoose data
     * @param name {String | null}          The current object name to get
     * @param options {Object}              The request options to send to ajax
     * @param success {Function | null}     The success function to use before
     *                                      leaving loading data
     * @param error {Function | null}       The error handler to use in case
     *                                      of any error
    */
    function generateDataLoader(state, name, url, options, success, error) {
        var initContent = a.isNone(name) ?
                            state._storm.data : state._storm.data[name],
            hash      = a.hash.getHash(),
            internal  = state.hash || [''],
            // In this case we don't want the string escape, so we ask for
            // original content (false at the end)
            parsedUrl = null;

        // Sometimes options can arrive null
        options = a.isTrueObject(options) ? options: {};

        if(a.isString(url)) {
            for(var i=0, l=internal.length; i<l; ++i) {
                // When using a full element, we probably want to not escape
                // it - to recieve an object from memory
                // But if it's a string to escape, we probably don't want it
                // and get the string + variable replaced inside.
                var escaped = (url.indexOf('{{') === 0) ? false: true;
                parsedUrl = a.parameter.extrapolate(url, hash,
                                            internal[i], escaped);

                parseDataOption(options, hash, internal[i]);
            }
        }

        return function(chain) {
            var method = (options.method) ? options.method : 'GET',
                mockResult = a.mock.get(method, url);

            // We test mock support before sending to ajax.
            // As we have to support 'raw' requests
            // If we got something, we skip the request.
            if(mockResult !== null) {
                if(a.isNone(name)) {
                    state.data = mockResult;
                } else {
                    state.data[name] = mockResult;
                }
                chain.next();
                return;
            }

            // We are not in URL mode as suggest url mode
            if(a.isString(initContent) && initContent.indexOf('{{') === 0
            && initContent.indexOf('}}') === (initContent.length - 2)) {
                if(a.isNone(name)) {
                    state.data = parsedUrl;
                } else {
                    state.data[name] = parsedUrl;
                }
                chain.next();
                return;

            // We are in function mode: we let user define what to do
            // with data. The chain.next is embeded into another object
            // to deliver the response to AppStorm.JS
            } else if(a.isFunction(initContent)) {
                // Custom object to change the 'next' function
                var customDone  = function(result) {
                        if(a.isNone(name)) {
                            state.data = result;
                        } else {
                            state.data[name] = result;
                        }

                        // We rollback to previous before continue
                        // In other case we will create problem...
                        chain.next();
                    };

                // We need to create a custom object
                // to handle a specific done/next function
                var customChain = {
                    next:    customDone,
                    done:    customDone,
                    success: customDone,
                    fail:    chain.fail,
                    error:   chain.error,
                    stop:    chain.stop,
                    setData: chain.setData,
                    getData: chain.getData
                };

                // We call the function and pass the new 'chain' element
                initContent.call(state, customChain);

            // We need to get url
            // BUT, if the parsed element is not done property, we should quit
            } else if(parsedUrl !== null) {
                options.url = parsedUrl;

                var request = new a.ajax(options,
                // Success
                function(content) {
                    if(a.isNone(name)) {
                        state.data = content;
                    } else {
                        state.data[name] = content;
                    }

                    if(a.isFunction(success)) {
                        success.call(state, content, chain);
                    } else {
                        chain.next();
                    }

                // Error
                }, function(url, status) {
                    if(a.isFunction(error)) {
                        error.call(state, url, status, chain);
                    } else {
                        chain.error.apply(state, arguments);
                    }
                });

                // Starting and waiting reply
                request.send();

            // Parsed is probably null, it means the content is not ready to show
            } else {
                a.console.storm('error', 'a.state.chain', 'Request cannot ' +
                        'be proceed, url parsing have fail. It can be ' +
                        ' related to some missing parameters. Request: ```' +
                        name + '```, state: ```' + state.id + '```', 2);
            }
        };
    };

    /**
     * Get the parsed with parameters version of every request from include.
     *
     * @method getInclude
     * @private
     *
     * @param state {Object}                The state to load include from
     * @param name {String}                 The include name to get
     * @param role {String}                 The user role to check linked
     *                                      include
     * @return {Array}                      The founded include or empty string
    */
    function getInclude(state, name, role) {
        var include  = state.include || [],
            tmp_role = name + '_' + role,
            tmpRole  = a.firstLetterUppercase(role, name),
            tmp_def  = name + '_default',
            tmpDef   = name + 'Default';

        var selected = include[tmp_role] || include[tmpRole] ||
                        include[tmp_def] || include[tmpDef]  ||
                        include[name]    || [];

        var converted = stringToArray(selected),
            hashs = getValidHash(state),
            i = converted.length;

        while(i--) {
            for(var j=0, l=hashs.length; j<l; ++j) {
                converted[i] = a.parameter.extrapolate(
                        converted[i], a.hash.getHash(), hashs[j]);
            }
        }

        return converted;
    };

    /**
     * From a list of possible hash values, get only the currently in use hash
     *
     * @method getValidHash
     * @private
     *
     * @param state {Object}                The state object to use
     * @return {Array}                      The list of hash currently OK
    */
    function getValidHash(state) {
        var hash = a.hash.getHash(),
            hashs = state.hash || [],
            result = [];

        for(var i=0, l=hashs.length; i<l; ++i) {
            var stateHash = state.hash[i],
                stateStore = state._storm.hash[i];

            if(stateStore.isRegexHash) {
                stateStore.regex.lastIndex=0;
                if(stateStore.regex.test(hash)) {
                    result.push(stateHash);
                }
            } else {
                if(stateHash === hash) {
                    result.push(stateHash);
                }
            }
        }

        return result;
    };

    // LOAD: add parameters
    a.state.chain.add(true, 'loadParameters', 
    // Test
    function() {
        return (('hash' in this) && !a.isNone(this.hash));
    },
    // Content
    function() {
        try {
            var result = {},
                hashs  = getValidHash(this),
                hash   = a.hash.getHash();

            // Doing the load parameter for every possible hash
            for(var i=0, l=hashs.length; i<l; ++i) {
                var extracted = a.parameter.extract(hashs[i]),
                    values = a.parameter.getValues(hash, hashs[i], extracted),
                    j = values.length;

                while(j--) {
                    result[values[j].name] = values[j].value;
                }
            }

            // Applying parameters
            this.parameters = result;
        } catch(e){}
        goToNextStep.apply(this, arguments);
    });

    // LOAD: preLoad
    a.state.chain.add(true, 'preLoad',
    // Test
    function() {
        // If preload is defined only
        return a.isFunction(this.preLoad);
    },
    // Content
    function() {
        if(testAsync(this.async, 'preLoad')) {
            this.preLoad.apply(this, arguments);
            return;
        } else {
            this.preLoad.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: title
    a.state.chain.add(true, 'title',
    // Test
    function() {
        return (('title' in this) && a.isString(this.title));
    },
    // Content
    function() {
        if(this.title.indexOf('{{') >= 0 && this.title.indexOf('}}') >= 0) {
            var hashs = getValidHash(this);
            for(var i=0, l=hashs.length; i<l; ++i) {
                document.title = a.parameter.extrapolate(
                            this.title, a.hash.getHash(), hashs[i]);
            }
        } else {
            document.title = this.title;
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: include (insert included elements into DOM)
    a.state.chain.add(true, 'include',
    // Test
    function() {
        // State does not handle any data or include to load
        if(!('include' in this) && !('data' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        var hash     = a.hash.getHash(),
            internal = getValidHash(this),
            args     = arguments,
            chain    = a.last(args),
            state    = this;

        // Load files, and bring html using entry/type
        var sync     = a.callback.synchronizer(null, a.scope(function() {
            goToNextStep.apply(this, args);
        }, this), function() {
            a.state._errorState = state;
            chain.error.apply(this, arguments);
        }),
            role     = a.acl.getCurrentRole(),
            partials = (this.include && this.include.partials) ? 
                            this.include.partials : {};

        var css  = getInclude(this, 'css',       role),
            js   = getInclude(this, 'js',        role),
            html = getInclude(this, 'html',      role),
            tr   = getInclude(this, 'translate', role);

        // Loading CSS
        a.each(css, function(url) {
            sync.addCallback(generateDefaultLoader.call(this, 'css', url));
        }, this);

        // Loading JS
        a.each(js, function(url) {
            sync.addCallback(generateDefaultLoader.call(this, 'js', url));
        }, this);

        // Loading translate
        a.each(tr, function(url) {
            sync.addCallback(
                generateDefaultLoader.call(this, 'json', url,
                function(content) {
                    a.each(content, function(translate, index) {
                        a.translate.add(index, translate, true);
                    });
                })
            );
        }, this);

        // Loading data
        var differenceData = null;
        if(a.isArray(this._storm.data) || a.isTrueObject(this._storm.data)) {
            differenceData = a.differenceObject(this.data, this._storm.data);
        }
        this.data = a.deepClone(this._storm.data);
        this.options = a.deepClone(this._storm.options) || {type: 'json'};

        // This case is converted into {url/options} one
        if(a.isString(this.data)) {
            this.data = {
                url:     this.data,
                options: a.clone(this.options),
                error:   null,
                success: null
            };
        }

        // The data is not a single string but rather a multi load system
        if(a.isTrueObject(this.data)) {
            // We are in single-data mode
            if('url' in this.data && 'options' in this.data) {
                sync.addCallback(generateDataLoader(this, null, this.data.url,
                                    this.data.options, null, null));

            // We are in multi-data mode
            } else {
                a.each(this.data, function(data, name) {
                    if(a.isString(data)) {
                        data = {
                            url:     data,
                            options: this.options,
                            error:   null,
                            success: null
                        };
                    }

                    // Little convertion
                    data.error   = (a.isFunction(data.error)) ?
                                                    data.error: null;
                    data.success = (a.isFunction(data.success)) ?
                                                    data.success: null;

                    sync.addCallback(generateDataLoader(this, name, data.url,
                                    data.options, data.success, data.error));
                }, this);

                // We put back data into element
                if(differenceData) {
                    a.each(differenceData, function(data, name) {
                        this.data[name] = data;
                    }, this);
                }
            }
        } else if(a.isFunction(this.data)) {
            sync.addCallback(generateDataLoader(this, null, this.data, null,
                                                        null, null));
        } else {
            a.console.storm('error', 'a.state.chain.include', 'The state ```' +
                    this.id + '``` is not valid (data is not valid)', 1);
        }

        // Loading partials
        a.each(partials, function(uri, name) {
            sync.addCallback(function(chain) {
                a.template.partial(name, uri, function() {
                    chain.next();
                }, function() {
                    chain.error();
                });
            });
        });

        // Loading HTML
        sync.addCallback(a.scope(function(chain) {
            var url   = html[0];

            // Nohting to load
            if(!url) {
                chain.next();
                return;
            }

            for(var i=0, l=internal.length; i<l; ++i) {
                url = a.parameter.extrapolate(url, hash, internal[i]);
            }
            this._storm.html = url;
            a.template.get(url, {}, chain.next, chain.error);
        }, this));


        sync.start();
    });

    // Load: converter before rendering data
    a.state.chain.add(true, 'converter',
    // Test
    function() {
        return (('converter' in this) && a.isFunction(this.converter));
    },
    // Content
    function() {
        this.converter.call(this, this.data);
        goToNextStep.apply(this, arguments);
    });

    // LOAD: content (insert HTML content)
    a.state.chain.add(true, 'contentLoad',
    // Test
    function() {
        return (('include' in this) && ('html' in this.include));
    },
    // Content
    function() {
        var args  = a.toArray(arguments),
            chain = a.last(args);

        a.template.get(this._storm.html, this.data, a.scope(
        function(content) {
            var entry = getEntry.call(this);

            // User can also define their custom function directly into state
            if(a.isFunction(this.type)) {
                // We call the function, and give the chain to system
                this.type.call(this, entry, content, chain);

            } else if(entry) {
                var el    = a.dom.query(entry),
                    type  = this.type || 'replace',
                    obj   = a.state.type.get(type);

                if(obj && a.isFunction(obj.input)) {
                    if(obj.async) {
                        // We delegate the chain continuation
                        obj.input.call(this, el, content, chain);
                    } else {
                       obj.input.call(this, el, content);
                       goToNextStep.apply(this, args);
                    }

                } else {
                    // TODO: print error
                    goToNextStep.apply(this, args);
                }
            }
        }, this));
    });

    // LOAD: load
    a.state.chain.add(true, 'load',
    // Test
    function() {
        return (('load' in this) && a.isFunction(this.load));
    },
    // Content
    function() {
        if(testAsync(this.async, 'load')) {
            this.load.apply(this, arguments);
            return;
        } else {
            this.load.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: bind (HTML events)
    a.state.chain.add(true, 'bindDom',
    // Test
    function() {
        if(!('bind' in this) && !('bindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.bind || this.bindings || null,
            state    = this,
            entry    = a.dom.el(getEntry.call(this));

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    // If el is empty: we bind directly on entry root
                    if(!el) {
                        entry.bind(action, fct, state);
                    } else {
                        a.dom.query(el, entry).bind(action, fct, state);
                    }
                }

            // A single element: direct action on entry level
            } else if(split.length == 1) {
                entry.bind(a.trim(split[0]), fct, state);
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // Load: bind (GLOBAL HTML events)
    a.state.chain.add(true, 'bindGlobalDom',
    // Test
    function() {
        if(!('globalBind' in this) && !('globalBindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.globalBind || this.globalBindings || null,
            state    = this;

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    a.dom.query(el).bind(action, fct, state);
                }
            }
        });

        goToNextStep.apply(this, arguments);
    });


    // LOAD: bind (keyboard events)
    a.state.chain.add(true, 'bindKeyboard',
    // test
    function() {
        if(!('keyboard' in this) && !('accelerator' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        var bindings = this.keyboard || this.accelerator || null;

        a.each(bindings, function(fct, query) {
            // We keyboard binding with key type press selection
            var split = query.split('|');

            a.each(split, function(content) {
                var evt  = content.split(':'),
                    key  = a.trim(evt[0]),
                    type = evt[1] ? a.trim(evt[1]): 'keypress';

                type = type.toLowerCase();
                if(type!='keypress' && type!='keydown' && type!='keyup') {
                    type = 'keypress';
                }

                a.keyboard.bind(key, fct, this, type);
            }, this);
        }, this);

        goToNextStep.apply(this, arguments);
    });

    // LOAD: postLoad
    a.state.chain.add(true, 'postLoad',
    // Test
    function() {
        return (('postLoad' in this) && a.isFunction(this.postLoad));
    },
    // Content
    function() {
        if(testAsync(this.async, 'postLoad')) {
            this.postLoad.apply(this, arguments);
            return;
        } else {
            this.postLoad.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // LOAD: loadAfter: launch state after this one is loaded
    a.state.chain.add(true, 'loadAfter',
    // Test
    function() {
        return (('loadAfter' in this) && !a.isNone(this.loadAfter));
    },
    // Content
    function() {
        var after = this.loadAfter;
        if(a.isArray(after)) {
            a.each(after, function(state) {
                a.state.load(state);
            });
        } else if(a.isString(after) || a.isNumber(after)) {
            a.state.load(after);
        }
        goToNextStep.apply(this, arguments);
    });


    /*
    ----------------------------------
      DEFAULT UNLOADING CHAIN
    ----------------------------------
    */

    // UNLOAD: preUnload
    a.state.chain.add(false, 'preUnload',
    // Test
    function() {
        return (('preUnload' in this) && a.isFunction(this.preUnload));
    },
    // Content
    function() {
        if(testAsync(this.async, 'preUnload')) {
            this.preUnload.apply(this, arguments);
            return;
        } else {
            this.preUnload.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unbind (keyboard events)
    a.state.chain.add(false, 'unbindKeyboard',
    // Test
    function() {
        if(!('keyboard' in this) && !('accelerator' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        var bindings = this.keyboard || this.accelerator || null;

        a.each(bindings, function(fct, query) {
            // We keyboard binding with key type press selection
            var split = query.split('|');

            a.each(split, function(content) {
                var evt  = content.split(':'),
                    key  = a.trim(evt[0]),
                    type = evt[1] ? a.trim(evt[1]): 'keypress';

                type = type.toLowerCase();
                if(type!='keypress' && type!='keydown' && type!='keyup') {
                    type = 'keypress';
                }

                a.keyboard.unbind(key, fct, type);
            }, this);
        }, this);

        goToNextStep.apply(this, arguments);
    });

    // Load: unbind (GLOBAL HTML events)
    a.state.chain.add(false, 'unbindGlobalDom',
    // Test
    function() {
        if(!('globalBind' in this) && !('globalBindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.globalBind || this.globalBindings || null;

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    a.dom.query(el).unbind(action, fct);
                }

            // A single element: direct action on entry level
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unbind (HTML events)
    a.state.chain.add(false, 'unbindDom',
    // Test
    function() {
        if(!('bind' in this) && !('bindings' in this)) {
            return false;
        }
        return true;
    },
    // Content
    function() {
        // Use bind/binding to elements
        var bindings = this.bind || this.bindings || null,
            entry    = a.dom.el(getEntry.call(this));

        a.each(bindings, function(fct, query) {
            var split = query.split('|');

            if(split.length == 2) {
                var el     = a.trim(split[0]),
                    action = a.trim(split[1]);

                // If action is not empty (of course)
                if(action) {
                    // If el is empty: we bind directly on entry root
                    if(!el) {
                        entry.unbind(action, fct);
                    } else {
                        a.dom.query(el, entry).unbind(action, fct);
                    }
                }

            // A single element: direct action on entry level
            } else if(split.length == 1) {
                entry.unbind(a.trim(split[0]), fct);
            }
        });

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: unload
    a.state.chain.add(false, 'unload',
    // Test
    function() {
        return (('unload' in this) && a.isFunction(this.unload));
    },
    // Content
    function() {
        if(testAsync(this.async, 'unload')) {
            this.unload.apply(this, arguments);
            return;
        } else {
            this.unload.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: content (unload HTML content)
    a.state.chain.add(false, 'contentUnload',
    // Test
    function() {
        // Little bit different from them other, as it can be modified during
        // runtime
        var entry = getEntry.call(this);
        if(!entry) {
            return false;
        }
        return (a.isFunction(entry) || a.isString(entry));
    },
    // Content
    function() {
        var startingPoint = null,
            entry = getEntry.call(this),
            args  = a.toArray(arguments);

        if(a.isFunction(entry)) {
            startingPoint = a.dom.el(entry());
        } else if(a.isString(entry)) {
            startingPoint = a.dom.query(entry);
        }

        if(startingPoint) {
            var type  = this.type || 'replace',
                obj   = a.state.type.get(type);

            if(obj && a.isFunction(obj.output)) {
                if(obj.async) {
                    var chain = a.last(args);
                    // We delegate the chain continuation
                    obj.output.call(this, startingPoint, chain);
                } else {
                   obj.output.call(this, startingPoint);
                   goToNextStep.apply(this, args);
                }

            } else {
                // TODO: print error
                goToNextStep.apply(this, args);
            }
        }

        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: postUnload
    a.state.chain.add(false, 'postUnload',
    // Test
    function() {
        return (('postUnload' in this) && a.isFunction(this.postUnload));
    },
    // Content
    function() {
        if(testAsync(this.async, 'postUnload')) {
            this.postUnload.apply(this, arguments);
            return;
        } else {
            this.postUnload.call(this);
        }
        goToNextStep.apply(this, arguments);
    });

    // UNLOAD: remove parameters previously created
    a.state.chain.add(false, 'removeParameters',
    // Test
    function() {
        return (('hash' in this) && !a.isNone(this.hash));
    },
    // Content
    function() {
        try {
            // Applying parameters
            delete this.parameters;
        } catch(e){}
        goToNextStep.apply(this, arguments);
    });
})();
;/* ************************************************************************

    License: MIT Licence

    Description:
        State type to manage custom system type.

************************************************************************ */

/**
 * State type to manage custom system type.
 *
 * @class type
 * @static
 * @namespace a.state
*/
a.state.type = new function() {
    var mem = a.mem.getInstance('app.state.type');

    /**
     * Add a new type to state system.
     * Type allow you to control how the html will be loaded to system.
     *
     * @method add
     *
     * @param name {String}                 The name to use inside state
     * @param input {Function}              The function to call when name is
     *                                      found on a loading state.
     *                                      The first param given to this
     *                                      function will be entry point
     *                                      (a.dom), then the html, and finally
     *                                      if async the chain object.
     *                                      This is the function to call on
     *                                      input
     * @param output {Function}             The function to call on output
     * @param async {Boolean}               Indicate if the type should be run
     *                                      as an async or not. If the async
     *                                      is set to true, the last parameter
     *                                      will be the chain objet to continue
     *                                      like in default state.
    */
    this.add = function(name, input, output, async) {
        mem.set(name, {
            input:  input,
            output: output,
            async:  async
        });
    };

    /**
     * Remove a type from existing type elements.
     *
     * @method remove
     *
     * @param name {String}                 The type name to remove
    */
    this.remove = function(name) {
        mem.remove(name);
    };

    /**
     * Get a type from existing type list
     *
     * @method get
     *
     * @param name {String}                 The name to get
     * @return {Object | Function | null}   The founded elements
    */
    this.get = function(name) {
        return mem.get(name);
    };

    /**
     * Print the full list of type currently available.
     *
     * @method list
     *
     * @return {Object}                     The list of types found
    */
    this.list = function() {
        return mem.list();
    };
};
;/* ************************************************************************

    License: MIT Licence

    Description:
        State protocol management, allow to define custom hashtag response/
        treatment

************************************************************************ */

/**
 * State protocol management, allow to define custom hashtag response/
 * treatment
 *
 * @class protocol
 * @static
 * @namespace a.state
*/
a.state.protocol = new function() {
    var mem = a.mem.getInstance('app.state.protocol');

    /**
     * Add a new function as protocol available one.
     *
     * @method add
     *
     * @param name {String}                 The protocol name, like uri will
     *                                      produce uri:// protocol into your
     *                                      state
     * @param fct {Function}                The function to use when such a
     *                                      protocol is found
     * @param isDefault {Boolean | null}    If it's the default (no need to 
     *                                      set uri:// in front) or not.
     *                                      Note: only one default can be set
     *                                      And it's by default url (already
     *                                      setted)
    */
    this.add = function(name, fct, isDefault) {
        isDefault = (isDefault === true) ? true : false;

        mem.set(name, {
            isDefault: isDefault,
            fn:        fct
        });
    };

    /**
     * Remove from store the given protocol
     *
     * @method remove
     *
     * @param name {String}                 The protocol name to delete
    */
    this.remove = function(name) {
        mem.remove(name);
    };

    /**
     * Get from store the given protocol
     *
     * @method get
     *
     * @param name {String}                 The protocol to get
    */
    this.get = function(name) {
        return mem.get(name);
    };

    /**
     * Test the given hash and found the related protocol
     *
     * @method tester
     *
     * @param hash {String}                 The hashtag to test
     * @return {String}                     The name of the protocol found who
     *                                      fit to the hashtag. You can then
     *                                      use that name to get the full
     *                                      protocol function using get of this
     *                                      object
    */
    this.tester = function(hash) {
        if(a.isNone(hash)) {
            return null;
        }

        var protocols = mem.list(),
            isDefaultFirstName = null;

        for(var name in protocols) {
            // This is the protocol we were searching for
            if(hash.indexOf(name) === 0) {
                return name;

            // This is not the protocol, but at least the first one
            // who is default behavior
            } else if(a.isNull(isDefaultFirstName)
                        && protocols[name].isDefault) {

                isDefaultFirstName = name;
            }
        }

        // If we got a prototype of request 'like uri://', but the selected
        // name is not ok, we send back null instead
        var type = /^([a-zA-Z0-9\-\_]*):\/\//i,
            res  = type.exec(hash);

        // We found a typed prototype
        if(res && res[1] !== isDefaultFirstName) {
            return null;
        }

        return isDefaultFirstName;
    };
};


(function() {
    // Define the most basic case, using direct hashtag
    a.state.protocol.add('url', function(state, index) {
        var hash = (a.isArray(state.hash)) ? state.hash[index]: null;
        if(hash && hash.indexOf('url://') === 0) {
            return hash.substring(6);
        }
        return hash;
    }, true);

    // Define a parent related url where you get use of parent to define
    // the given hashtag final url...
    a.state.protocol.add('uri', function(state, index) {
        var hash = (a.isArray(state.hash)) ? state.hash[index]: '';
        if(hash && hash.indexOf('uri://') === 0) {
            hash = hash.substring(6);
        }

        var search = state.parent;

        while(!a.isNone(search)) {
            // Search is defined, we use it !
            if(search.hash) {
                var found = false;
                for(var i=0, l=search.hash.length; i<l; ++i) {
                    var parentType = a.state.protocol.tester(search.hash[i]);

                    // Parent type is defined, we extract data from
                    if(!a.isNull(parentType)) {
                        var type = a.state.protocol.get(parentType),
                            result = type.fn(search, i);

                        hash = result + '/' + hash;

                        // In any case, we stop as calling type.fn will already
                        // do parents of parents...
                        found = true;
                        break;
                    }
                }

                // Double exit
                if(found) {
                    break;
                }
            }

            // Still no hash to show, we continue...
            search = search.parent;
        }

        return hash;
    }, false);

    // Get the url from the given model element
    // You must provide 'model://name:uri' where name is the model name
    // and uri the resources url you're trying to use...
    a.state.protocol.add('model', function(state, index) {
        // TODO: make model instance by using a.model.manager
        // From that model, get the request
        // As the user has to submit model://name:uri
    }, false);
})();;/**
 * Create a binding system between HTML dom elements.
 * This plugin aims to run better on browser who supports 'input' HTML5 event.
 * But it still run on older browser, just slower...
 *
 * Basic usage:
 *   <a data-bind="helloworld"></a>
 *   <input type="text" data-bind="helloworld" />
 *
 *   If one of them get a different value, the other get the new value automatically
 *
 *   You can also use quicker binding:
 *   <a a-bind="helloworld"></a>
 *
 *   Or even shorter:
 *   <a bind="helloworld"></a>
*/


a.binding = (function() {
    // Searched string/elements type
    var findSearch  = ['data-bind', 'a-bind', 'bind'],
        inputSearch = ['INPUT', 'TEXTAREA'],
    // Converter function storage
        converters  = {};

    /**
     * Get attribute value for given elements
     *
     * @method getBindingName
     * @private
     *
     * @param element {DOMElement}          The element to get attribute from
     * @param search {String}               The searched attribute
     * @return {String | null}              The attribute content found
    */
    function getBindingName(element, search) {
        search = search || findSearch;
        var value = a.dom.el(element).attribute(search);

        if(a.isString(value)) {
            return value;
        } else if(value.length > 0) {
            return value[0];
        }

        return null;
    };

    /**
     * Get The stored element value
     *
     * @method getElementValue
     * @private
     *
     * @param element {DOMElement}          The element to search inside
     * @return {String}                     The InnerHTML/value inside
    */
    function getElementValue(element) {
        if(a.contains(inputSearch, element.nodeName)) {
            return element.value;
        } else {
            var content = '';
            for(var i=0, l=element.childNodes.length; i<l; ++i) {
                var node = element.childNodes[i];
                if(node.nodeType == 3) {
                    content += node.nodeValue;
                }
            }
            return content;
        }
    };

    /**
     * Perform change on other elements
     *
     * @method applyChange
     * @private
     *
     * @param name {String}                 The binding name
     * @param value {String}                The binding value to apply
    */
    function applyChange(el, name, value) {
        // Updating data
        el = this || el;
        name = getBindingName(el) || name;
        value = value || el.value;

        // Searching data-bind elements tags
        a.dom.attr(findSearch, name).each(function(val) {
            if(el && this === el) {
                return;
            }

            if(a.contains(inputSearch, this.nodeName)) {
                this.value = val;
            } else {
                this.innerHTML = val;
            }
        }, value);


        /*var innerSearch = [
                'data-inner-bind-' + name,
                'a-inner-bind-' + name,
                'inner-bind-' + name
            ];

        // From innerSearch, create the start/stop elements
        var innerStart = innerSearch.slice(),
            innerStop  = innerSearch.slice(),
            x = innerStart.length,
            y = innerStop.length;

        while(x--) {
            innerStart[x] += '-start';
        }
        while(y--) {
            innerStart[y] += '-stop';
        }

        a.message.dispatch('a.binding', {
            name: name,
            value: value
        });*/

        // Searching inner-bind-{{name}} elements tags
        /*a.dom.attr(innerStart).each(function(val) {
            if(el && this === el) {
                return;
            }

            var current = getElementValue(this),
                start   = a.dom.el(this).attribute(innerStart),
                stop    = a.dom.el(this).attribute(innerStop) || 0;

            // We skip previous value, and setup new value
            current = current.substr(0, start)
                        + val + current.substr(start + stop);

            // TODO: all other values linked should have their
            // start value updated if above the current start position
            // (has we change the length of string) !
        }, value);*/
        /*a.dom.attr(innerStart).each(function(val) {
            // TODO: take advantages of functionnalities here
        }, value);*/
    };

    /**
     * Tiny binder between the applyChange function and event related
     *
     * @method eventApplyChange
     * @private
     *
     * @param evt {Object}                  The input event
    */
    function eventApplyChange(evt) {
        applyChange.call(evt.target);
    };

    /**
     * Search for sub elements linked by binding to another element
     *
     * @method detectBinding
     * @private
     *
     * @param root {DOMElement}             The root element to start searching
     *                                      from.
     * @return {Array}                      The HTML elements who are emitting
    */
    function binding(root) {
        var elements = [];

        // We get elements subject to binding
        a.dom.el(root || document).attr(findSearch).each(function() {
            if(!a.contains(inputSearch, this.nodeName)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).bind('change input keydown', eventApplyChange);

            // Start first time
            applyChange.call(this);
        });

        return elements;
    };

    /**
     * Unbind previously binded elements
     *
     * @method unbinding
     * @private
     *
     * @param root {DOMElement}             The root element to start searching
     *                                      from.
     * @return {Array}                      The HTML elements who are emitting
    */
    function unbinding(root) {
        var elements = [];

        // We get elements subject to binding
        a.dom.el(root || document).attr(findSearch).each(function() {
            if(!a.contains(inputSearch, this.nodeName)) {
                return;
            }

            elements.push(this);

            // On change apply binding
            a.dom.el(this).unbind('change input keydown', eventApplyChange);
        });

        return elements;
    };

    /**
     * Find elements who include inner data to register,
     * and mark them for later use.
     *
     * @method findInnerDataElement
     * @private
     *
     * @param root {DOMElement | null}      The root element to start search
     *                                      from
    */
    function findInnerDataElement(root) {
        root = root || document;

        var reg = /\{\{\s*(\w+)\s*\}\}/gi;

        // Search in all sub elements of root if they need to be
        // marked as inner data
        a.dom.el(root).all().each(function() {
            // Erasing previous reg test
            reg.lastIndex = 0;

            // Selecting HTML content
            var value = getElementValue(this);

            // Searching TAG inside value
            if(
                    !value ||
                    value.indexOf('{{') == -1 ||
                    value.indexOf('}}') == -1 ||
                    !reg.test(value)) {
                return;
            }

            // To remember position of all elements
            var matches = value.match(reg);
            reg.lastIndex = 0;

            // We remove '{{' and '}}' and replace them by invisible char
            // We also remove inside {{...}} because we don't need it
            // (as matches already keep position of every elements)
            console.log(value.replace(reg, '\u200C\u200c\u200C\u200c'));

            // TODO: we add attribute tag to retrieve them
            // TODO: create a fct to insert tag into element at specified position

            /*console.log(this);

            // For every entry found in the string
            // We create a linked marker
            var m     = null,
                found = false;

            while(m = reg.exec(value)) {
                var start   = m.index,
                    bracket = m[0],
                    name    = a.trim(m[1]),
                    base    = 'data-inner-bind-' + name;

                found = true;

                // Set tags as follow for every entries: name & start pos
                this.setAttribute(
                    base + '-start', '' + start
                );
                this.setAttribute(
                    base + '-stop', '0'
                );

                // We update the value to remove old position marker
                value = value.replace(bracket, '');
            }

            // If we found something, it means we have to update content
            // with removed tag found
            if(found) {
                setElementValue(this, value);
            }*/
        });
    };

    return {
        /**
         * Search binding into given dom object, and try to find bindings
         * to use.
         *
         * @method bind
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who recieve
         *                                  event binding
        */
        bind: function(dom) {
            return binding(dom);
        },

        /**
         * From a given start point, unbind sub children to binding system.
         *
         * @method unbind
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who loose
         *                                  event binding
        */
        unbind: function(dom) {
            return unbinding(dom);
        },

        /**
         * Manually call a binding refresh.
         *
         * @method manual
         *
         * @param name {String}             The binding name to refresh
         * @param value {String}            The value to apply
        */
        manual: function(name, value) {
            applyChange(null, name, value);
        },

        /**
         * Refresh everything and start again system.
         *
         * @method refresh
         *
         * @param dom {DOMObject || null}   The dom starting point
         * @return {Array}                  The input/textarea who recieve
         *                                  event binding
        */
        refresh: function(dom) {
            unbinding(dom);
            return binding(dom);
        },

        /**
         * Register a new converter to use
         *
         * @method registerConverter
         *
         * @param name {String}             The name to use inside html tags
         * @param fct {Function}            The function linked to name
        */
        /*registerConverter: function(name, fct) {
            if(a.isFunction(fct)) {
                converters[name] = fct;
            }
        },*/

        /**
         * Get a converter by it's name
         *
         * @method getConverter
         *
         * @param name {String}             The name used for registerConverter
         * @return {Function | null}        The related function, or null
         *                                  if nothing has been found
        */
        /*getConverter: function(name) {
            return converters[name] || null;
        },*/

        /**
         * Remove a converter from existing converter list
         *
         * @method remove
         *
         * @param name {String}             The converter name to remove
        */
        /*removeConverter: function(name) {
            delete converters[name];
        },*/

        /**
         * From a given root (document), find the elements who needs to be
         * internally updated and mark them as "to watch".
         *
         * @param root {DOMElement | null}  The dom root, document if null
        */
        watchInnerBind: function(root) {
            // change name to bindInner(root)
            findInnerDataElement(root);
        },
        unwatchInnerBind: function(root) {
            unbindInner(root);
        }
    };
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model based system to create and manage models threw
        application lifetime

************************************************************************ */


/*
 * Property available element :
 *   - nullable {Boolean}   if the property can be set to null or not
 *   - init {Mixed}         the initial value
 *   - primary {Boolean}    Indicate if property is a primary type or not,
 *                          it's used internally to find models who match...
 *   - needed {Boolean}     Indicate if the property should ALWAYS be
 *                          included when performing a save to server
 *   - check {String}       the typeof check (like String, Object, ...)
 *   - pattern {String}     the regex pattern to check
 *   - validate {Function}  the function to use for validate input.
 *                          Must return true and false value to validate or not
 *                          Validate can also act like pattern (string regex)
 *                          but it's more recommanded to use pattern instead
 *   - many {Boolean}       Indicate if check should expect an array instead
 *                          of a single value.
 *   - transform {Function} the transformation to apply before setting data
 *   - event {String}       the event to raise on any change
 *   - apply {Function}     the apply element
*/

/**
 * A model creator to manage your model type.
 *
 * @function model
 * @namespace a
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model.
*/
a.model = function(name, properties) {
    // Only allow new name (already existing name just give already existing
    // model definition)
    if(a.isString(name)) {
        if(!a.model.pooler.get(name)) {
            // Register model into pooler
            a.model.pooler.set(name, {
                properties: properties
            });

            // Register model into ajax
            // We auto-add the type 'json' as for now AppStorm
            // is only able to parse JSON elements
            a.setTemplateAjaxOptions('model:' + name, {
                model: name,
                type: 'json'
            });

            // We return a function embed to create new instance
            // from variable
            return function() {
                return a.model.pooler.createInstance(name);
            };
        } else {
            // We directly create a new model
            return a.model.pooler.createInstance(name);
        }

    // Name is a search query system
    } else if(a.isTrueObject(name)) {
        if('destroy' in name) {
            var instances = name['instances'];
            if(instances && a.isArray(instances)) {
                var i = instances.length;
                while(i--) {
                    a.model.pooler.deleteInstance(instances[i]);
                }
            }
        } else {
            return a.model.pooler.searchInstance(name);
        }
    }
};






















/**
 * A model instance generator to manage multiple instance from a main model.
 * NEVER USE BY ITSELF, you should always go threw a.model before.
 *
 * @class modelInstance
 * @namespace a
 * @constructor
 *
 * @param name {String}                     The model name to create
 * @param properties {Object}               The properties associated to the
 *                                          model.
*/
a.modelInstance = function(name, properties) {
    this.modelName  = name || '';
    this.properties = {};
    this.snapshot   = {};
    // List properties originally found in the model
    // by default which cannot be changed by user
    this.originalContent = [];

    // Internal unique id tracer
    this.uid = a.uniqueId();
    this.nid = name + '-' + this.uid;

    if(a.isTrueObject(properties)) {
        this.properties = a.deepClone(properties);
    }

    for(var key in this) {
        this.originalContent.push(key);
    }
};


a.modelInstance.prototype = {
    /**
     * Get a single property value.
     *
     * @method get
     *
     * @param key {String}                  The property key
     * @return {Object}                     The property value or null if not
     *                                      existing
    */
    get: function(key) {
        var p = this.properties[key];
        return p ? p['value'] : null;
    },

    /**
     * Get a single property type.
     *
     * @method type
     *
     * @param key {String}                  The property key
     * @return {Object}                     The property type found, or null
    */
    type: function(key) {
        var p = this.properties[key];
        if(!p) {
            return 'text';
        }

        if(p['type']) {
            return p['type'];

        // Now we try to guess
        } else if(p['primary'] === true) {
            return 'hidden';
        } else if(a.isArray(p['check'])) {
            return 'select';
        } else if(p['check']) {
            var content = p['check'].toLowerCase();
            if(content === 'boolean') {
                return 'checkbox';
            } else if(content === 'number' || content === 'float' || 
                content === 'double' || content === 'integer') {
                return 'number';
            }
            // TODO: add the lastest HTML like date, phone...
        }

        return 'text';
    },

    /**
     * Get the property list stored in the model.
     *
     * @method list
     *
     * @return {Object}                     The property list currently setted
    */
    list: function() {
        var properties = [];
        for(var i in this.properties) {
            properties.push(i);
        }
        return properties;
    },

    /**
     * Set the given property value.
     *
     * @method set
     *
     * @param key {String}                  The property key
     * @param value {Object}                The property value
    */
    set: function(key, value) {
        var property = this.properties[key];

        // If the property is setted, we can use it
        if(property) {
            var check     = property['check'],
                apply     = property['apply'],
                eventName = property['event'],
                pattern   = property['pattern'],
                transform = property['transform'],
                validate  = property['validate'],
                many      = property['many'] || false,
                old       = property['value'];


            // TRANSFORM
            value = a.isFunction(transform) ? transform(value, old) : value;

            // NULLABLE TEST
            if(property['nullable'] === false && a.isNone(value)) {
                return;
            }

            // TODO: one of the solution here is to convert value into
            // an array (except in case of many = true) and then
            // try to check it
            // CHECK TEST - basic typeof test
            // CHECK TEST - model check error (we do allow complex sub type)
            if(a.isString(check)) {

                // Little hack to prevent wrong typeof check
                check = check.toLowerCase();
                if(check === 'integer' || check === 'float'
                    || check === 'double') {
                    check = 'number';
                }

                var instance = value instanceof a.modelInstance;
                if(instance && check !== value.modelName) {
                    return;
                } else if(!instance && check !== typeof(value)) {
                    return;
                }

            // CHECK TEST - array of values
            // Note: don't mix if...
            } else if(a.isArray(check)) {
                if(!a.contains(check, value)) {
                    return;
                }

            // CHECK TEST - key in object
            // Note: don't mix if...
            } else if(a.isTrueObject(check)) {
                if(!a.has(check, value)) {
                    return;
                }
            }

            // PATTERN TEST
            if(!a.isNone(value) && a.isString(pattern) && pattern) {
                if(many === true && a.isArray(value)) {
                    for(var i=0, l=value.length; i<l; ++i) {
                        var reg = new RegExp(pattern, 'g');
                        if(!reg.test(value[i])) {
                            return;
                        }
                    }
                } else {
                    var reg = new RegExp(pattern, 'g');
                    if(!reg.test(value)) {
                        return;
                    }
                }
            }

            // VALIDATE TEST - function
            if(a.isFunction(validate) && validate(value, old) !== true) {
                return;

            // VALIDATE TEST - regex
            } else if(a.isString(validate)
                        && !(new RegExp(validate, 'gi').test(value))) {
                return;
            }

            // We can apply property value now
            property['value'] = value;

            // If it's possible, we also update the 'direct' value
            if(!a.contains(this.originalContent, key)) {
                this[key] = value;
            }

            // APPLY TEST
            if(a.isFunction(apply)) {
                apply(value, old);
            }

            if(eventName) {
                this.dispatch(eventName, {
                    value: value,
                    old: old
                });
            }
        }
    },

    /**
     * Watch a model property for changes
     *
     * @method watch
     *
     * @param key {String}                  The model key to watch
     * @param fct {Function}                The function to bind
    */
    watch: function(key, fct) {
        if(a.isString(key) && a.isFunction(fct)) {
            a.watch.call(this, this.properties[key]['value'], fct);
        } else {
            a.console.storm('error', 'a.model.watch', 'Unable to watch the ' +
                'property ```' + key + '``` for model ```' + this.modelName +
                '```', 1);
        }
    },

    /**
     * Unwatch a mdoel property changes
     *
     * @method unwatch
     *
     * @param key {String}                  The model key to stop watching
     * @param fct {Function}                The function to unbind
    */
    unwatch: function(key, fct) {
        if(a.isString(key) && a.isFunction(fct)) {
            a.unwatch.call(this, this.properties[key]['value'], fct);
        } else {
            a.console.storm('error', 'a.model.unwatch', 'Unable to unwatch ' +
                'the property ```' + key + '``` for model ```' +
                this.modelName + '```', 1);
        }
    },

    /**
     * Check if a given key exist or not in model.
     *
     * @method has
     *
     * @param key {String}                  The key to test
    */
    has: function(key) {
        return key in this.properties;
    },

    /**
     * Clear model (rollback to default values for all properties)
     *
     * @method init
    */
    init: function() {
        for(var property in this.properties) {
            this.properties[property]['value'] = 
                    this.properties[property]['init'] || null;

            // Now we push data into directly the model itself
            if(!a.contains(this.originalContent, property)) {
                this[property] = this.get(property);
            } else {
                a.console.storm('error', 'a.model', 'The model ```' +
                        this.modelName + '``` has the property ```' + key + 
                        '``` which is in conflict with internal model system.'+
                        ' Please change the property name...', 1);
            }
        }

        // Save current setted data
        this.takeSnapshot();

        this.dispatch('init', {});
    },

    /**
     * Get a fresh copy of the model, another instance with same data
     *
     * @method clone
     *
     * @return {a.modelInstance}            A new instance with exactly same
     *                                      data
    */
    clone: function() {
        var data = a.deepClone(this.toObject()),
            instance = a.model.pooler.createInstance(this.modelName);

        instance.fromObject(data);
        return instance;
    },

    /**
     * Convert model to a simple json object like
     *
     * @method toObject
     *
     * @return {Object}                     The result object
    */
    toObject: function() {
        var obj = {};
        for(var property in this.properties) {
            var result = this.get(property);
            if(result instanceof a.modelInstance) {
                obj[property] = result.toObject();
            } else if(a.isArray(result)) {
                var content = [];
                for(var i=0, l=result.length; i<l; ++i) {
                    var element = result[i];
                    if(element instanceof a.modelInstance) {
                        content.push(element.toObject());
                    } else {
                        content.push(element);
                    }
                }
                obj[property] = content;
            } else {
                obj[property] = result;
            }
        }
        return obj;
    },

    /**
     * From a JSON object like, fill this model with element found
     *
     * @method fromObject
     *
     * @param data {Object}                 The input data
    */
    fromObject: function(data) {
        for(var property in this.properties) {
            if(property in data) {
                this.properties[property]['value'] = data[property];
            }
        }
    },

    /**
     * Convert model to JSON data
     *
     * @method toJSON
     *
     * @return {String}                     The serialized JSON model
    */
    toJSON: function() {
        return a.parser.json.stringify(this.toObject());
    },

    /**
     * From a JSON, fill a JSON instance
     *
     * @method fromJSON
     *
     * @param data {Object}                 The input JSON data
    */
    fromJSON: function(data) {
        if(a.isString(data) && data.length > 0) {
            data = a.parser.json.parse(data);
        }
        this.fromObject(data);
    },

    /**
     * Take a model snapshot.
     *
     * @method takeSnapshot
     *
     * @return {Object}                     The snapshot created
    */
    takeSnapshot: function() {
        this.snapshot = {};
        for(var property in this.properties) {
            this.snapshot[property] = this.get(property);
        }
        return this.getSnapshot();
    },

    /**
     * Get the current stored snapshot.
     *
     * @method getSnapshot
     *
     * @return {Object}                     The snapshot currently stored
    */
    getSnapshot: function() {
        return this.snapshot;
    },

    /**
     * From the latest takeSnapshot used, retrieve the properties value
     * difference.
     * It helps to send to server only modified informations since last
     * snapshot.
     *
     * @method differenceSnapshot
     *
     * @param onlyCurrentValues {Boolean}   By default every properties found
     *                                      got a couple {value/old} object.
     *                                      But sometimes you may prefer to get
     *                                      only the current value and not old
     *                                      one, this parameter is for that.
     *                                      (default: false)
     * @return {Object}                     The difference between old and
     *                                      current model state
    */
    differenceSnapshot: function(onlyCurrentValues) {
        var snapshot   = this.snapshot,
            properties = this.properties,
            difference = {};

        for(var key in snapshot) {
            var snapValue    = snapshot[key],
                currentValue = properties[key]['value'];

            // Validate on value change, or needed stuff
            if(
                    currentValue !== snapValue
                ||  properties[key]['needed'] === true
            ) {
                if(onlyCurrentValues) {
                    difference[key] = currentValue;
                } else {
                    difference[key] = {
                        value: currentValue,
                        old:   snapValue
                    };
                }
            }
        }

        return difference;
    }
};



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // From a given uid, get the linked model
    a.parameter.addParameterType('model',  function(uid) {
        return a.model.manager.get(uid);
    });

    // This helps to get model uid from a given model
    // The idea behind this is to recieve a model in parameter and lets
    // get the uid for form plugin
    Handlebars.registerHelper('model', function(object) {
        if(a.isString(object) || a.isNumber(object)) {
            return object;
        } else if(a.isTrueObject(object) && object.uid) {
            return object.uid;
        }
        return null;
    });
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        Keep a trace of every created model, to be able to search them
        with ease.

************************************************************************ */


/**
 * A model manager helps to keep a trace of every model currently used by the
 * application.
 *
 * @class manager
 * @namespace a.model
 * @constructor
*/
a.model.manager = {
    /**
     * Store a pointer to every instance of every model created.
     * @property _store
     * @type Object
     * @default {}
    */
    _store: a.mem.getInstance('app.model.instance'),

    /**
     * Store a new model into the manager.
     *
     * @method set
     *
     * @param model {Object}                The new model to store
    */
    set: function(model) {
        this._store.set(model.uid, model);
    },

    /**
     * Get a model from it's uid (the unique id is automatically generated
     * for every model, it's available threw myModelInstance.uid)
     *
     * @method get
     *
     * @param uid {Integer}                 The unique id to search related
     *                                      model from
     * @return {Object | null}              The related model found, or null if
     *                                      nothing is found
    */
    get: function(uid) {
        return this._store.get(uid);
    },

    /**
     * Remove a model from store.
     *
     * @method remove
     *
     * @param uid {Integer}                 The uid to remove
    */
    remove: function(uid) {
        this._store.remove(uid);
    },

    /**
     * Get the full model list
     *
     * @method list
     *
     * @return {Array}                      The list of stored models
    */
    list: function() {
        return this._store.list();
    },

    /**
     * Remove all existing model from store
     *
     * @method clear
    */
    clear: function() {
        this._store.clear();
    },

    /**
     * Get all models related to a given namespace. For example, if you create
     * a.model('user'), this function helps to find all *user* model created.
     *
     * @method getByName
     *
     * @param name {String}                 The model name to find
     * @return {Array}                      The array with all model instance
     *                                      related to this name
    */
    getByName: function(name) {
        if(!name || !a.isString(name)) {
            return [];
        }

        var result = [];

        a.each(this._store.list(), function(element) {
            if(element.modelName === name) {
                result.push(element);
            }
        });

        return result;
    }
};;/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model storage system, and keep a trace of model created
        (threw a.model.manager)

************************************************************************ */

/**
 * A model pooler aims to create a storage space to keep every model type
 * existing.
 *
 * @class pooler
 * @namespace a.model
 * @constructor
*/
a.model.pooler = a.mem.getInstance('app.model.type');

/**
 * Simple function to generate new instance from a base
 *
 * @method createInstance
 *
 * @param name {String}                     The model type we want to create
 * @return {Object | null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.model.pooler.createInstance = function(name) {
    var model = this.createTemporaryInstance(name);

    if(!a.isNull(model)) {
        // Adding model to manager system
        a.model.manager.set(model);
    }

    return model;
};


/**
 * Simple function to generate new instance from a base. This instance is not
 * stored into a.model.manager.
 * NOTE: this function should not be used, please use createInstance instead.
 *
 * @method createInstance
 *
 * @param name {String}                     The model type we want to create
 * @return {Object | null}                  The model instance created, or null
 *                                          if model name is not defined
*/
a.model.pooler.createTemporaryInstance = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var model = a.extend(
            new a.modelInstance(
                name,
                a.clone(instanceType.properties)
            ),
            new a.eventEmitter('a.model')
        );

    // Resetting model
    model.init();

    // Returning freshly created model
    return model;
};

/**
 * From a given query, get back the existing stored model
 *
 * @method searchInstance
 *
 * @param query {Object}                    The query to search inside
 * @return {a.modelInstance | null}         The single instance found,
 *                                          or a list of instances, or null
*/
a.model.pooler.searchInstance = function(query) {
    var name = query.modelName || query.model || query.name || null;

    // Faster search
    var models;
    if(name && a.isString(name)) {
        models = a.model.manager.getByName(name);
    } else {
        var list = a.model.manager.list(),
            models = [];
        a.each(list, function(element) {
            models.push(element);
        });
    }

    // We remove the first searched element
    if(query.modelName) {
        delete query.modelName;
    } else if(query.model) {
        delete query.model;
    } else if(query.name) {
        delete query.name;
    }

    for(var key in query) {
        var value = query[key],
            i = models.length;

        while(i--) {
            var model = models[i];
            // The model is not related to searched value
            if(!a.isTrueObject(value) && model.get(key) !== value) {
                models.splice(i, 1);
            // The value is an object itself, we should check deeper inside
            } else if(a.isTrueObject(value)) {

            }
        }
    }

    return models;
};


/**
 * Search primary keys inside a model, to be able to perform a search
 * after.
 *
 * @method getPrimary
 *
 * @param name {String}                     The model name to get related
 *                                          primary
 * @return {Array | null}                   Array if it has been found, null
 *                                          if there is any problem
*/
a.model.pooler.getPrimary = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    var properties = instanceType.properties,
        results = [];

    for(var key in properties) {
        var property = properties[key];
        if(('primary' in property) && property['primary'] === true) {
            results.push(key);
        }
    }

    return results;
};


/**
 * Delete an existing instance.
 *
 * @method deleteInstance
 *
 * @param instance {Object}                 The instance to delete
*/
a.model.pooler.deleteInstance = function(instance) {
    if(a.isTrueObject(instance) && instance.uid) {
        a.model.manager.remove(instance.uid);
    }
};

;/* ************************************************************************

    License: MIT Licence

    Description:
        Provide a model rendering system, aims to quickly create forms
        and related data presentation. For a quicker bindings.

************************************************************************ */

/**
 * Provide a model rendering system, aims to quickly create forms
 * and related data presentation. For a quicker bindings.
 *
 * @class template
 * @namespace a.model
*/
a.model.template = {
    engine: 'raw',

    generator: a.mem.getInstance('app.model.template.engine'),
    descriptor: a.mem.getInstance('app.model.template.render'),

    /**
     * Get the render descriptor, able to render the given element
     * in the current situation (regarding engine, current template...).
     * YOU SHOULD NOT USE THIS FUNCTION BY YOURSELF
     *
     * @method getDescriptor
     * @private
     *
     * @param type {String}                 The main type, can be one of the
     *                                      following: column, row, fieldset,
     *                                      input
     * @param subtype {String}              Mostly for input field, the subtype
     *                                      like 'text', 'checkbox', 'radio',
     *                                      but input, is also a generic name
     *                                      so it can also be 'textarea',
     *                                      'select', ...
     * @param key {String}                  In case of input type, it should be
     *                                      the model key to get, in any other
     *                                      cases, the current row/column
     * @param template {Object}             The template currently selected
     *                                      by user
     * @return {Function}                   The most appropriate function found
     *                                      to apply rendering.
    */
    getDescriptor: function(type, subtype, key, template) {
        // Template rendering
        var renderTmpl = (('rendering' in template) &&
                a.isTrueObject(template.rendering))? template.rendering : null,
        // Engine rendering
            engine = a.model.template.generator.get(a.model.template.engine),
            renderNgin = (('rendering' in engine) &&
                a.isTrueObject(engine.rendering)) ? engine.rendering : null;

        var source = 'a.model.template.getDescriptor';

        // If engine is not found, we raise error
        if(a.isNone(engine) || a.isNone(renderNgin)) {
            a.console.storm('error', source, 
                    'Unable to find the ```' + a.model.template.engine + '```'+
                    ' engine', 1);
        }

        var error = 'Unable to find descriptor for ```' + key + '```' +
                    ' with engine ```' + 
                    a.model.template.engine + '``` and template ```' + 
                    template.templateName + '```';

        // Structure elements like row, columns...
        if(type === 'column' || type === 'row' || type === 'fieldset' ||
            type === 'clearfix') {
            // Exact match search
            var exact = type + key;

            // 1: we search for specific row number, first in template,
            // second in engine
            if(renderTmpl && a.isFunction(renderTmpl[exact])) {
                return renderTmpl[exact];
            } else if(renderNgin && a.isFunction(renderNgin[exact])) {
                return renderNgin[exact];
            }

            // 2: we search for generic row, first in template,
            // second in engine
            if(renderTmpl && a.isFunction(renderTmpl[type])) {
                return renderTmpl[type];
            } else if(renderNgin && a.isFunction(renderNgin[type])) {
                return renderNgin[type];
            } else {
                a.console.storm('error', source, error, 1);
                return null;
            }

        } else if(type === 'input') {
            if(renderTmpl) {
                // 1: we search for a direct model key binded into the template
                // we dont do the same in the engine (no sense to have it in
                // engine level)
                if(a.isFunction(renderTmpl[key])) {
                    return renderTmpl[key];

                // 2: We search for a direct sub-type in the template
                } else if(a.isFunction(renderTmpl[subtype])) {
                    return renderTmpl[subtype];
                }
            }

            // 3: we search for a direct sub-type in the engine
            if(renderNgin && a.isFunction(renderNgin[subtype])) {
                return renderNgin[subtype];
            }

            // 4: still nothing found, we go for a direct search, first in
            // template, second in engine
            if(renderTmpl && a.isFunction(renderTmpl[type])) {
                return renderTmpl[type];
            } else if(renderNgin && a.isFunction(renderNgin[type])) {
                return renderNgin[type];
            } else {
                a.console.storm('error', source, error, 1);
                return null;
            }

        } else {
            a.console.storm('error', 'a.model.template.getDescriptor', 
                    'The type ```' + type + '``` is unknow', 1);
            return null;
        }
        // POUR INPUT:
        // 1: on cherche dans le template s'il n'existe pas
        // le nom de la clef du modèle (rendering custom)
        // 2: on cherche dans le template s'il n'existe pas
        // un 'type' => exemple "textarea" ou "text" ou "checkbox"
        // ou "select" ou "hidden"
        // dans le template
        // 3: on cherche dans l'engine pour cette bestiole
        // 4: on cherche dans le template le type global: input, textarea...
        // 5: on cherche dans l'engine le template input, textarea...
        // 6: on print un message d'erreur...

        // POUR COLUMN:
        // 1: on cherche le column1/2/3 dans le template
        // 2: on cherche le column1/2/3 dans l'engine
        // 3: on cherche le column dans template
        // 4: on cherche le column dans l'engine

        // POUR ROW:
        // 1: on cherche le row1/2/3 dans le template
        // 2: on cherche le row1/2/3 dans l'engine
        // 3: on cherche le row dans template
        // 4: on cherche le row dans l'engine
    },

    output: {
        /**
         * Print a single input on output (including label)
         *
         * @method input
         *
         * @param model 
        */
        input: function(model, propertyName, parameters, template) {
            var type = model.type(propertyName),
                value = model.get(propertyName),
                descriptor = a.model.template.getDescriptor(
                            'input', type, propertyName, template);

            // We got a function as result, so we can continue
            if(a.isFunction(descriptor)) {
                // TODO: get the label content
                // TODO: create lblClass
                // TODO: create iptClass
                var label = propertyName,
                    lblClass = '',
                    iptClass = '';
                return descriptor.call(this, model, propertyName, type, label,
                                value, lblClass, iptClass, parameters);
            } else {
                return null;
            }
        },

        /**
         * Print a column system (like on bootstrap or fundation)
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method column
         * @private
         *
         * @param model {a.model.instance}  The model to present to user
         * @param number {Integer}          The column separator (1 to 12)
         * @param template {Object}         The template object
         * @param extra {Object}            Any extra elements (the position
         *                                  left/right for example)
         * @return {DOMelement | null}      The dom element created (can
         *                                  be also null)
        */
        column: function(model, number, template, extra) {
            var descriptor = a.model.template.getDescriptor(
                'column', null, number, template);

            // We got a function as result, so we can continue
            if(a.isFunction(descriptor)) {
                return descriptor.call(this, number, extra);
            } else {
                return null;
            }
        },

        /**
         * Print a single line content.
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method row
         * @private
         *
         * @param model {a.model.instance}  The model to bind
         * @param row {String}              The line properties
         * @param number {Integer}          The current row number
         * @param template {Object}         The template object
         * @return {DOMElement}             The row full of content
        */
        row: function(model, row, number, template) {
            var properties = row.split('&&'),
                line = null,
                descriptor = a.model.template.getDescriptor(
                    'row', null, number, template);

            // We search for a text align
            var position = null,
                possiblePosition = ['left', 'right', 'justify', 'center'];
            // We got exactly one position, it's the line element
            // which may handle left/right positioning
            if(properties.length === 1) {
                var separator = properties[0].split('::');
                for(var y=0, u=separator.length; y<u; ++y) {
                    var tmp = a.trim(separator[y]);
                    if(a.contains(possiblePosition, tmp)) {
                        position = tmp;
                    }
                }
            }

            if(a.isFunction(descriptor)) {
                line = descriptor.call(this, number, template, {
                    position: position
                });
            } else {
                line = document.createElement('div');
            }

            for(var i=0, l=properties.length; i<l; ++i) {
                var element = a.trim(properties[i]);

                // Now we cut the parameters
                // We erase position
                position = null;
                var cut = element.split('::'),
                    column = null;

                // treatment for special case '::col3' which makes a blank
                // div spacer
                if(cut[0] === '' && cut[1].indexOf('col') === 0) {
                    // We create an empty column
                    column = this.column.call(this, model, cut[1], template);
                    if(column) {
                        // TODO: check if it's the only way
                        // Special treatment to make space appearing
                        // column.innerHTML = '&nbsp;';
                        line.appendChild(column);
                        continue;
                    }
                }

                // We got some extra parameters
                // We are searching here ONLY for column system
                if(cut.length > 1) {
                    // First we search a position placement
                    var j = cut.length,
                        k = cut.length;
                    while(j--) {
                        cut[j] = a.trim(cut[j]);
                        if(a.contains(possiblePosition, cut[j])) {
                            position = cut[j];
                        }
                    }
                    for(j=0; j<k; ++j) {
                        var el = cut[j];
                        // User request to create column system
                        if(el.indexOf('col') === 0) {
                            column = this.column.call(this, model, el,
                                            template, {position: position});
                        }
                    }
                }

                var input = this.input.call(this, model, cut[0],
                                                cut.splice(1), template);

                if(column) {
                    column.appendChild(input);
                    line.appendChild(column);
                } else {
                    line.appendChild(input);
                }
            }

            // We add the clearfix if needed
            var clearfix = a.model.template.getDescriptor('clearfix', null,
                number, template);
            if(a.isFunction(clearfix)) {
                line.appendChild(clearfix.call(this, number, template));
            }

            return line;
        },

        /**
         * Render a fieldset inside the given model.
         * YOU SHOULD NOT USE THIS FUNCTION, GO ON MODEL FUNCTION
         *
         * @method fieldset
         * @private
         *
         * @param model {a.model.instance}  The model to render
         * @param row {Array}               The row current value
         * @param number {Integer}          The current row number
         * @param template {Object}         The current template to render
         * @return {DOMElement}             The fieldset created
        */
        fieldset: function(model, row, number, template) {
            var fieldset = a.model.template.getDescriptor('fieldset', 
                null, number, template);

            for(var i=0, l=row.length; i<l; ++i) {
                var element = a.trim(row[i]),
                    line = null;
                if(element[i].indexOf('legend')) {
                    // TODO: do the legend line here
                } else {
                    line = this.row.call(this, model, element, i, template);
                }
                if(line) {
                    fieldset.appendChild(line);
                }
            }

            return fieldset;
        },

        /**
         * Render a given model, regarding the given template, and the
         * current global rendering engine
         *
         * @method model
         *
         * @param model {a.model.instance}  The model to render
         * @param templateName {String}     The template to use for rendering
         * @return {Array}                  A list of DOMElement to append
         *                                  to current HTML as rendering system
        */
        model: function(model, templateName) {
            var tmpl = a.model.template.descriptor.get(templateName);

            if(!tmpl) {
                a.console.storm('error', 'a.model.template.output.model', 
                        'The template ```' + templateName + '```' +
                        ' could not be found', 1);
                return;
            }

            var content = tmpl.template,
                render = [];

            // Adding a little extra
            tmpl.templateName = templateName;

            for(var i=0, l=content.length; i<l; ++i) {
                // It's a fieldset
                if(a.isArray(content[i])) {
                    render.push(this.fieldset.call(this, model, content[i],
                        i, content));
                } else {
                    render.push(this.row.call(this, model, content[i], i,
                                                                content));
                }
            }

            return render;
        }
    }
};




/*
 * -----------------
 *   RAW RENDERING
 * -----------------
*/
(function() {
    a.model.template.generator.set('raw', {
        rendering: {
            /**
             * Render a single row element
             *
             * @method row
             *
             * @param number {Integer}      The current row number
             * @param template {Object}     The template currently printed
             * @param extra {Object}        Any special element, here only
             *                              'extra.position' can be passed
             *                              defining the text content position
             * @return {DOMElement}         The row element created
            */
            row: function(number, template, extra) {
                var row = document.createElement('div');

                if(a.isString(extra.position)) {
                    row.style.textAlign = extra.position;
                }

                return row;
            },

            /**
             * Render a clearfix element
             *
             * @method clearfix
             *
             * @return {DOMElement | null}  The clearfix element to clear the
             *                              float problem
            */
            clearfix: function() {
                var div = document.createElement('div');
                div.style.clear = 'both';
                div.style.height = '0px';
                div.style.overflow = 'hidden';
                return div;
            },

            /**
             * Render a column separator
             *
             * @method column
             *
             * @param number {Integer}      The col space (from 1 to 12)
             * @return {DOMElement}         The column system created
            */
            column: function(number, extra) {
                var div = document.createElement('div');

                // Convert col-xs, col-md, col3 things into number
                number = parseInt(number.match(/[0-9]+/)[0], 10);

                // Creating real system
                var real = Math.round(number * 8.33333333 * 100000) / 100000;
                div.style.styleFloat = 'left';
                div.style.cssFloat = 'left';
                div.style.width = real + '%';

                if(a.isString(extra.position)) {
                    div.style.textAlign = extra.position;
                }

                return div;
            },

            /**
             * Generate a reset button
             *
             * @method reset
             *
             * @param value {String | null} The value to put instead of 'reset'
             * @return {DOMElement}         The button
            */
            reset: function(value) {
                var reset = document.createElement('input');
                reset.type = 'reset';
                if(value) {
                    reset.value = value;
                }
                return reset;
            },

            /**
             * Create a submit button
             *
             * @method submit
             *
             * @param value {String | null} The value to put instead of 'send'
             * @return {DOMElement}         The button
            */
            submit: function(value) {
                var submit = document.createElement('submit');
                submit.type = 'submit';
                if(value) {
                    submit.value = value;
                }
                return submit;
            },

            /**
             * Render an input
             *
             * @method input
             *
             * @param model {a.model.instance} The model to get data from
             * @param name {String}         The input name to validate, like
             *                              'login' or 'password'
             * @param type {String}         The input type, like text
             * @param label {String}        The label to show to user
             * @param value {String | null} The value to start with
             * @param lblClass {String}     The label class to add
             * @param iptClass {String}     The input class to add
             * @param extra {Array}         Extra parameters (any kind)
             * @return {DOMElement}         The dom element created
            */
            input: function(model, name, type, label, value, lblClass,
                iptClass, extra) {
                var staticElement = a.contains(extra, 'static');

                var div = document.createElement('div'),
                    lbl = document.createElement('label'),
                    ipt = null;

                var id = 'model-' + name;

                lbl.for = id;
                lbl.className = lblClass;
                lbl.innerHTML = label;

                if(staticElement) {
                    ipt = document.createElement('p');
                    ipt.innerHTML = value || '';
                } else if(type === 'textarea') {
                    ipt = document.createElement('textarea');
                    ipt.innerHTML = value || '';
                } else if(type === 'select') {
                    ipt = document.createElement('select');

                    // We add all sub elements into the select
                    // TODO: get check elements
                    var check = ['opt1', 'opt2'];
                    // TODO: add currently selected
                    for(var i=0, l=check.length; i<l; ++i) {
                        var option = document.createElement('option');
                        option.value = check[i];
                        option.innerHTML = check[i];
                        ipt.appendChild(option);
                    }
                } else {
                    ipt = document.createElement('input');
                    ipt.type = type;
                    // TODO: be able to have more than once
                    ipt.placeholder = label;
                    ipt.value = value || '';
                }

                ipt.id = id;
                ipt.className = iptClass;

                if(!staticElement) {
                    ipt.name = name;
                    ipt.id = id;

                    // Applying extra parameters
                    for(var i=0, l=extra.length; i<l; ++i) {
                        var content = a.trim(extra[i]);
                        if(content === 'disable' || content === 'disabled') {
                            ipt.disabled = true;
                        }
                    }
                }

                div.appendChild(lbl);
                div.appendChild(ipt);
                return div;
            }
        }
    });
})();;/* ************************************************************************

    License: MIT Licence

    Description:
        Manipulate the page history and templates.
        We define here some usefull function to catch some important event.

        template: Create a simple but powerfull template system based on
                    handlebars
        hash: Manage hash manipulate for page

************************************************************************ */


/**
 * Create a template system based on handlebars.
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:page">here</a>
 *
 * @class template
 * @static
 * @namespace a
*/
a.template = {
    /**
     * Store cached partials
     * @property _part
     * @type Object
     * @default {}
    */
    _part: {},

    /**
     * Store cached template
     * @property _tmpl
     * @type Object
     * @default {}
    */
    _tmpl: {},

    /**
     * Register a new partial into template system (handlebars partial).
     *
     * @method partial
     * @async
     *
     * @param name {String}                 The partial name to use inside
     *                                      handlebars templates
     * @param uri {String}                  The uri to load (GET method), or
     *                                      a template string (see options
     *                                      parameter)
     * @param callback {Function | null}    The callback to call after loading
     *                                      success
     * @param options {Object}              Options can have only one element:
     *                                      noLoading : Boolean
     *                                      Indicate if we should use uri as
     *                                      template string instead of uri to 
     *                                      load from network
    */
    partial: function(name, uri, callback, options) {
        var handler = a.isTrueObject(window.Handlebars) ? window.Handlebars :
                                                                        null,
            fctName = 'a.template.partial';

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!', 
                    1);
            return;
        }

        var partialsStore = this._part;

        if(a.isString(partialsStore[name])) {
            a.console.storm('log', fctName, 'Loading ```' + name + '``` from '+
                    'cache', 3);

            if(a.isFunction(callback)) {
                callback(name, partialsStore[name]);
            }
        } else if(options && options.noloading === true) {
            a.console.storm('log', fctName, 'Loading ```' + name + '``` from '+
                    'parameter', 3);
            partialsStore[name] = uri;
            handler.registerPartial(name, uri);

            // Callback
            if(a.isFunction(callback)) {
                callback(name, uri);
            }
        } else {
            a.loader.html(uri, function(content) {
                a.console.storm('log', fctName, 'Loading ```' + name + '```' +
                        ' from url', 3);
                partialsStore[name] = content;
                handler.registerPartial(name, content);

                // Callback
                if(a.isFunction(callback)) {
                    callback(name, content);
                }
            });
        }
    },

    /**
     * Use cache or retrieve a specific template from network
     *
     * @method get
     * @async
     *
     * @param uri {String}                  The path to get the template,
     *                                      or an id if the template already
     *                                      listed in html
     * @param data {Object}                 The data to apply to template
     * @param callback {Function}           The callback to apply when
     *                                      template finish loading
     * @param error {Function | null}       The error to raise in case of
     *                                      problem
    */
    get: function(uri, data, callback, error) {
        var handler = a.isTrueObject(window.Handlebars) ? window.Handlebars :
                                                                        null,
            fctName = 'a.template.get';

        // Crash if handlebars is not found
        if(!handler) {
            a.console.storm('error', fctName, 'Unable to find Handlebars.js!',
                    1);
            return;
        }

        // We create a hash from uri and sanitize
        // everything by replacing by underscore
        var orig = uri.replace(/[^a-zA-Z0-9\\-]/g, '_'),
            hash = 'a_tmpl_' + orig;

        /**
         * Parse the content with data from client,
         * then call callback with result
         *
         * @method callCallback
         * @private
         * @async
         *
         * @param clb {Function}            The callback function to call
         * @param h {String}                The hash representing the
         *                                  unique id of template
         * @param d {Object}                The data associated
        */
        var callCallback = function(clb, h, d) {
            if(a.isFunction(clb)) {

                // First try to use Handlebars.js
                if(a.isNone(handler.to_html)) {
                    // Act like a render method (threw compile method)
                    var tmpl = handler.compile(a.template._tmpl[h]);
                    clb(tmpl(d));

                // Rollback on Mustache.js
                } else {
                    clb(handler.to_html(a.template._tmpl[h], d));
                }
            }
        };

        // If the template is already listed into existing template,
        // directly load
        if(a.isString(this._tmpl[hash])) {
            a.console.storm('log', fctName, 'Loading ```' + hash + '``` from' +
                    ' cache', 3);
            callCallback(callback, hash, data);
            return;
        }

        // Template exist on page DOM, but it's not registred to ich for now
        if(document.getElementById(hash)) {
            // We add it to template list registered to go quicker next time
            if(!this._tmpl[hash]) {
                a.console.storm('log', fctName, 'Loading ```' + hash + '```' +
                        ' from inner html page', 3);
                this._tmpl[hash] = a.dom.id(hash).html();
            }

            // We finally send the callback
            callCallback(callback, hash, data);
            return;
        }

        // Same with this time original id, template exist on page DOM
        if(document.getElementById(orig)) {
            // We add it to template list registered to go quicker next time
            if(!this._tmpl[orig]) {
                a.console.storm('log', fctName, 'Loading ```' + orig + '``` ' +
                        'from inner html page', 3);
                this._tmpl[orig] = a.dom.id(orig).html();
            }

            // We finally send the callback
            callCallback(callback, orig, data);
            return;
        }

        // Last try : we try to use uri to load template from server side,
        // then parse it
        var parse = function(content, status, state) {
            if(!a.template._tmpl[hash]) {
                a.template._tmpl[hash] = content;
            }
            callCallback(callback, hash, data);
            return;
        };

        // We use the loader to retrieve file from server side
        a.console.storm('log', fctName, 'Loading ```' + uri + '``` from ' +
                'external resource', 3);
        a.loader.html(uri, parse, {}, error);
    },

    /**
     * Convert an html to a dom content
     *
     * @method htmlToDom
     *
     * @param html {String}                 The string to parse
     * @return {Array}                      The result content
    */
    htmlToDom: function(html) {
        /*
         * Why this ?
         * - Using innerHTML is slow,
         *   and can remove binding (like onclick) to sibling children
         * - Doing this way is the only way to have both:
         *   full parsing on every browser, and DOM element to
         *   not have innerHTML bug.
         *   as innerHTML is configured into a temp object,
         *   this problem does not exist here anymore as it will
         *   not affect other children...
        */
        var d      = document.createElement('div'),
            result = [];
        // Remove space before and after : the system fail in other case
        // (but why ?)
        d.innerHTML  = a.trim(html);

        // We select sub children of text type or element type
        a.dom.el(d).children([1, 3]).each(function() {
            result.push(this);
        });

        return result;
    },

    /**
     * Empty a dom element
     *
     * @method remove
     * @async
     *
     * @param el {DOMElement} The element to remove everything inside
     * @param callback {Function | null} The function to raise when job is done
    */
    remove: function(el, callback) {
        a.dom.el(el).empty();
        if(a.isFunction(callback)) {
            callback();
        }
    },

    /**
     * Append to the given element (given a DOM element here not a jquery one)
     *
     * @method append
     * @async
     *
     * @param el {DOMElement}               Any dom element to append to
     * @param content {String}              The html content (in string)
     *                                      to replace
     * @param callback {Function}           The callback to apply when
     *                                      template finish loading
    */
    append: function(el, content, callback) {
        el = a.dom.el(el);
        var h = this.htmlToDom(content);

        if(a.isTrueObject(h)) {
            el.append(h);
        }
        a.each(el.getElements(), function(element) {
            a.translate.translate(element);
        });
        if(a.isFunction(callback)) {
            callback(content);
        }
    },

    /**
     * Same as append, just replace instead of append to element
     *
     * @method replace
     * @async
     *
     * @param el {DOMElement}               Any dom element to append to
     * @param content {String}              The html content (in string) to
     *                                      replace
     * @param callback {Function}           The callback to apply when
     *                                      template finish loading
    */
    replace: function(el, content, callback) {
        this.remove(el, function() {
            a.template.append(el, content, callback);
        });
    }
};


(function() {
    // Replace type
    a.state.type.add('replace', function replace(entry, content, chain) {
        if(content) {
            a.template.replace(entry, content, function() {
                if(chain) {
                    chain.next();    
                }
            });
        }
    }, function(entry, chain) {
        if(chain) {
            chain.next();
        }
    }, true);

    // Append type
    a.state.type.add('append', function append(entry, content, chain) {
        if(content) {
            a.template.append(entry, content, function() {
                if(chain) {
                    chain.next();
                }
            });
        }
    }, function(entry, chain) {
        if(chain) {
            chain.next();
        }
    }, true);
})();;// Final script, appstorm is ready
a.message.dispatch('ready');