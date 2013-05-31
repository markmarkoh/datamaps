require.config({
  appDir: 'app',
  paths: {
    'd3': 'components/d3/d3',
  },
  shim: {
    'd3': {
      exports: 'd3'
    },
  }
});

require(['datamaps']);
