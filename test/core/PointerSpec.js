var expect = chai.expect;

/* 
 * NOTE: afterEach and beforeEach hooks used to set up the map object are at the bottom of the spec.
 */

describe("L.Illustrate.Pointer", function() {
	var map, _animateZoom, fire;

	beforeEach(function() {
		_animateZoom = sinon.spy(L.Map.prototype, "_animateZoom");
		fire = sinon.spy(L.Map.prototype, "fire");

		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
	});

	afterEach(function() {
		_animateZoom.restore();
		fire.restore();
	});

	describe("#onAdd", function() {
		it("Adds to the map correctly", function() {
			var anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer(anchor, [new L.Point(0,0), new L.Point(100, 100)]);

			expect(pointer._map).to.be.an('undefined');
			map.addLayer(pointer);
			expect(pointer._map).to.be.an.instanceOf(L.Map);
		});
	});

	describe("#_getLatLngs", function() {
		it("Anchor point is latlng of first point with first coordinate [0, 0].", function() {
			var anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer(anchor, [new L.Point(0,0)]).addTo(map),
				latlngs = pointer._getLatLngs();

			expect(latlngs[0]).to.be.closeToLatLng(pointer._latlng);
		});
	});

	describe("#_animateZoom", function() {
		it.skip("Origin is preserved during zoom.", function(done) {
			var anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer(anchor, [new L.Point(0,0)]).addTo(map),
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
				pointer = new L.Illustrate.Pointer(anchor, [new L.Point(0, 0), new L.Point(0, 400)]).addTo(map),
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

	describe("#onRemove", function() {
		it("Should remove all SVG elements and map listeners.", function() {
			var _updateSvgViewport = sinon.spy(L.Illustrate.Pointer.prototype, "_updateSvgViewport"),
				anchor = new L.LatLng(41.7918, -87.6010),
				pointer = new L.Illustrate.Pointer(anchor, [
					new L.Point(0, 0),
					new L.Point(0, 400)
				]).addTo(map);

			_updateSvgViewport.reset();
			map.removeLayer(pointer);

			map.setView(new L.LatLng(41.8, -87.7), map.getZoom() + 1);

			expect(_updateSvgViewport.called).to.equal(false);
		});
	});
});