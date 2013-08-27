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
	app.use(express.static(__dirname + '/public'));
});

io.on('connection', function () {

});

app.get('/', function (req, res) {
	res.render('index', {
		title: 'hello'
	});
});

server.listen(3000, function (err) {
	console.log("Business server listening on port %d in %s mode", server.port, app.settings.env);
});
