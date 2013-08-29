define([
	'lodash',
	'backbone',
	'edit/templates',
	'jquery',
	'common/utils'
], function(_, Backbone, templates, $, utils) {
	var EditView = Backbone.View.extend({
		tagName: 'div',
		id: 'editPage',

		template: templates.edit,

		events: {
		},

		initialize: function(options) {
			this.render();
		},

		render: function(model) {
			this.$el.html(this.template(this.model.toJSON()));
		}
	});

	return EditView;
});
