var expect = chai.expect;

describe("L.Illustrate.Edit.Textbox", function() {
	var map, textbox;

	beforeEach(function() {
		var center = new L.LatLng(41.79187262698525, -87.60107517242432),
			size = new L.Point(240, 155);

		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);

		textbox = new L.Illustrate.Textbox(center, L.Illustrate.Create.Textbox.prototype.options.shapeOptions)
			.setSize(size)
			.addTo(map);
	});

	beforeEach(function() {
		textbox.editing.enable();
	});

	it("", function() {
		expect(1).to.equal(1);
	});

});