var mongoose    = require( 'mongoose' );
var User        = mongoose.model('User');
var _           = require('lodash');
var readline    = require('readline');
var qr          = require('qr-image');  
var fs          = require('fs');
var socket      = require('socket.io-client')('http://localhost:3000');
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

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var lastUser = undefined;

function getAccessToken(oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: 'https://www.googleapis.com/auth/calendar' // can be a space-delimited string or an array of scopes
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function(code) {
    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.setCredentials(tokens);
      callback();
    });
  });
}

exports.apiLogin = function (req, res){
  lastUser = req.query.user;
  var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/calendar',
    'https://apps-apis.google.com/a/feeds/calendar/resource/'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: scopes // can be a space-delimited string or an array of scopes
  });

  url = url + '&approval_prompt=force';

  var timestamp = process.hrtime();
  var code = qr.image(url, { type: 'png' });  
  var output = fs.createWriteStream('public/images/'+timestamp+'.png');

  code.pipe(output);
  res.json({'url':url}, {'image':output});
}


exports.apiOauthCallback = function (req, res){
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    oauth2Client.setCredentials(tokens);

    plus.people.get({
      userId: 'me',
      auth: oauth2Client
    }, function(err, profile) {
      if (err) {
        console.log('An error occured', err);
        res.send(err);
        return;
      }
      else {
        console.log(profile);
        var user = new User({
          'name'    : profile.displayName,
          'faceId'  : lastUser
        });
        user.tokens.push(tokens);

        user.save(function(err, doc){
          if(err){
            console.error(err);
            res.status(500).end();
          }
          else{
            var obj = doc.toObject();
            obj['message'] = 'user_registered';
            socket.emit('face', obj);
            res.redirect('http://beeva.com');
          }
        });
      }
    });
  });
}