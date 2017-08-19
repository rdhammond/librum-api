const restify = require('restify'),
	mongoose = require('mongoose'),
	config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb, {useMongoClient: true});

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

require('./lib/book.router.v1')(server, config);
require('./lib/cover.router.v1')(server, config);

server.listen(config.port, () => {
	console.log(`Librum API listening on ${server.url}`);
});
