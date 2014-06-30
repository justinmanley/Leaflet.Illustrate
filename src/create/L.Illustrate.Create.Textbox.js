L.Illustrate.Create = L.Illustrate.Create || {};

L.Illustrate.Create.Textbox = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			color: '#000000'
		}
	},

	initialize: function(map, options) {
		this.type = L.Illustrate.Create.Textbox.TYPE;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function(latlng) {
		var startPixelCoordinates = this._map.latLngToLayerPoint(this._startLatLng).round(),
			latlngPixelCoordinates = this._map.latLngToLayerPoint(latlng).round(),
			width = latlngPixelCoordinates.x - startPixelCoordinates.x,
			height = latlngPixelCoordinates.y - startPixelCoordinates.y;

		if (!this._shape) {
			this._shape = new L.Illustrate.Textbox(this._startLatLng, this.options.shapeOptions);
			this._map.addLayer(this._shape);
		}

		this._shape.setSize(new L.Point(width, height));
	},

	_fireCreatedEvent: function() {
		/* 
		 * Need to create a new textbox because *this* is destroyed on when this.disable() 
		 * is called from L.Draw.SimpleShape._fireCreatedEvent.
		 */

		var textbox = new L.Illustrate.Textbox(this._shape.getLatLng(), this.options.shapeOptions)
			.setSize(this._shape.getSize());
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	}
});