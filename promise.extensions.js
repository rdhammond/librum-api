module.exports = (() => {
	Promise.prototype.thenSpread = function(cb) {
		return this.then(function(x) { return cb(...x); });
	};
})();
