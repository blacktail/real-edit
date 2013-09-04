var _ = require('lodash'),
	sockets = {},
	docRevs = {},
	conf = require('./config_util.js'),
	async = require('async');

var	redisClient = require("redis").createClient(conf.redis.port, conf.redis.host);

redisClient.on('error', function (e) {
	console.log (e.message);
});

module.exports = {
	init: init,
	getCurrentRev: getCurrentRev,
	getFileRevs: getFileRevs,
	getRevById: getRevById
};

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

			getCurrentRev(chanel, function (err, rev) {
				socket.emit('doc:init', rev);
			});
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

			console.log('targetRevId: ', targetRevId, 'currentRev id: ', currentRev.r);
			if (targetRevId == currentRev.r) {
				console.log('can be merged directly.', socket.id);
				var nRevId = commit(chanel, changes, user, false);

				socket.emit('doc:ack', {
					nr: nRevId,
					or: targetRevId,
					cgid: _.pluck(changes, 0),
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

			console.log('>>>>>>get revs from ', baseRevId + 1, ' to ', currentRev.r);
			var revs = getRangeRevs(chanel, baseRevId + 1, currentRev.r);

			revs = _.map(revs, function (rev) {
					return {
						g: rev.g,
						r: rev.r
					};
				});

			console.log('sync these: ', JSON.stringify(revs));
			
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

function getCurrentRev(chanel, callback) {
	var drs = docRevs[chanel];

	if (callback && (!drs || drs.length <= 0)) {
		console.log('need init doc revs................');
		initDocRevs(chanel, function (err, commitObj) {
			callback && callback(err, commitObj);
		});
	} else if (drs) {
		var rev = drs[drs.length - 1];
		callback && callback(null, rev);
		return rev;
	} else {
		return {
			r: -1
		};
	}
}

function getFileKey(chanel) {
	return 'realedit:' + chanel;
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

function initDocRevs(chanel, callback) {
	var initialCommit = {
			r: 0,
			c: '',
			u: 'system',
			g: [],
			t: new Date().getTime()
		},
		fileKey = getFileKey(chanel);

	docRevs[chanel] = [initialCommit];
	
	var inited = false;

	setTimeout(function () {
		if (!inited) {
			inited = true;
			callback && callback('timeout error, please check your redis config.', initialCommit);
		}
	}, 1000);

	async.waterfall([
		function (cb) {
			redisClient.get(fileKey + ':latest', cb);
		},
		function (latestVersion, cb) {
			console.log('>>>>>>>>>>lastestVersion>>>', latestVersion);
			if (latestVersion) {
				redisClient.hget(fileKey, latestVersion, cb);
			} else {
				cb(null, initialCommit);
			}
		},
		function (commitObj, cb) {
			console.log('>>>>>>>>..commitObj', commitObj);
			if (_.isObject(commitObj)) {
				redisClient.hset(fileKey, commitObj.r, JSON.stringify(commitObj), cb);
			} else {
				commitObj = JSON.parse(commitObj);
			}

			cb(null, commitObj);
		}
	], function (err, commitObj) {
		if (!err) {
			initialCommit = commitObj;
		}

		if (!inited) {
			inited = true;
			docRevs[chanel] = [initialCommit];
			callback && callback(err, initialCommit);
		}
	});
}

function commit(chanel, changes, commitor, isPatch) {
	var curRev = getCurrentRev(chanel),
		r = curRev.r,
		c = curRev.c,
		newRevId = ++r,
		txt = merge(c, changes),
		t = new Date().getTime(),
		commitObj = {
			r: newRevId,
			c: txt,
			u: commitor || '',
			g: changes,
			t: t
		};

	docRevs[chanel].push(commitObj);

	console.log('commited: ', changes, ' in revision ', newRevId, 'at ', t);
	console.log(txt);

	// save commits in redis
	// realedit:filename => commitId, value
	redisClient.hset(getFileKey(chanel), newRevId, JSON.stringify(commitObj), function (err) {
		console.log('commit to redis: ', err);
	});
	redisClient.set(getFileKey(chanel) + ':latest', newRevId, function (err) {
		console.log('write latest version to redis: ', err);
	});

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

function getFileRevs(chanel, pageNo, pageSize, callback) {
	getCurrentRev(chanel, function (err, rev) {
		var latestVersion = rev.r,
			page = genRevIdsPage(pageNo, pageSize, latestVersion),
			totalPage = page.totalPage,
			revs = {};

		async.each(page.data, function (revId, cb) {
			getRevById(chanel, revId, function (err, rev) {
				if (err) {
					revs[revId] = {};
					revs[revId].err = err;
				} else {
					revs[revId] = rev;
				}
				cb();
			});
		}, function (err) {
			callback && callback(null, {
				totalPage: totalPage,
				revs: revs
			});
		});
	});
}

function genRevIdsPage(pageNo, pageSize, latestId) {
	latestId = latestId || 0;
	pageSize = pageSize || 20;
	totalPage = Math.ceil((latestId + 1) / pageSize);
	pageNo = Math.min(pageNo || 1, totalPage);

	var itemMin = (pageNo - 1) * pageSize,
		itemMax = Math.min(pageNo * pageSize, latestId + 1);

	return {
		data: _.range(itemMin, itemMax),
		total: latestId + 1,
		totalPage: totalPage 
	};
}

function getRevById(chanel, revId, cb) {
	var drs = docRevs[chanel];

	var r = _.find(drs, function (rev) {
		return rev.r == revId;
	});

	if (!r) {
		var called = false;

		setTimeout(function () {
			if (!called) {
				called = true;
				cb('timeout for get revision info, please check your redis config.');
			}
		}, 1000);

		redisClient.hget(getFileKey(chanel), revId, function (err, commitObj) {
			if (!called) {
				called = true;
				if (err) {
					cb && cb(err);
				} else {
					cb && cb(null, JSON.parse(commitObj) || {});
				}
			}
		});
	} else {
		cb && cb(null, r);
	}
}
