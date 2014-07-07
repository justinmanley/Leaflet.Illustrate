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
		this._offsetX = options.offset.x || 0;
		this._offsetY = options.offset.y || 0;
		this._handled = shape;

		var center = this._handled.getCenter(),
			centerPixelCoordinates = this._handled._map.latLngToLayerPoint(center),
			latlng = this._handled._map.layerPointToLatLng(this._calculateOffset(centerPixelCoordinates));

		L.RotatableMarker.prototype.initialize.call(this, latlng, {
			draggable: true,
			icon: this.options.resizeIcon,
			zIndexOffset: 10
		});

		this._bindListeners();
	},

	_animateZoom: function(opt) {
		var center = this._handled.getCenter(),
			newCenterPixelCoordinates = this._handled._map._latLngToNewLayerPoint(center, opt.zoom, opt.center),
			handleLatLng = this._handled._map._newLayerPointToLatLng(
				this._calculateOffset(newCenterPixelCoordinates),
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
			latlng = this._map.layerPointToLatLng(this._calculateOffset(centerPixelCoordinates));
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

	_calculateOffset: function(centerPixelCoordinates) {
		var rotation = this._handled.getRotation();
		return centerPixelCoordinates.add(this._rotate(new L.Point(this._offsetX, this._offsetY), rotation)).round();
	},

	_rotate: function(point, theta) {
		return new L.Point(
			point.x*Math.cos(theta) + point.y*Math.sin(theta),
			point.x*Math.sin(theta) - point.y*Math.cos(theta)
		);
	}
});