// ** PICK UP HERE: Testing
const jimp = require('jimp'),
	fs = require('fs');

const COVER_SIZE = [200, 300];
const THUMBNAIL_SIZE = [50, 75];

require('../fs.extensions');
require('../jimp.extensions');

async function containImage(buf, w, h) {
	const img = await jimp.readAsync(buf);
	return img.contain(w, h).getBufferAsync(jimp.AUTO);
}

module.exports = {
	consumeCover: async (path) => {
		const buf = await fs.readAndUnlink(path);
		const cover = await containImage(buf, ...COVER_SIZE);
		const thumbnail = await containImage(buf, ...THUMBNAIL_SIZE);
		const mimetype = (await jimp.readAsync(buf)).getMIME();
		return {cover, thumbnail, mimetype};
	},

	consumePreviewUri: async (path) => {
		const buf = await fs.readAndUnlink(path);
		const img = await jimp.readAsync(buf);
		return img.contain(...THUMBNAIL_SIZE).getBase64Async(jimp.AUTO);
	}
};
