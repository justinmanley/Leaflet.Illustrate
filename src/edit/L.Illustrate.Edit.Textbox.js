L.Illustrate.Edit = L.Illustrate.Edit || {};

L.Illustrate.Edit.Textbox = L.Edit.SimpleShape.extend({
	addHooks: function() {
		L.Edit.SimpleShape.prototype.addHooks.call(this);

		this._bindRotateMarker();
	},

	_bindRotateMarker: function() {
		var height = this._shape.getSize().y;

		this._rotateMarker = new L.Illustrate.EditHandle(this._shape, {
			type: 'rotate',
			offsetX: 0,
			offsetY: height
		});
		this._markerGroup.addLayer(this._rotateMarker);
	},

	_createMoveMarker: function() {

	},

	_createResizeMarker: function() {

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