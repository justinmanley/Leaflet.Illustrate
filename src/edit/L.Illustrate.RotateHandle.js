L.Illustrate.RotateHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'rotate'
	},

	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._createPointer();
	},

	onAdd: function(map) {
		L.Illustrate.EditHandle.prototype.onAdd.call(this, map);
		this._map.addLayer(this._pointer);
	},

	onRemove: function(map) {
		this._map.removeLayer(this._pointer);

		L.Illustrate.EditHandle.prototype.onRemove.call(this, map);
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			latlng = handle.getLatLng(),
			center = this._handled.getCenter(),
			point = this._map.latLngToLayerPoint(latlng).subtract(this._map.latLngToLayerPoint(center)),
			theta;

		if (point.y > 0) {
			theta = Math.PI - Math.atan(point.x / point.y);
		} else {
			theta = - Math.atan(point.x / point.y);
		}

		/* rotate the textbox */
		this._handled.setRotation(theta);

		this._handled.fire('illustrate:handledrag');
	},

	updateHandle: function() {
		this._handleOffset = new L.Point(0, -this._handled.getSize().y);

		this._updatePointer();

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	},

	_createPointer: function() {
		var map = this._handled._map,
			handleLatLng = map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset)
			),
			topMiddleLatLng = map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(new L.Point(0, -Math.round(this._handled.getSize().y/2)))
			),
			handleLineOptions = L.extend(this._handled.options, {
				weight: Math.round(this._handled.options.weight/2)
			});

		this._pointer = new L.Polyline([handleLatLng, topMiddleLatLng], handleLineOptions);
	},

	_updatePointer: function() {
		var topMiddleLatLng = this._map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(new L.Point(0, -Math.round(this._handled.getSize().y/2)))
			);

		this._pointer.setLatLngs([
			this._textboxCoordsToLatLng(this._handleOffset),
			topMiddleLatLng
		]);
	},

	/* Stops the pointer from jumping up/down on zoom in/out. */
	_animatePointerOnZoom: function(opt) {
		var map = this._handled._map,
			pointer = this._pointer._path,
			handleLatLng = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			),
			midpoint = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			);

		L.DomUtil.addClass(pointer, 'leaflet-path-zoom-separately');

		var scale = map.getZoomScale(opt.zoom),
			offset = - map._getCenterOffset(opt.center)._multiplyBy(-scale)._add(map._pathViewport.min);

		pointer.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset);

		this._pathZooming = true;

		this._pointer.setLatLngs([handleLatLng, midpoint]);
	},

	_initPointerAnimation: function(newCoords) {
		var map = this._handled._map,
			newPolyline = new L.Polyline(newCoords).addTo(map),
			newPath;

		this._pointerAnimation = document.createElementNS(L.Path.SVG_NS, 'animate');

		newPolyline._updatePath();

		newPath = newPolyline.getPathString();

		this._pointerAnimation.setAttribute("attributeName", "d");
		this._pointerAnimation.setAttribute("dur", "0.25s");
		this._pointerAnimation.setAttribute("values", this._pointer.getPathString() + "; " + newPath + ";");

		map.removeLayer(newPolyline);

		this._pointer._path.appendChild(this._pointerAnimation);
	},

	_disableDefaultZoom: function() {

	},

	_enableDefaultZoom: function() {

	},

	_bindListeners: function() {
		L.Illustrate.EditHandle.prototype._bindListeners.call(this);
		this._handled._map
			.on('zoomanim', this._animatePointerOnZoom, this)
			.on('zoomend', this._updatePointer, this);
	}
});