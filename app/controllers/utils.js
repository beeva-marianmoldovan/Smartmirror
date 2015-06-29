var path = require('path');
var fs = require('fs');
var icalendar = require('icalendar');
var moment = require('moment');
require('moment-recur');



// Innecesario
exports.githash = function(req, res){
   execute('git rev-parse HEAD', function(result){
     res.json({'githash':result});
   });
};



exports.events = function(req, res){
  getEvents('events.ics', function(err, results){
    if(results)
      res.json(results);
    else res.send('Epic fail');
  })
};





// TODO clean this mess
function getEvents(file, callback){
  var filePath = path.join(__dirname, '/public/ics/' + file);
  fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
      if (!err){
        var ical = icalendar.parse_calendar(data);
        var now = new moment();

        var events = [];
        ical.events().forEach(function(item){
            console.log(item.properties);
            var momentItem = moment(item.properties.DTSTART[0].value);
            if(now.isBefore(momentItem)){
                var event = {};
                event.moment = momentItem;
                event.date = momentItem.startOf('minute').fromNow();

                if('SUMMARY' in item.properties)
                  event.description = item.properties.SUMMARY[0].value;
                else  event.description = ""

                if('LOCATION' in item.properties)
                  event.location = item.properties.LOCATION[0].value;
                else  event.location = ""

                events.push(event);
            }
            else if(item.properties.RRULE){
              var days = item.properties.RRULE[0].value.BYDAY.split(',');
              var recurrence = momentItem.recur().every(days).daysOfWeek();
              var dates = recurrence.next(100);
              dates.forEach(function(dateItem){
                if(now.isBefore(dateItem)){
                    var event = {};
                    dateItem.hours(momentItem.hours());
                    dateItem.minutes(momentItem.minutes());
                    dateItem.seconds(momentItem.seconds());
                    event.date = dateItem.calendar();
                    event.moment = dateItem;
                    if('SUMMARY' in item.properties)
                      event.description = item.properties.SUMMARY[0].value;
                    else  event.description = ""

                    if('LOCATION' in item.properties)  
                      event.location = item.properties.LOCATION[0].value;
                    else  event.location = ""

                    events.push(event);
                }
              })
            }
        });
        events.sort(function compareMilli(a,b) {
          return a.moment.unix() - b.moment.unix();
        });

        var resultArray = events.slice(0, 5);
        resultArray.forEach(function(item){
          delete item.moment
        });
        callback(undefined, resultArray);
      }else{
        console.error(err);
        callback(err);
      }

  });
}
