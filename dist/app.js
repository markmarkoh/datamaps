datamaps.require.config({
  appDir: 'app',
  paths: {
    'd3': 'components/d3/d3.v2',
    'underscore': 'components/underscore/underscore',
    '$': 'components/zepto/dist/zepto',
    'backbone': 'components/backbone/backbone'
  },
  shim: {
    'd3': {
      exports: 'd3'
    },
    'underscore': {
      exports: '_'
    },
    '$': {
      exports: '$'
    },
    'backbone': {
      deps: ['underscore', '$'],
      exports: 'Backbone'
    }
  }
});

datamaps.require(['app/main']);
