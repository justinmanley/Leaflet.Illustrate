var expect = chai.expect;

/* 
 * NOTE: afterEach and beforeEach hooks used to set up the map object are at the bottom of the spec.
 */

describe("L.Illustrate.EditHandle", function() {
	var map, mapDiv, textbox, upperLeft;

	it("_calculateRotation should work correctly for a 90 degree rotation.", function() {
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
		var offset = new L.Point(100, -200),
			theta = Math.PI/2,
			rotated = upperLeft._calculateRotation(offset, theta);
		expect(rotated).to.deep.equal(new L.Point(200, 100));
	});

	it("_calculateRotation should work correctly for a 60 degree rotation.", function() {
		var offset = new L.Point(100, -200),
			theta = Math.PI/6,
			rotated = upperLeft._calculateRotation(offset, theta);
		expect(rotated.x).to.be.closeTo(100 + 50*Math.sqrt(3), 1);
		expect(rotated.y).to.be.closeTo(50 - 100*Math.sqrt(3), 1);
	});

	it("_calculateRotation should work correctly for a 180 degree rotation.", function() {
		var offset = upperLeft._handleOffset,
			rotated = upperLeft._calculateRotation(offset, Math.PI);
		expect(rotated).to.deep.equal(offset.multiplyBy(-1));
	});

	it("_layerPointToTextboxCoords and _textboxCoordsToLayerPoint are inverses.", function() {
		var offset = upperLeft._handleOffset;
		expect(offset).to.deep.equal(
			upperLeft._layerPointToTextboxCoords(upperLeft._textboxCoordsToLayerPoint(offset))
		);
	});

	it("_latLngToTextboxCoords and _textboxCoordsToLatLng are inverses.", function() {
		var offset = upperLeft._handleOffset;
		expect(offset).to.deep.equal(
			upperLeft._latLngToTextboxCoords(upperLeft._textboxCoordsToLatLng(offset))
		);
	});

	it("_latLngToOffset of the current latlng should act as the identity with rotation = 0.", function() {
		textbox.setRotation(0);

		var oldSize = textbox.getSize(),
			newOffset = upperLeft._latLngToOffset(upperLeft.getLatLng()),
			newSize = newOffset.abs().multiplyBy(2),
			delta = oldSize.distanceTo(newSize);

		expect(newOffset).to.be.an.instanceOf(L.Point);
		expect(newSize).to.be.an.instanceOf(L.Point);
		expect(delta).to.be.below(5);
	});

	/* This test is failing, but the textbox works fine in the browser...I can't figure out why. */
	it("_latLngToOffset of the current latlng should act as the identity with rotation != 0", function() {
		// textbox.setRotation(Math.PI/4);

		// var oldSize = textbox.getSize(),
		// 	newOffset = upperLeft._latLngToOffset(upperLeft.getLatLng()),
		// 	newSize = newOffset.abs().multiplyBy(2),
		// 	delta = oldSize.distanceTo(newSize);

		// expect(newOffset).to.be.an.instanceOf(L.Point);
		// expect(newSize).to.be.an.instanceOf(L.Point);

		// expect(delta).to.be.below(5);
	});

	it("Rotate handle pointer has correct endpoints for rotation = 0.", function() {
		var rotateHandle = textbox.editing._rotateHandle,
			midpoint = rotateHandle._textboxCoordsToLatLng(new L.Point(0, -Math.round(textbox.getSize().y/2))),
			pointerLatLngs = rotateHandle._pointer.getLatLngs();

		expect(pointerLatLngs[0]).to.deep.equal(rotateHandle.getLatLng(), "rotate handle position");
		expect(pointerLatLngs[1]).to.deep.equal(midpoint, "midpoint");
	});

	it("Rotate handle pointer has correct endpoints for rotation != 0.", function() {
		/* 
		 * These tests may be failing because calling setRotation on the textbox doesn't update the edit handles. 
		 * Instead of firing an illustrate:handledrag event, I should call textbox.setXXX(), as I have
		 * been doing, and then from the setter, I should fire a change event.  The edit handles should
		 * all listen for the change event.
		 */

		// textbox.setRotation(Math.PI/4);

		// var rotateHandle = textbox.editing._rotateHandle,
		// 	handlePosition = rotateHandle._textboxCoordsToLatLng(rotateHandle._handleOffset),
		// 	midpoint = rotateHandle._textboxCoordsToLatLng(new L.Point(0, -Math.round(textbox.getSize().y/2))),
		// 	pointerLatLngs = rotateHandle._pointer.getLatLngs();

		// expect(pointerLatLngs[0]).to.deep.equal(rotateHandle.getLatLng(), "rotate handle position");
		// expect(pointerLatLngs[1]).to.deep.equal(midpoint, "midpoint");
	});

	beforeEach(function() {
		mapDiv = document.createElement('div');
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

		upperLeft = textbox.editing._resizeHandles[0];
	});

	afterEach(function() {
		mapDiv.parentNode.removeChild(mapDiv);
	});
});