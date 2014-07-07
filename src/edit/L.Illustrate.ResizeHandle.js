L.Illustrate.ResizeHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'resize'
	},

	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._corner = options.corner;
		console.log(this._offsetX, this._offsetY);
	},

	_onHandleDrag: function(event) {
		// perhaps need to 'un-rotate the coordinates first?'
		// i.e. get the latLngPixelCoordinates, un-rotate, get offset.

		var handle = event.target,
			rotation = this._handled.getRotation(),
			latLngPixelCoordinates = this._map.latLngToLayerPoint(handle.getLatLng()),
			centerPixelCoordinates = this._map.latLngToLayerPoint(this._handled.getCenter()),
			pixelCoordinates = latLngPixelCoordinates.subtract(centerPixelCoordinates),
			offset = this._rotate(pixelCoordinates, -rotation).round();

		this._offsetX = (Math.abs(offset.x) > 10) ? offset.x : 10;
		this._offsetY = (Math.abs(offset.y) > 10) ? - offset.y : 10;

		console.log(this._offsetX, this._offsetY);

		// this._handled.setSize(new L.Point(2*Math.abs(this._offsetX), 2*Math.abs(this._offsetY)));

		this._handled.fire('illustrate:handledrag');
	},

	updateHandle: function() {
		var size = this._handled.getSize(),
			height = Math.round(size.y/2),
			width = Math.round(size.x/2);

		switch (this._corner) {
		case 'upper-left':
			this._offsetX = - width;
			this._offsetY = height;
			break;
		case 'upper-right':
			this._offsetX = width;
			this._offsetY = height;
			break;
		case 'lower-left':
			this._offsetX = - width;
			this._offsetY = - height;
			break;
		case 'lower-right':
			this._offsetX = width;
			this._offsetY = - height;
			break;
		}

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	}
});