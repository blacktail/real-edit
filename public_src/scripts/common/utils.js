define([], function () {
	return {
		loadScript: function (url, cb) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			document.body.appendChild(script);

			script.onload = cb || function() {};
		}
	};
});
