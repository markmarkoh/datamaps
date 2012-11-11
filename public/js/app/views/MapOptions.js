define(['underscore'], function(_) {
  return {
      projection: 'equirectangular',
      scope: 'world', // 'usa', 'northAmerica', 'southAmerica', 'europe', 'asia'
      highlightOnHover: true,
      showPopupOnHover: true,
      popupTemplate: _.template('<div class="hoverinfo"><%= geography.properties.name %></div>'),

      /* highlight defaults */
      highlightBorderColor: '#FA0FA0',
      highlightBorderWidth: 2,

      borderColor: '#FFFFFF',
      borderWidth: 1,

      /* fill settings */
      pathData: {},
      data: {},
      fills: {
        defaultFill: '#BADA55'
      }

    };
});