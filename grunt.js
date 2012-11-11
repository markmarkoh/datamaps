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
        '$': 'components/zepto/dist/zepto',
        'backbone': 'components/backbone/backbone'
      },
      shim: {
        'd3': {
          exports: 'd3'
        },
        'underscore': {
          exports: '_'
        },
        '$': {
          exports: '$'
        },
        'backbone': {
          deps: ['underscore', '$'],
          exports: 'Backbone'
        }
      },
      optimize: 'uglify',
      optimizeCss: 'none',
      //name: "views/Map",
      //out: "public/js/MapBuild.js",
      dir: 'dist',

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
          name: 'datamaps-us-only',
          create: true,
          include: ['almondLib', 'app/views/MapUsOnly']
        },
        {
          name: 'datamaps-stripped-us-only',
          create: true,
          exclude: ['$', 'underscore', 'backbone'],
          include: ['almondLib', 'app/views/MapUsOnly']
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