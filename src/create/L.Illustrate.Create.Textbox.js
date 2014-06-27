L.Illustrate.Create = L.Illustrate.Create || {};

L.Illustrate.Create.Textbox = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			color: '#000000',
			editable: true
		}
	},

	initialize: function(map, options) {
		this.type = L.Illustrate.Create.Textbox.TYPE;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function(latlng) {
		var bounds = new L.LatLngBounds(this._startLatLng, latlng),
			anchor = bounds.getCenter(),
			upperLeft = this._map.latLngToLayerPoint(bounds.getSouthWest()).round(),
			lowerRight = this._map.latLngToLayerPoint(bounds.getNorthEast()).round(),
			height = upperLeft.y - lowerRight.y,
			width = lowerRight.x - upperLeft.x;

		if (!this._shape) {
			this._shape = new L.Illustrate.Textbox(anchor, this.options.shapeOptions);
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
		if (textbox._textbox._icon) {
			console.log('textbox._textbox._icon exists at long last');
		}
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	}
});