const should = require('should'),
	jimp = require('jimp');

const TEST_IMAGE = './test/test.jpg';

require('../jimp.extensions');

describe('jimp', function() {
	describe('#readAsync', function() {
		it('should exist on constructor', function() {
			should(jimp.readAsync).be.ok();
		});

		it('should read image', function() {
			return jimp.readAsync(TEST_IMAGE)
			.should.eventually.be.instanceof(jimp);
		});

		it('should handle errors gracefully', function() {
			jimp.readAsync('BAD FILE XYZ')
			.should.be.rejected();
		});
	});

	describe('#getBufferAsync', function() {
		it('should exist on object', function() {
			return jimp.readAsync(TEST_IMAGE)
			.then(img => {
				should(img.getBufferAsync).be.ok();
			});
		});

		it('should get buffer', function() {
			return jimp.readAsync(TEST_IMAGE)
			.then(img => {
				return img.getBufferAsync(jimp.AUTO)
				.should.eventually.be.instanceof(Buffer);
			});
		});

		it('should handle errors gracefully', function() {
			return jimp.readAsync(TEST_IMAGE)
			.then(img => {
				return img.getBufferAsync('jsdkfsjklf')
				.should.be.rejected();
			});
		});
	});

	describe('#getBase64Async', function() {
		it('should exist on object', function() {
			return jimp.readAsync(TEST_IMAGE)
			.then(img => {
				should(img.getBase64Async).be.ok();
			});
		});

		it('should return valid uri', function() {
			return jimp.readAsync(TEST_IMAGE)
			.then(img => {
				return img.getBase64Async(jimp.AUTO)
				.should.eventually.match(/^data:image\/jpeg;base64,/);
			});
		});

		it('should handle errors gracefully', function() {
			return jimp.readAsync(TEST_IMAGE)
			.then(img => {
				return img.getBase64Async('jsdkfljslkefj')
				.should.be.rejected();
			});
		});
	});
});
