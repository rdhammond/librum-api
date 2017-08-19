const Mockgoose = require('mockgoose').Mockgoose,
	mongoose = require('mongoose'),
	restify = require('./restify-harness'),
	Book = require('../book.model'),
	CoverRouter = require('../cover.router.v1'),
	should = require('should'),
	bookData = require('./book-data'),
	RestlerAsync = require('./restler-async'),
	fs = require('fs'),
	imageSvc = require('../image.service');

mongoose.Promise = global.Promise;

const TEST_PORT = 8011;
const restler = new RestlerAsync(`http://localhost:${TEST_PORT}`);

var ids;

before(async function() {
	const mockgoose = new Mockgoose(mongoose);
	await mockgoose.prepareStorage();
	mongoose.connect('mongodb://localhost/cover.router.v1', {useMongoClient: true});

	const server = new restify(CoverRouter);
	await server.listenAsync(TEST_PORT);
});

beforeEach(async function() {
	ids = await bookData.load();
});

afterEach(function() {
	return bookData.unload();
});

describe('cover.router.v1', function() {
	describe('#get/:id', function() {
		beforeEach(async function() {
			fs.linkSync('./test/source.jpg', './test/test.jpg');

			const cover = await imageSvc.consumeCover('./test/test.jpg');
			await Book.findByIdAndUpdate(ids[0], {cover});
		});

		afterEach(function() {
			if (fs.existsSync('./test/test.jpg'))
				fs.unlinkSync('./test/test.jpg');
		});

		it('should return 404 if bad id', async function() {
			var obj = await restler.getAsync('/api/v1/cover/AAAAAAAAAAAAAAAAAAAAAAAA');
			should(obj).be.ok();
			obj.should.have.property('code', 'ResourceNotFound');
		});

		it('should return 204 if no cover', async function() {
			var obj = await restler.getAsync(`/api/v1/cover/${ids[1]}`);
			obj.should.eql('');
		});

		it('should return cover on success', async function() {
			var obj = await restler.getAsync(`/api/v1/cover/${ids[0]}`);
			should(obj).be.ok();
		});
	});

	describe('#get/:id/thumbnail', function() {
		beforeEach(async function() {
			fs.linkSync('./test/source.jpg', './test/test.jpg');

			const cover = await imageSvc.consumeCover('./test/test.jpg');
			await Book.findByIdAndUpdate(ids[0], {cover});
		});

		afterEach(function() {
			if (fs.existsSync('./test/test.jpg'))
				fs.unlinkSync('./test/test.jpg');
		});

		it('should return 404 if bad id', async function() {
			var obj = await restler.getAsync('/api/v1/cover/AAAAAAAAAAAAAAAAAAAAAAAA/thumbnail');
			should(obj).be.ok();
			obj.should.have.property('code', 'ResourceNotFound');
		});

		it('should return 204 if no cover', async function() {
			var obj = await restler.getAsync(`/api/v1/cover/${ids[1]}/thumbnail`);
			obj.should.eql('');
		});

		it('should return cover on success', async function() {
			var obj = await restler.getAsync(`/api/v1/cover/${ids[0]}/thumbnail`);
			should(obj).be.ok();
		});
	});

	describe('#post/preview', function() {
		it('should return 500 if no file', async function() {
			var obj = await restler.postAsync('/api/v1/cover/preview');
			should(obj).be.ok();
			obj.should.have.property('code', 'BadRequest');
		});

		it('should return base64uri if successful', async function() {
			var obj = await restler.postAsync(
				'/api/v1/cover/preview',
				{cover: restler.data('cover', 'image/jpeg', fs.readFileSync('./test/source.jpg'))},
				true
			);
			should(obj).be.ok();
			obj.should.have.property('base64uri');
			obj.base64uri.should.match(/^data:image\/jpeg;base64,/);
		});
	});
});
