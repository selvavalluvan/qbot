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
//   qword set <word> - sets the word of the week
//   qword - returns the current word of the week

var cron = require('node-cron');
var word = null;
var responsible = null;

module.exports = function(robot) {
  robot.respond(/(qword|word) set/i, function(bot){
    var keyword = "set ";
    word = bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length);
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
            "text": word
          }
        ]
      };
      bot.reply(reply_with_attachments);
    }
  });

  cron.schedule('30 9 * * Monday', function(){
    robot.messageRoom('#waste-channel', "@"+responsible+": Its time to update the word of the week")
  });
};
