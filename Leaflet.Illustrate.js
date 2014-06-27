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
		this._initTextbox();
	},

	_initTextbox: function() {
		var textarea = new L.DivIcon({
			className: 'leaflet-illustrate-textbox',
			html: '<textarea style="width: 100%; height: 100%"></textarea>'
		});
		this._textbox = new L.Marker(this._latlng, { icon: textarea });
	},

	onAdd: function(map) {
		this._map = map;

		this._updateLatLng();
		this._map.addLayer(this._textbox);

		L.DomEvent.on(this._textbox._icon, 'click', function(event) {
			event.target.focus();
		});

		L.DomEvent.on(this._textbox._icon, 'mouseover', function() {
			// want to disable dragging on the map	
		});

		this.fire('add');
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function() {
		this.fire('remove');
	},

	setLatLng: function(latlng) {
		this._latlng = latlng;

		this._updateLatLng();
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
	},

	_updateLatLng: function() {
		this._textbox.setLatLng(this._latlng);
	},

	/* 
	 *	Should always do a check to make sure that this._textbox._icon is defined before calling this. 
	 *	If the marker containing the textarea has not yet been added to the map, it may not be defined. 
	 */
	_getTextarea: function() {
		if (this._textbox._icon) {
			return this._textbox._icon.children[0];
		} else {
			return;
		}
	},

	_updateSize: function() {
		if (this._textbox._icon) {
			this._textbox._icon.style.width = this._width + "px";
			this._textbox._icon.style.height = this._height + "px";
		}
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

L.Illustrate.Create.Textbox = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			color: '#000000',
			editable: true
		}
	},

	initialize: function(map, options) {
		this.type = L.Illustrate.Create.Textbox.TYPE;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function(latlng) {
		var bounds = new L.LatLngBounds(this._startLatLng, latlng),
			anchor = bounds.getCenter(),
			upperLeft = this._map.latLngToLayerPoint(bounds.getSouthWest()).round(),
			lowerRight = this._map.latLngToLayerPoint(bounds.getNorthEast()).round(),
			height = upperLeft.y - lowerRight.y,
			width = lowerRight.x - upperLeft.x;

		if (!this._shape) {
			this._shape = new L.Illustrate.Textbox(anchor, this.options.shapeOptions);
			this._map.addLayer(this._shape);
		}

		this._shape.setSize(new L.Point(width, height));
	},

	_fireCreatedEvent: function() {
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, this._shape);
	}
});
L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({});

L.Illustrate.Textbox.addInitHook(function() {
	if (L.Illustrate.Edit.Textbox) {
		this.editing = new L.Illustrate.Edit.Textbox(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});

}(window, document));