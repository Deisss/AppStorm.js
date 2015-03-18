/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash -o ./dist/lodash.compat.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      errorClass = '[object Error]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used as the data object for `iteratorTemplate` */
  var iteratorData = {
    'args': '',
    'array': null,
    'bottom': '',
    'firstArg': '',
    'init': '',
    'keys': null,
    'loop': '',
    'shadowedProps': null,
    'support': null,
    'top': '',
    'useHas': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Checks if `value` is a DOM node in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.
   */
  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /** Used to avoid iterating non-enumerable properties in IE < 9 */
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
    nonEnumProps[objectClass] = { 'constructor': true };

    (function() {
      var length = shadowedProps.length;
      while (length--) {
        var key = shadowedProps[length];
        for (var className in nonEnumProps) {
          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
            nonEnumProps[className][key] = false;
          }
        }
      }
    }());

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    (function() {
      var ctor = function() { this.x = 1; },
          object = { '0': 1, 'length': 1 },
          props = [];

      ctor.prototype = { 'valueOf': 1, 'y': 1 };
      for (var key in new ctor) { props.push(key); }
      for (key in arguments) { }

      /**
       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.argsClass = toString.call(arguments) == argsClass;

      /**
       * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

      /**
       * Detect if `name` or `message` properties of `Error.prototype` are
       * enumerable by default. (IE < 9, Safari < 5.1)
       *
       * @memberOf _.support
       * @type boolean
       */
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

      /**
       * Detect if `prototype` properties are enumerable by default.
       *
       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
       * (if the prototype or a property on the prototype has been set)
       * incorrectly sets a function's `prototype` property [[Enumerable]]
       * value to `true`.
       *
       * @memberOf _.support
       * @type boolean
       */
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

      /**
       * Detect if functions can be decompiled by `Function#toString`
       * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

      /**
       * Detect if `Function#name` is supported (all but IE).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.funcNames = typeof Function.name == 'string';

      /**
       * Detect if `arguments` object indexes are non-enumerable
       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.nonEnumArgs = key != 0;

      /**
       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
       *
       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.nonEnumShadows = !/valueOf/.test(props);

      /**
       * Detect if own properties are iterated after inherited properties (all but IE < 9).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.ownLast = props[0] != 'x';

      /**
       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
       *
       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
       * and `splice()` functions that fail to remove the last element, `value[0]`,
       * of array-like objects even though the `length` property is set to `0`.
       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
       *
       * @memberOf _.support
       * @type boolean
       */
      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

      /**
       * Detect lack of support for accessing string characters by index.
       *
       * IE < 8 can't access characters by index and IE 8 can only access
       * characters by index on string literals.
       *
       * @memberOf _.support
       * @type boolean
       */
      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

      /**
       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
       * and that the JS engine errors when attempting to coerce an object to
       * a string without a `toString` function.
       *
       * @memberOf _.support
       * @type boolean
       */
      try {
        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
      } catch(e) {
        support.nodeClass = true;
      }
    }(1));

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
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
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

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

    /*--------------------------------------------------------------------------*/

    /**
     * The template used to create iterator functions.
     *
     * @private
     * @param {Object} data The data object used to populate the text.
     * @returns {string} Returns the interpolated text.
     */
    var iteratorTemplate = function(obj) {

      var __p = 'var index, iterable = ' +
      (obj.firstArg) +
      ', result = ' +
      (obj.init) +
      ';\nif (!iterable) return result;\n' +
      (obj.top) +
      ';';
       if (obj.array) {
      __p += '\nvar length = iterable.length; index = -1;\nif (' +
      (obj.array) +
      ') {  ';
       if (support.unindexedChars) {
      __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
       }
      __p += '\n  while (++index < length) {\n    ' +
      (obj.loop) +
      ';\n  }\n}\nelse {  ';
       } else if (support.nonEnumArgs) {
      __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
      (obj.loop) +
      ';\n    }\n  } else {  ';
       }

       if (support.enumPrototypes) {
      __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
       }

       if (support.enumErrorProps) {
      __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
       }

          var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

       if (obj.useHas && obj.keys) {
      __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
          if (conditions.length) {
      __p += '    if (' +
      (conditions.join(' && ')) +
      ') {\n  ';
       }
      __p +=
      (obj.loop) +
      ';    ';
       if (conditions.length) {
      __p += '\n    }';
       }
      __p += '\n  }  ';
       } else {
      __p += '\n  for (index in iterable) {\n';
          if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
      __p += '    if (' +
      (conditions.join(' && ')) +
      ') {\n  ';
       }
      __p +=
      (obj.loop) +
      ';    ';
       if (conditions.length) {
      __p += '\n    }';
       }
      __p += '\n  }    ';
       if (support.nonEnumShadows) {
      __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
       for (k = 0; k < 7; k++) {
      __p += '\n    index = \'' +
      (obj.shadowedProps[k]) +
      '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
              if (!obj.useHas) {
      __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
       }
      __p += ') {\n      ' +
      (obj.loop) +
      ';\n    }      ';
       }
      __p += '\n  }    ';
       }

       }

       if (obj.array || support.nonEnumArgs) {
      __p += '\n}';
       }
      __p +=
      (obj.bottom) +
      ';\nreturn result';

      return __p
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className] || (!support.nodeClass && isNode(value))) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? baseEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
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
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
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
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        if (isArray(collection)) {
          var index = -1,
              length = collection.length;

          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          baseEach(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Creates compiled iteration functions.
     *
     * @private
     * @param {...Object} [options] The compile options object(s).
     * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
     * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
     * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
     * @param {string} [options.args] A comma separated string of iteration function arguments.
     * @param {string} [options.top] Code to execute before the iteration branches.
     * @param {string} [options.loop] Code to execute in the object loop.
     * @param {string} [options.bottom] Code to execute after the iteration branches.
     * @returns {Function} Returns the compiled function.
     */
    function createIterator() {
      // data properties
      iteratorData.shadowedProps = shadowedProps;

      // iterator options
      iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
      iteratorData.init = 'iterable';
      iteratorData.useHas = true;

      // merge options into a template data object
      for (var object, index = 0; object = arguments[index]; index++) {
        for (var key in object) {
          iteratorData[key] = object[key];
        }
      }
      var args = iteratorData.args;
      iteratorData.firstArg = /^[^,]+/.exec(args)[0];

      // create the function factory
      var factory = Function(
          'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +
          'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +
          'objectTypes, nonEnumProps, stringClass, stringProto, toString',
        'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
      );

      // return the compiled function
      return factory(
        baseCreateCallback, errorClass, errorProto, hasOwnProperty,
        indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,
        objectTypes, nonEnumProps, stringClass, stringProto, toString
      );
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||
          (!support.argsClass && isArguments(value)) ||
          (!support.nodeClass && isNode(value))) {
        return false;
      }
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      if (support.ownLast) {
        forIn(value, function(value, key, object) {
          result = hasOwnProperty.call(object, key);
          return false;
        });
        return result !== false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }
    // fallback for browsers that can't detect `arguments` objects by [[Class]]
    if (!support.argsClass) {
      isArguments = function(value) {
        return value && typeof value == 'object' && typeof value.length == 'number' &&
          hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
      };
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = createIterator({
      'args': 'object',
      'init': '[]',
      'top': 'if (!(objectTypes[typeof object])) return result',
      'loop': 'result.push(index)'
    });

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      if ((support.enumPrototypes && typeof object == 'function') ||
          (support.nonEnumArgs && object.length && isArguments(object))) {
        return shimKeys(object);
      }
      return nativeKeys(object);
    };

    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
    var eachIteratorOptions = {
      'args': 'collection, callback, thisArg',
      'top': "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
      'array': "typeof length == 'number'",
      'keys': keys,
      'loop': 'if (callback(iterable[index], index, collection) === false) return result'
    };

    /** Reusable iterator options for `assign` and `defaults` */
    var defaultsIteratorOptions = {
      'args': 'object, source, guard',
      'top':
        'var args = arguments,\n' +
        '    argsIndex = 0,\n' +
        "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
        'while (++argsIndex < argsLength) {\n' +
        '  iterable = args[argsIndex];\n' +
        '  if (iterable && objectTypes[typeof iterable]) {',
      'keys': keys,
      'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
      'bottom': '  }\n}'
    };

    /** Reusable iterator options for `forIn` and `forOwn` */
    var forOwnIteratorOptions = {
      'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
      'array': false
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /**
     * A function compiled to iterate `arguments` objects, arrays, objects, and
     * strings consistenly across environments, executing the callback for each
     * element in the collection. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index|key, collection). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @private
     * @type Function
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     */
    var baseEach = createIterator(eachIteratorOptions);

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = createIterator(defaultsIteratorOptions, {
      'top':
        defaultsIteratorOptions.top.replace(';',
          ';\n' +
          "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
          '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
          "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
          '  callback = args[--argsLength];\n' +
          '}'
        ),
      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
    });

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
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
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = createIterator(defaultsIteratorOptions);

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
      'useHas': false
    });

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass ||
          (support.argsClass ? className == argsClass : isArguments(value))) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }
    // fallback for older versions of Chrome and Safari
    if (isFunction(/x/)) {
      isFunction = function(value) {
        return typeof value == 'function' && toString.call(value) == funcClass;
      };
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
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
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
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
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
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
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? baseEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      if (support.unindexedChars && isString(collection)) {
        collection = collection.split('');
      }
      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        baseEach(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        baseEach(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        baseEach(collection, callback, thisArg);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var iterable = collection,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (isArray(collection)) {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        if (typeof length != 'number') {
          var props = keys(collection);
          length = props.length;
        } else if (support.unindexedChars && isString(collection)) {
          iterable = collection.split('');
        }
        baseEach(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(iterable[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      callback = lodash.createCallback(callback, thisArg, 3);
      if (isArray(collection)) {
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        baseEach(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        baseEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        baseEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      } else if (support.unindexedChars && isString(collection)) {
        collection = collection.split('');
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return (support.unindexedChars && isString(collection))
          ? collection.split('')
          : slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
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
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
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

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
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
      };

      var maxDelayed = function() {
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
      };

      return function() {
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
              isCalled = remaining <= 0;

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
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
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
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
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
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
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
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
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

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
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
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
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
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    baseEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    baseEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    // avoid array-like object bugs with `Array#shift` and `Array#splice`
    // in IE < 9, Firefox < 10, Narwhal, and RingoJS
    if (!support.spliceObjects) {
      baseEach(['pop', 'shift', 'splice'], function(methodName) {
        var func = arrayRef[methodName],
            isSplice = methodName == 'splice';

        lodash.prototype[methodName] = function() {
          var chainAll = this.__chain__,
              value = this.__wrapped__,
              result = func.apply(value, arguments);

          if (value.length === 0) {
            delete value[0];
          }
          return (chainAll || isSplice)
            ? new lodashWrapper(result, chainAll)
            : result;
        };
      });
    }

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
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
;/* mousetrap v1.4.6 craig.is/killing/mice */
(function(J,r,f){function s(a,b,d){a.addEventListener?a.addEventListener(b,d,!1):a.attachEvent("on"+b,d)}function A(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return h[a.which]?h[a.which]:B[a.which]?B[a.which]:String.fromCharCode(a.which).toLowerCase()}function t(a){a=a||{};var b=!1,d;for(d in n)a[d]?b=!0:n[d]=0;b||(u=!1)}function C(a,b,d,c,e,v){var g,k,f=[],h=d.type;if(!l[a])return[];"keyup"==h&&w(a)&&(b=[a]);for(g=0;g<l[a].length;++g)if(k=
l[a][g],!(!c&&k.seq&&n[k.seq]!=k.level||h!=k.action||("keypress"!=h||d.metaKey||d.ctrlKey)&&b.sort().join(",")!==k.modifiers.sort().join(","))){var m=c&&k.seq==c&&k.level==v;(!c&&k.combo==e||m)&&l[a].splice(g,1);f.push(k)}return f}function K(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function x(a,b,d,c){m.stopCallback(b,b.target||b.srcElement,d,c)||!1!==a(b,d)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?
b.stopPropagation():b.cancelBubble=!0)}function y(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=A(a);b&&("keyup"==a.type&&z===b?z=!1:m.handleKey(b,K(a),a))}function w(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function L(a,b,d,c){function e(b){return function(){u=b;++n[a];clearTimeout(D);D=setTimeout(t,1E3)}}function v(b){x(d,b,a);"keyup"!==c&&(z=A(b));setTimeout(t,10)}for(var g=n[a]=0;g<b.length;++g){var f=g+1===b.length?v:e(c||E(b[g+1]).action);F(b[g],f,c,a,g)}}function E(a,b){var d,
c,e,f=[];d="+"===a?["+"]:a.split("+");for(e=0;e<d.length;++e)c=d[e],G[c]&&(c=G[c]),b&&"keypress"!=b&&H[c]&&(c=H[c],f.push("shift")),w(c)&&f.push(c);d=c;e=b;if(!e){if(!p){p={};for(var g in h)95<g&&112>g||h.hasOwnProperty(g)&&(p[h[g]]=g)}e=p[d]?"keydown":"keypress"}"keypress"==e&&f.length&&(e="keydown");return{key:c,modifiers:f,action:e}}function F(a,b,d,c,e){q[a+":"+d]=b;a=a.replace(/\s+/g," ");var f=a.split(" ");1<f.length?L(a,f,b,d):(d=E(a,d),l[d.key]=l[d.key]||[],C(d.key,d.modifiers,{type:d.action},
c,a,e),l[d.key][c?"unshift":"push"]({callback:b,modifiers:d.modifiers,action:d.action,seq:c,level:e,combo:a}))}var h={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},B={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},H={"~":"`","!":"1",
"@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},G={option:"alt",command:"meta","return":"enter",escape:"esc",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},p,l={},q={},n={},D,z=!1,I=!1,u=!1;for(f=1;20>f;++f)h[111+f]="f"+f;for(f=0;9>=f;++f)h[f+96]=f;s(r,"keypress",y);s(r,"keydown",y);s(r,"keyup",y);var m={bind:function(a,b,d){a=a instanceof Array?a:[a];for(var c=0;c<a.length;++c)F(a[c],b,d);return this},
unbind:function(a,b){return m.bind(a,function(){},b)},trigger:function(a,b){if(q[a+":"+b])q[a+":"+b]({},a);return this},reset:function(){l={};q={};return this},stopCallback:function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable},handleKey:function(a,b,d){var c=C(a,b,d),e;b={};var f=0,g=!1;for(e=0;e<c.length;++e)c[e].seq&&(f=Math.max(f,c[e].level));for(e=0;e<c.length;++e)c[e].seq?c[e].level==f&&(g=!0,
b[c[e].seq]=1,x(c[e].callback,d,c[e].combo,c[e].seq)):g||x(c[e].callback,d,c[e].combo);c="keypress"==d.type&&I;d.type!=u||w(a)||c||t(b);I=g&&"keydown"==d.type}};J.Mousetrap=m;"function"===typeof define&&define.amd&&define(m)})(window,document);
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
;/*! (C) WebReflection Mit Style License */
(function(e,t,n,r){"use strict";function q(e,t){for(var n=0,r=e.length;n<r;n++)J(e[n],t)}function R(e){for(var t=0,n=e.length,r;t<n;t++)r=e[t],$(r,c[z(r)])}function U(e){return function(t){g.call(L,t)&&(J(t,e),q(t.querySelectorAll(h),e))}}function z(e){var t=e.getAttribute("is");return d.call(l,t?t.toUpperCase():e.nodeName)}function W(e){var t=e.currentTarget,n=e.attrChange,r=e.prevValue,i=e.newValue;t.attributeChangedCallback&&t.attributeChangedCallback(e.attrName,n===e.ADDITION?null:r,n===e.REMOVAL?null:i)}function X(e){var t=U(e);return function(e){t(e.target)}}function V(e,t){var n=this;O.call(n,e,t),B.call(n,{target:n})}function $(e,t){N(e,t),I?I.observe(e,_):(H&&(e.setAttribute=V,e[i]=F(e),e.addEventListener(u,B)),e.addEventListener(o,W)),e.createdCallback&&(e.created=!0,e.createdCallback(),e.created=!1)}function J(e,t){var n,r=z(e),i="attached",s="detached";-1<r&&(C(e,c[r]),r=0,t===i&&!e[i]?(e[s]=!1,e[i]=!0,r=1):t===s&&!e[s]&&(e[i]=!1,e[s]=!0,r=1),r&&(n=e[t+"Callback"])&&n.call(e))}if(r in t)return;var i="__"+r+(Math.random()*1e5>>0),s="extends",o="DOMAttrModified",u="DOMSubtreeModified",a=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,f=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],l=[],c=[],h="",p=t.documentElement,d=l.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},v=n.prototype,m=v.hasOwnProperty,g=v.isPrototypeOf,y=n.defineProperty,b=n.getOwnPropertyDescriptor,w=n.getOwnPropertyNames,E=n.getPrototypeOf,S=n.setPrototypeOf,x=!!n.__proto__,T=n.create||function K(e){return e?(K.prototype=e,new K):this},N=S||(x?function(e,t){return e.__proto__=t,e}:b?function(){function e(e,t){for(var n,r=w(t),i=0,s=r.length;i<s;i++)n=r[i],m.call(e,n)||y(e,n,b(t,n))}return function(t,n){do e(t,n);while(n=E(n));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),C=S||x?function(e,t){g.call(t,e)||$(e,t)}:function(e,t){e[i]||(e[i]=n(!0),$(e,t))},k=e.MutationObserver||e.WebKitMutationObserver,L=(e.HTMLElement||e.Element||e.Node).prototype,A=L.cloneNode,O=L.setAttribute,M=t.createElement,_=k&&{attributes:!0,characterData:!0,attributeOldValue:!0},D=k||function(e){H=!1,p.removeEventListener(o,D)},P=!1,H=!0,B,j,F,I;k||(p.addEventListener(o,D),p.setAttribute(i,1),p.removeAttribute(i),H&&(B=function(e){var t=this,n,r,s;if(t===e.target){n=t[i],t[i]=r=F(t);for(s in r){if(!(s in n))return j(0,t,s,n[s],r[s],"ADDITION");if(r[s]!==n[s])return j(1,t,s,n[s],r[s],"MODIFICATION")}for(s in n)if(!(s in r))return j(2,t,s,n[s],r[s],"REMOVAL")}},j=function(e,t,n,r,i,s){var o={attrChange:e,currentTarget:t,attrName:n,prevValue:r,newValue:i};o[s]=e,W(o)},F=function(e){for(var t,n={},r=e.attributes,i=0,s=r.length;i<s;i++)t=r[i],n[t.name]=t.value;return n})),t[r]=function(n,r){y=n.toUpperCase(),P||(P=!0,k?(I=function(e,t){function n(e,t){for(var n=0,r=e.length;n<r;t(e[n++]));}return new k(function(r){for(var i,s,o=0,u=r.length;o<u;o++)i=r[o],i.type==="childList"?(n(i.addedNodes,e),n(i.removedNodes,t)):(s=i.target,s.attributeChangedCallback&&s.attributeChangedCallback(i.attributeName,i.oldValue,s.getAttribute(i.attributeName)))})}(U("attached"),U("detached")),I.observe(t,{childList:!0,subtree:!0})):(t.addEventListener("DOMNodeInserted",X("attached")),t.addEventListener("DOMNodeRemoved",X("detached"))),t.createElement=function(e,n){var r,i=M.apply(t,arguments);return n&&i.setAttribute("is",e=n.toLowerCase()),r=d.call(l,e.toUpperCase()),-1<r&&$(i,c[r]),i},L.cloneNode=function(e){var t=A.call(this,!!e),n=z(t);return-1<n&&$(t,c[n]),e&&R(t.querySelectorAll(h)),t});if(-1<d.call(l,y))throw new Error("A "+n+" type is already registered");if(!a.test(y)||-1<d.call(f,y))throw new Error("The type "+n+" is invalid");var i=function(){return t.createElement(p,u&&y)},o=r||v,u=m.call(o,s),p=u?r[s]:y,g=l.push(y)-1,y;return h=h.concat(h.length?",":"",u?p+'[is="'+n.toLowerCase()+'"]':p),i.prototype=c[g]=m.call(o,"prototype")?o.prototype:T(L),q(t.querySelectorAll(h),"attached"),i}})(window,document,Object,"registerElement");;/* ************************************************************************

    License: MIT Licence

    Dependencies : []

    Events : []

    Description:
        Main AppStorm.JS functionality, create some needed system to help plugin or user

************************************************************************ */

;


/*
 * Bind AppStorm.JS to underscore
*/
window.appstorm = window.a = _.noConflict();
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
    }
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
                r = new Array(l);
            for(var i = 0; i < l; ++i) {
                r[i] = a.deepClone(obj[i]);
            }
            return r;

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

    if ((type == 'number' || type == 'string') && args[3]
                                && args[3][guard] === source) {
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
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
    ]

    Events : []

    Description:
        Provide easy store object, with global prefix value system on top of it

************************************************************************ */


/**
 * Provide easy store object, with global prefix value system on top of it
 *
 * @class mem
 * @static
 * @namespace a
*/
a.mem = (function() {
    var store = {};

    /**
     * Sanitize a key to generate a 'usable' key
     *
     * @method sanitizeKey
     * @private
     *
     * @param key {String}                  The key string to sanitize
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
    };

    /**
     * Get a stored element
     *
     * @method getFromStore
     * @private
     *
     * @param key {String}                  The key to retrieve value from
     * @return {Object | null}              null in case of not found, and
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
    };

    /**
     * Get the full stored elements
     *
     * @method listFromStore
     * @private
     *
     * @param prefix {String}               The prefix to use as 'search from
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
    };

    /**
     * Store a new element, or erase a previous element
     *
     * @method setToStore
     * @private
     *
     * @param key {String}                  The key to set value linked to
     * @param value {Object}                The value to associate to key
    */
    function setToStore(key, value) {
        key = sanitizeKey(key);
        if(key) {
            store[key] = value;
        }
    };

    /**
     * Remove an element from store
     *
     * @method removeFromStore
     * @private
     *
     * @param key {String}                  The key to erase from store
    */
    function removeFromStore(key) {
        key = sanitizeKey(key);
        delete store[key];
    };


    /**
     * Clear the full store
     *
     * @method clearStore
     * @private
    */
    function clearStore(prefix) {
        for(var key in store) {
            if(key.indexOf(prefix) === 0) {
                delete store[key];
            }
        }
    };


    // Generic object to derivate from prefix element
    var genericObject = function(prefix) {
        this.prefix = prefix;
    };

    // Create the default prototype instance
    genericObject.prototype = {
        /**
         * Get a stored element
         *
         * @method get
         *
         * @param key {String}              The key to retrieve value from
         * @return {Object | null}          null in case of not found, and
         *                                  the stored value if found
        */
        get: function(key) {
            return getFromStore(this.prefix + '.' + key);
        },

        /**
         * Get the full currently stored elements.
         *
         * @method list
         *
         * @return {Object}                  An object of all currently stored
         *                                   elements
        */
        list: function() {
            return listFromStore(this.prefix);
        },

        /**
         * Store a new element, or erase a previous element
         *
         * @method set
         *
         * @param key {String}              The key to set value linked to
         * @param value {Object}            The value to associate to key
        */
        set: function(key, value) {
            setToStore(this.prefix + '.' + key, value);
        },

        /**
         * Remove an element from store
         *
         * @method remove
         *
         * @param key {String}              The key to erase from store
        */
        remove: function(key) {
            removeFromStore(this.prefix + '.' + key);
        },

        /**
         * Clear everything stored inside store
         *
         * @method clear
        */
        clear: function() {
            // Must be a string not empty...
            if(this.prefix) {
                clearStore(this.prefix);
            }
        }
    };

    var defaultInstance = new genericObject('');

    // We add the last missing part: get your own genericObject
    /**
     * Retrieve a custom mem object to manipulate from root prefix
     *
     * @method getInstance
     *
     * @param prefix {String}               The prefix to use as base
     * @return {Object}                     An instance ready to use
    */
    defaultInstance.getInstance = function(prefix) {
        return new genericObject(prefix);
    };

    // return the custom object
    return defaultInstance;
})();


// After running, we try to add the appstorm root url if possible
if(a.isString(a.url) && a.url.length > 0) {
    a.mem.set('app.url', a.url);
}


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Get environment elements
    Handlebars.registerHelper('mem', function(value) {
        return new Handlebars.SafeString(a.mem.get(value));
    });
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies: [
        a.js
        core/mem.js
    ]

    Events: [
    ]

    Description:
        Environment functionnality, to get access to some basic
        'main options' for system

************************************************************************ */


/**
 * Main environment data store, allow to globally define some global
 * rules for managing global environment variable
 *
 * Examples:
 *     <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:environment">here</a>
 *
 * @class environment
 * @static
 * @namespace a
*/
a.environment = a.mem.getInstance('app.environment');

// Default data
a.environment.set('verbose', 2);
a.environment.set('console', 'log');
a.environment.set('cache', false);


/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Get environment elements
    Handlebars.registerHelper('environment', function(value) {
        return new Handlebars.SafeString(a.environment.get(value));
    });
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/environment.js
    ]

    Events : []

    Description:
        Console functionnality, the system will automatically choose what kind of console is acceptable or not

************************************************************************ */


/**
 * wrapper for system console, allowing to use console even if there is not console support on given browser.
 * Also, it does provide a trace utility in case of bug/check
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:console">here</a>
 *
 * @class console
 * @static
 * @namespace a
*/
a.console = (function() {
    "use strict";

    // Store some data if console.log is not available
    var __data = {log : [], warn : [], info : [], error : []};

    /**
     * Output to console any given value. If console is not ready, the content will be stored into object, the list function allow to access stored content in this case
     *
     * @method __out
     * @private
     *
     * @param type {String} The type, like "log", "warn", "info", "error", ...
     * @param value {Mixed} The value to output
     * @param level {Integer | null} Indicate the message priority level, can be null
     * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
    */
    function __out(type, value, level, appear) {
        // Rollback to log in case of problem
        if(!a.isArray(__data[type])) {
            type = "log";
        }
        __data[type].push(value);

        // Bug: IE does not support testing variable existence if they are not scopped with the root (here window)
        if(!a.isNone(window.console) && a.isFunction(window.console.log) && appear !== false) {
            // We disable log depending of console level.
            // If no console, or log level, we allow all
            switch(a.environment.get("console")) {
                case "error":
                    if(type !== "error") {
                        break;
                    }
                case "warning":
                case "warn":
                    if(type !== "warn" && type !== "error") {
                        break;
                    }
                case "info":
                    if(type === "log") {
                        break;
                    }
                default:
                    var print = true,
                        found = false;

                    // We search for fine verbose element
                    if(a.isString(value) && value.indexOf(":") >= 0) {
                        var name     = value.substr(0, value.indexOf(":")),
                            splitted = name.split("."),
                            i        = splitted.length;

                        // We go from full array recomposed, to only first item
                        while(i--) {
                            var key = "verbose-" + splitted.join("."),
                                en  = a.environment.get(key);

                            if(!a.isNone(en)) {
                                found = true;
                                print = (en < level) ? false : true;
                                break;
                            }

                            // We don't find any, we go one level up
                            splitted.pop();
                        }
                    }

                    // Check the verbose state to know if we should print or not
                    if(!found && !a.isNone(a.environment.get("verbose")) && !a.isNone(level)) {
                        var iverb = parseInt(a.environment.get("verbose"), 10);
                        if(iverb < level) {
                            print = false;
                        }
                    }
                    if(print) {
                        window.console[type](value);
                    }
                    break;
            };
        }

        // If data exceed limit, we remove some
        while(__data[type].length > 2000) {
            __data[type].shift();
        }
    };

    return {
        /**
         * Log data
         *
         * @method log
         *
         * @param value {Mixed} The value to log on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        log : function(value, level, appear) {      __out("log", value, level, appear); },

        /**
         * Warning data
         *
         * @method warn
         *
         * @param value {Mixed} The value to warning on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        warn : function(value, level, appear) { __out("warn", value, level, appear);    },

        /**
         * Information data
         *
         * @method info
         *
         * @param value {Mixed} The value to inform on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        info : function(value, level, appear) { __out("info", value, level, appear);    },

        /**
         * Error data
         *
         * @method error
         *
         * @param value {Mixed} The value to error on debug
         * @param level {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        error : function(value, level, appear) {    __out("error", value, level, appear);   },

        /**
         * List all currently stored content
         *
         * @method trace
         *
         * @param type {String | null} The string type (can be null)
         * @return The stored data, the object got 4 properties : log, info, warn, error
        */
        trace : function(type) {
            return (a.isString(type) && type in __data) ? __data[type] : __data;
        },

        /**
         * Clear the stored content
         *
         * @method clear
        */
        clear : function() {
            __data = {log : [], warn : [], info : [], error : []};
        }
    };
}());
;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/environment.js
    ]

    Events : []

    Description:
        Debugger functionnality including nested group system like console
        usually provide

************************************************************************ */

(function(win, a) {
    'use strict';

    var concurrentConsoleAccess = false;

    /*
     * Debugger is a wrapper around window.console to provide a more
     * structured way to access and use group system provided by console.
     *
     * @class console
     * @static
     * @namespace a
    */
    a.debugger = function(name, collapsed, parent) {
        this._name = name;
        this._collapsed = collapsed || false;
        this._parent = parent || null;
        this._logs = [];
    };

    a.debugger.prototype = {
        /**
         * Create a group inside this debugger
         *
         * @method group
         *
         * @param name {String}                 The new sub group name
         * @param collapsed {Boolean | null}    If we should collapse or not when
         *                                      printing to console
         * @return {a.debugger}                 The debugger associated
        */
        group: function(name, collapsed) {
            var debug = new a.debugger(name, collapsed, this);
            this._logs.push({
                type: 'group',
                args: debug
            });
            return debug;
        },

        /**
         * Render the group and all sub groups into console
         *
         * @method print
         *
         * @param level {String | null}     The minimum level to print element
         *                                  on console
        */
        print: function(level) {
            // Somebody is already using it... We have to wait a while
            if(this._parent === null && concurrentConsoleAccess === true) {
                setTimeout(this.print, 50);
                return;
            }

            // Take care of level if needed
            // Quit if needed to render this debugger
            if(level) {
                switch(a.environment.get('console')) {
                    case 'error':
                        if(level !== 'error') {
                            return;
                        }
                    case 'warning':
                    case 'warn':
                        if(level !== 'warn' && level !== 'error') {
                            return;
                        }
                    case 'info':
                        if(level === 'log') {
                            return;
                        }
                }
            }

            // The root (the original one), lock the console
            // to not pollute with other eventual print
            if(this._parent === null) {
                concurrentConsoleAccess = true;
            }

            // Starting groups
            if(this._collapsed === true) {
                console.groupCollapsed(this._name);
            } else {
                console.group(this._name);
            }

            // Loggings
            var logs = this._logs;
            for(var i=0, l=logs.length; i<l; ++i) {
                var log = logs[i],
                    type = log['type'];

                if(type === 'group') {
                    var group = log['args'];
                    group.print();
                }else if(typeof(win.console[type]) !== 'undefined') {
                    var fct = win.console[type];
                    fct.apply(null, log['args']);
                }
            }

            // Ending group
            console.groupEnd();

            if(this._parent == null) {
                concurrentConsoleAccess = false;
            }
        },

        /**
         * Log something into console
         *
         * @method log
         *
         * @param any {Object}              Anything to send to console
        */
        log: function() {

            this._logs.push({
                type: 'log',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Log something into console
         *
         * @method warn
         *
         * @param any {Object}              Anything to send to console
        */
        warn: function() {
            this._logs.push({
                type: 'warn',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Log something into info
         *
         * @method info
         *
         * @param any {Object}              Anything to send to console
        */
        info: function() {
            this._logs.push({
                type: 'info',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Log something into error
         *
         * @method error
         *
         * @param any {Object}              Anything to send to console
        */
        error: function() {
            this._logs.push({
                type: 'error',
                args: Array.prototype.slice.call(arguments)
            });
        },

        /**
         * Get the current trace stored into debugger
         *
         * @return {Array}                  The tracelog currently stored
        */
        trace: function() {
            return this._logs;
        },

        /**
         * Clear the debugger
         *
         * @method clear
        */
        clear: function() {
            this._logs = [];
        }
    };
})(window, window.appstorm);;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js
    ]

    Events : [
        a.message.add {
            type : the type listeners (like "a.storage.add"),
            function : the associated function
        }
        a.message.remove {
            type : the type listeners (like "a.storage.add"),
            function : the associated function
        }
        a.message.removeAll {
            type : the type listeners (like "a.storage.add")
        }
        a.message.clear {}
    ]

    Description:
        Define one reusable object (eventEmitter)
        and create a root event system (message)
        ( @see : http://simplapi.wordpress.com/2012/09/01/custom-event-listener-in-javascript/ )

************************************************************************ */



/**
 * Simple hash change checker to allow creating multi-page system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:message">here</a>
 *
 * @class eventEmitter
 * @constructor
 * @namespace a
*/
a.eventEmitter = function(base) {
    this.eventList = {};
    this.eventBaseName = base;
};


a.eventEmitter.prototype = {
    /**
     * Clear the event listeners which don't have any function added
     *
     * @method clearEventType
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
     * Bind a function to an event type
     *
     * @method bind
     *
     * @param type {String}                 The event type
     * @param fn {Function}                 The function to bind to event
     * @param scope {Object | null}         The scope to bind to function
     * @param once {Boolean | null}         If we should start it only once or
     *                                      not
     * @param clear {Boolean | null}        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bind: function(type, fn, scope, once, clear) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var msg = '.bind: the type cannot be bind (type: ' + type + ')';
            a.console.warn(this.eventBaseName + msg, 1);
            return;
        }

        // The function is invalid (not a function)
        if(!a.isFunction(fn)) {
            var msg = '.bind: unable to bind function, this is not a function';
            a.console.warn(this.eventBaseName + msg, 1);
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
     * Adding a listener only once
     *
     * @method bindOnce
     *
     * @param type {String}                 The event type
     * @param fn {Function}                 The function to bind to event
     * @param scope {Object | null}         The scope to bind to function
     * @param clear {Boolean | null}        If the current bind can be clear or
     *                                      not (you still can use unbind)
    */
    bindOnce: function(type, fn, scope, clear) {
        this.bind(type, fn, scope, true, clear);
    },

    /**
     * Removing a listener to a specific message type
     *
     * @method unbind
     *
     * @param type {String} The event name
     * @param fn {Function} The function to detach
    */
    unbind: function(type, fn) {
        // The type is invalid (empty string or not a string)
        if(!type || !a.isString(type)) {
            var msg = '.unbind: the type cannot be bind (type: ' + type + ')';
            a.console.warn(this.eventBaseName + msg, 1);
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
     * Remove all listeners for a given type
     *
     * @method unbindAll
     *
     * @param type {String} The event type to remove
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
     * Clear all listeners from all event type
     *
     * @method clear
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
     * Call an event, according to it's type
     *
     * @method dispatch
     *
     * @param type {String} The event name to dispatch
     * @param data {Object} Anything you want to pass threw this event
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


/**
 * The bus system to exchange message globally between all application object
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:message">here</a>
 *
 * @class message
 * @static
 * @requires eventEmitter
 * @uses eventEmitter
 * @namespace a
*/
a.message = new a.eventEmitter('a.message');


/*
------------------------------
  SPECIFIC READY
------------------------------
*/
(function() {
    var ready = false,
        tmp = [];

    /**
     * Internal function to call function regarding it's scope
     *
     * @method internalCall
     * @private
     *
     * @param func {Function}               The function to call
     * @param scope {Object | null}         The potential scope (optional)
    */
    function internalCall(func, scope) {
        setTimeout(function() {
            if(scope) {
                func.call(scope);
            } else {
                func();
            }
        }, 0);
    };

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
     * Alias mostly used for appstorm ready event
     *
     * @method on
     *
     * @param name {String}                     The event name
     * @param func {Function}                   The function to start
     * @param scope {Object | null}             The scope to apply (optional)
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
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/environment.js
        core/console.js
    ]

    Events : []

    Description:
        Provide parsing/stringify functionnality for JSON and XML format

************************************************************************ */


/*
 * USE OF JSON3:
 *    JSON v3.2.4
 *    http://bestiejs.github.com/json3
 *    Copyright 2012, Kit Cambridge
 *    http://kit.mit-license.org
 *
 * It seems JSON3 fully bind at all times, so we change... 
*/

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







// Provide parsing/stringify functionnality for JSON and XML format
a.parser = {
    /**
     * Basic JSON handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check
     *
     * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:parser">here</a>
     *
     * @class json
     * @static
     * @namespace a.parser
    */
    json: {
        /**
         * Serialize a JSON into a string
         *
         * @method stringify
         *
         * @param value {Object}         Any data to be converted into String
         * @return {String}              A JSON parsed string, or an empty
         *                               string if the parsing fails
        */
        stringify: function() {
            try {
                return JSON.stringify.apply(null, arguments);
            } catch(e) {
                var unable = 'a.parser.json.stringify: ' +
                             'unable to stringify (value: ' +
                             arguments.toString() + ')';
                a.console.error(unable, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('debug')) {
                    a.console.error(a.getStackTrace(), 1);
                }
                return '';
            }
        },

        /**
         * Deserialize a string into JSON
         *
         * @method parse
         *
         * @param value {String}            The value un-stringify
         * @return {Mixed | null}           The converted value
        */
        parse: function(value) {
            try {
                return JSON.parse(value);
            } catch(e) {
                var unable = 'a.parser.json.parse: ' +
                             'unable to parse (value: ' + value + ')';
                a.console.error(unable, 1);
                // Debug stack trace in case of debug mode
                if(a.environment.get('debug')) {
                    a.console.error(a.getStackTrace(), 1);
                }
                return null;
            }
        }
    },

    /**
     * Basic XML handler wich prevent from 'no data' or 'wrong data' input,
     * with a log message to check
     *
     * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:parser">here</a>
     *
     * @class xml
     * @static
     * @namespace a.parser
    */
    xml: {
        /**
         * Serialize a XML into a string
         *
         * @method stringify
         *
         * @param value {Object}      Any data to be converted into String
         * @return {String}           A parsed string, or an empty
         *                            string if the parsing fails
        */
        stringify: function(value) {
            if(!a.isNone(value) && !a.isNone(value.xml)) {
                return value.xml;
            } else if(!a.isNone(window.XMLSerializer)) {
                try {
                    var serializer = new window.XMLSerializer();
                    return serializer.serializeToString(value);
                } catch(e) {
                    var unable = 'a.parser.xml.stringify: ' +
                                 'unable to stringify (value: ' + value + ')';
                    a.console.error(unable, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('debug')) {
                        a.console.error(a.getStackTrace(), 1);
                    }
                }
            }

            var noParserFound = 'a.parser.xml.stringify: ' +
                                'unable to find any parser available';
            a.console.error(noParserFound, 1);
            return '';
        },

        /**
         * Deserialize a string into XML
         *
         * @method parse
         *
         * @param value {String}          The value un-stringify
         * @return {DOMElement | null}    The resulting doc element, or null
         *                                in case of problem
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
                if (doc.parseError.errorCode != 0) {
                    var unable = 'a.parser.xml.parse: ' +
                                 'unable to parse (value: ' + value +
                                 ', reason' + doc.parseError.reason + ')';
                    a.console.error(unable, 1);
                    // Debug stack trace in case of debug mode
                    if(a.environment.get('debug')) {
                        a.console.error(a.getStackTrace(), 1);
                    }

                    return null;
                }
                return doc;
            } else if(!a.isNone(window.DOMParser)) {
                return (new DOMParser()).parseFromString(value, 'text/xml');
            }

            var noParserFound = 'a.parser.xml.parse: ' +
                                'unable to find any parser available';
            a.console.error(noParserFound, 1);
            return null;
        }
    }
};
;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/message.js
        core/console.js
    ]

    Events : [
        a.timer.tick : null (no data)
    ]

    Description:
        Simple timer system, provide a single timer for many bindings

************************************************************************ */

/**
 * Simple timer system, provide a single timer for many bindings
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:timer">here</a>
 *
 * @class timer
 * @static
 * @namespace a
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
    };

    // Auto-start timer
    setInterval(tick, delay);

    return {
        /**
         * Register a function for regular timer tick
         *
         * @method add
         * @async
         *
         * @param fct {Function}        The function to bind
         * @param scope {Object | null} The scope to use when calling function
         * @param timeout {Integer}     The timeout between two call
         * @return {Integer}            A generated id used to access
         *                              this entry
        */
        add: function(fct, scope, timeout) {
            var id = a.uniqueId();

            if(!a.isNumber(timeout) || timeout <= 0) {
                timeout = 1000;
                a.console.warn('The timeout has not been setted properly ' +
                                    'into timer, timeout has been ' +
                                    'setted to 1000ms', 1);
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
         * Register a function for a single timer tick
         *
         * @method once
         * @async
         *
         * @param fct {Function}        The function to bind
         * @param scope {Object | null} The scope to use when calling function
         * @param timeout {Integer}     The timeout when calling function
         * @return {Integer}            A generated id used to
         *                              manipulate ticker access
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
         * Get a function registred into the timer
         *
         * @method get
         *
         * @return {Object | null}      The object linked to id,
         *                              or null if nothing is related to id
        */
        get: function(id) {
            var item = store[id];
            return a.isNone(item) ? null : item;
        },

        /**
         * Remove a function currently stored into the timer
         *
         * @method remove
         *
         * @param id {Integer}         The id to delete
         * @return {Boolean}           The item has been delete or not
        */
        remove: function(id) {
            return delete store[id];
        },

        /**
         * Clear the current timer
         *
         * @method clear
        */
        clear: function() {
            store = {};
        }
    };
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
    ]

    Events : []

    Description:
        Provide a really basic dom manipulation plugin.
        This helps to use appstorm by itself without any jQuery or others.
        It really not the best, but it does work well, and already pretty 
        usefull!

************************************************************************ */


// From: http://www.codecouch.com/2012/05/adding-document-queryselectorall-support-to-ie-7/
// Adding 'uber basic' support of querySelectorAll for IE browsers
// Only if user does not make usage of any library like jQuery
if(document.all && ! ('querySelectorAll' in document) && !window.jQuery) {
    // IE7 support for querySelectorAll in 274 bytes. Supports multiple / grouped selectors and the attribute selector with a "for" attribute. http://www.codecouch.com/
    (function(d,s){d=document,s=d.createStyleSheet();d.querySelectorAll=function(r,c,i,j,a){a=d.all,c=[],r=r.replace(/\[for\b/gi,'[htmlFor').split(',');for(i=r.length;i--;){s.addRule(r[i],'k:v');for(j=a.length;j--;)a[j].currentStyle.k&&c.push(a[j]);s.removeRule(0)}return c}})()
}


/**
 * Provide a really basic dom manipulation plugin.
 * This helps to use appstorm by itself without any jQuery or others.
 * It really not the best, but it does work well, and already pretty 
 * usefull!
 *
 * @class dom
 * @static
 * @namespace a
*/
a.dom = {
    /**
     * USE ONLY IF YOU HAVE JQUERY, OR DONT CARE OLD BROWSER (IE 8 and +)
     * Use direct jquery or querySelectorAll to select items
     *
     * @method query
     *
     * @param check {String}                The string to search for
     * @param dom {DOMElement}              The dom to search inside
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
     * Embed a dom element into a.dom system
     *
     * @method el
     *
     * @param element {DOMElement}          A dom element to work with
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
     * Find element by id, or a list of ids (separator: ',', or an array)
     *
     * @method id
     *
     * @param id {String | Array}           The id(s) to search
     * @return {a.dom.children}             A chainable object
    */
    id: function(id) {
        return this.attr('id', id, document);
    },

    /**
     * Find elements by classname, or a list of classname
     * (separator: ',', or an array)
     *
     * @method cls
     *
     * @param clsname {String | Array}      The classname(s) to search
     *                                      (like 'active', 'container', ...)
     * @param dom {DOMElement | null}       The init dom to start searching
     *                                      from or null to use document
     * @return {a.dom.children}             A chainable object
    */
    cls: function(clsname, dom) {
        return this.attr('class', clsname, dom);
    },

    /**
     * Find elemnts by their tagname, or a list of tagname
     * (separator: ',', or an array)
     *
     * @method tag
     *
     * @param name {String | Array}         The tag(s) to search (input, a,...)
     * @param dom {DOMElement | null}       The init dom to start searching
     *                                      from, or null to use document
     * @return {a.dom.children}             A chainable object
    */
    tag: function(name, dom) {
        // Remove string from name
        dom = (a.isTrueObject(dom)) ? dom : document;

        var tagList = a.isString(name)
                        ? name.replace(/ /g,'').split(',')
                        : name,
            domList = [],
            i       = tagList.length;

        if(i > 1) {
            while(i--) {
                var chainElement = this.tag(tagList[i], dom),
                    elements  = chainElement.getElements();

                a.each(elements, function(element) {
                    if(!a.contains(domList, element)) {
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
     * Find elements by attribute name
     *
     * @method attr
     *
     * @param name {String | Array}         The attribute name to search
     * @param value {String | null}         The attribute value (can be empty)
     * @param dom {DOMElement}              The dom to start search from
     * @return {a.dom.children}             A chainable object
    */
    attr: function(name, value, dom) {
        /*
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
         * From a string or an array, get a string version
         *
         * @param str {String | Array}      Separate elements
         * @return {Array}                  The split version
        */
        function stringToArray(str) {
            return a.isString(str) ? str.replace(/ /g,'').split(',') : str;
        };

        /**
         * Append elements to parentList only if there are not already
         * inside collection.
         *
         * @param parentList {Array}        The arrays to append elements to
         * @param children {Array}          The list of elements to append
        */
        function appendList(parentList, children) {
            a.each(children, function(child) {
                if(!a.contains(parentList, child)) {
                    parentList.push(child);
                }
            });
        };

        /*
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
                var domList   = [];

                while(i--) {
                    var chainList   = this.attr(attributeList[i], value, dom),
                        elementList = chainList.getElements();
                    appendList(domList, elementList);
                }

                // Returning element parsed
                return new a.dom.children(domList);
            }
        }

        /*
         * -----------------------------------
         *   Recursive value search
         * -----------------------------------
        */

        // If value = array, or a string with ',', we do recursive search
        if(value && (a.isArray(value) || value.indexOf(',') > 0)) {
            var valueList = stringToArray(value),
                i         = valueList.length;

            // In case of multi value, we apply recursive search
            if(i > 1) {
                var domList   = [];

                while(i--) {
                    var chainList   = this.attr(name, valueList[i], dom),
                        elementList = chainList.getElements();
                    appendList(domList, elementList);
                }

                // Returning element parsed
                return new a.dom.children(domList);
            }
        }

        /*
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

            var search = isStringValue
                            ? '[' + name + '="' + value + '"]'
                            : '[' + name + ']';

            domList = dom.querySelectorAll(search);

        // Complex version, for older browser
        } else {
            var allList = dom.getElementsByTagName('*'),
                i       = allList.length;

            while(i--) {
                // Select element (faster)
                var el    = allList[i],
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





















/**
 * Unified event system for DOM element (to have always the same behavior
 * between all browser)
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

/**
 * Event prototype
*/
a.dom.event.prototype = {
    /**
     * Stop event propagation
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
     * Prevent default behavior
    */
    preventDefault: function() {
        var e = this.originalEvent;
        if(e.preventDefault) {
          e.preventDefault();
        }
        e.returnValue = false;
    }
}


/**
 * Generic function to use for converting event to appstorm event type
 *
 * @method eventBinder
 *
 * @param fn {Function}                     The function to encaps
 * @param scope {Object | null}             The scope to apply if possible
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
 * Abstract layer for binding event with DOM
*/
a.dom.eventListener = new function() {
    var store = [];

    // Add binder between true event and function catch
    function addListener(el, type, fn, scope) {
        var binder = new a.dom.eventBinder(fn, scope || null);
        store.push({
            el:   el,
            type: type,
            fn:   fn,
            bn:   binder
        });
        return binder;
    };

    // Destroy stored binder reference
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
    };

    // New browser
    function addEventListener(el, type, fn, scope) {
        el.addEventListener(type,    addListener(el, type, fn, scope), false);
    };
    function removeEventListener(el, type, fn) {
        el.removeEventListener(type, removeListener(el, type, fn), false);
    };

    // IE
    function attachEvent(el, type, fn, scope) {
        el.attachEvent('on' + type, addListener(el, type, fn, scope));
    };
    function detachEvent(el, type, fn) {
        el.detachEvent('on' + type, removeListener(el, type, fn));
    };

    // Old Browsers
    function rawBindEvent(el, type, fn, scope) {
        el['on' + type] = addListener(el, type, fn, scope);
    };
    function rawUnbindEvent(el, type, fn) {
        removeListener(el, type, fn);
        el['on' + type] = null;
    };



    if(a.isFunction(window.addEventListener)) {
        this.bind   = addEventListener;
        this.unbind = removeEventListener;
    } else if(a.isFunction(document.attachEvent)) {
        this.bind   = attachEvent;
        this.unbind = detachEvent;
    } else {
        this.bind   = rawBindEvent;
        this.unbind = rawUnbindEvent;
    }
};































/**
 * Handle recursive sub-search
 *
 * @param elementList {Array}               The list of elements to use
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
     * Perform a recursive task to select sub children using a.dom
     *
     * The first parameter must be the a.dom to use
     * Other parameters are parameter to pass to this function
     * The last parameter should be the dom to use for search
     *
     * @method _perform
     * @chainable
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
            /*
             * We add a null value at the end,
             * so argsLength is already length - 1
             * as we don't update it when pushing to args
            */
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
     * Get a single DOM element
     *
     * @method get
     *
     * @param index {Integer}               The index to retrieve
     * @return {DOMElement | null}          The dom element linked or null
     *                                      if not found
    */
    get: function(index) {
        return this.elementList[index] || null;
    },

    /**
     * Get the DOM elements stored
     *
     * @method getElements
     *
     * @return {Array}                      The element list stored
    */
    getElements: function() {
        return this.elementList;
    },

    /**
     * Select sub-id elements
     *
     * @method id
     * @chainable
     *
     * @param id {String}                   The id or list of ids to search
    */
    id: function(id) {
        return this._perform(a.dom.id, id);
    },

    /**
     * Select sub-class elements
     *
     * @method cls
     * @chainable
     *
     * @param clsname {String}              The class or list of classes to
     *                                      search
    */
    cls: function(clsname) {
        return this._perform(a.dom.cls, clsname);
    },

    /**
     * Get or set style for given elements
     *
     * @method css
     *
     * @param rule {String}                 The CSS rule we are working with
     * @param value {String}                The value to set (can be empty for
     *                                      get)
     * @return {String | null}              The CSS value found in case of get
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
                i           = elementList.length;

            while(i--) {
                var data = elementList[i].style[rule];
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
     * Add a class to elements
     *
     * @method addClass
     * @chainable
     *
     * @param classname {String}            The classname to append to every
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
     * Test if all elements got classname or not
     *
     * @method hasClass
     * @chainable
     *
     * @param classname {String}            The classname to test on every
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
     * Remove a class element
     *
     * @method removeClass
     * @chainable
     *
     * @param classname {String}            The classname to remove on every
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
     * toggle a class element
     *
     * @method toggleClass
     * @chainable
     *
     * @param classname {String}            The classname to toggle on every
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
     * @method bind
     * @chainable
     *
     * @param binding {String | Array}      The event/list to apply to
     * @param fct {Function}                The handler to receive event
     * @param scope {Object | null}         The scope to apply
    */
    bind: function(binding, fct, scope) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] == '') {
                continue;
            }
            this.each(function(evt) {
                a.dom.eventListener.bind(this, evt, fct, scope);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Unbind element event to given function (like click, submit...)
     *
     * @method unbind
     * @chainable
     *
     * @param binding {String | Array}      The event/list to remove
     * @param fct {Function}                The handler of event
    */
    unbind: function(binding, fct) {
        var bindList = a.isString(binding) ? binding.split(' ') : binding;
            i        = bindList.length;

        while(i--) {
            if(!bindList[i] || bindList[i] == '') {
                continue;
            }

            this.each(function(evt) {
                a.dom.eventListener.unbind(this, evt, fct);
            }, bindList[i].toLowerCase());
        }

        return this;
    },

    /**
     * Select sub-tag elements
     *
     * @method tag
     * @chainable
     *
     * @param name {String}                 The tag or list of tags to search
    */
    tag: function(name) {
        return this._perform(a.dom.tag, name);
    },

    /**
     * Select sub-attributes elements
     *
     * @method attr
     * @chainable
     *
     * @param attribute {String}            The attribute or list of
     *                                      attributes to search
     * @param value {String | null}         The value to use, can be empty
    */
    attr: function(attribute, value) {
        return this._perform(a.dom.attr, attribute, value);
    },

    /**
     * Append or get attribute
     *
     * @method attribute
     * @chainable
     *
     * @param attribute {String}            The attribute to set
     * @param value {String}                The value to get
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
     * Same as attribute, but for data- HTML5 tag
     *
     * @method data
     * @chainable
     *
     * @param attribute {String}            The attribute to set
     * @param value {String}                The value to get
    */
    data: function(attribute, value) {
        return this.attribute('data-' + attribute, value);
    },

    /**
     * Same as data or attribute, but multi tag check
     *
     * @method appstorm
     * @chainable
     *
     * @param attribute {String}            The attribute to set
     * @param value {String}                The value to get
    */
    appstorm: function(attribute, value) {
        // TODO: attribute does not handle ',' and array delimiter
        return this.attribute(
              'data-' + attribute
            + ',a-'   + attribute
            + ','     + attribute, value);
    },

    /**
     * Move to the parent element for every element stored
     *
     * @method parent
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
     * Select direct children of all stored elements
     *
     * @method children
     * @chainable
     *
     * @param types {Array | null}          The nodeTypes to keep (default: 3)
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
     * Select all sub elements
     *
     * @method all
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
     * Insert before selected element
     *
     * @method insertBefore
     * @chainable
     *
     * @param element {DOMElement}          The element to insert
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
     * Insert after selected element
     *
     * @method insertAfter
     * @chainable
     *
     * @param element {DOMElement}          The element to insert
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
     * Empty all elements stored
     *
     * @method empty
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
     * Remove element from content
     *
     * @method remove
     * @chainable
     *
     * @param element {DOMElement}          The element to remove
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
     * Append element to the existing content
     *
     * @method append
     * @chainable
     *
     * @param element {DOMElement}          The element to append
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
     * Replace the existing content with given element
     *
     * @method replace
     * @chainable
     *
     * @param element {DOMElement}          The element to append
    */
    replace: function(element) {
        this.empty();
        return this.append(element);
    },

    /**
     * Set inside the current elements the content, or get the current html
     *
     * @method html
     *
     * @param content {String | null}       The content to set, or nothing to
     *                                      get
     * @return {String | null}              The current content, or null
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
     * Apply on each elements the given function
     *
     * @method each
     * @chainable
     *
     * @param fct {Function}                The function to apply to elements
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
};;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/mem.js
    ]

    Events : [
        a.hash {
            value: The new hash value
            old:   The previous hash value
        }
    ]

    Description:
        Manipulate page hash, be able to retrieve also the list of hash
        previously used.

************************************************************************ */


/**
 * Manipulate page hash, be able to retrieve also the list of hash previously
 * used.
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:page">here</a>
 *
 * @class hash
 * @static
 * @namespace a
*/
a.hash = new function() {
    var previousHash  = null,
        traceHashList = [],
        that          = this,
        store         = a.mem.getInstance('app.hash');

    // The traceHashList is linked to store
    store.set('history', traceHashList);

    /**
     * Retrieve the current system hash
     *
     * @method getCurrentPageHash
     * @private
     *
     * @return {String | null}              The hash, or null if nothing is set
     */
    function getCurrentPageHash() {
        var h = window.location.hash;
        return h ? h.substring(1) : null;
    };


    /**
     * Store the latest event appearing into a store
     *
     * @method registerNewHash
     * @private
     *
      @param hash {String}                  The new hash incoming
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
    };

    /**
     * Check for existing hash, call the callback if there is any change
     *
     * @method checkAndComputeHashChange
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
    };

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
     * @method fake
     *
     * @param currentHash {String}          The hash to fake
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
     * Retrieve the current system hash
     *
     * @method getHash
     *
     * @return {String | null}          The hash, or null if nothing is set
     */
    this.getHash = function() {
        return getCurrentPageHash();
    };

    /**
     * Retrieve the current system hash (getHash alias)
     *
     * @method get
     *
     * @return {String | null}         The hash, or null if nothing is set
    */
    this.get = function() {
        return getCurrentPageHash();
    };

    /**
     * Get the previous page hash (can be null)
     *
     * @method getPreviousHash
     *
     * @return {String | null}          The hash, or null if nothing is set
    */
    this.getPreviousHash = function() {
        return previousHash;
    };

    /**
     * Force the system to set a specific hash
     *
     * @method setPreviousHash
     *
     * @param value {String}            The hash to set
     */
    this.setPreviousHash = function(value) {
        previousHash = value;
        store.set('previous', previousHash);
    };

    /**
     * Get list of existing previous hash used into system
     *
     * @method trace
     *
     * @return {Array}                  An array with all hash
     *                                  done since beginning
    */
    this.trace = function() {
        return traceHashList;
    };
};

// Erasing previous a.hash and add event system to it
a.hash = a.extend(a.hash, new a.eventEmitter('a.hash'));;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/parser.js
        core/message.js
    ]

    Events : [
        a.ajax : {
            success : boolean (true fine, false error)
            status : http code result
            url : the url used (before data join)
            method : the method used
            params : the parameters used for request
        }
    ]

    Description:
        Send a request to server side

************************************************************************ */



(function(a) {
    /**
     * Ajax cache object, used to store cached request and retrieve it if possible
     *
     * @class ajaxCache
     * @namespace a
     * @private
    */
    var ajaxCache = {
        /**
         * Add a new cached ajax elemen
         *
         * @method add
         *
         * @param method {String}               GET/POST/PUT/DELETE/...
         * @param url {String}                  The url to catch
         * @param results {Object}              The related result
         * @param timeout {Integer}             The timeout (in ms)
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
         * Get a previously cached element
         *
         * @method get
         *
         * @param method {String}               GET/POST/PUT/DELETE/...
         * @param url {String}                  The url to catch
         * @return {Object | null}              Return the previously stored
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
     * @method getOrCreateModel
     * @private
     *
     * @param name {String}                 The model name to search instance
     * @param primaries {Array}             List of primary key inside the
     *                                      model
     * @param content {Object}              The content of current model
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
            search['modelName'] = name;

            var found = a.model.pooler.searchInstance(search);

            if(found.length > 0) {
                return found[0];
            } else {
                return a.model.pooler.createInstance(name);
            }
        }
    };

    /**
     * Ajax object to call server
     *
     * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:ajax">here</a>
     *
     * @class ajax
     * @namespace a
     * @constructor
     * @async
     *
     * @param options {Object}                  An option map to change
     *                                          the behaviour of component
     * @param success {Function}                The success function called
     *                                          in case of async
     * @param error {Function}                  The error function called in
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
            for(var i=0, l=options.template.length; i<l; ++i) {
                var tmpl = a.getTemplateAjaxOptions(options.template[i]);
                if(a.isTrueObject(tmpl)) {
                    templates.push(tmpl);
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
        if(a.environment.get('cache') === true) {
            this.params.cache = true;
        }

        // Binding options
        for(var p in this.params) {
            if(p === 'data' || p === 'header') {
                continue;
            }

            // We check given options are same type (from specific request)
            for(var i=0, l=templates.length; i<l; ++i) {
                var tmpl = templates[i];
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
        for(var i=0, l=templates.length; i<l; ++i) {
            var tmpl = templates[i];

            if(a.isTrueObject(tmpl.data)) {
                for(var d in tmpl.data) {
                    this.params.data[d] = tmpl.data[d];
                }
            }

            if(a.isTrueObject(tmpl.header)) {
                for(var h in tmpl.header) {
                    this.params.header[h] = tmpl.header[h];
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
            for(var i=0, l=msxml.length; i<l; ++i) {
                try {
                    this.request = new ActiveXObject(msxml[i]);
                } catch(e) {}
            }
        }
    };

    /**
     * Parse the data to return the formated object (if needed)
     *
     * @method parseResult
     *
     * @param params {Object}                   The parameter list from
     *                                          configuration ajax
     * @param http {Object}                     The xmlHttpRequest started
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
        if(params['model']) {
            var modelName = params['model'],
                errorStr = 'a.ajax: Model ' + modelName +
                            ' not found, empty object recieve from pooler';

            // We get primary elements from model
            var primaries = a.model.pooler.getPrimary(modelName);

            // Model not found
            if(primaries === null) {
                a.console.error(errorStr, 1);

            // No primaries into the model, we create new model
            } else if(params['many'] === true && a.isArray(result)) {
                var content = [];
                for(var i=0, l=result.length; i<l; ++i) {
                    var data = result[i],
                        model = getOrCreateModel(modelName, primaries,
                                                            data);
                    if(model !== null) {
                        model.fromObject(data);
                        content.push(model);
                    } else {
                        a.console.error(errorStr, 1);
                    }
                }
                // We replace
                result = content;
            } else {
                var model = getOrCreateModel(modelName, primaries, result);

                // This test is probably not neeeded, but, who knows,
                // maybe one day it will raise to power and conquer
                // the world.
                if(model) {
                    model.fromObject(result);
                    result = model;
                } else {
                    a.console.error(errorStr, 1);
                }
            }
        }

        // After to use/parse on object
        if('after' in params) {
            for(var i=0, l=params.after.length; i<l; ++i) {
                var fct = a.getAjaxAfter(params.after[i]);
                if(a.isFunction(fct)) {
                    result = fct.call(this, params, result);
                }
            }
        }

        // We cache if needed
        if('store' in params && params['store']) {
            var store = params['store'],
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
                multiplier * parseInt(params['store'], 10));
        }

        return result;
    };

    /**
     * Manually abort the request
     *
     * @method abort
    */
    a.ajax.prototype.abort = function() {
        try {
            this.request.abort();
        } catch(e) {}
    };

    /**
     * Send the ajax request
     *
     * @method send
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
        if(a.isArray(this.params['before'])) {
            var befores = this.params['before'];
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
                this.params.data['cachedisable'] = rnd;
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
                    var great = (status >= 200 && status < 400);
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

})(window.appstorm);;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js
        core/timer.js
        core/environment.js
        core/ajax.js
    ]

    Events : []

    Description:
        Dynamic loader for many files type

************************************************************************ */


/**
 * Dynamic loader for many files type
 *
 * Examples: <a href='http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:loader'>here</a>
 *
 * @class loader
 * @static
 * @namespace a
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
     * Check the cache, and launch callback if uri is already listed in cache
     *
     * @method checkInternalCache
     * @private
     * @async
     *
     * @param uri {String}                  The path to access data
     * @param callback {Function | null}    The callback to apply after loader
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
    };

    /**
     * Insert into cache if needed the uri
     *
     * @method populateInternalCache
     * @private
     *
     * @param uri {String}                  The path to access data
     * @param args {Object}                 The arguments to check if cache
     *                                      is specified and policy to use
    */
    function populateInternalCache(uri, args) {
        // By default, we cache
        if(!a.isNone(args) && args.cache === false) {
            return;
        }
        internalCache.push(uri);
    };

    /**
     * Append to header the given tag, used by JS and CSS loader especially
     *
     * @method appendElementToHeader
     * @private
     * @async
     *
     * @param el {DOM}                      A createElement type result
     * @param options {Object}              HTML Options to add to link
     *                                      appended
     * @param callback {Function | null}    The callback to apply after loader
     * @param uri {String}                  The path to access data
     * @param args {Object | null}          The arguments to check if cache
     *                                      is specified and policy to use
     * @param error {Function | null}       The callback to raise in case
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
                if (this.readyState == 'complete'
                        || this.readyState == 'loaded') {
                    cb();
                }
            };
        } else {
            el.onload = cb;
        }

        /*
         * Hack for old Firefox/webkit browsers
         * (who does not have onload on link elements)
         *
         * Note : using 'onload' in document.createElement('link')
         * is not always enough
         *
         * By default, too many browser got this bug, so we always activate it
        */
        if(options.type === 'text/css') {
            var currentCSS = document.styleSheets.length;
            nCSS++;
            var cssLoad = a.timer.add(
                function() {
                    if (document.styleSheets.length > (currentCSS + nCSS-1)) {
                        nCSS--;
                        a.timer.remove(cssLoad);
                        cb();
                    }   
                }
            , null, 50);
        }

        // Inserting document into header
        document.getElementsByTagName('head')[0].appendChild(el);
    };

    /**
     * load some data threw AJAX
     *
     * @method performAjaxLoading
     * @private
     * @async
     *
     * @param uri {String}                  The data path
     * @param callback {Function | null}    The callback to apply in
     *                                      case of success
     * @param args {Object | null}          An ajax argument object,
     *                                      not all of them are used
     *                                      (some are automatically generated
     *                                      and cannot be changed)
     * @param error {Function | null}       The callback to apply
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

        a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
        if(!a.isNone(args)) {
            if(a.contains(htmlMethods, args.method) ) {
                options.method = args.method;
            }
            if(!a.isNone(args.type)
                && (args.type == 'json' || args.type == 'xml') ) {
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
    };

    return {
        /**
         * Javascript loader
         *
         * @method js
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
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
         * JSONP loader
         *
         * @method jsonp
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        jsonp: function(uri, callback, args, error){
            var type = (a.isTrueObject(args) && args.type) ? args.type
                        : 'text/javascript';
            a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
            appendElementToHeader(document.createElement('script'), {
                    type : type,
                    src : uri
                }, callback, uri, args, error
            );
        },

        /**
         * JSON loader
         *
         * @method json
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
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
            args.header['accept'] = 'application/json, text/javascript';

            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * XML loader
         *
         * @method xml
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
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
            args.header['accept'] = 'application/xml, text/xml';

            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * CSS loader
         *
         * @method css
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
         *                                   not all of them are used
         *                                   (some are automatically generated
         *                                   and cannot be changed)
        */
        css: function(uri, callback, args, error) {
            if(checkInternalCache(uri, callback)) {
                return;
            }

            a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
            appendElementToHeader(document.createElement('link'), {
                    rel  : 'stylesheet',
                    type : 'text/css',
                    href : uri
                }, callback, uri, args, error
            );
        },

        /**
         * HTML loader
         * NOTE : only valid XHTML is accepted !
         *
         * @method html
         * @async
         *
         * @param uri {String}               The path to access content
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An ajax argument object,
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
            if(a.environment.get('debug') === true) {
                args.cache = false;
            }

            // Setting the accepted return type
            if(!a.isTrueObject(args.header)) {
                args.header = {};
            }
            args.header['accept'] = 'text/html';
            performAjaxLoading(uri, callback, args, error);
        },

        /**
         * JavaFX loader
         *
         * @method javafx
         * @async
         *
         * @param uri {String}               The path for given jar files to
         *                                   load
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An object to set property for
         *                                   javaFX (like javascript name...),
         *                                   we need : args.code (the main to
         *                                   start), args.id (the id of
         *                                   project). args.width and height
         *                                   are optional
        */
        javafx: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.code) || a.isNone(args.id)) {
                var error =  'a.loader.javafx: the system need args.code ';
                    error += 'and args.name setted to be able to load any ';
                    error += 'javafx resource... This uri will not be ';
                    error += 'loaded: ' + uri;
                a.console.warn(error, 3);
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
         * Flash loader
         *
         * @method flash
         * @async
         *
         * @param uri {String}               The path for given swf files to
         *                                   load
         * @param callback {Function | null} The callback to call after
         *                                   loading success
         * @param args {Object}              An object to set property for
         *                                   Flash
        */
        flash: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var error =  'a.loader.flash: the system need args ';
                    error += 'parameters: rootId, id, setted to be able ';
                    error += 'to load any flash resource... This uri ';
                    error += 'will not be loaded: ' + uri;
                a.console.warn(error, 3);
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
         * Silverlight loader
         *
         * @method silverlight
         * @async
         *
         * @param uri {String}               The path for given xap files to
         *                                   load
         * @param callback {Function | null} The callback to call after
         *                                   loading success (NOTE: silverlight
         *                                   is not able to fire load event,
         *                                   so it's not true here...)
         * @param args {Object}              An object to set property for
         *                                   Silverlight
        */
        silverlight: function(uri, callback, args, error) {
            if(a.isNone(args) || a.isNone(args.rootId) || a.isNone(args.id)) {
                var error =  'a.loader.silverlight: the system need args ';
                    error += 'parameters: rootId, id, setted to be able ';
                    error += 'to load any silverlight resource... This uri ';
                    error += 'will not be loaded: ' + uri;
                a.console.warn(error, 3);
                return;
            }

            if(checkInternalCache(uri, callback)) {
                return;
            }

            a.console.log('a.loader: load resource (url: ' + uri + ')', 3);
            var obj  = document.createElement('object');
            obj.id   = args.id;
            obj.data = 'data:application/x-silverlight-2,'
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
                if(max-- > 0
                    && !a.isNone(document.getElementById(args.id).Content)) {

                    a.timer.remove(timer);
                    callback();
                } else if(max <= 0 && a.isFunction(error)) {
                    error(uri, 408);
                }
            }, null, 200);
        },

        /**
         * Get the cache trace loaded
         *
         * @method trace
         *
         * @return {Array} The cache trace
        */
        trace: function() {
            return internalCache;
        }
    };
}());;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/hash.js
        core/mem.js
    ]

    Events : []

    Description:
        Manage action related to hash change.

************************************************************************ */


/**
 * Manage action related to hash change.
 *
 * @class route
 * @static
 * @namespace a
*/
a.route = new function() {
    var mem = a.mem.getInstance('app.route');

    /**
     * Parse the action parameter.
     *
     * @method getAction
     * @private
     *
     * @param action {String}               The action to filter
     * @return {String}                     'leave' or 'enter' depending on
     *                                      what is found in action parameter
    */
    function getAction(action) {
        return (action == 'leave' || action == 'leaving') ? 'leave' : 'enter';
    };

    /**
     * bind a function to a hash.
     *
     * @method bind
     * @chainable
     *
     * @param hash {String}                 The hash to register
     * @param fct {Function}                The function to bind
     * @param action {String | null}        The action element, if we use this
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
     * @param unbind
     * @chainable
     *
     * @param hash {String}                 The hash to remove function from
     * @param fct {Function}                The function to unbind
     * @param action {String | null}        The action element, if we use this
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
     * @method otherwise
     * @chainable
     *
     * @param fct {Function}                The function to use when otherwise
     *                                      is meet
     * @param action {String | null}        The action element, if we use this
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
     * @method go
     *
     * @param hash {String}                 The hashtag to navigate to
     * @param parameters {Object}           Any parameters to give to state
     *                                      system as temp data. This is an
     *                                      equivalent to a.state.inject func.
    */
    this.go = function(hash, parameters) {
        if(parameters) {
            a.state.inject(parameters);
        }
        if(hash) {
            /*if( ('history' in window) && history.pushState ) {
                window.history.pushState(parameters || {}, null, '#' + hash);
            } else {*/
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
     * @param hash {String}                 The hashtag to navigate to
     * @param parameters {Object}           Any parameters to give to state
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
     * Allow to go back one time into history 
    */
    this.back = function() {
        window.history.back();
    };

    /**
     * Apply change to hash on enter or leave position.
     *
     * @method callApplyHashChange
     * @private
     *
     * @param hash {String}                 The hash to load/unload
     * @param leaveOrEnterString {String}   The enter/leave state
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
    };

    // We bind the hash event system
    a.hash.bind('change', function(data) {
        callApplyHashChange(data.value, 'enter');
        callApplyHashChange(data.old,   'leave');
    }, null, false, false);
};
;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
    ]

    Events : []

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
 * @class parameter
 * @static
 * @namespace a
*/
a.parameter = {
    /**
     * Store cached function to use as replacement method.
     * @property _fct
     * @type Object
     * @default {}
    */
    _fct: {},

    /**
     * From a given string, we extract parameter inside.
     *
     * @method extract
     *
     * @param input {String}                The string to extract param from
     * @param customRegex {RegExp | null}   A new regex to replace current one
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
                start: match['index']
            });
        }

        // We return that content
        return extractedParameters;
    },

    /**
     * Replace a parameter at a specific position.
     *
     * @method replace
     *
     * @param input {String}                The string to use as replacement
     * @param param {Object}                An extracted parameter from
     *                                      extract function
     * @param custom {String | null}        A custom string to add to system
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
     * @method convert
     *
     * @param input {String}                The string to convert
     * @param customRegex {RegExp | null}   A custom regex if needed
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
     * @method getValues
     *
     * @param input {String}                The input value to extract data
     *                                      from
     * @param internal {String}             The original string regex
     * @param extract {Object}              The extracted object
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
     * @method extrapolate
     *
     * @param input {String}                The string to replace parameters
     *                                      inside
     * @param hash {String}                 The current string, to extract
     *                                      parameters from.
     * @param internal {String}             The hashtag stored internally
     *                                      (with parameters)
     * @param escape {Boolean | null}       Indicate if system should escape
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
        if (a.isString(input) && input
                && input.indexOf('{{') >= 0 && input.indexOf('}}') >= 0) {

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
                    paramInternal[i]['value'] = match[i+1];
                }

                // We copy value from paramInternal to paramStr
                // everytime we found a name match
                for(var j=0, k=paramStr.length; j<k; ++j) {
                    for(i=0; i<l; ++i) {
                        // The paramStr is wrongly separate into
                        // hash: name (so regex is param name, and name type)
                        if(paramInternal[i].name === paramStr[j].regex
                                && paramStr[j].name === 'hash') {
                            paramStr[j]['value'] = paramInternal[i]['value'];
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
                if( (param.name === 'hash' || param.name === 'hashtag')
                    && !a.isNone(param.value)) {

                    found = true;
                    input = this.replace(input, param, param['value']);
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
     * @method addParameterType
     *
     * @param name {String}                 The parameter type (like 'memory')
     * @param fct {Function}                The function to apply when this
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
     * @method removeParameterType
     *
     * @param name {String}                 The function name to remove
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
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/mem.js
    ]

    Events : []

    Description:
        Provide a simple ACL rules checker to create different application
        behavior regarding user role

************************************************************************ */


/**
 * Provide a simple ACL rules checker to create different application
 * behavior regarding user role
 *
 * @class acl
 * @static
 * @namespace a
*/
a.acl = a.extend(new function() {
    var mem = a.mem.getInstance('app.acl');

    /**
     * Set the current user role
     *
     * @method setCurrentRole
     *
     * @param role {String}                 The role to set as 'current' one
    */
    this.setCurrentRole = function(role) {
        mem.set('current', role);
        this.dispatch('change', role);
        a.message.dispatch('a.acl.change', role);
    };

    /**
     * Get the current user role stored
     *
     * @method getCurrentRole
     *
     * @return {String}                     The role found, or an empty
     *                                      string if nothing has been found
    */
    this.getCurrentRole = function() {
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
     * @method setRoleList
     *
     * @param roleList {Array}              The role list to store
    */
    this.setRoleList = function(roleList) {
        if(a.isArray(roleList)) {
            mem.set('list', roleList);

            // We create related Handlebars helpers for every role
            // Like you get a role 'adMin', it will create 'isAdMin' helper
            a.each(roleList, function(role) {
                var helper = a.firstLetterUppercase(role, 'is'),
                    lower  = role.toLowerCase();

                Handlebars.registerHelper(helper, function(value, options) {
                    if(a.trim(value.toLowerCase()) === a.trim(lower)) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });
            });
        }
    };

    /**
     * Get the current role list
     *
     * @method getRoleList
     *
     * @return {Array | null}               The current role list stored, or
     *                                      null if nothing is found
    */
    this.getRoleList = function() {
        return mem.get('list');
    };

    /**
     * Check if current role is allowed compare to given minimum role
     *
     * @method isAllowed
     *
     * @param minimumRole {String}          The minimum role to check
     * @param currentRole {String | null}   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The allowed (true) or refused
     *                                      (false) state
    */
    this.isAllowed = function(minimumRole, currentRole) {
        currentRole = currentRole || this.getCurrentRole();

        var positionCurrentRole = -1,
            positionMinimumRole = -1,
            roleList = this.getRoleList() || [],
            position = roleList.length;

        // Search position in current role list
        while(position--) {
            if(roleList[position]  == minimumRole) {
                positionMinimumRole = position;
            }

            if(roleList[position]  == currentRole) {
                positionCurrentRole = position;
            }

            // Stop before if possible
            if(positionMinimumRole != -1 && positionCurrentRole != -1) {
                break;
            }
        }

        return (positionCurrentRole >= positionMinimumRole);
    };

    /**
     * Check if current role is refused compare to given minimum role
     *
     * @method isRefused
     *
     * @param minimumRole {String}          The minimum role to check
     * @param currentRole {String | null}   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The refused (true) or allowed
     *                                      (false) state
    */
    this.isRefused = function(minimumRole, currentRole) {
        return !this.isAllowed(minimumRole, currentRole);
    };

    /**
     * Clear the full ACL rules
     *
     * @method clear
    */
    this.clear = function() {
        mem.clear();
    };

}, new a.eventEmitter('a.acl'));



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Allow to check role is allowed or not
    Handlebars.registerHelper('isAllowed', function(minimumRole, currentRole,
                                                                    options) {
        // We allow 2 or 3 parameters mode !
        options = a.isString(currentRole) ? options : currentRole;
        currentRole = a.isString(currentRole) ? currentRole :
                                                    a.acl.getCurrentRole();

        // We check role is allowed or not
        if(a.acl.isAllowed(minimumRole, currentRole)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    // Allow to check role is refused or not
    Handlebars.registerHelper('isRefused', function(minimumRole, currentRole,
                                                                    options) {
        // We allow 2 or 3 parameters mode !
        options = a.isString(currentRole) ? options : currentRole;
        currentRole = a.isString(currentRole) ? currentRole :
                                                    a.acl.getCurrentRole();

        // We check role is allowed or not
        if(a.acl.isAllowed(minimumRole, currentRole)) {
            options.inverse(this);
        }
        return options.fn(this);
    });
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/parameter.js
    ]

    Events : []

    Description:
        The object is faking a server behavior to skip server creation during
        client creation. It provide a simple emulation of server side.

************************************************************************ */

/**
 * The object is faking a server behavior to skip server creation during
 * client creation. It provide a simple emulation of server side.
 *
 * @class mock
 * @static
 * @namespace a
*/
a.mock = {
    /**
     * Store the existing mock to use with application
     *
     * @property _mock
     * @type Array
     * @default []
    */
    _mock: [],

    /**
     * Rollback to default content (nothing)
     *
     * @method clear
    */
    clear: function() {
        a.mock._mock = [];
    },

    /**
     * Add a new mock to system
     *
     * @method add
     *
     * @param method {String}               The HTTP method (GET/POST/PUT/...)
     * @param url {String}                  The url to catch
     * @param result {Object | Function}    The attempted result
     * @param model {String | null}         The model linked to the answer. Use
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
     * @method get
     *
     * @param method {String}               The HTTP method (GET/POST/PUT/...)
     * @param url {String}                  The url to catch
     * @return {Object | null}              The result associated to mock
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
     * object containing ALL properties found)
     *
     * @method merge
     *
     * @param model {String}                The model name to search
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
            var mock = mocks[i];

            if(mock.model) {
                // Single model
                if(mock.model === model) {
                    var part = a.isFunction(mock.result) ? mock.result() :
                                                                mock.result;
                    result = a.assign(result, part);

                // Multiple model
                } else if(mock.model === model + 's') {
                    var part = a.isFunction(mock.result) ? mock.result() :
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
     * @method map
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
};;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/mem.js
        core/console.js

        ** Mousetrap IS NEEDED AND IS EXTERNAL LIBRARY **
    ]

    Events : []

    Description:
        Simple wrapper for Mousetrap to have unified interface with
        AppStorm.JS system: it does provide multi binding for one key
        (compare to MouseTrap which only allow one key = one function)

************************************************************************ */

/**
 * Simple wrapper for Mousetrap to have unified
 * interface with other AppStorm.JS system
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:keyboard">here</a>
 *
 * @class keyboard
 * @static
 * @namespace a
*/
a.keyboard = (function(mt) {
    'use strict';

    var mem = a.mem.getInstance('app.accelerator');

    /**
     * Remove all existing event binded to keyboard
     *
     * @method clearAllKeyboardEvents
     * @private
    */
    function clearAllKeyboardEvents() {
        mem.clear();
        mt.reset();
    };

    /**
     * Start to watch a key
     *
     * @method generateKeyBinding
     * @private
     *
     * @param key {String}              The key to bind (with type)
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
    };

    // No mousetrap support, create dummy empty object
    if(a.isNone(mt)) {
        a.console.error('a.keyboard: error, Mousetrap is undefined!', 1);
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
             * Register a function for a given keypress command
             *
             * @method bind
             *
             * @param key {String}           The key/keylist to bind
             * @param fn {Function}          The function to bind
             * @param scope {Object | null}  The scope to apply when binding
             * @param type {String | null}   The type like 'keydown', 'keyup'..
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
                if(bindArray.length == 1) {
                    var globalCatcher = generateKeyBinding(finalKey);
                    mt.bind(key, globalCatcher, type);
                }
            },

            /**
             * Remove a binding for a given key
             *
             * @method unbind
             *
             * @param key {String}          The key/keylist to unbind
             * @param fn {Function}         The function to unbind
             * @param type {String | null}   The type like 'keydown', 'keyup'..
             *                               default: keypress
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
                    if(bindArray.length == 0) {
                        mem.remove(finalKey);
                        mt.unbind(key, type);
                    }
                }
            },

            /**
             * Fake a keyboard key press
             *
             * @method trigger
             *
             * @param keys {String | Array} The list of keys/single key to
             *                              trigger
             * @param action {String}       The action (like keypress, keyup)
            */
            trigger: function(keys, action) {
                mt.trigger(keys, action);
            },

            /**
             * Reset all bindings
             *
             * @method reset
            */
            reset: clearAllKeyboardEvents,

            /**
             * Reset all bindings
             *
             * @method clear
            */
            clear: clearAllKeyboardEvents
        };
    }
}(window.Mousetrap));;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/message.js
        core/console.js
    ]

    Events : [
        synchronizer : {
            a.callback.synchronizer.success,
            a.callback.synchronizer.error
        },
        chainer : {
            a.callback.chainer.success
            a.callback.chainer.error
        }
    ]

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
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:callback">here</a>
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
        if(this.parrallelCount == 0 && this.running) {
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
 * Load many functions one by one, when last one finish raise the final callback
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:callback">here</a>
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
;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/console.js
        core/parser.js
        core/message.js
        core/loader.js
    ]

    Events : [
        a.storage.add : {key : the key, value : the value}
        a.storage.remove : {key : the key}
        a.storage.temporary.change : {engine : the engine choosed by system}
        a.storage.persistent.change : {engine : the engine choosed by system}
    ]

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
 * access to everything
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class storage
 * @static
 * @namespace a
*/
a.storage = {
    /**
     * Debug on console the get item action
     *
     * @method debugGet
     * @private
     *
     * @param element {String}              The element (like cookie,
     *                                      localStorage, ...)
     * @param key {String}                  The key to debug
     * @param value {Mixed}                 The value to dump
    */
    debugGet: function(element, key, value) {
        if(key !== '_support_t') {
            a.console.log('a.storage.type.' + element + 
              '.get: get element (key: ' + key + ', value: ' + value + ')', 3);
        }
    },

    /**
     * Debug on console the get item error action
     *
     * @method printError
     * @private
     *
     * @param element {String}              The element (like cookie,
     *                                      localStorage, ...)
     * @param key {String}                  The key to debug
    */
    printError: function(element, key) {
        if(key !== '_support_t') {
            a.console.log('a.storage.type.' + element +
                '.get: unable to find key (' + key + ') in store', 3);
        }
    },

    /**
     * Debug on console the set item action
     *
     * @method debugSet
     * @private
     *
     * @param element {String}              The element (like cookie,
     *                                      localStorage, ...)
     * @param key {String}                  The key to debug
     * @param value {Mixed}                 The value to dump
    */
    debugSet: function(element, key, value) {
        if(key !== '_support_t') {
            a.console.log('a.storage.type.' + element +
              '.set: add element (key: ' + key + ', value: ' + value + ')', 3);
        }
    },

    /**
     * Debug on console the remove item action
     *
     * @method debugRemove
     * @private
     *
     * @param element {String}              The element (like cookie,
     *                                      localStorage, ...)
     * @param key {String}                  The key to debug
    */
    debugRemove: function(element, key) {
        if(key !== '_support_t') {
            a.console.log('a.storage.type.' + element + 
                '.remove: remove element (key: ' + key + ')', 3);
        }
    },

    // Access to individual storage
    type: {}
};



/**
 * Cookie functionnality, manipulate cookie with a simplified interface
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class cookie
 * @static
 * @namespace a.storage.type
*/
a.storage.type.cookie = new function() {
    // Temporary desactivate event while making test
    var active = false;

    /**
     * @property support
     * @type Boolean
     * @default false
    */
    this.support = false;

    /**
     * @property engine
     * @type String
     * @default cookie
     * @final
    */
    this.engine = 'cookie';

    /**
     * Set a new cookie, or delete a cookie using a too old expires
     *
     * @method set
     *
     * @param name {String}                 The key to use
     * @param value {Mixed}                 The value to store
     * @param days {Integer}                Number of days before expires
    */
    this.set = function(name, value, days) {
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
    };

    /**
     * Get the stored cookie, return null if something went wrong
     *
     * @method get
     *
     * @param name {String}                 The cookie name stored
     * @return {Mixed}                      Any data stored inside cookie
    */
    this.get = function(name) {
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
    };

    /**
     * Remove a previously stored cookie
     *
     * @method remove
     *
     * @param name {String}                 The cookie name to delete
    */
    this.remove = function(name) {
        a.storage.debugRemove('cookie', name);
        this.set(name, '', -1);
    };

    // Cookie
    // Testing the current
    var test = '_support_t';
    this.set(test, 'o');

    // Test system is working
    if(this.get(test) == 'o') {
        this.remove(test);
        this.support = true;
    }

    // Activate event
    active = true;
};


/**
 * Cookie functionnality, manipulate cookie with a simplified interface
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class cookie
 * @static
 * @namespace a.storage
*/
a.storage.cookie = a.storage.type.cookie;





/**
 * LocalStorage HTML5 support
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class localStorage
 * @static
 * @namespace a.storage.type
*/
a.storage.type.localStorage = new function() {
    var support = false,
        idTest  = '_support_t',
        store   = 'localStorage';

    // Test support (if you use localStorageShim
    // this should work for most of browsers (including old IE) !)
    if(store in window && window[store] != null) {
        // localStorage may have no space left, making everything crash
        try {
            // Testing database work or not
            window.localStorage.setItem(idTest, 'o');

            // Test system is working
            if(window.localStorage.getItem(idTest) == 'o') {
                window.localStorage.removeItem(idTest);
                support = true;
            }
        } catch(e) {
            support = false;
        }
    }

    /**
     * @property support
     * @type Boolean
     * @default false
    */
    this.support = support;

    /**
     * @property engine
     * @type String
     * @default localStorage
     * @final
    */
    this.engine  = store;

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        if(support) {
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
    };

    /**
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        if(support) {
            a.storage.debugSet(this.engine, key, value);
            window.localStorage.setItem(key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String}                  The key to remove
    */
    this.remove = function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            window.localStorage.removeItem(key);
        }
    };
};



/**
 * globalStorage HTML5 support (old)
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class globalStorage
 * @static
 * @namespace a.storage.type
*/
a.storage.type.globalStorage = new function() {
    var support  = false,
        idTest   = '_support_t',
        hostname = window.location.hostname;

    if(!a.isNone(window.globalStorage)) {
        // In case of space not left, we can have crash
        try {
            window.globalStorage[hostname].setItem(idTest, 'o');

            // Test system is working
            if(window.globalStorage[hostname].getItem(idTest) == 'o') {
                window.globalStorage[hostname].removeItem(idTest);
                support = true;
            }
        } catch(e) {
            support = false;
        }
    }

    /**
     * @property support
     * @type Boolean
     * @default false
    */
    this.support = support;

    /**
     * @property engine
     * @type String
     * @default globalStorage
     * @final
    */
    this.engine = 'globalStorage';

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        if(support) {
            var item = window.globalStorage[hostname].getItem(key);
            // On some system, item will be an object with
            // "value" and "secure" property
            if(a.isTrueObject(item) && !a.isNone(item.value)) {
                var value = a.parser.json.parse(item.value);
                a.storage.debugGet(this.engine, key, value);
                return value;
            } else if(!a.isNone(item)) {
                var value = a.parser.json.parse(item);
                a.storage.debugGet(this.engine, key, value);
                return value;
            } else {
                a.storage.printError(this.engine, key);
                return null;
            }
        }
        return null;
    };

    /**
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        if(support) {
            a.storage.debugSet(this.engine, key, value);
            window.globalStorage[hostname].setItem(key,
                                        a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String}                  The key to remove
    */
    this.remove = function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            window.globalStorage[hostname].removeItem(key);
        }
    };
};



/**
 * memory object (so if page close, everything is lost)
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class memory
 * @static
 * @namespace a.storage.type
*/
a.storage.type.memory = new function() {
    var store = a.mem.getInstance('app.storage');

    /**
     * @property support
     * @type Boolean
     * @default true
    */
    this.support = true;

    /**
     * @property engine
     * @type String
     * @default memory
     * @final
    */
    this.engine = 'memory';

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = store.get;

    /**
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = store.set;

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String}                  The key to remove
    */
    this.remove = store.remove;
};


/**
 * Memory store functionnality, manipulate memory storage class with a simplified interface
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class memory
 * @static
 * @namespace a.storage
*/
a.storage.memory = a.storage.type.memory;





/**
 * sessionStorage HTML5 support
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class sessionStorage
 * @static
 * @namespace a.storage.type
*/
a.storage.type.sessionStorage = new function() {
    var support = false,
        idTest  = '_support_t',
        ss      = 'sessionStorage';


    // Test support
    if(ss in window && !a.isNone(window[ss])) {
        try {
            // Testing database work or not
            window.sessionStorage.setItem(idTest, 'o');

            // Test system is working
            if(window.sessionStorage.getItem(idTest) == 'o') {
                window.sessionStorage.removeItem(idTest);
                support = true;
            }
        } catch(e) {
            support = false;
        }
    }

    /**
     * @property support
     * @type Boolean
     * @default false
    */
    this.support = support;

    /**
     * @property engine
     * @type String
     * @default sessionStorage
     * @final
    */
    this.engine = ss;

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        if(support) {
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
    };

    /**
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        if(support) {
            a.storage.debugSet(this.engine, key, value);
            window.sessionStorage.setItem(key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String}                  The key to remove
    */
    this.remove = function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            window.sessionStorage.removeItem(key);
        }
    };
};




/**
 * userData IE support (old)
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class userData
 * @static
 * @namespace a.storage.type
*/
a.storage.type.userData = new function() {
    var support = false,
        idTest  = '_support_t',
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

                support = true;
            }
        } catch(e) {
            support = false;
        }
    }

    /**
     * @property support
     * @type Boolean
     * @default false
    */
    this.support = support;

    /**
     * @property engine
     * @type String
     * @default userData
     * @final
    */
    this.engine = 'userData';

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
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
    };

    /**
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        if(support) {
            a.storage.debugSet(this.engine, key, value);
            db.setAttribute(key, a.parser.json.stringify(value));
            db.save(dbName);
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String} The key to remove
    */
    this.remove = function(key) {
        if(support) {
            a.storage.debugRemove(this.engine, key);
            db.removeAttribute(key);
            db.save(dbName);
        }
    };
};



/**
 * flash external storage
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class flash
 * @static
 * @namespace a.storage.type
*/
a.storage.type.flash = new function() {
    var support = false,
        ready   = false,
        id      = 'flashstorage';

    /**
     * Start flash and check availability
     *
     * @method includeFlash
     * @private
     * @async
     *
     * @param callback {Function | null}    The callback function to call
     *                                      after loading
    */
    function includeFlash(callback) {
        if(support == false && ready == false) {
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

                if(el.testData() == true) {
                    support = true;
                    el.setDatabase('a_flashStorage');
                }
                if(support == true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support == true && a.isFunction(callback)) {
            callback(support);
        }
    };

    /**
     * Get the support state of flash.
     * Note: it may arrive little bit after using start function...
     *
     * @method support
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};

    /**
     * Get the ready state of flash object
     *
     * @method ready
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
     * @method start
     * @async
     *
     * @param callback {Function}           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeFlash(callback);
    };

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support == true) {
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
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support == true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).setData(key, value);
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String}                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support == true) {
            a.storage.debugRemove(this.engine, key);
            return document.getElementById(id).removeData(key);
        }
    };
};



/**
 * silverlight external storage
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class silverlight
 * @static
 * @namespace a.storage.type
*/
a.storage.type.silverlight = new function() {
    var support = false,
        ready   = false,
        id      = 'silverlightstorage';

    /**
     * Start silverlight and check availability
     *
     * @method includeSilverlight
     * @private
     * @async
     *
     * @param callback {Function | null}    The callback function to
     *                                      call after loading
    */
    function includeSilverlight(callback) {
        if(support == false && ready == false) {
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
                if(el.Content.store.testData() == true) {
                    support = true;
                }
                if(support == true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support == true && a.isFunction(callback)) {
            callback(support);
        }
    };


    /**
     * Get the support state of silverlight.
     * Note: it may arrive little bit after using start function...
     *
     * @method support
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;};

    /**
     * Get the ready state of silverlight object
     *
     * @method ready
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
     * @method start
     * @async
     *
     * @param callback {Function}           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeSilverlight(callback);
    };

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support == true) {
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
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support == true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).Content.store.saveData(
                                key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String}                  The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support == true) {
            a.storage.debugRemove(this.engine, key);
            document.getElementById(id).Content.store.removeData(key);
        }
    };
};



/**
 * javafx external storage
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class javafx
 * @static
 * @namespace a.storage.type
*/
a.storage.type.javafx = new function() {
    var support = false,
        ready   = false,
        id      = 'javafxstorage';

    /**
     * Start javaFX and check availability
     *
     * @method includeJavaFX
     * @private
     * @async
     *
     * @param callback {Function | null}    The callback function to
     *                                      call after loading
    */
    function includeJavaFX(callback) {
        if(support == false && ready == false) {
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

                if(t.Packages.javafxstorage.localStorage.testData() == true) {
                    support = true;
                    el.setDatabase('a_javafxStorage');
                }
                
                if(support == true && a.isFunction(callback)) {
                    callback(support);
                }
            }, data);
        } else if(support == true && a.isFunction(callback)) {
            callback(support);
        }
    };

    /**
     * Get the support state of javafx.
     * Note: it may arrive little bit after using start function...
     *
     * @method support
     *
     * @return {Boolean}                    True if support is active,
     *                                      false in other cases
    */
    this.support = function() {return support;},
    /**
     * Get the ready state of javafx object
     *
     * @method ready
     *
     * @return {Boolean}                    True if it's ready,
     *                                      false in other cases
    */
    this.ready = function() {return ready;},
    /**
     * @property engine
     * @type String
     * @default javafx
     * @final
    */
    this.engine = 'javafx',

    /**
     * Start (include and prepare) javafx object
     * Note: automatically done by system you don't need to...
     *
     * @method start
     * @async
     *
     * @param callback {Function}           The function to call
     *                                      in case of success
    */
    this.start = function(callback) {
        includeJavaFX(callback);
    };

    /**
     * Get the stored key
     *
     * @method get
     *
     * @param key {String}                  The key to retrieve
     * @return {Mixed | null}               The value in case of success,
     *                                      null if not found
    */
    this.get = function(key) {
        this.start();
        if(support == true) {
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
     * Store a new key/value pair
     *
     * @method set
     *
     * @param key {String}                  The key to set
     * @param value {Mixed}                 The data to add
    */
    this.set = function(key, value) {
        this.start();
        if(support == true) {
            a.storage.debugSet(this.engine, key, value);
            document.getElementById(id).Packages.javafxstorage.
                    localStorage.saveData(key, a.parser.json.stringify(value));
        }
    };

    /**
     * Remove a given key from store
     *
     * @method remove
     *
     * @param key {String} The key to remove
    */
    this.remove = function(key) {
        this.start();
        if(support == true) {
            a.storage.debugRemove(this.engine, key);
            document.getElementById(id).Packages.
                        javafxstorage.localStorage.removeData(key);
        }
    };
};






/* *************************
  POPULATING DATA FOR TEMPORARY AND PERSIST
************************* */
// TEMPORARY STORE SEARCH
/**
 * Select the best temp storage available
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class temporary
 * @static
 * @namespace a.storage
*/
a.storage.temporary = (function() {
    'use strict';

    var store = ['sessionStorage', 'cookie', 'memory'];
    for(var i=0, l=store.length; i<l; ++i) {
        var temp = store[i];
        if(a.storage.type[temp].support) {
            a.console.log('a.storage.temporary: choosing storage ' + 
                    a.storage.type[temp].engine, 3);
            a.message.dispatch('a.storage.temporary.change', 
                            { engine : temp });
            return a.storage.type[temp];
        }
    }

    // Memory store should be always OK, so this should never arrive
    return null;
})();


// EXTERNAL STORE SEARCH
/**
 * Select the best external storage available
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class external
 * @static
 * @namespace a.storage
*/
a.storage.external = (function() {
    'use strict';

    var started = false;

    /**
     * Start the callback function if possible
     *
     * @method startCallback
     * @private
     * @async
     *
     * @param type {Object}                 The object to use for external
     * @param callback {Function | null}    The function to launch if a
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
    };

    return {
        /**
         * Start the external tool, try to find an available store
         *
         * @method start
         * @async
         *
         * @param callback {Function | null}    The function to launch if
         *                                      a store has been found
        */
        start : function(callback) {
            var silvt = a.storage.type.silverlight,
                flash = a.storage.type.flash,
                javax = a.storage.type.javafx;

            var cs = 'a.storage.external: choosing storage ';

            // Loading silverlight
            silvt.start(function(svtSupport) {
                if(svtSupport) {
                    a.console.log(cs + 'silverlight', 3);
                    startCallback(silvt, callback);
                } else {
                    // Loading flash
                    flash.start(function(flashSupport) {
                        if(flashSupport) {
                            a.console.log(cs + 'flash', 3);
                            startCallback(flash, callback);
                        } else {
                            javax.start(function(javaxSupport) {
                                if(javaxSupport) {
                                    a.console.log(cs + 'javafx', 3);
                                    startCallback(javax, callback);
                                } else {
                                    a.console.warn(cs + 'NONE AVAILABLE', 3);
                                }
                            });
                        }
                    });
                }
            });
        }
    };
}());


// PERSISTENT STORE SEARCH
/**
 * Select the best long term storage available
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:storage">here</a>
 *
 * @class persistent
 * @static
 * @namespace a.storage
*/
a.storage.persistent = (function() {
    'use strict';

    var store = ['localStorage', 'globalStorage', 'userData', 'cookie'];
    for(var i=0, l=store.length; i<l; ++i) {
        var temp = store[i];
        if(a.storage.type[temp].support) {
            a.console.log('a.storage.persistent: choosing storage ' + 
                                    a.storage.type[temp].engine, 3);
            a.message.dispatch('a.storage.persistent.change', 
                                    { engine : temp });
            return a.storage.type[temp];
        }
    }

    // This one may append
    return null;
})();

if(a.storage.persistent == null) {
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
  PARAMETERS TYPE ASSOCIATED
------------------------------
*/
/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    // Parameters type
    a.parameter.addParameterType('temporary',  a.storage.temporary.get);
    a.parameter.addParameterType('memory',     a.storage.memory.get);
    a.parameter.addParameterType('persistent', a.storage.persistent.get);
    a.parameter.addParameterType('cookie',     a.storage.cookie.get);

    // Default 'store' behavior
    function getGlobalStore(name) {
        var temp = a.storage.temporary.get(name);
        if(a.isNone(temp)) {
            temp = a.storage.persistent.get(name);
        }
        return temp;
    };

    a.parameter.addParameterType('storage', getGlobalStore);
    a.parameter.addParameterType('store', getGlobalStore);


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
        return new Handlebars.SafeString(getGlobalStore(name));
    };

    Handlebars.registerHelper('storage', getHandlebarsStore);
    Handlebars.registerHelper('store', getHandlebarsStore);
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        core/environment.js
        core/console.js
        core/dom.js
    ]

    Events : []

    Description:
        Manage translation

************************************************************************ */

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
     * Get attribute stored into given element
     *
     * @method getAttr
     * @private
     *
     * @param element {DOMElement}          The dom object to get
    *                                       attribute from
     * @param search {String}               The attribute name searched
     * @return {String}                     The founded attribute
     *                                      content or empty string
    */
    function getAttr(element, search) {
        return  element.getAttribute(search)
            ||  element.getAttribute('a-' + search)
            ||  element.getAttribute('data-' + search)
            ||  '';
    };

    /**
     * Apply to a given element the given translation
     *
     * @method applyTranslationToElement
     * @private
     *
     * @param node {DOMElement}             The element to apply
     * @param translation {String}          The translation to apply
    */
    function applyTranslationToElement(node, translation) {
        var customTagAttribute = getAttr(node, customAttribute);

        if(customTagAttribute && customTagAttribute != '') {
            try {
                node[customTagAttribute] = translation;
            } catch(e) {}
            return;
        }

        // We are on a submit/reset button
        if(node.nodeName == 'INPUT') {
            var type = node.type;
            if(type == 'submit' || type == 'reset' || type == 'button') {
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
                var j = m - i;
                for(var j=0, k=(m-i); j<k; ++j) {
                    node.appendChild(
                        document.createTextNode(splittedTranslation[i + j])
                    );
                }
            }
        }
    };

    /**
     * Apply translation to a given document/sub-document
     *
     * @method i18n
     *
     * @param root {DOMElement | null}      The root element to 
     *                                      start translate from
    */
    function i18n(root) {
        root = root || document;

        // Selecting elements
        var el   = a.dom.el(root),
            // We search 'tr' and 'data-tr' tag on elements
            srch = defaultAttribute
                + ',a-' + defaultAttribute
                + ',data-' + defaultAttribute;

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
    };

    /**
     * Get the current used language
     *
     * @method getLanguage
     *
     * @return {String}                     The language setted by
     *                                      user/system (default is 'en-US')
    */
    function getLanguage() {
        return language;
    };

    /**
     * Set the current used language.
     * Auto-translate current document except if update is set to false.
     *
     * @method setLanguage
     *
     * @param lang {String}                 The new language to apply
     * @param update {Boolean | null}       If we should translate
     *                                      current (default: yes)
    */
    function setLanguage(lang, update) {
        if(!a.isString(lang) || !lang) {
            a.console.error('a.translate.setLanguage: setting a non-string ' +
                            'lang, or empty string, as default translate: ',
                            'Test non-string value is refused', 1);
        } else {
            language = lang;

            if(storageSupported) {
                a.storage.persistent.set('app.language', language);
            }

            if(update !== false) {
                i18n();
            }
        }
    };

    /**
     * Get any global variable setted
     *
     * @method getGlobalVariable
     *
     * @param key {String}                  The variable key to search
     * @return {String}                     The variable value or
     *                                      an empty string if not found
    */
    function getGlobalVariable(key) {
        return globalVariable[key] || '';
    };

    /**
     * Set a global variable to be used if possible when translating
     *
     * @method setGlobalVariable
     *
     * @param key {String}                  The variable key to register
     * @param value {String}                The linked value
    */
    function setGlobalVariable(key, value) {
        globalVariable[key] = value;
    };

    /**
     * Register a new translation for given language.
     * After register is done, you can now use data-tr='{{hash}}' inside
     * HTML page to have corresponding translation.
     * Note: you can use a quicker version add(lang, object, update)
     * Where the object will be a key/value translate list for lang
     *
     * @method add
     *
     * @param lang {String}                 The language to
     *                                      register hash/value pair
     * @param hash {String}                 The refered hash to
     *                                      use for translation
     * @param value {String}                The linked translation
     *                                      for given language
     * @param update {Boolean | null}       If we should fully
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
    };

    /**
     * Set a new translation set for a given language.
     * If dict is set to null, it will erase language.
     *
     * @method set
     *
     * @param lang {String}                 The language to register dict
     * @param dict {Object}                 A key/value pair object for
     *                                      registrating many translation
     *                                      at once
     * @param update {Boolean | null}       If we should fully
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
    };

    /**
     * Get an existing translation stored
     *
     * @method get
     *
     * @param key {String | null}           The searched translation key
     * @param variables {Object | null}     Any key/value pair variable to pass
     * @param translate {Boolean | null}    If we should or not translate
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
         * From a hash, try to find the good variable content
         *
         * @param hash {String}             The hash to find in variable list
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
        };

        var trVariables = tr.match(regexVariable) || [];

        for(var i=0, l=trVariables.length; i<l; ++i) {
            var el = trVariables[i];
            tr = tr.replace(el, hashToVariable(el));
        }

        // If it has still some unknow variable, we remove them...
        return tr.replace(regexVariable, '');
    };

    /**
     * Get the full stored dictionnary.
     *
     * @param lang {String | null}          If lang is setted, retrieve only
     *                                      the given language. In other cases
     *                                      retrieve all dictionnaries.
    */
    function getDictionnary(lang) {
        if(lang) {
            return dictionnary[lang] || {};
        }
        return dictionnary;
    };


    /**
     * Erase dictionnary
     *
     * @method clearDictionnary
    */
    function clearDictionnary() {
        dictionnary = {};
    };



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
        getCurrent:  getLanguage,

        setLanguage: setLanguage,
        setCurrent:  setLanguage,

        translate:   i18n,
        i18n:        i18n,

        getDictionnary:    getDictionnary,

        getGlobalVariable: getGlobalVariable,
        addGlobalVariable: setGlobalVariable,
        setGlobalVariable: setGlobalVariable,

        add:            add,
        addTranslation: add,

        get:            get,
        getTranslation: get,

        set:            set,
        setTranslation: set,

        clear: clearDictionnary
    };
})();
;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        plugin/translate.js
    ]

    Events : []

    Description:
        Manipulate HTML form by with a simple system.

************************************************************************ */

/**
 * Manipulate HTML form by with a simple system.
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:plugins:form">here</a>
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

        if(a.isNone(name) || name == '') {
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
    };

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
                return e.options[e.selectedIndex].value 
            }
            return null;
        }
    };

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
                    (  el.type == 'submit'
                    || el.type == 'button'
                    || el.type == 'reset'
                    || el.type == 'image'
                    ) ) {
                elements.splice(i, 1);
            }
        }

        // Now filtering is done, we can send back all elements
        return elements;
    };

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
            var errorMessage  = 'A data-error tag has not been setted for ';
                errorMessage += id + ' with value ' + value + 'n can\'t ';
                errorMessage += 'proceed error message';
            a.console.warn(errorMessage, 3);
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
    };


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
    };

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
                } else if(isArrayAllowed
                        && !a.contains(allowed, propertiesName[i])) {
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
                if(custom[property]) {
                    var fct = custom['property'],
                        result = fct.call(null, el, property);

                    if(a.isTrueObject(result)) {
                        el = result;
                    }
                }
                if(custom[tag]) {
                    var fct = custom[tag],
                        result = fct.call(null, el, property);

                    if(a.isTrueObject(result)) {
                        el = result;
                    }
                }
                if(custom[type]) {
                    var fct = custom[type],
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
    };

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
            };

            a.console.log('a.form.get: found element list:', 3);
            a.console.log(outputList, 3);
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

            /*
             * required : at least one char
                (text, search, url, tel, email, password, date, datetime,
                datetime-local, month, time, week, number, checkbox,
                radio, file)
             * pattern : a regex to test (Use title like a helper),
                (text, search, url, tel, email, password)
             * multiple : the user is allowed to enter more than one element
                (only for email, file)
             * min/max : min/max value
                (number, range, date, datetime, datetime-local,
                month, time, week)
             * step : multiplier
                (number, range, date, datetime, datetime-local,
                month, time, week)
            */
            var i = inputList.length;
            while(i--) {
                // Does only work for input tags
                var el      = inputList[i],
                    tagName = el.tagName.toLowerCase();

                // form novalidate : we must not validate
                // this element (including all select)
                if(tagName == 'select'
                    || !a.isNone(el.novalidate)) {
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
                min  = (a.isNone(min) || min == '')   ? null :
                                                            parseFloat(min);
                max  = (a.isNone(max) || max == '')   ? null :
                                                            parseFloat(max);
                step = (a.isNone(step) || step == '') ? null :
                                                            parseFloat(step);

                // Check input type does existing in allowed type list
                if(tagName == 'input'
                        && !a.contains(allowedTypes, type)
                        && !a.isNone(type)) {
                    var errorSupport =  'Type ' + type + ' for input ' + name;
                        errorSupport += ' not recognized or not supported';
                    a.console.warn(errorSupport, 3);
                    continue;
                }

                // Now checking type
                if( (type == 'number' || type == 'range')
                        && !a.isNumber(value) ) {
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
                if( required !== null
                    && a.contains(typeRequiredList, type)
                    && (value === '' || a.isNone(value)) ) {
                    errorList.push(validateError(el, name, 'required', value));
                    continue;
                }

                // Pattern test
                if( pattern !== null
                     && (tagName === "textarea"
                        ||(a.contains(typePatternList, type))
                        || a.isNone(type)
                        )
                ) {
                    var reg = new RegExp(pattern);
                    if(!reg.test(value)) {
                        errorList.push(validateError(
                                            el, name, 'pattern', value));
                        continue;
                    }
                }

                // Min/max/step test
                if( (min !== null || max != null || step != null)
                    && a.contains(minMaxStepList, type) ) {

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

            a.console.log('a.form.validate: found error list:', 3);
            a.console.log(errorList, 3);
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

})();;

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
            a.console.error('A state error has occurs, ' +
                            'with no state linked to it...', 1);
            a.console.error(a.getStackTrace(), 1);
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
            messageError = 'a.state.raiseError: an error occurs, but ' +
                           'no error function/hash inside the state '+
                           'where existing to handle it. Please ' +
                           'check your error handler (state-id: ' + id +
                           ', status: ' + status +
                           ', resource: ' + resource + ')';

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
                a.console.error(messageError, 1);
            }

        // Nothing exist, we alert user
        } else {
            a.console.error(messageError, 1);
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
                    a.console.log('a.state.foundHashState: acl has been ' +
                                'refused for state id ' + state.id, 3);
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
                var entry = this.entry || this.target || this.el || this.dom || null;

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
                a.console.error('state ' + this.id
                        + ': unable to proceed flash message "' 
                        + this._storm.flash + '"', 1);
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
                a.console.error('a.state.add: unable to found parent ' + 
                    state.parent + ' for state ' + state.id);
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
     * Inject an object to given to next state.
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

    Dependencies : [
        a.js
        plugin/state.js
    ]

    Events : []

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
                a.console.error('request cannot be proceed, state: '
                    + state.id + ', data request: ' + name +
                    ', url parsing may have fail... It can be ' +
                    'some missing parameters', 3);
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
        //a.console.log('loading');
        //a.console.log(this);
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
            a.console.error('a.state.chain:include: The state ' + this.id +
                            ' is not valid (data is not a valid system)', 1);
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
        //a.console.log('unloading');
        //a.console.log(this);
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

    Dependencies : [
        a.js
        plugin/state.js
    ]

    Events : []

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

    Dependencies : [
        a.js
        plugin/state.js
    ]

    Events : []

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

    Dependencies : [
        a.js
        core/message.js
    ]

    Events : [
        init: {}
    ]

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
            a.console.error('Impossible to watch property ' + key + ' from '
                + this.modelName + ' model', 1);
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
            a.console.error('Impossible to unwatch property ' + key + ' from '
                + this.modelName + ' model', 1);
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
                a.console.error('a.model: ' + this.modelName + ' has a '
                    + 'property ' + key + ' in conflict with internal '
                    + 'model data, please change property name', 1);
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

    Dependencies : [
        a.js
        core/message.js
        plugin/model.js
    ]

    Events : [
        init: {}
    ]

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

    Dependencies : [
        a.js
        core/message.js
        plugin/model.js
        plugin/model.manager.js
    ]

    Events : []

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

    Dependencies : [
        a.js
        core/message.js
        plugin/model.js
    ]

    Events : []

    Description:
        Provide a model rendering system, aims to quickly create forms
        and related data presentation. For a quicker bindings.

************************************************************************ */

// TODO: DO PRESENTATION TEXT HERE
/**
    Provide a model rendering system, aims to quickly create forms
    and related data presentation. For a quicker bindings.
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

        // If engine is not found, we raise error
        if(a.isNone(engine) || a.isNone(renderNgin)) {
            a.console.error('a.model.template.getDescriptor: unable to find ' +
                a.model.template.engine + ' engine', 1);
        }

        var error = 'a.model.template.getDescriptor: unable to ' +
                    'find descriptor for ' + key + ' with engine ' + 
                    a.model.template.engine + ' and template ' + 
                    template.templateName;

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
                a.console.error(error, 1);
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
                a.console.error(error, 1);
                return null;
            }

        } else {
            a.console.error('a.model.template.getDescriptor: The type ' + type
                + ' is unknow', 1);
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
                a.console.error('a.model.template.output.model: The template '+
                    templateName + ' could not be found', 1);
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

    Dependencies : [
        a.js
        core/console.js
        core/message.js
        plugin/callback.js
        plugin/translate.js
    ]

    Events: [
    ]

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
            a.console.error(fctName + ': unable to find Handlebars.JS !', 1);
            return;
        }

        var partialsStore = this._part;

        if(a.isString(partialsStore[name])) {
            a.console.log(fctName +': loading ' + name + ' from cache', 3);

            if(a.isFunction(callback)) {
                callback(name, partialsStore[name]);
            }
        } else if(options && options.noloading == true) {
            a.console.log(fctName +': loading ' + name + ' from parameter', 3);
            partialsStore[name] = uri;
            handler.registerPartial(name, uri);

            // Callback
            if(a.isFunction(callback)) {
                callback(name, uri);
            }
        } else {
            a.loader.html(uri, function(content) {
                a.console.log(fctName +': loading ' + name + ' from url', 3);
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
            a.console.error(fctName + ': unable to find Handlebars.JS !', 1);
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
            a.console.log(fctName +': loading ' + hash + ' from cache', 3);
            callCallback(callback, hash, data);
            return;
        }

        // Template exist on page DOM, but it's not registred to ich for now
        if(document.getElementById(hash)) {
            // We add it to template list registered to go quicker next time
            if(!this._tmpl[hash]) {
                a.console.log(
                    fctName + ': loading ' + hash + ' from inner html page',3);
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
                a.console.log(
                    fctName + ': loading ' + orig + ' from inner html page',3);
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
        a.console.log(
            fctName + ': loading ' + uri + ' from external resource', 3);
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
})();;/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
        plugin/template.js
    ]

    Events : [
    ]

    Description:
        Provide a module system to act like web components stuff

************************************************************************ */


/*
a.module

*/



a.module = function(name, proto) {
    if(a.modulePooler.get(name)) {
        return a.modulePooler.createInstance(name);
    } else {
        // At least one '-' and no '.'
        var testModuleName = new RegExp('^[a-zA-Z0-9\_]+\-[a-zA-Z0-9\-\_]+$',
                                                                    'gi');

        if(!testModuleName.test(name)) {
            a.console.error('a.module: unable to create module, the name '
                + name + ' does not fit recommandation. It must contains '
                + 'one of the following a-z, A-Z, 0-9, "-" and "_". But it '
                + 'must contains at least one "-"', 1);
            return;
        }

        // Generating initial content
        var content = {
            prototype: ('prototype' in proto) ? proto.prototype:
                                    Object.create(HTMLElement.prototype)
        };

        // TODO: pour les propriétés (getter et setter)
        // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Object/defineProperty

        // TODO: check chaque propriété
        // http://kangax.github.io/compat-table/es5/

        // Ptete a voir (template engine de polymer)
        // https://github.com/Polymer/TemplateBinding

        if('extends' in proto) {
            content.extends = proto.extends;
        }
        var content = {
            prototype: Object.create(
                ('prototype' in proto) ? proto.prototype: HTMLElement.prototype
            , {
                /**
                 * Unload all bindings associated to module
                 *
                 * @method unloadBindings
                */
                unloadBindings: function() {

                },
                /**
                 * Load all bindings associated to new state
                 *
                 * @method loadBindings
                 *
                 * @param bindings {Object}      List of bindings to apply
                */
                loadBindings: function(bindings) {
                    for(var i in bindings) {

                    }
                },
                unloadTemplate: function() {
                    // Removing previous dom
                    while(this.firstChild) {
                        this.removeChild(this.firstChild);
                    }
                },
                loadTemplate: function(content) {
                    // Pushing dom
                    var dom = a.template.htmlToDom(content);
                    for(var i=0, l=dom.length; i<l; ++i) {
                        this.appendChild(dom[i]);
                    }
                },
                load: function(name) {
                    // We are in multiple template type
                    if(!a.isString(proto.template)) {
                        if(!(name in proto.template)) {
                            a.console.error(this.tagName.toLowerCase() + ' is '
                                + 'unable to load, as the state name ' + name
                                + ' cannot be found in template variable', 1);
                            return;
                        }
                    }

                    this.unloadBindings();
                    if(a.isString(proto.template)) {
                        this.loadTemplate(proto.template);
                        this.loadBindings(proto.bind);
                    } else if(a.isTrueObject(proto.template) &&
                                (name in proto.template)) {
                        this.loadTemplate(proto.template[name]);
                        this.loadBindings(proto.bind[name]);
                    }
                },

                fire: function(name, data) {
                    // Raise an event, maybe replace by dispatch
                },

                /*
                 * ---------------------------
                 *   CREATE NEW DOM ELEMENT
                 * ---------------------------
                */
                createdCallback: {value: function() {
                    // There is a template
                    if(a.isString(proto.template)) {
                        this.load(proto.template);
                    } else if(a.isTrueObject(proto.template)) {
                        if(proto.init) {
                            this.load(proto.init);
                        } else {
                            var keys = Object.keys(proto.template);
                            if(keys.length > 0) {
                                this.load(proto.template[keys[0]]);
                            }
                        }
                    }
                    // TODO: link to a.modulePooler ? or do it in attachedCallback ?

                    // Start the init function
                    if(a.isFunction(proto.created)) {
                        proto.created.call(this);
                    }
                }},

                /*
                 * ---------------------------
                 *   ATTACHING INTO DOM
                 * ---------------------------
                */
                attachedCallback: {value: function() {
                    // TODO: here we bind click and so on...
                    console.log('live on DOM ;-) ');
                    if(a.isFunction(proto.attached)) {
                        proto.attached.call(this);
                    }
                }},

                /*
                 * ---------------------------
                 *   DETACHING FROM DOM
                 * ---------------------------
                */
                detachedCallback: {value: function() {
                    console.log('leaving the DOM :-( )');

                    a.moduleManager.remove(this.uid);

                    if(a.isFunction(proto.detached)) {
                        proto.detached.call(this);
                    }
                }},

                /*
                 * ---------------------------
                 *   ATTRIBUTE CHANGED
                 * ---------------------------
                */
                attributeChangedCallback: {value: function(name, old, value) {
                    if(a.isFunction(proto.attachedFunction)) {
                        proto.attributeChanged.call(this);
                    }
                    /*if (old == null) {
                        console.log(
                            'got a new attribute ', name,
                            ' with value ', value
                        );
                    } else if (value == null) {
                        console.log(
                            'somebody removed ', name,
                            ' its value was ', old
                        );
                    } else {
                        console.log(
                            name,
                            ' changed from ', old,
                            ' to ', value
                        );
                    }*/
                }}
            })
        };

        // UID support
        Object.defineProperty(content, 'uid', {
            value: a.uniqueId(),
            enumerable: false,
            configurable: false,
            writable: false
        });

        // Creating final document
        var module = document.registerElement(name, content);
        a.modulePooler.set(name, module);
        return module;
    }
};

/**
 * A module manager helps to keep a trace of every module currently used by the
 * application.
 *
 * @class moduleManager
 * @namespace a
 * @constructor
*/
a.moduleManager = {
    /**
     * Store a pointer to every instance of every module created.
     * @property _store
     * @type Object
     * @default {}
    */
    _store: a.mem.getInstance('app.module.instance'),

    /**
     * Store a new module into the moduleManager.
     *
     * @method set
     *
     * @param module {Object}               The new module to store
    */
    set: function(module) {
        this._store.set(module.uid, module);
    },

    /**
     * Get a module from it's uid (the unique id is automatically generated
     * for every module, it's available threw myModuleInstance.uid)
     *
     * @method get
     *
     * @param uid {Integer}                 The unique id to search related
     *                                      module from
     * @return {Object | null}              The related module found, or null
     *                                      if nothing is found
    */
    get: function(uid) {
        return this._store.get(uid);
    },

    /**
     * Remove a module from store.
     *
     * @method remove
     *
     * @param uid {Integer}                 The uid to remove
    */
    remove: function(uid) {
        this._store.remove(uid);
    },

    /**
     * Remove all existing module from store
     *
     * @method clear
    */
    clear: function() {
        this._store.clear();
    },

    /**
     * Get all modules related to a given name. For example, if you create
     * a.module('x-user'), this function helps to find all *x-user* module
     * created.
     *
     * @method getByName
     *
     * @param name {String}                 The module name to find
     * @return {Array}                      The array with all module instance
     *                                      related to this name
    */
    getByName: function(name) {
        if(!name || !a.isString(name)) {
            return [];
        }

        name = name.toLowerCase();

        var result = [];

        a.each(this._store.list(), function(element) {
            if(element.tagName.toLowerCase() === name) {
                result.push(element);
            }
        });

        return result;
    }
};







/**
 * A module pooler aims to create a storage space to keep every module type
 * existing.
 *
 * @class modulePooler
 * @namespace a
 * @constructor
*/
a.modulePooler = a.mem.getInstance('app.module.type');

/**
 * Simple function to generate new instance from a base
 *
 * @method createInstance
 *
 * @param name {String}                     The module type we want to create
 * @return {Object | null}                  The module instance created, or
 *                                          null if model name is not defined
*/
a.modulePooler.createInstance = function(name) {
    var module = this.createTemporaryInstance(name);

    if(!a.isNull(module)) {
        // Adding module to moduleManager system
        a.moduleManager.set(module);
    }

    return module;
};


/**
 * Simple function to generate new instance from a base. This instance is not
 * stored into a.moduleManager.
 * NOTE: this function should not be used, please use createInstance instead.
 *
 * @method createInstance
 *
 * @param name {String}                     The module type we want to create
 * @return {Object | null}                  The module instance created, or
 *                                          null if module name is not defined
*/
a.modulePooler.createTemporaryInstance = function(name) {
    var instanceType = this.get(name);

    if(!instanceType) {
        return null;
    }

    // Returning freshly created module
    return document.createElement(name);
};

/**
 * From a given query, get back the existing stored module
 *
 * @method searchInstance
 *
 * @param query {Object}                    The query to search inside
 * @return {a.modelInstance | null}         The single instance found,
 *                                          or a list of instances, or null
*/
a.modulePooler.searchInstance = function(query) {
    var modules = a.model.manager.getByName(query.moduleName || query.module ||
                                          query.name);

    // We remove the first searched element
    if(query.moduleName) {
        delete query.moduleName;
    } else if(query.module) {
        delete query.module;
    } else if(query.name) {
        delete query.name;
    }

    for(var key in query) {
        var value = query[key],
            i = modules.length;

        while(i--) {
            var module = modules[i];
            // The module is not related to searched value
            if(module.get(key) !== value) {
                modules.splice(i, 1);
            }
        }
    }

    if(modules.length == 0) {
        return null;
    } else if(modules.length == 1) {
        return modules[0];
    }
    return modules;
};


/**
 * Delete an existing instance.
 *
 * @method deleteInstance
 *
 * @param instance {Object}                 The instance to delete
*/
a.modulePooler.deleteInstance = function(instance) {
    if(a.isTrueObject(instance) && instance.uid) {
        a.moduleManager.remove(instance.uid);
    }
};;// Final script, appstorm is ready
a.message.dispatch('ready');