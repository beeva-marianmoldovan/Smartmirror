'use strict';

var ambient = require('../controllers/ambient');

module.exports = function(app) {
	app.route('/ambient')
		.get(ambient.read)
		.post(ambient.createOrUpdate);
};