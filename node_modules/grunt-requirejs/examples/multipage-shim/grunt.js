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
            files: ["tests/*.html"]
        },

        requirejs: {
            appDir: "www",
            mainConfigFile: "/www/js/common.js",
            dir: "www-built",
            modules: [
                //First set up the common build layer.
                {
                    //module names are relative to baseUrl
                    name: "../common",
                    //List common dependencies here. Only need to list
                    //top level dependencies, "include" will find
                    //nested dependencies.
                    include: [
                        "jquery",
                        "app/lib",
                        "app/controller/Base",
                        "app/model/Base"
                    ]
                },
                //Now set up a build layer for each main layer, but exclude
                //the common one. "exclude" will exclude nested
                //the nested, built dependencies from "common". Any
                //"exclude" that includes built modules should be
                //listed before the build layer that wants to exclude it.
                //The "page1" and "page2" modules are **not** the targets of
                //the optimization, because shim config is in play, and
                //shimmed dependencies need to maintain their load order.
                //In this example, common.js will hold jquery, so backbone
                //needs to be delayed from loading until common.js finishes.
                //That loading sequence is controlled in page1.js.
                {
                    //module names are relative to baseUrl/paths config
                    name: "app/main1",
                    exclude: ["../common"]
                },

                {
                    //module names are relative to baseUrl
                    name: "app/main2",
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