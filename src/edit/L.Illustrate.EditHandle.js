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
			latlng = this._handled._map.layerPointToLatLng(this._offsetToLayerPoint(
				this._handleOffset, rotation
			));

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
			rotated = this._calculateRotation(this._handleOffset, rotation),
			handleLatLng = this._handled._map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(rotated, newCenterPixelCoordinates),
				opt.zoom,
				opt.center
			),
			pos = this._map._latLngToNewLayerPoint(handleLatLng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	updateHandle: function() {
		var rotation = this._handled.getRotation(),
			latlng = this._map.layerPointToLatLng(this._offsetToLayerPoint(this._handleOffset, rotation));

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

	_calculateRotation: function(point, theta) {
		return new L.Point(
			point.x*Math.cos(theta) - point.y*Math.sin(theta),
			point.y*Math.cos(theta) + point.x*Math.sin(theta)
		).round();
	},

	_offsetToLayerPoint: function(offset, rotation) {
		var	rotated = this._calculateRotation(offset, rotation);

		return this._textboxCoordsToLayerPoint(rotated);
	},

	_layerPointToTextboxCoords: function(point, center) {
		var map = this._handled._map,
			centerPixelCoordinates = map.latLngToLayerPoint(this._handled.getCenter()),
			origin = center ? center : centerPixelCoordinates;

		return point.subtract(origin);
	},

	_textboxCoordsToLayerPoint: function(coord, center) {
		var map = this._handled._map,
			centerPixelCoordinates = map.latLngToLayerPoint(this._handled.getCenter()),
			origin = center ? center : centerPixelCoordinates;

		return coord.add(origin);
	},

	_latLngToOffset: function(latlng) {
		var theta = this._handled.getRotation(),

			/* Get the layer point from the latlng. */
			layerPoint = this._map.latLngToLayerPoint(latlng),

			/* Translate the layer point into coordinates with the origin at the center of the textbox. */
			textboxCoord = this._layerPointToTextboxCoords(layerPoint),

			/* Unrotate the point. */
			offset = this._calculateRotation(textboxCoord, -theta),
			minSize = this._handled._minSize,
			x = (Math.abs(offset.x) > minSize.x) ? offset.x : minSize.x,
			y = (Math.abs(offset.y) > minSize.y) ? -offset.y : minSize.y;

		return new L.Point(x, y).round();
	}
});