// global namespace for app, deal with application common logics and application global state

define(['lodash'], function (_) {
	var app = {

	};

	window.console = window.console || {
		log: function () {

		},

		time: function () {

		},

		timeEnd: function () {

		},

		debug: function () {

		}
	};

	return app;
});
