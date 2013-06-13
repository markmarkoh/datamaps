var datamaps = {};
(function() {
  // Leak datamaps object globally
  var svg;



  function addContainer( element ) {
    this.svg = d3.select( element ).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
  }

  function addStyle() {
    d3.select('head').append('style')
      .html('path {stroke: #FFFFFF; stroke-width: 1px;} .hoverover {display: none; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; } .hoverinfo {padding: 4px; border-radius: 1px; background-color: #FFF; box-shadow: 1px 1px 5px #CCC; font-size: 12px; border: 1px solid #CCC; } .hoverinfo hr {border:1px dotted #CCC; }');
  }

  function drawSubunits( data ) {
    var fillData = this.options.fills,
        colorCodeData = this.options.data || {},
        geoConfig = this.options.geographyConfig;


    var subunits = d3.select('g.subunits');
    if ( subunits.empty() ) {
      subunits = this.svg.append('g').attr('class', 'subunits');
    }

    var geoData = topojson.feature( data, data.objects[ this.options.scope ] ).features;
    console.log(geoConfig);
    if ( geoConfig.hideAntarctica ) {
      console.log('here');
      geoData = geoData.filter(function(feature) {
        console.log(feature);
        return feature.id !== "ATA";
      });
    }

    var geo = subunits.selectAll('path.subunit').data( geoData );

    geo.enter()
      .append('path')
      .attr('d', this.path)
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

  function handleGeographyConfig ( options ) {
    var hoverover;

    if ( options.popupOnHover ) {
      hoverover = d3.select( 'body' ).append('div')
        .attr('class', 'hoverover')
        .style('z-index', 10001)
        .style('position', 'absolute');
    }

    if ( options.highlightOnHover || options.popupOnHover ) {
      this.svg.selectAll('.subunit')
        .on('mouseover', function(d) {
          var $this = d3.select(this);

          if ( options.highlightOnHover ) {
            var previousAttributes = {
              'fill':  $this.style('fill'),
              'stroke': $this.style('stroke'),
              'stroke-width': $this.style('stroke-width'),
              'fill-opacity': $this.style('fill-opacity')
            };

            $this
              .style('fill', options.highlightFillColor)
              .style('stroke', options.highlightBorderColor)
              .style('stroke-width', options.highlightBorderWidth)
              .style('fill-opacity', options.highlightFillOpacity)
              .attr('data-previousAttributes', JSON.stringify(previousAttributes));

            /* remove the element and place it at the bottom
                of the parent since the borders will likely be clipped */
            var parentEl = $this[0][0].parentElement;
            var el = $this[0][0];
            $this.remove();
            parentEl.appendChild(el);
          }

          if ( options.popupOnHover ) {

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

          if (options.highlightOnHover) {
            //reapply previous attributes
            var previousAttributes = JSON.parse( $this.attr('data-previousAttributes') );
            for ( var attr in previousAttributes ) {
              $this.style(attr, previousAttributes[attr]);
            }
          }
          d3.select('.hoverover').style('display', 'none');
        });
    }

  }

  function handleBubbles ( bubbleData ) {
    var self = this,
        fillData = this.options.fills,
        options = this.options.bubbleConfig;

    if ( !bubbleData || (bubbleData && !bubbleData.slice) ) {
      throw "Datamaps Error - bubbles must be an array";
    }

    var bubblesContainer = d3.select('g.bubbles-container');
    if ( bubblesContainer.empty() ) {
      bubblesContainer = this.svg.append('g').attr('class', 'bubbles-container');
    }

    var bubbles = bubblesContainer.selectAll('circle.bubble').data( bubbleData, JSON.stringify );

    bubbles
      .enter()
        .append('svg:circle')
        .attr('class', 'bubble')
        .attr('cx', function ( datum ) {
          console.log('calc', datum);
          return self.projection([datum.longitude, datum.latitude])[0];
        })
        .attr('cy', function ( datum ) {
          return self.projection([datum.longitude, datum.latitude])[1];
        })
        .attr('r', 0) //for animation purposes
        .style('stroke', options.borderColor)
        .style('stroke-width', options.borderWidth)
        .style('opacity', options.fillOpacity)
        .style('fill', function ( datum ) {
          var fillColor = fillData[ datum.fillKey ];
          return fillColor || fillData.defaultFill;
        })
        .on('mouseover', function ( datum ) {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //save all previous attributes for mouseout
            var previousAttributes = {
              'fill':  $this.style('fill'),
              'stroke': $this.style('stroke'),
              'stroke-width': $this.style('stroke-width'),
              'fill-opacity': $this.style('fill-opacity')
            };

            $this
              .style('fill', options.highlightFillColor)
              .style('stroke', options.highlightBorderColor)
              .style('stroke-width', options.highlightBorderWidth)
              .style('fill-opacity', options.highlightFillOpacity)
              .attr('data-previousAttributes', JSON.stringify(previousAttributes));
          }
        })
        .on('mouseout', function ( datum ) {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //reapply previous attributes
            var previousAttributes = JSON.parse( $this.attr('data-previousAttributes') );
            for ( var attr in previousAttributes ) {
              $this.style(attr, previousAttributes[attr]);
            }
          }
        })
        .transition().duration(400)
          .attr('r', function ( datum ) {
            return datum.radius;
          });

    bubbles.exit()
      .transition()
        .attr("r", 0)
        .remove()

  }

  function setProjection( scope, element ) {
    if ( scope === 'usa' ) {
      this.projection = d3.geo.albersUsa()
        .scale(element.offsetWidth)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
    }
    else if ( scope === 'world' ) {
      this.projection = d3.geo.equirectangular()
        .scale(element.offsetWidth / 6)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
    }

    this.path = d3.geo.path()
      .projection( this.projection );
  }

  /**************************************

    Global Functions

  ***************************************/

  this.setBubbles = function ( bubbles ) {
    handleBubbles.call(this, bubbles);
  };

  this.draw = function( options ) {
    //save off in a closure
    var self = this;

    //set options for global use
    this.options = options;

    //add the SVG container
    if ( d3.select( options.element ).select('svg').length > 0 ) {
      addContainer.call(this, options.element );
    }

    //add the style blocks for the hoverover
    addStyle();

    //set projections and paths based on scope
    setProjection.apply(this, [options.scope, options.element] );

    d3.json('/public/js/app/data/' + options.scope + '.topo.json', function(error, result) {
        drawSubunits.apply(self, [result, options] );
        handleGeographyConfig.call(self, options.geographyConfig );
        self.setBubbles ( options.bubbles );
    });
  };


}).apply(datamaps);