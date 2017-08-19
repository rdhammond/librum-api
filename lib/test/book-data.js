const Book = require('../book.model');

const funcs = {
	data: [
		{title: 'ABC', author: 'XYZ', publisher: 'BCD', estValue: 1},
		{title: 'BCD', author: 'WXY', publisher: 'CDE', estValue: 2},
		{title: 'CDE', author: 'VWX', publisher: 'DEF', estValue: 3},
		{title: 'DEF', author: 'UVW', estValue: 1},
		{title: 'EFG', author: 'TUV', publisher: 'XYZ', estValue: 4.5},
		{title: 'ABC', author: 'WXY', publisher: 'WXY', estValue: 1},
		{title: 'FGH', author: 'VWX', estValue: 4},
		{title: 'XYZ', author: 'ABC', publisher: 'VWX', estValue: 1},
		{title: 'WXY', author: 'BCD', publisher: 'UVW', estValue: 2},
		{title: 'VWX', author: 'CDE', publisher: 'ABC', estValue: 15}
	],

	load: async () => {
		const books = funcs.data.map(x => new Book(x));
		for (let book of books) {
			await book.save();
		}
		return books.map(x => x._id);
	},

	unload: () => {
		return Book.remove({}).exec();
	}
};

module.exports = funcs;
