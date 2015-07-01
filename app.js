'use strict';

// Init DBs
require('./app/databases');

var app = require('./config/express')();

var enableCORS = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

// enable CORS!
app.use(enableCORS);

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

