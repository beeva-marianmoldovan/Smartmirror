'use strict';

var apis = require('../controllers/apis');

module.exports = function(app) {

	app.route('/twitter')
		.get(apis.twitterFeed);
		
};