define([
	'lodash'
], function (_) {
	return {
		select: function (selected, options) {
			var attrs = _.keys(options.hash).map(function (key) {
				return key + '="' + options.hash[key] + '"';
			}).join(' ');

			var ret = '<select ' + attrs + '>';

			var opts = options.fn(this).replace(/value\s*=\s*("|')?([^><\b]*)\1/g, function (match, match1, match2) {
				if (match2 == selected) {
					return match + ' selected';
				} else {
					return match;
				}
			});

			ret += opts;
			ret += '</select>';

			return ret;
		}
	};
});
