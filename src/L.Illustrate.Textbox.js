L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {

	},

	initialize: function(latlng, options) {
		L.setOptions(options);
		this._latlng = latlng;
		this._initTextbox();
	},

	_initTextbox: function() {
		var textarea = new L.DivIcon({
			className: 'leaflet-illustrate-textbox',
			html: '<textarea></textarea>'
		});
		this._shape = new L.Marker(this._latlng, { icon: textarea });
	},

	onAdd: function(map) {
		this._map = map;

		this._map.addLayer(this._shape);
	},

	onRemove: function() {
		// noop
		// why do I need this?
	},

	setLatLng: function(latlng) {
		this._latlng = latlng;

		this._updateAnchorLatLng();
	},

	getLatLng: function() {
		return this._latlng;
	},

	getSize: function() {
		return new L.Point(this._width, this._height);
	},

	setSize: function(size) {
		this._width = size.x;
		this._height = size.y;

		this._updateSize();
	},

	_updateLatLng: function() {
		this._shape.setLatLng(this._latlng);
	},

	_updateSize: function() {
		if (this._shape._icon) {
			this._shape._icon.children[0].style.width = this._width + "px";
			this._shape._icon.children[0].style.height = this._height + "px";
		}
	}
});