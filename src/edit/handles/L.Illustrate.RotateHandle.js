L.Illustrate.RotateHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'rotate'
	},

	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._createPointer();
	},

	onAdd: function(map) {
		L.Illustrate.EditHandle.prototype.onAdd.call(this, map);
		this._map.addLayer(this._pointer);
	},

	onRemove: function(map) {
		this._map.removeLayer(this._pointer);

		L.Illustrate.EditHandle.prototype.onRemove.call(this, map);
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			latlng = handle.getLatLng(),
			center = this._handled.getLatLng(),
			point = this._map.latLngToLayerPoint(latlng).subtract(this._map.latLngToLayerPoint(center)),
			theta;

		if (point.y > 0) {
			theta = Math.PI - Math.atan(point.x / point.y);
		} else {
			theta = - Math.atan(point.x / point.y);
		}

		/* rotate the textbox */
		this._handled.setRotation(theta);
	},

	updateHandle: function() {
		this._handleOffset = new L.Point(0, -this._handled.getSize().y);

		this._updatePointer();

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	},

	_createPointer: function() {
		var textarea = this._handled.getTextarea(),
			borderWidth = L.DomUtil.getStyle(textarea, 'border-width'),
			borderColor = L.DomUtil.getStyle(textarea, 'border-color'),
			options = {
				color: borderColor,
				weight: Math.round(borderWidth)
			};

		this._pointer = new L.Illustrate.Pointer(this._handled.getLatLng(), [], options);
		this._updatePointer();

		this._handled.on({ 'update': this._updatePointer }, this);
	},

	_updatePointer: function() {
		var map = this._handled._map,
			center = this._handled.getLatLng(),
			origin = map.latLngToLayerPoint(center);

		this._pointerStart = this._handleOffset.multiplyBy(0.5);

		this._pointer.setLatLng(center);
		this._pointer.setPoints([
			this._textboxCoordsToLayerPoint(this._pointerStart).subtract(origin),
			this._textboxCoordsToLayerPoint(this._handleOffset).subtract(origin)
		]);
	}
});