// Description:
//   Quietly's raffle
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   random {range} - returns a random number. The range is optional. Example: random  or  random 1-100
//   raffle <choices> - picks an item from the choices. The choices are comma separated. Example: raffle J spades, K hearts, 10 hearts, A diamonds, 4 clubs
//   shuffle <choices> - shuffle the items in the choices. The choices are comma separated. Example: shuffle J spades, K hearts, 10 hearts, A diamonds, 4 clubs

var qrandom = require("randy");

module.exports = function(robot) {

  robot.respond(/random/i, function(bot){
    var keyword = "random";
    var min = 1;
    var max = 1000;
    var number = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).trim().split(" ");
    if(number[0].length !== 0){
      var num = number[0].split('-');
      if(num.length === 1){
        max = parseInt(num[0]);
      } else {
        min = parseInt(num[0]);
        max = parseInt(num[1]);
      }
    }
    bot.reply(qrandom.randInt(min, max).toString());
  });

  robot.respond(/raffle/i, function(bot){
    var keyword = "raffle";
    var choices = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).trim().split(/\s*,\s*/);
    if(choices.length > 1) {
      bot.reply(qrandom.choice(choices).toString());
    } else {
      bot.reply("Sorry, I can't understand what you said. Please check `help`");
    }
  });

  robot.respond(/shuffle/i, function(bot){
    var keyword = "shuffle";
    var choices = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).trim().split(/\s*,\s*/);
    if(choices.length > 1) {
      bot.reply(qrandom.shuffle(choices).toString());
    } else {
      bot.reply("Sorry, I can't understand what you said. Please check `help`");
    }
  });
};
