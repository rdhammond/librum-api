const restify = require('restify');

function restifyHarness(router) {
	this.server = restify.createServer();
	this.server.use(restify.plugins.queryParser());
	this.server.use(restify.plugins.bodyParser());

	if (router)
		router(this.server, {tempDir: './test/uploads'});
}

restifyHarness.prototype.listenAsync = function(port) {
	return new Promise((res, rej) => {
		try {
			this.server.listen(port, err => err ? rej(err) : res());
		}
		catch(e) {
			rej(e);
		}
	});
};

module.exports = restifyHarness;
