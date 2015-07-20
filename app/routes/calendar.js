'use strict';

var calendar = require('../controllers/calendar');

module.exports = function(app) {

	app.route('/calendar/next')
		.get(calendar.get_next_events);

	app.route('/calendar/create')
		.post(calendar.create_event);

	app.route('/calendar/resources')
		.get(calendar.get_calendar_rooms);

	app.route('/calendar/availability')
		.post(calendar.get_calendars_availabily);

};