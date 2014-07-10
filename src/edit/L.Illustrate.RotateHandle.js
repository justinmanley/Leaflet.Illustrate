L.Illustrate.RotateHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'rotate'
	},

	onAdd: function(map) {
		L.Illustrate.EditHandle.prototype.onAdd.call(this, map);

		this._createPointer();

		this._map.addLayer(this._pointer);
	},

	onRemove: function(map) {
		this._map.removeLayer(this._pointer);

		L.Illustrate.EditHandle.prototype.onRemove.call(this, map);
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			latlng = handle.getLatLng(),
			center = this._handled.getCenter(),
			point = this._map.latLngToLayerPoint(latlng).subtract(this._map.latLngToLayerPoint(center)),
			theta;

		if (point.y > 0) {
			theta = Math.PI - Math.atan(point.x / point.y);
		} else {
			theta = - Math.atan(point.x / point.y);
		}

		/* rotate the textbox */
		this._handled.setRotation(theta);

		this._handled.fire('illustrate:handledrag');
	},

	updateHandle: function() {
		this._handleOffset = new L.Point(0, -this._handled.getSize().y);

		this._updatePointer();

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	},

	_createPointer: function() {
		var handleLatLng = this._map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset)
			),
			topMiddleLatLng = this._map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(new L.Point(0, -Math.round(this._handled.getSize().y/2)))
			),
			handleLineOptions = L.extend(this._handled.options, {
				weight: Math.round(this._handled.options.weight/2)
			});

		this._pointer = new L.Polyline([handleLatLng, topMiddleLatLng], handleLineOptions);
	},

	_updatePointer: function() {
		var topMiddleLatLng = this._map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(new L.Point(0, -Math.round(this._handled.getSize().y/2)))
			);

		this._pointer.setLatLngs([
			this._textboxCoordsToLatLng(this._handleOffset),
			topMiddleLatLng
		]);
	}
});