module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    replace: {
      dist: {
        options: {
          variables: {
            'key': 'poop'
          },
          prefix: '$$'
        },
        files: [
          {expand: true, flatten: true, src: ['public/js/datamaps.js'], dest: 'word/'}
        ]
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
    }
  });

  grunt.loadNpmTasks('grunt-replace');

};