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

			this._handles = new L.LayerGroup();
			this._map.addLayer(this._handles);

			for (i = 0; i < length; i++) {
				this._handles[i] = new L.Illustrate.PointerHandle(this._shape, {
					offset: coordinates[i],
					index: i
				}).addTo(this._map);
			}
		}
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