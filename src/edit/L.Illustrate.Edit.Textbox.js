L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	addHooks: function() {
		L.Edit.SimpleShape.prototype.addHooks.call(this);

		this._createRotateMarker();
	},

	_rotate: function(latlng) {
		var center = this._shape.getCenter(),
			point = this._map.latLngToLayerPoint(latlng).subtract(this._map.latLngToLayerPoint(center)),
			theta;

		if (point.y > 0) {
			theta = Math.PI - Math.atan(point.x / point.y);
		} else {
			theta = - Math.atan(point.x / point.y);
		}

		this._shape.setRotation(theta);
		this._updateRotateMarker();
	},

	_createRotateMarker: function() {
		this._updateRotateMarker();
		this._rotateMarker = this._createMarker(
			this._rotateHandleLatLng,
			this.options.resizeIcon,
			'rotate'
		);
	},

	_updateRotateMarker: function() {
		var center = this._shape.getCenter(),
			centerPixelCoordinates = this._map.latLngToLayerPoint(center),
			height = this._shape.getSize().y,
			rotation = this._shape.getRotation();
		this._rotateHandleLatLng = this._map.layerPointToLatLng(new L.Point(
			centerPixelCoordinates.x + height*Math.sin(rotation),
			centerPixelCoordinates.y - height*Math.cos(rotation)
		));

		if (this._rotateMarker) {
			this._rotateMarker.setLatLng(this._rotateHandleLatLng);
		}
	},

	_createMoveMarker: function() {

	},

	_createResizeMarker: function() {

	},

	_onMarkerDrag: function(event) {
		var marker = event.target,
			latlng = marker.getLatLng();

		switch (marker._handleType) {
		case 'rotate':
			this._rotate(latlng);
			break;

		case 'resize':
			console.log('hi');
			break;

		case 'move':
			console.log('hi');
			break;
		}
	},

	_onMarkerDragStart: function() {
		this._shape.fire('editstart');
	},

	_onMarkerDragEnd: function() {

	},

	_createMarker: function(latlng, icon, type) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10
		});
		marker._handleType = type;

		this._bindListeners(marker);
		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindListeners: function(marker) {
		marker
			.on('dragstart', this._onMarkerDragStart, this)
			.on('drag', this._onMarkerDrag, this)
			.on('dragend', this._onMarkerDragEnd, this);
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