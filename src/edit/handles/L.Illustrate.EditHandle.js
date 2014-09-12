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
		L.setOptions(this, options);

		this._handleOffset = new L.Point(options.offset.x || 0, options.offset.y || 0);
		this._handled = shape;

		var latlng = this._handled._map.layerPointToLatLng(this._textboxCoordsToLayerPoint(
				this._handleOffset
			)),
			markerOptions = {
				draggable: true,
				icon: this.options.resizeIcon,
				zIndexOffset: 10
			};

		if (this._handled.getRotation) {
			markerOptions.rotation = this._handled.getRotation();
		}

		L.RotatableMarker.prototype.initialize.call(this, latlng, markerOptions);
	},

	onAdd: function(map) {
		L.RotatableMarker.prototype.onAdd.call(this, map);
		this._bindListeners();
	},

	onRemove: function(map) {
		this._unbindListeners();
		L.RotatableMarker.prototype.onRemove.call(this, map);
	},

	_animateZoom: function(opt) {
		var map = this._handled._map,
			handleLatLng = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			),
			pos = map._latLngToNewLayerPoint(handleLatLng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	updateHandle: function() {
		var rotation = this._handled.getRotation(),
			latlng = this._textboxCoordsToLatLng(this._handleOffset);

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
		this.on({
			'dragstart': this._onHandleDragStart,
			'drag': this._onHandleDrag,
			'dragend': this._onHandleDragEnd
		}, this);

		this._handled._map.on('zoomend', this.updateHandle, this);

		this._handled.on('rotate', this.updateHandle, this);
		this._handled.on('resize', this.updateHandle, this);
		this._handled.on('move', this.updateHandle, this);
	},

	_unbindListeners: function() {
		this.off({
			'dragstart': this._onHandleDragStart,
			'drag': this._onHandleDrag,
			'dragend': this._onHandleDragEnd
		}, this);

		this._handled._map.off('zoomend', this.updateHandle, this);
		this._handled.off('update', this.updateHandle, this);
	},

	_calculateRotation: function(point, theta) {
		return new L.Point(
			point.x*Math.cos(theta) - point.y*Math.sin(theta),
			point.y*Math.cos(theta) + point.x*Math.sin(theta)
		).round();
	},

	/* Perhaps this should be moved to L.Illustrate.Textbox? */
	_layerPointToTextboxCoords: function(point, opt) {
		var map = this._handled._map,
			rotation = this._handled.getRotation(),
			center = this._handled.getLatLng(),
			origin, textboxCoords;

		if (opt && opt.zoom && opt.center) {
			origin = map._latLngToNewLayerPoint(center, opt.zoom, opt.center);
		} else {
			origin = map.latLngToLayerPoint(center);
		}

		/* First need to translate to the textbox coordinates. */
		textboxCoords = point.subtract(origin);

		/* Then unrotate. */
		return this._calculateRotation(textboxCoords, - rotation);
	},

	/* Perhaps this should be moved to L.Illustrate.Textbox? */
	_textboxCoordsToLayerPoint: function(coord, opt) {
		var map = this._handled._map,
			rotation = this._handled.getRotation(),
			center = this._handled.getLatLng(),
			origin, rotated;

		if (opt && opt.zoom && opt.center) {
			origin = map._latLngToNewLayerPoint(center, opt.zoom, opt.center);
		} else {
			origin = map.latLngToLayerPoint(center);
		}

		/* First need to rotate the offset to obtain the layer point. */
		rotated = this._calculateRotation(coord, rotation);

		/* Then translate to layer coordinates. */
		return rotated.add(origin);
	},

	_latLngToTextboxCoords: function(latlng, opt) {
		var map = this._handled._map;

		return this._layerPointToTextboxCoords(map.latLngToLayerPoint(latlng), opt);
	},

	_textboxCoordsToLatLng: function(coord, opt) {
		var map = this._handled._map;

		return map.layerPointToLatLng(this._textboxCoordsToLayerPoint(coord, opt));
	}
	
});