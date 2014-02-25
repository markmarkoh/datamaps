var assert = require("../assert");

module.exports = {
  topic: function(d3) {
    var s = d3.select("body").append("div").selectAll("div")
        .data(["one", "two", "three", "four"])
      .enter().append("div")
        .attr("class", String);

    s.filter(function(d, i) { return i > 0; }).append("span");
    s[0][3] = null;

    return s.transition()
        .delay(function(d, i) { return i * 13; })
        .duration(function(d, i) { return i * 21; });
  },

  "selects the first matching element": function(transition) {
    var t = transition.select("span");
    assert.domEqual(t[0][1].parentNode, transition[0][1]);
    assert.domEqual(t[0][2].parentNode, transition[0][2]);
  },
  "ignores null elements": function(transition) {
    var t = transition.select("span");
    assert.isNull(t[0][3]);
  },
  "propagates data to the selected elements": function(transition) {
    var t = transition.select("span");
    assert.equal(t[0][1].__data__, "two");
    assert.equal(t[0][2].__data__, "three");
  },
  "propagates delay to the selected elements": function(transition) {
    var t = transition.select("span");
    assert.equal(t[0][1].__transition__[t.id].delay, 13);
    assert.equal(t[0][2].__transition__[t.id].delay, 26);
  },
  "propagates duration to the selected elements": function(transition) {
    var t = transition.select("span");
    assert.equal(t[0][1].__transition__[t.id].duration, 21);
    assert.equal(t[0][2].__transition__[t.id].duration, 42);
  },
  "does not propagate data if no data was specified": function(transition) {
    delete transition[0][1].__data__;
    delete transition[0][1].firstChild.__data__;
    var t = transition.select("span");
    assert.isUndefined(t[0][1].__data__);
    assert.equal(t[0][2].__data__, "three");
  },
  "returns null if no match is found": function(transition) {
    var t = transition.select("span");
    assert.isNull(t[0][0]);
  },
  "inherits transition id": function(transition) {
    var id = transition.id,
        t0 = transition.select("span"),
        t1 = transition.select("span");
    assert.equal(t0.id, id);
    assert.equal(t1.id, id);
  }
};
