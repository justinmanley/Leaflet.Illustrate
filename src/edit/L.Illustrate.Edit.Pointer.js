L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Pointer = L.Edit.Poly.extend({
	initialize: function(shape, options) {
		L.Edit.Poly.prototype.initialize.call(this, shape, options);
		this._shape = shape;
	},

	addHooks: function() {
		if (this._shape._map) {
			this._map = this._shape._map;

			this._initHandles();
		}
	},

	removeHooks: function() {
		if (this._shape._map) {
			this._map.removeLayer(this._handleGroup);
			delete this._handleGroup;
		}
	},

	_initHandles: function() {
		if (!this._handleGroup) {
			var coordinates = this._shape.getPoints(),
				length = coordinates.length,
				i;

			/* Pointers are not rotatable, but EditHandles expect rotatable objects. */
			this._shape.getRotation = function() { return 0; };

			this._handleGroup = new L.FeatureGroup();
			this._map.addLayer(this._handleGroup);

			this._handles = [];

			for (i = 0; i < length; i++) {
				this._handles.push(this._createVertexHandle(i));

				if ( i < length - 1) {
					this._handles.push(this._createMidpointHandle(i));
				}
			}
		}
	},

	_removeVertex: function(handle) {
		var pointer = this._shape,
			coordinates = pointer.getPoints(),
			removedId = handle._id,
			i = this._handleIdToCoordIndex(removedId, handle._type),
			removed;

		if (i === 0 || i === coordinates.length - 1 ) {
			removed = [handle];
		} else {
			removed = pointer.editing._handles.splice(i, 3);
		}

		for (var j = 0, l = removed.length; j < l; j++) {
			this._handleGroup.removeLayer(removed[j]);
			delete removed[j];
		}

		/* Modify the path and redraw the pointer */
		coordinates.splice(i, 1);
		pointer.setPoints(coordinates);

		pointer.fire('edit:remove-vertex', { 'handle': handle, 'removedId': removedId });

		this._handles.splice(removedId - 1, 0, this._createMidpointHandle(i - 1));
	},

	_addVertex: function(handle) {
		var pointer = this._shape,
			coordinates = pointer.getPoints(),
			addedId = handle._id,
			i = this._handleIdToCoordIndex(addedId, handle._type),
			before, after;

		/* Modify the path and redraw the pointer. */
		coordinates.splice(i + 1, 0, L.point(handle._handleOffset));
		pointer.setPoints(coordinates);

		pointer.fire('edit:add-vertex', { 'handle': handle, 'addedId': addedId });

		before = this._createMidpointHandle(i);
		after = this._createMidpointHandle(i + 1);

		this._handles.splice(addedId, 0, before);
		this._handles.splice(addedId + 2, 0, after);
	},

	_updateVertex: function(handle) {
		var	pointer = this._shape,
			i = this._handleIdToCoordIndex(handle._id, handle._type);

		pointer._coordinates.splice(i, 1, L.point(handle._handleOffset));
		pointer.setPoints(pointer._coordinates);
		pointer.fire('edit:update-vertex', { 'handle': handle });
	},

	/* TODO: Move this into a subclass of L.Illustrate.PointerHandle */
	_createVertexHandle: function(index) {
		var coordinates = this._shape.getPoints(),
			vertexHandle = new L.Illustrate.PointerHandle(this._shape, {
				offset: coordinates[index],
				id: this._coordIndexToHandleId(index, 'vertex'),
				type: 'vertex'
			});

		this._handleGroup.addLayer(vertexHandle);

		return vertexHandle;
	},

	/* TODO: Move this into a subclass of L.Illustrate.PointerHandle */
	_createMidpointHandle: function(index) {
		var	midpointHandle = new L.Illustrate.PointerHandle(this._shape, {
				offset: this._calculateMidpoint(index, index + 1),
				id: this._coordIndexToHandleId(index, 'midpoint'),
				type: 'midpoint'
			});

		midpointHandle.setOpacity(0.6);
		this._handleGroup.addLayer(midpointHandle);

		return midpointHandle;
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
	},

	_coordIndexToHandleId: function(index, type) {
		var id;

		switch(type) {
		case 'vertex':
			id = index*2;
			break;
		case 'midpoint':
			id = index*2 + 1;
			break;
		}
		return id;
	},

	_calculateMidpoint: function(i, j) {
		var	coordinates = this._shape.getPoints(),
			v1 = coordinates[i],
			v2 = coordinates[j],
			delta = v2.subtract(v1).divideBy(2);

		return v1.add(delta);
	}
});

L.Illustrate.Pointer.addInitHook(function() {
	if (L.Illustrate.Edit.Pointer) {
		this.editing = new L.Illustrate.Edit.Pointer(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});