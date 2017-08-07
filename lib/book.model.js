const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

function hasYearOrEra() {
	return this.year || this.era;
}

function hasCoverOrThumbnail() {
	return this.cover || this.thumbnail;
}

const schema = Schema({
	title: {type: String, required: true},
	author: {type: String, required: true},
	year: {type: Number, min: 1, required: hasYearOrEra},
	era: {type: String, enum: ['BCE', 'CE'], required: hasYearOrEra},
	publisher: String,
	estValue: {type: Number, min: 0, required: true},
	cover: {type: Schema.Types.ObjectId, ref: 'Cover'}
});

module.exports = mongoose.model('Book', schema);
