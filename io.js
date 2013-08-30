var _ = require('lodash'),
	sockets = {};

function init(io) {
	io.sockets.on('connection', function (socket) {

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

function onChat() {

}

module.exports = init;
