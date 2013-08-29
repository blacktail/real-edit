define([
	'common/ModalView'
], function (ModalView) {
	var PromptView = ModalView.extend({
		events: {
			'click .btn-ok': 'ok',
			'click .btn-close': 'cancel'
		},
		initialize: function (options) {
			this.title = options.title || '';
			this.body = (options.prompt || '') + '<br><br><input type="text" class="prompt-input">';
			this.footer = '<button type="button" class="btn btn-close btn-default" data-dismiss="modal">Close</button>' +
				'<button type="button" class="btn btn-ok btn-primary" data-dismiss="modal">OK</button>';

			this.render();

			this.$('.prompt-input').focus();
		},
		ok: function () {
			this.options.callback && this.options.callback(this.$('.prompt-input').val());
		},
		cancel: function () {
			this.options.callback && this.options.callback(null);
		}
	});

	return PromptView;
});
