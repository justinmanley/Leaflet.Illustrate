L.Illustrate.PointerHandle = L.Illustrate.EditHandle.extend({
	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._id = options.id;
		this._type = options.type;
	},

	_onHandleDrag: function() {
		this._handleOffset = this._latLngToTextboxCoords(this.getLatLng());

		switch(this._type) {
		case 'vertex':
			this._handled._updateVertex(this._id, this._handleOffset);
			break;
		case 'midpoint':
			this._handled._addVertex(this._id, this._handleOffset);
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
		var id = event.id,
			i = this._handleIdToCoordIndex(id, 'vertex'),
			pointer = this._handled,
			origin = pointer._map.latLngToLayerPoint(pointer.getLatLng()),
			midpoint, latlng;

		/* Update the positions of the two adjacent 'midpoint' handles. */
		if ((this._id === id - 1) && i > 0) {
			midpoint = pointer._calculateMidpoint(i - 1, i).add(origin);
			latlng = pointer._map.layerPointToLatLng(midpoint);
			this.setLatLng(latlng);
		} else if ((this._id === id + 1) && i + 1 < pointer.getPoints().length) {
			midpoint = pointer._calculateMidpoint(i, i + 1).add(origin);
			latlng = pointer._map.layerPointToLatLng(midpoint);
			this.setLatLng(latlng);
		}
	},

	_handleIdToCoordIndex: function(id, type) {
		var index;

		switch(type) {
		case 'vertex':
			index = id/2;
			break;
		case 'midpoint':
			index = (id - 1)/2;
			break;
		}
		return index;
	}
});

L.Illustrate.Pointer.include({
	_calculateMidpoint: function(i, j) {
		var	coordinates = this.getPoints(),
			v1 = coordinates[i],
			v2 = coordinates[j],
			delta = v2.subtract(v1).divideBy(2);

		return v1.add(delta);
	},

	_removeVertex: function(id) {
		this._coordinates.splice(id, 1);
		this.setPoints(this._coordinates);
		this.fire('edit:remove-vertex', { id: id });
	},

	_addVertex: function(id, coord) {
		this._coordinates.splice(id, 0, L.point(coord));
		this.setPoints(this._coordinates);
		this.fire('edit:add-vertex', { id: id, coord: coord });
	},

	_updateVertex: function(id, coord) {
		var	i = id/2;

		this._coordinates.splice(i, 1, L.point(coord));
		this.setPoints(this._coordinates);
		this.fire('edit:update-vertex', { id: id, coord: coord });
	}
});