/*global module:false*/
module.exports = function(grunt) {

    // replace this line with
    // grunt.loadNpmTasks("require-js");
    // if you use this example standalone
    grunt.loadTasks("../../tasks");

    grunt.initConfig({

        lint: {
            files: ["www/js/app/*.js", "www/js/common.js", "www/js/page1.js", "www/js/page2.js"]
        },

        qunit: {
            files: ["tests/index.html"]
        },

        requirejs: {
            appDir: "www",
            baseUrl: "js/lib",
            paths: {
                app: "../app"
            },
            dir: "www-built",
            modules: [
                //First set up the common build layer.
                {
                    //module names are relative to baseUrl
                    name: "../common",
                    //List common dependencies here. Only need to list
                    //top level dependencies, "include" will find
                    //nested dependencies.
                    include: ["jquery",
                              "app/lib",
                              "app/controller/Base",
                              "app/model/Base"
                    ]
                },

                //Now set up a build layer for each page, but exclude
                //the common one. "exclude" will exclude nested
                //the nested, built dependencies from "common". Any
                //"exclude" that includes built modules should be
                //listed before the build layer that wants to exclude it.
                //"include" the appropriate "app/main*" module since by default
                //it will not get added to the build since it is loaded by a nested
                //require in the page*.js files.
                {
                    //module names are relative to baseUrl/paths config
                    name: "../page1",
                    include: ["app/main1"],
                    exclude: ["../common"]
                },

                {
                    //module names are relative to baseUrl
                    name: "../page2",
                    include: ["app/main2"],
                    exclude: ["../common"]
                }
            ]
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