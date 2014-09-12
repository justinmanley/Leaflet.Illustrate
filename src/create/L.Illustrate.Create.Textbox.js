L.Illustrate.Create.Textbox = L.Draw.Rectangle.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		/* Set dynamically using this._setShapeOptions() */
		shapeOptions: {},

		/* Change these to match your CSS textbox styles. */
		textOptions: {
			borderColor: '#4387fd',
			borderWidth: 2
		}
	},

	initialize: function(map, options) {
		this.options.textOptions = L.extend({}, this.options.textOptions, options);
		this._setShapeOptions();

		/* 
		 * A <textarea> element can only be drawn from upper-left to lower-right. 
		 * Implement drawing using L.Draw.Rectangle so that a textbox can be drawn in any direction,
		 * then return a L.Illustrate.Textbox instance once drawing is complete.
		 */
		L.Draw.Rectangle.prototype.initialize.call(this, map, options);

		this.type = L.Illustrate.Create.Textbox.TYPE;
	},

	_fireCreatedEvent: function() {
		var latlngs = this._shape.getLatLngs(),
			center = new L.LatLngBounds(latlngs).getCenter(),
			corner = latlngs[1],
			oppositeCorner = latlngs[3],
			cornerPixelCoordinates = this._map.latLngToLayerPoint(corner).round(),
			oppositeCornerPixelCoordinates = this._map.latLngToLayerPoint(oppositeCorner).round(),
			width = oppositeCornerPixelCoordinates.x - cornerPixelCoordinates.x + 2,
			height = oppositeCornerPixelCoordinates.y - cornerPixelCoordinates.y + 2;

		var textbox = new L.Illustrate.Textbox(center, this.options.textOptions)
			.setSize(new L.Point(width, height));

		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	},

	_setShapeOptions: function() {
		/* shapeOptions are set dynamically so that the Rectangle looks the same as the Textbox. */
		var borderWidth = this.options.textOptions.borderWidth ?
						  this.options.textOptions.borderWidth :
						  2,
			borderColor = this.options.textOptions.borderColor ?
			              this.options.textOptions.borderColor :
			              '#4387fd';

		this.options.shapeOptions = L.extend({}, this.options.shapeOptions, {
			weight: borderWidth,
			color: borderColor,
			fill: false,
			opacity: 1
		});
	}
});