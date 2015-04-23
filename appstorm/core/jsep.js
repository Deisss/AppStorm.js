/**
 * Helper to use JSEP inside AppStorm.JS
*/
a.jsep = {
    /**
     * The original JSEP parser
     *
     * @property parser
    */
    jsep: jsep.noConflict() || null,

    /**
     * Evaluate a string as a JSEP instruction. Get back the JSEP tree map.
     *
     * @param {String} str                  The string to get JSEP map from.
     * @return {Object}                     A JSEP tree map.
    */
    parse: function (str) {
        if(a.jsep.jsep === null) {
            return {};
        }
        return a.jsep.jsep(str);
    },

    /**
     * Get an instance of the default JSEP interpreter.
     * With it, you can convert JSEP tree to actual result. Depending on the
     * configuration you choose.
     *
     * @param {String} name                 The interpreter name, must be
     *                                      unique or you may have conflict
     *                                      with other interpreter instance.
     * @param {Boolean} useDefaultBinaryOperators If system should register
     *                                      for you the default binary
     *                                      operators (+, -, *, /, %, ==, ...)
     * @param {Boolean} useDefaultLogicalOperators If system should register
     *                                      for you the default logical
     *                                      operators (operators: ||, &&)
     * @param {Boolean} useDefaultUnaryOperators If system should register
     *                                      for you the default unary operators
     *                                      (-, +, !, ~).
     * @return {Object}                     A new instance of JSEP interpreter.
    */
    interpreter: function (name, useDefaultBinaryOperators,
            useDefaultLogicalOperators, useDefaultUnaryOperators) {
        if(a.jsep.jsep === null) {
            return {};
        }

        if (!(this instanceof a.jsep.interpreter)) {
            return new a.jsep.interpreter(name, useDefaultBinaryOperators,
                    useDefaultLogicalOperators, useDefaultUnaryOperators);
        }

        // Storage to use functions inside.
        this.logicalOperators = a.mem.getInstance(name + '.operators.logical');
        this.binaryOperators = a.mem.getInstance(name + '.operators.binary');
        this.unaryOperators = a.mem.getInstance(name + '.operators.unary');

        /**
         * Evaluate a given JSEP result (see a.jsep.parse function), and
         * output the value.
         * Note that depending on how the interpreter is configured, the
         * value outputted can be quite different from two interpreter...
         *
         * @param {Object} data         A JSEP parse results.
         * @param {Object} scope        Any scope to use here...
         * @return {Object}             An object composed of result, the
         *                              computed result, and variables, a
         *                              list of variables from scope used.
        */
        this.evaluate = function (data, scope) {
            var internal = {};
            scope = scope || {};
            var result = this.expressions.parse(data, internal, scope);

            return {
                variables: a.keys(internal),
                result: result
            };
        };

        // Shorter
        var lo = this.logicalOperators,
            bo = this.binaryOperators,
            uo = this.unaryOperators,
            source = 'a.jsep.interpreter.' + name;


        /*!
          ------------------------------
            DEFAULT BINARY OPERATORS
          ------------------------------
        */
        if (useDefaultBinaryOperators === true) {
            bo.set('^', function (left, right) {
                return Math.pow(left, right);
            });
            bo.set('+',   function (left, right) {  return left + right;    });
            bo.set('-',   function (left, right) {  return left - right;    });
            bo.set('*',   function (left, right) {  return left * right;    });
            bo.set('/',   function (left, right) {  return left / right;    });
            bo.set('%',   function (left, right) {  return left % right;    });
            bo.set('|',   function (left, right) {  return left | right;    });
            bo.set('&',   function (left, right) {  return left & right;    });
            bo.set('==',  function (left, right) {  return left == right;   });
            bo.set('===', function (left, right) {  return left === right;  });
            bo.set('!=',  function (left, right) {  return left != right;   });
            bo.set('!==', function (left, right) {  return left !== right;  });
            bo.set('<',   function (left, right) {  return left < right;    });
            bo.set('>',   function (left, right) {  return left > right;    });
            bo.set('<=',  function (left, right) {  return left <= right;   });
            bo.set('>=',  function (left, right) {  return left >= right;   });
            bo.set('<<',  function (left, right) {  return left << right;   });
            bo.set('>>',  function (left, right) {  return left >> right;   });
            bo.set('>>>', function (left, right) {  return left >>> right;  });
        }

        /*!
          ------------------------------
            DEFAULT LOGICAL OPERATORS
          ------------------------------
        */
        if (useDefaultLogicalOperators === true) {
            lo.set('||', function (left, right) { return left || right; });
            lo.set('&&', function (left, right) { return left && right; });
        }

        /*!
          ------------------------------
            DEFAULT UNARY OPERATORS
          ------------------------------
        */
        if (useDefaultUnaryOperators === true) {
            uo.set('-', function (left) {  return -left;  });
            uo.set('!', function (left) {  return !left;  });
            uo.set('~', function (left) {  return ~left;  });
            uo.set('+', function (left) {  return +left;  });
        }

        /**
         * Increase the internal counter.
         * The internal counter is used to know what are the variables in use
         * in this system.
         *
         * @param internal The internal object.
         * @param name The property name to store.
        */
        function increaseInternal(internal, name) {
            if (internal.hasOwnProperty(name)) {
                internal[name]++;
            } else {
                internal[name] = 1;
            }
        }

        /**
         * Decrease the internal counter.
         * The internal counter is used to know what are the variables in use
         * in this system.
         *
         * @param internal The internal object.
         * @param name The property name to store.
        */
        function decreaseInternal(internal, name) {
            if (internal.hasOwnProperty(name)) {
                internal[name]--;
                if (internal[name] <= 0) {
                    delete internal[name];
                }
            }
        }

        /**
          ------------------------
            EXPRESSIONS
          ------------------------
        */
        /**
         * List of functions actually doing parsing...
         * You can modify those functions in case of specific parsing
         * you may need.
        */
        this.expressions = {
            /**
             * Found literal (constant) value, like 1, or
             * 'hello'. This function simply returns it's value.
            */
            literalExpression: function (data, internal, scope) {
                return data.value;
            },

            /**
             * Found 'this' keyword. This function simply returns scope.
            */
            thisExpression: function (data, internal, scope) {
                return scope;
            },

            /**
             * Found member of a given object. A member is a property from
             * an object, like a.b or a[b] in js.
             *
             * @param data The data with member expression inside
             * @param internal Unused
             * @param scope The scope associated
             * @return The object propery values
            */
            memberExpression: function (data, internal, scope) {
                var obj = this.parse(data.object, internal, scope),
                    property = this.parse(data.property, internal, scope);

                if (typeof obj[property] === 'undefined') {
                    // Specific case to handle
                    if(data.object.type === 'ThisExpression') {
                        return property;
                    }
                    a.console.storm('error', source, 'The property ```' +
                        property + '``` could not be found', 1);
                    return null;
                }

                // We are getting the property
                return obj[property];
            },

            /**
             * Found an identifier. An identifier is basically a variable.
             * Like a + b, a and b are identifiers taken from scope.
             *
             * @param data The identifier expression inside
             * @param internal Variable in use for the current parsing
             * @param global If the system can search in global scope
             * @param scope The scope associated
             * @return The object propery values
            */
            identifierExpression: function (data, internal, scope) {
                // No matter is the element is found in the scope or
                // not, it's counted as inside the scope.
                increaseInternal(internal, data.name);

                if (scope.hasOwnProperty(data.name)) {
                    return scope[data.name];
                }

                return data.name;
            },

            /**
             * Found an array expression. This function will convert it
             * to true JS array.
             * Note: this function can have pretty bad side effect...
            */
            arrayExpression: function (data, internal, scope) {
                var arr = [];

                for (var i in data.elements) {
                    if (data.elements.hasOwnProperty(i)) {
                        arr.push(this.parse(data.elements[i], internal,
                                scope));
                    }
                }

                return arr;
            },

            /**
             * Found a function call. The function will be searched inside
             * the scope.
             *
             * @param data The function calling arguments and name
             * @param internal Unused
             * @param scope The current scope in use
            */
            callExpression: function (data, internal, scope) {
                var fct = this.parse(data.callee, internal, scope),
                    args = [];

                if (a.isFunction(fct)) {
                    decreaseInternal(internal, data.callee.name);

                    for (var i in data.arguments) {
                        if (data.arguments.hasOwnProperty(i)) {
                            args.push(this.parse(data.arguments[i],
                                    internal, scope));
                        }
                    }

                    return fct.apply(null, args);
                } else {
                    a.console.storm('error', source, 'The function ```' + 
                            data.callee.name + '``` could not be resolved...',
                            1);
                }
                return null;
            },

            /**
             * Found a conditional expression (a ? b : c). This is the
             * only type of 'if' supported.
            */
            conditionalExpression: function (data, internal, scope) {
                var test = this.parse(data.test, internal, scope),
                    consequent = this.parse(data.consequent, internal,
                            scope),
                    alternate = this.parse(data.alternate, internal,
                            scope);

                return (test === true) ? consequent: alternate;
            },

            /**
             * Found more than one expression. This function will create
             * an array with every result in every case.
            */
            compoundExpression: function (data, internal, scope) {
                var arr = [];
                for (var i in data.body) {
                    if (data.body.hasOwnProperty(i)) {
                        arr.push(this.parse(data.body[i], internal,
                                scope));
                    }
                }

                return arr;
            },

            /**
             * Found a unary operator, like -a (negate a), here the -
             * is a unary operator, or the operator not (!) also...
             * This function will rely on 'unaryOperators' store to find
             * a related function to apply the operation.
             *
             * @param data The unary structure
             * @param internal Unused
             * @param scope The current scope in use
            */
            unaryExpression: function (data, internal, scope) {
                var result = this.parse(data.argument, internal, scope),
                    operator = uo.get(data.operator);

                if (!a.isFunction(operator)) {
                    a.console.storm('error', source,
                            'Unknow unary operator ```' + data.operator +
                            '```', 1);
                    return result;
                }

                return operator.call(this, result, data, internal, scope);
            },

            /**
             * The most common case, like "+" or "-" or "/" operators.
             * Probably the most common, which are basic manipulations
             * in both number and string areas.
             *
             * @param data The binary structure
             * @param internal Unused
             * @param scope The current scope in use
            */
            binaryExpression: function (data, internal, scope) {
                var left = this.parse(data.left, internal, scope),
                    right = this.parse(data.right, internal, scope),
                    operator = bo.get(data.operator);

                if (!a.isFunction(operator)) {
                    a.console.storm('error', source,
                        'Unknow binary operator ```' + data.operator +
                        '```', 1);
                    return left + right;
                }

                return operator.call(this, left, right, data, internal,
                        scope);
            },

            /**
             * Logical operators like "||" or "&&"
             *
             * @param data The logical structure
             * @param internal Unused
             * @param scope The current scope in use
            */
            logicalExpression: function (data, internal, scope) {
                var left = this.parse(data.left, internal, scope),
                    right = this.parse(data.right, internal, scope),
                    operator = lo.get(data.operator);

                if (a.isNone(operator) || !a.isFunction(operator)) {
                    a.console.storm('error', source,
                        'Unknow logical operator ```' + data.operator +
                        '```', 1);
                    return left && right;
                }

                return operator.call(this, left, right, data, internal,
                        scope);
            },

            /**
             * The main parser, will take anything from jsep and convert it
             * to what we need. You probably don't need to touch at all
             * this function.
             *
             * @param data The data structure
             * @param internal Unused
             * @param scope The current scope in use
            */
            parse: function (data, internal, scope) {
                if (data && data.type) {
                    switch (data.type) {
                        case 'BinaryExpression':
                            return this.binaryExpression(data, internal,
                                    scope);
                        case 'UnaryExpression':
                            return this.unaryExpression(data, internal,
                                    scope);
                        case 'LogicalExpression':
                            return this.logicalExpression(data, internal,
                                    scope);
                        case 'CallExpression':
                            return this.callExpression(data, internal,
                                    scope);
                        case 'MemberExpression':
                            return this.memberExpression(data, internal,
                                    scope);
                        case 'Identifier':
                            return this.identifierExpression(data,
                                    internal, scope);
                        case 'Literal':
                            return this.literalExpression(data, internal,
                                    scope);
                        case 'ArrayExpression':
                            return this.arrayExpression(data, internal,
                                    scope);
                        case 'Compound':
                            return this.compoundExpression(data, internal,
                                    scope);
                        case 'ThisExpression':
                            return this.thisExpression(data, internal,
                                    scope);
                        case 'ConditionalExpression':
                            return this.conditionalExpression(data,
                                    internal, scope);
                        default:
                            a.console.storm('error', source,
                                'Unknow type, cannot parse ```' +
                                data.type + '```', 1);
                            return null;
                    }
                }
                return null;
            }
        };
    }
};