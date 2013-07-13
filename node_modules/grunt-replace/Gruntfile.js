
/*
 *  Copyright 2013 outaTiME.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

module.exports = function (grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({

    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      test: ['tmp']
    },

    // Configuration to be run (and then tested).
    replace: {
      simple: {
        options: {
          variables: {
            'key': 'value'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/simple.txt'], dest: 'tmp/'}
        ]
      },
      prefix: {
        options: {
          variables: {
            'key': 'value'
          },
          prefix: '@replace:'
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/prefix.txt'], dest: 'tmp/'}
        ]
      },
      dynamic_key: {
        options: {
          variables: {
            '<%= "key" %>': 'value'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/dynamic_key.txt'], dest: 'tmp/'}
        ]
      },
      dynamic_value: {
        options: {
          variables: {
            'key': '<%= grunt.template.today("yyyy") %>'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/dynamic_value.txt'], dest: 'tmp/'}
        ]
      },
      cwd: {
        options: {
          variables: {
            'key': 'value'
          }
        },
        files: [
          {expand: true, cwd: 'test/fixtures/cwd/', src: ['**/*.txt'], dest: 'tmp/cwd/'}
        ]
      },
      flatten: {
        options: {
          variables: {
            'key': 'value'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/flatten/**/*.txt'], dest: 'tmp/flatten/'}
        ]
      },
      force: {
        options: {
          force: true
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/force.txt'], dest: 'tmp/'}
        ]
      },
      sort: {
        options: {
          variables: {
            'head': 'foo',
            'header': 'bar'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/sort.txt'], dest: 'tmp/'}
        ]
      },
      doc_cache: {
        options: {
          variables: {
            'year': '<%= grunt.template.today("yyyy") %>'
          }
        },
        files: [
          {src: ['test/fixtures/cache.html'], dest: 'tmp/cache.html'}
        ]
      },
      doc_include: {
        options: {
          variables: {
            'include': '<%= grunt.file.read("test/fixtures/content.txt") %>'
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/include.txt'], dest: 'tmp/'}
        ]
      },
      escape: {
        options: {
          variables: {
            'key': "$'"
          }
        },
        files: [
          {expand: true, flatten: true, src: ['test/fixtures/escape.txt'], dest: 'tmp/'}
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

    watch: {
      files: '<config:lint.all>',
      tasks: 'default'
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Load helper plugins for testing.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the 'test' task is run, first clean the 'tmp' dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'replace', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
