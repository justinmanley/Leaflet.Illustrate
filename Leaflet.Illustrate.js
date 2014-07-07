(function(window, document, undefined) {

"use strict";

L.Illustrate = {};

if (L.DomUtil) {
	L.DomUtil.getRotateString = function(angle, units) {
		var is3d = L.Browser.webkit3d,
			open = 'rotate' + (is3d ? '3d' : '') + '(',
			rotateString = (is3d ? '0, 0, 1, ' : '') + angle + units;
			
		return open + rotateString + ')';
	};
}
if (L.DomUtil) {
	L.DomUtil.setTransform = function (el, point, angle, disable3D) {

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(point);
			el.style[L.DomUtil.TRANSFORM] = el.style[L.DomUtil.TRANSFORM] + " " + L.DomUtil.getRotateString(angle, 'rad');
		} else {
			// if 3d is disabled, then there is no rotation at all
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	};
}
L.Map.include({
	_newLayerPointToLatLng: function(point, newZoom, newCenter) {
		var topLeft = L.Map.prototype._getNewTopLeftPoint.call(this, newCenter, newZoom)
				.add(L.Map.prototype._getMapPanePos.call(this));
		return this.unproject(point.add(topLeft), newZoom);
	}
});
L.RotatableMarker = L.Marker.extend({
	initialize: function(latlng, options) {
		L.Marker.prototype.initialize.call(this, latlng, options);
		this.setRotation(options.rotation || 0);
	},

	setRotation: function(theta) {
		this._rotation = theta;
	},

	getRotation: function() {
		return this._rotation;
	},

	_setPos: function(pos) {
		L.DomUtil.setTransform(this._icon, pos, this._rotation);

		if (this._shadow) {
			L.DomUtil.setTransform(this._shadow, pos, this._rotation);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
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
		this._initTextbox();
	},

	_initTextbox: function() {
		var textarea = new L.DivIcon({
			className: 'leaflet-illustrate-textbox',
			html: '<textarea style="width: 100%; height: 100%"></textarea>',
			iconAnchor: new L.Point(0, 0)
		});
		this._textbox = new L.RotatableMarker(this._latlng, { icon: textarea, rotation: 0 });
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
		this._textbox.setRotation(theta % (2*Math.PI));
		this._textbox.update();
		return this;
	},

	getRotation: function() {
		return this._textbox.getRotation();
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
L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	addHooks: function() {
		L.Edit.SimpleShape.prototype.addHooks.call(this);

		this._bindRotateHandle();
		this._bindResizeHandles();
	},

	_bindRotateHandle: function() {
		this._rotateHandle = new L.Illustrate.RotateHandle(this._shape, {
			offset: new L.Point(0, this._shape.getSize().y)
		});
		this._markerGroup.addLayer(this._rotateHandle);
	},

	_bindMoveHandle: function() {

	},

	_bindResizeHandles: function() {
		var size = this._shape.getSize(),
			height = Math.round(size.y/2),
			width = Math.round(size.x/2),
			upperLeft = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(-width, height),
				corner: 'upper-left'
			}),
			upperRight = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(width, height),
				corner: 'upper-right'
			}),
			lowerLeft = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(-width, -height),
				corner: 'lower-left'
			}),
			lowerRight = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(width, -height),
				corner: 'lower-right'
			});

		this._resizeHandles = [ upperLeft, upperRight, lowerLeft, lowerRight ];

		for (var i = 0; i < this._resizeHandles.length; i++) {
			this._markerGroup.addLayer(this._resizeHandles[i]);
		}
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
L.Illustrate.EditHandle = L.RotatableMarker.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		})
	},

	initialize: function(shape, options) {
		this._offsetX = options.offset.x || 0;
		this._offsetY = options.offset.y || 0;
		this._handled = shape;

		var center = this._handled.getCenter(),
			centerPixelCoordinates = this._handled._map.latLngToLayerPoint(center),
			latlng = this._handled._map.layerPointToLatLng(this._calculateOffset(centerPixelCoordinates));

		L.RotatableMarker.prototype.initialize.call(this, latlng, {
			draggable: true,
			icon: this.options.resizeIcon,
			zIndexOffset: 10
		});

		this._bindListeners();
	},

	_animateZoom: function(opt) {
		var center = this._handled.getCenter(),
			newCenterPixelCoordinates = this._handled._map._latLngToNewLayerPoint(center, opt.zoom, opt.center),
			handleLatLng = this._handled._map._newLayerPointToLatLng(
				this._calculateOffset(newCenterPixelCoordinates),
				opt.zoom,
				opt.center
			),
			pos = this._map._latLngToNewLayerPoint(handleLatLng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	updateHandle: function() {
		var center = this._handled.getCenter(),
			rotation = this._handled.getRotation(),
			centerPixelCoordinates = this._map.latLngToLayerPoint(center),
			latlng = this._map.layerPointToLatLng(this._calculateOffset(centerPixelCoordinates));
		this.setRotation(rotation);
		this.setLatLng(latlng);
	},

	_onHandleDragStart: function() {
		this._handled.fire('editstart');
	},

	_onHandleDragEnd: function() {
		this._fireEdit();
	},

	_fireEdit: function() {
		this._handled.edited = true;
		this._handled.fire('edit');
	},

	_bindListeners: function() {
		this
			.on('dragstart', this._onHandleDragStart, this)
			.on('drag', this._onHandleDrag, this)
			.on('dragend', this._onHandleDragEnd, this);

		this._handled._map.on('zoomend', this.updateHandle, this);
		this._handled.on('illustrate:handledrag', this.updateHandle, this);
	},

	_calculateOffset: function(centerPixelCoordinates) {
		var rotation = this._handled.getRotation();
		return centerPixelCoordinates.add(this._rotate(new L.Point(this._offsetX, this._offsetY), rotation)).round();
	},

	_rotate: function(point, theta) {
		return new L.Point(
			point.x*Math.cos(theta) + point.y*Math.sin(theta),
			point.x*Math.sin(theta) - point.y*Math.cos(theta)
		);
	}
});
L.Illustrate.MoveHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'move'
	},

	_onHandleDrag: function() {

	}
});
L.Illustrate.ResizeHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'resize'
	},

	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._corner = options.corner;
		console.log(this._offsetX, this._offsetY);
	},

	_onHandleDrag: function(event) {
		// perhaps need to 'un-rotate the coordinates first?'
		// i.e. get the latLngPixelCoordinates, un-rotate, get offset.

		var handle = event.target,
			rotation = this._handled.getRotation(),
			latLngPixelCoordinates = this._map.latLngToLayerPoint(handle.getLatLng()),
			centerPixelCoordinates = this._map.latLngToLayerPoint(this._handled.getCenter()),
			pixelCoordinates = latLngPixelCoordinates.subtract(centerPixelCoordinates),
			offset = this._rotate(pixelCoordinates, -rotation).round();

		this._offsetX = (Math.abs(offset.x) > 10) ? offset.x : 10;
		this._offsetY = (Math.abs(offset.y) > 10) ? - offset.y : 10;

		console.log(this._offsetX, this._offsetY);

		// this._handled.setSize(new L.Point(2*Math.abs(this._offsetX), 2*Math.abs(this._offsetY)));

		this._handled.fire('illustrate:handledrag');
	},

	updateHandle: function() {
		var size = this._handled.getSize(),
			height = Math.round(size.y/2),
			width = Math.round(size.x/2);

		switch (this._corner) {
		case 'upper-left':
			this._offsetX = - width;
			this._offsetY = height;
			break;
		case 'upper-right':
			this._offsetX = width;
			this._offsetY = height;
			break;
		case 'lower-left':
			this._offsetX = - width;
			this._offsetY = - height;
			break;
		case 'lower-right':
			this._offsetX = width;
			this._offsetY = - height;
			break;
		}

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	}
});
L.Illustrate.RotateHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'rotate'
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

		// rotate the textbox
		this._handled.setRotation(theta);

		this._handled.fire('illustrate:handledrag');
	},

	updateHandle: function() {
		this._offsetY = this._handled.getSize().y;
		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	}
});

}(window, document));