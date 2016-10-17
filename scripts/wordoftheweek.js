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
// var json = require('json-update');
var word = null;
var meaning = null;
var responsible = null;
// var wordFile = 'word.json';

module.exports = function(robot) {
  // json.load(wordFile, function(err, obj) {
  //   word = obj.word;
  //   meaning = obj.meaning;
  //   responsible = obj.responsible;
  // });

  robot.respond(/(qword|word) set/i, function(bot){
    var keyword = "set";
    var wordplusmeaning = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).trim().split(/\s*:\s*/);
    if(wordplusmeaning.length !== 2){
      bot.reply("Sorry, I can't understand what you said. Please check `help`");
    } else {
      word = wordplusmeaning[0];
      meaning = wordplusmeaning[1];
      // json.update(wordFile, {word: word, meaning:meaning});
      bot.reply("Word set!");
    }
  });

  robot.respond(/(qword|word) person/i, function(bot){
    var keyword = "person";
    responsible = bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length).trim();
    if(responsible.length === 0){
      bot.reply("Sorry, I can't understand what you said. Please check `help`");
    } else {
      // json.update(wordFile, {responsible: responsible});
      bot.reply("Responsible person set!");
    }
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
