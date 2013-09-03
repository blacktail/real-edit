define([
	'lodash'
], function (_) {
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
		},

		mergeChangesIntoRevChanges: function (changes, revChanges) {
			var start = new Date().getTime();

			if (changes.length <= 0) {
				return [];
			}

			if (revChanges.length <= 0) {
				return changes;
			}

			var wantChanges = changes;
			var baseChanges = revChanges;
			var newChanges = [];

			_.each(wantChanges, function (wantChange) {
				wantChange = this.transformChangeBasedChanges(baseChanges, wantChange);
				baseChanges.push(wantChange);
				newChanges.push(wantChange);
			}, this);

			var end = new Date().getTime();
			console.log('time elapsed: ', end - start);

			return newChanges;
		},

		transformChangeBasedChanges: function (baseChanges, change) {
			var wantChange = change;

			_.each(baseChanges, function (baseChange) {
				wantChange = this.operationTransform(baseChange, wantChange);
			}, this);

			return wantChange;
		},

		operationTransform: function (baseChange, wantChange) {
			var changes = [];
				newChange = _.clone(wantChange);

			var rOp = baseChange[1],
				rStart = baseChange[2],
				rEnd = baseChange[3];

			var cOp = wantChange[1],
				cStart = wantChange[2],
				cEnd = wantChange[3],
				cText = wantChange[4] || '',
				dist;

			if (rOp == -1) {
				if (rStart >= cEnd) {
					// do nothing, has no effect
				} else if (rStart >= cStart) {
					dist = Math.min(cEnd, rEnd) - rStart;

					cEnd -= dist;
				} else if ( rEnd <= cStart) {
					dist = rEnd - rStart;
					cStart -= dist;
					cEnd -= dist;
				} else if (rEnd > cEnd) {
					cEnd = cStart;
				} else {		// rEnd is in [cStart, cEnd], rStart < cStart.
					dist = rEnd - rStart;
					cStart = rStart;
					cEnd -= dist;
				}
			} else {
				if (rStart >= cEnd) {
					// do nothing, has no effect
				} else if  (rStart > cStart) {
					// here is a very special case, wantChange want remove some text, but baseChange has insert some text in it!
					// original text: abcde
					// want change: remove cd => ab(cd)e       ['', -1, 2, 4, 'cd']
					// base change insert qw =>  ab(c[qw]d)e   ['', 1, 3, 5, 'qw']
					// split two changes => ['', -1, 2, 3, 'c'], ['', -1, 5, 6, 'd']
					// but for process convinience, we just remove all the changes
					if (cOp == -1) {
						dist = rEnd - rStart;
						cEnd += dist;
					}
				} else {
					dist = rEnd - rStart;

					cStart += dist;
					cEnd += dist;
				}
			}

			if (cOp == 1) { // for insert operation, make sure cEnd is right.
				cEnd = cStart + cText.length;
			}

			if (changes.length <= 0) {
				newChange[2] = cStart;
				newChange[3] = cEnd;

				changes.push(newChange);
			}

			return changes[0];
		}
	};
});
