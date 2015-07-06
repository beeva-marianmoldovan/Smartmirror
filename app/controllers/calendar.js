var mongoose    = require( 'mongoose' );
var User        = mongoose.model('User');
var _           = require('lodash');
var google      = require('../lib/googleapis.js');



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
exports.agenda_proximos_eventos =  function(request, res) {
	 var userId = request.query.face_id;
   
   User.findOne({'faceId' : userId}, function(err, user){
    console.log(err, user);
    if(err){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    }
    else if(user && user.tokens && user.tokens.length > 0) {  
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
    else response.status(404).end();

   });
}
