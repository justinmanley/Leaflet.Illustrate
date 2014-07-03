L.Illustrate.DragHandle = L.RotatableMarker.extend({
	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},
});