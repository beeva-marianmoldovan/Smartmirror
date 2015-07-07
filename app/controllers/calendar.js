var mongoose    = require( 'mongoose' );
var User        = mongoose.model('User');
var _           = require('lodash');
var google      = require('../lib/googleapis.js');
var googleApps  = require('google-apps-admin-sdk');



var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');
var calendar = google.calendar('v3');

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '258658410251-na8agl3ilfpg6b39eodnf64h18i7ef3g.apps.googleusercontent.com';
var CLIENT_SECRET = 'q6J-AcHuM5pQi3np7Z2QDvmy';
var REDIRECT_URL = 'http://localhost:8000/oauth2callback';

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
// Idem: Comunicación para REST
exports.get_next_events =  function(request, res) {
	 var userId = request.query.face_id;
   
   User.findOne({'faceId' : userId}, function(err, user){
    console.log(err, user);
    if(err){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    }
    else if(user && user.tokens) {  
      var tokens = user.tokens[0];
      oauth2Client.setCredentials(tokens);
  
      calendar.events.list({
        auth: oauth2Client, 
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }, function(err, response){
        if (err) {
          console.log('The API returned an error: ' + err);
          res.status(500).end();
          return;
        }
          var events = response.items;
          console.log(events);
          res.json(events);
      });
    }
    else res.status(404).end();

   });
}

exports.create_event = function(request, res) {
  var userId = request.query.face_id;

  var event = {
    summary: 'Creando eventos',
    location: 'ES-Av de Burgos,16D-Planta 10-Sala 1/Cap 8-PROYECTOR-TLF',
    description: 'Probando a crear eventos',
    start: {
      dateTime: '2015-07-15T09:00:00-07:00',
      timeZone: 'Europe/Madrid',
    },
    end: {
      dateTime: '2015-07-15T17:00:00-07:00',
      timeZone: 'Europe/Madrid',
    },
    attendees: [
      {email: 'sergio.santamaria@beeva.com'},
      {email: 'marian.claudiu@beeva.com'},
      {email: 'beeva.com_36303135313532312d363937@resource.calendar.google.com'},
    ],
    reminders: {
      useDefault: false,
      overrides: [
        {method: 'email', minutes: 24 * 60}
      ],
    },
  };

  User.findOne({'faceId' : userId}, function(err, user){
    console.log(err, user);
    if(err){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    }
    else{  
      var tokens = user.tokens[0];
      oauth2Client.setCredentials(tokens);

      calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.htmlLink);
      });
    }
  });
}

exports.get_calendar_resources =  function(request, res) {
   var userId = request.query.face_id;
   
   User.findOne({'faceId' : userId}, function(err, user){
    if(err){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    }
    else {  
      var tokens = user.tokens[0];
      var client = new googleApps.Client('beeva.com', tokens['access_token'], tokens['refresh_token'], CLIENT_ID, CLIENT_SECRET);
      var calendar = new googleApps.CalendarResource(client);
      calendar.list({}, function(error, response, body){
        if (error) {
          console.log('The API returned an error: ' + error);
          res.status(500).end();
          return;
        }
        res.json(body.feed.entry);
      });   
    }
   });
}

exports.get_calendars_availabily = function(request, res) {
  var userId = request.query.face_id;
  var sala = request.body.resourceID;
  console.log(sala);
   
   User.findOne({'faceId' : userId}, function(err, user){
    console.log(err, user);
    if(err){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    }
    else{  
      var tokens = user.tokens[0];
      oauth2Client.setCredentials(tokens);
  
      var sala1 = "beeva.com_36303135313532312d363937@resource.calendar.google.com"; //ES-Av de Burgos,16D-Planta 10-Sala 1/Cap 8-PROYECTOR-TLF
      var sala2 = "beeva.com_2d3436323439343032373036@resource.calendar.google.com"; //ES-Av de Burgos,16D-Planta 10-Sala 2/Cap 8-BOARD

      var todayMin = new Date();
      var todayMax = new Date();
      todayMin.setHours(0, 0, 0, 0);
      todayMax.setHours(23, 59, 59, 0);

      console.log('timeMin: '+todayMin+ ' timeMax: '+todayMax);

      var parameters = {
        items : [{id: sala}],
        timeMin: todayMin,
        timeMax: todayMax,
        timeZone: 'Europe/Madrid'
      }

      calendar.freebusy.query({
        auth: oauth2Client,
        resource: parameters
      }, function(err, response){
        if (err) {
          console.log('Calendar availability -> The API returned an error: ' + err);
          res.status(500).end();
          return;
        }
          //var events = response.items;
          console.log(response);
          res.json(response);
      });
    }
   });
}
