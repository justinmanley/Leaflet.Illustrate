var expect = chai.expect;

describe("L.Illustrate.Pointer", function() {
	var map, create;

	beforeEach(function() {
		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
	});

	beforeEach(function() {
		create = new L.Illustrate.Create.Pointer(map, {});
		create.enable();
	});

	describe("#_fireCreatedEvent", function() {
		it("Returns an instance of L.Illustrate.Pointer", function(done) {
			create._currentLatLng = new L.LatLng(0, 0);
			create.addVertex(new L.LatLng(40, -90));

			map.on('draw:created', function(event) {
				var layer = event.layer;

				expect(layer).to.be.an.instanceof(L.Illustrate.Pointer);
				done();
			});

			create._fireCreatedEvent();
		});
	});
});