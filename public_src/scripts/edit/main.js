define([
	'./EditView',
	'app',
	'backbone',
	'jquery',
	'common/utils',
	'common/PromptView',
	'socket.io'
], function (EditView, app, Backbone, $, utils, ModalView, io) {
	return function (router, routeName, initData, fileName) {
		var model = new Backbone.Model(),
			editView = new EditView({
				model: model,
				fileName: fileName
			});

		app.views.push(editView);

		$('#main').append(editView.el);

		model.set({
			user: localStorage.realEditUser || '',
			language: localStorage.realEditProgLang || 'javascript',
			keybindi: localStorage.realEditKeyBindi || '',
			theme: localStorage.realEditTheme || 'ace/theme/textmate',
			fileName: fileName
		});
	};
});
