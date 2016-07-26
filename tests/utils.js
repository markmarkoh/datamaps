function addMain() {
  d3.select('body').append('div')
    .style('position', 'relative')
    .style('height', '500px')
    .style('width', '500px')
    .attr('id', 'main')
}

function removeMain() {
  d3.select('#main').remove()
}
