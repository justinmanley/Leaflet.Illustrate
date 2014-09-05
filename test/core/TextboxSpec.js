var expect = chai.expect;

/* 
 * NOTE: afterEach and beforeEach hooks used to set up the map object are at the bottom of the spec.
 */

describe("L.Illustrate.Textbox", function() {
	var map, textbox;

	beforeEach(function() {
		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
	});

	beforeEach(function() {
		var center = new L.LatLng(41.79187262698525, -87.60107517242432),
			size = new L.Point(240, 155);

		textbox = new L.Illustrate.Textbox(center, L.Illustrate.Create.Textbox.prototype.options.shapeOptions)
			.setSize(size);
		textbox.addTo(map);
	});

	describe("#getContent", function() {
		it("Should return the empty string for a new textbox with no default value.", function() {
			expect(textbox.getContent()).to.equal('');
		});
	});

	describe("#toGeoJSON", function() {
		it("Should create a Point Feature object with text and style properties.", function() {
			expect(textbox.toGeoJSON()).to.deep.equal({
				'type': 'Feature',
				'geometry': {
					'type': 'Point',
					'coordinates': [-87.60107517242432, 41.79187262698525]
				},
				'properties': {
					'pointType': 'textbox',
					'text': '',
					'style': {
						width: 240,
						height: 155,
						rotation: 0
					}
				}
			});
		});
	});
});