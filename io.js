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
				sockets[chanel] = [];
			}

			sockets[chanel].push({
				chanel: chanel,
				user: user,
				socket: socket
			});

			var currentUsers = [];
			_.each(sockets[chanel], function (data) {
				currentUsers.push(data.user);
			});

			broadcast('user:change', chanel, currentUsers);
		});

		socket.on('chat', function (data) {
			broadcast('newmsg', data.chanel, data);
		});
	});
}

function broadcast(event, chanel, data) {
	var s = sockets[chanel];

	_.each(s, function (soc) {
		soc.socket.emit(event, data);
	});
}

function onChat() {

}
module.exports = init;
