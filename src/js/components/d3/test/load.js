process.env.TZ = "America/Los_Angeles";

var smash = require("smash"),
    jsdom = require("jsdom");

require("./XMLHttpRequest");

module.exports = function() {
  var files = [].slice.call(arguments).map(function(d) { return "src/" + d; }),
      expression = "d3",
      sandbox = {Date: Date}; // so we can use deepEqual in tests

  files.unshift("src/start");
  files.push("src/end");

  function topic() {
    var callback = this.callback;
    smash.load(files, expression, sandbox, function(error, result) {
      if (error) console.trace(error.stack);
      callback(error, result);
    });
  }

  topic.expression = function(_) {
    expression = _;
    return topic;
  };

  topic.document = function(_) {
    var document = jsdom.jsdom("<html><head></head><body></body></html>");

    // Monkey-patch createRange support to JSDOM.
    document.createRange = function() {
      return {
        selectNode: function() {},
        createContextualFragment: jsdom.jsdom
      };
    };

    sandbox = {
      console: console,
      XMLHttpRequest: XMLHttpRequest,
      document: document,
      window: document.createWindow(),
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      Date: Date // so we can override Date.now in tests, and use deepEqual
    };

    return topic;
  };

  return topic;
};

process.on("uncaughtException", function(e) {
  console.trace(e.stack);
});
