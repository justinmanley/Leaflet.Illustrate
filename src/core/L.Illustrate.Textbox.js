L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	includes: [L.Mixin.Events],

	options: {

		/* this._minSize is used by edit handles (L.Illustrate.EditHandle) when updating size. */
		minWidth: 200,
		minHeight: 125

	},

	initialize: function(latlng, options) {
		L.setOptions(this, options);

		this._latlng = latlng;
		this._minSize = new L.Point(this.options.minWidth, this.options.minHeight);

		this._initTextbox();

		this._handlers = [];
	},

	_initTextbox: function() {
		var textContent = this.options.text || '',
			textarea = new L.DivIcon({
				className: 'leaflet-illustrate-textbox',
				html: '<textarea style="width: 100%; height: 100%">' + textContent + '</textarea>',
				iconAnchor: new L.Point(0, 0)
			});

		this._textbox = new L.RotatableMarker(this._latlng, { icon: textarea, rotation: 0 });
		this.setSize(this._minSize);
	},

	onAdd: function(map) {
		this._map = map;

		this._map.addLayer(this._textbox);
		this._updateCenter();
		this._updateSize();

		this._enableTyping();
		// this.addHandler('textselect', L.Illustrate.Textbox.Select);

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
		this.fire('update');

		return this;
	},

	getLatLng: function() {
		return this._latlng;
	},

	getSize: function() {
		return new L.Point(this._width, this._height);
	},

	setSize: function(size) {
		var minWidth = (size.x < this._minSize.x) ? size.x : this._minSize.x,
			minHeight = (size.y < this._minSize.y) ? size.y : this._minSize.y;

		/* If size is smaller than this._minSize, reset this._minSize. */
		this._minSize = new L.Point(minWidth, minHeight);

		this._width = size.x;
		this._height = size.y;

		/* Set size on textarea via CSS */
		this._updateSize();
		this.fire('update');

		return this;
	},

	setRotation: function(theta) {
		this._textbox.setRotation(theta % (2*Math.PI));
		this._textbox.update();
		this.fire('update');
		return this;
	},

	getRotation: function() {
		return this._textbox.getRotation();
	},

	getContent: function() {
		var textareas = this._textbox._icon.getElementsByTagName('textarea');

		return textareas[0].value;
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
		var textarea = this._textbox._icon.children[0];

		this._selecting = new L.Illustrate.Selectable(textarea);

		L.DomEvent.on(textarea, 'click', function(event) {
			event.target.focus();
			this._map.dragging.disable();
			this._selecting.enable();
		}, this);

		L.DomEvent.on(textarea, 'mouseout', function() {
			this._map.dragging.enable();
			this._selecting.disable();
		}, this);
	}
});

/* Add GeoJSON Conversion */
L.Illustrate.Textbox.prototype.toGeoJSON = function() {
	var size = this.getSize(),
		properties = {
			pointType: 'textbox',
			text: this.getContent(),
			style: {
				width: size.x,
				height: size.y,
				rotation: this.getRotation()
			}
		},
		feature = L.GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
		});

	feature.properties = properties;

	return feature;
};

L.Illustrate.Selectable = L.Handler.extend({

	includes: L.Mixin.Events,

	statics: {
		START: L.Draggable.START,
		END: L.Draggable.END,
		MOVE: L.Draggable.MOVE
	},

	initialize: function(element, selectStartTarget) {
		this._element = element;
		this._selectStartTarget = selectStartTarget || element;
	},

	addHooks: function() {
		var start = L.Illustrate.Selectable.START;
		L.DomEvent.on(this._selectStartTarget, start.join(' '), this._onDown, this);
	},

	removeHooks: function() {
		var start = L.Illustrate.Selectable.START;
		L.DomEvent.off(this._selectStartTarget, start.join(' '), this._onDown, this);
	},

	_onDown: function(event) {
		L.DomEvent.stopPropagation(event);
	}
});