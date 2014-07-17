var expect = chai.expect;

/* 
 * NOTE: afterEach and beforeEach hooks used to set up the map object are at the bottom of the spec.
 */

describe("L.Illustrate.Pointer", function() {
	var map, mapDiv, textbox, _animateZoom, fire;

	it("When passed a latlng, pointer should have a _latlng property.", function() {
		var center = textbox.getLatLng(),
			pointer = new L.Illustrate.Pointer([], center);

		expect(pointer).to.have.property("_latlng");
	});

	describe("#_getLatLngs", function() {
		it("Anchor point is latlng of first point with first coordinate [0, 0].", function() {
			var anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer([new L.Point(0,0)], anchor).addTo(map),
				latlngs = pointer._getLatLngs();

			expect(latlngs[0]).to.be.closeToLatLng(pointer._latlng);
		});
	});

	describe("#_animateZoom", function() {
		it("Origin is preserved during zoom.", function(done) {
			var anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer([new L.Point(0,0)], anchor).addTo(map),
				latlngs;

			map.on('zoomend', function() {
				latlngs = pointer._getLatLngs();
				expect(latlngs[0]).to.be.closeToLatLng(pointer._latlng);
				done();
			});

			pointer._map.setZoom(pointer._map.getZoom() - 1);
		});

		it.skip("Other points are not preserved during zoom.", function(done) {
			var anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer([new L.Point(0, 0), new L.Point(0, 400)], anchor).addTo(map),
				initialLatLngs = pointer._getLatLngs(),
				latlngs;

			pointer._map.setZoom(pointer._map.getZoom() - 1);

			map.on('zoomend', function() {
				latlngs = pointer._getLatLngs();
				expect(fire.calledWith('zoomanim')).to.equal(true);

				expect(latlngs[1]).to.not.be.closeToLatLng(initialLatLngs[1]);
				done();
			});
		});
	});

	beforeEach(function() {
		mapDiv = document.createElement('div');
		mapDiv.id = 'map';
		document.body.appendChild(mapDiv);

		_animateZoom = sinon.spy(L.Map.prototype, "_animateZoom");
		fire = sinon.spy(L.Map.prototype, "fire");

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
	});

	beforeEach(function() {
		var center = new L.LatLng(41.79187262698525, -87.60107517242432),
			size = new L.Point(240, 155);

		textbox = new L.Illustrate.Textbox(center, L.Illustrate.Create.Textbox.prototype.options.shapeOptions)
			.setSize(size);
		textbox.addTo(map);

		if (textbox.editing) {
			textbox.editing.enable();
		}
	});

	afterEach(function() {
		_animateZoom.restore();
		fire.restore();
		mapDiv.parentNode.removeChild(mapDiv);
	});
});