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
	Assertion.addMethod('closeToLatLng', function(expected, delta, message) {
		var obj = utils.flag(this, 'object');

		delta = delta || 1e-4;	

		expect(expected).to.have.property('lat');
		expect(expected).to.have.property('lng');

		new Assertion(obj.lat).to.be.closeTo(expected.lat, delta, message);
		new Assertion(obj.lng).to.be.closeTo(expected.lng, delta, message);

	});
});

chai.use(function(chai, utils) {
	var Assertion = chai.Assertion;
	Assertion.addMethod('closeToPoint', function(expected, delta, message) {
		var obj = utils.flag(this, 'object');

		delta = delta || 1;	

		expect(expected).to.have.property('x');
		expect(expected).to.have.property('y');

		new Assertion(obj.x).to.be.closeTo(expected.x, delta, message);
		new Assertion(obj.y).to.be.closeTo(expected.y, delta, message);

	});
});
