const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const NOTES_MAX_LEN = 100;

function hasYearOrEra() {
	return this.year || this.era;
}

function notesMaxLen(val) {
	return !val || val.length <= NOTES_MAX_LEN;
}

function scrubRegex(query) {
	return query.replace(/[^A-Za-z0-9\-\. ]/g, '')
		.replace(/\./g, '\\.');
}

const coverSchema = Schema({
	cover: {type: Buffer, required: true},
	thumbnail: {type: Buffer, required: true},
	mimetype: {type: String, required: true, match: /image\//}
});

const schema = Schema({
	title: {type: String, required: true},
	author: {type: String, required: true},
	year: {type: Number, min: 1, required: hasYearOrEra},
	era: {type: String, enum: ['BCE', 'CE'], required: hasYearOrEra},
	publisher: String,
	estValue: {type: Number, min: 0, required: true},
	notes: {type: String, validate: notesMaxLen},
	cover: coverSchema
});

schema.statics.search = (opts) => {
	if (!opts.searchLimit || !(opts.searchLimit > 0)) {
		return {
			exec: () => Promise.reject(new Error('searchLimit is required.'))
		};
	}

	const Book = mongoose.model('Book');
	const pageNum = !(opts.pageNum >= 0) ? null : parseInt(opts.pageNum, 10);
	const pageSize = !(opts.pageSize > 0) ? null : parseInt(opts.pageSize, 10);
	let search = Book.find({});

	if (opts.query) {
		const pattern = new RegExp(scrubRegex(opts.query), 'i');

		search = search.or([
			{title: pattern},
			{author: pattern},
			{publisher: pattern}
		]);
	}
	
	search = search.limit(opts.searchLimit);
	if (pageNum !== null && pageSize !== null) {
		search = search.skip(pageSize*pageNum).limit(pageSize);
	}
	return search;
};

module.exports = mongoose.model('Book', schema);
