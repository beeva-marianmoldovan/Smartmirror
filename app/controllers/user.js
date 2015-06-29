'use strict';

var mongoose    = require( 'mongoose' );
var User        = mongoose.model('User');
var _ 			= require('lodash');

exports.list = function(req, res) {
	var filter = req.query;
	User.find(filter).lean().exec(function(err, users) {
		if (err) return res.status(404).end();
		res.json(users);
	});
};

exports.create = function(req, res) {
	var user = new User(req.body);
	user.save(function(err, savedDocument) {
		if (err) {
			console.error(err);
			return res.status(500).end();
		} else {
			res.json({"id": savedDocument.id});
		}
	});
};


exports.userById = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Thing is invalid'
		});
	}

	User.findById(id).exec(function(err, user) {
		if (err) return next(err);
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			});
		}
		req.user = user;
		next();
	});
};

exports.read = function(req, res, next) {
	res.json(req.user);
};


exports.update = function(req, res) {
	var user = req.user;
	user = _.extend(user, req.body);
	user.save(function(err) {
		if (err) {
			return res.status(400).end();
		} else {
			res.json(user);
		}
	});
};

exports.delete = function(req, res) {
	var user = req.user;
	user.remove(function(err) {
		if (err) {
			return res.status(400).end();
		} else {
			res.status(200).end();
		}
	});
};