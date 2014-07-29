var expect = chai.expect;

describe("L.Point", function() {
	var	point = new L.Point(1, -1);
	it("Should have an .abs() method which returns the absolute value of each coordinate.", function() {
		expect(point).to.respondTo('abs');
		expect(point.abs()).to.deep.equal(new L.Point(1, 1));
	});
});