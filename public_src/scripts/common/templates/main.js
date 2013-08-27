define([
	'handlebars',
	'./helpers',
	'common/partials_compiled',
	'common/templates_compiled',
	'lodash'
], function (Handlebars, helpers, partials, templates, _) {
	// register helpers
	_.each(helpers || [], function (helper, name) {
		Handlebars.registerHelper(name, helper);
	});

	return templates;
});
