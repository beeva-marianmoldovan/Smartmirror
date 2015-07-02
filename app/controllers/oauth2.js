/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var readline = require('readline');

var google = require('../lib/googleapis.js');

var qr = require('qr-image');  
var fs = require('fs');


var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');
var calendar = google.calendar('v3');

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '258658410251-na8agl3ilfpg6b39eodnf64h18i7ef3g.apps.googleusercontent.com';
var CLIENT_SECRET = 'qd3LlfEQQLgteQfJ018MENPY';
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
    'https://www.googleapis.com/auth/calendar'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: scopes // can be a space-delimited string or an array of scopes
  });
  //var now = new Date.now();
  var now = process.hrtime();
  console.log(now);
  var code = qr.image(url, { type: 'png' });  
  var output = fs.createWriteStream('public/images/'+now+'.png');

  code.pipe(output);

  res.json({'url':url}, {'image':output});
}


exports.apiOauthCallback = function (req, res){
  console.log(lastUser);
  console.log(req.query.code);

  oauth2Client.getToken(req.query.code, function(err, tokens) {
    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
      if (err) {
        console.log('An error occured', err);
        res.send(err);
        return;
      }
      else {
        console.log(profile.displayName, ':', profile.tagline);
        res.send(profile.displayName);
      }
    });

  });
}

