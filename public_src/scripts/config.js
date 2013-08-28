require.config({
	baseUrl: '/scripts',
	packages: ['index', 'edit', 
		'common/templates', 'index/templates', 'edit/templates'],
	paths: {
		'jquery': '../components/jquery/jquery',
		'lodash': '../components/lodash/lodash',
		'backbone': '../components/backbone/backbone',
		'handlebars': '../components/handlebars/handlebars',
		'bootstrap-affix': '../components/bootstrap/js/bootstrap-affix',
		'bootstrap-alert': '../components/bootstrap/js/bootstrap-alert',
		'bootstrap-transition': '../components/bootstrap/js/bootstrap-transition',
		'bootstrap-dropdown': '../components/bootstrap/js/bootstrap-dropdown',
		'bootstrap-tooltip': '../components/bootstrap/js/bootstrap-tooltip',
		'bootstrap-modal': '../components/bootstrap/js/bootstrap-modal',
		'socket.io': 'common/socket.io',
		'common/partials_compiled': 'common/templates/.auto_partials',
		'common/templates_compiled': 'common/templates/.auto_templates',
		'index/templates_compiled': 'index/templates/.auto_templates',
		'edit/templates_compiled': 'edit/templates/.auto_templates'
	},
	shim: {
		'handlebars': {
			exports: 'Handlebars'
		},
		'backbone': {
			deps: ['lodash', 'jquery'],
			exports: 'Backbone'
		},
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
