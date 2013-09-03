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
			console.time('merging revs');

			if (revChanges.length <= 0 || changes.length <= 0) {
				return [];
			}

			var firstChange = changes[0],
				leftChanges = changes.slice(1),
				newChanges = [];

			var baseChanges = revChanges;

			console.log(baseChanges);

			baseChanges = this.transformChangeBasedChanges(baseChanges, firstChange);
			newChanges = newChanges.concat(baseChanges);

			_.each(leftChanges, function (wantChange) {
				baseChanges = this.transformChangeBasedChanges(baseChanges, wantChange);
				newChanges = newChanges.concat(baseChanges);
			}, this);

			console.log('at last, the changes: ', newChanges);

			console.timeEnd('merging revs');

			return newChanges;
		},

		transformChangeBasedChanges: function (baseChanges, change) {
			var newChanges = [change];

			_.each(baseChanges, function (baseChange) {
				var transformedChanges = [];

				_.each(newChanges, function (wantChange) {
					transformedChanges = transformedChanges.concat(this.operationTransform(baseChange, wantChange));
				}, this);

				newChanges = transformedChanges;
			}, this);

			return newChanges;
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
					if (cOp == -1) {
						dist = rEnd - rStart;

						var start1 = cStart,
							end1 = rStart,
							splitLen = end1 - start1,
							text1 = cText.substring(0, splitLen),
							start2 = rEnd,
							end2 = cEnd + dist,
							text2 = cText.substring(splitLen);

						var change1 = _.clone(wantChange),
							change2 = _.clone(wantChange);

						change1[2] = start1;
						change1[3] = end1;
						change2[2] = start2;
						change2[3] = end2;

						changes.push(change1);
						changes.push(change2);
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

			return changes;
		}
	};
});
