describe('Basic functionality', function() {
  beforeEach(addMain)
  afterEach(removeMain)

  it('Should render a world map', function() {
    expect(d3.select('svg').empty()).toBe(true)
    new Datamap({
      element: document.getElementById('main')
    })
    expect(d3.select('svg').size()).toBe(1)
    expect(d3.select('.datamaps-subunits').size()).toBe(1)
    expect(d3.selectAll('.datamaps-subunits path').size()).toBe(177)
    expect(d3.select('.datamaps-subunit.USA').size()).toBe(1)
    expect(d3.select('#main .datamaps-hoverover').size()).toBe(1)
  })
  it('Should render a USA map', function() {
    let map = new Datamap({
      element: document.getElementById('main'),
      scope: 'usa'
    })
    expect(map.options.scope).toBe('usa')
    expect(d3.select('.datamaps-subunit.TX').size()).toBe(1)
    expect(d3.selectAll('.datamaps-subunits path').size()).toBe(51)
  })
  it('Should return a Datamaps object', function() {
    expect(d3.select('#main svg').empty()).toBe(true)
    let map = new Datamap({
      element: document.getElementById('main')
    })
    expect(map).not.toBeNull()
    expect(map instanceof Datamap).toBe(true)
    expect(map.svg.node()).toBe(d3.select('#main svg').node())
    expect(map.options).not.toBeNull()
    expect(map.options.scope).toBe('world')
    expect(map.options.geographyConfig.borderWidth).toBe(1)
  })
  it('Should respect basic geography config overrides', function() {
    let map = new Datamap({
      element: document.getElementById('main'),
      geographyConfig: {
        borderWidth: 2
      }
    })
    expect(map.options.geographyConfig.borderWidth).toBe(2)
  })
  it('Should not render popover div when popover is disabled', function() {
    new Datamap({
      element: document.getElementById('main'),
      geographyConfig: {
        popupOnHover: false
      },
      bubblesConfig: {
        popupOnHover: false
      }
    })
    expect(d3.select('#main .datamaps-hoverover').size()).toBe(0)
  })
})
