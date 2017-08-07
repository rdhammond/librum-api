const Cover = require('./cover.model'),
	Book = require('./book.model'),
	imageSvc = require('./image.service'),
	multer = require('multer');

require('../promise.extensions');

const upload = multer({dest: 'uploads/'});

const router = {
	consumeCover: function(id, path) {
		return Book.findById(id)
		.then(book => {
			if (!book)
				return null;

			return imageSvc.consumeCover(path)
			.thenSpread((cover, thumbnail, mimetype) => {
				const model = new Cover({cover, thumbnail, mimetype});
				return model.save();
			})
			.then(cover => {
				book.cover = cover;
				return book.save();
			});
		});
	}
};

module.exports = function(app) {
	//
	// ** TODO: Get v1, model name, etc. from settings.
	//
	app.get('/api/v1/Cover/:bookid', function(req, res, next) {
		Book.findById(req.params.bookid, 'cover')
		.then(book => {
			if (!book)
				res.sendStatus(404);
			if (!cover)
				// ** TODO: Return stock photo instead
				return res.sendStatus(404);

			res.set('Content-Type', book.cover.mimetype);
			res.send(book.cover.cover);
		})
		.catch(next);
	});

	app.get('/api/v1/Cover/:bookid/thumbnail', function(req, res, next) {
		Book.findById(req.params.bookid, 'thumbnail')
		.then(book => {
			if (!book)
				return res.sendStatus(404);
			if (!book.thumbnail)
				// ** TODO: Return stock photo
				return res.sendStatus(404);

			res.set('Content-Type', book.cover.mimetype);
			res.send(book.cover.thumbnail);
		})
		.catch(next);
	});

	app.patch('/api/v1/Cover/:bookid', upload.single('cover'), function(req, res, next) {
		if (!req.file)
			return res.sendStatus(500);

		router.consumeCover(req.params.bookid, req.file.path)
		.then(book => res.sendStatus(book ? 200 : 404))
		.catch(next);
	});

	app.post('/api/v1/Cover/preview', upload.single('cover'), function(req, res, next) {
		if (!req.file)
			return res.sendStatus(500);

		imageSvc.consumePreviewUri(req.file.path)
		.then(base64uri => res.send({base64uri}))
		.catch(next);
	});

	return router;
};
