L.Illustrate.MoveHandle = L.Illustrate.EditHandle.extend({
	options: {
		TYPE: 'move'
	},

	_onHandleDrag: function(event) {
		var handle = event.target;

		this._handled.setCenter(handle.getLatLng());

		this._handled.fire('illustrate:handledrag');
	}
});