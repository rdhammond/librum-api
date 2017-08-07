const express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
	restify = require('express-restify-mongoose'),
	config = require('./config'),
	Book = require('./lib/book.model'),
	Cover = require('./lib/cover.model');

require('./promise.extensions');
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb, {useMongoClient: true});

const app = express();
const router = express.Router();
app.use(bodyParser.json());
app.use(methodOverride());

require('./lib/covers-custom.router')(app);

restify.serve(router, Book);
restify.serve(router, Cover);
app.use(router);

app.listen(config.port, () => {
	console.log('Librum API server listening on port %d', config.port);
});
