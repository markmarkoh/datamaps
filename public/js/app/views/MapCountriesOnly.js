define([
  'app/views/Map',
  'app/views/MapOptions',
  'app/data/world-countries-build'
], function(Map, MapOptions, features) {

  var MapWithFeatures = Map.extend({
    options: _.extend(MapOptions, {
      pathData: features
    })
  });

  //don't namespace this
  if (window.define && window.define.amd) {
    window.define( "Map", [], function () { return MapWithFeatures; } );
  } else {
    window.Map = MapWithFeatures;
  }


});