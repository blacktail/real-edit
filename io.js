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
					id: _.pluck(changes, 0),
					cg: changes
				});

				broadcast('doc:changed', chanel, {
					fr: socket.id,
					cg: changes,
					or: targetRevId, // old revision
					nr: nRevId     // new revision
				});
			} else {
				console.log('can not be merged directly.');
				var baseRev = findRev(chanel, targetRevId);
				console.log('baseRev', baseRev);

				var baseRevText = baseRev.c,
					newText = merge(baseRev.c, changes);

				console.log('make patches: ', baseRevText, newText);
				var patches = dmp.patch_make(baseRevText, newText);

				var nRevId = commit(chanel, patches, user, true);

				socket.emit('doc:ack', {
					nr: nRevId,
					or: targetRevId,
					id: _.pluck(changes, 0),
					ph: patches
				});

				// get a series changes from base Rev to cur Rev and patches for the new revision
				var rangeRevs = getRangeRevs(chanel, baseRev.r + 1, currentRev.r);
				var changes = _.map(rangeRevs, function (rev) {
					return {
						p: rev.p,
						g: rev.g,
						r: rev.r
					};
				});

				changes.push({
					p: true,
					g: patches,
					r: nRevId
				});

				socket.emit('doc:sync', {
					or: targetRevId,
					nr: nRevId,
					rs: changes
				});

				broadcast('doc:changed', chanel, {
					fr: socket.id,
					cg: [],
					or: currentRev.r, // old revision
					nr: nRevId,     // new revision
					ph: patches
				});
			}
		});

		socket.on('doc:needSync', function (baseRevId) {
			var currentRev = getCurrentRev(chanel);

			var revs = getRangeRevs(baseRevId + 1, currentRev);

			revs = _.map(revs, function (rev) {
					return {
						p: rev.p,
						g: rev.g,
						r: rev.r
					};
				});

			socket.emit('doc:sync', {
				or: baseRevId,
				nr: currentRev.r,
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
				g: [],
				p: false
			}
		];
	}
}

function getRevId(chanel, c) {
	return hash(chanel + c + chanel);
}

function hash(text, algo) {
	var crypto = require('crypto');
	text = String(text || '');
	algo = algo || 'sha256';

	return crypto.createHash(algo).update(text).digest('hex');
}

function commit(chanel, changes, commitor, isPatch) {
	var curRev = getCurrentRev(chanel),
		r = curRev.r,
		c = curRev.c,
		newRevId = ++r,
		txt;

	txt = isPatch ? dmp.patch_apply(changes, c)[0] : merge(c, changes);

	docRevs[chanel].push({
		r: newRevId,
		c: txt,
		u: commitor || '',
		g: changes,
		p: isPatch
	});

	console.log('commited: ', changes, ' in revision ', newRevId);
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
