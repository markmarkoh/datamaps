module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'public/js/app/**/*.js']
    },
    requirejs: {
        baseUrl: 'public/js',
        //namespace: 'datamaps',
        paths: {
          'requireLib': 'components/requirejs/require',
          'almondLib': '../../build/almond',
          'd3': 'components/d3/d3.v2',
          'underscore': 'components/underscore/underscore',
          'jquery': 'components/zepto/dist/zepto',
          'backbone': 'components/backbone/backbone'
        },
        shim: {
          'd3': {
            exports: 'd3'
          },
          'underscore': {
            exports: '_'
          },
          'jquery': {
            exports: '$'
          },
          'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
          }
        },
        optimize: 'uglify',
        optimizeCss: 'none',
        dir: 'dist',
        pragmas: {
          hasDeps: true
        },

        wrap: {
          startFile: "build/wrap_start.frag",
          endFile: "build/wrap_end.frag"
        },
        modules: [
          {
            name: 'datamaps',
            create: true,
            include: ['almondLib', 'app/views/MapCountriesOnly']
          },
          {
            name: 'datamaps-stripped-countries-only',
            create: true,
            exclude: ['jquery', 'underscore', 'backbone'],
            include: ['almondLib', 'app/views/MapCountriesOnly'],
            override: {
                pragmasOnSave: {
                    hasDeps: false
                }
            }
          },
          {
            name: 'datamaps-us-only',
            create: true,
            include: ['almondLib', 'app/views/MapUsOnly'],
            insertRequire: ['app/views/MapUsOnly']
          },
          {
            name: 'datamaps-stripped-us-only',
            create: true,
            exclude: ['jquery', 'underscore', 'backbone'],
            include: ['almondLib', 'app/views/MapUsOnly'],
            insertRequire: ['app/views/MapUsOnly'],
            override: {
                pragmasOnSave: {
                    hasDeps: false
                }
            }
          }
        ]
    },
    concat: {
      us: {
        src: [
          'public/js/app/data/map-data-prefix.txt',
          'public/js/app/data/us-states.json',
          'public/js/app/data/map-data-suffix.txt'
        ],
        dest: 'public/js/app/data/us-states-build.js'
      },
      world: {
        src: [
          'public/js/app/data/map-data-prefix.txt',
          'public/js/app/data/world-countries.json',
          'public/js/app/data/map-data-suffix.txt'
        ],
        dest: 'public/js/app/data/world-countries-build.js'
      },
      all: {
        src: [
          'public/js/app/data/map-data-prefix.txt',
          'public/js/app/data/world-countries.json',
          'public/js/app/data/us-states.json',
          'public/js/app/data/map-data-suffix.txt'
        ],
        dest: 'public/js/app/data/world-countries-and-us-states-build.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-requirejs');
  // Default task.

  grunt.registerTask('default', 'lint');

};