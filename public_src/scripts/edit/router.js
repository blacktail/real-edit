define([
	'app',
	'lodash',
	'BaseRouter'
], function (app, _, BaseRouter) {
	return BaseRouter.extend({
		routes: {
			"(/):filename": "edit"
		},

		edit: function () {
			this.switchTopView('edit', 'edit', arguments);
		}
	});
});
