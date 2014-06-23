L.Illustrate.Textbox = L.Draw.Rectangle.extend({
	statics: {
		TYPE: 'textbox'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#0000EE',
			weight: 1,
			opacity: 0.5,
			fill: false,
			clickable: true
		}
	}
});