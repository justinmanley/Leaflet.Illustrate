L.RotatableMarker = L.Marker.extend({

	options: {
		rotation: 0
	},

	initialize: function(latlng, options) {
		L.Marker.prototype.initialize.call(this, latlng, options);
		this.setRotation(this.options.rotation);
	},

	setRotation: function(theta) {
		this._rotation = theta;
		
		this.update();
		this.fire('rotate', { rotation: this._rotation });

		return this;
	},

	getRotation: function() {
		return this._rotation;
	},

	_setPos: function(pos) {
		L.DomUtil.setTransform(this._icon, pos, this._rotation);

		if (this._shadow) {
			L.DomUtil.setTransform(this._shadow, pos, this._rotation);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	}
});

L.rotatableMarker = function(latlng, options) {
	return new L.RotatableMarker(latlng, options);
};