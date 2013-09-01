var _ = require('lodash'),
	sockets = {},
	docRevs = {};

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
				targetRev = data.cr,
				changes = data.cg;

			if (targetRev == currentRev.r) {
				console.log('can be merged directly.');
				var nRevId = mergeAndCommit(chanel, changes);
				socket.emit('doc:ack', {
					r: nRevId,
					cg: _.pluck(changes, 0)
				});

				broadcast('doc:changed', chanel, {
					cg: changes,
					or: targetRev, // old revision
					nr: nRevId     // new revision
				});
			} else {
				console.log('can not be merged directly.');
			}
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

function applyChange(rev) {

}

function getCurrentRev(chanel) {
	var drs = docRevs[chanel];

	return drs[drs.length - 1];
}

function initDocRevs(chanel) {
	var initContent = '';

	if (!docRevs[chanel]) {
		docRevs[chanel] = [
			{
				r: 0,
				c: initContent
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

function mergeAndCommit(chanel, changes) {
	var curRev = getCurrentRev(chanel),
		text = curRev.c,
		r = curRev.r;

	text = merge(text, changes);

	var newRevId = ++r;

	// commit for the result
	docRevs[chanel].push({
		r: newRevId,
		c: text
	});

	console.log(text);

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
