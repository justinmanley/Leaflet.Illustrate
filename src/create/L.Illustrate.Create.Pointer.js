L.Illustrate.Create.Pointer = L.Draw.Polyline.extend({
	// Have *GOT* to refactor this.
	// Really, I should get the layer point position on click, not the latlng.  There's no need to be endlessly
	// translating between latlng and layerpoint.

	statics: {
		TYPE: 'pointer'
	},

	initialize: function(map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);

		this.type = L.Illustrate.Create.Pointer.TYPE;
	},

	_fireCreatedEvent: function() {
		var latlngs = this._poly.getLatLngs(),
			coordinates = [],
			origin = this._map.latLngToLayerPoint(latlngs[0]),
			pointer;

		for (var i = 0, length = latlngs.length; i < length; i++) {
			coordinates[i] = this._map.latLngToLayerPoint(latlngs[i])._subtract(origin);
		}

		pointer = new L.Illustrate.Pointer(latlngs[0], coordinates, this.options.shapeOptions);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, pointer);
	}
});