L.Illustrate.Pointer = L.Polyline.extend({
	initialize: function(coordinates, anchor, options) {
		L.Path.prototype.initialize.call(options);

		this._coordinates = coordinates;
		this._latlng = anchor;
	},

	onAdd: function(map) {
		this._map = map;

		if(!this._container) {
			this._initElements();
			this._initEvents();
		}

		this._projectCoordinatesToLayerPoints();
		this._updatePath();

		if (this._container) {
			this._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'moveend': this._updatePath
		}, this);
	},


	getLatLng: function() {
		return this._latlng;
	},

	getPoints: function() {
		return this._coordinates;
	},

	_getLatLngs: function() {
		var origin = this._map.latLngToLayerPoint(this._latlng),
			latlngs = [];

		for (var i = 0, l = this._coordinates.length; i < l; i++) {
			latlngs[i] = this._map.layerPointToLatLng(this._coordinates[i].add(origin));
		}

		return latlngs;
	},

	_projectCoordinatesToLayerPoints: function() {
		var origin = this._map.latLngToLayerPoint(this._latlng),
			layerPoint;

		this._layerPoints = [];

		for (var i = 0, length = this._coordinates.length; i < length; i++) {
			layerPoint = this._coordinates[i].add(origin);
			this._layerPoints[i] = layerPoint;
		}
	},

	_updatePath: function() {
		this._projectCoordinatesToLayerPoints();
		this._originalPoints = this._layerPoints;
		L.Polyline.prototype._updatePath.call(this);
	}
});