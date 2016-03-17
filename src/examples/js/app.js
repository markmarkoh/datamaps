requirejs.config({
  'baseUrl': 'js',
  'paths': {
    'app': '../app',
    'datamaps': '../../rel/datamaps.all',
    'topojson': 'http://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min',
    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3'
  },
  shim: {
    d3: {
      exports: 'd3'
    },
    topojson: {
      deps: ['d3'],
      exports: 'topojson'
    },
    datamaps: {
      deps: ['d3', 'topojson']
    }
  }

});

/** Load main module to start app **/
requirejs(["./main"]);
