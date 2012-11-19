/*global require, define, test, expect, strictEqual, location */

if (typeof require === 'function' && require.config) {
    require.config({
        baseUrl: '../www/js',
        paths: {
            //Path relative to baseUrl
            'jquery': 'lib/jquery'
        }
    });

    //Override if in "dist" mode
    if (location.href.indexOf('-dist') !== -1) {
        //Set location of principium to the dist location
        require.config({
            baseUrl: '../www-built/js'
        });
    }
}

(function (root, factory) {
    'use strict';
    define(['jquery', 'app/model/Base', 'app/model/m1', 'app/model/m2', 'app/controller/c1', 'app/controller/c2'], factory);
}(this, function ($, Base, m1, m2, c1, c2) {
    'use strict';

    test('base model test', function () {
        var base = new Base('Can set title');
        expect(1);
        strictEqual(base.getTitle(), 'Can set title', 'Can set title');
    });

    test('title for page1 can be set', function () {
        expect(1);
        strictEqual(m1.getTitle(), 'This is the data for Page 1', 'title for page1 can be set');
    });

    test('title for page2 can be set', function () {
        expect(1);
        strictEqual(m2.getTitle(), 'This is the data for Page 2', 'title for page2 can be set');
    });

    test('html for page1 can be generated', function () {
        expect(1);
        c1.setModel(m1);
        c1.render($('#qunit-fixture'));
        strictEqual($('#qunit-fixture').text(), 'Controller Controller 1 says "This is the data for Page 1"', 'html for page1 can be set');
    });

    test('html for page2 can be generated', function () {
        expect(1);
        c2.setModel(m2);
        c2.render($('#qunit-fixture'));
        strictEqual($('#qunit-fixture').text(), 'Controller Controller 2 says "This is the data for Page 2"', 'html for page2 can be set');
    });

}));