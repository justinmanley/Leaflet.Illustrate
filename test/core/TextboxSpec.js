var expect = chai.expect;

/* 
 * NOTE: afterEach and beforeEach hooks used to set up the map object are at the bottom of the spec.
 */

describe("L.Illustrate.Textbox", function() {
	var map, mapDiv, textbox;

	describe("#_enableTyping", function() {
		expect(1).to.equal(1);
	});

	beforeEach(function() {
		mapDiv = document.createElement('div');
		mapDiv.id = 'map';
		document.body.appendChild(mapDiv);

		map = L.map('map').setView([41.7896,-87.5996], 15);
		L.tileLayer("http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
		}).addTo(map);

		var drawnItems = new L.FeatureGroup();
		map.addLayer(drawnItems);

		var illustrateControl = new L.Illustrate.Control({
			edit: {
				featureGroup: drawnItems
			}
		});
		map.addControl(illustrateControl);

		map.on('draw:created', function(evt) {
			var layer = evt.layer;

			drawnItems.addLayer(layer);
		});
	});

	beforeEach(function() {
		var center = new L.LatLng(41.79187262698525, -87.60107517242432),
			size = new L.Point(240, 155);

		textbox = new L.Illustrate.Textbox(center, L.Illustrate.Create.Textbox.prototype.options.shapeOptions)
			.setSize(size);
		textbox.addTo(map);
	});

	afterEach(function() {
		mapDiv.parentNode.removeChild(mapDiv);
	});
});