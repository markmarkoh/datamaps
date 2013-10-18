module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    replace: {
      world: {
        src: ['public/js/datamaps.js'],
        dest: 'public/rel/datamaps.world.js',
        replacements: [{
          from: '\'__WORLD__\'',
          to: '<%= grunt.file.read("public/js/data/world.topo.json") %>'
        }]
      },
      usa: {
        src: ['public/js/datamaps.js'],
        dest: 'public/rel/datamaps.usa.js',
        replacements: [{
          from: '\'__USA__\'',
          to: '<%= grunt.file.read("public/js/data/usa.topo.json") %>'
        }]
      },
      all: {
        src: ['public/js/datamaps.js'],
        dest: 'public/rel/datamaps.all.js',
        replacements: [{
          from: '\'__USA__\'',
          to: '<%= grunt.file.read("public/js/data/usa.topo.json") %>'
        }, {
          from: '\'__WORLD__\'',
          to: '<%= grunt.file.read("public/js/data/world.topo.json") %>'
        }]
      }
    },
    watch: {
      datamap: {
        files: ['public/js/datamaps.js'],
        tasks: ['replace'],
    }
  },
   uglify: {
      dist: {
        files: {
          'public/rel/datamaps.world.min.js': ['public/rel/datamaps.world.js'],
          'public/rel/datamaps.usa.min.js': ['public/rel/datamaps.usa.js'],
          'public/rel/datamaps.all.min.js': ['public/rel/datamaps.all.js'],
          'public/rel/datamaps.none.min.js': ['public/js/datamaps.js']
        }
      }
    },
    jasmine: {
      all: [
        'public/tests/SpecRunner_StatesGlobal.html',
        'public/tests/SpecRunner_StatesStripped.html',
        'public/tests/SpecRunner_CountriesStripped.html',
        'public/tests/SpecRunner_CountriesGlobal.html',
        'public/tests/SpecRunner_AllStripped.html',
        'public/tests/SpecRunner_AllGlobal.html',
        'public/tests/SpecRunner_jQueryPlugin.html'
      ]
    },
    copy: {
      all: {
        files: [
          { src: ['public/rel/*.js'], dest: './', flatten: true, expand: true }
        ]
      }
    },
    clean: {
      release: ['./datamaps.*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('dev', ['replace']);
  grunt.registerTask('build', ['replace', 'uglify:dist', 'copy']);

};
