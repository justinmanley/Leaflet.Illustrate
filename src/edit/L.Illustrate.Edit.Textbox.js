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