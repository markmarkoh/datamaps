/*global module:false*/
module.exports = function(grunt) {

    // replace this line with
    // grunt.loadNpmTasks("require-js");
    // if you use this example standalone
    grunt.loadTasks("../../tasks");

    grunt.initConfig({

        lint: {
            files: ["principium/*.js", "principium.js"]
        },

        qunit: {
            files: ["tests/*.html"]
        },

        requirejs: {
            almond: true,
            baseUrl: "lib",
            paths: {
                principium: "../principium"
            },
            include: ["principium"],
            exclude: ["jquery", "underscore"],
            out: "dist/principium.js",
            wrap: {
                startFile: "wrap/wrap.start",
                endFile: "wrap/wrap.end"
            }
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
                eqnull: true,
                browser: true,
                nomen: true
            },
            globals: {
                define: true
            }
        }
    });

    grunt.registerTask('default', 'lint qunit');
    grunt.registerTask('build', 'requirejs');
};