(function() {
  var
    D = {
      projection: 'equirectangular',
      scope: 'world',
      geographyConfig: {},
      fills: { defaultFill: '#ABDDA4'},
      data: {}
    },
    $map = $('#map'),
    $proj = $('#projections'),
    $geoset = $('#geographyset'),
    maps;

    window.cool = D;

  var colorSets = {
    qualitative: formatColor('0x8DD3C7; 0xFFFFB3; 0xBEBADA; 0xFB8072; 0x80B1D3; 0xFDB462; 0xB3DE69; 0xFCCDE5; 0xD9D9D9; 0xBC80BD; 0xCCEBC5; 0xFFED6F;'),
    spectral: formatColor('0xD53E4F; 0xF46D43; 0xFDAE61; 0xFEE08B; 0xFFFFBF; 0xE6F598; 0xABDDA4; 0x66C2A5; 0x3288BD;'),
    qualitativePastel: formatColor('0xFBB4AE; 0xB3CDE3; 0xCCEBC5; 0xDECBE4; 0xFED9A6; 0xFFFFCC; 0xE5D8BD; 0xFDDAEC; 0xF2F2F2;'),
    sequentialPurpleBlue: formatColor('0xF7FCFD; 0xE0ECF4; 0xBFD3E6; 0x9EBCDA; 0x8C96C6; 0x8C6BB1; 0x88419D; 0x810F7C; 0x4D004B;'),
    sequentialOrange: formatColor('0xFFF7EC; 0xFEE8C8; 0xFDD49E; 0xFDBB84; 0xFC8D59; 0xEF6548; 0xD7301F; 0xB30000; 0x7F0000;'),
    sequentialPurple: formatColor('0xFCFBFD; 0xEFEDF5; 0xDADAEB; 0xBCBDDC; 0x9E9AC8; 0x807DBA; 0x6A51A3; 0x54278F; 0x3F007D;'),
    RdYiBu: formatColor('0xD73027; 0xF46D43; 0xFDAE61; 0xFEE090; 0xFFFFBF; 0xE0F3F8; 0xABD9E9; 0x74ADD1; 0x4575B4;'),
    PuOr: formatColor('0xB35806; 0xE08214; 0xFDB863; 0xFEE0B6; 0xF7F7F7; 0xD8DAEB; 0xB2ABD2; 0x8073AC; 0x542788;'),
    BrBG: formatColor('0x8C510A; 0xBF812D; 0xDFC27D; 0xF6E8C3; 0xF5F5F5; 0xC7EAE5; 0x80CDC1; 0x35978F; 0x01665E;')
  };

  function formatColor( color ) {
    return color.split('; ').map(function(c) { return c.replace('0x', '#'); });
  }

  var $dl = $("<datalist>", {id: "colors"});
  $dl.appendTo('body');

  function setColorList ( setName ) {
    $dl.html("");
    colorSets[setName].forEach(function(color) {
      $("<option/>", {value: color}).appendTo( $dl );
    });
  }

  setColorList( 'qualitative' );

  var $colorSets = $("#colorSets");
  _.each(colorSets, function(set, key) {
    $("<option/>", {value: key}).text(key).appendTo( $colorSets );
  });

  $colorSets.on("change", function() {
    setColorList( this.value );
  });

  function draw( options ) {
    $map.html('');
    $map.attr('class', '').addClass(options.projection)

    options['element'] = $map[0];
    map = new Datamap( options );

    setCode( options );
  }

  function setCode ( options ) {
    var code = _.clone(options);
    code.element = '__GETTER__';
    var prefix = 'var map = new Datamap({';
    var suffix = '});'
    var code = js_beautify(prefix + JSON.stringify(code) + suffix, {indent_size: 2});
    code = code.replace("\"__GETTER__\"", 'document.getElementById("map")')
    $("#getcode").val( code );
  }



  /* Handle Changing of Projection (mecator, equirectangular) */
  $proj.on('change', function(evt) {
    D['projection'] = this.value;
    draw( D );
  });

  /* Handle Changing of Geographical Data Set (USA, World, Custom) */
  $geoset.on('change', function() {
    var proj;
    if ( this.value === 'usa' ) {
      proj = 'albersUSA';
      $proj.val('albersUSA')
      $proj.prop('disabled', true);
    }
    else {
      if ( $proj.val() === 'albersUSA' ) {
        $proj.val('equirectangular');
      }
      proj = $proj.val();
      $proj.prop('disabled', false);
    }

    D.projection = proj;
    D.scope = this.value;
    draw( D );
  });

  $('input[type="checkbox"]').on('change', function(e) {

    var $this = $(this);

    if ( $this.data() && $this.data().option ) {
      D[ $this.data().option ][ this.id ] = this.checked;
    }
    else {
      D [ this.id ] = this.checked;
    }

    draw( D );
  });

  $('.regular').on('change', function() {
    var $this = $(this);

    if ( $this.data() && $this.data().option ) {
      console.log( $this.data(), this.value );
      D[ $this.data().option ][ this.id ] = this.value;
    };

    draw( D );

  });

  $('#currentColor').on('change', function() {
    console.dir(this);
    var selected = d3.selectAll('path.selected');
    var ids = _.map(selected[0], function(d) { return d3.select(d).attr('data-geography') });

    var uid = _.uniqueId('fill_');
    D.fills[uid] = this.value;

    _.each(ids, function(id) {
      D.data[id] = {fillKey: uid}
    });

    draw ( D );
  });

  var isSelecting = false, _highlightOnHover;
  $('.add-colors').on('click', function() {
    if ( isSelecting ) {
      isSelecting = false; 
      D.geographyConfig.highlightOnHover = _highlightOnHover;
      draw( D );
    }
    else {
      _highlightOnHover = D.geographyConfig.highlightOnHover;
      D.geographyConfig.highlightOnHover = false;
      isSelecting = true;
      draw( D );
    }
    $('.command-help').toggleClass('hide');
    $('body').toggleClass('adding-colors');
  });


  var isTargetingBubble = false;
  $('.add-bubble').on('click', function() {
      if ( isTargetingBubble ) {
        isTargetingBubble = false;
        D.geographyConfig.highlightOnHover = _highlightOnHover;
        draw( D );
      }
      else {
        _highlightOnHover = D.geographyConfig.highlightOnHover;
        isTargetingBubble = true;
        D.geographyConfig.highlightOnHover = false;
        draw( D );
      }
    $('body').toggleClass('adding-bubbles');
  });

  var bubbles = [];
  $("#map").on('click', function(e) {
    if ( !isTargetingBubble ) return;
    var lngLat = map.XYtoLngLat( e.offsetX, e.offsetY );
    var bubble = {
      longitude: lngLat[0],
      latitude: lngLat[1],
      radius: 50
    };

    bubbles.push(bubble)

    map.bubbles(bubbles)
  });

  $('#map').on('click', '.datamaps-subunit', function(e) {
    if ( !isSelecting ) return;
    var selected = d3.selectAll('path.selected');
    if ( e.metaKey ) {
      ;
    }
    else {
      selected.classed('selected', false);
    }

    $('#currentColor').prop('disabled', false);
    d3.select(e.target).classed('selected', true);
  });

  draw( D );
})();