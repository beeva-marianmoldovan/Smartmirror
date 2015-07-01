'use strict';

// Init DBs
require('./app/databases');

var app = require('./config/express')();

var userRoutes = require( './app/routes/user.js' );
userRoutes(app);

var oauthController = require('./app/controllers/oauth2.js');

app.get( '/', function(req, res){
  res.sendFile(__dirname + '/app/views/index.html');
});

app.get( '/login', oauthController.apiLogin);
app.get( '/oauth2callback', oauthController.apiOauthCallback);

var server = app.listen(8000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});