define([
  'backbone',
  'underscore',
  'jquery',
  'd3',
  './injector'
], function(Backbone, _, $, d3) {
  var Map = Backbone.View.extend({

    initialize: function(options) {
      this._map = new Backbone.Model();

      var worldCountries = this.options.pathData;

      var featureCollection = {"type":"FeatureCollection","features":[]};

      if ( _.isUndefined( d3.geo[this.options.projection] ) ) {
        this.options.projection = 'albersUsa'; //change this default
      }

      if ( this.options.scope === 'world' ) {
        this._map.set('pathData', _.reject(worldCountries.features, function(val) {
          return val.properties.continent === "USA";
        }));
      }
      else if (this.options.scope === 'usa' ) {
        this._map.set('pathData', _.reject(worldCountries.features, function(val) {
          return val.properties.continent !== "USA";
        }));

        this.options.projection = 'albersUsa'; //override them
      }

      //set defaults(for complex/nested objects, which backbone doesn't handle too well)
      this.options.geography_config = _.defaults(this.options.geography_config || {}, this.options._geography_config);
      this.options.bubble_config = _.defaults(this.options.bubble_config || {}, this.options._bubble_config);

      this._map.set('projection', d3.geo[this.options.projection]());
      this._map.set('path', d3.geo.path().projection( this._map.get('projection')) );

      this._map.get('projection').scale(10000);
    },

    mouseoverPath: function(e) {
      /* since the paths clip eachother a bit,
       * remove the element from it's parent and reinsert it at the end.
       * This will prevent the border being clipped on highlight.
       */
      var self = this;
      var el = d3.select(e.currentTarget);
      var parentEl = el[0][0].parentElement;

      el.style('stroke-width', self.options.geography_config.highlightBorderWidth)
          .style('stroke', self.options.geography_config.highlightBorderColor);

      el.selectAll('.label').style('display', 'block');

      el.remove();

      if (self.options.geography_config.highlightFillColor) {
        el.style('fill', self.options.geography_config.highlightFillColor);
      }


      parentEl.appendChild( el[0][0] );
    },

    mouseoutPath: function(e) {
      var self = this;
      d3.select(e.currentTarget)
        .style('stroke-width', this.options.geography_config.borderWidth)
        .style('stroke', this.options.geography_config.borderColor)
        .style('fill', function() {
          return d3.select(this).attr('data-fill');
        });

      this.$el.find('.hoverover').hide();
    },

    addBubbles: function(bubbles) {
      var self = this;
      if (_.isUndefined(bubbles.length)) {
        bubbles = [];
      }

      var projection = this._map.get('projection');
      var options = this.options.bubble_config;

      var bubbleContainer = this.svg.append('g').attr('class', 'bubbles');

        bubbleContainer.selectAll('circle.bubble')
          .data(bubbles)
          .enter()
            .append('svg:circle')
              .on('mouseover', function(datum) {
                var hoverover = self.$el.find('.hoverover');
                var eventData = {
                    data: datum
                };

                hoverover.css({position:'absolute'})
                  .html(options.popupTemplate( eventData )).show();

                //set width data so we can grab it to do the offset quickly
                hoverover.data('width', self.$el.find('.hoverover').width());

                if (options.highlightOnHover) {
                  d3.select(this)
                    .style('fill', options.highlightFillColor)
                    .style('stroke', options.highlightBorderColor)
                    .style('stroke-width', options.highlightBorderWidth)
                    .style('fill-opacity', options.highlightFillOpacity);
                }
                self.$el.trigger($.Event("bubble-mouseover"), eventData);
              })
              .on('mousemove', function() {
                self.updateHoverOverPosition(this);
              })
              .on('mouseout', function(datum) {
                self.$el.find('.hoverover').hide();
                var eventData = {
                    data: datum
                };

                self.$el.trigger($.Event("bubble-mouseout"), eventData);

                if (options.highlightOnHover) {
                  var el = d3.select(this);
                    el.style('fill', el.attr('data-fill'))
                      .style('stroke', options.borderColor)
                      .style('stroke-width', options.borderWidth)
                      .style('fill-opacity', options.fillOpacity);
                }
              })
              .on('touchstart', function(datum) {
                self.$el.trigger($.Event("bubble-touchstart"), {data: datum});
              })
              .on('click', function(datum) {
                self.$el.trigger($.Event("bubble-click"), {data: datum});
              })
              .attr('cx', function(datum) {
                return projection([datum.longitude, datum.latitude])[0];
              })
              .attr('cy', function(datum, index) {
                return projection([datum.longitude, datum.latitude])[1];
              })
              .style('fill', function(datum) {
                var fillColor = self.getFillColor(datum);
                d3.select(this).attr('data-fill', fillColor);
                return fillColor;
              })
              .style('stroke', function(datum) {
                return options.borderColor; //self.getFillColor(datum);
              })
              .attr('class', 'bubble')
              .style('stroke-width', options.borderWidth)
              .attr('fill-opacity', options.fillOpacity)
              .attr('r', 0)
              .transition()
                .duration(400)
                .attr('r', function(datum) {
                  return datum.radius;
                });
    },

    updateHoverOverPosition: function(d3event) {
      var position = d3.mouse(d3event);
      var hoverover = this.$el.find('.hoverover');

      hoverover.css({
        width: 'auto',
        top: position[1] + 20,
        left: position[0] - hoverover.data('width') / 2
      });
    },

    getFillColor: function(fillKey) {
      var fillColor;
      if ( fillKey && fillKey.fillKey && this.options.fills[fillKey.fillKey] ) {
        fillColor = this.options.fills[ fillKey.fillKey ];
      }
      else {
        fillColor = this.options.fills.defaultFill;
      }

      return fillColor;
    },

    render: function() {
      var self = this;
      var width, height;
      
      width = this.$el.width();
      height = this.$el.height();

      //add inner wrapper div so we can position:relative it
      var div =  $('<div/>').css({position:'relative'});
      this.$el.append( div );
      this.setElement(div);

      var projection = this.projection = this._map.get('projection')
                        .scale(width)
                        .translate([width / 2, height / 2]);


      var path = this.path = this._map.get('path');

      var svg = this.svg = d3.select( this.el ).append('svg:svg')
                    .attr('width', width)
                    .attr('height', height);

      var states = svg.append('svg:g')
                        .attr('id', 'states');

      var node = states.selectAll('path')
              .data( this._map.get('pathData') )
            .enter();

      var feature = node.append('path')
            .attr('d', path)
            .attr('data-type', 'country')
            .style('stroke', self.options.geography_config.borderColor)
            .style('stroke-width', self.options.geography_config.borderWidth)
            .style('fill', function(datum) {
              var fillColor = self.getFillColor(self.options.data[datum.id]);
              d3.select(this).attr('data-fill', fillColor);
              return fillColor;
            });

      if (this.options.geography_config.popupOnHover || this.options.bubble_config.popupOnHover) {
        $('<div class="hoverover" style="z-index: 1001;"/>').appendTo(this.$el);
      }

      if (this.options.geography_config.popupOnHover) {
        feature.on('mouseover', function(d) {
          var hoverover = self.$el.find('.hoverover');
          var eventData = {
              geography: d,
              data: self.options.data[d.id] || {}
          };
          hoverover.css({position:'absolute'})
            .html(self.options.geography_config.popupTemplate( eventData )).show();

          //set width data so we can grab it to do the offset quickly
          hoverover.data('width', self.$el.find('.hoverover').width());

          self.$el.trigger($.Event("map-mouseover"), eventData);
        });

        feature.on('touchstart', function(d) {
          var hoverover = self.$el.find('.hoverover');
          var eventData = {
              geography: d,
              data: self.options.data[d.id] || {}
          };
          hoverover.css({position:'absolute'})
            .html(self.options.geography_config.popupTemplate( eventData )).show();

          //set width data so we can grab it to do the offset quickly
          hoverover.data('width', self.$el.find('.hoverover').width());

          self.$el.trigger($.Event("map-touchstart"), eventData);
  

        });

        feature.on('mousemove', function(d) {
          self.updateHoverOverPosition(this);
        });

        feature.on('mouseout', function(d) {
          self.$el.find('.hoverover').hide();
          var eventData = {
              geography: d,
              data: self.options.data[d.id] || {}
          };
          self.$el.trigger($.Event("map-mouseout"), eventData);
        });

        feature.on('click', function(d) {
          var eventData = {
              geography: d,
              data: self.options.data[d.id] || {}
          };
          self.$el.trigger($.Event("map-click"), eventData);
        });
      }

      if (this.options.geography_config.highlightOnHover) {
        self.$el.on('mouseover', '[data-type="country"]', _.bind(this.mouseoverPath, this));
        self.$el.on('mouseout', '[data-type="country"]', _.bind(this.mouseoutPath, this));
      }

      if (this.options.bubbles.length) {
        //TODO: set listener for new bubbles
        //first make it bb collection
        //this.options.bubbles.on('add', this.addbubbles, this);
        this.addBubbles(this.options.bubbles);
      }
    }
  });

  return Map;
});