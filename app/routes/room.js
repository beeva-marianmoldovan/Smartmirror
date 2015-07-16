'use strict';

var room = require('../controllers/room');

module.exports = function(app) {

	app.route('/room')
		.get(room.list)
		.post(room.create);

	app.route('/room/:roomId')
		.get(room.read)
		.put(room.update)
		.delete(room.delete);

	app.param('roomId', room.roomById);
	
};