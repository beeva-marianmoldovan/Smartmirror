'use strict';


var express        = require('express');
var path           = require('path');
var fs 			   = require('fs');
var cookieParser   = require('cookie-parser');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cors		   = require('cors');

module.exports = function() {
	
	var app = express();
	//app.use( favicon( __dirname + '/public/favicon.ico' ));
	app.use(cors());
	app.use(cookieParser());
	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(methodOverride());

	app.use('/public', express.static('public'));

	// Return Express server instance
	return app;
}
