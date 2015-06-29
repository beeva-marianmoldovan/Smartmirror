'use strict';

var user = require('../controllers/user');

module.exports = function(app) {

	app.route('/user')
		.get(user.list)
		.post(user.create);

	app.route('/user/:userId')
		.get(user.read)
		.put(user.update)
		.delete(user.delete);

	app.param('userId', user.userById);
	
};