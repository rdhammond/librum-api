const fs = require('fs'),
	should = require('should');

require('../fs.extensions');

const TEST_PATH = './test/test.txt',
	TEST_STRING = 'Testing.';

describe('fs', function() {
	describe('#readAndUnlink', function() {
		beforeEach(function() {
			fs.writeFileSync(TEST_PATH, TEST_STRING);
		});

		afterEach(function() {
			if (fs.existsSync(TEST_PATH))
				fs.unlinkSync(TEST_PATH);
		});

		it('should exist after require', function() {
			should(fs.readAndUnlink).be.ok();
		});

		it('should read file to buffer', function() {
			return fs.readAndUnlink(TEST_PATH)
			.should.eventually.be.instanceof(Buffer);
		});

		it('should remove after read', function() {
			return fs.readAndUnlink(TEST_PATH)
			.then(() => {
				fs.existsSync(TEST_PATH).should.not.be.ok();
			});
		});

		it('should handle errors gracefully', function() {
			fs.readAndUnlink('BAD FILE DJFKL')
			.should.be.rejected();
		});
	});
});
