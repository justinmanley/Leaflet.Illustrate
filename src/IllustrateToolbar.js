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
		
	}
});

L.Map.addInitHook(function() {
	if (this.options.illustrateControl) {
		this.illustrateControl = new L.Illustrate.Control();
		this.addControl(this.illustrateControl);

	}
});