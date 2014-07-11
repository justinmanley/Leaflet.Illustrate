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
if (L.Point) {
	L.Point.prototype._abs =  function() {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	};
	L.Point.prototype.abs = function() {
		return this.clone()._abs();
	};
}
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
			opacity: 1,
			minWidth: 10,
			minHeight: 10
		}
	},

	initialize: function(map, options) {
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
		this._minSize = new L.Point(this.options.minWidth, this.options.minHeight);
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

		this._updateCenter();

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

L.Illustrate.Toolbar = L.Toolbar.extend({
	statics: {
		TYPE: 'illustrate'
	},

	options: {
		textbox: {}
	},

	initialize: function(options) {
		// Ensure that the options are merged correctly since L.extend is only shallow
		for (var type in this.options) {
			if (this.options.hasOwnProperty(type)) {
				if (options[type]) {
					options[type] = L.extend({}, this.options[type], options[type]);
				}
			}
		}

		this._toolbarClass = 'leaflet-illustrate-create';
		L.Toolbar.prototype.initialize.call(this, options);
	},

	getModeHandlers: function(map) {
		return [{
			enabled: this.options.textbox,
			handler: new L.Illustrate.Create.Textbox(map, this.options.textbox),
			title: 'Add a textbox'
		}];
	},

	getActions: function() {
		return [];
	},

	setOptions: function (options) {
		L.setOptions(this, options);

		for (var type in this._modes) {
			if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
				this._modes[type].handler.setOptions(options[type]);
			}
		}
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
L.Illustrate.tooltipText = {
	create: {
		toolbar: {
			actions: {

			},
			undo: {

			},
			buttons: {

			}
		},
		handlers: {

		}
	},

	edit: {
		toolbar: {
			actions: {

			},
			undo: {

			},
			buttons: {

			}
		},
		handlers: {
			textbox: {
				tooltip: {
					start: ''
				}
			}
		}
	}
};
L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	addHooks: function() {
		L.Edit.SimpleShape.prototype.addHooks.call(this);

		this._addRotateHandle();
		this._addResizeHandles();
		this._addMoveHandle();
	},

	removeHooks: function() {
		L.Edit.SimpleShape.prototype.removeHooks.call(this);
	},

	_addRotateHandle: function() {
		this._rotateHandle = new L.Illustrate.RotateHandle(this._shape, {
			offset: new L.Point(0, -this._shape.getSize().y)
		});
		this._markerGroup.addLayer(this._rotateHandle);
	},

	_addMoveHandle: function() {
		this._moveHandle = new L.Illustrate.MoveHandle(this._shape, {
			offset: new L.Point(0,0)
		});
		this._markerGroup.addLayer(this._moveHandle);
	},

	_addResizeHandles: function() {
		var size = this._shape.getSize(),
			height = Math.round(size.y/2),
			width = Math.round(size.x/2),
			upperLeft = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(-width, -height),
				corner: 'upper-left'
			}),
			upperRight = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(width, -height),
				corner: 'upper-right'
			}),
			lowerLeft = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(-width, height),
				corner: 'lower-left'
			}),
			lowerRight = new L.Illustrate.ResizeHandle(this._shape, {
				offset: new L.Point(width, height),
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
		this._handleOffset = new L.Point(options.offset.x || 0, options.offset.y || 0);
		this._handled = shape;

		var latlng = this._handled._map.layerPointToLatLng(this._textboxCoordsToLayerPoint(
				this._handleOffset
			));

		L.RotatableMarker.prototype.initialize.call(this, latlng, {
			draggable: true,
			icon: this.options.resizeIcon,
			zIndexOffset: 10
		});

		this._bindListeners();
	},

	_animateZoom: function(opt) {
		var map = this._handled._map,
			handleLatLng = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			),
			pos = map._latLngToNewLayerPoint(handleLatLng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	updateHandle: function() {
		var rotation = this._handled.getRotation(),
			latlng = this._handled._map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset)
			);

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

	_calculateRotation: function(point, theta) {
		return new L.Point(
			point.x*Math.cos(theta) - point.y*Math.sin(theta),
			point.y*Math.cos(theta) + point.x*Math.sin(theta)
		).round();
	},

	_layerPointToTextboxCoords: function(point, opt) {
		var map = this._handled._map,
			rotation = this._handled.getRotation(),
			center = this._handled.getCenter(),
			origin, textboxCoords;

		if (opt && opt.zoom && opt.center) {
			origin = map._latLngToNewLayerPoint(center, opt.zoom, opt.center);
		} else {
			origin = map.latLngToLayerPoint(center);
		}

		/* First need to translate to the textbox coordinates. */
		textboxCoords = point.subtract(origin);

		/* Then unrotate. */
		return this._calculateRotation(textboxCoords, - rotation);
	},

	_textboxCoordsToLayerPoint: function(coord, opt) {
		var map = this._handled._map,
			rotation = this._handled.getRotation(),
			center = this._handled.getCenter(),
			origin, rotated;

		if (opt && opt.zoom && opt.center) {
			origin = map._latLngToNewLayerPoint(center, opt.zoom, opt.center);
		} else {
			origin = map.latLngToLayerPoint(center);
		}

		/* First need to rotate the offset to obtain the layer point. */
		rotated = this._calculateRotation(coord, rotation);

		/* Then translate to layer coordinates. */
		return rotated.add(origin);
	},

	_latLngToTextboxCoords: function(latlng, opt) {
		var map = this._handled._map;

		return this._layerPointToTextboxCoords(map.latLngToLayerPoint(latlng), opt);
	},

	_textboxCoordsToLatLng: function(coord, opt) {
		var map = this._handled._map;

		return map.layerPointToLatLng(this._textboxCoordsToLayerPoint(coord, opt));
	},

	_latLngToOffset: function(latlng) {
		var offset = this._latLngToTextboxCoords(latlng),
			minSize = this._handled._minSize,
			x = (Math.abs(offset.x) > minSize.x) ? offset.x : minSize.x,
			y = (Math.abs(offset.y) > minSize.y) ? -offset.y : minSize.y;

		return new L.Point(x, y).round();
	}
});
L.Illustrate.MoveHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'move'
	},

	_onHandleDrag: function(event) {
		var handle = event.target;

		this._handled.setCenter(handle.getLatLng());

		this._handled.fire('illustrate:handledrag');
	}
});
L.Illustrate.ResizeHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'resize'
	},

	initialize: function(shape, options) {
		L.Illustrate.EditHandle.prototype.initialize.call(this, shape, options);
		this._corner = options.corner;
	},

	_onHandleDrag: function(event) {
		var handle = event.target,
			offset = this._latLngToOffset(handle.getLatLng());

		this._handled.setSize(offset.abs().multiplyBy(2));

		this._handled.fire('illustrate:handledrag');
	},

	updateHandle: function() {
		var size = this._handled.getSize(),
			height = Math.round(size.y/2),
			width = Math.round(size.x/2);

		switch (this._corner) {
		case 'upper-left':
			this._handleOffset = new L.Point(-width, height);
			break;
		case 'upper-right':
			this._handleOffset = new L.Point(width, height);
			break;
		case 'lower-left':
			this._handleOffset = new L.Point(-width, -height);
			break;
		case 'lower-right':
			this._handleOffset = new L.Point(width, -height);
			break;
		}

		L.Illustrate.EditHandle.prototype.updateHandle.call(this);
	}
});
L.Illustrate.RotateHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'rotate'
	},

	onAdd: function(map) {
		L.Illustrate.EditHandle.prototype.onAdd.call(this, map);

		this._createPointer();

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

	_animateZoom: function(opt) {
		L.Illustrate.EditHandle.prototype._animateZoom.call(this, opt);

		var map = this._handled._map,
			handleLatLng = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			),
			midpoint = map._newLayerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset, opt), opt.zoom, opt.center
			);
		this._pointer.setLatLngs([handleLatLng, midpoint]);

	},

	_createPointer: function() {
		var handleLatLng = this._map.layerPointToLatLng(
				this._textboxCoordsToLayerPoint(this._handleOffset)
			),
			topMiddleLatLng = this._map.layerPointToLatLng(
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
	}
});

}(window, document));