var vows = require("vows"),
    load = require("../load"),
    assert = require("../assert"),
    time = require("./time"),
    local = time.local,
    utc = time.utc;

var suite = vows.describe("d3.time.day");

suite.addBatch({
  "day": {
    topic: load("time/day").expression("d3.time.day"),
    "defaults to floor": function(interval) {
      assert.strictEqual(interval, interval.floor);
    },
    "floor": {
      topic: function(interval) {
        return interval.floor;
      },
      "returns midnights": function(floor) {
        assert.deepEqual(floor(local(2010, 11, 31, 23)), local(2010, 11, 31));
        assert.deepEqual(floor(local(2011, 00, 01, 00)), local(2011, 00, 01));
        assert.deepEqual(floor(local(2011, 00, 01, 01)), local(2011, 00, 01));
      },
      "observes start of daylight savings time": function(floor) {
        assert.deepEqual(floor(utc(2011, 02, 13, 07)), local(2011, 02, 12));
        assert.deepEqual(floor(utc(2011, 02, 13, 08)), local(2011, 02, 13));
        assert.deepEqual(floor(utc(2011, 02, 13, 09)), local(2011, 02, 13));
        assert.deepEqual(floor(utc(2011, 02, 13, 10)), local(2011, 02, 13));
      },
      "observes end of daylight savings time": function(floor) {
        assert.deepEqual(floor(utc(2011, 10, 06, 07)), local(2011, 10, 06));
        assert.deepEqual(floor(utc(2011, 10, 06, 08)), local(2011, 10, 06));
        assert.deepEqual(floor(utc(2011, 10, 06, 09)), local(2011, 10, 06));
        assert.deepEqual(floor(utc(2011, 10, 06, 10)), local(2011, 10, 06));
      },
      "correctly handles years in the first century": function(floor) {
        assert.deepEqual(floor(local(0011, 10, 06, 07)), local(0011, 10, 06));
      }
    },
    "ceil": {
      topic: function(interval) {
        return interval.ceil;
      },
      "returns midnights": function(ceil) {
        assert.deepEqual(ceil(local(2010, 11, 30, 23)), local(2010, 11, 31));
        assert.deepEqual(ceil(local(2010, 11, 31, 00)), local(2010, 11, 31));
        assert.deepEqual(ceil(local(2010, 11, 31, 01)), local(2011, 00, 01));
      },
      "observes start of daylight savings time": function(ceil) {
        assert.deepEqual(ceil(utc(2011, 02, 13, 07)), local(2011, 02, 13));
        assert.deepEqual(ceil(utc(2011, 02, 13, 08)), local(2011, 02, 13));
        assert.deepEqual(ceil(utc(2011, 02, 13, 09)), local(2011, 02, 14));
        assert.deepEqual(ceil(utc(2011, 02, 13, 10)), local(2011, 02, 14));
      },
      "observes end of daylight savings time": function(ceil) {
        assert.deepEqual(ceil(utc(2011, 10, 06, 07)), local(2011, 10, 06));
        assert.deepEqual(ceil(utc(2011, 10, 06, 08)), local(2011, 10, 07));
        assert.deepEqual(ceil(utc(2011, 10, 06, 09)), local(2011, 10, 07));
        assert.deepEqual(ceil(utc(2011, 10, 06, 10)), local(2011, 10, 07));
      },
      "handles midnight for leap years": function(ceil) {
        assert.deepEqual(ceil(utc(2012, 02, 01, 00)), local(2012, 02, 01));
        assert.deepEqual(ceil(utc(2012, 02, 01, 00)), local(2012, 02, 01));
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
        assert.deepEqual(offset(local(2010, 11, 31, 23, 59, 59, 999), +1), local(2011, 00, 01, 23, 59, 59, 999));
        assert.deepEqual(offset(local(2010, 11, 31, 23, 59, 59, 456), -2), local(2010, 11, 29, 23, 59, 59, 456));
      },
      "allows negative offsets": function(offset) {
        assert.deepEqual(offset(local(2010, 11, 31), -1), local(2010, 11, 30));
        assert.deepEqual(offset(local(2011, 00, 01), -2), local(2010, 11, 30));
        assert.deepEqual(offset(local(2011, 00, 01), -1), local(2010, 11, 31));
      },
      "allows positive offsets": function(offset) {
        assert.deepEqual(offset(local(2010, 11, 31), +1), local(2011, 00, 01));
        assert.deepEqual(offset(local(2010, 11, 30), +2), local(2011, 00, 01));
        assert.deepEqual(offset(local(2010, 11, 30), +1), local(2010, 11, 31));
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
        "returns midnights": function(floor) {
          assert.deepEqual(floor(utc(2010, 11, 31, 23)), utc(2010, 11, 31));
          assert.deepEqual(floor(utc(2011, 00, 01, 00)), utc(2011, 00, 01));
          assert.deepEqual(floor(utc(2011, 00, 01, 01)), utc(2011, 00, 01));
        },
        "does not observe the start of daylight savings time": function(floor) {
          assert.deepEqual(floor(utc(2011, 02, 13, 07)), utc(2011, 02, 13));
          assert.deepEqual(floor(utc(2011, 02, 13, 08)), utc(2011, 02, 13));
          assert.deepEqual(floor(utc(2011, 02, 13, 09)), utc(2011, 02, 13));
          assert.deepEqual(floor(utc(2011, 02, 13, 10)), utc(2011, 02, 13));
        },
        "does not observe the end of daylight savings time": function(floor) {
          assert.deepEqual(floor(utc(2011, 10, 06, 05)), utc(2011, 10, 06));
          assert.deepEqual(floor(utc(2011, 10, 06, 06)), utc(2011, 10, 06));
          assert.deepEqual(floor(utc(2011, 10, 06, 07)), utc(2011, 10, 06));
          assert.deepEqual(floor(utc(2011, 10, 06, 08)), utc(2011, 10, 06));
        }
      },
      "ceil": {
        topic: function(interval) {
          return interval.ceil;
        },
        "returns midnights": function(ceil) {
          assert.deepEqual(ceil(utc(2010, 11, 30, 23)), utc(2010, 11, 31));
          assert.deepEqual(ceil(utc(2010, 11, 31, 00)), utc(2010, 11, 31));
          assert.deepEqual(ceil(utc(2010, 11, 31, 01)), utc(2011, 00, 01));
        },
        "does not observe the start of daylight savings time": function(ceil) {
          assert.deepEqual(ceil(utc(2011, 02, 13, 07)), utc(2011, 02, 14));
          assert.deepEqual(ceil(utc(2011, 02, 13, 08)), utc(2011, 02, 14));
          assert.deepEqual(ceil(utc(2011, 02, 13, 09)), utc(2011, 02, 14));
          assert.deepEqual(ceil(utc(2011, 02, 13, 10)), utc(2011, 02, 14));
        },
        "does not observe the end of daylight savings time": function(ceil) {
          assert.deepEqual(ceil(utc(2011, 10, 06, 05)), utc(2011, 10, 07));
          assert.deepEqual(ceil(utc(2011, 10, 06, 06)), utc(2011, 10, 07));
          assert.deepEqual(ceil(utc(2011, 10, 06, 07)), utc(2011, 10, 07));
          assert.deepEqual(ceil(utc(2011, 10, 06, 08)), utc(2011, 10, 07));
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
          assert.deepEqual(offset(utc(2010, 11, 31, 23, 59, 59, 999), +1), utc(2011, 00, 01, 23, 59, 59, 999));
          assert.deepEqual(offset(utc(2010, 11, 31, 23, 59, 59, 456), -2), utc(2010, 11, 29, 23, 59, 59, 456));
        },
        "allows negative offsets": function(offset) {
          assert.deepEqual(offset(utc(2010, 11, 31), -1), utc(2010, 11, 30));
          assert.deepEqual(offset(utc(2011, 00, 01), -2), utc(2010, 11, 30));
          assert.deepEqual(offset(utc(2011, 00, 01), -1), utc(2010, 11, 31));
        },
        "allows positive offsets": function(offset) {
          assert.deepEqual(offset(utc(2010, 11, 31), +1), utc(2011, 00, 01));
          assert.deepEqual(offset(utc(2010, 11, 30), +2), utc(2011, 00, 01));
          assert.deepEqual(offset(utc(2010, 11, 30), +1), utc(2010, 11, 31));
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
