(function(window, document, undefined) {

"use strict";

L.Illustrate = {};
L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {

	},

	initialize: function(latlng, options) {
		L.setOptions(options);
		this._latlng = latlng;
		this._initTextbox();
	},

	_initTextbox: function() {
		var textarea = new L.DivIcon({
			className: 'leaflet-illustrate-textbox',
			html: '<textarea></textarea>'
		});
		this._shape = new L.Marker(this._latlng, { icon: textarea });
	},

	onAdd: function(map) {
		this._map = map;

		this._map.addLayer(this._shape);
	},

	onRemove: function() {
		// noop
		// why do I need this?
	},

	setLatLng: function(latlng) {
		this._latlng = latlng;

		this._updateAnchorLatLng();
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
		this._shape.setLatLng(this._latlng);
	},

	_updateSize: function() {
		if (this._shape._icon) {
			this._shape._icon.children[0].style.width = this._width + "px";
			this._shape._icon.children[0].style.height = this._height + "px";
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
			color: '#000000'
		}
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
		var textbox = new L.Illustrate.Textbox(this._shape.getLatLng(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, textbox);
	}
});
L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Handler.extend({

	addHooks: function() {
		this._enableTyping();
	},

	_enableTyping: function() {
		this._shape.on('click', function(evt) {
			evt.target._icon.children[0].focus();
		});
	}

});

// It may not be desirable to be adding hooks to L.Rectangle.  What if the textboxes stop using L.Rectangle?
// Then these hooks will no longer fire.  Perhaps better to create an L.Textbox base class?
// L.Illustrate.Create.Textbox is called when the toolbar is loaded, while L.Rectangle is not called
// until a rectangle is *drawn* on the map.
// Also, this is obviously NOT ideal because whenever normal rectangles are drawn, these hooks will be called as well.
L.Rectangle.addInitHook(function() {
	if (L.Illustrate.Edit.Textbox) {
		this.editing = new L.Illustrate.Edit.Textbox(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});

}(window, document));