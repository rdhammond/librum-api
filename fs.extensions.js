const fs = require('fs');

module.exports = (function() {
	fs.readAndUnlink = function(path) {
		return new Promise(function(res, rej) {
			try {
				fs.readFile(path, function(err, buf) {
					if (err)
						return rej(err);
					
					fs.unlink(path, function(err) {
						return err ? rej(err) : res(buf);
					});
				});
			}
			catch(err) {
				return rej(err);
			}
		});
	};
})();
