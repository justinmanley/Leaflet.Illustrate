var expect = chai.expect;

describe("L.Illustrate.PointerHandle", function() {
	var map, pointer,
		_onVertexUpdate;

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
		_onVertexUpdate = sinon.spy(L.Illustrate.PointerHandle.prototype, "_onVertexUpdate");
	});

	beforeEach(function() {
		pointer.editing.enable();
	});

	afterEach(function() {
		_onVertexUpdate.restore();
	});

	describe("#_onVertexAdd", function() {
		it("Should add a vertex.", function() {
			var initialLength = pointer.getPoints().length,
				handle = pointer.editing._handles[1];

			expect(handle._type).to.equal('midpoint');
			handle.fire('drag', { target: handle });
			expect(handle._type).to.equal('vertex');

			expect(pointer.getPoints().length).to.equal(initialLength + 1);
		});

		it("Should not alter any other coordinates.", function() {
			var initialCoords = [].slice.call(pointer.getPoints(), 0),
				handle = pointer.editing._handles[1],
				coords;

			handle.fire('drag', { target: handle });

			coords = pointer.getPoints();

			expect(coords[0]).to.deep.equal(initialCoords[0]);
			expect(coords[2]).to.deep.equal(initialCoords[1]);
			expect(coords[3]).to.deep.equal(initialCoords[2]);
			expect(coords[4]).to.deep.equal(initialCoords[3]);
		});

		it("Should not leave any gaps in pointer.editing._handles", function() {
			var handles = pointer.editing._handles,
				initialHandlesLength = handles.length,
				handle = handles[1],
				i, l;

			for (i = 0, l = handles.length; i < length - 1; i++) {
				expect(handles[i + 1]._id).to.equal(handles[i]._id + 1);
			}

			handle.fire('drag', { target: handle });

			handles = pointer.editing._handles;
			expect(handles.length).to.equal(initialHandlesLength + 2);

			for (i = 0, l = handles.length; i < length; i++) {
				expect(handles[i]._id).to.equal(i);
			}
		});
	});

	describe("#_onVertexRemove", function() {
		it("Should only remove one vertex", function() {
			var initialCoords = [].slice.call(pointer.getPoints(), 0),
				handle = pointer.editing._handles[2],
				coords;

			handle.fire('click', { target: handle });

			coords = pointer.getPoints();
			expect(coords.length).to.equal(initialCoords.length - 1);
		});

		it("Should remove three handles from the map and add one back.", function() {
			var initialHandles = [].slice.call(pointer.editing._handles, 0),
				handle = initialHandles[2],
				handles;

			expect(handle._type).to.equal('vertex');
			handle.fire('click', { target: handle });

			handles = pointer.editing._handles;

			expect(handles.length).to.equal(initialHandles.length - 2);
		});

		it("Should not leave any gaps in pointer.editing._handles", function() {
			var handles = pointer.editing._handles,
				handle = handles[2];

			handle.fire('click', { target: handle });

			for (var i = 0, l = handles.length; i < l - 1; i++) {
				expect(handles[i]._id).to.equal(i);
			}
		});
	});

	describe("#_onVertexUpdate", function() {
		it("Should only update the vertex being dragged.", function() {
			var initialCoords = pointer.getPoints(),
				initialLength = initialCoords.length,
				handle2 = pointer.editing._handles[4],
				newCoords = new L.Point(0, 30),
				coordinates, arg;

			handle2.setLatLng(handle2._textboxCoordsToLatLng(newCoords));
			handle2.fire('drag', { target: handle2 });

			expect(pointer.getPoints().length).to.equal(initialLength);

			expect(_onVertexUpdate.called).to.equal(true);

			for (var i = 0, length = _onVertexUpdate.args.length; i < length; i++) {
				arg = _onVertexUpdate.args[i][0];

				expect(arg.handle._id).to.equal(handle2._id);
				expect(arg.handle._handleOffset).to.equal(handle2._handleOffset);
				expect(arg.handle._type).to.equal(handle2._type);
			}

			coordinates = pointer.getPoints();

			/* These handles were not modified at all. */
			expect(coordinates[0]).to.be.closeToPoint(initialCoords[0]);
			expect(coordinates[1]).to.be.closeToPoint(initialCoords[1]);
			expect(coordinates[3]).to.be.closeToPoint(initialCoords[3]);
		});

		it("Should set the correct vertex to the correct coordinates", function() {
			var initialLength = pointer.getPoints().length,
				handle = pointer.editing._handles[2],
				newCoords = new L.Point(10, 0);

			expect(handle._type).to.equal('vertex');
			handle.setLatLng(handle._textboxCoordsToLatLng(newCoords));

			handle.fire('drag', { target: handle });

			expect(pointer.getPoints()[1]).to.be.closeToPoint(newCoords);
			expect(pointer.getPoints().length).to.equal(initialLength);
		});
	});
});