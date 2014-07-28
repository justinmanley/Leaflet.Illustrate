var expect = chai.expect;

describe("L.Illustrate.PointerHandle", function() {
	var map, pointer, editing;

	beforeEach(function() {
		var anchor = new L.LatLng(41.7918, -87.6010);

		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
		pointer = new L.Illustrate.Pointer(anchor, [
			new L.Point(0, 0),
			new L.Point(0, 10),
			new L.Point(0, 20),
			new L.Point(0, 40)
		]).addTo(map);
	});

	beforeEach(function() {
		_onVertexAdd = sinon.spy(L.Illustrate.PointerHandle.prototype, "_onVertexAdd"),
		_onVertexRemove = sinon.spy(L.Illustrate.PointerHandle.prototype, "_onVertexRemove"),
		_onVertexUpdate = sinon.spy(L.Illustrate.PointerHandle.prototype, "_onVertexUpdate"),
		editing = new L.Illustrate.Edit.Pointer(pointer);
		editing.enable();
	});

	afterEach(function() {
		_onVertexAdd.restore();
		_onVertexRemove.restore();
		_onVertexUpdate.restore();
	});

	describe("#_onVertexAdd", function() {
		it("Should add a vertex.", function() {
			var initialLength = pointer.getPoints().length,
				i = 1,
				handle = editing._handles[i];

			expect(handle._type).to.equal('midpoint');

			handle.fire('drag', { target: handle });

			expect(pointer.getPoints().length).to.equal(initialLength + 1, "pointer.getPoints().length");
		});

		it("Should add two midpoints handles.", function() {

		});
	});

	describe("#_onVertexUpdate", function() {
		it("Should only update the vertex being dragged.", function() {
			var initialCoords = pointer.getPoints(),
				initialLength = initialCoords.length,
				handle1 = editing._handles[2],
				handle2 = editing._handles[4],
				newCoords = new L.Point(0, 30),
				coordinates;

			handle2.setLatLng(handle2._textboxCoordsToLatLng(newCoords));
			handle2.fire('drag', { target: handle2 });

			expect(pointer.getPoints().length).to.equal(initialLength);
			for (var i = 0, length = _onVertexUpdate.args.length; i < length; i++) {
				expect(_onVertexUpdate.args[i][0].id).to.equal(handle2._id);
				expect(_onVertexUpdate.args[i][0].coord).to.equal(handle2._handleOffset);
			}

			coordinates = pointer.getPoints();

			/* These handles were not modified at all. */			
			expect(coordinates[0]).to.be.closeToPoint(initialCoords[0]);
			expect(coordinates[1]).to.be.closeToPoint(initialCoords[1]);
			expect(coordinates[3]).to.be.closeToPoint(initialCoords[3]);
		});

		it("Should set the correct vertex to the correct coordinates", function() {
			var initialLength = pointer.getPoints().length,
				handle = editing._handles[2],
				newCoords = new L.Point(10, 0);

			expect(handle._type).to.equal('vertex');
			handle.setLatLng(handle._textboxCoordsToLatLng(newCoords));

			handle.fire('drag', { target: handle });

			expect(pointer.getPoints()[1]).to.be.closeToPoint(newCoords);
			expect(pointer.getPoints().length).to.equal(initialLength);
		});
	});

	describe("#_handleIdToCoordIndex", function() {
		it("Should return an integer for vertex handles.", function() {
			var index, h;

			for (var i = 0, length = editing._handles.length; i < length; i++) {
				h = editing._handles[i];
				if (h._type === 'vertex') {
					index = editing._handleIdToCoordIndex(h._id, 'vertex'); 
					expect(parseInt(index)).to.equal(index);				
				}
			}
		});
	});
});