(function() {
  var svg;

  //save off default references
  var d3 = window.d3, topojson = window.topojson;

  var defaultOptions = {
    scope: 'world',
    responsive: false,
    aspectRatio: 0.5625,
    setProjection: setProjection,
    projection: 'equirectangular',
    dataType: 'json',
    data: {},
    done: function() {},
    fills: {
      defaultFill: '#ABDDA4'
    },
    filters: {},
    geographyConfig: {
        dataUrl: null,
        hideAntarctica: true,
        hideHawaiiAndAlaska : false,
        borderWidth: 1,
        borderColor: '#FDFDFD',
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
        },
        popupOnHover: true,
        highlightOnHover: true,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2
    },
    projectionConfig: {
      rotation: [97, 0]
    },
    bubblesConfig: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        popupOnHover: true,
        radius: null,
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
        },
        fillOpacity: 0.75,
        animate: true,
        highlightOnHover: true,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2,
        highlightFillOpacity: 0.85,
        exitDelay: 100,
        key: JSON.stringify
    },
    arcConfig: {
      strokeColor: '#DD1C77',
      strokeWidth: 1,
      arcSharpness: 1,
      animationSpeed: 600
    }
  };

  /*
    Getter for value. If not declared on datumValue, look up the chain into optionsValue
  */
  function val( datumValue, optionsValue, context ) {
    if ( typeof context === 'undefined' ) {
      context = optionsValue;
      optionsValues = undefined;
    }
    var value = typeof datumValue !== 'undefined' ? datumValue : optionsValue;

    if (typeof value === 'undefined') {
      return  null;
    }

    if ( typeof value === 'function' ) {
      var fnContext = [context];
      if ( context.geography ) {
        fnContext = [context.geography, context.data];
      }
      return value.apply(null, fnContext);
    }
    else {
      return value;
    }
  }

  function addContainer( element, height, width ) {
    this.svg = d3.select( element ).append('svg')
      .attr('width', width || element.offsetWidth)
      .attr('data-width', width || element.offsetWidth)
      .attr('class', 'datamap')
      .attr('height', height || element.offsetHeight)
      .style('overflow', 'hidden'); // IE10+ doesn't respect height/width when map is zoomed in

    if (this.options.responsive) {
      d3.select(this.options.element).style({'position': 'relative', 'padding-bottom': (this.options.aspectRatio*100) + '%'});
      d3.select(this.options.element).select('svg').style({'position': 'absolute', 'width': '100%', 'height': '100%'});
      d3.select(this.options.element).select('svg').select('g').selectAll('path').style('vector-effect', 'non-scaling-stroke');

    }

    return this.svg;
  }

  // setProjection takes the svg element and options
  function setProjection( element, options ) {
    var width = options.width || element.offsetWidth;
    var height = options.height || element.offsetHeight;
    var projection, path;
    var svg = this.svg;

    if ( options && typeof options.scope === 'undefined') {
      options.scope = 'world';
    }

    if ( options.scope === 'usa' ) {
      projection = d3.geo.albersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);
    }
    else if ( options.scope === 'world' ) {
      projection = d3.geo[options.projection]()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width / 2, height / (options.projection === "mercator" ? 1.45 : 1.8)]);
    }

    if ( options.projection === 'orthographic' ) {

      svg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path);

      svg.append("use")
          .attr("class", "stroke")
          .attr("xlink:href", "#sphere");

      svg.append("use")
          .attr("class", "fill")
          .attr("xlink:href", "#sphere");
      projection.scale(250).clipAngle(90).rotate(options.projectionConfig.rotation)
    }

    path = d3.geo.path()
      .projection( projection );

    return {path: path, projection: projection};
  }

  function addStyleBlock() {
    if ( d3.select('.datamaps-style-block').empty() ) {
      d3.select('head').append('style').attr('class', 'datamaps-style-block')
      .html('.datamap path.datamaps-graticule { fill: none; stroke: #777; stroke-width: 0.5px; stroke-opacity: .5; pointer-events: none; } .datamap .labels {pointer-events: none;} .datamap path {stroke: #FFFFFF; stroke-width: 1px;} .datamaps-legend dt, .datamaps-legend dd { float: left; margin: 0 3px 0 0;} .datamaps-legend dd {width: 20px; margin-right: 6px; border-radius: 3px;} .datamaps-legend {padding-bottom: 20px; z-index: 1001; position: absolute; left: 4px; font-size: 12px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;} .datamaps-hoverover {display: none; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; } .hoverinfo {padding: 4px; border-radius: 1px; background-color: #FFF; box-shadow: 1px 1px 5px #CCC; font-size: 12px; border: 1px solid #CCC; } .hoverinfo hr {border:1px dotted #CCC; }');
    }
  }

  function drawSubunits( data ) {
    var fillData = this.options.fills,
        colorCodeData = this.options.data || {},
        geoConfig = this.options.geographyConfig;


    var subunits = this.svg.select('g.datamaps-subunits');
    if ( subunits.empty() ) {
      subunits = this.addLayer('datamaps-subunits', null, true);
    }

    var geoData = topojson.feature( data, data.objects[ this.options.scope ] ).features;
    if ( geoConfig.hideAntarctica ) {
      geoData = geoData.filter(function(feature) {
        return feature.id !== "ATA";
      });
    }

    if ( geoConfig.hideHawaiiAndAlaska ) {
      geoData = geoData.filter(function(feature) {
        return feature.id !== "HI" && feature.id !== 'AK';
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
        //if fillKey - use that
        //otherwise check 'fill'
        //otherwise check 'defaultFill'
        var fillColor;

        var datum = colorCodeData[d.id];
        if ( datum && datum.fillKey ) {
          fillColor = fillData[ val(datum.fillKey, {data: colorCodeData[d.id], geography: d}) ];
        }

        if ( typeof fillColor === 'undefined' ) {
          fillColor = val(datum && datum.fillColor, fillData.defaultFill, {data: colorCodeData[d.id], geography: d});
        }

        return fillColor;
      })
      .style('stroke-width', geoConfig.borderWidth)
      .style('stroke', geoConfig.borderColor);
  }

  function handleGeographyConfig () {
    var hoverover;
    var svg = this.svg;
    var self = this;
    var options = this.options.geographyConfig;

    if ( options.highlightOnHover || options.popupOnHover ) {
      svg.selectAll('.datamaps-subunit')
        .on('mouseover', function(d) {
          var $this = d3.select(this);
          var datum = self.options.data[d.id] || {};
          if ( options.highlightOnHover ) {
            var previousAttributes = {
              'fill':  $this.style('fill'),
              'stroke': $this.style('stroke'),
              'stroke-width': $this.style('stroke-width'),
              'fill-opacity': $this.style('fill-opacity')
            };

            $this
              .style('fill', val(datum.highlightFillColor, options.highlightFillColor, datum))
              .style('stroke', val(datum.highlightBorderColor, options.highlightBorderColor, datum))
              .style('stroke-width', val(datum.highlightBorderWidth, options.highlightBorderWidth, datum))
              .style('fill-opacity', val(datum.highlightFillOpacity, options.highlightFillOpacity, datum))
              .attr('data-previousAttributes', JSON.stringify(previousAttributes));

            //as per discussion on https://github.com/markmarkoh/datamaps/issues/19
            if ( ! /((MSIE)|(Trident))/.test(navigator.userAgent) ) {
             moveToFront.call(this);
            }
          }

          if ( options.popupOnHover ) {
            self.updatePopup($this, d, options, svg);
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
          $this.on('mousemove', null);
          d3.selectAll('.datamaps-hoverover').style('display', 'none');
        });
    }

    function moveToFront() {
      this.parentNode.appendChild(this);
    }
  }

  //plugin to add a simple map legend
  function addLegend(layer, data, options) {
    data = data || {};
    if ( !this.options.fills ) {
      return;
    }

    var html = '<dl>';
    var label = '';
    if ( data.legendTitle ) {
      html = '<h2>' + data.legendTitle + '</h2>' + html;
    }
    for ( var fillKey in this.options.fills ) {

      if ( fillKey === 'defaultFill') {
        if (! data.defaultFillName ) {
          continue;
        }
        label = data.defaultFillName;
      } else {
        if (data.labels && data.labels[fillKey]) {
          label = data.labels[fillKey];
        } else {
          label= fillKey + ': ';
        }
      }
      html += '<dt>' + label + '</dt>';
      html += '<dd style="background-color:' +  this.options.fills[fillKey] + '">&nbsp;</dd>';
    }
    html += '</dl>';

    var hoverover = d3.select( this.options.element ).append('div')
      .attr('class', 'datamaps-legend')
      .html(html);
  }

    function addGraticule ( layer, options ) {
      var graticule = d3.geo.graticule();
      this.svg.insert("path", '.datamaps-subunits')
        .datum(graticule)
        .attr("class", "datamaps-graticule")
        .attr("d", this.path);
  }

  function handleArcs (layer, data, options) {
    var self = this,
        svg = this.svg;

    if ( !data || (data && !data.slice) ) {
      throw "Datamaps Error - arcs must be an array";
    }

    // For some reason arc options were put in an `options` object instead of the parent arc
    // I don't like this, so to match bubbles and other plugins I'm moving it
    // This is to keep backwards compatability
    for ( var i = 0; i < data.length; i++ ) {
      data[i] = defaults(data[i], data[i].options);
      delete data[i].options;
    }

    if ( typeof options === "undefined" ) {
      options = defaultOptions.arcConfig;
    }

    var arcs = layer.selectAll('path.datamaps-arc').data( data, JSON.stringify );

    var path = d3.geo.path()
        .projection(self.projection);

    arcs
      .enter()
        .append('svg:path')
        .attr('class', 'datamaps-arc')
        .style('stroke-linecap', 'round')
        .style('stroke', function(datum) {
          return val(datum.strokeColor, options.strokeColor, datum);
        })
        .style('fill', 'none')
        .style('stroke-width', function(datum) {
            return val(datum.strokeWidth, options.strokeWidth, datum);
        })
        .attr('d', function(datum) {
            var originXY = self.latLngToXY(val(datum.origin.latitude, datum), val(datum.origin.longitude, datum))
            var destXY = self.latLngToXY(val(datum.destination.latitude, datum), val(datum.destination.longitude, datum));
            var midXY = [ (originXY[0] + destXY[0]) / 2, (originXY[1] + destXY[1]) / 2];
            if (options.greatArc) {
                  // TODO: Move this to inside `if` clause when setting attr `d`
              var greatArc = d3.geo.greatArc()
                  .source(function(d) { return [val(d.origin.longitude, d), val(d.origin.latitude, d)]; })
                  .target(function(d) { return [val(d.destination.longitude, d), val(d.destination.latitude, d)]; });

              return path(greatArc(datum))
            }
            var sharpness = val(datum.arcSharpness, options.arcSharpness, datum);
            return "M" + originXY[0] + ',' + originXY[1] + "S" + (midXY[0] + (50 * sharpness)) + "," + (midXY[1] - (75 * sharpness)) + "," + destXY[0] + "," + destXY[1];
        })
        .transition()
          .delay(100)
          .style('fill', function(datum) {
            /*
              Thank you Jake Archibald, this is awesome.
              Source: http://jakearchibald.com/2013/animated-line-drawing-svg/
            */
            var length = this.getTotalLength();
            this.style.transition = this.style.WebkitTransition = 'none';
            this.style.strokeDasharray = length + ' ' + length;
            this.style.strokeDashoffset = length;
            this.getBoundingClientRect();
            this.style.transition = this.style.WebkitTransition = 'stroke-dashoffset ' + val(datum.animationSpeed, options.animationSpeed, datum) + 'ms ease-out';
            this.style.strokeDashoffset = '0';
            return 'none';
          })

    arcs.exit()
      .transition()
      .style('opacity', 0)
      .remove();
  }

  function handleLabels ( layer, options ) {
    var self = this;
    options = options || {};
    var labelStartCoodinates = this.projection([-67.707617, 42.722131]);
    this.svg.selectAll(".datamaps-subunit")
      .attr("data-foo", function(d) {
        var center = self.path.centroid(d);
        var xOffset = 7.5, yOffset = 5;

        if ( ["FL", "KY", "MI"].indexOf(d.id) > -1 ) xOffset = -2.5;
        if ( d.id === "NY" ) xOffset = -1;
        if ( d.id === "MI" ) yOffset = 18;
        if ( d.id === "LA" ) xOffset = 13;

        var x,y;

        x = center[0] - xOffset;
        y = center[1] + yOffset;

        var smallStateIndex = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"].indexOf(d.id);
        if ( smallStateIndex > -1) {
          var yStart = labelStartCoodinates[1];
          x = labelStartCoodinates[0];
          y = yStart + (smallStateIndex * (2+ (options.fontSize || 12)));
          layer.append("line")
            .attr("x1", x - 3)
            .attr("y1", y - 5)
            .attr("x2", center[0])
            .attr("y2", center[1])
            .style("stroke", options.labelColor || "#000")
            .style("stroke-width", options.lineWidth || 1)
        }

        layer.append("text")
          .attr("x", x)
          .attr("y", y)
          .style("font-size", (options.fontSize || 10) + 'px')
          .style("font-family", options.fontFamily || "Verdana")
          .style("fill", options.labelColor || "#000")
          .text( d.id );
        return "bar";
      });
  }


  function handleBubbles (layer, data, options ) {
    var self = this,
        fillData = this.options.fills,
        filterData = this.options.filters,
        svg = this.svg;

    if ( !data || (data && !data.slice) ) {
      throw "Datamaps Error - bubbles must be an array";
    }

    var bubbles = layer.selectAll('circle.datamaps-bubble').data( data, options.key );

    bubbles
      .enter()
        .append('svg:circle')
        .attr('class', 'datamaps-bubble')
        .attr('cx', function ( datum ) {
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[0];
        })
        .attr('cy', function ( datum ) {
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[1];
        })
        .attr('r', function(datum) {
          // if animation enabled start with radius 0, otherwise use full size.
          return options.animate ? 0 : val(datum.radius, options.radius, datum);
        })
        .attr('data-info', function(d) {
          return JSON.stringify(d);
        })
        .attr('filter', function (datum) {
          var filterKey = filterData[ val(datum.filterKey, options.filterKey, datum) ];

          if (filterKey) {
            return filterKey;
          }
        })
        .style('stroke', function ( datum ) {
          return val(datum.borderColor, options.borderColor, datum);
        })
        .style('stroke-width', function ( datum ) {
          return val(datum.borderWidth, options.borderWidth, datum);
        })
        .style('fill-opacity', function ( datum ) {
          return val(datum.fillOpacity, options.fillOpacity, datum);
        })
        .style('fill', function ( datum ) {
          var fillColor = fillData[ val(datum.fillKey, options.fillKey, datum) ];
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
              .style('fill', val(datum.highlightFillColor, options.highlightFillColor, datum))
              .style('stroke', val(datum.highlightBorderColor, options.highlightBorderColor, datum))
              .style('stroke-width', val(datum.highlightBorderWidth, options.highlightBorderWidth, datum))
              .style('fill-opacity', val(datum.highlightFillOpacity, options.highlightFillOpacity, datum))
              .attr('data-previousAttributes', JSON.stringify(previousAttributes));
          }

          if (options.popupOnHover) {
            self.updatePopup($this, datum, options, svg);
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

          d3.selectAll('.datamaps-hoverover').style('display', 'none');
        })

    bubbles.transition()
      .duration(400)
      .attr('r', function ( datum ) {
        return val(datum.radius, options.radius, datum);
      });

    bubbles.exit()
      .transition()
        .delay(options.exitDelay)
        .attr("r", 0)
        .remove();

    function datumHasCoords (datum) {
      return typeof datum !== 'undefined' && typeof datum.latitude !== 'undefined' && typeof datum.longitude !== 'undefined';
    }
  }

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
             Public Functions
  ***************************************/

  function Datamap( options ) {

    if ( typeof d3 === 'undefined' || typeof topojson === 'undefined' ) {
      throw new Error('Include d3.js (v3.0.3 or greater) and topojson on this page before creating a new map');
   }
    //set options for global use
    this.options = defaults(options, defaultOptions);
    this.options.geographyConfig = defaults(options.geographyConfig, defaultOptions.geographyConfig);
    this.options.projectionConfig = defaults(options.projectionConfig, defaultOptions.projectionConfig);
    this.options.bubblesConfig = defaults(options.bubblesConfig, defaultOptions.bubblesConfig);
    this.options.arcConfig = defaults(options.arcConfig, defaultOptions.arcConfig);

    //add the SVG container
    if ( d3.select( this.options.element ).select('svg').length > 0 ) {
      addContainer.call(this, this.options.element, this.options.height, this.options.width );
    }

    /* Add core plugins to this instance */
    this.addPlugin('bubbles', handleBubbles);
    this.addPlugin('legend', addLegend);
    this.addPlugin('arc', handleArcs);
    this.addPlugin('labels', handleLabels);
    this.addPlugin('graticule', addGraticule);

    //append style block with basic hoverover styles
    if ( ! this.options.disableDefaultStyles ) {
      addStyleBlock();
    }

    return this.draw();
  }

  // resize map
  Datamap.prototype.resize = function () {

    var self = this;
    var options = self.options;

    if (options.responsive) {
      var newsize = options.element.clientWidth,
          oldsize = d3.select( options.element).select('svg').attr('data-width');

      d3.select(options.element).select('svg').selectAll('g').attr('transform', 'scale(' + (newsize / oldsize) + ')');
    }
  }

  // actually draw the features(states & countries)
  Datamap.prototype.draw = function() {
    //save off in a closure
    var self = this;
    var options = self.options;

    //set projections and paths based on scope
    var pathAndProjection = options.setProjection.apply(self, [options.element, options] );

    this.path = pathAndProjection.path;
    this.projection = pathAndProjection.projection;

    //if custom URL for topojson data, retrieve it and render
    if ( options.geographyConfig.dataUrl ) {
      d3.json( options.geographyConfig.dataUrl, function(error, results) {
        if ( error ) throw new Error(error);
        self.customTopo = results;
        draw( results );
      });
    }
    else {
      draw( this[options.scope + 'Topo'] || options.geographyConfig.dataJson);
    }

    return this;

      function draw (data) {
        // if fetching remote data, draw the map first then call `updateChoropleth`
        if ( self.options.dataUrl ) {
          //allow for csv or json data types
          d3[self.options.dataType](self.options.dataUrl, function(data) {
            //in the case of csv, transform data to object
            if ( self.options.dataType === 'csv' && (data && data.slice) ) {
              var tmpData = {};
              for(var i = 0; i < data.length; i++) {
                tmpData[data[i].id] = data[i];
              }
              data = tmpData;
            }
            Datamaps.prototype.updateChoropleth.call(self, data);
          });
        }
        drawSubunits.call(self, data);
        handleGeographyConfig.call(self);

        if ( self.options.geographyConfig.popupOnHover || self.options.bubblesConfig.popupOnHover) {
          hoverover = d3.select( self.options.element ).append('div')
            .attr('class', 'datamaps-hoverover')
            .style('z-index', 10001)
            .style('position', 'absolute');
        }

        //fire off finished callback
        self.options.done(self);
      }
  };
  /**************************************
                TopoJSON
  ***************************************/
  Datamap.prototype.worldTopo = '__WORLD__';
  Datamap.prototype.abwTopo = '__ABW__';
  Datamap.prototype.afgTopo = '__AFG__';
  Datamap.prototype.agoTopo = '__AGO__';
  Datamap.prototype.aiaTopo = '__AIA__';
  Datamap.prototype.albTopo = '__ALB__';
  Datamap.prototype.aldTopo = '__ALD__';
  Datamap.prototype.andTopo = '__AND__';
  Datamap.prototype.areTopo = '__ARE__';
  Datamap.prototype.argTopo = '__ARG__';
  Datamap.prototype.armTopo = '__ARM__';
  Datamap.prototype.asmTopo = '__ASM__';
  Datamap.prototype.ataTopo = '__ATA__';
  Datamap.prototype.atcTopo = '__ATC__';
  Datamap.prototype.atfTopo = '__ATF__';
  Datamap.prototype.atgTopo = '__ATG__';
  Datamap.prototype.ausTopo = '__AUS__';
  Datamap.prototype.autTopo = '__AUT__';
  Datamap.prototype.azeTopo = '__AZE__';
  Datamap.prototype.bdiTopo = '__BDI__';
  Datamap.prototype.belTopo = '__BEL__';
  Datamap.prototype.benTopo = '__BEN__';
  Datamap.prototype.bfaTopo = '__BFA__';
  Datamap.prototype.bgdTopo = '__BGD__';
  Datamap.prototype.bgrTopo = '__BGR__';
  Datamap.prototype.bhrTopo = '__BHR__';
  Datamap.prototype.bhsTopo = '__BHS__';
  Datamap.prototype.bihTopo = '__BIH__';
  Datamap.prototype.bjnTopo = '__BJN__';
  Datamap.prototype.blmTopo = '__BLM__';
  Datamap.prototype.blrTopo = '__BLR__';
  Datamap.prototype.blzTopo = '__BLZ__';
  Datamap.prototype.bmuTopo = '__BMU__';
  Datamap.prototype.bolTopo = '__BOL__';
  Datamap.prototype.braTopo = '__BRA__';
  Datamap.prototype.brbTopo = '__BRB__';
  Datamap.prototype.brnTopo = '__BRN__';
  Datamap.prototype.btnTopo = '__BTN__';
  Datamap.prototype.norTopo = '__NOR__';
  Datamap.prototype.bwaTopo = '__BWA__';
  Datamap.prototype.cafTopo = '__CAF__';
  Datamap.prototype.canTopo = '__CAN__';
  Datamap.prototype.cheTopo = '__CHE__';
  Datamap.prototype.chlTopo = '__CHL__';
  Datamap.prototype.chnTopo = '__CHN__';
  Datamap.prototype.civTopo = '__CIV__';
  Datamap.prototype.clpTopo = '__CLP__';
  Datamap.prototype.cmrTopo = '__CMR__';
  Datamap.prototype.codTopo = '__COD__';
  Datamap.prototype.cogTopo = '__COG__';
  Datamap.prototype.cokTopo = '__COK__';
  Datamap.prototype.colTopo = '__COL__';
  Datamap.prototype.comTopo = '__COM__';
  Datamap.prototype.cpvTopo = '__CPV__';
  Datamap.prototype.criTopo = '__CRI__';
  Datamap.prototype.csiTopo = '__CSI__';
  Datamap.prototype.cubTopo = '__CUB__';
  Datamap.prototype.cuwTopo = '__CUW__';
  Datamap.prototype.cymTopo = '__CYM__';
  Datamap.prototype.cynTopo = '__CYN__';
  Datamap.prototype.cypTopo = '__CYP__';
  Datamap.prototype.czeTopo = '__CZE__';
  Datamap.prototype.deuTopo = '__DEU__';
  Datamap.prototype.djiTopo = '__DJI__';
  Datamap.prototype.dmaTopo = '__DMA__';
  Datamap.prototype.dnkTopo = '__DNK__';
  Datamap.prototype.domTopo = '__DOM__';
  Datamap.prototype.dzaTopo = '__DZA__';
  Datamap.prototype.ecuTopo = '__ECU__';
  Datamap.prototype.egyTopo = '__EGY__';
  Datamap.prototype.eriTopo = '__ERI__';
  Datamap.prototype.esbTopo = '__ESB__';
  Datamap.prototype.espTopo = '__ESP__';
  Datamap.prototype.estTopo = '__EST__';
  Datamap.prototype.ethTopo = '__ETH__';
  Datamap.prototype.finTopo = '__FIN__';
  Datamap.prototype.fjiTopo = '__FJI__';
  Datamap.prototype.flkTopo = '__FLK__';
  Datamap.prototype.fraTopo = '__FRA__';
  Datamap.prototype.froTopo = '__FRO__';
  Datamap.prototype.fsmTopo = '__FSM__';
  Datamap.prototype.gabTopo = '__GAB__';
  Datamap.prototype.psxTopo = '__PSX__';
  Datamap.prototype.gbrTopo = '__GBR__';
  Datamap.prototype.geoTopo = '__GEO__';
  Datamap.prototype.ggyTopo = '__GGY__';
  Datamap.prototype.ghaTopo = '__GHA__';
  Datamap.prototype.gibTopo = '__GIB__';
  Datamap.prototype.ginTopo = '__GIN__';
  Datamap.prototype.gmbTopo = '__GMB__';
  Datamap.prototype.gnbTopo = '__GNB__';
  Datamap.prototype.gnqTopo = '__GNQ__';
  Datamap.prototype.grcTopo = '__GRC__';
  Datamap.prototype.grdTopo = '__GRD__';
  Datamap.prototype.grlTopo = '__GRL__';
  Datamap.prototype.gtmTopo = '__GTM__';
  Datamap.prototype.gumTopo = '__GUM__';
  Datamap.prototype.guyTopo = '__GUY__';
  Datamap.prototype.hkgTopo = '__HKG__';
  Datamap.prototype.hmdTopo = '__HMD__';
  Datamap.prototype.hndTopo = '__HND__';
  Datamap.prototype.hrvTopo = '__HRV__';
  Datamap.prototype.htiTopo = '__HTI__';
  Datamap.prototype.hunTopo = '__HUN__';
  Datamap.prototype.idnTopo = '__IDN__';
  Datamap.prototype.imnTopo = '__IMN__';
  Datamap.prototype.indTopo = '__IND__';
  Datamap.prototype.ioaTopo = '__IOA__';
  Datamap.prototype.iotTopo = '__IOT__';
  Datamap.prototype.irlTopo = '__IRL__';
  Datamap.prototype.irnTopo = '__IRN__';
  Datamap.prototype.irqTopo = '__IRQ__';
  Datamap.prototype.islTopo = '__ISL__';
  Datamap.prototype.isrTopo = '__ISR__';
  Datamap.prototype.itaTopo = '__ITA__';
  Datamap.prototype.jamTopo = '__JAM__';
  Datamap.prototype.jeyTopo = '__JEY__';
  Datamap.prototype.jorTopo = '__JOR__';
  Datamap.prototype.jpnTopo = '__JPN__';
  Datamap.prototype.kabTopo = '__KAB__';
  Datamap.prototype.kasTopo = '__KAS__';
  Datamap.prototype.kazTopo = '__KAZ__';
  Datamap.prototype.kenTopo = '__KEN__';
  Datamap.prototype.kgzTopo = '__KGZ__';
  Datamap.prototype.khmTopo = '__KHM__';
  Datamap.prototype.kirTopo = '__KIR__';
  Datamap.prototype.knaTopo = '__KNA__';
  Datamap.prototype.korTopo = '__KOR__';
  Datamap.prototype.kosTopo = '__KOS__';
  Datamap.prototype.kwtTopo = '__KWT__';
  Datamap.prototype.laoTopo = '__LAO__';
  Datamap.prototype.lbnTopo = '__LBN__';
  Datamap.prototype.lbrTopo = '__LBR__';
  Datamap.prototype.lbyTopo = '__LBY__';
  Datamap.prototype.lcaTopo = '__LCA__';
  Datamap.prototype.lieTopo = '__LIE__';
  Datamap.prototype.lkaTopo = '__LKA__';
  Datamap.prototype.lsoTopo = '__LSO__';
  Datamap.prototype.ltuTopo = '__LTU__';
  Datamap.prototype.luxTopo = '__LUX__';
  Datamap.prototype.lvaTopo = '__LVA__';
  Datamap.prototype.macTopo = '__MAC__';
  Datamap.prototype.mafTopo = '__MAF__';
  Datamap.prototype.marTopo = '__MAR__';
  Datamap.prototype.mcoTopo = '__MCO__';
  Datamap.prototype.mdaTopo = '__MDA__';
  Datamap.prototype.mdgTopo = '__MDG__';
  Datamap.prototype.mdvTopo = '__MDV__';
  Datamap.prototype.mexTopo = '__MEX__';
  Datamap.prototype.mhlTopo = '__MHL__';
  Datamap.prototype.mkdTopo = '__MKD__';
  Datamap.prototype.mliTopo = '__MLI__';
  Datamap.prototype.mltTopo = '__MLT__';
  Datamap.prototype.mmrTopo = '__MMR__';
  Datamap.prototype.mneTopo = '__MNE__';
  Datamap.prototype.mngTopo = '__MNG__';
  Datamap.prototype.mnpTopo = '__MNP__';
  Datamap.prototype.mozTopo = '__MOZ__';
  Datamap.prototype.mrtTopo = '__MRT__';
  Datamap.prototype.msrTopo = '__MSR__';
  Datamap.prototype.musTopo = '__MUS__';
  Datamap.prototype.mwiTopo = '__MWI__';
  Datamap.prototype.mysTopo = '__MYS__';
  Datamap.prototype.namTopo = '__NAM__';
  Datamap.prototype.nclTopo = '__NCL__';
  Datamap.prototype.nerTopo = '__NER__';
  Datamap.prototype.nfkTopo = '__NFK__';
  Datamap.prototype.ngaTopo = '__NGA__';
  Datamap.prototype.nicTopo = '__NIC__';
  Datamap.prototype.niuTopo = '__NIU__';
  Datamap.prototype.nldTopo = '__NLD__';
  Datamap.prototype.nplTopo = '__NPL__';
  Datamap.prototype.nruTopo = '__NRU__';
  Datamap.prototype.nulTopo = '__NUL__';
  Datamap.prototype.nzlTopo = '__NZL__';
  Datamap.prototype.omnTopo = '__OMN__';
  Datamap.prototype.pakTopo = '__PAK__';
  Datamap.prototype.panTopo = '__PAN__';
  Datamap.prototype.pcnTopo = '__PCN__';
  Datamap.prototype.perTopo = '__PER__';
  Datamap.prototype.pgaTopo = '__PGA__';
  Datamap.prototype.phlTopo = '__PHL__';
  Datamap.prototype.plwTopo = '__PLW__';
  Datamap.prototype.pngTopo = '__PNG__';
  Datamap.prototype.polTopo = '__POL__';
  Datamap.prototype.priTopo = '__PRI__';
  Datamap.prototype.prkTopo = '__PRK__';
  Datamap.prototype.prtTopo = '__PRT__';
  Datamap.prototype.pryTopo = '__PRY__';
  Datamap.prototype.pyfTopo = '__PYF__';
  Datamap.prototype.qatTopo = '__QAT__';
  Datamap.prototype.rouTopo = '__ROU__';
  Datamap.prototype.rusTopo = '__RUS__';
  Datamap.prototype.rwaTopo = '__RWA__';
  Datamap.prototype.sahTopo = '__SAH__';
  Datamap.prototype.sauTopo = '__SAU__';
  Datamap.prototype.scrTopo = '__SCR__';
  Datamap.prototype.sdnTopo = '__SDN__';
  Datamap.prototype.sdsTopo = '__SDS__';
  Datamap.prototype.senTopo = '__SEN__';
  Datamap.prototype.serTopo = '__SER__';
  Datamap.prototype.sgpTopo = '__SGP__';
  Datamap.prototype.sgsTopo = '__SGS__';
  Datamap.prototype.shnTopo = '__SHN__';
  Datamap.prototype.slbTopo = '__SLB__';
  Datamap.prototype.sleTopo = '__SLE__';
  Datamap.prototype.slvTopo = '__SLV__';
  Datamap.prototype.smrTopo = '__SMR__';
  Datamap.prototype.solTopo = '__SOL__';
  Datamap.prototype.somTopo = '__SOM__';
  Datamap.prototype.spmTopo = '__SPM__';
  Datamap.prototype.srbTopo = '__SRB__';
  Datamap.prototype.stpTopo = '__STP__';
  Datamap.prototype.surTopo = '__SUR__';
  Datamap.prototype.svkTopo = '__SVK__';
  Datamap.prototype.svnTopo = {"type":"Topology","objects":{"svn":{"type":"GeometryCollection","geometries":[{"type":"Polygon","properties":{"name":"Velike Lašče"},"id":"SI.LJ.VL","arcs":[[0,1,2,3,4,5,6,7]]},{"type":"Polygon","properties":{"name":"Velenje"},"id":"SI.SA.VE","arcs":[[8,9,10,11,12,13]]},{"type":"Polygon","properties":{"name":"Vitanje"},"id":"SI.SA.VI","arcs":[[14,15,16,17]]},{"type":"Polygon","properties":{"name":"Vodice"},"id":"SI.LJ.VO","arcs":[[18,19,20,21,22,23]]},{"type":"Polygon","properties":{"name":"Vrhnika"},"id":"SI.LJ.VR","arcs":[[24,25,26,27,28,29,30]]},{"type":"Polygon","properties":{"name":"Vuzenica"},"id":"SI.KO.VU","arcs":[[31,32,33,34,35]]},{"type":"Polygon","properties":{"name":"Zasavska"},"id":"SI.ZS","arcs":[[36,37,38,39,40,41,42]]},{"type":"Polygon","properties":{"name":"Zrece"},"id":"SI.SA.ZR","arcs":[[43,44,45,46,-18,47,48]]},{"type":"Polygon","properties":{"name":"Bled"},"id":"SI.GO.BL","arcs":[[49,50,51,52,53]]},{"type":"Polygon","properties":{"name":"Bohinj"},"id":"SI.GO.BO","arcs":[[-52,54,55,56,57,58,59,60]]},{"type":"Polygon","properties":{"name":"Cerkno"},"id":"SI.SP.CE","arcs":[[61,62,63,64]]},{"type":"Polygon","properties":{"name":"Gorenja vas-Poljane"},"id":"SI.GO.GV","arcs":[[65,66,-62,67,68]]},{"type":"Polygon","properties":{"name":"Idrija"},"id":"SI.SP.ID","arcs":[[69,70,71,72,73,-63]]},{"type":"Polygon","properties":{"name":"Kranj"},"id":"SI.GO.KR","arcs":[[74,75,76,77,-56,78,79,80,81]]},{"type":"Polygon","properties":{"name":"Kranjska Gora"},"id":"SI.GO.KG","arcs":[[82,-53,-61,83,84]]},{"type":"Polygon","properties":{"name":"Naklo"},"id":"SI.GO.NA","arcs":[[-80,85,86]]},{"type":"Polygon","properties":{"name":"Radovljica"},"id":"SI.GO.RA","arcs":[[-86,-79,-55,-51,87,88]]},{"type":"Polygon","properties":{"name":"Škofja Loka"},"id":"SI.GO.SL","arcs":[[89,90,-69,91,-77]]},{"type":"Polygon","properties":{"name":"Tolmin"},"id":"SI.SP.TO","arcs":[[92,-64,-74,93,94,95,96,-58]]},{"type":"Polygon","properties":{"name":"Tržič"},"id":"SI.GO.TR","arcs":[[97,-81,-87,-89,98,99]]},{"type":"Polygon","properties":{"name":"Železniki"},"id":"SI.GO.ZE","arcs":[[-78,-92,-68,-65,-93,-57]]},{"type":"Polygon","properties":{"name":"Žiri"},"id":"SI.GO.ZI","arcs":[[100,-70,-67]]},{"type":"Polygon","properties":{"name":"Ajdovščina"},"id":"SI.SP.AJ","arcs":[[101,102,103,104,105,-72]]},{"type":"Polygon","properties":{"name":"Bovec"},"id":"SI.SP.BO","arcs":[[-60,106,107,-84]]},{"type":"Polygon","properties":{"name":"Brda"},"id":"SI.SP.BR","arcs":[[108,109,110]]},{"type":"Polygon","properties":{"name":"Divaca"},"id":"SI.JP.DI","arcs":[[111,112,113,114,115,116]]},{"type":"Polygon","properties":{"name":"Hrpelje-Kozina"},"id":"SI.JP.HK","arcs":[[-115,117,118,119,120,121]]},{"type":"Polygon","properties":{"name":"Izola"},"id":"SI.JP.IZ","arcs":[[122,123,124]]},{"type":"Polygon","properties":{"name":"Kanal"},"id":"SI.SP.KA","arcs":[[125,-111,126,-95]]},{"type":"Polygon","properties":{"name":"Kobarid"},"id":"SI.SP.KO","arcs":[[-59,-97,127,-107]]},{"type":"Polygon","properties":{"name":"Komen"},"id":"SI.JP.KM","arcs":[[-105,128,129,130,131,132]]},{"type":"Polygon","properties":{"name":"Koper"},"id":"SI.JP.KP","arcs":[[133,134,-125,135,-120]]},{"type":"Polygon","properties":{"name":"Miren-Kostanjevica"},"id":"SI.SP.MK","arcs":[[136,-132,137,138]]},{"type":"Polygon","properties":{"name":"Piran"},"id":"SI.JP.PI","arcs":[[-123,-135,139]]},{"type":"Polygon","properties":{"name":"Sežana"},"id":"SI.JP.SE","arcs":[[-116,-122,140,-130,141]]},{"type":"Polygon","properties":{"name":"Vipava"},"id":"SI.SP.VI","arcs":[[142,-117,-142,-129,-104]]},{"type":"Polygon","properties":{"name":"Beltinci"},"id":"SI.PM.BE","arcs":[[143,144,145,146,147,148,149]]},{"type":"Polygon","properties":{"name":"Dornava"},"id":"SI.PD.DO","arcs":[[150,151,152,153,154]]},{"type":"Polygon","properties":{"name":"Gorišnica"},"id":"SI.PD.GO","arcs":[[155,156,157,158,159,-151]]},{"type":"Polygon","properties":{"name":"Juršinci"},"id":"SI.PD.DO","arcs":[[160,-154,161,162,163,164]]},{"type":"Polygon","properties":{"name":"Kobilje"},"id":"SI.PM.KO","arcs":[[165,166,167]]},{"type":"Polygon","properties":{"name":"Moravske Toplice"},"id":"SI.PM.MT","arcs":[[168,-167,169,170,-150,171,172,173,174]]},{"type":"Polygon","properties":{"name":"Murska Sobota"},"id":"SI.PM.MS","arcs":[[-149,175,176,177,-172]]},{"type":"Polygon","properties":{"name":"Odranci"},"id":"SI.PM.OD","arcs":[[178,-145]]},{"type":"Polygon","properties":{"name":"Ormož"},"id":"SI.PD.OR","arcs":[[179,180,-156,-155,-161,181]]},{"type":"Polygon","properties":{"name":"Sveti Jurij"},"id":"SI.PM.SJ","arcs":[[182,183,-165,184,185,186,187]]},{"type":"Polygon","properties":{"name":"Turnišče"},"id":"SI.PM.TU","arcs":[[188,189,190,191,-144,-171]]},{"type":"Polygon","properties":{"name":"Zavrc"},"id":"SI.PD.ZA","arcs":[[-181,192,-157]]},{"type":"Polygon","properties":{"name":"Šalovci"},"id":"SI.PM.SA","arcs":[[193,194,-175,195,196]]},{"type":"Polygon","properties":{"name":"Kuzma"},"id":"SI.PM.KU","arcs":[[197,198,199,200]]},{"type":"Polygon","properties":{"name":"Cerkvenjak"},"id":"SI.PD.CE","arcs":[[-186,201,202,203]]},{"type":"Polygon","properties":{"name":"Benedikt"},"id":"SI.PD.BE","arcs":[[204,205,206]]},{"type":"Polygon","properties":{"name":"Sveta Ana"},"id":"SI.PD.SA","arcs":[[207,-206,208,209,210]]},{"type":"Polygon","properties":{"name":"Hodoš"},"id":"SI.PM.HO","arcs":[[-194,211]]},{"type":"Polygon","properties":{"name":"Grad"},"id":"SI.PM.GD","arcs":[[212,213,-199,214]]},{"type":"Polygon","properties":{"name":"Destrnik"},"id":"SI.PD.DE","arcs":[[215,-163,216,217,218]]},{"type":"Polygon","properties":{"name":"Dobrova-Polhov Gradec"},"id":"SI.LJ.DP","arcs":[[219,220,221,-30,222,-28,223,-66,-91]]},{"type":"Polygon","properties":{"name":"Domžale"},"id":"SI.LJ.DM","arcs":[[224,225,226,227,228,229,230]]},{"type":"Polygon","properties":{"name":"Kamnik"},"id":"SI.LJ.KA","arcs":[[231,232,233,234,-42,235,-231,236,237,238,239,240,241]]},{"type":"Polygon","properties":{"name":"Kocevje"},"id":"SI.LJ.KC","arcs":[[242,243,244,245,246,247,248,249,250]]},{"type":"Polygon","properties":{"name":"Lenart"},"id":"SI.PD.LE","arcs":[[-209,-205,251,-203,252,253,-218,254,255,256,257,258]]},{"type":"Polygon","properties":{"name":"Loška dolina"},"id":"SI.NO.LD","arcs":[[259,260,261,262,263,264]]},{"type":"Polygon","properties":{"name":"Luce"},"id":"SI.SA.LU","arcs":[[265,266,-232,267,268]]},{"type":"Polygon","properties":{"name":"Majšperk"},"id":"SI.PD.MJ","arcs":[[269,270,271,272,273,274]]},{"type":"Polygon","properties":{"name":"Novo Mesto"},"id":"SI.DO.NM","arcs":[[275,276,277,278,279,280,281,282,283]]},{"type":"Polygon","properties":{"name":"Bistrica ob Sotli"},"id":"SI.SA.BS","arcs":[[284,285,286,287,288,289]]},{"type":"Polygon","properties":{"name":"Podvelka"},"id":"SI.KO.PO","arcs":[[290,291,292,293,294]]},{"type":"Polygon","properties":{"name":"Preddvor"},"id":"SI.GO.PR","arcs":[[-240,295,296,-82,297]]},{"type":"Polygon","properties":{"name":"Ptuj"},"id":"SI.PD.PT","arcs":[[-217,-162,-153,298,299,300,301,302,-255]]},{"type":"Polygon","properties":{"name":"Ravne na Koroškem"},"id":"SI.KO.RK","arcs":[[303,304,305,306,307]]},{"type":"Polygon","properties":{"name":"Ribnica"},"id":"SI.LJ.RI","arcs":[[-249,308,309,-2,310]]},{"type":"Polygon","properties":{"name":"Ruše"},"id":"SI.PD.RU","arcs":[[311,312,313,314,315]]},{"type":"Polygon","properties":{"name":"Šentjur pri Celju"},"id":"SI.SA.SC","arcs":[[316,-288,317,318,319,320,321,322,323,324,325,326]]},{"type":"Polygon","properties":{"name":"Slovenska Bistrica"},"id":"SI.PD.SB","arcs":[[327,328,329,-274,330,331,332,333,-44,334,-313]]},{"type":"Polygon","properties":{"name":"Videm"},"id":"SI.PD.VI","arcs":[[335,-159,336,337,338,-270,339,340,-300]]},{"type":"Polygon","properties":{"name":"Vojnik"},"id":"SI.SA.VO","arcs":[[341,-326,342,343,-15,-47]]},{"type":"Polygon","properties":{"name":"Žalec"},"id":"SI.SA.ZA","arcs":[[344,345,346,347,348,349,-11]]},{"type":"Polygon","properties":{"name":"Komenda"},"id":"SI.LJ.KM","arcs":[[350,-19,351,-238]]},{"type":"Polygon","properties":{"name":"Oplotnica"},"id":"SI.PD.OP","arcs":[[352,-45,-334]]},{"type":"Polygon","properties":{"name":"Hajdina"},"id":"SI.PD.HA","arcs":[[-341,353,354,-301]]},{"type":"Polygon","properties":{"name":"Miklavž na Dravskem polju"},"id":"SI.PD.MD","arcs":[[355,356,357,358,359]]},{"type":"Polygon","properties":{"name":"Hoce-Slivnica"},"id":"SI.PD.HS","arcs":[[-359,360,-328,-312,361]]},{"type":"Polygon","properties":{"name":"Trnovska vas"},"id":"SI.PD.TV","arcs":[[362,-219,-254]]},{"type":"Polygon","properties":{"name":"Žetale"},"id":"SI.PD.ZE","arcs":[[363,364,365,-271,-339]]},{"type":"Polygon","properties":{"name":"Podlehnik"},"id":"SI.PD.PO","arcs":[[366,-364,-338]]},{"type":"Polygon","properties":{"name":"Prevalje"},"id":"SI.KO.PR","arcs":[[367,368,369,-306]]},{"type":"Polygon","properties":{"name":"Selnica ob Dravi"},"id":"SI.PD.SD","arcs":[[-315,370,-291,371,372]]},{"type":"Polygon","properties":{"name":"Lovrenc na Pohorju"},"id":"SI.PD.LP","arcs":[[-371,-314,-335,-49,373,374,-292]]},{"type":"Polygon","properties":{"name":"Trzin"},"id":"SI.LJ.TR","arcs":[[375,376,-229]]},{"type":"Polygon","properties":{"name":"Jezersko"},"id":"SI.GO.JZ","arcs":[[377,-241,-298,-98,378]]},{"type":"Polygon","properties":{"name":"Žužemberk"},"id":"SI.DO.ZU","arcs":[[379,-281,380,-251,381,382,383]]},{"type":"Polygon","properties":{"name":"Dobrna"},"id":"SI.SA.DR","arcs":[[-344,384,-345,-10,385,-16]]},{"type":"Polygon","properties":{"name":"Tabor"},"id":"SI.SA.TA","arcs":[[386,387,-37,388,389]]},{"type":"Polygon","properties":{"name":"Vransko"},"id":"SI.SA.VR","arcs":[[-389,-43,-235,390,391]]},{"type":"Polygon","properties":{"name":"Mirna Pec"},"id":"SI.DO.MP","arcs":[[-282,-380,392]]},{"type":"Polygon","properties":{"name":"Prebold"},"id":"SI.SA.PR","arcs":[[-349,393,-387,394,395]]},{"type":"Polygon","properties":{"name":"Polzela"},"id":"SI.SA.PL","arcs":[[-350,-396,396,397,-12]]},{"type":"Polygon","properties":{"name":"Kostel"},"id":"SI.LJ.KS","arcs":[[398,399,-247]]},{"type":"Polygon","properties":{"name":"Braslovce"},"id":"SI.SA.BR","arcs":[[-397,-395,-390,-392,400,401,402]]},{"type":"Polygon","properties":{"name":"Sodražica"},"id":"SI.LJ.SO","arcs":[[403,404,-3,-310]]},{"type":"Polygon","properties":{"name":"Dolenjske Toplice"},"id":"SI.DO.DT","arcs":[[-280,405,-243,-381]]},{"type":"Polygon","properties":{"name":"Horjul"},"id":"SI.LJ.HO","arcs":[[-29,-223]]},{"type":"Polygon","properties":{"name":"Solcava"},"id":"SI.SA.SL","arcs":[[406,-268,-242,-378,407]]},{"type":"Polygon","properties":{"name":"Dobje"},"id":"SI.SA.DJ","arcs":[[408,-322]]},{"type":"Polygon","properties":{"name":"Dobrepolje"},"id":"SI.LJ.DB","arcs":[[409,-382,-250,-311,-1,410]]},{"type":"Polygon","properties":{"name":"Bloke"},"id":"SI.NO.BL","arcs":[[-405,411,-265,412,-4]]},{"type":"Polygon","properties":{"name":"Podcetrtek"},"id":"SI.SA.PD","arcs":[[413,414,-286,415]]},{"type":"Polygon","properties":{"name":"Maribor"},"id":"SI.PD.MB","arcs":[[416,-257,417,-360,-362,-316,-373,418,419]]},{"type":"Polygon","properties":{"name":"Ribnica na Pohorju"},"id":"SI.KO.RP","arcs":[[-375,420,421,-32,422,-293]]},{"type":"Polygon","properties":{"name":"Jesenice"},"id":"SI.GO.JS","arcs":[[423,-54,-83,424]]},{"type":"Polygon","properties":{"name":"Žirovnica"},"id":"SI.GO.ZV","arcs":[[-99,-88,-50,-424,425]]},{"type":"Polygon","properties":{"name":"Nova Goriška"},"id":"SI.SP","arcs":[[-73,-106,-133,-137,426,427,-109,-126,-94]]},{"type":"Polygon","properties":{"name":"Šempeter-Vrtojba"},"id":"SI.SP.SV","arcs":[[-139,428,-427]]},{"type":"Polygon","properties":{"name":"Črenšovci"},"id":"SI.PM.CR","arcs":[[429,430,431,432,-146,-179,-192]]},{"type":"Polygon","properties":{"name":"Lendava"},"id":"SI.PM.LE","arcs":[[-431,433,-190,434,435]]},{"type":"Polygon","properties":{"name":"Ljutomer"},"id":"SI.PM.LJ","arcs":[[-433,436,437,438,-182,-184,439,440,-147]]},{"type":"Polygon","properties":{"name":"Križevci"},"id":"SI.PM.KR","arcs":[[441,-440,-183,442,-176]]},{"type":"Polygon","properties":{"name":"Veržej"},"id":"SI.PM.VE","arcs":[[-441,-442,-148]]},{"type":"Polygon","properties":{"name":"Sveti Andraž v Slovenskih Goricah"},"id":"SI.PD.SS","arcs":[[-164,-216,-363,-253,-202,-185]]},{"type":"Polygon","properties":{"name":"Razkrižje"},"id":"SI.PM.RZ","arcs":[[443,-438]]},{"type":"Polygon","properties":{"name":"Velika Polana"},"id":"SI.PM.VP","arcs":[[-434,-430,-191]]},{"type":"Polygon","properties":{"name":"Dobrovnik"},"id":"SI.PM.DO","arcs":[[-166,444,-435,-189,-170]]},{"type":"Polygon","properties":{"name":"Markovci"},"id":"SI.PD.MK","arcs":[[-160,-336,-299,-152]]},{"type":"Polygon","properties":{"name":"Apace"},"id":"SI.PM.GR","arcs":[[445,-211,446,447]]},{"type":"Polygon","properties":{"name":"Šmartno in Litiji"},"id":"SI.LJ.LI","arcs":[[448,449,450,451]]},{"type":"Polygon","properties":{"name":"Cankova"},"id":"SI.PM.CA","arcs":[[452,-177,453,454,455,456]]},{"type":"Polygon","properties":{"name":"Gornja Radgona"},"id":"SI.PM.GR","arcs":[[-455,457,-187,-204,-252,-207,-208,-446,458]]},{"type":"Polygon","properties":{"name":"Gornji Petrovci"},"id":"SI.PM.GP","arcs":[[-174,459,-215,-198,460,-196]]},{"type":"Polygon","properties":{"name":"Puconci"},"id":"SI.PM.PU","arcs":[[-173,-178,-453,461,-213,-460]]},{"type":"Polygon","properties":{"name":"Radenci"},"id":"SI.PM.RD","arcs":[[-443,-188,-458,-454]]},{"type":"Polygon","properties":{"name":"Rogašovci"},"id":"SI.PM.RO","arcs":[[-214,-462,-457,462,-200]]},{"type":"Polygon","properties":{"name":"Borovnica"},"id":"SI.LJ.BO","arcs":[[463,-25,464]]},{"type":"Polygon","properties":{"name":"Brežice"},"id":"SI.PS.BR","arcs":[[465,466,-414,467]]},{"type":"Polygon","properties":{"name":"Krsko"},"id":"SI.","arcs":[[468,469]]},{"type":"Polygon","properties":{"name":"Brezovica"},"id":"SI.LJ.BR","arcs":[[470,471,472,-465,-31,-222]]},{"type":"Polygon","properties":{"name":"Celje"},"id":"SI.SA.CE","arcs":[[-325,473,474,-346,-385,-343]]},{"type":"Polygon","properties":{"name":"Cerklje na Gorenjskem"},"id":"SI.GO.CG","arcs":[[-352,-24,475,-296,-239]]},{"type":"Polygon","properties":{"name":"Cerknica"},"id":"SI.NO.CE","arcs":[[-464,-473,-5,-413,-264,476,477,478,-26]]},{"type":"Polygon","properties":{"name":"Črna na Koroškem"},"id":"SI.KO.CK","arcs":[[-368,-305,479,480,481,-269,-407,482,483]]},{"type":"Polygon","properties":{"name":"Crnomelj"},"id":"SI.DO.CR","arcs":[[484,485,-245,486]]},{"type":"Polygon","properties":{"name":"Dol pri Ljubljani"},"id":"SI.LJ.DL","arcs":[[487,488,489,-227]]},{"type":"Polygon","properties":{"name":"Dravograd"},"id":"SI.KO.DR","arcs":[[490,-34,491,-308,492]]},{"type":"Polygon","properties":{"name":"Duplek"},"id":"SI.PD.DU","arcs":[[-303,493,-356,-418,-256]]},{"type":"Polygon","properties":{"name":"Gornji Grad"},"id":"SI.SA.GG","arcs":[[494,495,-233,-267,496]]},{"type":"Polygon","properties":{"name":"Grosuplje"},"id":"SI.LJ.GR","arcs":[[497,-411,-8,498,499]]},{"type":"Polygon","properties":{"name":"Hrastnik"},"id":"SI.ZS.HR","arcs":[[500,501,502]]},{"type":"Polygon","properties":{"name":"Trbovlje"},"id":"SI.ZS","arcs":[[-394,-348,-502,503,504,-38,-388]]},{"type":"Polygon","properties":{"name":"Ig"},"id":"SI.LJ.IG","arcs":[[505,-6,-472,506]]},{"type":"Polygon","properties":{"name":"Ilirska Bistrica"},"id":"SI.NO.IB","arcs":[[-262,507,-118,-114,508]]},{"type":"Polygon","properties":{"name":"Ivancna Gorica"},"id":"SI.LJ.IV","arcs":[[509,-383,-410,-498,510,-450]]},{"type":"Polygon","properties":{"name":"Kidricevo"},"id":"SI.PD.KI","arcs":[[-354,-340,-275,-330,511,512]]},{"type":"Polygon","properties":{"name":"Kozje"},"id":"SI.SA.KO","arcs":[[-415,-467,-470,513,-318,-287]]},{"type":"Polygon","properties":{"name":"Krško"},"id":"SI.PS.KS","arcs":[[-469,-466,514,515,516,517,-319,-514]]},{"type":"Polygon","properties":{"name":"Kungota"},"id":"SI.PD.KU","arcs":[[518,-420,519,520]]},{"type":"Polygon","properties":{"name":"Laško"},"id":"SI.SA.LA","arcs":[[521,-323,-409,-321,522,523,-503,-347,-475]]},{"type":"Polygon","properties":{"name":"Litija"},"id":"SI.LJ.LI","arcs":[[-505,524,525,526,-452,527,-489,528,-39]]},{"type":"Polygon","properties":{"name":"Ljubljana"},"id":"SI.LJ","arcs":[[-376,-228,-490,-528,-451,-511,-500,529,-507,-471,-221,530,-21,531]]},{"type":"Polygon","properties":{"name":"Ljubno"},"id":"SI.SA.LJ","arcs":[[532,533,-497,-266,-482]]},{"type":"Polygon","properties":{"name":"Logatec"},"id":"SI.LJ.LO","arcs":[[-27,-479,534,-102,-71,-101,-224]]},{"type":"Polygon","properties":{"name":"Loški Potok"},"id":"SI.LJ.LP","arcs":[[-404,-309,-248,-400,535,-260,-412]]},{"type":"Polygon","properties":{"name":"Lukovica"},"id":"SI.LJ.LU","arcs":[[536,-225,-236,-41]]},{"type":"Polygon","properties":{"name":"Medvode"},"id":"SI.LJ.MD","arcs":[[-531,-220,-90,-76,537,-22]]},{"type":"Polygon","properties":{"name":"Mengeš"},"id":"SI.LJ.MN","arcs":[[-230,-377,-532,-20,-351,-237]]},{"type":"Polygon","properties":{"name":"Metlika"},"id":"SI.DO.CR","arcs":[[-485,538,-278,539]]},{"type":"Polygon","properties":{"name":"Mežica"},"id":"SI.KO.ME","arcs":[[-484,540,-369]]},{"type":"Polygon","properties":{"name":"Mislinja"},"id":"SI.KO.MI","arcs":[[-374,-48,-17,-386,-9,541,-421]]},{"type":"Polygon","properties":{"name":"Moravce"},"id":"SI.LJ.MO","arcs":[[-40,-529,-488,-226,-537]]},{"type":"Polygon","properties":{"name":"Mozirje"},"id":"SI.SA.MO","arcs":[[542,-402,543,-495,-534,544]]},{"type":"Polygon","properties":{"name":"Muta"},"id":"SI.KO.MU","arcs":[[545,-35,-491,546]]},{"type":"Polygon","properties":{"name":"Nazarje"},"id":"SI.SA.NA","arcs":[[-401,-391,-234,-496,-544]]},{"type":"Polygon","properties":{"name":"Pesnica"},"id":"SI.PD.PE","arcs":[[-258,-417,-519,547]]},{"type":"Polygon","properties":{"name":"Pivka"},"id":"SI.SP.PI","arcs":[[-263,-509,-113,548,-477]]},{"type":"Polygon","properties":{"name":"Postojna"},"id":"SI.SP.PO","arcs":[[-478,-549,-112,-143,-103,-535]]},{"type":"Polygon","properties":{"name":"Race-Fram"},"id":"SI.PD.RF","arcs":[[-358,549,-512,-329,-361]]},{"type":"Polygon","properties":{"name":"Radece"},"id":"SI.SA.RA","arcs":[[-524,550,-525,-504,-501]]},{"type":"Polygon","properties":{"name":"Radlje ob Dravi"},"id":"SI.KO.RD","arcs":[[-423,-36,-546,551,-294]]},{"type":"Polygon","properties":{"name":"Rogaška Slatina"},"id":"SI.SA.RS","arcs":[[-273,552,553,-290,554,-331]]},{"type":"Polygon","properties":{"name":"Rogatec"},"id":"SI.SA.RO","arcs":[[-366,555,-553,-272]]},{"type":"Polygon","properties":{"name":"Semic"},"id":"SI.DO.SM","arcs":[[-487,-244,-406,-279,-539]]},{"type":"Polygon","properties":{"name":"Šenčur"},"id":"SI.GO.SE","arcs":[[-23,-538,-75,-297,-476]]},{"type":"Polygon","properties":{"name":"Šentilj"},"id":"SI.PD.SE","arcs":[[-447,-210,-259,-548,-521,556]]},{"type":"Polygon","properties":{"name":"Šentjernej"},"id":"SI.DO.SN","arcs":[[557,-276,558,-516]]},{"type":"Polygon","properties":{"name":"Sevnica"},"id":"SI.PS.SE","arcs":[[-320,-518,559,560,-526,-551,-523]]},{"type":"Polygon","properties":{"name":"Škocjan"},"id":"SI.DO.SK","arcs":[[-517,-559,-284,-560]]},{"type":"Polygon","properties":{"name":"Škofljica"},"id":"SI.LJ.SK","arcs":[[-499,-7,-506,-530]]},{"type":"Polygon","properties":{"name":"Slovenj Gradec"},"id":"SI.KO","arcs":[[-422,-542,-14,561,-480,-304,-492,-33]]},{"type":"Polygon","properties":{"name":"Slovenske Konjice"},"id":"SI.SA.SK","arcs":[[-333,562,-327,-342,-46,-353]]},{"type":"Polygon","properties":{"name":"Šmarje pri Jelšah"},"id":"SI.SA.SJ","arcs":[[-555,-289,-317,-563,-332]]},{"type":"Polygon","properties":{"name":"Šmartno ob Paki"},"id":"SI.SA.SP","arcs":[[-398,-403,-543,563]]},{"type":"Polygon","properties":{"name":"Šoštanj"},"id":"SI.SA.SS","arcs":[[-13,-564,-545,-533,-481,-562]]},{"type":"Polygon","properties":{"name":"Starše"},"id":"SI.PD.ST","arcs":[[-302,-355,-513,-550,-357,-494]]},{"type":"Polygon","properties":{"name":"Štore"},"id":"SI.SA.ST","arcs":[[-324,-522,-474]]},{"type":"Polygon","properties":{"name":"Trebnje"},"id":"SI.DO.TR","arcs":[[-561,-283,-393,-384,-510,-449,-527]]}]}},"arcs":[[[4047,3132],[0,-84],[-3,-28],[-7,-33],[6,-32],[20,-5],[20,-15],[56,-63],[59,-134]],[[4198,2738],[-55,-27],[-51,-62],[-84,-48],[-130,-34]],[[3878,2567],[-72,-23]],[[3806,2544],[-110,158],[-78,194]],[[3618,2896],[-25,77],[-3,71],[6,57],[-25,73]],[[3571,3174],[56,26],[72,-41],[38,-42],[23,-15],[16,-18],[22,-4],[26,2],[36,48],[17,54],[-4,97]],[[3873,3281],[20,-9],[7,14],[2,32],[20,51]],[[3922,3369],[66,-100],[14,-57],[45,-80]],[[5581,6931],[100,-64],[21,-2],[27,-11],[17,-13],[2,-47],[-2,-29],[1,-28],[46,-39]],[[5793,6698],[35,-194],[11,-46],[5,-57],[0,-26],[-31,-99]],[[5813,6276],[-47,-17],[-74,75],[-39,-2],[-26,-20],[-21,-36],[-27,-74]],[[5579,6202],[-40,42],[-25,66],[-48,51],[-19,45],[-47,37]],[[5400,6443],[10,139],[40,100],[18,95],[4,185]],[[5472,6962],[10,53],[20,-2],[42,-21],[37,-61]],[[6240,6537],[-201,-2]],[[6039,6535],[-112,191]],[[5927,6726],[68,150],[42,161],[20,42],[24,23],[54,23],[85,9]],[[6220,7134],[30,-30],[9,-7],[-1,-15],[-17,-14],[-14,-19],[-7,-27],[2,-41],[47,-124],[27,-36],[22,-23],[9,-36],[-6,-65],[-8,-36],[-73,-124]],[[3604,5410],[76,-179],[42,-21]],[[3722,5210],[-3,-89],[-29,-31],[-12,-45],[-32,-33]],[[3646,5012],[-85,-42],[-34,-5],[-23,32]],[[3504,4997],[-33,346]],[[3471,5343],[26,33],[1,6],[-14,50]],[[3484,5432],[120,-22]],[[3175,3761],[-68,-30],[-8,-22],[-12,-22],[-13,-79],[2,-63],[10,-61],[64,-252],[20,-48],[39,-75]],[[3209,3109],[-36,-28],[-124,138],[-52,27],[-33,-38]],[[2964,3208],[-42,150],[-81,152],[-68,105],[-28,30],[-21,14],[-15,0],[-14,12],[-10,33],[5,34],[14,40],[-5,52],[14,96],[27,28],[4,13],[-76,77],[-30,13],[-19,116]],[[2619,4173],[171,-31]],[[2790,4142],[7,-50],[-24,-29],[5,-24],[16,-27],[69,-49],[21,-4],[9,12],[-2,21],[5,23],[17,13],[81,22],[23,15],[83,34]],[[3100,4099],[56,46],[23,47],[59,33]],[[3238,4225],[36,-56],[8,-33],[-2,-25],[-4,-34],[-36,-21],[-23,-37],[-21,-60],[10,-94],[-31,-104]],[[5822,7675],[-34,-83]],[[5788,7592],[-144,113],[-17,55],[-34,73],[-45,55],[-31,70]],[[5517,7958],[9,64],[-7,53],[15,56],[10,26],[44,18]],[[5588,8175],[46,-10],[45,27],[93,110]],[[5772,8302],[26,-48],[10,-13],[7,-7],[19,-10],[19,-24],[8,-22],[0,-29],[-6,-38],[-26,-70],[-18,-17],[-20,-8],[-12,1],[-6,-8],[9,-29],[2,-30],[-12,-56],[-17,-46],[-7,-46],[-2,-34],[16,-60],[60,-33]],[[5096,5374],[93,9]],[[5189,5383],[41,-117],[-15,-20],[-12,-15],[-37,-27],[-20,-31],[-2,-14],[6,-2],[11,10],[13,5],[12,-4],[46,-84],[43,-110],[13,-61],[0,-38],[-8,-16],[-13,-21],[-8,-9],[-23,-18],[-5,-1],[-5,1],[-37,17]],[[5189,4828],[-76,-48],[-24,-24],[-30,-53],[-11,-14],[-13,-12],[-14,-8],[-52,-15],[-39,0],[-12,-3],[-10,-5],[-11,5],[-15,15],[-35,91],[-2,33],[5,23],[3,32],[-1,22],[-11,21],[-27,10],[-135,3],[-14,51]],[[4665,4952],[15,31],[-1,27],[4,25],[-39,79]],[[4644,5114],[-10,40],[-22,19],[-4,12],[9,10],[209,37],[22,14],[29,81],[-9,123]],[[4868,5450],[36,13]],[[4904,5463],[16,-64],[47,-53],[23,-13],[106,41]],[[6253,7315],[10,-83],[23,-41],[22,-48],[50,-34],[44,-48],[52,-20],[77,-92]],[[6531,6949],[-20,-50],[-6,-35],[-7,-33],[-8,-15],[0,-21],[17,-32],[12,-31],[-5,-21],[-8,-19],[-16,-27],[-2,-20],[51,-66]],[[6539,6579],[-41,-114],[-15,0],[-20,14],[-24,11],[-18,-15],[-19,-32],[-42,-123]],[[6360,6320],[-60,51],[-36,56],[-5,63],[-19,47]],[[6220,7134],[7,50],[-8,32],[-21,46],[-7,87]],[[6191,7349],[62,-34]],[[2421,6826],[-22,-98],[52,-143]],[[2451,6585],[17,-43],[21,-63],[9,-35],[-5,-35],[-46,-71],[-12,-46],[-10,-28],[-41,-54],[-16,-80]],[[2368,6130],[-31,-54],[-13,14],[-19,68],[-15,37],[-21,4],[-19,-13],[-26,-12],[-25,-6],[-46,22],[-30,42],[-18,34],[-19,29],[-42,42],[-35,10],[-47,68],[-61,32],[-54,52],[-152,47],[-64,-1],[-99,103]],[[1532,6648],[223,182],[92,127],[42,44],[38,28],[23,42],[41,18]],[[1991,7089],[255,-210],[29,-37],[47,-32],[15,-7],[84,23]],[[2368,6130],[154,-26],[16,10],[22,4],[11,-8],[16,-35],[-4,-101]],[[2583,5974],[-40,-20]],[[2543,5954],[-106,18],[-37,-6],[-34,-12],[-24,-50],[-13,-46],[-10,-108],[-7,-38],[-26,-17],[-179,42],[-62,-25],[-40,-50]],[[2005,5662],[0,1],[-324,-65],[-45,1],[-47,11],[-143,70],[-159,140],[-108,167]],[[1179,5987],[-30,108]],[[1149,6095],[48,169],[23,65],[46,68],[203,166],[43,91]],[[1512,6654],[20,-6]],[[2249,5099],[-146,-392],[-11,-62],[-8,-73],[5,-22],[21,-41]],[[2110,4509],[0,-49],[-17,-11],[-17,-4],[-32,4],[-30,19],[-56,61],[-56,75],[-14,3],[-3,-13],[-3,-23],[-4,-19],[-24,-36],[-14,-31],[-17,-4],[-13,1],[-14,16],[-11,-3],[-4,-14],[0,-24],[-9,-30],[-31,-3],[-18,8],[-42,39]],[[1681,4471],[38,38],[3,23],[-4,45],[-9,39],[-7,62],[1,54],[-7,55],[-29,81],[-14,67],[1,38],[11,55],[12,44],[41,65],[54,49],[109,54],[100,112]],[[1981,5352],[-4,-59],[1,-38],[16,-18],[30,-16],[120,-18],[85,-40],[20,-64]],[[2685,4613],[-3,-102],[-8,-45],[-3,-48],[-63,-154]],[[2608,4264],[-67,84],[-21,35],[-40,77],[-19,25],[-34,24],[-253,83],[-36,-12],[-18,-12],[-10,-59]],[[2249,5099],[65,66],[11,19],[204,62]],[[2529,5246],[36,-7],[40,12],[58,6],[28,-12],[19,-28],[12,-30],[-26,-81],[-20,-28],[-15,-43],[-8,-33],[-2,-22],[14,-21],[5,-23],[2,-32],[-13,-32],[-9,-38],[-1,-62],[3,-59],[23,-37],[10,-63]],[[2110,4509],[76,-70],[88,-196],[26,-17],[21,-1],[13,-34],[16,-59],[9,-25],[9,-18],[87,-48]],[[2455,4041],[-4,-93],[-27,-54],[-26,-41],[-31,-37],[-8,-28],[4,-14],[14,-8],[6,-31],[-4,-70],[-19,-82],[-22,-65],[-5,-61],[1,-53],[12,-54],[15,-33],[38,-158]],[[2399,3159],[-248,80],[-126,134],[-40,65],[-63,62],[-30,41],[-43,20],[-77,99],[-71,127],[-58,44],[-31,33],[-20,32],[-3,27],[-43,92]],[[1546,4015],[43,35]],[[1589,4050],[6,130],[0,42],[-2,37],[4,26],[13,2],[7,13],[-3,26],[-9,22],[-19,17],[-9,21],[-4,23],[9,31],[12,11],[30,-13],[17,3],[12,23],[5,15],[23,-8]],[[3339,6007],[-7,-68],[-40,-86],[-31,-182],[-26,-71],[-4,-40],[3,-20],[9,-16],[7,-16],[55,-176]],[[3305,5332],[16,-116],[9,-31],[-65,-71]],[[3265,5114],[-28,112],[-17,35],[-25,10],[-12,-4],[-12,6],[-4,33],[6,26],[7,20],[-5,7],[-50,-22],[-37,3],[-198,125],[-20,25],[1,35],[8,22],[10,14],[8,14],[2,21],[-4,17],[-6,13],[-85,62]],[[2804,5688],[-85,52],[-44,37],[-50,85],[-82,92]],[[2583,5974],[155,-63],[21,-13],[128,12]],[[2887,5910],[75,-46],[85,-94],[15,12],[9,29],[6,68],[-14,47],[-47,97],[-12,14],[-1,27],[4,24],[26,40],[7,37],[18,17],[-7,50]],[[3051,6232],[12,107],[25,24],[39,57],[29,17],[146,5]],[[3302,6442],[-38,-176],[-14,-98],[-8,-35],[-12,-25],[-13,4],[-31,15],[-7,-17],[5,-40],[9,-31],[27,-30],[31,14],[88,-16]],[[2062,7351],[-2,-94],[-6,-58],[-24,-36],[-16,-17],[-23,-57]],[[1512,6654],[-55,108],[-11,25],[-11,44],[-19,37],[-40,49],[-100,91],[-52,35],[-40,15],[-82,-56],[-32,-14],[-33,-6],[-16,16],[11,155],[-14,70]],[[1018,7223],[8,25],[4,178],[18,37],[12,43],[6,49],[0,54],[48,-6],[209,-77],[44,1],[206,51],[95,-24],[291,-207],[52,-10],[51,14]],[[2887,5910],[-23,107],[-5,47],[4,201]],[[2863,6265],[70,-26],[19,-18],[17,-5],[82,16]],[[2451,6585],[70,66],[29,-4],[37,5],[33,35],[13,47],[17,71],[46,91],[27,33],[48,24]],[[2771,6953],[47,-81],[7,-162],[-21,-256],[6,-40],[8,-22],[17,-15],[-7,-33],[13,-49],[22,-30]],[[3265,5114],[-31,-15],[-6,-19],[-15,-36],[-26,-21],[-38,-13],[-62,-74],[-22,-54],[-10,-57],[9,-37],[-17,-104]],[[3047,4684],[-184,56],[-112,-45],[-66,-82]],[[2529,5246],[25,65],[67,35],[25,36],[54,41],[18,4],[13,10],[15,27],[16,121],[24,38],[18,65]],[[2005,5662],[26,-88],[0,-46],[-50,-176]],[[1589,4050],[-87,85],[-24,41],[-33,75],[-29,97],[-11,86],[-3,83],[3,49],[-25,155],[-23,34],[-38,3],[-38,-51]],[[1281,4707],[-191,183],[-14,37],[-23,20],[-32,68],[-6,52],[-59,150],[-81,-26]],[[875,5191],[-11,62],[-32,10]],[[832,5263],[0,1],[30,64],[-45,65],[0,27],[-2,41],[6,60],[17,37],[16,24],[17,-12],[13,-3],[14,9],[36,38],[25,9],[57,3],[23,32],[8,82],[22,127],[22,60],[31,49],[25,10],[32,1]],[[3402,6909],[-9,-19],[-37,-136],[-12,-66],[-33,-97],[1,-62],[-10,-87]],[[2771,6953],[12,83],[1,3],[0,5]],[[2784,7044],[380,-17],[107,36],[34,-12],[15,-32],[10,-40],[18,-32],[54,-38]],[[2608,4264],[-50,-123],[-103,-100]],[[2399,3159],[16,-69]],[[2415,3090],[-93,-117],[-12,-21],[-149,-83]],[[2161,2869],[-77,77],[-12,51],[-10,68],[-31,55],[-25,20],[-33,12],[-42,-3],[-54,-25],[-77,-71],[-33,-54],[-46,-43],[-49,-61],[-19,-83]],[[1653,2812],[-71,-17],[-18,2],[-76,62]],[[1488,2859],[-34,83],[-9,16],[-49,44],[-14,17],[-9,28],[-9,17],[-12,27],[-13,27],[-58,87],[-44,42],[-25,48],[-26,24],[-16,11],[-3,18],[43,47],[21,11],[68,123],[77,201],[144,158],[0,68],[26,59]],[[1149,6095],[-177,-47],[-64,10],[-69,30],[-143,-7],[-109,17],[-56,-28],[-21,-25],[11,-24],[3,-33],[-10,-33],[-38,-29],[-121,26],[-89,43],[-52,37],[-43,20],[-48,54],[-27,25]],[[96,6131],[45,117],[43,147],[34,63],[42,7],[40,29],[76,84],[147,119],[77,122],[68,144],[78,111],[107,21],[79,-4],[59,49],[27,83]],[[758,4091],[70,-113],[-48,-38],[-30,-43],[-3,-3]],[[747,3894],[-92,-33],[-102,-75],[-95,-11],[-87,151],[-1,8],[-2,7],[-3,7],[-2,5],[-15,19],[-41,73],[-1,1],[49,67],[16,16],[25,50],[9,48],[-8,45],[-26,41],[73,147],[55,64]],[[499,4524],[30,-35],[45,-28],[33,-52],[18,-66],[28,-74],[52,-73],[53,-105]],[[2133,2342],[111,-122],[31,-64],[36,-138]],[[2311,2018],[-32,-54],[-37,-27],[-22,-63],[-7,-49],[7,-47],[13,-43],[1,-96],[12,-47],[16,-52],[17,-69],[-12,-41],[1,-12],[34,-25]],[[2302,1393],[-2,-71]],[[2300,1322],[-40,-29],[-17,-44],[-17,-18],[-22,-9],[-63,19],[-47,63],[-59,44],[-59,65],[-52,41],[-65,20],[-40,46]],[[1819,1520],[17,129],[-23,64],[83,192],[17,50],[-9,62],[-17,55],[-13,78],[3,46],[25,30],[35,29],[46,115]],[[1983,2370],[41,34],[8,10],[22,-2],[11,-4],[68,-66]],[[2300,1322],[47,-65],[-8,-23],[-10,-51],[-17,-52],[-13,-82],[3,-32],[10,-19],[19,9],[19,-19],[-2,-39],[-7,-69],[-26,-133],[-23,-92],[6,-19],[58,-73],[15,-23],[19,-67],[0,-85],[-4,-44],[-1,-1]],[[2385,343],[-75,6],[-84,44],[-79,90],[-42,66],[-46,36],[-84,28]],[[1975,613],[0,1],[-12,52],[-100,183],[-132,42],[-51,54],[-31,55],[-15,33],[-30,174],[-8,32]],[[1596,1239],[60,116],[25,90],[-4,14]],[[1677,1459],[49,69],[93,-8]],[[944,579],[-16,-103],[-11,-11],[-24,-17],[-16,10],[-5,9],[-1,16],[-20,45],[-15,17],[-21,32],[-10,62],[-1,41],[-6,27],[-17,56],[-1,31]],[[780,794],[204,47]],[[984,841],[-3,-167],[-37,-95]],[[1281,4707],[-6,-137],[-20,-44],[-28,-76],[-38,-45],[-24,-2],[-86,55],[-75,8],[-47,-38],[-38,-47],[-70,-164],[-23,-26],[-3,-26],[44,-89],[16,-42],[-9,-18],[-13,-7],[-13,3],[-10,15],[-13,19],[-19,25],[-13,11],[-35,9]],[[499,4524],[298,345],[91,255],[-13,67]],[[832,5263],[-43,12],[-93,-15],[-81,19],[-95,144],[-60,64],[-89,27],[-44,38],[-95,10],[-49,26],[46,-122],[-87,-21],[-27,60],[-11,96],[-42,88],[0,1],[-20,174],[-17,83],[-25,70],[83,78],[13,36]],[[1653,2812],[52,-128]],[[1705,2684],[-158,-74],[-316,-61],[-67,4],[-20,-11],[-63,-70],[-19,-64]],[[1062,2408],[-125,150],[-54,25],[-109,20],[-65,55],[-23,19],[-23,68]],[[663,2745],[57,15],[181,-8],[67,18],[38,63],[37,32],[22,46],[18,24],[9,129]],[[1092,3064],[169,-142],[54,-25],[68,1],[35,6],[70,-45]],[[1975,613],[-49,16],[-22,-23],[-12,-49],[0,-74],[68,-124],[-41,-86],[-149,-97],[-46,-70],[-28,-67],[-34,-39],[-169,38],[-50,24],[-42,66],[-150,146],[-316,-22]],[[935,252],[1,2],[4,43],[15,17],[3,1],[12,15],[5,21],[7,23],[10,37],[35,56],[14,31],[-5,17],[-6,11],[-86,53]],[[984,841],[247,56],[0,43],[-34,74],[-48,80],[-49,83],[156,21],[126,-104],[150,24],[64,121]],[[894,3288],[-23,-32],[-18,-7],[-27,-3],[-16,-14],[0,-22],[28,-49],[32,-32],[82,-44],[45,3],[95,-24]],[[663,2745],[-26,78],[11,238],[95,332]],[[743,3393],[45,-58],[106,-47]],[[935,252],[-98,-7],[-125,208],[7,29],[-8,59],[21,72],[0,43],[-31,9],[-24,27],[-18,46],[-14,65],[67,-24],[68,15]],[[1677,1459],[-1,6],[-29,3],[-48,42],[-34,57],[-253,653],[-219,152],[-31,36]],[[1705,2684],[92,-118],[166,-141],[20,-55]],[[2161,2869],[40,-196],[-21,-81],[-10,-131],[-17,-36],[-20,-83]],[[9309,8499],[-37,-46],[1,-35],[-11,-59],[48,-68],[7,-143]],[[9317,8148],[-84,8],[-24,-39],[-14,-26],[-8,-40],[6,-28],[2,-21],[13,-50]],[[9208,7952],[-59,-106]],[[9149,7846],[-98,210]],[[9051,8056],[-42,55],[-135,96]],[[8874,8207],[69,66],[31,71],[41,26],[113,169]],[[9128,8539],[88,-15],[25,40],[22,-9],[46,-56]],[[8446,7002],[-45,19],[-52,-43],[-13,-23],[-26,-61]],[[8310,6894],[-128,27]],[[8182,6921],[32,211]],[[8214,7132],[77,-32],[62,85],[23,56],[14,49],[40,118]],[[8430,7408],[60,-153],[-3,-135],[-41,-118]],[[8446,7002],[78,-51],[49,-144],[31,-137]],[[8604,6670],[-65,25],[-47,-59],[-29,-107],[0,-40],[10,-30],[11,-19],[8,-39],[7,-80],[22,-117],[1,-4]],[[8522,6200],[-35,-58],[-63,-66],[-66,-51],[-15,-6]],[[8343,6019],[-1,1],[-13,32],[-44,224],[2,54],[-8,47],[-8,30],[-12,18],[7,89]],[[8266,6514],[25,2],[26,14],[11,11],[30,50],[-1,21],[-4,36],[-26,87],[-2,61],[-15,98]],[[8428,7551],[-20,-26],[22,-117]],[[8214,7132],[-30,63],[2,142]],[[8186,7337],[10,46]],[[8196,7383],[7,101],[16,31],[24,33],[30,21],[37,37],[77,36]],[[8387,7642],[41,-91]],[[9641,8605],[-2,0],[-30,8],[-61,40],[-30,33],[-24,69]],[[9494,8755],[25,70],[4,13]],[[9523,8838],[3,-2],[16,-10],[59,-6],[48,-48],[17,-131],[-25,-36]],[[9314,9413],[-4,-26],[7,-26],[44,-199],[36,-70],[27,-80],[29,-53],[44,12],[1,-117],[25,-16]],[[9494,8755],[-14,8],[-35,21],[-21,-36],[-21,-53],[-32,-107],[-10,-108]],[[9361,8480],[-52,19]],[[9128,8539],[-48,13],[-70,55],[-18,24],[-19,36],[-1,51],[-41,126]],[[8931,8844],[-10,147],[8,15],[19,43],[19,1],[65,123]],[[9032,9173],[23,-4],[19,17],[26,71],[27,37],[54,122]],[[9181,9416],[104,-20],[19,7],[8,7],[2,3]],[[8874,8207],[-129,92],[-32,33]],[[8713,8332],[32,91],[9,48],[-14,48],[-15,39],[-17,36],[-13,69],[-5,37],[17,94]],[[8707,8794],[114,10],[23,-13],[87,53]],[[9317,8148],[-2,-55],[-41,-78],[-24,-12],[-42,-51]],[[9107,7367],[-2,-42],[12,-95],[38,-191],[2,-57],[-6,-111],[9,-58],[19,-36],[54,-54],[15,-33],[4,-60],[1,-17],[-15,-21],[-72,2],[-113,-43],[-27,-1],[-54,18],[-45,41],[-76,110],[-31,22],[-39,-11],[-27,-43],[-24,-53],[-30,-38],[-37,-10],[-18,5]],[[8645,6591],[-41,79]],[[8428,7551],[99,-35],[51,-33],[146,-39],[73,-46],[35,-6],[15,8],[10,25],[48,18],[40,-44],[27,-38],[32,-73],[7,-4],[8,4],[12,19],[20,-11],[17,6],[7,17],[9,23],[13,18],[8,6],[2,1]],[[8615,8119],[35,-163],[-3,-39],[-37,-154]],[[8610,7763],[-102,24],[-15,-20],[-21,-23],[-19,-41],[-4,-16],[4,-18],[-5,-25],[0,-22],[-20,-71]],[[8387,7642],[-66,154]],[[8321,7796],[-58,136],[31,137]],[[8294,8069],[113,54]],[[8407,8123],[43,-29],[12,22],[19,26],[37,68],[23,-3],[16,-26],[16,-78],[11,-25],[9,6],[22,35]],[[9361,8480],[107,-207]],[[9468,8273],[97,-108]],[[9565,8165],[-47,-16],[-47,21],[-27,-8],[-15,-15],[-2,-22],[-21,-71]],[[9406,8054],[-89,94]],[[8645,6591],[-98,31],[-1,-124],[7,-100],[0,-90],[-23,-95],[-8,-13]],[[9307,9881],[0,-1],[2,-18],[16,-60],[0,-92],[-6,-39],[-16,-45],[2,-22],[5,-21],[39,-43],[2,-2]],[[9351,9538],[-28,-73],[-9,-52]],[[9181,9416],[9,53],[9,26],[10,74],[-3,53],[-21,57],[-46,69],[-53,45],[-153,168]],[[8933,9961],[294,38],[32,-28],[48,-90]],[[8777,9949],[-24,-93],[8,-72]],[[8761,9784],[-84,-6],[-22,-13],[-45,-54],[-17,-26],[-52,-19]],[[8541,9666],[-10,209]],[[8531,9875],[131,116],[115,-42]],[[8321,7796],[-87,-92],[-16,-3],[-21,3],[-8,17],[-53,42]],[[8136,7763],[-28,163],[9,24],[13,33],[37,42],[17,11],[39,49]],[[8223,8085],[71,-16]],[[8151,8142],[-22,-38],[-35,-36],[-12,-4],[-19,-1],[-10,-11],[-13,5],[-16,28],[-56,123],[-40,35]],[[7928,8243],[9,85],[29,91],[42,66]],[[8008,8485],[40,-26],[12,-3],[15,-13],[13,-1],[16,2],[15,5],[16,-8],[10,-9],[-9,-33],[-48,-65],[1,-39],[9,-54],[53,-99]],[[8010,8602],[-2,-117]],[[7928,8243],[-19,-26],[-16,2],[-22,11],[-33,40],[-17,28],[0,34],[-2,25],[-10,62],[-6,26],[-16,37],[-58,10]],[[7729,8492],[-18,54],[-6,43],[1,33],[20,34],[2,40],[13,43],[1,120]],[[7742,8859],[45,-25],[28,-68],[100,-102],[57,-23],[38,-39]],[[9307,9881],[15,-26],[27,-22],[47,-4],[14,-35],[-7,-62],[-18,-85],[-22,-78],[-12,-31]],[[8796,9759],[-30,-291],[-47,-139],[-22,-25],[-24,-12],[-20,11],[-28,8],[-60,-5]],[[8565,9306],[-36,41],[-2,39],[14,280]],[[8761,9784],[35,-25]],[[8137,7501],[59,-118]],[[8186,7337],[-69,-66],[-44,-74],[-10,-26],[-16,-20],[-24,-10],[-25,9],[-47,45],[-78,158],[-70,84]],[[7803,7437],[98,79]],[[7901,7516],[41,-43],[66,-2],[129,30]],[[3047,4684],[25,-55],[16,-24],[39,-25],[68,47],[117,-50]],[[3312,4577],[20,-1],[19,-12],[10,-20],[26,-105],[8,-17],[8,-31],[8,-41],[3,-64],[-1,-34],[-3,-16],[-34,-33]],[[3376,4203],[-52,40],[-16,7],[-70,-25]],[[3100,4099],[4,37],[4,17],[0,23],[-4,27],[-19,59],[-20,21],[-24,14],[-130,21],[-80,-30],[-14,-11],[-29,-57],[2,-78]],[[2619,4173],[8,69],[-19,22]],[[4183,5384],[-62,-94],[-35,-106],[-6,-40],[3,-22],[11,-4],[11,-11],[9,-20],[10,-18],[11,-10],[26,-11],[24,-47]],[[4185,5001],[-29,-36],[2,-42],[13,-13],[13,-19],[19,-17],[-7,-59]],[[4196,4815],[-66,3],[-42,-32],[-76,-75],[-37,-27],[-74,-12]],[[3901,4672],[-6,61],[-73,16]],[[3822,4749],[5,117],[16,69],[44,91]],[[3887,5026],[-19,200],[20,88]],[[3888,5314],[61,-4],[72,61],[23,34],[19,17],[21,10],[19,4],[80,-52]],[[4046,6545],[22,-226],[75,-161],[20,-77],[11,-62],[17,-29],[64,3]],[[4255,5993],[-6,-119],[32,-47],[124,-60],[113,-9],[72,9],[138,-10]],[[4728,5757],[96,-86]],[[4824,5671],[143,-151],[-63,-57]],[[4868,5450],[-359,-62],[-51,-27],[-67,1],[-43,11],[-61,32],[-104,-21]],[[3888,5314],[-33,23],[9,39]],[[3864,5376],[-40,117],[-14,92],[-41,105]],[[3769,5690],[36,28],[9,19],[6,24],[2,28],[2,27],[-36,91],[-17,28],[-9,75],[-21,65],[1,92]],[[3742,6167],[29,65],[-9,26],[-6,30],[-13,50],[7,67],[-3,45],[-31,53]],[[3716,6503],[104,58]],[[3820,6561],[86,-51],[44,4],[96,31]],[[5132,2379],[5,-119],[-11,-54],[-26,-207],[15,-60],[14,-44],[60,-103],[64,-116],[14,-122],[41,-112]],[[5308,1442],[60,-170],[55,-34]],[[5423,1238],[20,-84],[-3,-41],[15,-64],[-1,-78],[18,-35],[36,-54],[0,-32],[-10,-8],[-11,9],[-12,1],[-10,-14],[-16,-13],[-28,-57],[-11,-79],[11,-40],[21,-18],[34,13],[35,21],[37,6],[24,-26],[2,-34],[-10,-20],[-46,-16],[-34,-28],[-20,-23],[-37,-71],[-28,-104]],[[5399,349],[-32,42],[-154,6],[-32,44],[-35,26],[-29,6]],[[5117,473],[0,1],[-38,136],[-68,97],[-19,6],[-26,-6],[-51,-24],[-38,-4],[-52,19],[-48,42],[-18,6],[-20,-9],[-31,-39],[-8,-27],[-8,-45],[-16,-65],[-9,-19],[-14,-14],[-44,11],[-68,123],[-126,180],[-54,60],[-19,56],[-5,26],[6,13],[1,32],[-12,27],[-20,147]],[[4312,1203],[-40,217],[49,67],[17,64]],[[4338,1551],[73,-52],[50,16],[23,47],[33,103],[3,74],[105,373],[-84,106]],[[4541,2218],[57,101]],[[4598,2319],[42,0],[28,20],[34,-7],[50,-27],[24,-24],[23,-57],[59,8],[97,167],[41,16],[136,-36]],[[8151,8142],[72,-57]],[[8136,7763],[-14,-52]],[[8122,7711],[-101,83],[-25,-29],[-36,-29],[-17,-30],[-8,-29],[-10,-27],[-6,-40],[-10,-28],[-8,-66]],[[7803,7437],[-23,17]],[[7780,7454],[-19,62],[5,16],[8,24],[11,19],[-8,37],[-19,36],[-58,65],[-7,21],[-4,28],[-8,22],[-13,14],[-17,7],[-21,-6],[-48,-1]],[[7582,7798],[49,87],[-11,13],[-7,26],[-10,18],[-18,39]],[[7585,7981],[16,103],[-7,101],[10,85],[31,134]],[[7635,8404],[9,63],[9,14],[7,20],[69,-9]],[[3721,2158],[61,-294],[6,-75],[31,-102],[2,-14],[0,-3]],[[3821,1670],[-16,-10],[-25,-42],[-40,-141],[-33,-74],[-80,-138],[-30,-67],[-20,-89],[-2,-29]],[[3575,1080],[-2,1],[-9,6],[-23,-3],[-21,4],[-20,-10],[-24,9],[-35,-3],[-33,7],[-2,15],[16,32],[2,49],[-8,37],[-42,60],[-20,58],[2,48],[12,140]],[[3368,1530],[-2,122],[-29,64],[-74,128],[-22,127]],[[3241,1971],[77,18],[215,262]],[[3533,2251],[95,-116],[54,-16],[14,9],[25,30]],[[4567,6953],[5,-113],[11,-68],[-7,-74],[-83,-347]],[[4493,6351],[-157,-192],[-81,-166]],[[4046,6545],[94,-13],[181,131],[35,38],[17,28],[-3,19],[-7,20],[1,59],[46,100]],[[4410,6927],[49,68],[18,5],[90,-47]],[[7736,6465],[21,-70],[8,-17],[6,-24],[-39,-127]],[[7732,6227],[-89,-159],[-36,-83],[-12,-165]],[[7595,5820],[-53,28]],[[7542,5848],[-119,-13],[-60,69]],[[7363,5904],[86,158],[9,44],[15,57],[6,96],[0,80],[-17,51],[-23,18],[-59,14],[-31,55],[-9,37],[10,40]],[[7350,6554],[280,-30],[49,-16],[57,-43]],[[6153,3060],[-72,-60],[-15,-37],[-16,-59],[9,-84],[16,-66],[58,-90],[73,-173],[31,-187],[0,-1],[3,-17],[0,-3]],[[6240,2283],[-87,-44],[-128,-109],[-26,-49],[-17,-67]],[[5982,2014],[-2,-3],[-67,-73]],[[5913,1938],[-118,-127],[-20,-9],[-42,-6],[-48,6],[-95,-9],[-75,17]],[[5515,1810],[10,58],[22,23],[10,7],[8,11],[5,13],[6,13],[7,31],[-10,34],[-21,46],[-107,179],[-4,35],[-10,36],[-42,97],[-16,88]],[[5373,2481],[89,174]],[[5462,2655],[33,28],[15,36],[26,11],[11,24],[8,23],[10,37],[4,24],[1,24],[-1,20],[-3,26],[4,9],[6,1],[11,-1],[11,8],[20,29],[31,168]],[[5649,3122],[126,-41],[38,17],[42,27],[25,41],[35,112],[-1,33],[-5,29],[2,30],[35,106]],[[5946,3476],[95,-121],[29,-21],[35,-37],[31,-56],[15,-36],[10,-28],[-14,-44],[6,-73]],[[7178,5356],[-12,-24],[-59,-171],[-45,-197],[-1,-175],[45,-156],[63,-101]],[[7169,4532],[-1,-1],[-50,-72]],[[7118,4459],[-27,22],[-12,67],[3,25],[10,25],[-47,157],[-29,24],[-53,69],[-39,13],[-33,45]],[[6891,4906],[30,172]],[[6921,5078],[69,67],[36,100],[110,174]],[[7136,5419],[40,-60],[2,-3]],[[6571,8355],[19,-53],[-5,-68],[-11,-51],[-5,-38],[0,-31],[18,-15],[9,-39]],[[6596,8060],[-23,-69],[-18,0],[-15,3],[-49,51],[-8,6],[-61,31],[-39,6],[-15,-9],[-7,-24],[0,-59],[-8,-46],[-58,-121],[-29,-117],[-32,-68],[-20,-98]],[[6214,7546],[-18,117],[1,32],[7,18],[3,19],[-10,22],[-50,42],[-26,73],[-74,107]],[[6047,7976],[45,181],[43,64],[21,10],[52,37],[26,32],[11,110],[0,59]],[[6245,8469],[176,14],[94,-53],[56,-75]],[[3742,6167],[-91,-84],[-46,-23],[-54,-2],[-53,-32]],[[3498,6026],[-159,-19]],[[3302,6442],[68,-8],[16,21],[6,13],[11,36],[10,29],[13,12],[17,5],[15,-2],[46,-18],[212,-27]],[[8182,6921],[0,-44],[-12,-26],[-12,-22],[-99,-95]],[[8059,6734],[-25,22],[-85,-89]],[[7949,6667],[5,39],[-5,13],[-19,14],[-10,13],[-8,17],[4,18],[-1,42],[3,14],[0,19],[-4,26],[-35,109],[-91,167]],[[7788,7158],[-44,84],[-11,8],[-17,9],[-46,-11]],[[7670,7248],[42,86],[37,37],[31,83]],[[5222,7822],[-21,-128],[-5,-123],[-12,-58],[-20,-50],[-17,-19],[-67,-45]],[[5080,7399],[-71,9],[-8,12],[-53,86]],[[4948,7506],[76,115],[9,64],[-7,14],[-4,11],[-1,12],[-1,25],[-2,37],[2,85],[-5,39],[-8,22],[-26,9],[-9,14],[-15,45],[-13,47],[-11,28],[-12,19],[-9,9],[-6,12],[-6,6],[-8,-1],[-10,0],[-7,10],[-18,56],[-4,19]],[[4853,8203],[11,2],[70,66]],[[4934,8271],[2,-10],[73,-89],[54,-8],[19,-19],[15,-37],[35,-66],[50,-62],[31,-29],[15,-45],[6,-24],[-12,-60]],[[4338,1551],[11,35],[-2,24],[2,27],[-7,33],[-6,22],[-34,17],[-40,40],[-100,52],[-29,44],[-67,126]],[[4066,1971],[36,49],[20,59],[43,191],[2,62],[-9,56],[-21,18],[-18,13],[-61,17],[-64,35],[-30,8],[-16,8],[-30,25],[-40,55]],[[4198,2738],[343,-520]],[[6979,7541],[-78,-87]],[[6901,7454],[-123,13],[-293,-149]],[[6485,7318],[22,151],[81,132],[27,90],[5,43],[-3,29],[31,57]],[[6648,7820],[-5,-80],[79,-28],[41,22],[205,170]],[[6968,7904],[-32,-307],[43,-56]],[[6871,5922],[-18,-32],[-10,-22],[-19,-27],[-39,-75],[-48,-48],[-36,-26],[-56,-61],[-26,-44],[-8,-16],[-3,-32],[10,-58],[26,-102],[56,-135],[8,-39],[16,-52],[24,-35],[44,-27],[37,17],[31,5],[18,9],[43,-44]],[[6891,4906],[-58,-60],[-33,-64],[-26,-22],[-24,8],[-12,11],[-20,5],[-10,-32],[-7,-41],[32,-101],[20,-139]],[[6753,4471],[-236,-30]],[[6517,4441],[-158,61]],[[6359,4502],[28,81],[9,37],[-4,60],[12,72]],[[6404,4752],[23,-5],[13,5],[14,9],[23,41],[26,33],[6,16],[3,17],[11,6],[9,-12],[13,-25],[14,-14],[13,-2],[5,11],[4,20],[2,22],[4,20],[-6,22],[-11,23],[-30,26],[-11,17],[-28,54],[-5,21],[-15,4],[-12,-3],[-103,-114]],[[6366,4944],[-12,96],[20,59],[5,67],[-37,94]],[[6342,5260],[3,176],[7,44],[-8,41],[-7,24],[-71,46]],[[6266,5591],[14,89],[25,34],[15,29],[7,67]],[[6327,5810],[17,136],[18,16],[15,31],[12,19],[6,35],[-11,28],[-9,12],[9,76]],[[6384,6163],[63,-66],[329,-151],[19,5],[19,14],[57,-43]],[[6901,7454],[21,-98]],[[6922,7356],[6,-46],[0,-15],[29,-40],[264,-237],[5,-24],[37,-18],[45,-33],[63,-105]],[[7371,6838],[-32,-44],[6,-15],[19,-24],[0,-8],[-5,-21],[6,-36],[-10,-51],[-14,-32],[9,-53]],[[7363,5904],[-101,-3],[-140,71],[-67,1],[-34,-16],[-18,-18],[-18,-38]],[[6985,5901],[-42,28]],[[6943,5929],[17,109],[-9,106],[-23,175],[-22,75],[-27,37],[-25,4],[-68,62]],[[6786,6497],[-20,85],[-8,63],[4,63],[-2,18],[-15,17],[-45,19],[-23,-1],[-16,-4],[-11,6],[-9,14],[-9,39],[-10,29],[-34,64],[-57,40]],[[6253,7315],[76,20],[15,-14],[41,-61],[14,-4],[20,11],[10,12],[56,39]],[[8059,6734],[77,-47],[21,-24],[4,-19],[20,-77],[28,-26],[57,-27]],[[8343,6019],[-37,-16],[-105,-29],[-95,-79]],[[8106,5895],[-1,3],[-1,6],[-6,62],[1,12],[2,15],[4,11],[-3,17],[0,20],[2,18],[1,20],[-2,21],[-12,43],[-7,23],[-6,25],[-2,27],[2,23],[7,18],[4,17],[0,31],[-2,18],[-8,24],[-13,19],[-19,17],[-52,35],[-13,14],[-35,8],[-13,0],[-16,-10],[-18,-5],[-24,-14],[-14,-4],[-15,-11],[-18,-41],[-10,-39],[1,-44],[-12,-131]],[[7808,6143],[-76,84]],[[7736,6465],[52,29],[8,48],[11,39],[21,161]],[[7828,6742],[60,-90],[61,15]],[[6360,6320],[-14,-68],[4,-19],[7,-27],[6,-14],[21,-29]],[[6327,5810],[-104,81],[-15,8],[-20,3],[-12,-9],[-16,-3],[-14,12],[-31,44],[-14,62],[-55,127],[-95,91]],[[5951,6226],[61,105],[4,19],[3,30],[-2,24],[1,44],[7,23],[14,20],[5,11],[-5,33]],[[5813,6276],[94,-71]],[[5907,6205],[0,-223],[-11,-30],[-11,-48],[-4,-27],[9,-47],[-1,-9],[-5,-15],[2,-26],[10,-86],[4,-53],[-24,-264]],[[5876,5377],[-40,-69],[-87,-26],[-200,-8]],[[5549,5274],[-8,28]],[[5541,5302],[24,4],[10,5],[11,11],[11,15],[8,18],[4,24],[6,58],[0,106],[5,34],[7,20],[9,2],[9,-1],[-2,11],[-17,31],[-44,38],[-63,94]],[[5519,5772],[20,75],[-9,38],[10,40],[25,72],[10,43],[4,162]],[[3864,5376],[-142,-166]],[[3604,5410],[165,280]],[[6786,6497],[-132,-9],[-25,12],[-90,79]],[[7828,6742],[-98,255]],[[7730,6997],[17,42],[-7,51],[6,29],[42,39]],[[7512,7505],[4,-10]],[[7516,7495],[-27,-60],[-4,-20],[14,-39],[7,-41],[9,-40],[-50,-100]],[[7465,7195],[-24,34]],[[7441,7229],[-37,115],[-9,35],[14,54],[4,26],[-20,55],[7,43]],[[7400,7557],[112,-52]],[[7441,7229],[-72,-18],[-12,-8],[-22,-6],[-55,-3],[-15,5],[-22,15],[-33,41],[-75,55],[-83,0],[-49,31],[-81,15]],[[6979,7541],[142,47],[279,-31]],[[8122,7711],[20,-32],[7,-17],[4,-32],[1,-26],[-17,-103]],[[7808,6143],[117,-171],[16,-15],[26,-109],[18,-45],[0,-1]],[[7985,5802],[-5,-1],[-143,-6],[-50,-20],[-49,-35],[-11,-13]],[[7727,5727],[-2,1],[-130,92]],[[8106,5895],[-112,-93],[-9,0]],[[4948,7506],[-78,-3]],[[4870,7503],[10,84],[-12,20],[-22,28],[-32,52],[-10,44],[-2,34],[-17,22],[-18,13],[-12,33],[-19,4],[-13,6],[-11,-4],[-8,-5],[-11,-2],[-8,2],[-49,4],[-36,-9]],[[4600,7829],[25,112],[36,117],[53,116],[40,26],[45,-8],[54,11]],[[6648,7820],[7,126],[-14,58],[-20,31],[-25,25]],[[6571,8355],[15,-19],[72,-68],[95,26],[59,69],[8,29]],[[6820,8392],[20,-37],[15,-92],[-1,-52],[11,-39],[13,-28],[17,-12],[14,-15],[17,-33],[4,-65],[0,-45],[38,-70]],[[6191,7349],[-11,71]],[[6180,7420],[34,126]],[[3822,4749],[-94,59],[-61,112]],[[3667,4920],[220,106]],[[3799,6721],[3,-14],[18,-146]],[[3402,6909],[44,-30],[53,-13],[110,40],[43,-91],[36,-119],[42,-66],[55,37],[14,54]],[[5307,2897],[37,-103],[12,-17],[106,-122]],[[5373,2481],[-78,1],[-58,25],[-36,-17],[-23,-18],[-46,-93]],[[4598,2319],[-31,122],[-5,35],[7,120]],[[4569,2596],[63,3],[40,-14],[38,26],[21,56],[2,120],[-19,102],[-9,36],[0,41],[9,19],[83,24],[2,87]],[[4799,3096],[166,7],[29,-14],[32,-34],[14,-32],[6,-39],[13,-38],[25,-29],[38,-12],[67,49],[49,-30],[13,-36],[20,-12],[36,21]],[[5951,6226],[-44,-21]],[[5793,6698],[134,28]],[[5351,5571],[5,-103],[-3,-26],[-21,-99]],[[5332,5343],[-85,-14],[-58,54]],[[5096,5374],[6,97],[7,47],[112,274]],[[5221,5792],[65,-32],[38,-78],[10,-30],[17,-81]],[[4824,5671],[40,95],[0,32],[9,31],[23,11],[34,3],[23,25],[64,40],[15,23],[0,27],[14,12],[7,-2],[42,4]],[[5095,5972],[126,-180]],[[5307,2897],[2,139],[18,41],[22,40],[32,37],[32,13],[13,2],[26,12],[19,31],[16,46],[12,12],[14,1],[11,-21],[20,-24],[17,-28],[19,-19],[15,-22],[54,-35]],[[5541,5302],[-105,-21],[-104,62]],[[5351,5571],[49,30],[91,189]],[[5491,5790],[28,-18]],[[5491,5790],[-139,344]],[[5352,6134],[21,50],[5,71],[2,86],[20,102]],[[5117,473],[-47,10],[-54,78],[-73,73],[-57,-4],[-12,-147],[-61,-163],[-136,-75],[-132,43],[-50,195],[0,1],[-1,0],[-294,199],[-63,83],[-1,36],[11,122],[-6,54],[-18,38],[-2,1]],[[4121,1017],[1,0],[53,42],[137,144]],[[5095,5972],[1,132]],[[5096,6104],[45,65],[12,33],[5,38],[31,74],[27,28]],[[5216,6342],[91,-89],[45,-119]],[[4066,1971],[-37,89],[-15,29],[-32,30],[-66,5],[-72,40]],[[3844,2164],[-21,117],[0,50],[-11,51],[-41,101],[35,61]],[[5515,1810],[-58,13],[-37,-28],[-29,-46],[-58,-128],[-14,-40],[-11,-139]],[[4150,7193],[10,-38],[147,-44],[37,-39],[66,-145]],[[3799,6721],[16,60],[26,134],[47,102],[31,19],[69,9],[32,15],[33,32],[63,101],[15,5],[19,-5]],[[6404,4752],[-38,192]],[[4401,3191],[52,-115],[-3,-20],[-21,-90],[-6,-94],[18,-39],[21,-61],[34,-54],[10,-47],[63,-75]],[[4047,3132],[62,59],[15,37],[23,10],[20,-9],[21,-21],[122,-65],[26,0],[65,48]],[[3844,2164],[-65,-5],[-18,25],[-40,-26]],[[3533,2251],[45,54],[-7,27],[-12,31],[-16,11],[-57,68],[-54,96],[-14,45],[0,33],[13,44],[14,35],[21,37],[84,109],[30,19],[38,36]],[[7388,4290],[-26,-11],[-53,-95]],[[7309,4184],[-15,41],[-78,0],[-23,14],[-23,25],[-14,21],[-38,174]],[[7169,4532],[25,-41],[38,-35],[89,-56],[39,-44],[28,-66]],[[7243,8125],[104,-8],[61,-93],[69,-71],[76,-5],[32,33]],[[7582,7798],[-50,-99],[-47,-39],[-8,-24],[-2,-16],[4,-20],[9,-34],[24,-61]],[[6820,8392],[12,40],[9,66]],[[6841,8498],[52,-80],[108,-43],[63,2],[25,-16],[22,-41],[26,-26],[43,-60],[12,-50],[51,-59]],[[6180,7420],[-171,22],[-64,-7],[-49,16],[-86,97]],[[5810,7548],[-22,44]],[[5822,7675],[31,45],[4,53],[14,29],[17,23],[159,151]],[[2484,7059],[-22,-28],[-10,-16],[-26,-62],[-5,-127]],[[2062,7351],[56,15],[56,-2],[51,-23],[47,-36],[179,-232],[33,-14]],[[2484,7059],[7,-3],[293,-12]],[[894,3288],[62,89],[34,18],[17,-7],[8,9],[4,16],[3,48],[-3,25],[-11,-1],[-11,2],[-9,6],[-7,11],[-6,7],[-9,3],[-13,-2],[-16,3],[-15,13],[-29,43],[-23,19],[-20,7],[-56,29]],[[794,3626],[24,142],[-54,132],[-17,-6]],[[743,3393],[28,98],[23,135]],[[9406,8054],[19,-43],[11,-96],[-11,-51]],[[9425,7864],[-18,-53],[19,-25],[15,-8],[2,-1]],[[9443,7777],[-32,-59],[-62,-31]],[[9349,7687],[-58,26],[-34,87],[-22,-19],[-9,-12],[-12,-21],[-44,53],[-21,45]],[[9425,7864],[31,2],[20,7],[54,36],[49,49],[21,33],[25,24],[-60,150]],[[9468,8273],[60,131],[16,14],[1,1]],[[9545,8419],[13,-51],[58,-69],[113,-102],[117,-275],[107,-139],[46,-299],[-77,93],[-31,27],[-33,9],[-69,-13],[-28,4],[-26,29],[-54,86],[-28,27],[-36,5],[-41,-5],[-40,8],[-37,44],[-19,-52],[-2,3],[-22,49],[-13,-21]],[[9349,7687],[-29,-27]],[[9320,7660],[-76,48],[-57,-101],[4,-36],[1,-4]],[[9192,7567],[-83,-141],[-2,-59]],[[8610,7763],[64,-20],[77,-69],[65,-22],[36,-3],[38,16],[15,17],[10,19],[4,19],[3,43],[4,22],[4,17],[1,17],[-10,15],[-6,14],[9,41]],[[8924,7889],[44,44],[14,2],[22,-1],[8,10],[39,112]],[[8874,8207],[-34,-32],[-44,13],[4,-56],[2,-14],[19,-55],[36,-48],[9,-67],[58,-59]],[[8615,8119],[52,99],[52,4],[-22,64],[16,46]],[[9320,7660],[-19,-18],[-100,-59],[-9,-16]],[[9641,8605],[-19,-28],[-60,-43],[-29,-69],[12,-46]],[[8260,8823],[-66,-140],[-46,-64],[-66,-11],[-72,-6]],[[7742,8859],[-56,71],[-6,15]],[[7680,8945],[121,74],[89,12],[88,-26],[215,-164],[67,-18]],[[5045,3828],[-48,-62],[-39,-22]],[[4958,3744],[-69,69],[-89,203],[-19,22],[-18,8],[-7,-15],[-2,-24],[-22,-6],[-41,5],[-102,49],[-94,5],[-19,-15],[-8,-12],[-74,-11]],[[4394,4022],[-6,136],[12,39],[-9,42],[-15,41],[-20,33],[-20,40],[6,22],[0,30],[9,52]],[[4351,4457],[50,5],[172,-46],[122,92],[68,-21],[75,-107],[75,-149],[73,-103],[44,-169],[15,-131]],[[8540,9249],[7,-143],[-4,-44],[-10,-64],[18,-73],[24,-34],[27,-21],[28,-12],[26,-32],[51,-32]],[[8713,8332],[-137,142],[-79,128],[-1,0]],[[8496,8602],[-44,16],[-36,39]],[[8416,8657],[-6,160],[-36,108],[-68,64],[-36,170],[-3,122],[4,101]],[[8271,9382],[53,5],[55,-12],[7,-26],[36,-60],[20,-19],[98,-21]],[[8496,8602],[-108,-207],[-3,-80],[22,-192]],[[8260,8823],[62,-16],[35,-37],[59,-112],[0,-1]],[[9032,9173],[-43,86],[-12,34],[34,136],[-7,59],[-13,23],[-21,16],[-24,11],[-61,90],[-11,51],[-20,30],[-14,30],[-44,20]],[[8777,9949],[16,-6],[140,18]],[[8540,9249],[25,57]],[[8271,9382],[1,21],[22,215],[-3,50],[-14,15],[-3,15],[31,49],[19,16],[130,48],[11,5],[66,59]],[[3340,3105],[-36,-24],[-20,-43],[-22,-6],[-13,18],[-13,14],[-27,45]],[[3175,3761],[14,-93],[45,-88],[25,-39],[31,-31],[16,0],[19,-21],[6,-25],[-9,-90],[-6,-74],[-9,-51],[33,-144]],[[6934,2777],[0,2],[-16,44],[-70,156],[-15,54],[-16,44],[-10,51],[1,55],[17,83],[47,45],[37,20],[14,-1],[13,19],[20,15],[7,59],[25,24],[10,43],[7,72],[-2,246],[39,151]],[[7042,3959],[44,4],[83,64],[140,157]],[[7388,4290],[17,-37],[-14,-73],[-37,-85],[-24,-140],[-1,-1],[4,-144],[5,-213],[-5,-115],[-16,-87],[-22,-82],[-13,-84],[14,-88],[37,-140],[2,-99],[-32,-69],[-65,-53],[-62,-27],[-123,-7],[-119,31]],[[7042,3959],[-48,27],[-12,15],[-3,32],[-14,87]],[[6965,4120],[25,4],[14,9],[20,2],[22,12],[46,9],[7,-12],[6,-16],[-63,-169]],[[3376,4203],[45,-91],[39,-45],[8,-29],[-19,-39],[-27,-40],[-23,-50],[-2,-47],[31,-41]],[[3428,3821],[44,-180],[-1,-76],[17,-115],[9,-101],[74,-175]],[[3571,3174],[-153,-121],[-20,-3],[-58,55]],[[6266,5591],[-22,5],[-14,-9],[-20,-14],[-24,-26],[-18,-31],[0,-131],[5,-39],[-27,-33]],[[6146,5313],[-117,34],[-23,23],[-28,2],[-62,-38],[-23,3],[-11,5],[-6,35]],[[3484,5432],[-58,119],[-5,66],[-3,156],[6,82],[8,38],[8,26],[12,13],[9,25],[14,19],[23,50]],[[3241,1971],[-186,224],[-14,99]],[[3041,2294],[-76,22],[-37,39],[-58,93],[-35,99],[3,76],[63,248],[-9,62]],[[2892,2933],[72,275]],[[5080,7399],[-30,-205]],[[5050,7194],[-1,-88],[-44,-50],[-160,-114]],[[4845,6942],[-278,11]],[[4150,7193],[23,-6],[23,86],[37,67],[16,47],[19,33],[52,36],[29,-30],[81,21],[70,48],[18,23],[26,89]],[[4544,7607],[51,-15],[59,-26],[64,-78],[69,-34],[41,-6],[27,9],[15,46]],[[5903,1282],[-4,-58],[49,-25],[31,13],[14,-10],[-1,-18],[10,-35],[17,-47],[30,-43],[29,-21],[5,-8],[2,-4]],[[6085,1026],[1,-6],[19,-181],[26,-149],[45,-119],[160,-166],[-30,-41],[-57,-122],[-28,-39],[-35,-16],[-103,3],[-177,-101],[-132,-75],[-143,30],[-232,305]],[[5423,1238],[101,-52],[88,13],[26,14],[15,16],[4,15],[11,25],[16,28],[57,48],[47,-3],[57,-16],[58,-44]],[[4196,4815],[52,-39],[39,-11],[19,-26],[14,-41],[27,-9],[61,8]],[[4408,4697],[-13,-49],[-16,-18],[-103,-78]],[[4276,4552],[-64,-10],[-27,27],[-18,6],[-65,-33],[-78,-7],[-55,22],[-63,58],[-5,57]],[[5461,8498],[10,-93],[16,-61],[35,-97],[66,-72]],[[5517,7958],[-103,-136],[-6,-32],[-15,-24],[-13,-6],[-36,22],[-40,-21],[-8,-11],[-11,-10],[-7,-3],[-11,0],[-45,85]],[[4934,8271],[44,42],[46,-13],[61,-132],[118,254],[183,89],[75,-13]],[[7670,7248],[-79,125],[-20,16],[-25,14],[-10,12],[-5,14],[-15,66]],[[4767,6192],[32,-101]],[[4799,6091],[-17,-89],[-31,-64],[-14,-71],[-9,-110]],[[4493,6351],[54,34],[10,-17],[31,-27],[119,-145],[60,-4]],[[4364,3988],[-22,-111],[-50,-114],[-8,-91],[11,-3],[34,-20],[13,-16],[2,-16],[-5,-24],[7,-41],[7,-57],[43,-133],[-1,-33],[-8,-43],[0,-31],[14,-64]],[[3922,3369],[-29,138],[12,219],[-2,59],[-12,78],[10,32],[10,22],[9,11],[12,16],[8,-1],[31,35]],[[3971,3978],[46,-52],[95,4],[51,45],[19,29],[12,33],[47,40],[27,2],[17,-14],[30,-37],[49,-40]],[[5708,4643],[-111,-45],[-70,52]],[[5527,4650],[-23,68],[-6,29],[-29,43],[-23,16],[-11,23],[-20,53],[-9,16],[-10,51],[2,35],[15,57],[43,110],[57,58],[36,65]],[[5549,5274],[56,-111],[12,-41],[78,-88],[39,-74],[27,-62],[26,-90],[0,-37],[-11,-25],[-26,-27],[-11,-8],[-38,20],[-26,24],[-13,10],[-13,-2],[-9,-23],[-1,-15],[5,-19],[9,-16],[13,-16],[42,-31]],[[5527,4650],[-14,-84],[-14,-13],[-31,-13],[4,-68],[-56,-22]],[[5416,4450],[-142,-71],[-31,-7],[-46,20],[-3,37],[-15,45],[-5,51],[-6,40],[-1,28],[15,21],[13,35],[9,39],[-15,140]],[[3708,3933],[66,-123],[18,-120],[5,-80],[-15,-156],[12,-18],[10,-25],[4,-32],[-1,-39],[7,-19],[59,-40]],[[3428,3821],[92,63],[20,61],[71,40],[33,2],[64,-54]],[[3575,1080],[-13,-157],[-17,-98],[-42,-117],[-124,-140],[-59,-85],[-122,-107],[-146,-20],[-147,43],[-126,85],[-70,27],[-81,-37],[-151,-109],[-82,-23],[-8,1],[-2,0]],[[2302,1393],[39,-10],[24,22],[55,30],[77,8],[134,-14],[68,13],[35,14],[36,51],[27,24],[124,75],[100,31],[36,31],[8,26],[-8,21],[14,8],[46,3],[70,-87],[30,-54],[151,-55]],[[4958,3744],[-58,-96],[-64,-54],[-22,-61],[-10,-52],[-15,-183],[-16,-79],[8,-68],[18,-55]],[[4364,3988],[30,34]],[[7371,6838],[149,137]],[[7520,6975],[57,28],[56,-10],[39,27],[58,-23]],[[6965,4120],[-35,187],[-34,60],[-41,46],[-23,4],[-79,54]],[[6934,2777],[-83,22],[-31,-24],[-59,-74],[-31,-18],[-37,10],[-36,18],[-35,7],[-35,-26],[-15,-65],[12,-72],[5,-66],[-36,-45]],[[6553,2444],[-1,2],[-17,27],[-73,209],[-4,94],[-9,83],[-4,151],[-24,134],[-86,50]],[[6335,3194],[-33,55],[8,55],[3,117],[28,127]],[[6341,3548],[27,114],[58,129],[109,168],[17,47],[2,44],[-7,39],[-16,36],[-12,55],[-7,51],[0,60],[9,33],[2,24],[-6,93]],[[7239,8463],[59,-272],[-55,-66]],[[6841,8498],[1,13],[32,99],[48,56],[68,26],[68,2],[47,-21],[41,18],[17,18]],[[7163,8709],[2,-79],[74,-167]],[[6146,5313],[5,-47],[-5,-21],[-9,-22],[-11,-17],[-14,-10],[-6,-14],[4,-18],[12,-14],[58,5],[162,105]],[[6359,4502],[-164,-24],[-45,-28],[-34,-39],[-16,1],[-9,20],[-5,39],[-5,26],[-14,32],[-25,25],[-47,26],[-160,2],[-30,-10],[-3,-9],[2,-17],[23,-41],[9,-26],[3,-17],[-9,-39]],[[5830,4423],[-122,220]],[[5416,4450],[11,-78],[11,-34],[50,-57]],[[5488,4281],[-3,-66],[73,-185]],[[5558,4030],[-44,6],[-7,10],[-9,3],[-26,-4],[-31,-35],[-78,6],[-45,-11],[-9,-46],[-3,-57],[-15,-57],[-25,-51],[-77,-40],[-56,56],[-45,15],[-43,3]],[[4351,4457],[-34,27],[-6,27],[-35,41]],[[4408,4697],[166,106],[91,149]],[[3971,3978],[-93,130],[-76,24],[-67,-18],[-20,-22],[2,-65],[-9,-94]],[[3312,4577],[70,78],[16,10],[7,13],[-10,24],[-12,25],[-10,30],[-10,47],[-13,13],[2,15],[4,24],[14,24],[20,13],[41,-1],[45,39],[28,66]],[[3646,5012],[21,-92]],[[4845,6942],[30,-41],[4,-165]],[[4879,6736],[-66,-288],[0,-103],[-46,-153]],[[2892,2933],[-172,116],[-71,67],[-66,21],[-168,-47]],[[4121,1017],[-20,18],[-22,15],[-109,133],[-41,66],[-29,88],[-3,93],[4,128],[-7,106],[-35,31],[-38,-25]],[[4644,5114],[-75,34],[-103,22],[-134,-42],[-60,-73],[-87,-54]],[[3305,5332],[166,11]],[[5903,1282],[28,0],[8,2],[8,10],[10,5],[8,15],[14,13],[14,24],[18,23],[9,28],[10,51],[10,22],[12,13],[23,4],[14,34],[3,46],[-31,91],[-32,68],[-43,58],[-41,136],[-5,11],[-27,2]],[[5982,2014],[-3,-13],[6,-29],[24,-18],[30,-46],[32,-93],[16,-35],[29,-31],[41,-24],[13,14],[4,28],[15,19],[38,16],[12,9],[10,-13],[51,-90],[6,-11],[52,-132],[18,-61],[-66,0],[-44,-23],[-40,-33],[-93,-45],[-18,-52],[-12,-55],[-22,-29],[-39,-31],[3,-57],[22,-75],[18,-78]],[[4544,7607],[33,115],[23,107]],[[5581,6931],[36,152],[16,5],[9,-2],[6,5],[16,32],[5,73],[35,53],[76,167],[30,132]],[[5189,6620],[-4,-147],[5,-42],[26,-89]],[[5096,6104],[-14,110],[-20,41],[-19,8],[-20,-15],[-73,-94],[-151,-63]],[[4879,6736],[118,51],[33,-31],[42,-18],[28,-5],[43,16],[26,-10],[13,-16],[8,-12],[5,-16],[2,-10],[-8,-65]],[[5737,8454],[3,-25],[26,-57],[7,-28],[-1,-42]],[[5461,8498],[63,-10],[213,-34]],[[7239,8463],[84,23],[9,12],[9,8],[-3,7],[-1,16],[6,34],[21,60],[9,52],[11,22],[9,3],[14,0],[18,-10],[38,5],[45,-19],[15,-21],[7,-19],[2,-21],[2,-17],[18,-32],[14,-16],[13,-23],[11,-29],[14,-25],[31,-69]],[[2311,2018],[76,-52],[53,-22],[51,0],[71,22],[93,66],[57,5],[117,67],[48,57],[164,133]],[[7465,7195],[20,-72],[0,-23],[-4,-20],[39,-105]],[[5830,4423],[8,-54],[8,-14],[10,-14],[26,-10],[12,-7],[9,-9],[26,-33],[12,-10],[7,-15],[4,-22],[-17,-22],[-45,-7],[-242,90],[-160,-15]],[[5737,8454],[102,-17],[406,32]],[[7542,5848],[-62,-46],[-17,-17],[-25,-36],[-22,-70],[-31,-30],[-43,-121],[-1,-36],[0,-2]],[[7341,5490],[-53,6],[-68,-53],[-42,-87]],[[7136,5419],[-20,109],[-10,19],[-22,19],[-35,74],[-64,261]],[[7727,5727],[-33,-38],[-64,-165],[-61,-60],[-228,26]],[[7163,8709],[16,19],[19,61],[0,89],[10,105],[51,-47],[243,-54],[84,7],[94,56]],[[6553,2444],[-2,-3],[-311,-158]],[[6153,3060],[82,72],[33,-28],[5,-16],[8,-1],[13,11],[24,29],[17,67]],[[6341,3548],[-52,68],[-13,48],[-25,19],[-23,12],[-32,9],[-68,-8],[-20,-15],[-10,-14],[-3,-19],[-1,-25],[5,-36],[-8,-32],[-15,3],[-43,60],[-20,1],[-7,-7],[-1,-16],[-6,-21],[-54,-45],[1,-54]],[[5946,3476],[-110,90],[-73,98],[-47,90],[-22,68],[3,43],[10,29],[14,28],[4,39],[-8,12],[-15,-3],[-15,-11],[-17,-19],[-26,-14],[-19,15],[-14,36],[-53,53]],[[5472,6962],[-283,141],[-139,91]],[[6943,5929],[-72,-7]],[[5189,6620],[44,-89],[80,-62],[87,-26]]],"transform":{"scale":[0.0003150355318531835,0.00014404695679568296],"translate":[13.365261271000094,45.42363678000001]}};
  Datamap.prototype.sweTopo = '__SWE__';
  Datamap.prototype.swzTopo = '__SWZ__';
  Datamap.prototype.sxmTopo = '__SXM__';
  Datamap.prototype.sycTopo = '__SYC__';
  Datamap.prototype.syrTopo = '__SYR__';
  Datamap.prototype.tcaTopo = '__TCA__';
  Datamap.prototype.tcdTopo = '__TCD__';
  Datamap.prototype.tgoTopo = '__TGO__';
  Datamap.prototype.thaTopo = '__THA__';
  Datamap.prototype.tjkTopo = '__TJK__';
  Datamap.prototype.tkmTopo = '__TKM__';
  Datamap.prototype.tlsTopo = '__TLS__';
  Datamap.prototype.tonTopo = '__TON__';
  Datamap.prototype.ttoTopo = '__TTO__';
  Datamap.prototype.tunTopo = '__TUN__';
  Datamap.prototype.turTopo = '__TUR__';
  Datamap.prototype.tuvTopo = '__TUV__';
  Datamap.prototype.twnTopo = '__TWN__';
  Datamap.prototype.tzaTopo = '__TZA__';
  Datamap.prototype.ugaTopo = '__UGA__';
  Datamap.prototype.ukrTopo = '__UKR__';
  Datamap.prototype.umiTopo = '__UMI__';
  Datamap.prototype.uryTopo = '__URY__';
  Datamap.prototype.usaTopo = '__USA__';
  Datamap.prototype.usgTopo = '__USG__';
  Datamap.prototype.uzbTopo = '__UZB__';
  Datamap.prototype.vatTopo = '__VAT__';
  Datamap.prototype.vctTopo = '__VCT__';
  Datamap.prototype.venTopo = '__VEN__';
  Datamap.prototype.vgbTopo = '__VGB__';
  Datamap.prototype.virTopo = '__VIR__';
  Datamap.prototype.vnmTopo = '__VNM__';
  Datamap.prototype.vutTopo = '__VUT__';
  Datamap.prototype.wlfTopo = '__WLF__';
  Datamap.prototype.wsbTopo = '__WSB__';
  Datamap.prototype.wsmTopo = '__WSM__';
  Datamap.prototype.yemTopo = '__YEM__';
  Datamap.prototype.zafTopo = '__ZAF__';
  Datamap.prototype.zmbTopo = '__ZMB__';
  Datamap.prototype.zweTopo = '__ZWE__';

  /**************************************
                Utilities
  ***************************************/

  //convert lat/lng coords to X / Y coords
  Datamap.prototype.latLngToXY = function(lat, lng) {
     return this.projection([lng, lat]);
  };

  //add <g> layer to root SVG
  Datamap.prototype.addLayer = function( className, id, first ) {
    var layer;
    if ( first ) {
      layer = this.svg.insert('g', ':first-child')
    }
    else {
      layer = this.svg.append('g')
    }
    return layer.attr('id', id || '')
      .attr('class', className || '');
  };

  Datamap.prototype.updateChoropleth = function(data) {
    var svg = this.svg;
    for ( var subunit in data ) {
      if ( data.hasOwnProperty(subunit) ) {
        var color;
        var subunitData = data[subunit]
        if ( ! subunit ) {
          continue;
        }
        else if ( typeof subunitData === "string" ) {
          color = subunitData;
        }
        else if ( typeof subunitData.color === "string" ) {
          color = subunitData.color;
        }
        else {
          color = this.options.fills[ subunitData.fillKey ];
        }
        //if it's an object, overriding the previous data
        if ( subunitData === Object(subunitData) ) {
          this.options.data[subunit] = defaults(subunitData, this.options.data[subunit] || {});
          var geo = this.svg.select('.' + subunit).attr('data-info', JSON.stringify(this.options.data[subunit]));
        }
        svg
          .selectAll('.' + subunit)
          .transition()
            .style('fill', color);
      }
    }
  };

  Datamap.prototype.updatePopup = function (element, d, options) {
    var self = this;
    element.on('mousemove', null);
    element.on('mousemove', function() {
      var position = d3.mouse(self.options.element);
      d3.select(self.svg[0][0].parentNode).select('.datamaps-hoverover')
        .style('top', ( (position[1] + 30)) + "px")
        .html(function() {
          var data = JSON.parse(element.attr('data-info'));
          try {
            return options.popupTemplate(d, data);
          } catch (e) {
            return "";
          }
        })
        .style('left', ( position[0]) + "px");
    });

    d3.select(self.svg[0][0].parentNode).select('.datamaps-hoverover').style('display', 'block');
  };

  Datamap.prototype.addPlugin = function( name, pluginFn ) {
    var self = this;
    if ( typeof Datamap.prototype[name] === "undefined" ) {
      Datamap.prototype[name] = function(data, options, callback, createNewLayer) {
        var layer;
        if ( typeof createNewLayer === "undefined" ) {
          createNewLayer = false;
        }

        if ( typeof options === 'function' ) {
          callback = options;
          options = undefined;
        }

        options = defaults(options || {}, self.options[name + 'Config']);

        //add a single layer, reuse the old layer
        if ( !createNewLayer && this.options[name + 'Layer'] ) {
          layer = this.options[name + 'Layer'];
          options = options || this.options[name + 'Options'];
        }
        else {
          layer = this.addLayer(name);
          this.options[name + 'Layer'] = layer;
          this.options[name + 'Options'] = options;
        }
        pluginFn.apply(this, [layer, data, options]);
        if ( callback ) {
          callback(layer);
        }
      };
    }
  };

  // expose library
  if (typeof exports === 'object') {
    d3 = require('d3');
    topojson = require('topojson');
    module.exports = Datamap;
  }
  else if ( typeof define === "function" && define.amd ) {
    define( "datamaps", ["require", "d3", "topojson"], function(require) {
      d3 = require('d3');
      topojson = require('topojson');

      return Datamap;
    });
  }
  else {
    window.Datamap = window.Datamaps = Datamap;
  }

  if ( window.jQuery ) {
    window.jQuery.fn.datamaps = function(options, callback) {
      options = options || {};
      options.element = this[0];
      var datamap = new Datamap(options);
      if ( typeof callback === "function" ) {
        callback(datamap, options);
      }
      return this;
    };
  }
})();
