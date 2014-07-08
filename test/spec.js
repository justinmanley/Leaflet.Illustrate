var expect = chai.expect;

describe("L.Point", function() {
	var point = new L.Point(1, -1);
	it("Should have an .abs() method which takes the absolute value of each coordinate.", function() {
		expect(point).to.respondTo('abs');
		expect(point.abs()).to.deep.equal(new L.Point(1, 1));
	});
});

describe("L.Illustrate", function() {
	var map;

	// before(function() {
	var mapDiv = document.createElement('div');
	mapDiv.id = 'map';
	document.body.appendChild(mapDiv);

	map = L.map('map').setView([41.7896,-87.5996], 15);
	L.tileLayer("http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
	}).addTo(map);

	var drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);

	var illustrateControl = new L.Illustrate.Control({
		edit: {
			featureGroup: drawnItems
		}
	});
	map.addControl(illustrateControl);

	map.on('draw:created', function(evt) {
		var layer = evt.layer;

		drawnItems.addLayer(layer);
	});
	// });

	describe("L.Illustrate.EditHandle", function() {
		var center = new L.LatLng(41.79187262698525, -87.60107517242432),
			size = new L.Point(240, 155),
			textbox = new L.Illustrate.Textbox(center, L.Illustrate.Create.Textbox.prototype.options.shapeOptions)
				.setSize(size);
		textbox.addTo(map);

		if (textbox.editing) {
			textbox.editing.enable();
		}

		var upperLeft = textbox.editing._resizeHandles[0];

		it("_calculateResize of the current latlng should cause negligible change with rotation = 0.", function() {
			textbox.setRotation(0);

			var oldSize = textbox.getSize(),
				newOffset = upperLeft._calculateResizeOffset(upperLeft.getLatLng(), new L.Point(10, 10)),
				newSize = newOffset.abs().multiplyBy(2),
				delta = oldSize.distanceTo(newSize);

			expect(newOffset).to.be.an.instanceOf(L.Point);
			expect(newSize).to.be.an.instanceOf(L.Point);
			expect(delta).to.be.below(5);
		});

		it("_calculateResize of the current latlng should cause a negligible change with nonzero rotation.", function() {
			textbox.setRotation(Math.PI/4);

			var oldSize = textbox.getSize(),
				newOffset = upperLeft._calculateResizeOffset(upperLeft.getLatLng(), new L.Point(10, 10)),
				newSize = newOffset.abs().multiplyBy(2),
				delta = oldSize.distanceTo(newSize);

			expect(newOffset).to.be.an.instanceOf(L.Point);
			expect(newSize).to.be.an.instanceOf(L.Point);
			expect(delta).to.be.below(5);
		});
	});

	// after(function() {
	// var mapDiv = document.getElementById('map');
	mapDiv.parentNode.removeChild(mapDiv);
	// });
});