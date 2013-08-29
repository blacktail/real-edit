define([
	'common/ModalView'
], function (ModalView) {
	var AlertView = ModalView.extend({
		initialize: function (options) {
			this.title = options.title || 'Alert';
			this.body = options.prompt || '';
			this.footer = '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';

			this.render();
		}
	});

	return AlertView;
});
