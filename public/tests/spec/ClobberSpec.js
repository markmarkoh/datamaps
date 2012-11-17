describe("Clobber", function() {

  var PAGE_BB_VERSION = "0.5.3";
  it("shouldn't alter version of preview Backbone", function() {
    expect(Backbone.VERSION).toEqual(PAGE_BB_VERSION);
  });
});