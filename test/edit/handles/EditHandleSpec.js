var expect = chai.expect;

/* 
 * NOTE: afterEach and beforeEach hooks used to set up the map object are at the bottom of the spec.
 */

describe("L.Illustrate.EditHandle", function() {
	var map, textbox, updateHandle;

	beforeEach(function() {
		map = L.map(document.createElement('div')).setView([41.7896,-87.5996], 15);
	});

	beforeEach(function() {
		var center = new L.LatLng(41.79187262698525, -87.60107517242432),
			size = new L.Point(240, 155);

		textbox = new L.Illustrate.Textbox(center, L.Illustrate.Create.Textbox.prototype.options.textOptions)
			.setSize(size);
		textbox.addTo(map);
	});

	describe("L.Illustrate.MoveHandle", function() {
		describe("#_onHandleDrag", function() {
			it("Should update the latlng of the textbox", function() {
				var newLatLng = new L.LatLng(2, 4),
					moveHandle;

				textbox.editing.enable();

				moveHandle = textbox.editing._moveHandle;
				moveHandle.setLatLng(newLatLng);
				moveHandle._onHandleDrag({ target: moveHandle });
				expect(textbox.getLatLng()).to.deep.equal(newLatLng);
			});
		});
	});

	describe("L.Illustrate.ResizeHandle", function() {
		var resizeHandle;

		beforeEach(function() {
			var size = textbox.getSize(),
				height = size.y,
				width = size.x;

			updateHandle = sinon.spy(L.Illustrate.ResizeHandle.prototype, 'updateHandle');

			resizeHandle = new L.Illustrate.ResizeHandle(textbox, {
				offset: new L.Point(-width, -height),
				corner: 'upper-left'
			}).addTo(map);
		});

		afterEach(function() {
			updateHandle.restore();
		});

		describe("#_onHandleDrag", function() {
			it("Should not change the textbox dimensions when called with initial latlng.", function() {
				var size = textbox.getSize(),
					handle;

				textbox.editing.enable();

				handle = textbox.editing._resizeHandles[0];
				handle._onHandleDrag({ target: handle });

				/* textbox.getSize() is equal to 2*this._minSize */
				expect(textbox.getSize()).to.be.closeToPoint(size);
			});
		});

		describe("#_calculateRotation", function() {
			/*           
			 * Remember that the y-axis is inverted (up is negative, down is positive).
			 * Rotations are measured clockwise from the negative y-axis.
			 *
			 *                                    |    * new L.Point(100, -200)
			 *                                    |
			 *                                    |
			 *                                    |   
			 *                                    |    
			 *                         __ __ __ __|__ __ __ __
			 *                                    |
			 *                                    |
			 *                                    |
			 *                                    |
			 *                                    |
			 */

			it("90 degree rotation", function() {
				var offset = new L.Point(100, -200),
					theta = Math.PI/2,
					rotated = resizeHandle._calculateRotation(offset, theta);
				expect(rotated).to.deep.equal(new L.Point(200, 100));
			});

			it("60 degree rotation", function() {
				var offset = new L.Point(100, -200),
					theta = Math.PI/6,
					rotated = resizeHandle._calculateRotation(offset, theta);
				expect(rotated.x).to.be.closeTo(100 + 50*Math.sqrt(3), 1);
				expect(rotated.y).to.be.closeTo(50 - 100*Math.sqrt(3), 1);
			});

			it("180 degree rotation", function() {
				var offset = resizeHandle._handleOffset,
					rotated = resizeHandle._calculateRotation(offset, Math.PI);
				expect(rotated).to.deep.equal(offset.multiplyBy(-1));
			});
		});

		describe("#_layerPointToTextboxCoords", function() {
			it ("#_textboxCoordsToLayerPoint is inverse", function() {
				var offset = resizeHandle._handleOffset;
				expect(offset).to.deep.equal(
					resizeHandle._layerPointToTextboxCoords(resizeHandle._textboxCoordsToLayerPoint(offset))
				);
			});
		});

		describe("#_latLngToTextboxCoords", function() {
			it ("#_textboxCoordsToLatLng is inverse", function() {
				var offset = resizeHandle._handleOffset;
				expect(offset).to.deep.equal(
					resizeHandle._latLngToTextboxCoords(resizeHandle._textboxCoordsToLatLng(offset))
				);
			});
		});

		describe("#_getOffset", function() {
			it("When rotation is 0 acts as identity on current latlng", function() {
				textbox.setRotation(0);

				expect(updateHandle.called).to.equal(true);

				var oldSize = textbox.getSize(),
					newOffset = resizeHandle._getOffset(resizeHandle.getLatLng()),
					newSize = newOffset.abs().multiplyBy(2),
					delta = oldSize.distanceTo(newSize);

				expect(newOffset).to.be.an.instanceOf(L.Point);
				expect(newSize).to.be.an.instanceOf(L.Point);
				expect(delta).to.be.below(5);
			});

			it("When rotation is nonzero acts as identity on current latlng", function() {
				textbox.setRotation(Math.PI/4);

				var oldSize = textbox.getSize(),
					newOffset = resizeHandle._getOffset(resizeHandle.getLatLng()),
					newSize = newOffset.abs().multiplyBy(2),
					delta = oldSize.distanceTo(newSize);

				expect(newOffset).to.be.an.instanceOf(L.Point);
				expect(newSize).to.be.an.instanceOf(L.Point);

				expect(delta).to.be.below(5);
			});
		});

	});

	describe("L.Illustrate.RotateHandle", function() {
		var rotateHandle;

		beforeEach(function() {
			rotateHandle = new L.Illustrate.RotateHandle(textbox, {
				offset: new L.Point(0, -textbox.getSize().y)
			}).addTo(map);
		});

		it("Has a pointer which is added to the map correctly.", function() {
			expect(rotateHandle._pointer).to.be.an.instanceOf(L.Illustrate.Pointer);
			expect(rotateHandle._pointer._map).to.be.an.instanceOf(L.Map);
		});

		it("When rotation = 0, rotate pointer has correct endpoints.", function() {
			var	midpoint = rotateHandle._textboxCoordsToLatLng(new L.Point(0, -Math.round(textbox.getSize().y/2))),
				pointerLatLngs = rotateHandle._pointer._getLatLngs();

			expect(pointerLatLngs[0]).to.be.closeToLatLng(midpoint, 0.001);
			expect(pointerLatLngs[1]).to.be.closeToLatLng(rotateHandle.getLatLng(), 0.001);
		});

		it("When rotation is nonzero, rotate pointer has correct endpoints.", function() {
			textbox.setRotation(Math.PI/4);

			var	midpoint = rotateHandle._textboxCoordsToLatLng(new L.Point(0, -Math.round(textbox.getSize().y/2))),
				pointerLatLngs = rotateHandle._pointer._getLatLngs();

			expect(pointerLatLngs[0]).to.be.closeToLatLng(midpoint, 0.001);
			expect(pointerLatLngs[1]).to.be.closeToLatLng(rotateHandle.getLatLng(), 0.001);
		});

		describe("#_onHandleDrag", function() {
			it("Updates the rotation of the textbox", function() {
				textbox.editing.enable();

				var rotateHandle = textbox.editing._rotateHandle,
					oldLatLng = rotateHandle.getLatLng(),
					oldPosition = rotateHandle._latLngToTextboxCoords(oldLatLng),
					newPosition = new L.Point(oldPosition.y, oldPosition.x),
					newLatLng = rotateHandle._textboxCoordsToLatLng(newPosition);

				rotateHandle.setLatLng(newLatLng);
				rotateHandle._onHandleDrag({ target: rotateHandle });
				expect(textbox.getRotation()).to.be.closeTo(Math.PI/2, 0.000001);

			});
		});
	});
});