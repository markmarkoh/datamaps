exports = module.exports = require('./lib/select');

/*
  Export the version
*/
exports.version = (function() {
  var pkg = require('fs').readFileSync(__dirname + '/package.json', 'utf8');
  return JSON.parse(pkg).version;
})();
