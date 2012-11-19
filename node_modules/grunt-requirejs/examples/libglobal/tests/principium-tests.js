/*global require, define, test, expect, strictEqual, location */

if (typeof require === 'function' && require.config) {
    require.config({
        baseUrl: '../lib',
        paths: {
            //Path relative to baseUrl
            'principium': '../principium'
        },
        shim: {
            'underscore': {
                exports: '_'
            }
        }
    });

    //Override if in "dist" mode
    if (location.href.indexOf('-dist') !== -1) {
        //Set location of principium to the dist location
        require.config({
            paths: {
                'principium': '../dist/principium'
            }
        });
    }
}

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['principium', 'jquery'], factory);
    } else {
        // Browser globals
        factory(root.principium, root.jQuery);
    }
}(this, function (principium, $) {
    'use strict';

    test('version test', function () {
        expect(1);
        strictEqual(principium.version,
            '0.0.1, jQuery version is: ' + $.fn.jquery,
            'Version concatenated');
    });

    test('conversion test', function () {
        expect(1);
        strictEqual(principium.convert('Harry & Sally'),
            'Harry &amp; Sally',
            'Ampersand converted');
    });
}));
