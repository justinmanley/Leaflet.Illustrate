L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	addHooks: function() {
		L.Edit.SimpleShape.prototype.addHooks.call(this);
	},

	_createResizeMarker: function() {
		var corners = this._getCorners();

		this._resizeMarkers = [];

		for (var i = 0, l = corners.length; i < l; i++) {
			this._resizeMarkers.push(this._createMarker(corners[i], this.options.resizeIcon));
			this._resizeMarkers[i]._cornerIndex = i;
		}
	},

	_createMoveMarker: function() {

	},

	_createRotateMarker: function() {

	},

	_unbindMarker: function() {

	},

	_onMarkerDragStart: function(event) {
		var marker = event.target,
			latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng);
		} else if (marker === this._rotateMarker) {
			this._rotate(latlng);
		} else {
			
		}

	},

	_getCorners: function() {
		var corner = this._shape.getLatLng(),
			size = this._shape.getSize(),
			cornerPixelCoordinates = this._map.project(corner),
			oppositeCorner = this._map.unproject(new L.Point(
				cornerPixelCoordinates.x + size.x,
				cornerPixelCoordinates.y + size.y
			)),
			bounds = new L.LatLngBounds(corner, oppositeCorner);

		var nw = bounds.getNorthWest(),
			ne = bounds.getNorthEast(),
			se = bounds.getSouthEast(),
			sw = bounds.getSouthWest();

		return [nw, ne, se, sw];
	}
});

L.Illustrate.Textbox.addInitHook(function() {
	if (L.Illustrate.Edit.Textbox) {
		this.editing = new L.Illustrate.Edit.Textbox(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});