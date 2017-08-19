const Mockgoose = require('mockgoose').Mockgoose,
	mongoose = require('mongoose'),
	Book = require('../book.model'),
	should = require('should'),
	bookData = require('./book-data');

mongoose.Promise = global.Promise;
const mockgoose = new Mockgoose(mongoose);

before(async function() {
	await mockgoose.prepareStorage();

	mongoose.connect(
		'mongodb://localhost/bookmodel',
		{useMongoClient: true}
	);
});

beforeEach(function() {
	return bookData.load();
});

afterEach(function() {
	return bookData.unload();
});

describe('Book', function() {
	describe('#validate', function() {
		it('should not allow if era but no year', function() {
			const book = new Book({
				title: 'A',
				author: 'B',
				era: 'BCE',
				estValue: 1
			});
			book.save().should.be.rejected();
		});

		it('should not allow if year but no era', function() {
			const book = new Book({
				title: 'A',
				author: 'B',
				year: 1980,
				estValue: 1
			});
			book.save().should.be.rejected();
		});

		it('should not allow if era is invalid', function() {
			const book = new Book({
				title: 'A',
				author: 'B',
				year: 1980,
				era: 'XYZ',
				estValue: 1
			});
			book.save().should.be.rejected();
		});
	});

	describe('#search', function() {
		it('should reject if no searchLimit', function() {
			return Book.search({}).exec()
			.should.be.rejected();
		});

		it('should reject if isNaN(searchLimit)', function() {
			return Book.search({searchLimit: 'AbC'}).exec()
			.should.be.rejected();
		});

		it('should reject if searchLimit === 0)', function() {
			return Book.search({searchLimit: 0}).exec()
			.should.be.rejected();
		});

		it('should reject if searchLimit < 0', function() {
			return Book.search({searchLimit: -1}).exec()
			.should.be.rejected();
		});

		it('should limit by searchLimit', function() {
			return Book.search({searchLimit: 5}).exec()
			.should.eventually.have.property('length', 5);
		});

		it('should return up to searchLimit when no query', function() {
			return Book.search({searchLimit: 10}).exec()
			.should.eventually.have.property('length', 10);
		});

		it('should return limited set when query', function() {
			return Book.search({searchLimit: 10, query: 'XYZ'}).exec()
			.should.eventually.have.property('length', 3);
		});

		it('should scrub regex queries before searching', function() {
			return Book.search({searchLimit: 10, query: '.YZ'}).exec()
			.should.eventually.have.property('length', 0);
		});

		it('should limit to page when specified', async function() {
			var results = await Book.search({searchLimit: 10, pageNum: 1, pageSize: 4}).exec()

			results.map(x => x.title).should.eql(
				bookData.data.slice(4,8).map(x => x.title)
			);
		});

		it('should return empty when pageNum out of range', function() {
			return Book.search({searchLimit: 10, pageNum: 10, pageSize: 4}).exec()
			.should.eventually.have.property('length', 0);
		});
	});
});
