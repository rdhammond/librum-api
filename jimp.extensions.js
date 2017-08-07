const jimp = require('jimp');

module.exports = (function() {
	jimp.readAsync = function(src) {
		return new Promise(function(res, rej) {
			try {
				jimp.read(src, function(err, buf) {
					return err ? rej(err) : res(buf);
				});
			}
			catch (err) {
				return rej(err);
			}
		});
	};

	jimp.prototype.getBufferAsync = function(mimetype) {
		return new Promise((res, rej) => {
			try {
				this.getBuffer(mimetype, function(err, buf) {
					return err ? rej(err) : res(buf);
				});
			}
			catch (err) {
				return rej(err);
			}
		});
	};

	jimp.prototype.getBase64Async = function(mimetype) {
		return new Promise((res, rej) => {
			try {
				this.getBase64(mimetype, function(err, buf) {
					return err ? rej(err) : res(buf);
				});
			}
			catch(err) {
				return rej(err);
			}
		});
	};
})();
