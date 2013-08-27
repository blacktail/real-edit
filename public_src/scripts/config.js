require.config({
	baseUrl: '/scripts',
	paths: {
		'jquery': '../components/jquery/jquery',
		'lodash': '../components/lodash/lodash',
		'bootstrap-affix': '../components/bootstrap/js/bootstrap-affix',
		'bootstrap-alert': '../components/bootstrap/js/bootstrap-alert',
		'bootstrap-transition': '../components/bootstrap/js/bootstrap-transition',
		'bootstrap-dropdown': '../components/bootstrap/js/bootstrap-dropdown',
		'bootstrap-tooltip': '../components/bootstrap/js/bootstrap-tooltip',
		'bootstrap-modal': '../components/bootstrap/js/bootstrap-modal',
		'socket.io': 'common/socket.io'
	},
	shim: {
		'bootstrap-alert': ['jquery'],
		'bootstrap-affix': ['jquery'],
		'bootstrap-transition': ['jquery'],
		'bootstrap-dropdown': ['jquery'],
		'bootstrap-tooltip': ['jquery'],
		'bootstrap-modal': ['jquery'],
		'socket.io': {
			exports: 'io'
		}
	},

	urlArgs: "bust=" +  (new Date()).getTime()
});
