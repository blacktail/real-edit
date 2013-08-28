define([
	'lodash',
	'backbone',
	'index/templates',
	'jquery',
	'common/utils'
], function (_, Backbone, templates, $, utils) {
	var IndexView = Backbone.View.extend({
		tagName: 'div',
		className: 'container',
		id: 'indexPage',

		template: templates.index,

		events: {
			'keydown #fileName': 'beginEdit'
		},

		initialize: function (options) {
			this.listenTo(this.model, 'change', this.render);
		},

		render: function (model) {
			this.$el.html(this.template(this.model.toJSON()));
		},

		beginEdit: function (event) {
			if (event.which == 13) {
				event.preventDefault();

				var fileName = $.trim(this.$('#fileName').val()) || 'new';
				Backbone.history.navigate('/' + fileName, {trigger: true});
			}
		}
	});

	return IndexView;
});
