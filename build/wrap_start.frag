//Copyright 2012, etc.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'underscore', 'backbone'], factory);
    } else {
        // Browser globals
        
        root.Map = factory(root.$, root._, root.Backbone);
    }
}(this, function ($, _, Backbone) {
