(function() {
  // Leak datamaps object globally
  var datamaps = this.datamaps = {};

  var width = 800, height = 400;
  var svg, projection, path;



  function addContainer( element ) {
    svg = d3.select( element ).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
  }

  function drawSubunits( data ) {
   svg.append('g')
        .attr('class', 'subunits')
        .selectAll('.subunit')
          .data(topojson.feature( data, data.objects['states-topo'] ).features )
          .enter().append('path')
            .attr('class', function(d) {
              return 'subunit ' + d.id;
            })
            .attr('d', path);
  }

  function handleGeographyConfig ( geoconfig ) {
    if ( geoconfig.highlightOnHover ) {
      svg.selectAll('.subunit')
        .on('mouseover', function(d) {
          var $this = d3.select(this);
          $this
            .attr('previous-fill', function() {
              var previousFill = $this.style('fill');
              $this.attr('fill', geoconfig.highlightFillColor);
              return previousFill;
            });
        })
        .on('mouseout', function() {
          var $this = d3.select(this);
          $this
            .attr('fill', function() {
              return $this.attr('previous-fill');
            });
        });
    }
  }

  function setProjection( scope ) {
    if ( scope === 'usa' ) {
      projection = d3.geo.albersUsa()
        .scale(500)
        .translate([width / 2, height / 2]);
    }

    path = d3.geo.path()
      .projection( projection );
  }

  datamaps.draw = function( options ) {
    if ( d3.select( options.element ).select('svg').length > 0 ) {
      addContainer( options.element );
    }

    setProjection( options.scope );

    d3.json('/public/js/app/data/testing.json', function(error, result) {
        drawSubunits( result );   

        handleGeographyConfig ( options.geographyConfig );

    });
  };
})();