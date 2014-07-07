var expect = chai.expect;

describe("L.Illustrate", function() {
	before(function() {
		var mapDiv = document.createElement('div');
		mapDiv.id = 'map';
		document.body.appendChild(mapDiv);

		var map = L.map('map').setView([41.7896,-87.5996], 15);
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
	after(function() {
		var mapDiv = document.getElementById('map');
		mapDiv.parentNode.removeChild(mapDiv);
	});

	// describe("L.Illustrate.EditHandle", function() {
		// describe("L.Illustrate.ResizeHandle", function() {
	it("should do something", function() {
		expect(1).to.equal(1);
	});
		// });
	// });

});