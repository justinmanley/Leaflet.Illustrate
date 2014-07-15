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
		this._bindListeners();

		this._projectCoordinatesToLatLngs();
		this.projectLatlngs();
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

	_initElements: function() {
		this._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	// rewrite all
	_animateZoom: function(opt) {
		var offset = this._map._getCenterOffset(opt.center)._add(this._pathViewport.min);

		this._pathRoot.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset);

		this._pathZooming = true;
	},

	_projectCoordinatesToLatLngs: function() {
		var origin = this._map.latLngToLayerPoint(this._latlng),
			layerPoint;

		this._latlngs = [];

		for (var i = 0, length = this._coordinates.length; i < length; i++) {
			layerPoint = this._coordinates[i]._add(origin);
			this._latlngs[i] = this._map.layerPointToLatLng(layerPoint);
		}
	},

	_bindListeners: function() {
		this._map.on('zoomanim', this._animateZoom, this);
	},

	_initPathRoot: function() {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._map._panes.overlayPane.appendChild(this._pathRoot);
		}
		this._updateSvgViewport();
	},

	_updateSvgViewport: function() {
		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		L.Map.prototype._updatePathViewport.call(this._map);
		this._pathViewport = this._map._pathViewport;

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._pathRoot,
		    pane = this._map._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(root);
		}

		L.DomUtil.setPosition(root, min);
		root.setAttribute('width', width);
		root.setAttribute('height', height);
		root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(root);
		}
	}
});