var expect = chai.expect;

describe("L.Illustrate.Edit.Pointer", function() {
	var map, pointer, editing,
		_initHandles;

	beforeEach(function() {
		var anchor = new L.LatLng(41.7918, -87.6010);

		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
		pointer = new L.Illustrate.Pointer(anchor, [
			new L.Point(0, 0),
			new L.Point(0, 400)
		]).addTo(map);
	});

	beforeEach(function() {
		_initHandles = sinon.spy(L.Illustrate.Edit.Pointer.prototype, "_initHandles");
	});

	beforeEach(function() {
		editing = pointer.editing;
	});

	afterEach(function() {
		_initHandles.restore();
	});

	describe("#_initHandles", function() {
		it("Calls _initHandles and sets _handles and _handleGroup properties.", function() {
			expect(pointer).to.have.property("_map");
			expect(editing).to.not.have.property("_handleGroup");
			expect(editing).to.not.have.property("_handles");

			editing.enable();

			expect(_initHandles.called).to.equal(true);
			expect(editing).to.have.property("_handleGroup");
			expect(editing._handleGroup).to.be.an.instanceOf(L.FeatureGroup);
			expect(editing).to.have.property("_handles");
			expect(editing._handles).to.be.an("array");
		});
	});

	describe("#_handleIdToCoordIndex", function() {
		it("Should act as an inverse for #_coordIndexToHandleId", function() {
			var e = editing;

			editing.enable();

			expect(e._handleIdToCoordIndex(e._coordIndexToHandleId(1, 'vertex'), 'vertex')).to.equal(1);
			expect(e._handleIdToCoordIndex(e._coordIndexToHandleId(1, 'midpoint'), 'midpoint')).to.equal(1);
		});

		it("Should return an integer for vertex handles.", function() {
			var index, h;

			editing.enable();

			for (var i = 0, length = editing._handles.length; i < length; i++) {
				h = pointer.editing._handles[i];
				if (h._type === 'vertex') {
					index = pointer.editing._handleIdToCoordIndex(h._id, 'vertex');
					expect(parseInt(index, 10)).to.equal(index);
				}
			}
		});
	});
});