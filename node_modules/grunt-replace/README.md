# grunt-replace [![Build Status](https://secure.travis-ci.org/outaTiME/grunt-replace.png?branch=master)](http://travis-ci.org/outaTiME/grunt-replace)

> Replace inline patterns with variables.



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-replace --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-replace');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use [v0.3.2](https://github.com/outaTiME/grunt-replace/tree/grunt-0.3-stable).*



## Replace task
_Run this task with the `grunt replace` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.
### Options

##### variables
Type: `Object`

This option is used to define patterns that will be used to replace the contents of source files.

```javascript
options: {
  variables: {
    'foo': 'bar'
  }
}
```

##### prefix
Type: `String`

This option is used to create the real pattern for lookup in source files (Defaults `@@`).

##### force
Type: `Boolean`

This option force the copy of files even when those files don't have any replace token. Useful when copying a directory.

### Usage Examples

```js
replace: {
  dist: {
    options: {
      variables: {
        'key': 'value'
      },
      prefix: '@@'
    },
    files: [
      {expand: true, flatten: true, src: ['test/fixtures/prefix.txt'], dest: 'tmp/'}
    ]
  }
}
```

#### Variable pattern in source

Define the place where variable will be injected:

```
// build/manifest.appcache

CACHE MANIFEST
# @@timestamp

CACHE:

favicon.ico
index.html

NETWORK:
*
```

##### Gruntfile

Define timestamp variable and destination of the source files:

```js
replace: {
  dist: {
    options: {
      variables: {
        'timestamp': '<%= grunt.template.today() %>'
      }
    },
    files: [
      {expand: true, flatten: true, src: ['build/manifest.appcache'], dest: 'public/'}
    ]
  }
}
```

#### Replace over source files (deploy in one target)

```js
replace: {
  dist: {
    options: {
      variables: {
        version: '<%= pkg.version %>',
        timestamp: '<%= grunt.template.today() %>'
      }
    },
    files: [
      {expand: true, flatten: true, src: ['build/manifest.appcache', 'build/humans.txt'], dest: 'public/'}
    ]
  }
}
```

#### Easy cache busting

In app/assets/index.html:

```html
<head>
  <link rel="stylesheet" href="/css/style.css?rel=@@timestamp">
  <script src="/js/app.js?rel=@@timestamp"></script>
</head>
```

##### Gruntfile

```js
replace: {
  dist: {
    options: {
      variables: {
        'timestamp': '<%= new Date().getTime() %>'
      }
    },
    files: [
      {src: ['app/assets/index.html'], dest: 'build/index.html'}
    ]
  }
}
```

#### Include file contents inplace

In build/index.html:

```html
<body>
  @@include
</body>
```

##### Gruntfile

```js
replace: {
  dist: {
    options: {
      variables: {
        'include': '<%= grunt.file.read("includes/content.html") %>'
      }
    },
    files: [
      {expand: true, flatten: true, src: ['build/index.html'], dest: 'public/'}
    ]
  }
}
```


## Release History

 * 2013-05-03   v0.4.4   Fix escape $ before performing regexp replace (thanks @warpech).
 * 2013-04-14   v0.4.3   Detect path destinations correctly on Windows.
 * 2013-04-02   v0.4.2   Add peerDependencies and update description.
 * 2013-04-02   v0.4.1   Add trace when force flag.
 * 2013-02-28   v0.4.0   First official release for Grunt 0.4.0.
 * 2012-11-20   v0.3.2   New examples added.
 * 2012-09-25   v0.3.1   Rename grunt-contrib-lib dep to grunt-lib-contrib, add force flag.
 * 2012-09-25   v0.3.0   General cleanup and consolidation. Global options depreciated.

---

Task submitted by [Ariel Falduto](http://outa.im/)
