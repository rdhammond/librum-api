const Mockgoose = require('mockgoose').Mockgoose,
	mongoose = require('mongoose'),
	restify = require('restify'),
	Book = require('../book.model'),
	BookRouter = require('../book.router.v1'),
	should = require('should'),
	bookData = require('./book-data'),
	restler = require('restler'),
	fs = require('fs');

const TEST_PORT = 8010;

var firstId;

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
	mongoose.connect('mongodb://localhost/bookrouter', {useMongoClient: true});

	server = restify.createServer();
	server.use(restify.plugins.queryParser());
	server.use(restify.plugins.bodyParser());
	BookRouter(server, {tempDir: './test/uploads'});
	await listenAsync(server);
});

beforeEach(async function() {
	const ids = await bookData.load();
	firstId = ids[0];
});

afterEach(function() {
	return bookData.unload();
});

describe('book.router.v1', function() {
	describe('#get', function() {
		it('should return all if no limits', async function() {
			const obj = await getAsync('/api/v1/book');
			obj.should.be.ok();
			obj.should.not.have.property('query');
			obj.should.have.property('books');
			obj.books.should.have.property('length', 10);
		});

		it('should limit by query if specified', async function() {
			const obj  = await getAsync('/api/v1/book?q=XYZ');
			obj.should.be.ok();
			obj.query.should.eql('XYZ');
			obj.should.have.property('books');
			obj.books.should.have.property('length', 3);
		});

		it('should limit by page if specified', async function() {
			await bookData.load();
			await bookData.load();

			const obj = await getAsync('/api/v1/book?pn=2');
			obj.should.be.ok();
			obj.should.have.property('pageNum', 2);
			obj.should.have.property('maxPages', 2);
			obj.should.have.property('books');
			obj.books.should.have.property('length', 15);
		});
	});

	describe('#get/:id', function() {
		it('should return requested book', async function() {
			const obj = await getAsync(`/api/v1/book/${firstId}`);
			obj.should.be.ok();
			obj.should.containEql(bookData.data[0]);
		});

		it('should return 404 if not found', function() {
			return getAsync('/api/v1/book/AAAAAAAAAAAAAAAAAAAAAAAA')
			.should.eventually.have.property('code', 'ResourceNotFound');
		});
	});

	describe('#post', function() {
		it('should post book via JSON without cover', async function() {
			const obj = await postAsync('/api/v1/book', {
				title: 'ABC',
				author: 'XYZ',
				estValue: 1
			});
			obj.should.be.ok();
			obj.should.have.property('id');

			const book = await Book.findById(obj.id).exec();
			book.should.be.ok();
			book.should.have.property('_id', new mongoose.Types.ObjectId(obj.id));
		});

		it('should post book via multipart without cover', async function() {
			const obj = await postAsync(
				'/api/v1/book',
				{ title: 'ABC', author: 'XYZ', estValue: 1 },
				true
			);
			should(obj).be.ok();
			obj.should.have.property('id');

			const book = await Book.findById(obj.id).exec();
			should(book).be.ok();
			book.should.have.property('_id', new mongoose.Types.ObjectId(obj.id));
		});

		it('should post book via multipart with cover', async function() {
			const stat = fs.statSync('./test/source.jpg');

			const obj = await postAsync('/api/v1/book', {
				title: 'ABC',
				author: 'XYZ',
				estValue: 1,
				cover: restler.data('cover', 'image/jpeg', fs.readFileSync('./test/source.jpg'))
			}, true);
			should(obj).be.ok();
			obj.should.have.property('id');

			const book = await Book.findById(obj.id);
			should(book).be.ok();
			book.should.have.property('_id', new mongoose.Types.ObjectId(obj.id));
			book.should.have.property('cover');
			book.cover.should.have.property('cover');
			book.cover.should.have.property('thumbnail');
			book.cover.should.have.property('mimetype');
		});
	});

	describe('#patch/:id', function() {
		it('should save changes', async function() {
			const obj = await patchAsync(
				`/api/v1/book/${firstId}`,
				{notes: 'Test 123'}
			);
			obj.should.eql('');

			const book = await Book.findById(firstId);
			should(book).be.ok();
			book.should.have.property('notes', 'Test 123');
		});

		it('should return 404 on bad id', function() {
			return patchAsync(
				'/api/v1/book/AAAAAAAAAAAAAAAAAAAAAAAA',
				{notes: 'Test 123'}
			)
			.should.eventually.have.property('code', 'ResourceNotFound');
		});
	});
});
