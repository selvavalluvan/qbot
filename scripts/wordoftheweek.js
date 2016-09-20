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
//   qword set <word>:<meaning> - sets the word of the week
//   qword - returns the current word of the week

var cron = require('node-cron');
var word = null;
var meaning = null;
var responsible = null;

module.exports = function(robot) {
  robot.respond(/(qword|word) set/i, function(bot){
    var keyword = "set ";
    var wordplusmeaning = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).split(":");
    word = wordplusmeaning[0];
    meaning = wordplusmeaning[1];
    bot.reply("Word set!");
  });

  robot.respond(/(qword|word) person/i, function(bot){
    var keyword = "person ";
    responsible = bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length);
    bot.reply("Responsible person set!");
  });

  robot.respond(/(qword|word)(?: of the week)?$/i, function(bot){
    if(!word){
      bot.reply("Sorry, couldn't find the word of the week.");
    } else {
      var reply_with_attachments = {
        'text': 'Word of the week',
        'attachments': [
          {
            "fallback": word,
            "color": "#A16EFF",
            "pretext": word,
            "text": meaning
          }
        ]
      };
      bot.reply(reply_with_attachments);
    }
  });

  robot.respond(/(qword|word) remind/i, function(bot){
    var notify;
    if(!responsible){
      notify = ""
    } else {
      notify = "@"+responsible+": "
    }
    robot.messageRoom('#qbot-channel', notify+"Its time to update *Word of the week*");
    bot.reply("Notified "+notify);
  });

  cron.schedule('30 9 * * Monday', function(){
    var notify;
    if(!responsible){
      notify = ""
    } else {
      notify = "@"+responsible+": "
    }
    robot.messageRoom('#qbot-channel', notify+"Its time to update *Word of the week*")
  });
};
