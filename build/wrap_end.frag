    //Register in the values from the outer closure for common dependencies
    //as local almond modules

    //>>excludeStart("hasDeps", pragmas.hasDeps);
    define('jquery', function () {
        return $;
    });
    define('underscore', function () {
        return _;
    });
    define('backbone', function () {
        return Backbone;
    });
    //>>excludeEnd("hasDeps");

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    return require('app/views/MapUsOnly');
}));