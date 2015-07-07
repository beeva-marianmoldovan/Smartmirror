'use strict';

var calendar = require('../controllers/calendar');

module.exports = function(app) {

	app.route('/calendar/next')
		.get(calendar.get_next_events);

	app.route('/calendar/create')
		.get(calendar.create_event);

	app.route('/calendar/resources')
		.get(calendar.get_calendar_resources);

	app.route('/calendar/availability')
		.get(calendar.get_calendars_availabily);			
};


