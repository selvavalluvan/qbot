// Description:
//   Quietly's word of the week
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   cheer set '<jingle>' at Dec 3rd 3AM - Please make sure the jingle is in single quotes.

var cron = require('node-cron');
var pg = require('pg');
var jingle = null;
var event = null;
pg.defaults.ssl = true;
var DATABASE_URL = process.env.DATABASE_URL;
DATABASE_URL = 'postgres://ragboylpzlgois:sM_mHJdPGPYWPXVMkeJEG1Lkul@ec2-54-225-89-110.compute-1.amazonaws.com:5432/d8496utacban55';
var unirest = require('unirest');
var schedule = require('node-schedule');

module.exports = function(robot) {

  var client = new pg.Client(DATABASE_URL);
  client.connect(function (err) {
    client.query('SELECT * FROM jingle', function (err, result) {
      var obj = result.rows[0];
      if(obj.date){
        var date = new Date(obj.date * 1000);
        event = schedule.scheduleJob(date, function(){
          robot.messageRoom('#general', "@everyone  "+decodeURIComponent(obj.data));
        });
        console.log(event);
      }
      client.end(function (err) {
        if (err) throw err;
      });
    });
  });

  robot.respond(/(cheer) set/i, function(bot){
    var keyword = "set";
    var input = encodeURIComponent(bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).trim();
    var matches = input.match(/'(.*?)'/);
    var date = null;
    if(matches){
      jingle = matches[1];
      date = input.substr(input.indexOf(matches[1]) + matches[1].length);
    }

    if(!date || !jingle){
      bot.reply("Sorry, problem finding time and data from the given string.");
      return;
    }
    unirest.get("https://maciejgorny-reminderdrop-v1.p.mashape.com/"+date+"/GMT-08%3A00")
      .header("X-Mashape-Key", "SyROkmdZWzmshEj69nByUrfin8Qrp10d4kRjsnNmqSmMFcxFdO")
      .header("Accept", "application/json")
      .end(function (result) {
        // console.log(result);
        var date = new Date(result.body.utcdate * 1000);
        var client = new pg.Client(DATABASE_URL);
        client.connect(function (err) {
          client.query('UPDATE jingle SET data=$1, date=$2 where id=1', [jingle, result.body.utcdate], function () {
            client.end(function (err) {
              if (err) throw err;
            });
          });
        });
        if(event) event.cancel();
        event = schedule.scheduleJob(date, function(){
          robot.messageRoom('#general', "@everyone  "+decodeURIComponent(jingle));
        });
        bot.reply("Cheer set!");
      });
  });

  robot.respond(/(cheer) test/i, function(bot){
    var client = new pg.Client(DATABASE_URL);
    client.connect(function (err) {
      client.query('SELECT * FROM jingle where id=1', function (err, result) {
        var obj = result.rows[0];
        jingle = obj.data;
        client.end(function (err) {
          if (err) throw err;
        });
        bot.reply(jingle);
      });
    });
  });
};
