var vows = require("vows"),
    load = require("../load"),
    assert = require("../assert");

var suite = vows.describe("d3.zip");

suite.addBatch({
  "zip": {
    topic: load("arrays/zip").expression("d3.zip"),
    "transposes a square matrix": function(zip) {
      assert.deepEqual(zip([1, 2], [3, 4]), [[1, 3], [2, 4]]);
    },
    "transposes a non-square matrix": function(zip) {
      assert.deepEqual(zip([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]), [[1, 2], [2, 4], [3, 6], [4, 8], [5, 10]]);
    },
    "transposes a single-row matrix": function(zip) {
      assert.deepEqual(zip([1, 2, 3, 4, 5]), [[1], [2], [3], [4], [5]]);
    },
    "transposes an empty matrix": function(zip) {
      assert.deepEqual(zip(), []);
    },
    "ignores extra elements given an irregular matrix": function(zip) {
      assert.deepEqual(zip([1, 2], [3, 4], [5, 6, 7]), [[1, 3, 5], [2, 4, 6]]);
    }
  }
});

suite.export(module);
