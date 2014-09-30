L.Illustrate.Textbox = L.RotatableMarker.extend({
	statics: {
		TYPE: 'textbox',
		TEXTEDIT_EVENTS: [ 'change', 'keyup', 'paste', 'cut' ]
	},

	includes: [L.Mixin.Events],

	options: {
		/* this._minSize is used by edit handles (L.Illustrate.EditHandle) when updating size. */
		minSize: new L.Point(10, 10),
		textEditable: true,
		textContent: ''
	},

	initialize: function(latlng, options) {
		options.icon = new L.DivIcon({
			className: 'leaflet-illustrate-textbox-container',
			html: '<textarea style="width: 100%; height: 100%">' + this.options.textContent + '</textarea>',
			iconAnchor: new L.Point(0, 0)
		});

		L.RotatableMarker.prototype.initialize.call(this, latlng, options);

		this._textContent = this.options.textContent;
		this._minSize = this.options.minSize;
		
		this.setSize(this.options.size || this._minSize);
	},

	onAdd: function(map) {
		var textarea, editevent;

		L.RotatableMarker.prototype.onAdd.call(this, map);

		textarea = this.getTextarea();

		this.setContent(this._textContent);
		this.setLatLng(this._latlng);
		this._updateSize();

		/* Enable typing, text selection, etc. */
		this._enableTyping();

		/* Disable the textarea if the textbox content should not be editable. */
		if (!this.options.textEditable) {
			textarea.setAttribute('readonly', 'readonly');
		}

		this._addClasses();

		for (var i = 0; i < L.Illustrate.Textbox.TEXTEDIT_EVENTS.length; i++) {
			editevent = L.Illustrate.Textbox.TEXTEDIT_EVENTS[i];
			L.DomEvent.on(textarea, editevent, this._showIfEmpty, this);
		}

		this._showIfEmpty({ target: textarea });
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function(map) {
		/* In case the textbox was removed from the map while dragging was disabled. */
		/* (see _enableTyping) */
		this._map.dragging.enable();

		/* Save the text content of the textbox. */
		this.getContent();

		L.RotatableMarker.prototype.onRemove.call(this, map);
	},


	getSize: function() {
		return this._size;
	},

	setSize: function(size) {
		var minWidth = (size.x < this._minSize.x) ? size.x : this._minSize.x,
			minHeight = (size.y < this._minSize.y) ? size.y : this._minSize.y;

		/* If size is smaller than this._minSize, reset this._minSize. */
		this._minSize = new L.Point(minWidth, minHeight);

		this._size = size;

		/* Set size on textarea via CSS */
		if (this._map) {
			this._updateSize();
		}
		this.fire('resize', { size: this._size });

		return this;
	},

	setContent: function(text) {
		this.getTextarea().innerHTML = text;
		return this;
	},

	getContent: function() {
		/* Don't want to call this.getTextarea() if the textbox has been removed from the map. */
		if (this._map) {
			this._textContent = this.getTextarea().value;
		}

		return this._textContent;
	},

	_updateCenter: function() {
		this.setLatLng(this._latlng);
	},

	setStyle: function() {
		// use this to change the styling of the textbox.  should accept an 'options' argument.
		return this;
	},

	getTextarea: function() {
		return this._icon.children[0];
	},

	_updateSize: function() {
		var size = this.getSize();

		if (this._icon) {
			this._icon.style.marginTop = - Math.round(size.y/2) + "px";
			this._icon.style.marginLeft = - Math.round(size.x/2) + "px";
			this._icon.style.width = size.x + "px";
			this._icon.style.height = size.y + "px";
		}
	},

	_onTextEdit: function() {
		if (this._text_edited) {
			this.fire('textedit', { textContent: this.getContent() });
			this._text_edited = false;
		}
	},

	_enableTyping: function() {
		var map = this._map,
			textarea = this.getTextarea(),
			onTextChange = function() {
				this._text_edited = true;
			},
			editevent;

		/* Enable text selection and editing. */
		this._selecting = new L.Illustrate.Selectable(textarea);

		L.DomEvent.on(textarea, 'click', function(event) {
			event.target.focus();
		}, this);

		L.DomEvent.on(textarea, 'mouseover', function() {
			map.dragging.disable();
			this._selecting.enable();
		}, this);

		L.DomEvent.on(textarea, 'mouseout', function() {
			map.dragging.enable();
			this._selecting.disable();
		}, this);

		/* When user leaves the textarea, fire a 'textedit' event if they changed anything. */
		for (var i = 0; i < L.Illustrate.Textbox.TEXTEDIT_EVENTS.length; i++) {
			editevent = L.Illustrate.Textbox.TEXTEDIT_EVENTS[i];
			L.DomEvent.on(textarea, editevent, onTextChange, this);
		}

		L.DomEvent.on(textarea, 'blur', this._onTextEdit, this);
	},

	_showIfEmpty: function(event) {
		var textarea = event.target,
			text = textarea.value;

		if (text === '') {
			L.DomUtil.addClass(textarea, 'leaflet-illustrate-textbox-empty');
		} else {
			L.DomUtil.removeClass(textarea, 'leaflet-illustrate-textbox-empty');
		}
	},

	_addClasses: function() {
		var textarea = this.getTextarea();

		L.DomUtil.addClass(textarea, 'leaflet-illustrate-textbox');

		if (this.options.className) {
			L.Domutil.addClass(textarea, this.options.className);
		}
	}

});

/* Add GeoJSON Conversion */
L.Illustrate.Textbox.prototype.toGeoJSON = function() {
	var size = this.getSize(),
		properties = {
			textContent: this.getContent(),
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

L.Illustrate.textbox = function(latlng, options) {
	return new L.Illustrate.Textbox(latlng, options);
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