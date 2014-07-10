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
			html: '<textarea style="width: 100%; height: 100%"></textarea>',
			iconAnchor: new L.Point(0, 0)
		});
		this._textbox = new L.RotatableMarker(this._latlng, { icon: textarea, rotation: 0 });
		this._minSize = new L.Point(this.options.minWidth, this.options.minHeight);
	},

	onAdd: function(map) {
		this._map = map;

		this._map.addLayer(this._textbox);
		this._updateCenter();
		this._updateSize();

		this._enableTyping();

		L.DomUtil.addClass(this._textbox._icon.children[0], 'leaflet-illustrate-textbox-outlined');

		this.fire('add');
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function() {
		this._map.removeLayer(this._textbox);

		this.fire('remove');

		this._map = null;
		this._textbox = null;
	},

	setCenter: function(latlng) {
		this._latlng = latlng;

		this._updateCenter();

		return this;
	},

	getCenter: function() {
		return this._latlng;
	},

	getSize: function() {
		return new L.Point(this._width, this._height);
	},

	setSize: function(size) {
		this._width = size.x;
		this._height = size.y;

		this._updateSize();

		return this;
	},

	setRotation: function(theta) {
		this._textbox.setRotation(theta % (2*Math.PI));
		this._textbox.update();
		return this;
	},

	getRotation: function() {
		return this._textbox.getRotation();
	},

	_updateCenter: function() {
		this._textbox.setLatLng(this._latlng);
	},

	setStyle: function() {
		// use this to change the styling of the textbox.  should accept an 'options' argument.
		return this;
	},

	_updateSize: function() {
		if (this._textbox._icon) {
			this._textbox._icon.style.marginTop = - Math.round(this._height/2) + "px";
			this._textbox._icon.style.marginLeft = - Math.round(this._width/2) + "px";
			this._textbox._icon.style.width = this._width + "px";
			this._textbox._icon.style.height = this._height + "px";
		}
	},

	_enableTyping: function() {
		var map = this._map,
			textarea = this._textbox._icon.children[0],
			mapDraggable;


		L.DomEvent.on(this._textbox._icon, 'click', function(event) {
			event.target.focus();
		});

		L.DomEvent.on(textarea, 'focus', function(event) {
			// not sure why this doesn't work
			L.DomUtil.enableTextSelection();
			L.DomEvent.off(event.target, 'selectstart', L.DomEvent.preventDefault);

			L.DomUtil.addClass(event.target, 'leaflet-illustrate-textbox-outlined');
			L.DomUtil.removeClass(event.target, 'leaflet-illustrate-textbox-hidden');

			mapDraggable = map.dragging.enabled();
			if (mapDraggable) {
				map.dragging.disable();
			}
		});

		L.DomEvent.on(textarea, 'blur', function(event) {
			// not sure why this doesn't work
			L.DomUtil.disableTextSelection();
			L.DomEvent.on(event.target, 'selectstart', L.DomEvent.preventDefault);

			L.DomUtil.addClass(event.target, 'leaflet-illustrate-textbox-hidden');
			L.DomUtil.removeClass(event.target, 'leaflet-illustrate-textbox-outlined');

			mapDraggable = map.dragging.enabled();
			if (!mapDraggable) {
				map.dragging.enable();
			}
		});
	}
});
