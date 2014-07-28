L.Illustrate.PointerHandle = L.Illustrate.EditHandle.extend({
	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._id = options.id;
		this._type = options.type;
	},

	_onHandleDrag: function() {
		var edit = this._handled.editing;

		this._handleOffset = this._latLngToTextboxCoords(this.getLatLng());

		switch(this._type) {
		case 'vertex':
			edit._updateVertex(this);
			break;
		case 'midpoint':
			edit._addVertex(this);
			break;
		}
	},

	// _onHandleClick: function(event) {
	// 	var handle = event.target;

	// 	this._handleOffset = this._latLngToTextboxCoords(handle.getLatLng());

	// 	switch(this._type) {
	// 	case 'vertex':
	// 		this._handled._removeVertex(this._id);
	// 		break;
	// 	case 'midpoint':
	// 		this._type = 'vertex';
	// 		this.setOpacity(1);
	// 		this._handled._addVertex(this._id, this._handleOffset);
	// 		break;
	// 	}
	// },

	_bindListeners: function() {
		L.Illustrate.EditHandle.prototype._bindListeners.call(this);
		this.on('click', this._onHandleClick, this);
		this._handled.on({
			'edit:remove-vertex': this._onVertexRemove,
			'edit:add-vertex': this._onVertexAdd,
			'edit:update-vertex': this._onVertexUpdate
		}, this);
	},

	_unbindListeners: function() {
		L.Illustrate.EditHandle.prototype._unbindListeners.call(this);
		this.off('click', this._onHandleClick, this);
		this._handled.off({
			'edit:remove-vertex': this._onVertexRemove,
			'edit:add-vertex': this._onVertexAdd,
			'edit:update-vertex': this._onVertexUpdate
		}, this);
	},

	_onVertexAdd: function() {

	},

	_onVertexRemove: function() {

	},

	_onVertexUpdate: function(event) {
		var edit = this._handled.editing,
			updated = event.handle,
			id = updated._id,
			i = edit._handleIdToCoordIndex(id, updated._type),
			pointer = this._handled,
			origin = pointer._map.latLngToLayerPoint(pointer.getLatLng()),
			midpoint, latlng;

		/* Update the positions of the two adjacent 'midpoint' handles. */
		if ((this._id === id - 1) && i > 0) {
			midpoint = edit._calculateMidpoint(i - 1, i).add(origin);
			latlng = pointer._map.layerPointToLatLng(midpoint);
			this.setLatLng(latlng);
		} else if ((this._id === id + 1) && i + 1 < pointer.getPoints().length) {
			midpoint = edit._calculateMidpoint(i, i + 1).add(origin);
			latlng = pointer._map.layerPointToLatLng(midpoint);
			this.setLatLng(latlng);
		}
	}
});