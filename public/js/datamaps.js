(function() {
  // Leak datamaps object globally
  var datamaps = this.datamaps = {};

  var svg, projection, path;



  function addContainer( element ) {
    svg = d3.select( element ).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
  }

  function addStyle() {
    d3.select('head').append('style')
      .html('path {stroke: #FFFFFF; stroke-width: 1px;} .hoverover {display: none; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; } .hoverinfo {padding: 4px; border-radius: 1px; background-color: #FFF; box-shadow: 1px 1px 5px #CCC; font-size: 12px; border: 1px solid #CCC; } .hoverinfo hr {border:1px dotted #CCC; }');
  }

  function drawSubunits( data, options) {
  var fillData = options.fills,
      colorCodeData = options.data || {},
      geoConfig = options.geographyConfig;

   svg.append('g')
        .attr('class', 'subunits')
        .selectAll('.subunit')
          .data(topojson.feature( data, data.objects['states-topo'] ).features )
          .enter().append('path')
            .attr('d', path)
            .attr('class', function(d) {
              return 'subunit ' + d.id;
            })
            .attr('data-info', function(d) {
              return JSON.stringify( colorCodeData[d.id]);
            })
            .style('fill', function(d) {
              var fillColor;

              if ( colorCodeData[d.id] ) {
                fillColor = fillData[ colorCodeData[d.id].fillKey ];
              }

              return fillColor || fillData.defaultFill; 
            })
            .style('stroke-width', geoConfig.borderWidth)
            .style('stroke', geoConfig.borderColor);
  }

  function handleGeographyConfig ( geoConfig ) {
    var hoverover;

    if ( geoConfig.popupOnHover ) {
      hoverover = d3.select( 'body' ).append('div')
        .attr('class', 'hoverover')
        .style('z-index', 10001)
        .style('position', 'absolute').text('hi');
    }

    if ( geoConfig.highlightOnHover || geoConfig.popupOnHover ) {
      svg.selectAll('.subunit')
        .on('mouseover', function(d) {
          var $this = d3.select(this);

          if ( geoConfig.highlightOnHover ) {
            $this
              .attr('previous-fill', function() {
                var previousFill = $this.style('fill');
                $this.style('fill', geoConfig.highlightFillColor);
                return previousFill;
              })
              .attr('previous-stroke', function() {
                var previousStroke = $this.style('stroke');
                $this.style('stroke', geoConfig.highlightBorderColor);
                return previousStroke;
              })
              .attr('previous-stroke-width', function() {
                var previousStrokeWidth = $this.style('stroke-width');
                $this.style('stroke-width', geoConfig.highlightBorderWidth);
                return previousStrokeWidth;
              });

            /* remove the element and place it at the bottom
                of the parent since the borders will likely be clipped */
            var parentEl = $this[0][0].parentElement;
            var el = $this[0][0];
            $this.remove();
            parentEl.appendChild(el);
          }

          if ( geoConfig.popupOnHover ) {

              $this.on('mousemove', function() {
                var position = d3.mouse(this);
                d3.select('.hoverover')
                  .style('top', (position[1] + 30) + "px")            
                  .html(function() {
                    var data = JSON.parse($this.attr('data-info'));

                    if (data === null) {
                      return '';
                    }
                    else {
                      return geoConfig.popupTemplate(d, data);
                    }

                  })
                  .style('left', position[0] + "px");           
              });

              d3.select('.hoverover').style('display', 'block');
          }
        })
        .on('mouseout', function() {
          var $this = d3.select(this);
          $this
            .style('fill', function() {
              return $this.attr('previous-fill');
            })
            .style('stroke', function() {
              return $this.attr('previous-stroke');
            })
            .style('stroke-width', function() {
              return $this.attr('previous-strokewidth');
            });

          d3.select('.hoverover').style('display', 'none');
        });
    }

  }

  function setProjection( scope, element ) {
    if ( scope === 'usa' ) {
      projection = d3.geo.albersUsa()
        .scale(element.offsetWidth)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
    }

    path = d3.geo.path()
      .projection( projection );
  }

  datamaps.draw = function( options ) {
    if ( d3.select( options.element ).select('svg').length > 0 ) {
      addContainer( options.element );
    }
    addStyle();
    setProjection( options.scope, options.element );

    d3.json('/public/js/app/data/testing.json', function(error, result) {
        drawSubunits( result, options );   

        handleGeographyConfig ( options.geographyConfig );

    });
  };
})();