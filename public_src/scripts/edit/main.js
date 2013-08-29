define([
	'./EditView',
	'app',
	'backbone',
	'jquery',
	'common/utils'
], function(EditView, app, Backbone, $, utils) {
	return function(router, routeName) {
		var model = new Backbone.Model(),
			editView = new EditView({
				model: model,
			});

		// here we have no data need to set to model, so, just trigger change event.	
		model.trigger('change');

		$('#main').append(editView.el);

		function initEditor() {
			console.log('begin init ');
			window.editor = ace.edit(editView.$el.find('#editor')[0]);
			$('#editor').height($('.sidebar').height());
			editor.setTheme("ace/theme/textmate");
			editor.getSession().setMode("ace/mode/javascript");
			editor.focus();
			editor.on('change', function(e) {
				console.log(e);
			});
		}
		
		if (typeof ace == 'undefined') {
			console.log('undefined');
			utils.loadScript('/ace-builds-1.1.01/src-noconflict/ace.js', function() {
				initEditor();
			});
		} else {
			initEditor();
		}

		app.views.push(editView);
	};
});