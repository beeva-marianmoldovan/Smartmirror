'use strict';

// Init DBs
require('./app/databases');

var app = require('./config/express')();

var userRoutes = require( './app/routes/user.js' );

userRoutes(app);

app.get( '/', function(req, res){
  res.sendFile(__dirname + '/app/views/index.html');
});

var server = app.listen(8000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});