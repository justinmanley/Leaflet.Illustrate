var expect = chai.expect;

describe("L.Illustrate.Edit.Pointer", function() {
	var map, pointer;

	beforeEach(function() {
		var anchor = new L.LatLng(41.7918, -87.6010);

		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
		pointer = new L.Illustrate.Pointer(anchor, [
			new L.Point(0, 0),
			new L.Point(0, 400)
		]).addTo(map);
	});

	describe("#initialize", function() {
		it("Initializes correctly", function() {
			var	editing = new L.Illustrate.Edit.Pointer(pointer);

			expect(pointer).to.have.property("_map");

			editing.enable();

			expect(editing).to.have.property("_handleGroup");
		});
	});
});