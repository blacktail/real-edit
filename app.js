var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	cons = require('consolidate');

app.engine('html', cons.handlebars);

app.configure(function () {
	app.use(express.logger());

	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');
	
});

app.configure('development', function () {
	app.use(express.static(__dirname + '/public_src', {maxAge: 365 * 24 * 60 * 60 * 1000, hidden: true}));
});

app.configure('production', function () {
	app.use(express.static(__dirname + '/public', {maxAge: 365 * 24 * 60 * 60 * 1000, hidden: true}));
});

io.sockets.on('connection', function (socket) {
	socket.emit('news', {hello: 'world'});

	socket.on('other event', function (data) {
		console.log(data);
	});
});

app.get('/', function (req, res) {
	res.render('index', {
		title: 'hello'
	});
});

app.get('/:fileName', function (req, res) {
	var fileName = req.param('fileName');

	res.render('edit', {
		fileName: fileName
	});
});

server.listen(3000, function (err) {
	console.log("Business server listening on port %d in %s mode", 3000, app.settings.env);
});
