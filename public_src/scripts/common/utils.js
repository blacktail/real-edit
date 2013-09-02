define([], function () {
	return {
		loadScript: function (url, cb) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			document.body.appendChild(script);

			script.onload = cb || function() {};
		},
		merge: function (text, changes, cursorPos) {
			text = text || '';
			var destPos = cursorPos;

			_.each(changes, function (cg) {
				if (_.isArray(cg)) {
					var op = cg[1],
						start = cg[2],
						end = cg[3],
						t = cg[4] || '';

					if (op == -1) {
						text = text.substring(0, start) +
							text.substring(end);

						var dist = Math.max(Math.min(cursorPos, end) - start, 0);
						destPos -= dist;
					} else {
						text = text.substring(0, start) + t +
							text.substring(start);

						if (start <= cursorPos) {
							destPos += t.length;
						}
					}
				}
			});

			if (typeof cursorPos == 'undefined') {
				return text;
			} else {
				return {
					text: text,
					cursorPos: destPos
				};
			}
		}
	};
});
