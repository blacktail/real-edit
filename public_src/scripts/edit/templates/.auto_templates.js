define(["handlebars","text!edit/templates/main.hb","text!edit/templates/message.hb","text!edit/templates/users.hb"], function (Handlebars,arg0,arg1,arg2) {
	return {
		"edit": Handlebars.compile(arg0),
		"edit/message": Handlebars.compile(arg1),
		"edit/users": Handlebars.compile(arg2)
	};
});