'use strict';

// Init DBs
require('./app/databases');

var app = require('./config/express')();
var proxy = require('proxy-express');

require( './app/routes/user.js' )(app);
require( './app/routes/ambient.js' )(app);
require( './app/routes/calendar.js' )(app);
require( './app/routes/apis.js' )(app);
require( './app/routes/room.js' )(app);

var oauthController = require('./app/controllers/oauth2.js');

app.get( '/', function(req, res){
  res.sendFile(__dirname + '/app/views/index.html');
});

app.get( '/login', oauthController.apiLogin);
app.get( '/oauth2callback', oauthController.apiOauthCallback);

var socketServer = require('http').createServer(app);
var io = require('socket.io')(socketServer);
io.on('connection', function(socket){
	console.log('new conenction');
	socket.on('face', function(data){
		console.log(data);
		socket.broadcast.emit('face', data);
		socket.emit('face', data);
	});
});

socketServer.listen(3000);


app.use(proxy('127.0.0.1', {
	prefix : '/voice',
	request: {
		query:{
			autoend:true,
			access_token:'X2R77H7ORMONTVQKMY53JITM5VJQ3NPR5'
		}
	}
}));

var server = app.listen(8000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
