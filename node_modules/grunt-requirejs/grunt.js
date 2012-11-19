module.exports = function(grunt) {

  grunt.loadTasks('tasks');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        '------------------------------\n' +
        'Build @ <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        'Documentation and Full License Available at:\n' +
        '<%= pkg.homepage %>\n' +
        '<%= pkg.repository.url %>\n' +
        'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n\n' +
        'Permission is hereby granted, free of charge, to any person obtaining a\n' +
        'copy of this software and associated documentation files (the "Software"),\n' +
        'to deal in the Software without restriction, including without limitation\n' +
        'the rights to use, copy, modify, merge, publish, distribute, sublicense,\n' +
        'and/or sell copies of the Software, and to permit persons to whom the\n\n' +
        'Software is furnished to do so, subject to the following conditions:\n' +
        'The above copyright notice and this permission notice shall be included in\n' +
        'all copies or substantial portions of the Software.\n\n' +
        'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,\n' +
        'EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
        'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n' +
        'IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n' +
        'DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,\n' +
        'ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS\n' +
        'IN THE SOFTWARE.*/'
    },
    test: {
      files: ['test/**/*.js']
    },

    qunit: {
      files: ['examples/**/tests/*.html']
    },

    lint: {
      files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    }
  });

  grunt.registerTask('prepare', function () {
    var done = this.async(),
        preparation = [false, false, false],
        checkForPreparation = function () {
          if (grunt.utils._.all(preparation, grunt.utils._.identity)) {
            grunt.log.ok('all examples build');
            done();
          }
        };

    // build libglobal example
    grunt.utils.spawn({
      cmd: 'grunt',
      args: ['build'],
      opts: {cwd: 'examples/libglobal'}
    }, function () {
      grunt.log.writeln('> "libglobal" example build');
      preparation[0] = true;
      checkForPreparation();
    });

    // build multipage example
    grunt.utils.spawn({
      cmd: 'grunt',
      args: ['build'],
      opts: {cwd: 'examples/multipage'}
    }, function () {
      grunt.log.writeln('> "multipage" example build');
      preparation[1] = true;
      checkForPreparation();
    });

    // build multipage-shim example
    grunt.utils.spawn({
      cmd: 'grunt',
      args: ['build'],
      opts: {cwd: 'examples/multipage-shim'}
    }, function () {
      grunt.log.writeln('> "multipage-shim" example build');
      preparation[2] = true;
      checkForPreparation();
    });

  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'lint test qunit');

  // Default task.
  grunt.registerTask('travis', 'prepare lint test qunit');
};