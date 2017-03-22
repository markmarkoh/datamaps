/*!
 * QUnit CLI Boilerplate v1.3.0
 * Copyright 2011-2012 John-David Dalton <http://allyoucanleet.com/>
 * Based on a gist by Jörn Zaefferer <https://gist.github.com/722381>
 * Available under MIT license <http://mths.be/mit>
 */
;(function(root) {
  'use strict';

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports;

  /** Detect free variable `global`, from Node.js or Browserified code, and use it as `root` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Installs the CLI boilerplate additions on the given `context` object.
   *
   * @memberOf exports
   * @param {Object} context The context object.
   */
  function runInContext(context) {
    // exit early if no `context` is provided or if `QUnit` does not exist
    if (!context || !context.QUnit) {
      return;
    }

    /**
     * Schedules timer-based callbacks.
     *
     * @private
     * @param {Function|string} fn The function to call.
     * @param {number} delay The number of milliseconds to delay the `fn` call.
     * @param [arg1, arg2, ...] Arguments to invoke `fn` with.
     * @param {boolean} repeated A flag to specify whether `fn` is called repeatedly.
     * @returns {number} The the ID of the timeout.
     */
    function schedule(fn, delay, args, repeated) {
      // Rhino 1.7RC4 will error assigning `task` below
      // https://bugzilla.mozilla.org/show_bug.cgi?id=775566
      var task = ids[++counter] = new JavaAdapter(java.util.TimerTask, {
        'run': function() {
          fn.apply(context, args);
        }
      });
      // support non-functions
      if (typeof fn != 'function') {
        fn = (function(code) {
          code = String(code);
          return function() { eval(code); };
        }(fn));
      }
      // used by setInterval
      if (repeated) {
        timer.schedule(task, delay, delay);
      }
      // used by setTimeout
      else {
        timer.schedule(task, delay);
      }
      return counter;
    }

    /**
     * Clears the delay set by `setInterval` or `setTimeout`.
     *
     * @memberOf context
     * @param {number} id The ID of the timeout to be cleared.
     */
    function clearTimer(id) {
      if (ids[id]) {
        ids[id].cancel();
        timer.purge();
        delete ids[id];
      }
    }

    /**
     * Executes a code snippet or function repeatedly, with a delay between each call.
     *
     * @memberOf context
     * @param {Function|string} fn The function to call or string to evaluate.
     * @param {number} delay The number of milliseconds to delay each `fn` call.
     * @param [arg1, arg2, ...] Arguments to invoke `fn` with.
     * @returns {number} The the ID of the timeout.
     */
    function setInterval(fn, delay) {
      return schedule(fn, delay, slice.call(arguments, 2), true);
    }

    /**
     * Executes a code snippet or a function after specified delay.
     *
     * @memberOf context
     * @param {Function|string} fn The function to call or string to evaluate.
     * @param {number} delay The number of milliseconds to delay the `fn` call.
     * @param [arg1, arg2, ...] Arguments to invoke `fn` with.
     * @returns {number} The the ID of the timeout.
     */
    function setTimeout(fn, delay) {
      return schedule(fn, delay, slice.call(arguments, 2));
    }

    /*------------------------------------------------------------------------*/

    /** Add `console.log()` support for Narwhal, Rhino, and RingoJS */
    var console = context.console || (context.console = { 'log': context.print });

    /** Shorten `context.QUnit.QUnit` to `context.QUnit` */
    var QUnit = context.QUnit = context.QUnit.QUnit || context.QUnit;

    /** Used as a horizontal rule in console output */
    var hr = '----------------------------------------';

    /**
     * A logging callback triggered when all testing is completed.
     *
     * @memberOf QUnit
     * @param {Object} details An object with properties `failed`, `passed`, `runtime`, and `total`.
     */
    QUnit.done(function() {
      var ran;
      return function(details) {
        // stop `asyncTest()` from erroneously calling `done()` twice in
        // environments w/o timeouts
        if (ran) {
          return;
        }
        ran = true;

        console.log(hr);
        console.log('    PASS: ' + details.passed + '  FAIL: ' + details.failed + '  TOTAL: ' + details.total);
        console.log('    Finished in ' + details.runtime + ' milliseconds.');
        console.log(hr);

        // exit out of Narhwal, Rhino, or Ringo
        try {
          quit();
        } catch(e) { }

        // exit out of Node.js or PhantomJS
        try {
          var process = context.process || context.phantom;
          if (details.failed) {
            console.error('Error: ' + details.failed + ' of ' + details.total + ' tests failed.');
            process.exit(1);
          } else {
            process.exit(0);
          }
        } catch(e) { }
      };
    }());

    /**
     * A logging callback triggered after every assertion.
     *
     * @memberOf QUnit
     * @param {Object} details An object with properties `actual`, `expected`, `message`, and `result`.
     */
    QUnit.log(function(details) {
      var expected = details.expected,
          result = details.result,
          type = typeof expected != 'undefined' ? 'EQ' : 'OK';

      var assertion = [
        result ? 'PASS' : 'FAIL',
        type,
        details.message || 'ok'
      ];

      if (!result && type == 'EQ') {
        assertion.push('Expected: ' + expected + ', Actual: ' + details.actual);
      }
      QUnit.config.testStats.assertions.push(assertion.join(' | '));
    });

    /**
     * A logging callback triggered at the start of every test module.
     *
     * @memberOf QUnit
     * @param {Object} details An object with property `name`.
     */
    QUnit.moduleStart(function(details) {
      console.log(hr);
      console.log(details.name);
      console.log(hr);
    });

    /**
     * Converts an object into a string representation.
     *
     * @memberOf QUnit
     * @type Function
     * @param {Object} object The object to stringify.
     * @returns {string} The result string.
     */
    QUnit.jsDump.parsers.object = (function() {
      var func = QUnit.jsDump.parsers.object;
      return function(object) {
        // fork to support Rhino's error objects
        if (typeof object.rhinoException == 'object') {
          return object.name +
            ' { message: "' + object.message +
            '", fileName: "' + object.fileName +
            '", lineNumber: ' + object.lineNumber + ' }';
        }
        return func(object);
      };
    }());

    /**
     * A logging callback triggered after a test is completed.
     *
     * @memberOf QUnit
     * @param {Object} details An object with properties `failed`, `name`, `passed`, and `total`.
     */
    QUnit.testDone(function(details) {
      var assertions = QUnit.config.testStats.assertions,
          testName = details.name;

      if (details.failed > 0) {
        console.log(' FAIL - '+ testName);
        assertions.forEach(function(value) {
          console.log('    ' + value);
        });
      }
      else {
        console.log(' PASS - ' + testName);
      }
      assertions.length = 0;
    });

    /**
     * An object used to hold information about the current running test.
     *
     * @memberOf QUnit.config
     * @type Object
     */
    QUnit.config.testStats = {

      /**
       * An array of test summaries (pipe separated).
       *
       * @memberOf QUnit.config.testStats
       * @type Array
       */
      'assertions': []
    };

    /*------------------------------------------------------------------------*/

    // Timeout fallbacks based on the work of Andrea Giammarchi and Weston C.
    // https://github.com/WebReflection/wru/blob/master/src/rhinoTimers.js
    // http://stackoverflow.com/questions/2261705/how-to-run-a-javascript-function-asynchronously-without-using-settimeout
    try {
      var counter = 0,
          ids = {},
          slice = Array.prototype.slice,
          timer = new java.util.Timer;

      context.clearInterval =
      context.clearTimeout = clearTimer;
      context.setInterval = setInterval;
      context.setTimeout = setTimeout;
    } catch(e) { }

    // expose shortcuts
    // exclude `module` because some environments have it as a built-in object
    ('asyncTest deepEqual equal equals expect notDeepEqual notEqual notStrictEqual ' +
     'ok raises same start stop strictEqual test throws').replace(/\S+/g, function(methodName) {
      context[methodName] = QUnit[methodName];
    });

    // must call `QUnit.start()` in the test file if not loaded in a browser
    if (!context.document || context.phantom) {
      QUnit.config.autostart = false;
      QUnit.init();
    }
  }

  /*--------------------------------------------------------------------------*/

  // expose QUnit CLIB
  if (freeExports && !freeExports.nodeType) {
    freeExports.runInContext = runInContext;
  } else {
    runInContext(root);
  }
}(this));
