var expect = chai.expect;

describe("L.Illustrate.Create.Textbox", function() {
	var map, create;

	describe("_setShapeOptions", function() {
		it("Should set defaults correctly.", function() {
			create = new L.Illustrate.Create.Textbox(map, {});

			/* Defaults from L.Illustrate.Create.Textbox */
			expect(create.options.shapeOptions.opacity).to.equal(0);
			expect(create.options.shapeOptions.fill).to.equal(false);

			expect(create.options.shapeOptions.color).to.equal('#4387fd');
			expect(create.options.shapeOptions.weight).to.equal(2);
		});

		it("Should handle options parameter correctly.", function() {
			var options = { borderWidth: 4, borderColor: "#9840ae" };

			create = new L.Illustrate.Create.Textbox(map, options);

			/* Defaults from L.Illustrate.Create.Textbox */
			expect(create.options.shapeOptions.opacity).to.equal(0);
			expect(create.options.shapeOptions.fill).to.equal(false);

			/* Set dynamically from the options that were passed in. */
			expect(create.options.shapeOptions.color).to.equal(options.borderColor);
			expect(create.options.shapeOptions.weight).to.equal(options.borderWidth);
		});
	});

	beforeEach(function() {
		map = new L.Map(document.createElement('div'));
	});
});