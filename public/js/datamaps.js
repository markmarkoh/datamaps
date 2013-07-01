var datamaps = {};
(function() {
  // Leak datamaps object globally
  var svg;

  var defaultOptions = {
    scope: 'world',
    done: function() {},
    fills: {
      defaultFill: '#BADA55'
    },
    geographyConfig: {
        hideAntarctica: true,
        borderWidth: 1,
        borderColor: '#FDFDFD',
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
        },
        popupOnHover: true,
        highlightOnHover: true,
        highlightFillColor: '#FA0FA0',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2
    },
    bubbleConfig: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        popupOnHover: true,
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
        },
        fillOpacity: 0.75,
        animate: true,
        highlightOnHover: true,
        highlightFillColor: '#FA0FA0',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2,
        highlightFillOpacity: 0.85
    }
  };

  function addContainer( element ) {
    this.svg = d3.select( element ).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
  }

  function addStyle() {
    d3.select('head').append('style')
      .html('path {stroke: #FFFFFF; stroke-width: 1px;} .datamaps-hoverover {display: none; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; } .hoverinfo {padding: 4px; border-radius: 1px; background-color: #FFF; box-shadow: 1px 1px 5px #CCC; font-size: 12px; border: 1px solid #CCC; } .hoverinfo hr {border:1px dotted #CCC; }');
  }

  function drawSubunits( data ) {
    var fillData = this.options.fills,
        colorCodeData = this.options.data || {},
        geoConfig = this.options.geographyConfig;


    var subunits = this.svg.select('g.datamaps-subunits');
    if ( subunits.empty() ) {
      subunits = this.svg.append('g').attr('class', 'datamaps-subunits');
    }

    var geoData = topojson.feature( data, data.objects[ this.options.scope ] ).features;
    if ( geoConfig.hideAntarctica ) {
      geoData = geoData.filter(function(feature) {
        return feature.id !== "ATA";
      });
    }

    var geo = subunits.selectAll('path.datamaps-subunit').data( geoData );

    geo.enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', function(d) {
        return 'datamaps-subunit ' + d.id;
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

    if ( options.highlightOnHover || options.popupOnHover ) {
      this.svg.selectAll('.datamaps-subunit')
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
            updatePopup($this, d, options);
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
          d3.select('.datamaps-hoverover').style('display', 'none');
        });
    }

  }

  function updatePopup(element, d, options) {
    element.on('mousemove', function() {
      var position = d3.mouse(this);
      d3.select('.datamaps-hoverover')
        .style('top', (position[1] + 30) + "px")
        .html(function() {
          var data = JSON.parse(element.attr('data-info'));
          if ( !data ) return '';
          return options.popupTemplate(d, data);
        })
        .style('left', position[0] + "px");
    });

    d3.select('.datamaps-hoverover').style('display', 'block');

  }

  function handleBubbles ( bubbleData ) {
    var self = this,
        fillData = this.options.fills,
        options = this.options.bubbleConfig;

    if ( !bubbleData || (bubbleData && !bubbleData.slice) ) {
      throw "Datamaps Error - bubbles must be an array";
    }

    var bubblesContainer = this.svg.select('g.bubbles-container');
    if ( bubblesContainer.empty() ) {
      bubblesContainer = this.svg.append('g').attr('class', 'bubbles-container');
    }

    var bubbles = bubblesContainer.selectAll('circle.datamaps-bubble').data( bubbleData, JSON.stringify );

    bubbles
      .enter()
        .append('svg:circle')
        .attr('class', 'datamaps-bubble')
        .attr('cx', function ( datum ) {
          console.log('calc', datum);
          return self.projection([datum.longitude, datum.latitude])[0];
        })
        .attr('cy', function ( datum ) {
          return self.projection([datum.longitude, datum.latitude])[1];
        })
        .attr('r', 0) //for animation purposes
        .attr('data-info', function(d) {
          return JSON.stringify(d);
        })
        .style('stroke', options.borderColor)
        .style('stroke-width', options.borderWidth)
        .style('fill-opacity', options.fillOpacity)
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

          if (options.popupOnHover) {
            updatePopup($this, datum, options);
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

          d3.select('.datamaps-hoverover').style('display', 'none');
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
        .scale((element.offsetWidth + 1) / 2 / Math.PI)
        .translate([element.offsetWidth / 2, element.offsetHeight / 1.8]);
    }

    this.path = d3.geo.path()
      .projection( this.projection );
  }

  /**************************************
    Utilities
  ***************************************/
  //stolen from underscore.js
  function defaults(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
  /**************************************

    Global Functions

  ***************************************/

  function Datamap( options ) {
    //set options for global use
    this.options = defaults(options, defaultOptions);
    this.options.geographyConfig = defaults(options.geographyConfig, defaultOptions.geographyConfig);
    this.options.bubbleConfig = defaults(options.bubbleConfig, defaultOptions.bubbleConfig);
  }

  Datamap.prototype.setBubbles = function ( bubbles ) {
    handleBubbles.call(this, bubbles);
  };

  Datamap.prototype.draw = function() {
    //save off in a closure
    var self = this;
    var options = self.options;

    //add the SVG container
    if ( d3.select( options.element ).select('svg').length > 0 ) {
      addContainer.call(self, options.element );
    }

    //add the style blocks for the hoverover
    addStyle();

    //set projections and paths based on scope
    setProjection.apply(self, [options.scope, options.element] );

    d3.json('/public/js/app/data/' + options.scope + '.topo.json', function(error, result) {
        drawSubunits.apply(self, [result, self.options] );
        handleGeographyConfig.call(self, self.options.geographyConfig );
        if (options.bubbles) {
          self.setBubbles ( options.bubbles );
        }

        if ( self.options.geographyConfig.popupOnHover || self.options.bubbleConfig.popupOnHover ) {
          hoverover = d3.select( 'body' ).append('div')
            .attr('class', 'datamaps-hoverover')
            .style('z-index', 10001)
            .style('position', 'absolute');
        }

        self.options.done(self.svg);
    });
    return this;
  };

  window.Datamap = Datamap;



}).apply(datamaps);