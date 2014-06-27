L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	initialize: function(shape, options) {
		L.Edit.SimpleShape.prototype.initialize.call(this, shape, options);
		// the problem with adding icon listeners is that _initIcon (the method which creates the _icon property)
		// is not set until the marker is added to the map
		// i.e. it is not set until drawnItems.addLayer(layer) is called.
		// this means that somehow I need to add a hook to be called when L.Illustrate.Textbox is added
		// to the map.  So maybe I add a hook to shape?  Can I do that?
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