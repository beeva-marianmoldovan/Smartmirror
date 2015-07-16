'use strict';

var mongoose    = require( 'mongoose' );
var Room        = mongoose.model('Room');
var _ 			= require('lodash');

exports.list = function(req, res) {
	var filter = req.query;
	Room.find(filter).lean().exec(function(err, rooms) {
		if (err) return res.status(404).end();
		console.log(rooms.length);
		res.json(rooms);
	});
};

exports.create = function(req, res) {
	var room = new Room(req.body);
	room.save(function(err, savedDocument) {
		if (err) {
			console.error(err);
			return res.status(500).end();
		} else {
			res.json({"id": savedDocument.id});
		}
	});
};


exports.roomById = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Thing is invalid'
		});
	}

	Room.findById(id).exec(function(err, room) {
		if (err) return next(err);
		if (!room) {
			return res.status(404).send({
				message: 'Room not found'
			});
		}
		req.room = room;
		next();
	});
};

exports.read = function(req, res, next) {
	res.json(req.room);
};


exports.update = function(req, res) {
	var room = req.room;
	room = _.extend(room, req.body);
	room.save(function(err) {
		if (err) {
			return res.status(400).end();
		} else {
			res.json(room);
		}
	});
};

exports.delete = function(req, res) {
	var room = req.room;
	room.remove(function(err) {
		if (err) {
			return res.status(400).end();
		} else {
			res.status(200).end();
		}
	});
};