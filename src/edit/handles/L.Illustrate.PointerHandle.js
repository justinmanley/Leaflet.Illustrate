L.Illustrate.PointerHandle = L.Illustrate.EditHandle.extend({
	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._index = options.index;
		this._type = options.type;
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			coordinates = this._handled.getPoints();

		this._handleOffset = this._latLngToTextboxCoords(handle.getLatLng());

		switch(this._type) {
		case 'vertex':
			coordinates.splice(this._index, 1, this._handleOffset);
			break;
		case 'midpoint':
			coordinates.splice(this._index, 0, this._handleOffset);
			this._type = 'vertex';
			break;
		}

		this._handled.setPoints(coordinates);
	},

	_onHandleClick: function() {
		// var handle = event.target,
		// 	coordinates = this._handled.getPoints();

		// switch(this._type) {
		// case 'vertex':
		// 	break;
		// case 'midpoint':
		// 	break;
		// }
	},

	_bindListeners: function() {
		L.Illustrate.EditHandle.prototype._bindListeners.call(this);
		this.on('click', this._onHandleClick, this);
	},

	_unbindListeners: function() {
		L.Illustrate.EditHandle.prototype._unbindListeners.call(this);
		this.off('click', this._onHandleClick, this);
	}
});