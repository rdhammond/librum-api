const Book = require('./book.model'),
	imageSvc = require('./image.service'),
	errors = require('restify-errors'),
	multer = require('multer');

const version = '1.0.0';
const path = '/api/v1/cover';

async function sendImage(bookId, type, next) {
	if (type !== 'thumbnail')
		type = 'cover';

	const book = await Book.findById(bookId)
		.select('cover')
		.exec();

	if (!book)
		return new errors.ResourceNotFoundError();

	if (!book.cover) {
		res.send(204);
		next();
		return;
	}
	res.header('Content-Type', book.cover.mimetype);
	res.send(book.cover[type]);
	next();
}

module.exports = (server, config) => {
	const upload = multer({dest: config.tempDir});
	
	server.get({path: `${path}/:id`, version}, async (req, res, next) => {
		const book = await Book.findById(req.params.id)
			.select('cover')
			.exec();

		if (!book) {
			next(new errors.ResourceNotFoundError());
			return;
		}
		if (!book.cover) {
			res.send(204);
			next();
			return;
		}

		res.header('Content-Type', book.cover.mimetype);
		res.send(book.cover.cover);
		next();
	});

	server.get({path: `${path}/:id/thumbnail`, version}, async (req, res, next) => {
		const book = await Book.findById(req.params.id)
			.select('cover')
			.exec();

		if (!book) {
			next(new errors.ResourceNotFoundError());
			return;
		}
		if (!book.cover) {
			res.send(204);
			next();
			return;
		}

		res.header('Content-Type', book.cover.mimetype);
		res.send(book.cover.thumbnail);
		next();
	});

	server.post({path: `${path}/preview`, version}, upload.single('cover'), async (req, res, next) => {
		if (!req.files || !req.files.cover) {
			next(new errors.BadRequestError());
			return;
		}
		const base64uri = await imageSvc.consumePreviewUri(req.files.cover.path);
		res.send({base64uri});
		next();
	});

	return server;
};
