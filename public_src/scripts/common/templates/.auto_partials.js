define(["handlebars","text!common/templates/partials/footer.hb","text!common/templates/partials/keybindings.hb","text!common/templates/partials/languages.hb","text!common/templates/partials/themes.hb"], function (Handlebars,arg0,arg1,arg2,arg3) {
	Handlebars.registerPartial("common/footer", arg0);
	Handlebars.registerPartial("common/keybindings", arg1);
	Handlebars.registerPartial("common/languages", arg2);
	Handlebars.registerPartial("common/themes", arg3);
});