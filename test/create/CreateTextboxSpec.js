var expect = chai.expect;

describe("L.Illustrate.Create.Textbox", function() {
	var map;

	beforeEach(function() {
		map = new L.Map(document.createElement('div'))
			.setView([0, 0], 15);
	});

	describe("_setShapeOptions", function() {
		it("Should set defaults correctly.", function() {
			var create = new L.Illustrate.Create.Textbox(map, {}),
				color = create.options.textOptions.borderColor,
				weight = create.options.textOptions.borderWidth;

			/* Defaults from L.Illustrate.Create.Textbox */
			expect(create.options.shapeOptions.opacity).to.equal(1);
			expect(create.options.shapeOptions.fill).to.equal(false);

			expect(create.options.shapeOptions.color).to.equal(color);
			expect(create.options.shapeOptions.weight).to.equal(weight);
		});

		it("Should handle options parameter correctly.", function() {
			var options = { borderWidth: 4, borderColor: "#9840ae" },
				create = new L.Illustrate.Create.Textbox(map, options);

			/* Defaults from L.Illustrate.Create.Textbox */
			expect(create.options.shapeOptions.opacity).to.equal(1);
			expect(create.options.shapeOptions.fill).to.equal(false);

			/* Set dynamically from the options that were passed in. */
			expect(create.options.shapeOptions.color).to.equal(options.borderColor);
			expect(create.options.shapeOptions.weight).to.equal(options.borderWidth);
		});
	});

	describe("#_drawShape", function() {
		it("Should yield a textbox of the correct size.", function(done) {
			var create = new L.Illustrate.Create.Textbox(map, {}),
				start = new L.LatLng(0, 0),
				size = new L.Point(200, 100),
				latlng = map.layerPointToLatLng(map.latLngToLayerPoint(start).add(size));

			create._startLatLng = start;
			L.Draw.Rectangle.prototype._drawShape.call(create, latlng);

			map.on('draw:created', function(event) {
				var textbox = event.layer;

				expect(textbox.getSize()).to.be.closeToPoint(size, 3);
				done();
			});

			create._fireCreatedEvent();
		});
	});
});