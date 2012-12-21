define(['underscore'], function(_) {
  return {
      projection: 'equirectangular',
      scope: 'world', // 'usa', 'northAmerica', 'southAmerica', 'europe', 'asia'

      _geography_config: {
        borderWidth: 1,
        borderColor: '#FFFFFF',

        popupTemplate: _.template('<div class="hoverinfo"><%= geography.properties.name %></div>'),
        popupOnHover: true,

        highlightOnHover: true,
        highlightBorderColor: '#FA0FA0',
        highlightBorderWidth: 2
      },

      /* bubbles */
      _bubble_config: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        popupOnHover: true,
        popupTemplate: _.template(''),
        fillOpacity: 0.75,
        animate: true,
        highlightOnHover: true,
        highlightBorderColor: '#667FAF',
        highlightFillColor: '#667FAF',
        highlightBorderWidth: 2,
        highlightFillOpacity: 0.85
      },

      /* fill settings */
      pathData: {},
      data: {},
      bubbles: [],
      fills: {
        defaultFill: '#BADA55'
      }

    };
});