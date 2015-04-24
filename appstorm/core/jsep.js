/**
 * Helper to use JSEP inside AppStorm.JS.
 *
 * This system provide an interpreter for JSEP parser, allowing to compute
 * a value from a JSEP parsing output.
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
        if (a.jsep.jsep === null) {
            return {};
        }
        return a.jsep.jsep(str);
    },

    /**
     * Internal is an object used to count variables when dealing with
     * interpreter. It's usefull to know what variables are used in a given
     * sentence.
     * Note: you probably don't need to deal with it...
    */
    internal: function () {
        if (!(this instanceof a.jsep.internal)) {
            return new a.jsep.internal();
        }

        var data = {};

        /**
         * Increase variable.
         *
         * @private
         *
         * @param {String} name             The variable name to count
        */
        this.increaseVar = function (name) {
            if (data.hasOwnProperty(name)) {
                data[name]++;
            } else {
                data[name] = 1;
            }
        };

        /**
         * Decrease variable.
         *
         * @private
         *
         * @param {String} name             The variable name to count
        */
        this.decreaseVar = function (name) {
            if (data.hasOwnProperty(name)) {
                data[name]--;
                if (data[name] <= 0) {
                    delete data[name];
                }
            }
        };

        /**
         * Get the current variable list.
         *
         * @private
         *
         * @return {Object}                 List of variables in use
        */
        this.getListVar = function () {
            return data;
        };
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
        if (a.jsep.jsep === null) {
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
            var internal = a.jsep.internal();
            scope = scope || {};
            var result = this.expressions.parse(data, internal, scope);

            return {
                variables: a.keys(internal.getListVar()),
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

        /*!
         * @private
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
             *
             * @param {Object} data         The literal object
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The javascript value of current
             *                              literal expression
            */
            literalExpression: function (data, internal, scope) {
                return data.value;
            },

            /**
             * Found 'this' keyword. This function simply returns scope.
             *
             * @param {Object} data         The this object
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Object}             The scope
            */
            thisExpression: function (data, internal, scope) {
                return scope;
            },

            /**
             * Found member of a given object. A member is a property from
             * an object, like a.b or a[b] in js.
             *
             * @param {Object} data         The data with member expression
             *                              inside
             * @param {Object} internal     Unused
             * @param {Object} scope        The scope associated
             * @return {Object | Null}      The object propery values
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
             * @param {Object} data         The identifier expression inside
             * @param {Object} internal     The object with variables currently
             *                              in use
             * @param {Object} scope        The scope in use
             * @return {Object | String}    The object propery values, or the
             *                              property string if not found.
            */
            identifierExpression: function (data, internal, scope) {
                if (scope.hasOwnProperty(data.name)) {
                    internal.increaseVar(data.name);
                    return scope[data.name];
                }

                return data.name;
            },

            /**
             * Found an array expression. This function will convert it
             * to true JS array.
             * Note: this function can have pretty bad side effect...
             *
             * @param {Object} data         The array structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Array}              A javascript version of array
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
             * @param {Object} data         The function calling arguments
             *                              and name
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed | Null}       The result of function call, or
             *                              null if function is not found in
             *                              scope
            */
            callExpression: function (data, internal, scope) {
                var fct = this.parse(data.callee, internal, scope),
                    args = [];

                if (a.isFunction(fct)) {
                    internal.decreaseVar(data.callee.name);

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
             *
             * @param {Object} data         The conditional structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The result of the if selector
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
             *
             * @param {Object} data         The compound structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Array}              An array of values
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
             * @param {Object} data         The unary structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The unary result
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
             * @param {Object} data         The binary structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The binary result
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
             * Logical operators like "||" or "&&".
             *
             * @param {Object} data         The logical structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed}              The logical result
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
             * @param {Object} data         The data structure
             * @param {Object} internal     Unused
             * @param {Object} scope        The current scope in use
             * @return {Mixed | Null}       The parsed result, or null in case
             *                              of problem
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

            /*!
             * @private
            */
        };
    }
};