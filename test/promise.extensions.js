const should = require('should');

require('../promise.extensions');

describe('Promise', function() {
	describe('#thenSpread', function() {
		it('should work', function() {
			return Promise.all([
				Promise.resolve(1),
				Promise.resolve(2),
				Promise.resolve('A')
			])
			.thenSpread((x,y,z) => {
				x.should.equal(1);
				y.should.equal(2);
				z.should.equal('A');
			});
		});
	});
});
