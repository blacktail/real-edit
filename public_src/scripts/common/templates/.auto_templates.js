define(["handlebars","text!common/templates/alert.hb","text!common/templates/modal.hb"], function (Handlebars,arg0,arg1) {
	return {
		"common/alert": Handlebars.compile(arg0),
		"common/modal": Handlebars.compile(arg1)
	};
});