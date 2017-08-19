const Mockgoose = require('mockgoose').Mockgoose,
	mongoose = require('mongoose'),
	restify = require('./restify-harness'),
	Book = require('../book.model'),
	BookRouter = require('../book.router.v1'),
	should = require('should'),
	bookData = require('./book-data'),
	RestlerAsync = require('./restler-async'),
	fs = require('fs');

mongoose.Promise = global.Promise;

const TEST_PORT = 8010;
const restler = new RestlerAsync(`http://localhost:${TEST_PORT}`);

var ids;

before(async function() {
	const mockgoose = new Mockgoose(mongoose);
	await mockgoose.prepareStorage();
	mongoose.connect('mongodb://localhost/book.router.v1', {useMongoClient: true});

	const server = new restify(BookRouter);
	await server.listenAsync(TEST_PORT);
});

beforeEach(async function() {
	ids = await bookData.load();
});

afterEach(function() {
	return bookData.unload();
});

describe('book.router.v1', function() {
	describe('#get', function() {
		it('should return all if no limits', async function() {
			const obj = await restler.getAsync('/api/v1/book');
			obj.should.be.ok();
			obj.should.not.have.property('query');
			obj.should.have.property('books');
			obj.books.should.have.property('length', 10);
		});

		it('should limit by query if specified', async function() {
			const obj  = await restler.getAsync('/api/v1/book?q=XYZ');
			obj.should.be.ok();
			obj.query.should.eql('XYZ');
			obj.should.have.property('books');
			obj.books.should.have.property('length', 3);
		});

		it('should limit by page if specified', async function() {
			await bookData.load();
			await bookData.load();

			const obj = await restler.getAsync('/api/v1/book?pn=2');
			obj.should.be.ok();
			obj.should.have.property('pageNum', 2);
			obj.should.have.property('maxPages', 2);
			obj.should.have.property('books');
			obj.books.should.have.property('length', 15);
		});
	});

	describe('#get/:id', function() {
		it('should return requested book', async function() {
			const obj = await restler.getAsync(`/api/v1/book/${ids[0]}`);
			obj.should.be.ok();
			obj.should.containEql(bookData.data[0]);
		});

		it('should return 404 if not found', function() {
			return restler.getAsync('/api/v1/book/AAAAAAAAAAAAAAAAAAAAAAAA')
			.should.eventually.have.property('code', 'ResourceNotFound');
		});
	});

	describe('#post', function() {
		it('should post book via JSON without cover', async function() {
			const obj = await restler.postAsync('/api/v1/book', {
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
			const obj = await restler.postAsync(
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

			const obj = await restler.postAsync('/api/v1/book', {
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
			const obj = await restler.patchAsync(
				`/api/v1/book/${ids[0]}`,
				{notes: 'Test 123'}
			);
			obj.should.eql('');

			const book = await Book.findById(ids[0]);
			should(book).be.ok();
			book.should.have.property('notes', 'Test 123');
		});

		it('should return 404 on bad id', function() {
			return restler.patchAsync(
				'/api/v1/book/AAAAAAAAAAAAAAAAAAAAAAAA',
				{notes: 'Test 123'}
			)
			.should.eventually.have.property('code', 'ResourceNotFound');
		});
	});
});
