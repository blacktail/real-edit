var httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/mianshi.tech/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/mianshi.tech/cert.pem')
};

var express = require('express'),
	app = express(),
	_ = require('lodash'),
	async = require('async'),
	server = require('https').createServer(httpsOptions, app),
	io = require('socket.io').listen(server),
	cons = require('consolidate'),
	utils = require('./lib/utils'),
	iolib = require('./lib/io'),
	conf = require('./lib/config_util.js'),
	Handlebars = require('handlebars'),
	https = require('https'),
	fs = require('fs');



require('./lib/handlebars_helper')(Handlebars);

app.engine('html', cons.handlebars);

app.configure(function () {
	//app.use(express.logger());

	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');
});

app.configure('development', function () {
	app.use(express.static(__dirname + '/public_src', {
		maxAge: 365 * 24 * 60 * 60 * 1000,
		hidden: true
	}));
});

app.configure('production', function () {
	app.use(express.static(__dirname + '/public', {
		maxAge: 365 * 24 * 60 * 60 * 1000,
		hidden: true
	}));
});

app.get('/', function (req, res) {
	res.render('index', {
		title: 'hello'
	});
});

app.get('/new', function (req, res) {
	var fileName = utils.getRandomString(5, 7);

	res.redirect('/' + fileName);
});

app.get('/:fileName', function (req, res) {
	var fileName = req.param('fileName');

	res.render('edit', {
		fileName: fileName
	});
});

app.get('/download/:fileName/:revId?', function (req, res) {
	var fileName = req.param('fileName'),
		revId = req.param('revId');

	async.waterfall([
		function (cb) {
			if (revId == void 0) {
				iolib.getCurrentRev(fileName, cb);
			} else {
				iolib.getRevById(fileName, revId, cb);
			}
		}
	], function (err, rev) {
		if (err) {
			res.send(err);
		} else {
			res.setHeader('Content-disposition', 'attachment; filename=' + fileName + '_' + rev.r);
			res.setHeader('Content-type', 'application/octet-stream');
			res.end(rev.c || '');
		}
	});
});

app.get('/history/:fileName/:pageNo?/:pageSize?', function (req, res) {
	var fileName = req.param('fileName'),
		pageNo = parseInt(req.param('pageNo')),
		pageSize = parseInt(req.param('pageSize')) || 20;

	iolib.getFileRevs(fileName, pageNo, pageSize, function (err, data) {
		var curPage = Math.min(data.curPage, data.totalPage),
			prevPage = Math.max(curPage - 1, 1),
			nextPage = Math.min(curPage + 1, data.totalPage);

		prevPage = prevPage == curPage ? null : prevPage;
		nextPage = nextPage == curPage ? null : nextPage;

		res.render('history', {
			fileName: fileName,
			revs: _.toArray(data.revs),
			totalPage: data.totalPage,
			curPage: curPage,
			prevPage: prevPage,
			nextPage: nextPage
		});
	});
});

iolib.init(io);

server.listen(conf.server.port, function (err) {
	console.log("Business server listening on port %d in %s mode", conf.server.port, app.settings.env);
});
