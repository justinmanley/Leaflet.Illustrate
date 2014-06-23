(function(window, document, undefined) {

"use strict";

L.Illustrate = {};

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
			handler: new L.Illustrate.Textbox(map, this.options.text),
			title: 'Add a textbox'
		}];
		return L.DrawToolbar.getModeHandlers(map).concat(illustrateModes);
	}
});

L.Illustrate.Control = L.Control.Draw.extend({
	onAdd: function(map) {
		return L.Control.Draw.onAdd(map);
	}
});

L.Map.addInitHook(function() {
	if (this.options.illustrateControl) {
		this.illustrateControl = new L.Illustrate.Control();
		this.addControl(this.illustrateControl);

	}
});
/* 
* Leaflet.Illustrate assumes that you have already loaded the Leaflet library and Leaflet.draw. 
*/

// L.Illustrate = {};

// L.Illustrate.Text = L.Handler.extend({
// 	includes: L.Mixin.Events,

// 	initialize: function(map, options) {
// 		this._map = map;
// 		this._container = map._container;
// 		this._overlayPane = map._panes.overlayPane;
// 		this._popupPane = map._panes.popupPane;

// 		L.setOptions(this, options);
// 	},

// 	enable: function() {
// 		if (this._enabled) { return; }

// 		L.Handler.prototype.enable.call(this);

// 		this.fire('enabled', { handler: this.type });

// 		this._map.fire('draw:drawstart', { layerType: this.type });
// 	},

// 	disable: function() {
// 		if (!this._enabled) { return; }

// 		L.Handler.prototype.disable.call(this);

// 		this._map.fire('draw:drawstop', { layerType: this.type });

// 		this.fire('disabled', { handler: this.type });
// 	}
// });
L.Illustrate.Textbox = L.Draw.Rectangle.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#0000EE',
			weight: 1,
			opacity: 0.5,
			fill: false,
			clickable: true
		}
	}
});

}(window, document));