define([
	'./IndexView',
	'app',
	'backbone'
], function (IndexView, app, Backbone) {
	return function (router, routeName) {
		var model = new Backbone.Model(),
			indexView = new IndexView({
				model: model,
			});

		// here we have no data need  to set to model, so, just trigger change event.	
		model.trigger('change');

		$('#main').append(indexView.el);
		
		app.views.push(indexView);
	};
});
