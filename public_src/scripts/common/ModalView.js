define([
	'backbone',
	'common/templates'
], function (Backbone, templates) {
	var ModalView = Backbone.View.extend({
		template: templates['common/modal'],

		initialize: function (options) {
			this.title = options.title;
			this.body = options.body;
			this.footer = options.footer;

			this.render();
		},

		render: function () {
			this.$el.html(this.template({
				title: this.title,
				body: this.body,
				footer: this.footer
			}));

			$(document.body).append(this.$el);

			this.$('.modal').modal();
		}
	});

	return ModalView;
});
