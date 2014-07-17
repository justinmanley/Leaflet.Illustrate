if (!Array.prototype.map) {
	Array.prototype.map = function (fun /*, thisp */) {
		"use strict";

		if (this === void 0 || this === null) {
			throw new TypeError();
		}

		var t = Object(this);
		// jshint bitwise: false
		var len = t.length >>> 0;
		if (typeof fun !== "function") {
			throw new TypeError();
		}

		var res = new Array(len);
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in t) {
				res[i] = fun.call(thisp, t[i], i, t);
			}
		}

		return res;
	};
}

chai.use(function(chai, utils) {
	var Assertion = chai.Assertion;
	Assertion.addMethod('closeToLatLng', function(actual, delta, message) {
		var obj = utils.flag(this, 'object');

		delta = delta || 1e-4;	

		expect(obj).to.have.property('lat');
		expect(obj).to.have.property('lng');

		var lat = new Assertion(obj.lat),
			lng = new Assertion(obj.lng);

		utils.transferFlags(this, lat, false);
		utils.transferFlags(this, lng, false);

		lat.to.be.closeTo(actual.lat, delta, message);
		lng.to.be.closeTo(actual.lng, delta, message);
	});
});

chai.use(function(chai, utils) {
	var Assertion = chai.Assertion;
	Assertion.addMethod('closeToPoint', function(actual, delta, message) {
		var obj = utils.flag(this, 'object');

		delta = delta || 1;	

		new Assertion(obj).to.have.property('x');
		new Assertion(obj).to.have.property('y');

		var x = new Assertion(obj.x),
			y = new Assertion(obj.y);

		utils.transferFlags(this, x, false);
		utils.transferFlags(this, y, false);

		x.to.be.closeTo(actual.x, delta, message);
		y.to.be.closeTo(actual.y, delta, message);
	});
});
