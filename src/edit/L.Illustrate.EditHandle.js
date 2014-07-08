L.Illustrate.EditHandle = L.RotatableMarker.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		})
	},

	initialize: function(shape, options) {
		this._handleOffset = new L.Point(options.offset.x || 0, options.offset.y || 0);
		this._handled = shape;

		var rotation = this._handled.getRotation(),
			center = this._handled.getCenter(),
			centerPixelCoordinates = this._handled._map.latLngToLayerPoint(center),
			latlng = this._handled._map.layerPointToLatLng(
				this._offsetToLayerPoint(centerPixelCoordinates, this._handleOffset, rotation)
			);

		L.RotatableMarker.prototype.initialize.call(this, latlng, {
			draggable: true,
			icon: this.options.resizeIcon,
			zIndexOffset: 10
		});

		this._bindListeners();
	},

	_animateZoom: function(opt) {
		var center = this._handled.getCenter(),
			rotation = this._handled.getRotation(),
			newCenterPixelCoordinates = this._handled._map._latLngToNewLayerPoint(center, opt.zoom, opt.center),
			handleLatLng = this._handled._map._newLayerPointToLatLng(
				this._offsetToLayerPoint(newCenterPixelCoordinates, this._handleOffset, rotation),
				opt.zoom,
				opt.center
			),
			pos = this._map._latLngToNewLayerPoint(handleLatLng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	updateHandle: function() {
		var center = this._handled.getCenter(),
			rotation = this._handled.getRotation(),
			centerPixelCoordinates = this._map.latLngToLayerPoint(center),
			latlng = this._map.layerPointToLatLng(this._offsetToLayerPoint(centerPixelCoordinates, this._handleOffset, rotation));
		this.setRotation(rotation);
		this.setLatLng(latlng);
	},

	_onHandleDragStart: function() {
		this._handled.fire('editstart');
	},

	_onHandleDragEnd: function() {
		this._fireEdit();
	},

	_fireEdit: function() {
		this._handled.edited = true;
		this._handled.fire('edit');
	},

	_bindListeners: function() {
		this
			.on('dragstart', this._onHandleDragStart, this)
			.on('drag', this._onHandleDrag, this)
			.on('dragend', this._onHandleDragEnd, this);

		this._handled._map.on('zoomend', this.updateHandle, this);
		this._handled.on('illustrate:handledrag', this.updateHandle, this);
	},

	_offsetToLayerPoint: function(centerPixelCoordinates, offset, rotation) {
		return centerPixelCoordinates.add(this._calculateRotation(offset, rotation)).round();
	},

	_calculateRotation: function(point, theta) {
		return new L.Point(
			point.x*Math.cos(theta) + point.y*Math.sin(theta),
			point.x*Math.sin(theta) - point.y*Math.cos(theta)
		);
	},

	/* Should return the offset corresponding to the latlng. */
	_calculateResizeOffset: function(latlng, min) {
		var rotation = this._handled.getRotation(),
			latLngPixelCoordinates = this._map.latLngToLayerPoint(latlng),
			centerPixelCoordinates = this._map.latLngToLayerPoint(this._handled.getCenter()),
			pixelCoordinates = latLngPixelCoordinates.subtract(centerPixelCoordinates),
			offset = this._calculateRotation(pixelCoordinates, -rotation),
			x = (Math.abs(offset.x) > min.x) ? offset.x : min.x,
			y = (Math.abs(offset.y) > min.y) ? - offset.y : min.y;

		return new L.Point(x, y).round();
	}
});