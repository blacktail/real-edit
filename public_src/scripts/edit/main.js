define([
	'./EditView',
	'app',
	'backbone',
	'jquery'
], function (EditView, app, Backbone, $) {
	return function (router, routeName) {
		var model = new Backbone.Model,
			editView = new EditView({
				model: model,
			});

		// here we have no data need to set to model, so, just trigger change event.	
		model.trigger('change');

		$('#main').append(editView.el);

		function initEditor() {
			window.editor = ace.edit(editView.$el.find('#editor')[0]);
			editor.setTheme("ace/theme/monokai");
		    editor.getSession().setMode("ace/mode/javascript");
		    editor.focus();
		    editor.on('change', function (e) {
		    	console.log(e);
		    });
		}

		function loadScript(url, cb){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			document.body.appendChild(script);

			script.onload = cb || function () {};
		}


		if (typeof ace == 'undefined') {
			console.log('undefined');
			loadScript('/ace-builds-1.1.01/src-noconflict/ace.js', function () {
				initEditor();
			});
		} else {
			initEditor();
		}
		
		app.views.push(editView);
	};
});
