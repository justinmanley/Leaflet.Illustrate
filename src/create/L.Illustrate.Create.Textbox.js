L.Illustrate.Create = L.Illustrate.Create || {};

L.Illustrate.Create.Textbox = L.Draw.Rectangle.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			color: '#4387fd',
			weight: 2,
			fill: false,
			opacity: 1
		}
	},

	_fireCreatedEvent: function() {
		var latlngs = this._shape.getLatLngs(),
			nw = latlngs[1],
			anchor = this._map.layerPointToLatLng(this._map.latLngToLayerPoint(nw).add(new L.Point(5, 5))),
			oppositeCorner = latlngs[3],
			anchorPixelCoordinates = this._map.latLngToLayerPoint(nw).round(),
			oppositeCornerPixelCoordinates = this._map.latLngToLayerPoint(oppositeCorner).round(),
			width = oppositeCornerPixelCoordinates.x - anchorPixelCoordinates.x,
			height = oppositeCornerPixelCoordinates.y - anchorPixelCoordinates.y;

		var textbox = new L.Illustrate.Textbox(anchor, this.options.shapeOptions)
			.setSize(new L.Point(width, height));
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	}
});