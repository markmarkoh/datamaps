define([
  'intern!object',
  'intern/chai!expect',
  'datamaps'
], function (registerSuite, expect, datamaps) {
  registerSuite({
      name: 'yaoming',
      latlng: function () {
        console.log(datamaps);
        expect(datamaps.prototype.usaTopo).to.have.length.of.at.least(400);
      }
  });
});