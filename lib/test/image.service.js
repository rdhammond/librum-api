const should = require('should'),
	imageSvc = require('../image.service'),
	fs = require('fs');

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
		it('should remove files after running', async function() {
			await imageSvc.consumeCover('./test/test.jpg');
			fs.existsSync('./test/test.jpg').should.not.be.ok();
		});

		it('should return cover, thumbnail, and mimetype', async function() {
			const data = await imageSvc.consumeCover('./test/test.jpg');
			should(data).be.ok();
			data.cover.should.be.instanceof(Buffer);
			data.thumbnail.should.be.instanceof(Buffer);
			data.mimetype.should.eql('image/jpeg');
		});

		it('should handle errors gracefully', function() {
			return imageSvc.consumeCover('./test/test.txt')
			.should.be.rejected();
		});
	});

	describe('#consumePreviewUri', function() {
		it('should return valid base64 uri', function() {
			return imageSvc.consumePreviewUri('./test/test.jpg')
			.should.eventually.match(/data:image\/jpeg;base64,/);
		});

		it('should handle errors gracefully', function() {
			return imageSvc.consumePreviewUri('./test/test.txt')
			.should.be.rejected();
		});
	});
});
