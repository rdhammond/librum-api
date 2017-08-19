const Mockgoose = require('mockgoose').Mockgoose,
	mongoose = require('mongoose'),
	restify = require('restify'),
	Book = require('../book.model'),
	CoverRouter = require('../cover.router.v1'),
	should = require('should'),
	bookData = require('./book-data'),
	restler = require('restler'),
	fs = require('fs'),
	imageSvc = require('../image.service');

const TEST_PORT = 8011;

var firstId, secondId;

function listenAsync(server) {
	return new Promise((res, rej) => {
		try {
			server.listen(TEST_PORT, err => {
				err ? rej(err) : res();
			});
		}
		catch(e) {
			rej(e);
		}
	});
}

function getAsync(url) {
	return new Promise((res, rej) => {
		try {
			restler.get(`http://localhost:${TEST_PORT}${url}`)
			.on('complete', data => res(data))
			.on('error', err => rej(err));
		}
		catch(e) {
			rej(e);
		}
	});
}

function postAsync(url, data, multipart) {
	return new Promise((res, rej) => {
		try {
			restler.post(`http://localhost:${TEST_PORT}${url}`, {
				multipart, data
			})
			.on('complete', data => res(data))
			.on('error', err => rej(err));
		}
		catch(e) {
			rej(e);
		}
	});
}

function patchAsync(url, data) {
	return new Promise((res, rej) => {
		try {
			restler.patch(`http://localhost:${TEST_PORT}${url}`, {data})
			.on('complete', data => res(data))
			.on('error', data => rej(data));
		}
		catch (e) {
			rej(e);
		}
	});
}

before(async function() {
	mongoose.Promise = global.Promise;
	const mockgoose = new Mockgoose(mongoose);
	await mockgoose.prepareStorage();
	mongoose.connect('mongodb://localhost/dummy', {useMongoClient: true});

	server = restify.createServer();
	server.use(restify.plugins.queryParser());
	server.use(restify.plugins.bodyParser());
	CoverRouter(server, {tempDir: './test/uploads'});
	await listenAsync(server);
});

beforeEach(async function() {
	const ids = await bookData.load();
	firstId = ids[0];
	secondId = ids[1];
});

afterEach(function() {
	return bookData.unload();
});

describe('cover.router.v1', function() {
	describe('#get/:id', function() {
		beforeEach(async function() {
			fs.linkSync('./test/source.jpg', './test/test.jpg');

			const cover = await imageSvc.consumeCover('./test/test.jpg');
			await Book.findByIdAndUpdate(firstId, {cover});
		});

		afterEach(function() {
			if (fs.existsSync('./test/test.jpg'))
				fs.unlinkSync('./test/test.jpg');
		});

		it('should return 404 if bad id', async function() {
			var obj = await getAsync('/api/v1/cover/AAAAAAAAAAAAAAAAAAAAAAAA');
			should(obj).be.ok();
			obj.should.have.property('code', 'ResourceNotFound');
		});

		it('should return 204 if no cover', async function() {
			var obj = await getAsync(`/api/v1/cover/${secondId}`);
			obj.should.eql('');
		});

		it('should return cover on success', async function() {
			var obj = await getAsync(`/api/v1/cover/${firstId}`);
			should(obj).be.ok();
		});
	});

	describe('#get/:id/thumbnail', function() {
		beforeEach(async function() {
			fs.linkSync('./test/source.jpg', './test/test.jpg');

			const cover = await imageSvc.consumeCover('./test/test.jpg');
			await Book.findByIdAndUpdate(firstId, {cover});
		});

		afterEach(function() {
			if (fs.existsSync('./test/test.jpg'))
				fs.unlinkSync('./test/test.jpg');
		});

		it('should return 404 if bad id', async function() {
			var obj = await getAsync('/api/v1/cover/AAAAAAAAAAAAAAAAAAAAAAAA/thumbnail');
			should(obj).be.ok();
			obj.should.have.property('code', 'ResourceNotFound');
		});

		it('should return 204 if no cover', async function() {
			var obj = await getAsync(`/api/v1/cover/${secondId}/thumbnail`);
			obj.should.eql('');
		});

		it('should return cover on success', async function() {
			var obj = await getAsync(`/api/v1/cover/${firstId}/thumbnail`);
			should(obj).be.ok();
		});
	});

	describe('#post/preview', function() {
		it('should return 500 if no file', async function() {
			var obj = await postAsync('/api/v1/cover/preview');
			should(obj).be.ok();
			obj.should.have.property('code', 'BadRequest');
		});

		it('should return base64uri if successful', async function() {
			var obj = await postAsync(
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
