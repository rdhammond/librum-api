const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const schema = Schema({
	cover: {type: Buffer, required: true},
	thumbnail: {type: Buffer, required: true},
	mimetype: {type: String, required: true, match: /^image\//}
});

module.exports = mongoose.model('Cover', schema);
