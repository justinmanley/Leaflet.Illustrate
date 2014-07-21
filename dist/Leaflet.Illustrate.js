(function(window, document, undefined) {

"use strict";

L.Illustrate = {};

L.Illustrate.version = "0.0.1";
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
L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	includes: [L.Mixin.Events],

	options: {

	},

	initialize: function(latlng, options) {
		L.setOptions(this, options);

		this._latlng = latlng;
		this._initTextbox();

		this._handlers = [];
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
		// this.addHandler('textselect', L.Illustrate.Textbox.Select);

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

	// addHandler: function(name, HandlerClass) {
	// 	if (!HandlerClass) { return this; }

	// 	var handler = this[name] = new HandlerClass(this);

	// 	this._handlers.push(handler);

	// 	if (this.options[name]) {
	// 		handler.enable();
	// 	}

	// 	return this;
	// },

	setCenter: function(latlng) {
		this._latlng = latlng;

		this._updateCenter();
		this.fire('shape-change');

		return this;
	},

	getLatLng: function() {
		return this._latlng;
	},

	getSize: function() {
		return new L.Point(this._width, this._height);
	},

	setSize: function(size) {
		this._width = size.x;
		this._height = size.y;

		this._updateSize();
		this.fire('shape-change');

		return this;
	},

	setRotation: function(theta) {
		this._textbox.setRotation(theta % (2*Math.PI));
		this._textbox.update();
		this.fire('shape-change');
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
		// var textarea = this._textbox._icon.children[0];

		// L.DomEvent.on(textarea, 'mousemove', function() {
		// 	console.log('mousemove');
		// });

		// var map = this._map,
			// textarea = this._textbox._icon.children[0],
			// mapDraggable;

		L.DomEvent.off(window, 'drag', L.DomEvent.preventDefault);
		L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);

		this._textbox.on('drag', function() {
			console.log('drag');
		});

		L.DomEvent.on(this._textbox._icon.children[0], 'dblclick', function(event) {
			event.target.focus();
			this._map.dragging.disable();
		}, this);

		L.DomEvent.on(this._textbox._icon.children[0], 'mouseout', function() {
			this._map.dragging.enable();
		}, this);

		// L.DomEvent.on(textarea, 'focus', function(event) {
		// 	// not sure why this doesn't work
		// 	L.DomUtil.enableTextSelection();
		// 	L.DomEvent.off(event.target, 'selectstart', L.DomEvent.preventDefault);

		// 	L.DomUtil.addClass(event.target, 'leaflet-illustrate-textbox-outlined');
		// 	L.DomUtil.removeClass(event.target, 'leaflet-illustrate-textbox-hidden');

		// 	mapDraggable = map.dragging.enabled();
		// 	if (mapDraggable) {
		// 		map.dragging.disable();
		// 	}
		// });

		// L.DomEvent.on(textarea, 'blur', function(event) {
		// 	// not sure why this doesn't work
		// 	L.DomUtil.disableTextSelection();
		// 	L.DomEvent.on(event.target, 'selectstart', L.DomEvent.preventDefault);

		// 	L.DomUtil.addClass(event.target, 'leaflet-illustrate-textbox-hidden');
		// 	L.DomUtil.removeClass(event.target, 'leaflet-illustrate-textbox-outlined');

		// 	mapDraggable = map.dragging.enabled();
		// 	if (!mapDraggable) {
		// 		map.dragging.enable();
		// 	}
		// });
	}
});

// L.Illustrate.Textbox.Select = L.Handler.extend({
// 	addHooks: function() {
// 		if (!this._selectable) {
// 			this._selectable = new L.Draggable(this._map._textbox._icon.children[0]);

// 			this._selectable.on({
// 				'dragstart': this._onDragStart,
// 				'dragend': this._onDragEnd,
// 				'drag': this._onDrag
// 			});
// 		}
// 		this._selectable.enable();
// 	},

// 	removeHooks: function() {
// 		this._selectable.disable();
// 	},

// 	_onDragStart: function() {
// 		console.log('LOG dragstart');
// 	},

// 	_onDrag: function() {
// 		console.log('LOG drag');
// 	},

// 	_onDragEnd: function() {
// 		console.log('LOG dragend');
// 	}
// });
L.Illustrate.Create = L.Illustrate.Create || {};
L.Illustrate.Create.Pointer = L.Draw.Polyline.extend({
	// Have *GOT* to refactor this.
	// Really, I should get the layer point position on click, not the latlng.  There's no need to be endlessly
	// translating between latlng and layerpoint.

	_fireCreatedEvent: function() {
		var latlngs = this._poly.getLatLngs(),
			coordinates = [],
			origin = this._map.latLngToLayerPoint(latlngs[0]),
			pointer;

		for (var i = 0, length = latlngs.length; i < length; i++) {
			coordinates[i] = this._map.latLngToLayerPoint(latlngs[i])._subtract(origin);
		}

		pointer = new L.Illustrate.Pointer(coordinates, latlngs[0], this.options.shapeOptions);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, pointer);
	}
});
L.Illustrate.Create.Textbox = L.Draw.Rectangle.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		/* Set dynamically using this._setShapeOptions() */
		shapeOptions: {},

		textOptions: {
			minWidth: 10,
			minHeight: 10
		}
	},

	initialize: function(map, options) {
		this.options.textOptions = L.extend({}, this.options.textOptions, options);
		this._setShapeOptions();

		/* 
		 * A <textarea> element can only be drawn from upper-left to lower-right. 
		 * Implement drawing using L.Draw.Rectangle so that a textbox can be drawn in any direction,
		 * then return a L.Illustrate.Textbox instance once drawing is complete.
		 */
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

		var textbox = new L.Illustrate.Textbox(center, this.options.textOptions)
			.setSize(new L.Point(width, height));

		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	},

	_setShapeOptions: function() {
		/* shapeOptions are set dynamically so that the Rectangle looks the same as the Textbox. */
		var borderWidth = this.options.textOptions.borderWidth ? this.options.textOptions.borderWidth : 2,
			borderColor = this.options.textOptions.borderColor ? this.options.textOptions.borderColor : '#4387fd';

		this.options.shapeOptions = L.extend({}, this.options.shapeOptions, {
			weight: borderWidth,
			color: borderColor,
			fill: false,
			opacity: 0
		});
	}
});
L.Illustrate.Toolbar = L.Toolbar.extend({
	statics: {
		TYPE: 'illustrate'
	},

	options: {
		textbox: {},
		pointer: {}
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
		return [
			{
				enabled: this.options.textbox,
				handler: new L.Illustrate.Create.Textbox(map, this.options.textbox),
				title: 'Add a textbox'
			},
			{
				enabled: this.options.pointer,
				handler: new L.Illustrate.Create.Pointer(map, this.options.pointer),
				title: 'Add a pointer'
			}
		];
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
	},

	onAdd: function(map) {
		L.RotatableMarker.prototype.onAdd.call(this, map);

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
		this._handled.on('shape-change', this.updateHandle, this);
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
			center = this._handled.getLatLng(),
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
			center = this._handled.getLatLng(),
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
			center = this._handled.getLatLng(),
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

}(window, document));