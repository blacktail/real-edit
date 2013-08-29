var _ = require('lodash');

var utils = {
	getRandomString: getRandomString
};


function getRandomString(minLen, maxLen) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	return _.shuffle(chars).slice(0, _.random(minLen, maxLen)).join('');
}

module.exports = utils;
