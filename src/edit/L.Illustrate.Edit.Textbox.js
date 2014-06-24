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