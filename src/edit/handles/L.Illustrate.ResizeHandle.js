L.Illustrate.ResizeHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'resize'
	},

	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._corner = options.corner;
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			offset = this._getOffset(handle.getLatLng());

		this._handled.setSize(offset.abs().multiplyBy(2).round());
	},

	_getOffset: function(latlng) {
		var coord = this._latLngToTextboxCoords(latlng),
			minOffset = this._handled._minSize.divideBy(2),
			x = (Math.abs(coord.x) < minOffset.x) ? minOffset.x : coord.x,
			y = (Math.abs(coord.y) < minOffset.y) ? minOffset.y : coord.y;

		return new L.Point(x,y);
	},

	updateHandle: function() {
		var size = this._handled.getSize(),
			height = Math.round(size.y/2),
			width = Math.round(size.x/2);

		switch (this._corner) {
		case 'upper-left':
			this._handleOffset = new L.Point(-width, height);
			break;
		case 'upper-right':
			this._handleOffset = new L.Point(width, height);
			break;
		case 'lower-left':
			this._handleOffset = new L.Point(-width, -height);
			break;
		case 'lower-right':
			this._handleOffset = new L.Point(width, -height);
			break;
		}

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	}
});