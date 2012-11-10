module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'public/js/app/**/*.js']
    },
    requirejs: {
      baseUrl: 'public/js/app',
      namespace: 'datamaps',
      paths: {
          requireLib: 'require',
          app: '../app',
          jquery: '../lib/jquery',
          d3: '../lib/d3',
          projections: '../lib/projections',
          underscore: '../lib/underscore',
          backbone: '../lib/backbone'
        },
        optimize: 'none',
        //name: "views/Map",
        //out: "public/js/MapBuild.js",

        modules: [
          {
            name: 'datamaps',
            create: true,
            include: ['requireLib', 'views/Map']
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