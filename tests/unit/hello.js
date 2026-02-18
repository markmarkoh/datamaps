define([
    'intern!object',
    'intern/chai!assert',
    'datamaps'
], function (registerSuite, assert, datamaps) {
  var hello = {
    greet: function(name) { return 'Hello, ' + (name ? name : 'world') + '!';}
  };
    registerSuite({
        name: 'yaoming',

        greet: function () {
            assert.strictEqual(hello.greet('Murray'), 'Hello, Murray!', 'hello.greet should return a greeting for the person named in the first argument');
            assert.strictEqual(hello.greet(), 'Hello, world!', 'hello.greet with no arguments should return a greeting to "world"');
        }
    });});