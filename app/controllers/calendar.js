var mongoose      = require( 'mongoose' );
var User          = mongoose.model('User');
var Room          = mongoose.model('Room');
var _             = require('lodash');
var google        = require('../lib/googleapis.js');
var googleApps    = require('google-apps-admin-sdk');
var Promise       = require('bluebird');
Promise.promisifyAll(require("mongoose"));

var OAuth2Client  = google.auth.OAuth2;
var plus          = google.plus('v1');
var calendar      = google.calendar('v3');

var CLIENT_ID     = '258658410251-na8agl3ilfpg6b39eodnf64h18i7ef3g.apps.googleusercontent.com';
var CLIENT_SECRET = 'q6J-AcHuM5pQi3np7Z2QDvmy';
var REDIRECT_URL  = 'http://localhost:8000/oauth2callback';
var moment        = require('moment');

var oauth2Client  = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

function find_user(faceID) {
  return new Promise(function (resolve, reject) {
     User.findOneAsync({'faceId' : faceID})
      .then(function(user){
        resolve(user);
      })
      .catch(function(e){
        reject(e);
      });
  }); 
}

function get_calendar_resources(cal){
  return new Promise(function (resolve, reject) {
    cal.list({}, function(error, resources){
      if (error)
        reject(error);
      else
        resolve(resources);
    })
  });
}

function save_room(room) {
  return new Promise(function (resolve, reject) {
    var nombreSala = rec.apps$property[1].value.match("Sala \[0-9*]");
    var str = rec.apps$property[1].value;
    var str_split =  str.split("-");
    var str_split2 =  str.split("/");
    var capacidad = (str_split2[1].split("-"))[0];

    var recur;
    if (str_split[4]) {
      recur = str_split[4];
      if (str_split[5]) {
        recur = recur + ", "+str_split[5];
      }
    }
    
    var room = new Room({
      'location'    : str_split[1],
      'floor'       : str_split[2],
      'room'        : nombreSala,
      'capacity'    : capacidad,
      'resources'   : recur,
      'name'        : rec.apps$property[1].value,
      'roomId'      : rec.apps$property[2].value
    });

    room.save(function(error, doc){
      if (error)
        reject(error);
      else {
        var sala = doc.toObject();
        sala['message'] = 'room_created';
        //salas.push(obj);
        resolve(sala);
      }
    });
  });
}

function get_availability_room(user, room, timeMin, timeMax) {
  var parameters = {
    items : [{id: room}],
    timeMin: timeMin,
    timeMax: timeMax,
    timeZone: 'Europe/Madrid'
  }

  return new Promise(function (resolve, reject) {
    calendar.freebusy.query({
      auth: user,
      resource: parameters
    }, function(err, response){
      if (err) {
        console.log('Calendar availability -> The API returned an error: ' + err);
        reject(err);
      }
      else {
        resolve(response);
      }
    });
  });
}

exports.get_next_events =  function(request, res) {
   find_user(request.query.face_id)
    .then(function(user){
      if(user && user.tokens) {  
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
            res.json(events);
        });
      }
      else res.status(404).end();

    })
    .catch(function(e){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    });
}

exports.create_event = function(request, res) {
  var userId = request.query.face_id;
  var dataEvent = request.body;
  var nombreSala = dataEvent.location.match("Sala \[0-9*]");
  dataEvent.summary = "Evento en "+nombreSala[0]+" creado desde SmartMirror";

  find_user(request.query.face_id)
    .then(function(user){
      var tokens = user.tokens[0];
      oauth2Client.setCredentials(tokens);

      calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: dataEvent,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        res.json(event.htmlLink);
      });
    })
    .catch(function(e){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    });
}

exports.get_calendar_rooms = function(request, res) {
  var tokens;
  find_user(request.query.face_id)
    .then(function(user){
      tokens = user.tokens[0];
      var client = new googleApps.Client('beeva.com', tokens['access_token'], tokens['refresh_token'], CLIENT_ID, CLIENT_SECRET);
      var calendar = new googleApps.CalendarResource(client);
      return get_calendar_resources(calendar);
    })
    .then(function(resources){
      var recursos_response = JSON.parse(resources.body);
      var recursos = recursos_response.feed.entry;
      var salas = [];

      Promise.each(recursos, function(rec){
        //busco en mongo la sala
        return Room.findAsync({'roomId' : rec.apps$property[2].value})
          .then(function(sala){

            oauth2Client.setCredentials(tokens);
            var todayMin = new Date();
            var todayMax = new Date(todayMin);
            todayMax.setHours ( todayMin.getHours() + 1 );

            //no está, la guardo
            if (sala.length == 0) {
              save_room(rec)
                .then(function(sala){
                  
                  get_availability_room(oauth2Client, sala, todayMin, todayMax)
                    .then(function(response) {
                    })
                    .catch(function(e){
                      console.log('The API returned an error: ' + err);
                      response.status(500).end();
                    });

                  salas.push(sala);
                  resolve(salas);
                })
                .catch(function(e){
                  console.log('The API returned an error: ' + err);
                  response.status(500).end();
                });
            }
            else {
              return new Promise(function (resolve, reject) {

                var room = sala[0].toObject();
              
                get_availability_room(oauth2Client, sala[0].roomId, todayMin, todayMax)
                    .then(function(response) {

                      room.availability = response;
                      salas.push(room);
                      resolve();

                    })
                    .catch(function(e){
                      console.log('The API returned an error: ' + e);
                      res.status(500).end();
                    });
              });
            }
          })
      })
      .then(function(){
        res.send(salas);
      })
    })
    .catch(function(e){
      console.log('The API returned an error: ' + err);
      response.status(500).end();
    });
}

exports.get_calendars_availabily = function(request, res) {
  var userId = request.query.face_id;
  var sala = request.body.resourceID;

  find_user(userId)
    .then(function(user){
      var tokens = user.tokens[0];
      oauth2Client.setCredentials(tokens);
  
      var todayMin = new Date();
      var todayMax = new Date();
      todayMin.setHours(0, 0, 0, 0);
      todayMax.setHours(23, 59, 59, 0);

      get_availability_room(oauth2Client, sala, todayMin, todayMax)
        .then(function(response) {
          res.json(response);
        })
        .catch(function(e){
          console.log('The API returned an error: ' + err);
          response.status(500).end();
        });
    });
}

