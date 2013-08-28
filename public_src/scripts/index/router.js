define([
	'app',
	'lodash',
	'BaseRouter'
], function (app, _, BaseRouter) {
	return BaseRouter.extend({
		routes: {
			"(/)": "index"
		},

		index: function () {
			this.switchTopView('index', 'index', arguments);
		}
	});
});
