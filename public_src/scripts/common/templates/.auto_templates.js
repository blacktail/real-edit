define(["handlebars","text!public_src//common/templates/alert.hb","text!public_src//common/templates/partials/footer.hb"], function (Handlebars,arg0,arg1) {
	return {
		"public_src//common/alert": Handlebars.compile(arg0),
		"public_src//common/footer": Handlebars.compile(arg1)
	};
});