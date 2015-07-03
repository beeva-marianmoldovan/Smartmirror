'use strict';

var calendar = require('../controllers/calendar');

module.exports = function(app) {
	app.route('/calendar')
		.get(calendar.agenda_proximos_eventos);
};