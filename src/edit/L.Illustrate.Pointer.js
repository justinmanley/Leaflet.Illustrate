L.Illustrate.Pointer = L.Path.extend({
	initialize: function(shape, options) {
		L.Path.prototype.initialize.call(options);
		this._shape = shape;
	},

	_initPathRoot: function() {
		L.Map.prototype._initPathRoot.call(this._map);
		
		this._shape._pathRoot = L.extend({}, this._map._pathRoot);
	}
});