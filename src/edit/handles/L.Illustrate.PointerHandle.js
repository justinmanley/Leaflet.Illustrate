L.Illustrate.PointerHandle = L.Illustrate.EditHandle.extend({
	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);

		if (this._handled.editing) {
			this._editing = this._handled.editing;
		}

		this._id = options.id;
		this._type = options.type;
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			edit = this._editing;

		this._handleOffset = this._latLngToTextboxCoords(this.getLatLng());

		switch(handle._type) {
		case 'vertex':
			edit._updateVertex(handle);
			break;
		case 'midpoint':
			edit._addVertex(handle);
			break;
		}
	},

	_onHandleClick: function(event) {
		var handle = event.target,
			edit = this._editing;

		this._handleOffset = this._latLngToTextboxCoords(handle.getLatLng());

		switch(this._type) {
		case 'vertex':
			edit._removeVertex(handle);
			break;
		case 'midpoint':
			edit._addVertex(handle);
			break;
		}
	},

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

	_onVertexAdd: function(event) {
		var id = event.addedId;

		if (this._id === id) {
			this._id += 1;
			this._type = 'vertex';
			this.setOpacity(1);
		} else if (this._id > id) {
			this._id += 2;
		}
	},

	_onVertexRemove: function(event) {
		var id = event.removedId;

		if (this._id > id + 1) {
			this._id -= 2;
		}
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