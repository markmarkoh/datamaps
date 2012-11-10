define([
  'backbone',
  '$',
  'd3'
], function(Backbone, $, d3) {
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

      el.style('stroke-width', self.options.highlightBorderWidth)
          .style('stroke', self.options.highlightBorderColor);

      el.selectAll('.label').style('display', 'block');

      el.remove();

      if (self.options.highlightFillColor) {
        el.style('fill', self.options.highlightFillColor);
      }


      parentEl.appendChild( el[0][0] );
    },

    mouseoutPath: function(e) {
      var self = this;
      d3.select(e.currentTarget)
        .style('stroke-width', this.options.borderWidth)
        .style('stroke', this.options.borderColor)
        .style('fill', function() {
          return d3.select(this).attr('data-fill');
        });

      this.$el.find('.hoverover').hide();
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
            .style('stroke', self.options.borderColor)
            .style('stroke-width', self.options.borderWidth)
            .style('fill', function(d) {

              var fillColor, fillKey = self.options.data[d.id];
              if ( fillKey && fillKey.fillKey && self.options.fills[fillKey.fillKey] ) {
                fillColor = self.options.fills[ fillKey.fillKey ];
              }
              else {
                fillColor = self.options.fills.defaultFill;
              }
              d3.select(this).attr('data-fill', fillColor);

              return fillColor;
            });

      if (this.options.showPopupOnHover) {
        $('<div class="hoverover" style="z-index: 1001;"/>').appendTo(this.$el);
        feature.on('mouseover', function(d) {
          var hoverover = self.$el.find('.hoverover');
          var eventData = {
              geography: d,
              data: self.options.data[d.id] || {}
          };
          hoverover.css({position:'absolute'})
            .html(self.options.popupTemplate( eventData )).show();

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
            .html(self.options.popupTemplate( eventData )).show();

          //set width data so we can grab it to do the offset quickly
          hoverover.data('width', self.$el.find('.hoverover').width());

          self.$el.trigger($.Event("map-touchstart"), eventData);
  

        });

        feature.on('mousemove', function(d) {
          var position = d3.mouse(this);
          var hoverover = self.$el.find('.hoverover');

          hoverover.css({
            top: position[1] + 20,
            left: position[0] - hoverover.data('width') / 2
          });
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

      if (this.options.highlightOnHover) {
        self.$el.on('mouseover', '[data-type="country"]', _.bind(this.mouseoverPath, this));
        self.$el.on('mouseout', '[data-type="country"]', _.bind(this.mouseoutPath, this));
      }
    }
  });

  return Map;
});