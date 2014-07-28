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
		it.skip("Returns an instance of L.Illustrate.Pointer", function(done) {
			create.addVertex(new L.LatLng(40, -90));

			create._fireCreatedEvent();

			map.on('draw:created', function(evt) {
				expect(evt.layer).to.be.an.instanceOf(L.Illustrate.Pointer);
				done();
			});
		});
	});
});