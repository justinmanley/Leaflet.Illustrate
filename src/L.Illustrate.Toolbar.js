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

		var id,
			toolbar;

		this._toolbars = {};

		/* Initialize toolbars for creating L.Illustrate objects. */
		if (L.Illustrate.Toolbar && this.options.draw) {
			toolbar = new L.Illustrate.Toolbar(this.options.draw);
			id = L.stamp(toolbar);
			this._toolbars[id] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[id].on('enable', this._toolbarEnabled, this);
		}

		/* Initialize generic edit/delete toolbars. */
		if (L.EditToolbar && this.options.edit) {
			toolbar = new L.EditToolbar(this.options.edit);
			id = L.stamp(toolbar);
			this._toolbars[id] = toolbar;

			this._toolbars[id] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[id].on('enable', this._toolbarEnabled, this);
		}
	}
});

L.Map.addInitHook(function() {
	if (this.options.illustrateControl) {
		this.illustrateControl = new L.Illustrate.Control();
		this.addControl(this.illustrateControl);
	}
});

/* Override the _toggleMarkerHighlight method to prevent annoying highlighting of textboxes. */
if (L.EditToolbar.Edit) {
	L.EditToolbar.Edit.prototype._toggleMarkerHighlight = function() {};
}