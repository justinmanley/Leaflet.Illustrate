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

	describe("#_onHandleDrag", function() {
		it("Should not change the textbox dimensions when called with initial latlng.", function() {
			var handle = textbox.editing._resizeHandles[0],
				size = textbox.getSize();

			handle._onHandleDrag({ target: handle });

			/* textbox.getSize() is equal to 2*this._minSize */
			expect(textbox.getSize()).to.be.closeToPoint(size);
		});
	});

	describe("draw:edited", function() {
		it.skip("Should fire when content inside the textarea is changed.", function(done) {
			var textarea = textbox.getTextarea(),
				text = 'Some new text';

			map.on('draw:edited', function(event) {
				event.layers.eachLayer(function(layer) {
					expect(layer.getTextarea().value).to.equal(text);
				});
				done();
			});

			/* Setting the textarea value programmatically doesn't fire the change event. */
			textarea.innerHTML = text;
		});
	});

});