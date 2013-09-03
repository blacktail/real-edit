var _ = require('lodash'),
	sockets = {},
	docRevs = {},
	DMP = require('./diff_match_patch'),
	dmp = new DMP();

function init(io) {
	io.sockets.on('connection', function (socket) {
		socket.emit('socket:new', socket.id);

		var chanel, user;
		socket.on('begin', function (data) {
			chanel = data.chanel;
			user = data.user;

			var s = sockets[chanel];

			if (!s) {
				sockets[chanel] = {};
			}

			sockets[chanel][socket.id] = {
				chanel: chanel,
				user: user,
				socket: socket
			};

			broadcast('user:changed', chanel, getChanelUsers(chanel));

			initDocRevs(chanel);
			socket.emit('doc:init', getCurrentRev(chanel));

		});

		socket.on('chat', function (data) {
			broadcast('message:new', data.chanel, data);
		});

		socket.on('username:change', function (data) {
			var s = sockets[chanel];

			if (s) {
				s[socket.id].user = data.user;
				broadcast('user:changed', chanel, getChanelUsers(chanel));
			}
		});

		socket.on('disconnect', function () {
			console.log('DISCONNECTED!!!');
			delete sockets[chanel][socket.id];

			broadcast('user:changed', chanel, getChanelUsers(chanel));
		});

		socket.on('doc:change', function (data) {
			var currentRev = getCurrentRev(chanel),
				targetRevId = parseInt(data.cr),
				changes = data.cg;

			if (targetRevId == currentRev.r) {
				console.log('can be merged directly.');
				var nRevId = commit(chanel, changes, user, false);

				socket.emit('doc:ack', {
					nr: nRevId,
					or: targetRevId,
					cgid: _.pluck(changes, 0)
				});

				var r = _.random(1,2);
				if (r == 1) {
					broadcast('doc:changed', chanel, {
						fr: socket.id,
						cg: changes,
						or: targetRevId, // old revision
						nr: nRevId     // new revision
					});
				}
			} else {
				console.log('can not be merged directly.');
				var baseRev = findRev(chanel, targetRevId);

				// get a series changes from base Rev to cur Rev
				var rangeRevs = getRangeRevs(chanel, baseRev.r + 1, currentRev.r);
				var changeRevs = _.map(rangeRevs, function (rev) {
					return {
						g: rev.g,
						r: rev.r
					};
				});

				socket.emit('doc:sync', {
					rs: changeRevs
				});
			}
		});

		socket.on('doc:needSync', function (baseRevId) {
			console.log('>>>needSYnc', baseRevId);

			var currentRev = getCurrentRev(chanel);

			console.log('>>>>>>get revs from ', baseRevId + 1, currentRev);
			var revs = getRangeRevs(chanel, baseRevId + 1, currentRev.r);

			revs = _.map(revs, function (rev) {
					return {
						g: rev.g,
						r: rev.r
					};
				});

			console.log('sync these: ', revs);
			
			socket.emit('doc:sync', {
				rs: revs 
			});
		});
	});
}

function broadcast(event, chanel, data) {
	var s = sockets[chanel];

	_.each(s, function (soc) {
		soc.socket.emit(event, data);
	});
}

function getChanelUsers(chanel) {
	var currentUsers = [],
		cSockets = sockets[chanel];

	_.each(cSockets, function (data) {
		currentUsers.push({
			user: data.user,
			address: data.socket.handshake.address
		});
	});

	return currentUsers;
}

function getCurrentRev(chanel) {
	var drs = docRevs[chanel];

	return drs[drs.length - 1];
}

function findRev(chanel, revId) {
	var drs = docRevs[chanel];

	return _.where(drs, {
		r: revId
	})[0];
}

function getRangeRevs(chanel, startRevId, endRevId) {
	var drs = docRevs[chanel];

	return drs.slice(parseInt(startRevId), parseInt(endRevId) + 1);
}

function initDocRevs(chanel) {
	var initContent = '';

	if (!docRevs[chanel]) {
		docRevs[chanel] = [
			{
				r: 0,
				c: initContent,
				u: 'system',
				g: []
			}
		];
	}
}

function commit(chanel, changes, commitor, isPatch) {
	var curRev = getCurrentRev(chanel),
		r = curRev.r,
		c = curRev.c,
		newRevId = ++r,
		txt = merge(c, changes),
		t = new Date().getTime();

	docRevs[chanel].push({
		r: newRevId,
		c: txt,
		u: commitor || '',
		g: changes,
		t: t
	});

	console.log('commited: ', changes, ' in revision ', newRevId, 'at ', t);
	console.log(txt);

	return newRevId;
}

function merge(text, changes) {
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

module.exports = init;
