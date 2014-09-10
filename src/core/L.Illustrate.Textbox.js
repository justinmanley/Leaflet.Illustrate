L.Illustrate.Textbox = L.Class.extend({
	statics: {
		TYPE: 'textbox'
	},

	includes: [L.Mixin.Events],

	options: {
		/* this._minSize is used by edit handles (L.Illustrate.EditHandle) when updating size. */
		minSize: [10, 10],
		textEditable: true,
		textContent: ''
	},

	initialize: function(latlng, options) {
		L.setOptions(this, options);

		this._latlng = latlng;
		this._textContent = this.options.textContent;
		this._minSize = new L.Point(this.options.minSize[0], this.options.minSize[1]);
		this._handlers = [];

		if (this.options.size) {
			this.setSize(this.options.size[0], this.options.size[1]);
		} else {
			this.setSize(this._minSize);
		}
	},

	_initTextbox: function() {
		var	textarea = new L.DivIcon({
				className: 'leaflet-illustrate-textbox',
				html: '<textarea style="width: 100%; height: 100%">' + this.getContent() + '</textarea>',
				iconAnchor: new L.Point(0, 0)
			});

		this._textbox = new L.RotatableMarker(this._latlng, { icon: textarea, rotation: 0 });
	},

	onAdd: function(map) {
		this._map = map;

		this._initTextbox();
		map.addLayer(this._textbox);

		this._updateCenter();
		this._updateSize();

		/* Enable typing, text selection, etc. */
		this._enableTyping();

		/* Propagate click events from the L.RotatbleMarker to the L.Illustrate.Textbox */
		this._textbox.on('click', function(event) {
			this.fire('click', event);
		}, this);

		/* Disable the textarea if the textbox content should not be editable. */
		if (!this.options.textEditable) {
			this.getTextarea().setAttribute('readonly', 'readonly');
		}

		L.DomUtil.addClass(this.getTextarea(), 'leaflet-illustrate-textbox-outlined');

		this.fire('add');
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function() {
		/* In case the textbox was removed from the map while dragging was disabled. */
		/* (see _enableTyping) */
		this._map.dragging.enable();

		/* Save the text content of the textbox. */
		this.getContent();

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
		if (this._map) {
			this._updateSize();
		}
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

	setContent: function() {

	},

	getContent: function() {
		/* Don't want to call this.getTextarea() if the textbox has been removed from the map. */
		if (this._textbox) {
			this._textContent = this.getTextarea().value;
		}

		console.log(this._textContent);
		return this._textContent;
	},

	_updateCenter: function() {
		this._textbox.setLatLng(this._latlng);
	},

	setStyle: function() {
		// use this to change the styling of the textbox.  should accept an 'options' argument.
		return this;
	},

	getTextarea: function() {
		return this._textbox._icon.children[0];
	},

	_updateSize: function() {
		if (this._textbox._icon) {
			this._textbox._icon.style.marginTop = - Math.round(this._height/2) + "px";
			this._textbox._icon.style.marginLeft = - Math.round(this._width/2) + "px";
			this._textbox._icon.style.width = this._width + "px";
			this._textbox._icon.style.height = this._height + "px";
		}
	},

	/* When user leaves the textarea, fire a 'draw:edited' event if they changed anything. */
	_onTextEdit: function() {
		if (this._text_edited) {
			this._map.fire('draw:edited', {
				layers: new L.LayerGroup().addLayer(this)
			});
			this._text_edited = false;
		}
	},

	_enableTyping: function() {
		var map = this._map,
			textarea = this.getTextarea(),
			onTextChange = function() {
				this._text_edited = true;
			};

		/* Enable text selection and editing. */
		this._selecting = new L.Illustrate.Selectable(textarea);

		L.DomEvent.on(textarea, 'click', function(event) {
			event.target.focus();
			map.dragging.disable();
			this._selecting.enable();
		}, this);

		L.DomEvent.on(textarea, 'mouseout', function() {
			map.dragging.enable();
			this._selecting.disable();
		}, this);

		/* Fire 'draw:edited' event when text content changes. */
		L.DomEvent.on(textarea, 'change', onTextChange, this);
		L.DomEvent.on(textarea, 'keyup', onTextChange, this);
		L.DomEvent.on(textarea, 'paste', onTextChange, this);

		L.DomEvent.on(textarea, 'blur', this._onTextEdit, this);
	},

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
				// mocked until refactoring is finshed
				// rotation: this.getRotation()
				rotation: 0
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

	includes: [L.Mixin.Events],

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