var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	cons = require('consolidate'),
	utils = require('./lib/utils');

app.engine('html', cons.handlebars);

app.configure(function () {
	//app.use(express.logger());

	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');
	
});

app.configure('development', function () {
	app.use(express.static(__dirname + '/public_src', {maxAge: 365 * 24 * 60 * 60 * 1000, hidden: true}));
});

app.configure('production', function () {
	app.use(express.static(__dirname + '/public', {maxAge: 365 * 24 * 60 * 60 * 1000, hidden: true}));
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

require('./lib/io')(io);

server.listen(3000, function (err) {
	console.log("Business server listening on port %d in %s mode", 3000, app.settings.env);
});
