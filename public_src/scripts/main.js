define([
	'lodash',
	'jquery',
	'app',
	'socket.io'
], function (_, $, app, io) {
	$(function () {
		$('#fileName').keydown(function (event) {
			if (event.which == 13) {
				var fileName = $.trim($(this).val()) || 'new';

				location.href = encodeURIComponent(fileName);

				event.preventDefault();
			}
		});
	});
});
