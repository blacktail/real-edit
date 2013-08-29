define([
	'common/ModalView'
], function (ModalView) {
	var ConfirmView = ModalView.extend({
		events: {
			'click .btn-ok': 'ok',
			'click .btn-close': 'cancel'
		},
		initialize: function (options) {
			this.title = options.title || 'Confirm?';
			this.body = options.prompt || '';
			this.footer = '<button type="button" class="btn btn-close btn-default" data-dismiss="modal">Close</button>' +
				'<button type="button" class="btn btn-ok btn-primary" data-dismiss="modal">OK</button>';

			this.render();
		},
		ok: function () {
			this.options.callback && this.options.callback(true);
		},
		cancel: function () {
			this.options.callback && this.options.callback(false);
		}
	});

	return ConfirmView;
});
