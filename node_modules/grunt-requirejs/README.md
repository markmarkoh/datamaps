# grunt-require

Use [@cowboys](https://github.com/cowboy) wonderful js based optimizer [grunt](https://github.com/cowboy/grunt)
together with [@jrburkes](https://github.com/jrburke) [r.js](https://github.com/jrburke/r.js) optimizer,
to build your AMD based projects with grunt.

Now with [almond](https://github.com/jrburke/almond) goodness.

[![Build Status](https://secure.travis-ci.org/asciidisco/grunt-requirejs.png?branch=master)](http://travis-ci.org/asciidisco/grunt-requirejs)

## Upgrade warning
I removed the 'clearTarget' config option from the plugin, because i want you all
to go to [grunt-contrib](https://github.com/gruntjs/grunt-contrib) page and use their
'clean' task instead!

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-requirejs`

Then add this line to your project's `grunt.js` gruntfile.

```javascript
grunt.loadNpmTasks('grunt-requirejs');
```

### Resources

+ [grunt](https://github.com/cowboy/grunt)
+ [getting_started](https://github.com/cowboy/grunt/blob/master/docs/getting_started.md)
+ [requirejs](http://requirejs.org)
+ [almond](https://github.com/jrburke/almond)
+ [grunt-contrib](https://github.com/gruntjs/grunt-contrib)

## Documentation
Load the grunt-requirejs task as described in 'Getting started' and add your r.js optimizer
configuration to your grunt file:

Example require js optimizer grunt file config entry:

```javascript

// ... grunt file contents
 requirejs: {
      dir: 'build',
      appDir: 'src',
      baseUrl: 'js',
      paths: {
          underscore: '../vendor/underscore',
          jquery    : '../vendor/jquery',
          backbone  : '../vendor/backbone'
      },
      pragmas: {
          doExclude: true
      },
      skipModuleInsertion: false,
      optimizeAllPluginResources: true,
      findNestedDependencies: true
    }

// ... even more grunt file contents
```

You see, there is no difference in declaring your require config when your using your gruntfile
instead of using a separate requirejs config file.

## Almond
If you like to replace require.js with almond.js during the build process, grunt-requirejs comes with an
experimental [almond](https://github.com/jrburke/almond) injection mode. It even converts your require
script calls in your html files to call the 'almondyfied' module, instead of calling require.js
that then calls (e.g.) loads the module.

The only constraint for using the auto almond insertion is, that you at least define one module
(mostly named 'main').

```javascript
// ... grunt file contents
 requirejs: {
      // almond specific contents
      // *insert almond in all your modules
      almond: true,
      // *replace require script calls, with the almond modules
      // in the following files
      replaceRequireScript: [{
        files: ['build/index.html'],
        module: 'main'
      }],
      // "normal" require config
      // *create at least a 'main' module
      // thats necessary for using the almond auto insertion
      modules: [{name: 'main'}],
      dir: 'build',
      appDir: 'src',
      baseUrl: 'js',
      paths: {
          underscore: '../vendor/underscore',
          jquery    : '../vendor/jquery',
          backbone  : '../vendor/backbone'
      },
      pragmas: {
          doExclude: true
      },
      skipModuleInsertion: false,
      optimizeAllPluginResources: true,
      findNestedDependencies: true
    }

// ... even more grunt file contents
```
### Special case, the 'out' property

If you define a special output name for your generated module file,
you have to specify a "modulePath" property inside your "replaceRequireScript" configuration

```javascript
requirejs: {
    almond: true,
    replaceRequireScript: [{
        files: ['index.html'],
        module: 'main',
        modulePath: '/js/main-build'
    }],
    baseUrl: "js",
    paths: {
        'Handlebars': 'libs/Handlebars',
        'Backbone': 'libs/backbone',
        'underscore': 'libs/underscore',
        'json2': 'libs/json2',
    },
    out: 'js/main-build.js'
}
```

### require function not found after almond integration
First occured in [issue #3](https://github.com/asciidisco/grunt-requirejs/issues/3).
You probably have to set

```javascript
requirejs: {
    wrap: true
}
```

like described here: [https://github.com/jrburke/almond#usage](https://github.com/jrburke/almond#usage)

## Dual Config
By default it is assumed that your are using the optimizer for only JS or CSS not both. However should you wish to use require.js to optimize your CSS in addition to your JS, this is possible using a dual config. This will allow you to maintain your config options for both your CSS and JS under the requirejs key in your grunt.js.

```javascript

// ... grunt file contents
 requirejs: {

      js: {
        // config for js
      },

      css: {
        // config for css
      }

    }

// ... even more grunt file contents
```
Then when calling your task you can pass as an argument the mode your wish to run the task in.

```javascript
grunt.registerTask('release', 'requirejs:css', 'requirejs:js');
```

or

```javascript
> grunt requirejs:js
> grunt requirejs:css
```

If no argument is specified, then the task will look for the approprate config in the following order, JS, CSS and then finally it will use whatever config has been defined if neither JS or CSS is found.

## Release History
### 0.2.13
+ fixes package.json dependecy versions

### 0.2.12
+ fixes issue of r.js almond-based dependency mixup (added by @chrissrogers)

### 0.2.11
+ Fixed issue #17 (almond: false, causes build to fail)
+ Added example projects

### 0.2.10
+ Fixed issue #4
+ Fixed issue #8

### 0.2.9
+ Removed jQuery dependency and replaced it with cheerio
+ Updated versions of 3rd party libs

### 0.2.8
+ RequireJS Version bump to 2.0

### 0.2.7
+ Removed npm dependency for tracing the almond file
+ Added some informations in the readme about the almond 'wrap=true'

### 0.2.6
+ Added 'modulePath' configuration option for specifying your modules path
+ Added 'modulePath' documentation

### 0.2.5
+ Added dual config
+ Optimized almond integration (removed npm dependency)
+ Readme updates
+ requirejs isnt a multi task anymore

### 0.2.0
+ Removed clearTarget (use grunt-contrib clean instead)
+ Added [almond](https://github.com/jrburke/almond) integration
+ Added automatic almond js module script tag replacement for html files
+ Improved documentation

### 0.1.0
+ Initial Release

## License
Copyright (c) 2012 asciidisco
Licensed under the MIT license.