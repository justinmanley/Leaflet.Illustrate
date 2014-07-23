L.Illustrate.Pointer = L.Illustrate.Pointer.extend({
	_initElements: function() {
		this._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	_animateZoom: function(opt) {
		var anchor = this._map.latLngToLayerPoint(this._latlng),
			newAnchor = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center),
			offset = newAnchor.subtract(anchor);

		this._pathRoot.style[L.DomUtil.TRANSFORM] =
			L.DomUtil.getTranslateString(this._pathViewport.min.add(offset));
		
		this._pathZooming = true;
	},

	_endZoom: function() {
		this._pathZooming = false;
	},

	_initPathRoot: function() {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._map._panes.overlayPane.appendChild(this._pathRoot);
		}

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');

			this._map.on({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoom
			}, this);
		} else {
			L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
		}

		this._map.on('moveend', this._updateSvgViewport, this);
		this._updateSvgViewport();
	},

	_unbindPathRoot: function() {
		this._map.off({
			'zoomanim': this._animateZoom,
			'zoomend': this._endZoom,
			'moveend': this._updateSvgViewport
		}, this);
	},

	_getPanePos: function() {
		return L.DomUtil.getPosition(this._pathRoot);
	},

	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this._map.getSize(),
		    panePos = this._map._getMapPanePos(),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	},

	_updateSvgViewport: function() {
		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    pane = this._map._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(this._pathRoot);
		}

		L.DomUtil.setPosition(this._pathRoot, min);
		this._pathRoot.setAttribute('width', width);
		this._pathRoot.setAttribute('height', height);
		this._pathRoot.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(this._pathRoot);
		}
	}
});