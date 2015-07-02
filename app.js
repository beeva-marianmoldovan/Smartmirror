'use strict';

// Init DBs
require('./app/databases');

var app = require('./config/express')();


require( './app/routes/user.js' )(app);
require( './app/routes/ambient.js' )(app);

app.get( '/', function(req, res){
  res.sendFile(__dirname + '/app/views/index.html');
});


var socketServer = require('http').createServer(app);
var io = require('socket.io')(socketServer);
io.on('connection', function(socket){
	console.log('new conenction');
	socket.on('face', function(data){
		console.log(data);
	});

});


socketServer.listen(3000);

var server = app.listen(8000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

