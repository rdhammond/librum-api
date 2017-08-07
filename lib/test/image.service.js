const should = require('should'),
	imageSvc = require('../image.service'),
	fs = require('fs');

require('../../promise.extensions');

before(function() {
	if (fs.existsSync('./test/test.jpg'))
		fs.unlinkSync('./test/test.jpg');
	if (fs.existsSync('./test/test.txt'))
		fs.unlinkSync('./test/test.txt');
});

describe('imageSvc', function() {
	beforeEach(function() {
		fs.linkSync('./test/image.service.js', './test/test.txt');
		fs.linkSync('./test/source.jpg', './test/test.jpg');
	});

	afterEach(function() {
		if (fs.existsSync('./test/test.jpg'))
			fs.unlinkSync('./test/test.jpg');
		if (fs.existsSync('./test/test.txt'))
			fs.unlinkSync('./test/test.txt');
	});

	describe('#consumeCover', function() {
		it('should remove files after running', function() {
			return imageSvc.consumeCover('./test/test.jpg')
			.then(() => {
				fs.existsSync('./test/test.jpg').should.not.be.ok();
			});
		});

		it('should return cover, thumbnail, and mimetype', function() {
			return imageSvc.consumeCover('./test/test.jpg')
			.thenSpread((cover, thumbnail, mimetype) => {
				cover.should.be.instanceof(Buffer);
				thumbnail.should.be.instanceof(Buffer);
				mimetype.should.equal('image/jpeg');
			});
		});

		it('should handle errors gracefully', function() {
			imageSvc.consumeCover('./test/test.txt')
			.should.be.rejected();
		});
	});

	describe('#consumePreviewUri', function() {
		it('should return valid base64 uri', function() {
			return imageSvc.consumePreviewUri('./test/test.jpg')
			.should.eventually.match(/data:image\/jpeg;base64,/);
		});

		it('should handle errors gracefully', function() {
			imageSvc.consumePreviewUri('./test/test.txt')
			.should.be.rejected();
		});
	});
});
