define([
	'./EditView',
	'app',
	'backbone',
	'jquery',
	'common/utils',
	'common/PromptView',
], function(EditView, app, Backbone, $, utils, ModalView) {
	return function(router, routeName) {
		var model = new Backbone.Model(),
			editView = new EditView({
				model: model,
			});

		app.views.push(editView);

		$('#main').append(editView.el);

		model.set({
			username: localStorage.realEditUserName || '',
			language: localStorage.realEditProgLang || 'javascript',
			keybindi: localStorage.realEditKeyBindi || '',
			theme: localStorage.realEditTheme || 'textmate'
		});
	};
});
