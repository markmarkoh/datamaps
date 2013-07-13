var grunt = require('grunt');

exports['replace'] = {
  main: function(test) {

    'use strict';

    var expect, result, bool_result, re;

    test.expect(11);

    expect = 'value\n';
    result = grunt.file.read('tmp/simple.txt');
    test.equal(expect, result, 'should replace simple key with value');

    expect = 'value\n';
    result = grunt.file.read('tmp/prefix.txt');
    test.equal(expect, result, 'should replace simple key with value using custom prefix');

    expect = 'value\n';
    result = grunt.file.read('tmp/dynamic_key.txt');
    test.equal(expect, result, 'should replace templated key with defined value');

    expect = grunt.template.today('yyyy') + "\n";
    result = grunt.file.read('tmp/dynamic_value.txt');
    test.equal(expect, result, 'should replace simple key with templated value');

    expect = 'value\n';
    result = grunt.file.read('tmp/cwd/foo.txt');
    bool_result = expect === result;
    result = grunt.file.read('tmp/cwd/foo/bar.txt');
    bool_result = bool_result && expect === result;
    test.equal(true, bool_result, 'should replace simple key with value (in directory cwd mode)');

    expect = 'value\n';
    result = grunt.file.read('tmp/flatten/foo.txt');
    bool_result = expect === result;
    result = grunt.file.read('tmp/flatten/bar.txt');
    bool_result = bool_result && expect === result;
    test.equal(true, bool_result, 'should replace simple key with value (in directory flatten mode)');

    expect = '@@key\n';
    result = grunt.file.read('tmp/force.txt');
    test.equal(expect, result, 'should force copy of files (dont have any replace token)');

    expect = 'foobar\n';
    result = grunt.file.read('tmp/sort.txt');
    test.equal(expect, result, 'should sort the locals to prevent bad replaces');

    expect = 2;
    result = grunt.file.read('tmp/cache.html');
    re = new RegExp("\\?rel=" + grunt.template.today('yyyy'), "g");
    test.equal(expect, result.match(re).length, 'should expect two replaces in html cache file');

    expect = 'foo\n\n';
    result = grunt.file.read('tmp/include.txt');
    test.equal(expect, result, 'should include the content file');

    expect = "$'\n";
    result = grunt.file.read('tmp/escape.txt');
    test.equal(expect, result, 'should escape the dollar sign ($)');

    test.done();
  }
};
