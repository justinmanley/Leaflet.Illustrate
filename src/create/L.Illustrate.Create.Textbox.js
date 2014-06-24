L.Illustrate.Create = L.Illustrate.Create || {};

L.Illustrate.Create.Textbox = L.Draw.Rectangle.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#0000EE',
			weight: 1,
			opacity: 1,
			fill: false,
			clickable: true,
			editable: true
		}
	},

	_drawShape: function(latlng) {
		L.Draw.Rectangle.prototype._drawShape.call(this, latlng);

		var startPoint = this._map.latLngToLayerPoint(latlng).round(),
			currentPoint = this._map.latLngToLayerPoint(this._startLatLng).round(),
			width = startPoint.x - currentPoint.x,
			height = startPoint.y - currentPoint.y;

		if (!this._textarea) {
			var textarea = new L.DivIcon({
				className: 'leaflet-illustrate-text-container',
				html: '<textarea style="height: '+height+'px; width: '+width+'px;"></textarea>',
				iconAnchor: [-1, -1]
			});
			this._textarea = new L.Marker(this._startLatLng, { icon: textarea });
			this._map.addLayer(this._textarea);
		} else {
			this._textarea._icon.children[0].style.width = width + "px";
			this._textarea._icon.children[0].style.height = height + "px";
		}
	}
});