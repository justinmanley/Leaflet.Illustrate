(function(window, document, undefined) {

"use strict";

L.Illustrate = {};

L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	includes: [L.Mixin.Events],

	options: {
		color: '#db1d0f'
	},

	initialize: function(latlng, options) {
		L.setOptions(this, options);
		this._latlng = latlng;
		this._rotation = 0;
		this._initTextbox();
	},

	_initTextbox: function() {
		var textarea = new L.DivIcon({
			className: 'leaflet-illustrate-textbox',
			html: '<textarea style="width: 100%; height: 100%"></textarea>',
			iconAnchor: new L.Point(0, 0)
		});
		this._textbox = new L.Marker(this._latlng, { icon: textarea });
	},

	onAdd: function(map) {
		this._map = map;

		this._map.addLayer(this._textbox);
		this._updateCenter();
		this._updateSize();

		this._enableTyping();

		L.DomUtil.addClass(this._textbox._icon.children[0], 'leaflet-illustrate-textbox-outlined');

		this.fire('add');
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function() {
		this._map.removeLayer(this._textbox);

		this.fire('remove');

		this._map = null;
		this._textbox = null;
	},

	setCenter: function(latlng) {
		this._latlng = latlng;

		this._updateLatLng();

		return this;
	},

	getCenter: function() {
		return this._latlng;
	},

	getSize: function() {
		return new L.Point(this._width, this._height);
	},

	setSize: function(size) {
		this._width = size.x;
		this._height = size.y;

		this._updateSize();

		return this;
	},

	setRotation: function(theta) {
		this._rotation = theta % (2*Math.PI);
		return this;
	},

	getRotation: function() {
		return this._rotation;
	},

	_updateCenter: function() {
		this._textbox.setLatLng(this._latlng);
	},

	setStyle: function() {
		// use this to change the styling of the textbox.  should accept an 'options' argument.
		return this;
	},

	_updateSize: function() {
		if (this._textbox._icon) {
			this._textbox._icon.style.marginTop = - Math.round(this._height/2) + "px";
			this._textbox._icon.style.marginLeft = - Math.round(this._width/2) + "px";
			this._textbox._icon.style.width = this._width + "px";
			this._textbox._icon.style.height = this._height + "px";
		}
	},

	_enableTyping: function() {
		var map = this._map,
			textarea = this._textbox._icon.children[0],
			mapDraggable;


		L.DomEvent.on(this._textbox._icon, 'click', function(event) {
			event.target.focus();
		});

		L.DomEvent.on(textarea, 'focus', function(event) {
			// not sure why this doesn't work
			L.DomUtil.enableTextSelection();
			L.DomEvent.off(event.target, 'selectstart', L.DomEvent.preventDefault);

			L.DomUtil.addClass(event.target, 'leaflet-illustrate-textbox-outlined');
			L.DomUtil.removeClass(event.target, 'leaflet-illustrate-textbox-hidden');

			mapDraggable = map.dragging.enabled();
			if (mapDraggable) {
				map.dragging.disable();
			}
		});

		L.DomEvent.on(textarea, 'blur', function(event) {
			// not sure why this doesn't work
			L.DomUtil.disableTextSelection();
			L.DomEvent.on(event.target, 'selectstart', L.DomEvent.preventDefault);

			L.DomUtil.addClass(event.target, 'leaflet-illustrate-textbox-hidden');
			L.DomUtil.removeClass(event.target, 'leaflet-illustrate-textbox-outlined');

			mapDraggable = map.dragging.enabled();
			if (!mapDraggable) {
				map.dragging.enable();
			}
		});
	}
});

L.Illustrate.Toolbar = L.DrawToolbar.extend({
	statics: {
		TYPE: 'illustrate'
	},

	options: {
		text: {}
	},

	getModeHandlers: function(map) {
		var illustrateModes = [{
			enabled: this.options.text,
			handler: new L.Illustrate.Create.Textbox(map, this.options.text),
			title: 'Add a textbox'
		}];
		return L.DrawToolbar.prototype.getModeHandlers(map).concat(illustrateModes);
	}
});

L.Illustrate.Control = L.Control.Draw.extend({
	initialize: function(options) {
		if (L.version < '0.7') {
			throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
		}

		L.Control.prototype.initialize.call(this, options);

		var toolbar;

		this._toolbars = {};

		// Initialize toolbars
		if (L.Illustrate.Toolbar && this.options.draw) {
			toolbar = new L.Illustrate.Toolbar(this.options.draw);

			this._toolbars[L.Illustrate.Toolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[L.Illustrate.Toolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}

		if (L.EditToolbar && this.options.edit) {
			toolbar = new L.EditToolbar(this.options.edit);

			this._toolbars[L.EditToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[L.EditToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}
	}
});

L.Map.addInitHook(function() {
	if (this.options.illustrateControl) {
		this.illustrateControl = new L.Illustrate.Control();
		this.addControl(this.illustrateControl);
	}
});
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
			center = new L.LatLngBounds(latlngs).getCenter(),
			corner = latlngs[1],
			oppositeCorner = latlngs[3],
			cornerPixelCoordinates = this._map.latLngToLayerPoint(corner).round(),
			oppositeCornerPixelCoordinates = this._map.latLngToLayerPoint(oppositeCorner).round(),
			width = oppositeCornerPixelCoordinates.x - cornerPixelCoordinates.x + 2,
			height = oppositeCornerPixelCoordinates.y - cornerPixelCoordinates.y + 2;

		var textbox = new L.Illustrate.Textbox(center, this.options.shapeOptions)
			.setSize(new L.Point(width, height));
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	}
});
L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	addHooks: function() {
		L.Edit.SimpleShape.prototype.addHooks.call(this);

		this._createRotateMarker();
	},

	_rotate: function(latlng) {
		var center = this._shape.getCenter(),
			point = this._map.latLngToLayerPoint(latlng).subtract(this._map.latLngToLayerPoint(center)),
			theta;

		if (point.y > 0) {
			theta = Math.PI - Math.atan(point.x / point.y);
		} else {
			theta = - Math.atan(point.x / point.y);
		}

		this._shape.setRotation(theta);
		this._updateRotateMarker();
	},

	_createRotateMarker: function() {
		this._updateRotateMarker();
		this._rotateMarker = this._createMarker(
			this._rotateHandleLatLng,
			this.options.resizeIcon,
			'rotate'
		);
	},

	_updateRotateMarker: function() {
		var center = this._shape.getCenter(),
			centerPixelCoordinates = this._map.latLngToLayerPoint(center),
			height = this._shape.getSize().y,
			rotation = this._shape.getRotation();
		this._rotateHandleLatLng = this._map.layerPointToLatLng(new L.Point(
			centerPixelCoordinates.x + height*Math.sin(rotation),
			centerPixelCoordinates.y - height*Math.cos(rotation)
		));

		if (this._rotateMarker) {
			this._rotateMarker.setLatLng(this._rotateHandleLatLng);
		}
	},

	_createMoveMarker: function() {

	},

	_createResizeMarker: function() {

	},

	_onMarkerDrag: function(event) {
		var marker = event.target,
			latlng = marker.getLatLng();

		switch (marker._handleType) {
		case 'rotate':
			this._rotate(latlng);
			break;

		case 'resize':
			console.log('hi');
			break;

		case 'move':
			console.log('hi');
			break;
		}
	},

	_onMarkerDragStart: function() {
		this._shape.fire('editstart');
	},

	_onMarkerDragEnd: function() {

	},

	_createMarker: function(latlng, icon, type) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10
		});
		marker._handleType = type;

		this._bindListeners(marker);
		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindListeners: function(marker) {
		marker
			.on('dragstart', this._onMarkerDragStart, this)
			.on('drag', this._onMarkerDrag, this)
			.on('dragend', this._onMarkerDragEnd, this);
	}

});

L.Illustrate.Textbox.addInitHook(function() {
	if (L.Illustrate.Edit.Textbox) {
		this.editing = new L.Illustrate.Edit.Textbox(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});

}(window, document));