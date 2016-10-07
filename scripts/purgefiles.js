// Description:
//   Purge all your files from Slack. Only the files you own.
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   (purge|delete|clear) files - delete all the files. Example: delete files

var purge = require('../slack-files');

module.exports = function(robot) {
  robot.respond(/(purge|delete|clear) files/i, function(bot){
    var user = bot.message.user;
    purge.purgeFiles(user, function (err, res) {
      if (err) bot.reply("Something went wrong!");
      else bot.reply("All of your files are cleared!");
    });
  });
};
