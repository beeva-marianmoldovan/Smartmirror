'use strict';

var mongoose    = require( 'mongoose' );
var Ambient     = mongoose.model('Ambient');
var _ 			= require('lodash');

exports.read = function(req, res) {
	var filter = req.query;
	Ambient.find(filter).lean().exec(function(err, data) {
		if (err) return res.status(404).end();
		res.json(data);
	});
};

exports.createOrUpdate = function(req, res) {
	Ambient.findOneAndUpdate({'place' : req.body.place}, req.body, function(err, doc){
		if(err){
			var ambient = new Ambient(req.body);
			ambient.save(function(err, savedDocument) {
				if (err) {
					console.error(err);
					return res.status(500).end();
				} else {
					res.json(savedDocument);
				}
			});
		}
		else res.json(doc);
	})
};

