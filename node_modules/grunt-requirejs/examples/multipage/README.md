# requirejs/example-multipage

This project shows how to set up a multi-page requirejs-based project that has
the following goals:

* Each page uses a mix of common and page-specific modules.
* All pages share the same requirejs config.
* After an optimization build, the common items should be in a shared common
layer, and the page-specific modules should be in a page-specific layer.
* The HTML page should not have to be changed after doing the build.

**If you want to use [shim config](http://requirejs.org/docs/api.html#config-shim)**, for instance to load Backbone, see
the [requirejs/example-multipage-shim](https://github.com/requirejs/example-multipage-shim)
example instead. This project will not work well with shim config. This project works
best when all the dependencies are AMD modules.

## Getting this project template

If you are using [volo](https://github.com/volojs/volo):

    volo create projectname requirejs/example-multipage

Otherwise,
[download latest zipball of master](https://github.com/requirejs/example-multipage/zipball/master).

## Project layout

This project has the following layout:

* **tools**: The requirejs optimizer, **r.js**, and the optimizer config,
**build.js.**
* **www**: The code that runs in the browser while in development mode.
* **www-built**: Generated after an optimizer build. Contains the built code
that can be deployed to the live site.

This **www** has the following layout:


* **page1.html**: page 1 of the app.
* **page2.html**: page 2 of the app.
* **js**
    * **app**: the directory to store app-specific modules.
    * **lib**: the directory to hold third party modules, like jQuery.
    * **common.js**: contains the requirejs config, and it will be the build
    target for the set of common modules.
    * **page1.js**: used for the data-main for page1.html. Loads the common
    module, then loads **app/main1**, the main module for page 1.
    * **page2.js**: used for the data-main for page2.html. Loads the common
    module, then loads **app/main2**, the main module for page 2.

To optimize, run:

    node tools/r.js -o tools/build.js

That build command creates an optimized version of the project in a
**www-built** directory. The **js/common.js** file will contain all the common
modules. **js/page1.js** will contain the page1-specific modules,
**js/page2.js** will contain the page2-specific modules.

## Building up the common layer

As you do builds and see in the build output that each page is including the
same module, add it to common's "include" array in **tools/build.js**.

It is better to add these common modules to the **tools/build.js** config
instead of doing a require([]) call for them in **js/common.js**. Modules that
are not explicitly required at runtime are not executed when added to common.js
via the include build option. So by using **tools/build.js**, you can include
common modules that may be in 2-3 pages but not all pages. For pages that do
not need a particular common module, it will not be executed. If you put in a
require() call for it in **js/common.js**, then it will always be executed.

## More info

For more information on the optimizer:
http://requirejs.org/docs/optimization.html

For more information on using requirejs:
http://requirejs.org/docs/api.html
