const jimp = require('jimp'),
	fs = require('fs');

const COVER_SIZE = [200, 300];
const THUMBNAIL_SIZE = [50, 75];

require('../fs.extensions');
require('../promise.extensions');
require('../jimp.extensions');

module.exports = {
	consumeCover: function(path) {
		return fs.readAndUnlink(path)
		.then(function(buf) {
			return Promise.all([
				jimp.readAsync(buf),
				jimp.readAsync(buf)
			]);
		})
		.thenSpread(function(cover, thumbnail) {
			return Promise.all([
				cover.contain(...COVER_SIZE).getBufferAsync(jimp.AUTO),
				thumbnail.contain(...THUMBNAIL_SIZE).getBufferAsync(jimp.AUTO),
				Promise.resolve(cover.getMIME())
			]);
		});
	},

	consumePreviewUri: path => {
		return fs.readAndUnlink(path)
		.then(jimp.readAsync)
		.then(img => img.contain(...THUMBNAIL_SIZE).getBase64Async(jimp.AUTO));
	}
};
