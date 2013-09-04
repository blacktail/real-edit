var moment = require('moment'),
	_ = require('lodash');

module.exports = function (Handlebars) {
	Handlebars.registerHelper('timeFormat', function (context, options) {
		return moment(context).format(options.hash.format || 'YYYY-MM-DD HH:mm:ss SSS');
	});

	Handlebars.registerHelper('pageRange', function (curPage, totalPage, options) {
		var html = ''
		var range = parseInt(options.hash.range || 3),
			pageUrlPrefix = options.hash.urlPrefix;

		curPage = parseInt(curPage);

		var lefts = _.range(Math.max(curPage - range, 1), curPage);
		var rights = _.range(curPage + 1, Math.min(curPage + range + 1 + Math.max(range - lefts.length, 0), totalPage + 1));

		var starts = [];
		if (lefts[0] > 1) {
			starts = ['s', '...'];
		}

		var ends = [];

		if (rights[rights.length - 1] < totalPage) {
			ends = ['...', 'e'];
		}

		var pages = starts.concat(lefts).concat(curPage).concat(rights).concat(ends);

		var displayMap = {
			s: 'first',
			e: 'last'
		};

		var pageNoMap = {
			s: 1,
			e: totalPage
		};

		_.each(pages, function (pageNo) {
			var activeClass = '',
				display = displayMap[pageNo] || pageNo,
				pageNo = pageNoMap[pageNo] || pageNo;

			if (curPage == pageNo) {
				activeClass = 'active';
			}

			if (pageNo == '...') {
				activeClass = 'disabled';
			}

			html += options.fn({
				pageNo: pageNo,
				display: display,
				active: activeClass,
				disabled: pageNo == '...' ? true : false
			});
		});

		return html;
	});
};
