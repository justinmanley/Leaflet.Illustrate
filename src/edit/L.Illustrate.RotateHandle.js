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
		var map = this._handled._map,
			handleLatLng = map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset)
			),
			topMiddleLatLng = map.layerPointToLatLng(
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
	},

	/* Stops the pointer from jumping up/down on zoom in/out. */
	_animatePointerOnZoom: function(opt) {
		var map = this._handled._map,
			handleLatLng = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			),
			midpoint = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			);
		this._pointer.setLatLngs([handleLatLng, midpoint]);
	},

	_bindListeners: function() {
		L.Illustrate.EditHandle.prototype._bindListeners.call(this);
		this._handled._map
			.on('zoomend', this._updatePointer, this)
			// .on('zoomstart', this._animatePointerOnZoom, this)
			.on('zoomanim', this._animatePointerOnZoom, this);
	}
});