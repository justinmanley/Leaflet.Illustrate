L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	includes: [L.Mixin.Events],

	options: {
		color: '#db1d0f'
	},

	initialize: function(latlng, options) {
		L.setOptions(this, options);
		this._latlng = latlng;
		this._initTextbox();
	},

	_initTextbox: function() {
		var textarea = new L.DivIcon({
			className: 'leaflet-illustrate-textbox',
			html: '<textarea style="width: 100%; height: 100%"></textarea>'
		});
		this._textbox = new L.Marker(this._latlng, { icon: textarea });
	},

	onAdd: function(map) {
		this._map = map;

		this._updateLatLng();
		this._map.addLayer(this._textbox);

		L.DomEvent.on(this._textbox._icon, 'click', function(event) {
			event.target.focus();
		});

		L.DomEvent.on(this._textbox._icon, 'mouseover', function() {
			// want to disable dragging on the map	
		});

		this.fire('add');
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function() {
		this.fire('remove');
	},

	setLatLng: function(latlng) {
		this._latlng = latlng;

		this._updateLatLng();
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
		this._textbox.setLatLng(this._latlng);
	},

	/* 
	 *	Should always do a check to make sure that this._textbox._icon is defined before calling this. 
	 *	If the marker containing the textarea has not yet been added to the map, it may not be defined. 
	 */
	_getTextarea: function() {
		if (this._textbox._icon) {
			return this._textbox._icon.children[0];
		} else {
			return;
		}
	},

	_updateSize: function() {
		if (this._textbox._icon) {
			this._textbox._icon.style.width = this._width + "px";
			this._textbox._icon.style.height = this._height + "px";
		}
	}
});