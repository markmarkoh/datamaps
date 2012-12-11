define(['underscore'], function(_) {
  return {
      projection: 'equirectangular',
      scope: 'world', // 'usa', 'northAmerica', 'southAmerica', 'europe', 'asia'

      _geography: {
        borderWidth: 1,
        borderColor: '#FFFFFF',

        popupTemplate: _.template('<div class="hoverinfo"><%= geography.properties.name %></div>'),
        popupOnHover: true,

        highlightOnHover: true,
        highlightBorderColor: '#FA0FA0',
        highlightBorderWidth: 2
      },

      /* plots */
      _plot: {
        borderWidth: 2,
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
      plots: [],
      fills: {
        defaultFill: '#BADA55'
      }

    };
});