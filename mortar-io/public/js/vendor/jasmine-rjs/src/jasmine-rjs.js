/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function(root) {

  var identity = function(value) {
    return value;
  };

  var map = function(array, fn, ctx) {
    var newArray = [];
    for (var i = 0, size = array.length; i < size; ++i) {
      newArray[i] = fn.call(ctx, array[i], i, array);
    }
    return newArray;
  };

  var toArray = function(collection) {
    return map(collection, identity);
  };

  var trim = function(str) {
    if (String.prototype.trim) {
      return String.prototype.trim.call(str);
    }

    return String.prototype.replace.call(str, /^\s+|\s+$/g, '');
  };

  var isString = function(o) {
    return Object.prototype.toString.call(o) === '[object String]';
  };

  var isFunction = function(o) {
    return Object.prototype.toString.call(o) === '[object Function]';
  };

  var normalizeParameterName = function(name) {
    // If parameter is written as '_param_', remove first and last '_'.
    if (name.charAt(0) === '_' && name.charAt(name.length - 1) === '_') {
      return name.slice(1, name.length - 1);
    }

    return name;
  };

  var extractParameterNames = function(func) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;

    var fnStr = trim(func.toString()).replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

    if(result === null) {
      result = [];
    }

    return map(result, normalizeParameterName);
  };

  var parseArgs = function(array, onLoaded) {
    if (isFunction(array)) {
      onLoaded = array;
      array = extractParameterNames(onLoaded);
    } else if (isString(array)) {
      array = [array];
    }

    return {
      deps: array,
      fn: onLoaded
    };
  };

  var r = function(ctx, args, done) {
    require(args.deps, function() {
      args.fn.apply(ctx, toArray(arguments));
      done();
    });
  };

  var rjs = {
    1: function(array, onLoaded) {
      var args = parseArgs(array, onLoaded);
      return function() {
        var flag = false;

        r(this, args, function() {
          flag = true;
        });

        waitsFor(function() {
          return flag;
        });
      };
    },

    2: function(array, onLoaded) {
      var args = parseArgs(array, onLoaded);
      return function(done) {
        r(this, args, done);
      };
    }
  };

  var VERSION = (function() {
    var v = jasmine.version_ || jasmine.version;

    if (v.major) {
      v = v.major;
    } else {
      v = parseInt(v.split('.')[0], 10);
    }

    return v;
  })();

  // Register rjs function according to jasmine version (with a fallback to jasmine 2).
  jasmine.rjs = root.rjs = rjs[VERSION] || rjs[2];

})(this);