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
			this._map.removeLayer(this._handles);
			delete this._handles;
		}
	},

	_initHandles: function() {
		if (!this._handles) {
			var coordinates = this._shape.getPoints(),
				length = coordinates.length,
				i;

			/* Pointers are not rotatable, but EditHandles expect rotatable objects. */
			this._shape.getRotation = function() { return 0; };

			this._handleGroup = new L.FeatureGroup();
			this._map.addLayer(this._handleGroup);

			this._handles = { vertex: [], midpoint: [] };

			for (i = 0; i < length; i++) {
				this._createVertexHandle(i);
			}

			for (i = 0; i < length - 1; i++) {
				this._createMidpointHandle(i);
			}
		}
	},

	_createVertexHandle: function(index) {
		var coordinates = this._shape.getPoints(),
			vertexHandle = new L.Illustrate.PointerHandle(this._shape, {
				offset: coordinates[index],
				index: index,
				type: 'vertex'
			});

		this._handleGroup.addLayer(vertexHandle);
		this._handles.vertex[index] = vertexHandle;
	},

	_createMidpointHandle: function(index) {
		var coordinates = this._shape.getPoints(),
			delta = coordinates[index+1].subtract(coordinates[index]).divideBy(2),
			midpointHandle = new L.Illustrate.PointerHandle(this._shape, {
				offset: coordinates[index].add(delta),
				index: index,
				type: 'midpoint'
			});

		midpointHandle.setOpacity(0.6);
		this._handleGroup.addLayer(midpointHandle);
		this._handles.midpoint[index] = midpointHandle;
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