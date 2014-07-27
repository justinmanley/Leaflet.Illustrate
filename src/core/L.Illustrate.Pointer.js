L.Illustrate.Pointer = L.Path.extend({

	options: {
		noClip: false
	},

	initialize: function(anchor, coordinates, options) {
		L.Path.prototype.initialize.call(this, options);

		this._coordinates = coordinates;
		this._latlng = anchor;
	},

	onAdd: function(map) {
		this._map = map;

		if(!this._container) {
			this._initElements();
			this._initEvents();
		}

		this._updatePath();

		if (this._container) {
			this._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'viewreset': this._updatePath,
			'moveend': this._updatePath
		}, this);
	},

	onRemove: function(map) {
		this._unbindPathRoot();
		this._pathRoot.parentNode.removeChild(this._pathRoot);

		map.off({
			'viewreset': this._updatePath,
			'moveend': this._updatePath
		}, this);

		this.fire('remove');

		this._map = null;
	},

	getLatLng: function() {
		return this._latlng;
	},

	setLatLng: function(latlng) {
		this._latlng = latlng;

		this._updatePath();

		return this;
	},

	getPoints: function() {
		return this._coordinates;
	},

	setPoints: function(points) {
		this._coordinates = points;

		this._updatePath();

		return this;
	},

	getPathString: function() {
		return L.Polyline.prototype.getPathString.call(this);
	},

	_getPathPartStr: function(points) {
		return L.Polyline.prototype._getPathPartStr.call(this, points);
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

	_clipPoints: function () {
		var points = this._layerPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},

	_updatePath: function() {
		if (!this._map) { return; }

		this._projectCoordinatesToLayerPoints();
		this._clipPoints();

		L.Path.prototype._updatePath.call(this);
	}
});