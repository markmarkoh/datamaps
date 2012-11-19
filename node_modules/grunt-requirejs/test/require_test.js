var grunt = require('grunt');
// Load local tasks.
grunt.loadTasks('tasks');

exports['require'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  // require_size_info helper test
  'testRequireSizeInfoHelper': function(test) {
    var helperValuesSeriesA = grunt.helper('require_size_info', 'a', true, 'foo'),
        helperValuesSeriesB = grunt.helper('require_size_info', 'b', false, 'foobar');
    test.expect(8);

    // tests here
    test.equal(helperValuesSeriesA.module, 'a', 'Should determine the module');
    test.equal(helperValuesSeriesA.gzipSize, 23, 'Should determine the correct gzip size');
    test.equal(helperValuesSeriesA.fileSize, 3, 'Should determine the correct "file" size');
    test.equal(helperValuesSeriesA.message, 'Compressed size for module "a": \u001b[32m23\u001b[39m bytes gzipped (\u001b[32m3\u001b[39m bytes minified).', 'Should output the correct message');

    test.equal(helperValuesSeriesB.module, 'b', 'Should determine the module');
    test.equal(helperValuesSeriesB.gzipSize, 26, 'Should determine the correct gzip size');
    test.equal(helperValuesSeriesB.fileSize, 6, 'Should determine the correct "file" size');
    test.equal(helperValuesSeriesB.message, 'Compressed size for module "b": \u001b[32m26\u001b[39m bytes gzipped (\u001b[32m6\u001b[39m bytes uncompressed).');

    test.done();
  },
  'almond helper runs callback even if almond: false': function(test) {
    var wasCalled = false,
        options = {
          config: {
            modules: []
          },
          almond: false,
          cb: function() {
            wasCalled = true;
          }
        };

    grunt.helper('almond', options);
    test.equal(true, wasCalled);
    test.done();
  }
};
