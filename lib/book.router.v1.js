const Book = require('./book.model'),
	imageSvc = require('./image.service'),
	errors = require('restify-errors'),
	multer = require('multer');

const version = '1.0.0';
const path = '/api/v1/book';

const searchLimit = 100;
const pageSize = 15;

module.exports = (server, config) => {
	const upload = multer({dest: config.tempDir});

	server.get({path, version}, async (req, res, next) => {
		const query = req.query.q;
		const pageNum = req.query.pn - 1;

		let cnt = null;
		if (pageNum >= 0) {
			cnt = await Book.search({query, searchLimit})
				.count()
				.exec();
		}

		const books = await Book.search({query, pageNum, searchLimit, pageSize})
			.select('title author year era publisher estValue')
			.exec();

		const response = {query, books};
		if (pageNum >= 0) {
			response.pageNum = pageNum + 1;
			response.maxPages = Math.ceil(cnt / pageSize);
		}
		res.send(response);
		next();
	});

	server.get({path: `${path}/:id`, version}, async (req, res, next) => {
		const book = await Book.findById(req.params.id)
			.select('title author year era publisher estValue notes')
			.exec();

		if (!book) {
			next(new errors.ResourceNotFoundError());
			return;
		}
		res.send(book);
		next();
	})

	server.post({path, version}, upload.single('cover'), async (req, res, next) => {
		const data = req.body.title ? req.body : req.params;
		if (req.files && req.files.cover)
			data.cover = await imageSvc.consumeCover(req.files.cover.path);
		
		const book = new Book(data);
		await book.save();

		const response = {id: book._id};
		res.send(response);
		next();
	});

	server.patch({path: `${path}/:id`, version}, async (req, res, next) => {
		// ** TODO: We only support notes for now.
		//
		var book = await Book.findByIdAndUpdate(
			req.params.id,
			{notes: req.body.notes}
		)
		.exec();

		if (!book) {
			next(new errors.ResourceNotFoundError());
			return;
		}

		res.send(200);
		next();
	});

	return server;
};
