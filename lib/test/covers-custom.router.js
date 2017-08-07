const should = require('should'),
	Router = require('../covers-custom.router'),
	Mockgoose = require('mockgoose').Mockgoose,
	mongoose = require('mongoose'),
	Book = require('../book.model'),
	Cover = require('../cover.model'),
	fs = require('fs');

const BAD_ID = 'AAAAAAAAAAAAAAAAAAAAAAAA';

mongoose.Promise = global.Promise;
const mockgoose = new Mockgoose(mongoose);

const appMock = {
	get: function() {},
	post: function() {},
	patch: function() {},
	delete: function() {}
};

var id;
const router = Router(appMock);

before(function() {
	return mockgoose
		.prepareStorage()
		.then(() => {
			mongoose.connect('mongodb://localhost/test', {useMongoClient: true});
		});
});

function resetBooks() {
	id = undefined;
	return Promise.all([
		Book.remove({}).exec(),
		Cover.remove({}).exec()
	]);
}

function setupBooks() {
	const book = new Book({
		title: 'A',
		author: 'B',
		estValue: 1
	});

	return book.save()
	.then(book => { id = book._id });
}

function setupFiles() {
	fs.linkSync('./test/source.jpg', './test/test.jpg');
	fs.linkSync('./test/covers-custom.router.js', './test/test.txt');
}

function resetFiles() {
	if (fs.existsSync('./test/test.jpg'))
		fs.unlinkSync('./test/test.jpg');
	if (fs.existsSync('./test/test.txt'))
		fs.unlinkSync('./test/test.txt');
}

describe('covers-customer.router', function() {
	describe('#consumeCover', function() {
		before(resetBooks);
		before(resetFiles);
		beforeEach(setupBooks);
		beforeEach(setupFiles);
		afterEach(resetBooks);
		afterEach(resetFiles);

		it('should save new cover', function() {
			return router.consumeCover(id, './test/test.jpg')
			.then(book => {
				should(book.cover).be.ok();

				const cover = book.cover;
				cover.cover.should.be.instanceof(Buffer);
				cover.thumbnail.should.be.instanceof(Buffer);
				cover.mimetype.should.equal('image/jpeg');
			});
		});

		it('should return null if book not found', function() {
			return router.consumeCover(BAD_ID, './test/test.jpg')
			.should.eventually.not.be.ok();
		});

		it('should handle errors gracefully', function() {
			router.consumeCover(id, './test/test.txt')
			.should.be.rejected();
		});
	});
});
