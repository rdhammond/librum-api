// ** PICK UP HERE: Testing
const jimp = require('jimp'),
	fs = require('fs');

const COVER_SIZE = [200, 300];
const THUMBNAIL_SIZE = [50, 75];

require('../fs.extensions');
require('../jimp.extensions');

module.exports = {
	consumeCover: async (path) => {
		const buf = await fs.readAndUnlink(path);
		const cover = (await jimp.readAsync(buf)).contain(...COVER_SIZE);
		const thumbnail = (await jimp.readAsync(buf)).contain(...THUMBNAIL_SIZE);

		return {
			cover: await cover.getBufferAsync(jimp.AUTO),
			thumbnail: await thumbnail.getBufferAsync(jimp.AUTO),
			mimetype: cover.getMIME()
		};
	},

	consumePreviewUri: async (path) => {
		const buf = await fs.readAndUnlink(path);
		const img = await jimp.readAsync(buf);
		return img.contain(...THUMBNAIL_SIZE).getBase64Async(jimp.AUTO);
	}
};
