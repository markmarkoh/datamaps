var vows = require("vows"),
    load = require("../load"),
    assert = require("../assert"),
    time = require("./time"),
    local = time.local,
    utc = time.utc;

var suite = vows.describe("d3.time.month");

suite.addBatch({
  "month": {
    topic: load("time/month").expression("d3.time.month"),
    "defaults to floor": function(interval) {
      assert.strictEqual(interval, interval.floor);
    },
    "floor": {
      topic: function(interval) {
        return interval.floor;
      },
      "returns months": function(floor) {
        assert.deepEqual(floor(local(2010, 11, 31, 23, 59, 59)), local(2010, 11, 01));
        assert.deepEqual(floor(local(2011, 00, 01, 00, 00, 00)), local(2011, 00, 01));
        assert.deepEqual(floor(local(2011, 00, 01, 00, 00, 01)), local(2011, 00, 01));
      },
      "observes the start of daylight savings time": function(floor) {
        assert.deepEqual(floor(local(2011, 02, 13, 01)), local(2011, 02, 01));
      },
      "observes the end of the daylight savings time": function(floor) {
        assert.deepEqual(floor(local(2011, 10, 06, 01)), local(2011, 10, 01));
      },
      "correctly handles years in the first century": function(floor) {
        assert.deepEqual(floor(local(0011, 10, 06, 07)), local(0011, 10, 01));
      }
    },
    "ceil": {
      topic: function(interval) {
        return interval.ceil;
      },
      "returns months": function(ceil) {
        assert.deepEqual(ceil(local(2010, 11, 31, 23, 59, 59)), local(2011, 00, 01));
        assert.deepEqual(ceil(local(2011, 00, 01, 00, 00, 00)), local(2011, 00, 01));
        assert.deepEqual(ceil(local(2011, 00, 01, 00, 00, 01)), local(2011, 01, 01));
      },
      "observes the start of daylight savings time": function(ceil) {
        assert.deepEqual(ceil(local(2011, 02, 13, 01)), local(2011, 03, 01));
      },
      "observes the end of the daylight savings time": function(ceil) {
        assert.deepEqual(ceil(local(2011, 10, 06, 01)), local(2011, 11, 01));
      }
    },
    "offset": {
      topic: function(interval) {
        return interval.offset;
      },
      "does not modify the passed-in date": function(offset) {
        var date = local(2010, 11, 31, 23, 59, 59, 999);
        offset(date, +1);
        assert.deepEqual(date, local(2010, 11, 31, 23, 59, 59, 999));
      },
      "does not round the passed-in-date": function(offset) {
        assert.deepEqual(offset(local(2010, 11, 31, 23, 59, 59, 999), +1), local(2011, 00, 31, 23, 59, 59, 999));
        assert.deepEqual(offset(local(2010, 11, 31, 23, 59, 59, 456), -2), local(2010, 09, 31, 23, 59, 59, 456));
      },
      "allows negative offsets": function(offset) {
        assert.deepEqual(offset(local(2010, 11, 01), -1), local(2010, 10, 01));
        assert.deepEqual(offset(local(2011, 00, 01), -2), local(2010, 10, 01));
        assert.deepEqual(offset(local(2011, 00, 01), -1), local(2010, 11, 01));
      },
      "allows positive offsets": function(offset) {
        assert.deepEqual(offset(local(2010, 10, 01), +1), local(2010, 11, 01));
        assert.deepEqual(offset(local(2010, 10, 01), +2), local(2011, 00, 01));
        assert.deepEqual(offset(local(2010, 11, 01), +1), local(2011, 00, 01));
      },
      "allows zero offset": function(offset) {
        assert.deepEqual(offset(local(2010, 11, 31, 23, 59, 59, 999), 0), local(2010, 11, 31, 23, 59, 59, 999));
        assert.deepEqual(offset(local(2010, 11, 31, 23, 59, 58, 000), 0), local(2010, 11, 31, 23, 59, 58, 000));
      }
    },
    "UTC": {
      topic: function(interval) {
        return interval.utc;
      },
      "defaults to floor": function(interval) {
        assert.strictEqual(interval, interval.floor);
      },
      "floor": {
        topic: function(interval) {
          return interval.floor;
        },
        "returns months": function(floor) {
          assert.deepEqual(floor(utc(2010, 11, 31, 23, 59, 59)), utc(2010, 11, 01));
          assert.deepEqual(floor(utc(2011, 00, 01, 00, 00, 00)), utc(2011, 00, 01));
          assert.deepEqual(floor(utc(2011, 00, 01, 00, 00, 01)), utc(2011, 00, 01));
        },
        "does not observe the start of daylight savings time": function(floor) {
          assert.deepEqual(floor(utc(2011, 02, 13, 01)), utc(2011, 02, 01));
        },
        "does not observe the end of the daylight savings time": function(floor) {
          assert.deepEqual(floor(utc(2011, 10, 06, 01)), utc(2011, 10, 01));
        }
      },
      "ceil": {
        topic: function(interval) {
          return interval.ceil;
        },
        "returns months": function(ceil) {
          assert.deepEqual(ceil(utc(2010, 11, 31, 23, 59, 59)), utc(2011, 00, 01));
          assert.deepEqual(ceil(utc(2011, 00, 01, 00, 00, 00)), utc(2011, 00, 01));
          assert.deepEqual(ceil(utc(2011, 00, 01, 00, 00, 01)), utc(2011, 01, 01));
        },
        "does not observe the start of daylight savings time": function(ceil) {
          assert.deepEqual(ceil(utc(2011, 02, 13, 01)), utc(2011, 03, 01));
        },
        "does not observe the end of the daylight savings time": function(ceil) {
          assert.deepEqual(ceil(utc(2011, 10, 06, 01)), utc(2011, 11, 01));
        }
      },
      "offset": {
        topic: function(interval) {
          return interval.offset;
        },
        "does not modify the passed-in date": function(offset) {
          var date = utc(2010, 11, 31, 23, 59, 59, 999);
          offset(date, +1);
          assert.deepEqual(date, utc(2010, 11, 31, 23, 59, 59, 999));
        },
        "does not round the passed-in-date": function(offset) {
          assert.deepEqual(offset(utc(2010, 11, 31, 23, 59, 59, 999), +1), utc(2011, 00, 31, 23, 59, 59, 999));
          assert.deepEqual(offset(utc(2010, 11, 31, 23, 59, 59, 456), -2), utc(2010, 09, 31, 23, 59, 59, 456));
        },
        "allows negative offsets": function(offset) {
          assert.deepEqual(offset(utc(2010, 11, 01), -1), utc(2010, 10, 01));
          assert.deepEqual(offset(utc(2011, 00, 01), -2), utc(2010, 10, 01));
          assert.deepEqual(offset(utc(2011, 00, 01), -1), utc(2010, 11, 01));
        },
        "allows positive offsets": function(offset) {
          assert.deepEqual(offset(utc(2010, 10, 01), +1), utc(2010, 11, 01));
          assert.deepEqual(offset(utc(2010, 10, 01), +2), utc(2011, 00, 01));
          assert.deepEqual(offset(utc(2010, 11, 01), +1), utc(2011, 00, 01));
        },
        "allows zero offset": function(offset) {
          assert.deepEqual(offset(utc(2010, 11, 31, 23, 59, 59, 999), 0), utc(2010, 11, 31, 23, 59, 59, 999));
          assert.deepEqual(offset(utc(2010, 11, 31, 23, 59, 58, 000), 0), utc(2010, 11, 31, 23, 59, 58, 000));
        }
      }
    }
  }
});

suite.export(module);
