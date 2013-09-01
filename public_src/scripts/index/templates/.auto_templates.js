define(["handlebars","text!index/templates/main.hb"], function (Handlebars,arg0) {
	return {
		"index": Handlebars.compile(arg0)
	};
});