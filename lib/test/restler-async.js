const restler = require('restler');

class RestlerAsync {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	getAsync(url) {
		return new Promise((res, rej) => {
			restler.get(this.baseUrl + url)
			.on('complete', data => res(data))
			.on('error', err => rej(err));
		});
	}

	postAsync(url, data, multipart) {
		return new Promise((res, rej) => {
			restler.post(this.baseUrl + url, {data, multipart})
			.on('complete', data => res(data))
			.on('error', err => rej(err));
		});
	}

	patchAsync(url, data) {
		return new Promise((res, rej) => {
			restler.patch(this.baseUrl + url, {data})
			.on('complete', data => res(data))
			.on('error', err => rej(err));
		});
	}

	data(...args) {
		return restler.data(...args);
	}
}

module.exports = RestlerAsync;
