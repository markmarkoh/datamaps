    //>>excludeStart("hasDeps", pragmas.hasDeps);
    //Register in the values from the outer closure for common dependencies
    //as local almond modules
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

    //Make it a jQuery plugin
    $ = $ ? $ : window.$;
    $.fn.datamap = function(config) {
        var el = this,
            config = config || {};
        $.extend(config, {el: el})
        var map = new Map(config);
        map.render();
        return map;
    };

    var map;
    //>>includeStart("usOnly", pragmas.usOnly)
    map = require('app/views/MapUsOnly');
    //>>includeEnd("usOnly")

    //>>includeStart("notUsOnly", !pragmas.usOnly && !pragmas.worldAndUs)
    map = require('app/views/MapCountriesOnly');
    //>>includeEnd("notUsOnly")

    //>>includeStart("worldAndUs", pragmas.worldAndUs)
    map = require('app/views/MapWorldAndUsStates');
    //>>includeEnd("worldAndUs")

    window.Map = map;
    return map;
}));