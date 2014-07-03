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
		this._offsetX = options.offsetX || 0;
		this._offsetY = options.offsetY || 0;
		this._handleType = options.type;
		this._handled = shape;
		this._zoom = this._handled._map.getZoom();

		var center = this._handled.getCenter(),
			rotation = this._handled.getRotation(),
			centerPixelCoordinates = this._handled._map.latLngToLayerPoint(center),
			latlng = this._handled._map.layerPointToLatLng(new L.Point(
				centerPixelCoordinates.x + this._offsetY*Math.sin(rotation),
				centerPixelCoordinates.y - this._offsetY*Math.cos(rotation)
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
			handleLatLng = this._handled._map._newLayerPointToLatLng(new L.Point(
				newCenterPixelCoordinates.x + this._offsetY*Math.sin(rotation),
				newCenterPixelCoordinates.y - this._offsetY*Math.cos(rotation)
			), opt.zoom, opt.center),
			pos = this._map._latLngToNewLayerPoint(handleLatLng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_update: function() {
		var center = this._handled.getCenter(),
			rotation = this._handled.getRotation(),
			centerPixelCoordinates = this._map.latLngToLayerPoint(center),
			latlng = this._map.layerPointToLatLng(new L.Point(
				centerPixelCoordinates.x + this._offsetY*Math.sin(rotation),
				centerPixelCoordinates.y - this._offsetY*Math.cos(rotation)
			));
		this.setLatLng(latlng);
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			latlng = handle.getLatLng();

		switch (this._handleType) {
		case 'rotate':
			var center = this._handled.getCenter(),
				point = this._map.latLngToLayerPoint(latlng).subtract(this._map.latLngToLayerPoint(center)),
				theta;

			if (point.y > 0) {
				theta = Math.PI - Math.atan(point.x / point.y);
			} else {
				theta = - Math.atan(point.x / point.y);
			}
			this._handled.setRotation(theta);
			this._update();
			break;

		case 'resize':
			console.log('hi');
			break;

		case 'move':
			console.log('hi');
			break;
		}
	},

	_onHandleDragStart: function() {
		this._handled.fire('editstart');
	},

	_onHandleDragEnd: function() {

	},

	_bindListeners: function() {
		this
			.on('dragstart', this._onHandleDragStart, this)
			.on('drag', this._onHandleDrag, this)
			.on('dragend', this._onHandleDragEnd, this);
		this._handled._map.on('zoomend', this._update, this);
	}
});