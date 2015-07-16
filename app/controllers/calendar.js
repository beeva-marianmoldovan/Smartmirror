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

exports.create_quick_event = function(request, res) {
  var userId = request.query.face_id;

  var dataEvent = request.body;
  //console.log(dataEvent)

  var now = moment(); 
  console.log(now);

  var end = moment().add(1, 'hour');
  console.log(end);
}

exports.create_event = function(request, res) {
  var userId = request.query.face_id;

  var dataEvent = request.body;

  console.log(dataEvent.location);
  var nombreSala = dataEvent.location.match("Sala \[0-9*]");
  console.log(nombreSala[0]);

  dataEvent.summary = "Evento en "+nombreSala[0]+" creado desde SmartMirror";
  console.log(dataEvent);

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
        resource: dataEvent,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.htmlLink);
        res.json(event.htmlLink);
      });
    }
  });
}

exports.get_calendar_rooms = function(request, res) {
  var userId = request.query.face_id;
  User.findOneAsync({'faceId' : userId})
    .then(function(user){
      var tokens = user.tokens[0];
      var client = new googleApps.Client('beeva.com', tokens['access_token'], tokens['refresh_token'], CLIENT_ID, CLIENT_SECRET);
      var calendar = new googleApps.CalendarResource(client);
      return getCalendarResources(calendar);
    })
    .then(function(resources){
      var recursos_response = JSON.parse(resources.body);
      var recursos = recursos_response.feed.entry;
      var salas = [];

      Promise.each(recursos, function(rec){
        return Room.findAsync({'roomId' : rec.apps$property[2].value})
          .then(function(sala){
            if (sala.length == 0) {
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

              return new Promise(function (resolve, reject) {
                room.save(function(error, doc){
                  if (error)
                    reject(error);
                  else {
                    var obj = doc.toObject();
                    obj['message'] = 'room_created';
                    console.log(obj);
                    salas.push(obj);
                    resolve(salas);
                  }

                })
              });
            }
            else {
              return new Promise(function (resolve, reject) {
                console.log("************** SALA **************", sala);
                salas.push(sala[0]);
                resolve();
              });
            }
          })
      })
      .then(function(){
        res.send(salas);
      })
    });
}

function getCalendarResources(cal){
  return new Promise(function (resolve, reject) {
    cal.list({}, function(error, resources){
      if (error)
        reject(error);
      else
        resolve(resources);
    })
  });
}

exports.get_calendar_resources =  function(request, res) {
   var userId = request.query.face_id;
   
   User.findOne({'faceId' : userId}, function(err, user){
    if(err){
      console.log('The API returned an error: ' + err);
      res.status(500).end();
    }
    else {  
      var tokens = user.tokens[0];
      var client = new googleApps.Client('beeva.com', tokens['access_token'], tokens['refresh_token'], CLIENT_ID, CLIENT_SECRET);
      var calendar = new googleApps.CalendarResource(client);

      calendar.list({}, function(error, resources){
        if (error) {
          console.log('The API returned an error: ' + error);
          res.status(500).end();
          return;
        }
        else {
          var recursos_response = JSON.parse(resources.body);
          //var recursos = body.feed.entry;

          var recursos = recursos_response.feed.entry;
          var salas = [];
          for(var i = 0; i < recursos.length; i++){
            (function(i){
              Room.find({'roomId' : recursos[i].apps$property[2].value}, function(err, sala){
                if(err){  
                  console.log('The API returned an error: ' + err);
                  res.status(500).end();
                }
                else if(sala == null) {
                  console.log(" -----> no está en mongo! Es una sala nueva! la guardo! -----> ");
                  
                  var nombreSala = recursos[i].apps$property[1].value.match("Sala \[0-9*]");
                  var str = recursos[i].apps$property[1].value;
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
                    'name'        : recursos[i].apps$property[1].value,
                    'roomId'      : recursos[i].apps$property[2].value
                  });

                  room.save(function(err, doc){
                    if(err){
                      console.error(err);
                      res.status(500).end();
                    }
                    else{
                      var obj = doc.toObject();
                      obj['message'] = 'room_created';
                      console.log(obj);
                      salas.push(obj);
                      console.log("ARRAY SALAS: ",salas);
                    }
                  });
                }
                else {
                  console.log("************** SALA **************", sala);
                  salas.push(sala);
                }
              });
            })(i);
          };
        }
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