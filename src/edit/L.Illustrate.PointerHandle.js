L.Illustrate.PointerHandle = L.Illustrate.EditHandle.extend({
	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._index = options.index;
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			coordinates = this._handled.getPoints();

		this._handleOffset = this._latLngToTextboxCoords(handle.getLatLng());
		coordinates.splice(this._index, 1, this._handleOffset);

		this._handled.setPoints(coordinates);
	}
});