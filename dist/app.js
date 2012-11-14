require.config({
  appDir: 'app',
  paths: {
    'd3': 'components/d3/d3.v2',
    'underscore': 'components/underscore/underscore',
    'jquery': 'components/zepto/dist/zepto',
    'backbone': 'components/backbone/backbone'
  },
  shim: {
    'd3': {
      exports: 'd3'
    },
    'underscore': {
      exports: '_'
    },
    'jquery': {
      exports: '$'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require(['app/main']);
