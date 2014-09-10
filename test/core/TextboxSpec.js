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
			.setSize(size)
			.addTo(map);
	});

	describe("#initialize", function() {
		it("Should have a _minSize.", function() {
			expect(textbox).to.have.property("_minSize");
			expect(textbox._minSize).to.be.an.instanceof(L.Point);
		});
	});

	describe("#onAdd", function() {
		it("Should create a textarea containing the most recent input when removed, then re-added to the map.", function() {
			var content = 'Some new content';

			textbox.getTextarea().innerHTML = content;
			map.removeLayer(textbox);
			map.addLayer(textbox);
			expect(textbox.getContent()).to.equal(content);
		});
	});

	describe("#getContent", function() {
		it("Should return the empty string for a new textbox with no default value.", function() {
			expect(textbox.getContent()).to.equal('');
		});

		it("Should return a value that is set via assignment to the value property of the textarea.", function() {
			var textarea = textbox.getTextarea(),
				content = 'My new content.';

			textarea.innerHTML = content;
			expect(textbox.getContent()).to.equal(content);
		});

		it("Should return the contents of the textbox even after the textbox has been removed from the map.", function() {
			var textarea = textbox.getTextarea(),
				content = 'My new content.';

			textarea.innerHTML = content;
			map.removeLayer(textbox);
			expect(textbox.getContent()).to.equal(content);
		});
	});

	describe("#setSize", function() {
		it("Should leave _minSize unchanged if called with a size larger than _minSize.", function() {
			var minSize = textbox._minSize,
				newSize = minSize.add(new L.Point(100, 100));

			textbox.setSize(newSize);

			expect(textbox._minSize.x).to.equal(minSize.x);
			expect(textbox._minSize.y).to.equal(minSize.y);
		});

		it("Should reset _minSize.x if size.x < _minSize.x", function() {
			var	minSize  = textbox._minSize,
				newSize  = minSize.add(new L.Point(-100, 100));

			textbox.setSize(newSize);

			expect(textbox._minSize.x).to.equal(newSize.x);
			expect(textbox._minSize.y).to.equal(minSize.y);

			expect(textbox.getSize()).to.deep.equal(newSize);

		});

		it("Should reset _minSize.x if size.x < _minSize.x", function() {
			var minSize = textbox._minSize,
				newSize = minSize.add(new L.Point(100, -100));

			textbox.setSize(newSize);

			expect(textbox._minSize.x).to.equal(minSize.x);
			expect(textbox._minSize.y).to.equal(newSize.y);

			expect(textbox.getSize()).to.deep.equal(newSize);
		});

		it("Should reset _minSize if both components are less than _minSize", function() {
			var	minSize  = textbox._minSize,
				newSize  = minSize.add(new L.Point(-100, -100));

			textbox.setSize(newSize);
			expect(textbox._minSize).to.deep.equal(newSize);
			expect(textbox.getSize()).to.deep.equal(newSize);
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

	describe("#getTextarea", function() {
		it("Should return a <textarea> element.", function() {
			var textarea = textbox.getTextarea();

			expect(textarea.nodeName).to.equal('TEXTAREA');
		});
	});
});