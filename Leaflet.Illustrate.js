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
			stroke: true,
			color: '#0000EE',
			weight: 1,
			opacity: 1,
			fill: false,
			clickable: true,
			editable: true
		}
	},

	_drawShape: function(latlng) {
		L.Draw.Rectangle.prototype._drawShape.call(this, latlng);

		var startPoint = this._map.latLngToLayerPoint(latlng).round(),
			currentPoint = this._map.latLngToLayerPoint(this._startLatLng).round(),
			width = startPoint.x - currentPoint.x,
			height = startPoint.y - currentPoint.y;

		if (!this._textarea) {
			var textarea = new L.DivIcon({
				className: 'leaflet-illustrate-text-container',
				html: '<textarea style="height: '+height+'px; width: '+width+'px;"></textarea>',
				iconAnchor: [-1, -1]
			});
			this._textarea = new L.Marker(this._startLatLng, { icon: textarea });
			this._map.addLayer(this._textarea);
		} else {
			this._textarea._icon.children[0].style.width = width + "px";
			this._textarea._icon.children[0].style.height = height + "px";
		}
	}
});
L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.Rectangle.extend({

	// figure out why this is not overriding the super method
	addHooks: function() {
		this._enableTyping();
	},

	_enableTyping: function() {
		this._textarea.on('click', function(evt) {
			evt.target._icon.children[0].focus();
		});
	}

});

L.Illustrate.Create.Textbox.addInitHook(function() {
	if (L.Illustrate.Edit.Textbox) {
		this.editing = new L.Illustrate.Edit.Textbox(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});

}(window, document));