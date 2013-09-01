define([], function () {
	return {
		loadScript: function (url, cb) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			document.body.appendChild(script);

			script.onload = cb || function() {};
		},
		merge: function (text, changes) {
			text = text || '';

			_.each(changes, function (cg) {
				if (_.isArray(cg)) {
					var op = cg[1],
						start = cg[2],
						end = cg[3],
						t = cg[4] || '';

					if (op == -1) {
						text = text.substring(0, start) +
							text.substring(end);
					} else {
						text = text.substring(0, start) + t +
							text.substring(start);
					}
				}
			});

			return text;
		}
	};
});
